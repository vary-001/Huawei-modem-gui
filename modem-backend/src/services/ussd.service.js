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

exports.sendUSSD = async (code, io) => {
  const modemIndex = await getModemIndex();
  return new Promise((resolve, reject) => {

    // 1. always try to cancel previous session first
    exec(`mmcli -m ${modemIndex} --3gpp-ussd-cancel`, () => {

      io.emit("ussd-status", "Preparing USSD session...");

      // 2. small delay to let modem reset state
      setTimeout(() => {

        exec(`mmcli -m ${modemIndex} --3gpp-ussd-initiate="${code}"`, (err, stdout) => {
          if (err) {
            io.emit("ussd-error", err.message);
            return reject(err);
          }

          io.emit("ussd-response", {
            code,
            response: stdout,
          });

          resolve(stdout);
        });

      }, 800); // important delay

    });

  });
};
exports.releaseUSSD = async (io) => {
  const modemIndex = await getModemIndex();
  return new Promise((resolve) => {
    exec(`mmcli -m ${modemIndex} --3gpp-ussd-cancel`, (err, stdout) => {
      if (!err) {
        io.emit("ussd-status", "USSD session released");
      }
      resolve(stdout || "released");
    });
  });
};