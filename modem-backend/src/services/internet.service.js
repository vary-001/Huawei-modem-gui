const { exec } = require("child_process");

function execCmd(cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, (err, stdout, stderr) => {
      if (err) return reject(new Error(stderr?.toString().trim() || err.message));
      resolve(stdout?.toString() || "");
    });
  });
}

exports.watchModem = (io) => {
  let lastNoModemLog = 0;
  setInterval(async () => {
    try {
      const listing = await execCmd("mmcli -L");
      const m = listing.match(/Modem\/(\d+)/);
      if (!m) {
        const now = Date.now();
        if (now - lastNoModemLog > 30000) {
          console.error("Internet watch: no modem found");
          lastNoModemLog = now;
          io.emit("modem-status", "no-modem");
        }
        return;
      }

      const idx = m[1];
      const status = await execCmd(`mmcli -m ${idx} --voice-status`);
      io.emit("modem-status", status);
    } catch (err) {
      const msg = err?.message || String(err);
      console.error("Internet watch error:", msg);
    }
  }, 3000); // every 3 sec
};