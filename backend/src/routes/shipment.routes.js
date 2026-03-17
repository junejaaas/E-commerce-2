const express = require("express");

const router = express.Router();

const {
    createShipment,
    trackShipment,
    updateShipmentStatus
} = require("../controllers/shipment.controller");

router.post("/create", createShipment);

router.get("/track/:trackingId", trackShipment);

router.patch("/update/:id", updateShipmentStatus);

module.exports = router;