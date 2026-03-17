const Joi = require('joi');

const createAddress = {
    body: Joi.object().keys({
        fullName: Joi.string().required(),
        phoneNumber: Joi.string().required(),
        street: Joi.string().required(),
        city: Joi.string().required(),
        state: Joi.string().required(),
        postalCode: Joi.string().required(),
        country: Joi.string().required(),
        isDefault: Joi.boolean(),
    }),
};

const updateAddress = {
    params: Joi.object().keys({
        addressId: Joi.string().required(), // You might want to add custom regex validation for MongoDB ID
    }),
    body: Joi.object().keys({
        fullName: Joi.string(),
        phoneNumber: Joi.string(),
        street: Joi.string(),
        city: Joi.string(),
        state: Joi.string(),
        postalCode: Joi.string(),
        country: Joi.string(),
        isDefault: Joi.boolean(),
    }),
};

const getAddress = {
    params: Joi.object().keys({
        addressId: Joi.string().required(),
    }),
};

const deleteAddress = {
    params: Joi.object().keys({
        addressId: Joi.string().required(),
    }),
};

module.exports = {
    createAddress,
    updateAddress,
    getAddress,
    deleteAddress,
};
