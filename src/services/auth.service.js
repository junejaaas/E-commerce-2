const User = require('../models/user.model');
const AppError = require('../utils/AppError');
const tokenService = require('./token.service');
const jwt = require('jsonwebtoken');

const register = async (userBody) => {
    if (await User.findOne({ email: userBody.email })) {
        throw new AppError('Email already taken', 400);
    }
    if (userBody.phoneNumber && await User.findOne({ phoneNumber: userBody.phoneNumber })) {
        throw new AppError('Phone number already taken', 400);
    }

    const user = await User.create(userBody);
    return user;
};

const loginUserWithEmailAndPassword = async (email, password) => {
    const user = await User.findOne({ email }).select('+password +isActive');
    if (!user || !(await user.correctPassword(password, user.password))) {
        throw new AppError('Incorrect email or password', 401);
    }
    if (user.isActive === false) {
        throw new AppError('Your account has been deactivated.', 403);
    }
    return user;
};

const refreshAuth = async (refreshToken) => {
    try {
        const payload = jwt.verify(refreshToken, process.env.JWT_SECRET);
        const user = await User.findById(payload.sub).select('+refreshToken');

        if (!user) {
            throw new AppError('User not found', 404);
        }

        if (String(user.refreshToken) !== String(refreshToken)) {
            throw new AppError('Invalid refresh token', 401);
        }

        return tokenService.generateAuthTokens(user);
    } catch (error) {
        throw new AppError('Please authenticate', 401);
    }
};

module.exports = {
    register,
    loginUserWithEmailAndPassword,
    refreshAuth,
};
