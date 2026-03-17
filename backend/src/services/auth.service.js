const User = require('../models/user.model');
const PasswordResetOTP = require('../models/passwordReset.model');
const AppError = require('../utils/AppError');
const tokenService = require('./token.service');
const emailService = require('./email.service');
const otpUtils = require('../utils/otp.utils');
const jwt = require('jsonwebtoken');
const { sendResetOTPEmail } = require('./email.service');

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

const generateResetOTP = async (email) => {
    const user = await User.findOne({ email });
    if (!user) {
        throw new AppError('No user found with that email address', 404);
    }

    // Delete any existing OTP for this user
    await PasswordResetOTP.deleteMany({ userId: user._id });

    const otp = otpUtils.generateOTP();
    const otpHash = await otpUtils.hashOTP(otp);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    await PasswordResetOTP.create({
        userId: user._id,
        otpHash,
        expiresAt,
    });

    try {
   await sendResetOTPEmail(user.email, otp);
} catch (error) {
   console.error("EMAIL ERROR:", error);
   throw new Error("There was an error sending the email. Try again later.");
}
};

const verifyResetOTP = async (email, otp) => {
    const user = await User.findOne({ email });
    if (!user) {
        throw new AppError('No user found with that email address', 404);
    }

    const otpRecord = await PasswordResetOTP.findOne({ userId: user._id });
    if (!otpRecord) {
        throw new AppError('OTP not found or expired', 400);
    }

    if (otpRecord.attempts >= 3) {
        await PasswordResetOTP.deleteOne({ _id: otpRecord._id });
        throw new AppError('Too many failed attempts. Please request a new OTP.', 400);
    }

    const isValid = await otpUtils.verifyOTP(otp, otpRecord.otpHash);
    if (!isValid) {
        otpRecord.attempts += 1;
        await otpRecord.save();
        throw new AppError('Invalid OTP', 400);
    }

    return true;
};

const resetPassword = async (email, otp, newPassword) => {
    // Verify OTP again to be sure (stateless check would be better but this works for this flow)
    await verifyResetOTP(email, otp);

    const user = await User.findOne({ email });
    user.password = newPassword;
    await user.save();

    // Clean up OTP
    await PasswordResetOTP.deleteMany({ userId: user._id });

    // Note: if you want to invalidate all tokens, you'd handle that in token service
};

module.exports = {
    register,
    loginUserWithEmailAndPassword,
    refreshAuth,
    generateResetOTP,
    verifyResetOTP,
    resetPassword,
};
