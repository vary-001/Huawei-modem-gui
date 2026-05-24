const { SerialPort } = require("serialport");

const PORT_PATH = process.env.SERIAL_PORT_PATH || process.env.PORT_PATH || "/dev/ttyUSB2";

function sendAT(port, cmd) {
  return new Promise((resolve, reject) => {
    let data = "";

    const onError = (err) => {
      port.off("data", onData);
      port.off("error", onError);
      reject(err);
    };

    const onData = (chunk) => {
      data += chunk.toString();
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
      }, 1000);
    });
  });
}

async function openPort() {
  const port = new SerialPort({
    path: PORT_PATH,
    baudRate: 115200,
    autoOpen: false,
  });

  await new Promise((resolve, reject) => {
    port.open((err) => {
      if (err) {
        return reject(new Error(`Unable to open serial port ${PORT_PATH}: ${err.message}. Check permissions or set SERIAL_PORT_PATH.`));
      }
      resolve();
    });
  });

  return port;
}

async function listSMS() {
  const port = await openPort();

  try {
    await new Promise((res) => setTimeout(res, 1000));
    await sendAT(port, "AT+CMGF=1");
    const response = await sendAT(port, 'AT+CMGL="ALL"');
    return parseSMS(response);
  } finally {
    port.close();
  }
}

function parseSMS(data) {
  const messages = [];

  const blocks = data.split("+CMGL:");

  blocks.forEach((b) => {
    const lines = b.split("\n");

    if (lines.length < 2) return;

    messages.push({
      index: lines[0]?.trim(),
      meta: lines[1]?.trim(),
      text: lines.slice(2).join(" ").trim(),
    });
  });

  return messages;
}

module.exports = { listSMS };