const Joi = require('joi');

const updateProfile = {
    body: Joi.object().keys({
        name: Joi.string(),
        phoneNumber: Joi.string(),
        gender: Joi.string().valid('Male', 'Female', 'Other'),
        dob: Joi.date(),
        profilePicture: Joi.string(),
    }),
};

module.exports = {
    updateProfile,
};
