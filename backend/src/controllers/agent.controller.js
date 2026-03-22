const User = require('../models/user.model');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

/**
 * Get all delivery agents
 */
const getAllAgents = catchAsync(async (req, res) => {
    const agents = await User.find({ role: 'delivery' }).sort({ createdAt: -1 });

    res.status(200).json({
        status: 'success',
        results: agents.length,
        data: agents
    });
});

/**
 * Create a new delivery agent
 */
const createAgent = catchAsync(async (req, res) => {
    const { name, email, password, phoneNumber } = req.body;

    if (!name || !email || !password) {
        throw new AppError('Please provide name, email and password', 400);
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new AppError('User with this email already exists', 400);
    }

    const newAgent = await User.create({
        name,
        email,
        password,
        phoneNumber,
        role: 'delivery',
        isEmailVerified: true, // Admin created agents can be pre-verified
        mustResetPassword: true
    });

    // Remove password from output
    newAgent.password = undefined;

    res.status(201).json({
        status: 'success',
        data: newAgent
    });
});

/**
 * Delete an agent
 */
const deleteAgent = catchAsync(async (req, res) => {
    const agent = await User.findByIdAndDelete(req.params.id);

    if (!agent) {
        throw new AppError('No agent found with that ID', 404);
    }

    res.status(204).json({
        status: 'success',
        data: null
    });
});

module.exports = {
    getAllAgents,
    createAgent,
    deleteAgent
};
