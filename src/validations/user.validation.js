const Joi = require('joi');

const updateProfile = {
    body: Joi.object().keys({
        name: Joi.string(),
        phoneNumber: Joi.string(),
        profilePicture: Joi.string(),
    }),
};

module.exports = {
    updateProfile,
};
