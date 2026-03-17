const Shipment = require("../models/shipment.model");


// Create Shipment (when order is placed)
exports.createShipment = async (req, res, next) => {

    try {

        const { orderId } = req.body;

        // Generate tracking ID
        const trackingId =
            "TRK" + Math.random().toString(36).substring(2, 10).toUpperCase();

        // Estimated delivery (5 days)
        const estimatedDelivery = new Date();
        estimatedDelivery.setDate(estimatedDelivery.getDate() + 5);

        const shipment = await Shipment.create({
            orderId,
            trackingId,
            estimatedDelivery
        });

        res.status(201).json({
            status: "success",
            data: shipment
        });

    } catch (error) {
        next(error);
    }

};



// Customer tracking shipment
exports.trackShipment = async (req, res, next) => {

    try {

        const { trackingId } = req.params;

        const shipment = await Shipment.findOne({ trackingId });

        if (!shipment) {
            return res.status(404).json({
                message: "Shipment not found"
            });
        }

        res.status(200).json({
            status: "success",
            data: shipment
        });

    } catch (error) {
        next(error);
    }

};



// Update shipment status (REAL TIME)
exports.updateShipmentStatus = async (req, res, next) => {

    try {

        const { status } = req.body;

        const shipment = await Shipment.findById(req.params.id);

        if (!shipment) {
            return res.status(404).json({
                message: "Shipment not found"
            });
        }

        shipment.status = status;

        if (status === "Delivered") {
            shipment.deliveredAt = new Date();
        }

        await shipment.save();

        // 🔥 REAL TIME SOCKET EVENT
        const io = req.app.get("io");

        io.to(shipment.trackingId).emit("shipmentUpdate", {
            trackingId: shipment.trackingId,
            status: shipment.status,
            estimatedDelivery: shipment.estimatedDelivery,
            deliveredAt: shipment.deliveredAt
        });

        res.status(200).json({
            status: "success",
            data: shipment
        });

    } catch (error) {
        next(error);
    }

};