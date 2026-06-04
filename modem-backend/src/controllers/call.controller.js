const callService = require("../services/call.service");

exports.status = async (req, res) => {
  try {
    const status = await callService.getCallStatus();
    res.json({ success: true, status });
  } catch (err) {
    console.error("[call.controller] status error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.dial = async (req, res) => {
  try {
    const { number } = req.body;
    if (!number) {
      return res.status(400).json({ success: false, error: "Phone number is required" });
    }
    const result = await callService.dialCall(number);
    res.json({ success: true, result });
  } catch (err) {
    console.error("[call.controller] dial error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.answer = async (req, res) => {
  try {
    const result = await callService.answerCall();
    res.json({ success: true, result });
  } catch (err) {
    console.error("[call.controller] answer error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.hangup = async (req, res) => {
  try {
    const result = await callService.hangupCall();
    res.json({ success: true, result });
  } catch (err) {
    console.error("[call.controller] hangup error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.hangupAll = async (req, res) => {
  try {
    const result = await callService.hangupAll();
    res.json({ success: true, result });
  } catch (err) {
    console.error("[call.controller] hangupAll error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.list = async (req, res) => {
  try {
    const calls = await callService.listAllCalls();
    res.json({ success: true, calls });
  } catch (err) {
    console.error("[call.controller] list error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.info = async (req, res) => {
  try {
    const modemInfo = await callService.getModemInfo();
    res.json({ success: true, modemInfo });
  } catch (err) {
    console.error("[call.controller] info error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};
