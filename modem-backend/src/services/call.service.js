const { exec } = require("child_process");

const MODEM_INDEX = process.env.MM_MODEM_INDEX || process.env.MODEM_INDEX;

function runCommand(cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, (err, stdout, stderr) => {
      if (err) {
        return reject(new Error(stderr?.toString().trim() || err.message));
      }
      resolve(stdout?.toString() || "");
    });
  });
}

async function getModemIndex() {
  if (MODEM_INDEX) return MODEM_INDEX;

  const output = await runCommand("mmcli -L");
  const match = output.match(/Modem\/(\d+)/);
  if (!match) {
    // Try JSON output as alternative and be forgiving when parsing
    try {
      const jsonOut = await runCommand("mmcli -L -J");
      const j = JSON.parse(jsonOut || "{}");
      const jsonStr = JSON.stringify(j);
      const m2 = jsonStr.match(/Modem\/(\d+)/);
      if (m2) return m2[1];
    } catch (e) {
      // ignore JSON parse errors
    }

    throw new Error("No modem found in mmcli -L output");
  }
  return match[1];
}

function escapeMmcliValue(value) {
  return String(value).replace(/\\/g, "\\\\").replace(/"/g, "\\\"").replace(/'/g, "\\'");
}

async function parseJsonOutput(output) {
  try {
    return JSON.parse(output);
  } catch (err) {
    throw new Error("Failed to parse mmcli JSON output: " + err.message);
  }
}

function parseVoiceListOutput(output) {
  if (!output || !output.trim()) return [];
  
  return output
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      // Handle both formats: /path dir (state) and other variations
      const match = line.match(/^(\S+)\s+(\S+)\s+\(([^)]+)\)$/);
      if (!match) {
        // Try alternative parsing for malformed output
        const parts = line.split(/\s+/);
        if (parts.length >= 3 && parts[0].includes('/')) {
          return {
            path: parts[0],
            direction: parts[1] || 'unknown',
            state: line.match(/\(([^)]+)\)/)?.[1] || 'unknown',
          };
        }
        return null;
      }
      return {
        path: match[1],
        direction: match[2],
        state: match[3],
      };
    })
    .filter(Boolean);
}

async function listRawCalls() {
  const modemIndex = await getModemIndex();
  const output = await runCommand(`mmcli -m ${modemIndex} --voice-list-calls`);
  return parseVoiceListOutput(output);
}

async function buildCallList() {
  const rawCalls = await listRawCalls();
  if (!Array.isArray(rawCalls) || rawCalls.length === 0) {
    return [];
  }

  return rawCalls;
}

function findIncomingCall(calls) {
  return calls.find((call) => {
    if (!call || !call.state) return false;
    const state = String(call.state).toLowerCase();
    return state.includes("incoming") || state.includes("waiting") || state.includes("ringing");
  });
}

function findActiveCall(calls) {
  return calls.find((call) => {
    if (!call || !call.state) return false;
    const state = String(call.state).toLowerCase();
    return state.includes("active") || state.includes("dialing") || state.includes("alerting");
  });
}

async function getCallDetails(callPath) {
  try {
    // Note: mmcli doesn't support -J on call paths directly
    // Call details are obtained through voice-list-calls or voice-status
    // For now, we'll return a basic object - detailed info comes from list output
    const output = await runCommand(`mmcli ${callPath}`).catch(() => null);
    if (!output) return null;
    
    // Parse text output for call state
    const stateMatch = output.match(/state\s*:\s*(\S+)/i);
    return {
      path: callPath,
      state: stateMatch ? stateMatch[1] : 'unknown',
      details: output
    };
  } catch (err) {
    // Silently fail for call details - they're optional
    return null;
  }
}

exports.getCallStatus = async () => {
  try {
    const modemIndex = await getModemIndex();
    
    // Parallel requests for better performance
    const [callJson, voiceStatusJson] = await Promise.all([
      runCommand(`mmcli -m ${modemIndex} --voice-list-calls -J`).catch(() => "{}"),
      runCommand(`mmcli -m ${modemIndex} --voice-status -J`).catch(() => "{}"),
    ]);

    const calls = await buildCallList();
    
    let voiceData = {};
    try {
      voiceData = await parseJsonOutput(voiceStatusJson);
    } catch (e) {
      console.warn("[getCallStatus] Could not parse voice status JSON:", e.message);
    }

    const incoming = findIncomingCall(calls);
    const active = findActiveCall(calls);

    // Enrich response with additional details
    const enrichedCalls = await Promise.all(
      calls.map(async (call) => {
        const details = await getCallDetails(call.path).catch(() => null);
        return { ...call, details };
      })
    );

    return {
      modemIndex,
      voice: voiceData?.modem?.voice || {},
      calls: enrichedCalls,
      incoming: incoming || null,
      active: active || null,
      timestamp: new Date().toISOString(),
    };
  } catch (err) {
    if (String(err.message).toLowerCase().includes("no modem found")) {
      return { 
        modemIndex: null, 
        voice: {}, 
        calls: [], 
        incoming: null, 
        active: null,
        timestamp: new Date().toISOString(),
        error: "No modem found"
      };
    }
    throw err;
  }
};

exports.dialCall = async (number) => {
  console.log("[dialCall] START with number:", number);
  if (!number || !String(number).trim()) {
    throw new Error("A phone number is required to place a call.");
  }

  const cleanNumber = String(number).trim();
  // Allow phone numbers (digits with optional * or #) and USSD codes (*...#)
  if (!/^(\d+[*#]?|\*[\d*#]+\#)$/.test(cleanNumber)) {
    throw new Error("Invalid phone number format. Use digits, or USSD codes like *123#");
  }

  try {
    console.log("[dialCall] Getting modem index...");
    const modemIndex = await getModemIndex();
    console.log("[dialCall] Modem index:", modemIndex);

    const escapedNumber = escapeMmcliValue(cleanNumber);
    console.log("[dialCall] Escaped number:", escapedNumber);

    console.log("[dialCall] Running mmcli command...");
    const output = await runCommand(`mmcli -m ${modemIndex} --voice-create-call="number='${escapedNumber}'"`);
    console.log("[dialCall] mmcli output:", output);

    // mmcli returns plain text like "Successfully created new call: /path/to/call"
    const match = output.match(/\/org\/freedesktop\/ModemManager1\/Call\/\d+/);
    if (match) {
      const callPath = match[0];
      console.log("[dialCall] SUCCESS - call created:", callPath);
      
      // Wait a bit and get call details
      await new Promise(resolve => setTimeout(resolve, 500));
      const details = await getCallDetails(callPath);
      
      return { 
        success: true, 
        path: callPath, 
        number: cleanNumber, 
        message: output.trim(),
        details: details || {}
      };
    }
    throw new Error("Failed to create call: " + output);
  } catch (err) {
    console.error("[dialCall] ERROR:", err.message);
    throw err;
  }
};

exports.answerCall = async () => {
  const calls = await buildCallList();
  const incoming = findIncomingCall(calls);
  if (!incoming) {
    throw new Error("No incoming call to answer.");
  }

  try {
    console.log("[answerCall] Answering call:", incoming.path);
    const output = await runCommand(`mmcli ${incoming.path} --accept`);
    console.log("[answerCall] Answer output:", output);
    
    // Wait for state change
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return { 
      success: true, 
      path: incoming.path, 
      message: output.trim(),
      number: incoming.number || "unknown"
    };
  } catch (err) {
    console.error("[answerCall] ERROR:", err.message);
    throw err;
  }
};

exports.hangupCall = async () => {
  const calls = await buildCallList();
  const active = findActiveCall(calls) || findIncomingCall(calls);
  if (!active) {
    throw new Error("No active or incoming call to hang up.");
  }

  try {
    console.log("[hangupCall] Hanging up call:", active.path);
    const output = await runCommand(`mmcli ${active.path} --hangup`);
    console.log("[hangupCall] Hangup output:", output);
    
    return { 
      success: true, 
      path: active.path, 
      message: output.trim(),
      state: active.state
    };
  } catch (err) {
    console.error("[hangupCall] ERROR:", err.message);
    throw err;
  }
};

exports.hangupAll = async () => {
  try {
    const modemIndex = await getModemIndex();
    console.log("[hangupAll] Hanging up all calls for modem:", modemIndex);
    const output = await runCommand(`mmcli -m ${modemIndex} --voice-hangup-all`);
    console.log("[hangupAll] Hangup all output:", output);
    
    // Wait for state change
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return { 
      success: true, 
      modemIndex, 
      message: output.trim(),
      timestamp: new Date().toISOString()
    };
  } catch (err) {
    console.error("[hangupAll] ERROR:", err.message);
    throw err;
  }
};

exports.watchCalls = (io) => {
  let lastNoModemLog = 0;
  let lastStatus = null;
  
  const interval = setInterval(async () => {
    try {
      const status = await exports.getCallStatus();
      
      // Only emit if status changed to reduce network traffic
      const statusStr = JSON.stringify(status);
      const lastStatusStr = JSON.stringify(lastStatus);
      
      if (statusStr !== lastStatusStr) {
        io.emit("call-update", status);
        lastStatus = status;
      }
      
      if (status && status.modemIndex) lastNoModemLog = 0;
    } catch (err) {
      const msg = err?.message || String(err);
      if (String(msg).toLowerCase().includes("no modem found")) {
        const now = Date.now();
        if (now - lastNoModemLog > 30000) {
          console.error("Call watch error:", msg);
          const noModemStatus = { 
            modemIndex: null, 
            voice: {}, 
            calls: [], 
            incoming: null, 
            active: null,
            timestamp: new Date().toISOString(),
            error: "No modem found"
          };
          io.emit("call-update", noModemStatus);
          lastNoModemLog = now;
        }
      } else {
        console.error("Call watch error:", msg);
      }
    }
  }, 3000);

  return () => clearInterval(interval);
};

// Additional utility functions for better call management
exports.getCallInfo = async (callPath) => {
  try {
    return await getCallDetails(callPath);
  } catch (err) {
    console.error("[getCallInfo] Error:", err.message);
    throw err;
  }
};

exports.listAllCalls = async () => {
  try {
    const calls = await buildCallList();
    const enrichedCalls = await Promise.all(
      calls.map(async (call) => {
        const details = await getCallDetails(call.path).catch(() => null);
        return { ...call, details };
      })
    );
    return enrichedCalls;
  } catch (err) {
    console.error("[listAllCalls] Error:", err.message);
    throw err;
  }
};

exports.getModemInfo = async () => {
  try {
    const modemIndex = await getModemIndex();
    const output = await runCommand(`mmcli -m ${modemIndex} -J`);
    return await parseJsonOutput(output);
  } catch (err) {
    console.error("[getModemInfo] Error:", err.message);
    throw err;
  }
};
