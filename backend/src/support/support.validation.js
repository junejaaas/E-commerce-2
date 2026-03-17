const Joi = require('joi');

const createTicket = {
    body: Joi.object().keys({
        subject: Joi.string().required(),
        category: Joi.string().valid("order", "payment", "delivery", "account", "refund", "other").required(),
        priority: Joi.string().valid("low", "medium", "high"),
    }),
};

const sendMessage = {
    body: Joi.object().keys({
        message: Joi.string().required(),
        attachments: Joi.array().items(Joi.string()),
    }),
};

const updateStatus = {
    body: Joi.object().keys({
        status: Joi.string().valid("open", "pending", "resolved", "closed").required(),
    }),
};

module.exports = {
    createTicket,
    sendMessage,
    updateStatus,
};
