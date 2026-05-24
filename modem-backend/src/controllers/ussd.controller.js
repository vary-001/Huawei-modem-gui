const ussdService = require("../services/ussd.service");

exports.send = async (req, res) => {
  try {
    const io = req.app.get("io");
    const { code } = req.body;

    const result = await ussdService.sendUSSD(code, io);

    res.json({
      success: true,
      result,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};