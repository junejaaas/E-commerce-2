const User = require('../models/user.model');
const Order = require('../models/order.model');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// GET /admin/customers — aggregated list of all customers
exports.getAllCustomers = catchAsync(async (req, res, next) => {
    const { search = '', page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const matchStage = { role: 'user' };
    if (search) {
        matchStage.$or = [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
            { phoneNumber: { $regex: search, $options: 'i' } },
        ];
    }

    const customers = await User.aggregate([
        { $match: matchStage },
        {
            $lookup: {
                from: 'orders',
                localField: '_id',
                foreignField: 'user',
                as: 'orders',
            },
        },
        {
            $addFields: {
                totalOrders: { $size: '$orders' },
                totalSpending: {
                    $sum: {
                        $map: {
                            input: {
                                $filter: {
                                    input: '$orders',
                                    as: 'o',
                                    cond: { $eq: ['$$o.paymentStatus', 'paid'] },
                                },
                            },
                            as: 'paid',
                            in: '$$paid.totalAmount',
                        },
                    },
                },
            },
        },
        {
            $project: {
                name: 1,
                email: 1,
                phoneNumber: 1,
                profilePicture: 1,
                isBlocked: 1,
                createdAt: 1,
                totalOrders: 1,
                totalSpending: 1,
            },
        },
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: Number(limit) },
    ]);

    const total = await User.countDocuments(matchStage);

    res.status(200).json({
        status: 'success',
        results: customers.length,
        total,
        totalPages: Math.ceil(total / Number(limit)),
        currentPage: Number(page),
        data: { customers },
    });
});

// GET /admin/customers/:id — single customer detail + orders
exports.getCustomerById = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.params.id).select(
        'name email phoneNumber profilePicture isBlocked createdAt gender dob'
    );
    if (!user) return next(new AppError('Customer not found', 404));

    const orders = await Order.find({ user: req.params.id })
        .sort({ createdAt: -1 })
        .select('orderStatus paymentStatus totalAmount items createdAt')
        .lean();

    const totalSpending = orders
        .filter((o) => o.paymentStatus === 'paid')
        .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    res.status(200).json({
        status: 'success',
        data: {
            customer: {
                ...user.toObject(),
                totalOrders: orders.length,
                totalSpending,
            },
            orders,
        },
    });
});

// PATCH /admin/customers/:id/status — block/unblock
exports.toggleBlockStatus = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.params.id);
    if (!user) return next(new AppError('Customer not found', 404));
    if (user.role === 'admin') {
        return next(new AppError('Cannot block an admin account', 400));
    }

    user.isBlocked = !user.isBlocked;
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
        status: 'success',
        message: `Customer has been ${user.isBlocked ? 'blocked' : 'unblocked'} successfully`,
        data: { isBlocked: user.isBlocked },
    });
});

// PATCH /admin/customers/:id/reset-password — admin resets password
exports.adminResetPassword = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.params.id);
    if (!user) return next(new AppError('Customer not found', 404));
    if (user.role === 'admin') {
        return next(new AppError('Cannot reset an admin password this way', 400));
    }

    // Generate a random temp password
    const tempPassword = crypto.randomBytes(6).toString('hex'); // 12-char hex
    user.password = tempPassword; // pre-save hook will hash it
    user.passwordChangedAt = Date.now();
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
        status: 'success',
        message: 'Password has been reset successfully',
        data: { temporaryPassword: tempPassword },
    });
});
