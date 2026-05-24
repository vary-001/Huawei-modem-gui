const express = require("express");
const router = express.Router();
const controller = require("../controllers/ussd.controller");

router.post("/send", controller.send);

module.exports = router;