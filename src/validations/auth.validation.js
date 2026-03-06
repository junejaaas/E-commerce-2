const Joi = require('joi');

const register = {
    body: Joi.object().keys({
        email: Joi.string().required().email(),
        password: Joi.string().required().min(8),
        confirmPassword: Joi.string().valid(Joi.ref('password')),
        name: Joi.string().required(),
        role: Joi.string().valid('user', 'seller'), // Admin creation usually restricted
        phoneNumber: Joi.string(),
    }),
};

const login = {
    body: Joi.object().keys({
        email: Joi.string().required().email(),
        password: Joi.string().required(),
    }),
};

const refreshTokens = {
    body: Joi.object().keys({
        refreshToken: Joi.string().required(),
    }),
};

const forgotPassword = {
    body: Joi.object().keys({
        email: Joi.string().required().email(),
    }),
};

const verifyResetOTP = {
    body: Joi.object().keys({
        email: Joi.string().required().email(),
        otp: Joi.string().required().length(6).pattern(/^\d+$/),
    }),
};

const resetPassword = {
    body: Joi.object().keys({
        email: Joi.string().required().email(),
        otp: Joi.string().required().length(6).pattern(/^\d+$/),
        newPassword: Joi.string().required().min(8),
    }),
};

module.exports = {
    register,
    login,
    refreshTokens,
    forgotPassword,
    verifyResetOTP,
    resetPassword,
};
