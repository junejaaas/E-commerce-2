const express = require("express");
const router = express.Router();

const returnController = require("../controllers/return.controller");
const { protect } = require("../middlewares/auth.middleware");

router.use(protect);

router.post("/", returnController.createReturn);

router.get("/", returnController.getUserReturns);

router.get("/:id/status", returnController.getRefundStatus);

router.patch("/:id/cancel", returnController.cancelReturn);  // ✅ added

module.exports = router;