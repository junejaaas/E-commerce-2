const express = require('express');
const authMiddleware = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const userValidation = require('../validations/user.validation');
const userController = require('../controllers/user.controller');
const upload = require('../middlewares/upload.middleware');

const router = express.Router();

// All routes are protected
router.use(authMiddleware.protect);

router
    .route('/me')
    .get(userController.getProfile)
    .patch(validate(userValidation.updateProfile), userController.updateProfile)
    .delete(userController.deleteAccount);

router.post('/avatar', upload.single('avatar'), userController.uploadAvatar);

module.exports = router;
