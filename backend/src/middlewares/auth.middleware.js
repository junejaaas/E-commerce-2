const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const User = require('../models/user.model');

const protect = catchAsync(async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return next(new AppError('You are not logged in! Please log in to get access.', 401));
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const currentUser = await User.findById(decoded.sub).select('+isActive');
        if (!currentUser) {
            return next(new AppError('The user belonging to this token no longer exists.', 401));
        }

        if (currentUser.isBlocked) {
            return next(new AppError('Your account has been blocked. Please contact support.', 403));
        }

        // Force password reset for delivery agents
        if (
            currentUser.role === 'delivery' && 
            currentUser.mustResetPassword &&
            !req.originalUrl.includes('/reset-password') &&
            !req.originalUrl.includes('/auth/logout') &&
            !req.originalUrl.includes('/users/me')
        ) {
            return next(new AppError('You must reset your password before accessing the system.', 403));
        }

        if (currentUser.changedPasswordAfter(decoded.iat)) {
            return next(new AppError('User recently changed password! Please log in again.', 401));
        }

        req.user = currentUser;
        next();
    } catch (error) {
        return next(new AppError('Invalid token', 401));
    }
});

const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new AppError('You do not have permission to perform this action', 403));
        }
        next();
    };
};

module.exports = {
    protect,
    authorize,
};
