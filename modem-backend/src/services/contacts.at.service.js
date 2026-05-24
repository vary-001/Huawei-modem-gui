const { SerialPort } = require("serialport");
const fs = require("fs");

const PORT_PATH = process.env.SERIAL_PORT_PATH || process.env.PORT_PATH;
const DEFAULT_PORT_PATHS = ["/dev/ttyUSB0", "/dev/ttyUSB1", "/dev/ttyUSB2"];

function sendAT(port, cmd) {
  return new Promise((resolve, reject) => {
    let data = "";
    const onData = (chunk) => {
      data += chunk.toString();
    };

    const onError = (err) => {
      port.off("data", onData);
      port.off("error", onError);
      reject(err);
    };

    port.on("data", onData);
    port.on("error", onError);

    port.write(cmd + "\r", (err) => {
      if (err) {
        port.off("data", onData);
        port.off("error", onError);
        return reject(err);
      }

      setTimeout(() => {
        port.off("data", onData);
        port.off("error", onError);
        resolve(data);
      }, 1200);
    });
  });
}

function parseContactLine(line) {
  const match = line.match(/^\+CPBR:\s*(\d+),"([^"]*)",(\d+),"([^"]*)"/);
  if (!match) return null;

  return {
    index: Number(match[1]),
    number: match[2] || null,
    type: Number(match[3]) || null,
    name: match[4] || null,
  };
}

function parseContacts(raw) {
  if (!raw) return [];

  return raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.startsWith("+CPBR:"))
    .map(parseContactLine)
    .filter(Boolean);
}

async function openPort() {
  const candidates = PORT_PATH ? [PORT_PATH] : DEFAULT_PORT_PATHS;
  let lastError;

  for (const path of candidates) {
    try {
      await new Promise((resolve, reject) => {
        fs.access(path, fs.constants.R_OK | fs.constants.W_OK, (err) => {
          if (err) {
            return reject(err);
          }
          resolve();
        });
      });

      const port = new SerialPort({
        path,
        baudRate: 115200,
        autoOpen: false,
      });

      await new Promise((resolve, reject) => {
        port.open((err) => {
          if (err) {
            return reject(err);
          }
          resolve();
        });
      });

      return port;
    } catch (err) {
      lastError = err;
      if (PORT_PATH) {
        throw new Error(`Unable to open serial port ${path}: ${err.message}. Check permissions or set SERIAL_PORT_PATH.`);
      }
    }
  }

  throw new Error(`Unable to open serial port. No available candidate paths. Last error: ${lastError?.message || "unknown"}. Check permissions or set SERIAL_PORT_PATH.`);
}

async function selectPhonebook(port) {
  // Try SIM storage first, fallback to ME
  const storages = ["SM", "ME"];
  for (const storage of storages) {
    const response = await sendAT(port, `AT+CPBS="${storage}"`);
    if (response.includes("OK")) {
      return storage;
    }
  }
  throw new Error("Unable to select SIM phonebook storage");
}

async function readAllContacts(port) {
  const response = await sendAT(port, "AT+CPBR=1,250");
  if (response.includes("ERROR")) {
    throw new Error("SIM phonebook read failed: " + response);
  }
  return parseContacts(response);
}

async function listContacts() {
  const port = await openPort();

  try {
    await sendAT(port, "AT");
    await sendAT(port, "AT+CMGF=1");
    await selectPhonebook(port);
    const contacts = await readAllContacts(port);
    return contacts;
  } finally {
    if (port) {
      try {
        if (port.isOpen) {
          await new Promise((resolve) => port.close(resolve));
        }
      } catch (e) {
        // ignore close errors
      }
    }
  }
}

module.exports = {
  listContacts,
};
