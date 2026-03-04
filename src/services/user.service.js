const User = require('../models/user.model');
const AppError = require('../utils/AppError');

const getUserById = async (id) => {
    const user = await User.findById(id);
    if (!user) {
        throw new AppError('User not found', 404);
    }
    return user;
};

const updateUserById = async (userId, updateBody) => {
    const user = await User.findByIdAndUpdate(userId, updateBody, {
        new: true,
        runValidators: true,
    });
    return user;
};

const deleteUserById = async (userId) => {
    const user = await getUserById(userId);
    user.isActive = false;
    await user.save();
    return user;
};

module.exports = {
    getUserById,
    updateUserById,
    deleteUserById,
};
