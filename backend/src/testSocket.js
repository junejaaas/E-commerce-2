const { io } = require("socket.io-client");

const socket = io("http://localhost:5000");

socket.on("connect", () => {

    console.log("Connected with id:", socket.id);

    const trackingId = "TRK3NAEBQCP";   

    socket.emit("trackShipment", trackingId);

    console.log("Listening for shipment updates...");

});

socket.on("shipmentUpdate", (data) => {
    console.log("REAL TIME UPDATE:", data);
});