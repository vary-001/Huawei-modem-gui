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
  return output
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const match = line.match(/^(\S+)\s+(\S+)\s+\(([^)]+)\)$/);
      if (!match) return null;
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

exports.getCallStatus = async () => {
  try {
    const modemIndex = await getModemIndex();
    const [callJson, voiceStatusJson] = await Promise.all([
      runCommand(`mmcli -m ${modemIndex} --voice-list-calls -J`),
      runCommand(`mmcli -m ${modemIndex} --voice-status -J`),
    ]);

    const calls = await buildCallList();
    const voiceData = await parseJsonOutput(voiceStatusJson);

    return {
      modemIndex,
      voice: voiceData.modem?.voice || {},
      calls,
      incoming: findIncomingCall(calls) || null,
      active: findActiveCall(calls) || null,
    };
  } catch (err) {
    if (String(err.message).toLowerCase().includes("no modem found")) {
      return { modemIndex: null, voice: {}, calls: [], incoming: null, active: null };
    }
    throw err;
  }
};

exports.dialCall = async (number) => {
  console.log("[dialCall] START with number:", number);
  if (!number || !String(number).trim()) {
    throw new Error("A phone number is required to place a call.");
  }

  try {
    console.log("[dialCall] Getting modem index...");
    const modemIndex = await getModemIndex();
    console.log("[dialCall] Modem index:", modemIndex);

    const escapedNumber = escapeMmcliValue(number);
    console.log("[dialCall] Escaped number:", escapedNumber);

    console.log("[dialCall] Running mmcli command...");
    const output = await runCommand(`mmcli -m ${modemIndex} --voice-create-call="number='${escapedNumber}'"`);
    console.log("[dialCall] mmcli output:", output);

    // mmcli returns plain text like "Successfully created new call: /path/to/call"
    const match = output.match(/\/org\/freedesktop\/ModemManager1\/Call\/\d+/);
    if (match) {
      console.log("[dialCall] SUCCESS - call created:", match[0]);
      return { success: true, path: match[0], number, message: output.trim() };
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

  const output = await runCommand(`mmcli ${incoming.path} --accept`);
  return { success: true, path: incoming.path, message: output.trim() };
};

exports.hangupCall = async () => {
  const calls = await buildCallList();
  const active = findActiveCall(calls) || findIncomingCall(calls);
  if (!active) {
    throw new Error("No active or incoming call to hang up.");
  }

  const output = await runCommand(`mmcli ${active.path} --hangup`);
  return { success: true, path: active.path, message: output.trim() };
};

exports.hangupAll = async () => {
  const modemIndex = await getModemIndex();
  const output = await runCommand(`mmcli -m ${modemIndex} --voice-hangup-all`);
  return { success: true, modemIndex, message: output.trim() };
};

exports.watchCalls = (io) => {
  let lastNoModemLog = 0;
  const interval = setInterval(async () => {
    try {
      const status = await exports.getCallStatus();
      io.emit("call-update", status);
      if (status && status.modemIndex) lastNoModemLog = 0;
    } catch (err) {
      const msg = err?.message || String(err);
      if (String(msg).toLowerCase().includes("no modem found")) {
        const now = Date.now();
        if (now - lastNoModemLog > 30000) {
          console.error("Call watch error:", msg);
          io.emit("call-update", { modemIndex: null, voice: {}, calls: [], incoming: null, active: null });
          lastNoModemLog = now;
        }
      } else {
        console.error("Call watch error:", msg);
      }
    }
  }, 3000);

  return () => clearInterval(interval);
};
