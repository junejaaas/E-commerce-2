const catchAsync = require('../utils/catchAsync');
const userService = require('../services/user.service');

const getProfile = catchAsync(async (req, res) => {
    const user = await userService.getUserById(req.user.id);
    res.send(user);
});

const updateProfile = catchAsync(async (req, res) => {
    const user = await userService.updateUserById(req.user.id, req.body);
    res.send(user);
});

const uploadAvatar = catchAsync(async (req, res) => {
    const avatarPath = `/uploads/${req.file.filename}`;
    const user = await userService.updateUserById(req.user.id, { profilePicture: avatarPath });
    res.send(user);
});

const deleteAccount = catchAsync(async (req, res) => {
    await userService.deleteUserById(req.user.id);
    res.status(204).send();
});

module.exports = {
    getProfile,
    updateProfile,
    uploadAvatar,
    deleteAccount,
};
