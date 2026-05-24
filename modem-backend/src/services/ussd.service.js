const { exec } = require("child_process");

exports.sendUSSD = async (code, io) => {
  return new Promise((resolve, reject) => {

    // 1. always try to cancel previous session first
    exec(`mmcli -m 0 --3gpp-ussd-cancel`, () => {

      io.emit("ussd-status", "Preparing USSD session...");

      // 2. small delay to let modem reset state
      setTimeout(() => {

        exec(`mmcli -m 0 --3gpp-ussd-initiate="${code}"`, (err, stdout) => {
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
exports.releaseUSSD = (io) => {
  return new Promise((resolve) => {
    exec(`mmcli -m 0 --3gpp-ussd-cancel`, (err, stdout) => {
      if (!err) {
        io.emit("ussd-status", "USSD session released");
      }
      resolve(stdout || "released");
    });
  });
};