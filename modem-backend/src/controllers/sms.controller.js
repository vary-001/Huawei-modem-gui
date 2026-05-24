const smsService = require("../services/sms.service");


exports.send = async (req, res) => {
  try {
    const io = req.app.get("io"); // IMPORTANT
    const { number, message } = req.body;

    const result = await smsService.sendSMS(number, message, io);

    res.json({
      success: true,
      result
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};





exports.list = async (req, res) => {
  try {
    const messages = await smsService.listSMS();

    res.json({
      success: true,
      count: messages.length,
      messages,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};