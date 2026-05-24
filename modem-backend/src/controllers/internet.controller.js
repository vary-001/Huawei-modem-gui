const internetService = require("../services/internet.service");

exports.status = async (req, res) => {
  try {
    const result = await internetService.status();
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ error: err.toString() });
  }
};