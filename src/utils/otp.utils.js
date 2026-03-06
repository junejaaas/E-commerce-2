const crypto = require('crypto');
const bcrypt = require('bcryptjs');

/**
 * Generate a random 6-digit numeric OTP
 * @returns {string}
 */
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Hash OTP using bcrypt
 * @param {string} otp 
 * @returns {Promise<string>}
 */
const hashOTP = async (otp) => {
    return await bcrypt.hash(otp, 12);
};

/**
 * Compare OTP with hashed OTP
 * @param {string} otp 
 * @param {string} hashedOTP 
 * @returns {Promise<boolean>}
 */
const verifyOTP = async (otp, hashedOTP) => {
    return await bcrypt.compare(otp, hashedOTP);
};

module.exports = {
    generateOTP,
    hashOTP,
    verifyOTP,
};
