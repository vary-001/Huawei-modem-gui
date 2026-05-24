const express = require("express");
const router = express.Router();
const controller = require("../controllers/sms.controller");

router.post("/send", controller.send);
router.get("/list", controller.list);


module.exports = router;