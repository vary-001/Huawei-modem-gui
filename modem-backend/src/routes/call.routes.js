const express = require("express");
const router = express.Router();
const controller = require("../controllers/call.controller");

router.get("/status", controller.status);
router.post("/dial", controller.dial);
router.post("/answer", controller.answer);
router.post("/hangup", controller.hangup);
router.post("/hangup-all", controller.hangupAll);

module.exports = router;
