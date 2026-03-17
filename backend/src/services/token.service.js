const jwt = require('jsonwebtoken');
// const moment = require('moment'); // Unused
const User = require('../models/user.model');

// Using native Date for now to avoid adding dependency if not needed, 
// but moment is better for 'expires' calculation logic if complex.
// Let's stick to simple Date manipulation.

const generateToken = (userId, expires, type, secret = process.env.JWT_SECRET) => {
    const payload = {
        sub: userId,
        iat: Math.floor(Date.now() / 1000),
        exp: expires,
        type,
    };
    return jwt.sign(payload, secret);
};

const saveToken = async (token, userId, expires, type, blacklisted = false) => {
    // In a real app we might save tokens to a Token model for whitelist/blacklist
    // For this MERN stack, we might just store refreshToken in User or a separate collection
    // The User model has 'refreshToken' field.
    const user = await User.findById(userId);
    if (user) {
        if (type === 'refresh') {
            user.refreshToken = token;
            await user.save();
        }
    }
    return token;
};

const verifyToken = async (token, type) => {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    // Verify logic
    return payload;
};

const generateAuthTokens = async (user) => {
    const accessTokenExpires = Math.floor(Date.now() / 1000) + 60 * 60; // 15 mins
    const accessToken = generateToken(user._id, accessTokenExpires, 'access');

    const refreshTokenExpires = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60; // 7 days
    const refreshToken = generateToken(user._id, refreshTokenExpires, 'refresh');

    await saveToken(refreshToken, user._id, refreshTokenExpires, 'refresh');

    return {
        access: {
            token: accessToken,
            expires: new Date(accessTokenExpires * 1000),
        },
        refresh: {
            token: refreshToken,
            expires: new Date(refreshTokenExpires * 1000),
        },
    };
};

module.exports = {
    generateToken,
    saveToken,
    verifyToken,
    generateAuthTokens,
};
