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
    throw new Error("No modem found in mmcli -L output");
  }
  return match[1];
}

function normalizeSmsPath(line) {
  if (!line) return null;
  const match = line.trim().match(/^(\/org\/freedesktop\/ModemManager1\/SMS\/\d+)/);
  return match ? match[1] : null;
}

async function getSmsIds(modemIndex) {
  const output = await runCommand(`mmcli -m ${modemIndex} --messaging-list-sms`);
  return output
    .split("\n")
    .map(normalizeSmsPath)
    .filter(Boolean);
}

function parseMmcliSmsDetails(stdout, id) {
  const result = {
    id,
    number: null,
    text: null,
    timestamp: null,
    state: null,
    raw: stdout,
  };

  const lines = stdout.split("\n");
  for (let line of lines) {
    line = line.trim();
    if (!line) continue;

    if (line.includes("|")) {
      line = line.split("|").pop().trim();
    }

    if (!line.includes(":")) continue;
    const [key, ...rest] = line.split(":");
    const value = rest.join(":").trim();

    if (/^number$/i.test(key)) {
      result.number = value || result.number;
    } else if (/^text$/i.test(key)) {
      result.text = result.text ? `${result.text}\n${value}` : value;
    } else if (/^timestamp$/i.test(key)) {
      result.timestamp = value || result.timestamp;
    } else if (/^state$/i.test(key)) {
      result.state = value || result.state;
    }
  }

  return result;
}

function escapeMmcliValue(value) {
  return String(value)
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/'/g, "\\'");
}

async function getSmsDetails(id) {
  const output = await runCommand(`mmcli -s "${id}"`);
  return parseMmcliSmsDetails(output, id);
}

exports.sendSMS = async (number, message, io) => {
  if (!number || !message) {
    throw new Error("Recipient number and message text are required");
  }

  const modemIndex = await getModemIndex();
  const escapedNumber = escapeMmcliValue(number);
  const escapedMessage = escapeMmcliValue(message);

  io.emit("sms-status", "Creating SMS...");

  const createCmd = `mmcli -m ${modemIndex} --messaging-create-sms="text='${escapedMessage}',number='${escapedNumber}'"`;
  const createOutput = await runCommand(createCmd);

  io.emit("sms-status", "SMS created, sending...");

  const match = createOutput.match(/SMS\/\d+/);
  if (!match) {
    const err = new Error("SMS creation failed: could not parse SMS ID");
    io.emit("sms-error", err.message);
    throw err;
  }

  const smsId = match[0];
  const sendOutput = await runCommand(`mmcli -s "${smsId}" --send`);

  io.emit("sms-sent", {
    number,
    message,
    status: "sent",
    smsId,
  });

  return {
    smsId,
    output: sendOutput,
  };
};

exports.listSMS = async () => {
  const modemIndex = await getModemIndex();
  const ids = await getSmsIds(modemIndex);
  if (ids.length === 0) return [];

  const messages = await Promise.all(ids.map(getSmsDetails));
  return messages;
};

// 📡 REAL-TIME SMS BROADCAST (Socket.IO)
exports.broadcastSMSList = async (io) => {
  setInterval(async () => {
    try {
      const messages = await exports.listSMS();
      io.emit("sms-inbox", messages);
    } catch (err) {
      console.error("SMS broadcast error:", err?.message || err);
    }
  }, 5000); // refresh every 5 seconds
};