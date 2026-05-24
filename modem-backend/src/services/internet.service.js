const { exec } = require("child_process");

exports.watchModem = (io) => {
  setInterval(() => {
    exec(`mmcli -m 0`, (err, stdout) => {
      if (!err) {
        io.emit("modem-status", stdout);
      }
    });
  }, 3000); // every 3 sec
};