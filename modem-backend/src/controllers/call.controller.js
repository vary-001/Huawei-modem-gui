const callService = require("../services/call.service");

exports.status = async (req, res) => {
  try {
    const status = await callService.getCallStatus();
    res.json({ success: true, status });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.dial = async (req, res) => {
  try {
    const { number } = req.body;
    const result = await callService.dialCall(number);
    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.answer = async (req, res) => {
  try {
    const result = await callService.answerCall();
    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.hangup = async (req, res) => {
  try {
    const result = await callService.hangupCall();
    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.hangupAll = async (req, res) => {
  try {
    const result = await callService.hangupAll();
    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
