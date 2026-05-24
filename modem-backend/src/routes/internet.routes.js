const express = require("express");
const router = express.Router();
const controller = require("../controllers/internet.controller");

router.get("/status", controller.status);

module.exports = router;