const mongoose = require('mongoose');

const passwordResetOTPSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    otpHash: {
        type: String,
        required: true,
    },
    expiresAt: {
        type: Date,
        required: true,
        index: { expires: 0 }, // TTL index using the value of expiresAt
    },
    attempts: {
        type: Number,
        default: 0,
    },
}, {
    timestamps: true,
});

const PasswordResetOTP = mongoose.model('PasswordResetOTP', passwordResetOTPSchema);

module.exports = PasswordResetOTP;
