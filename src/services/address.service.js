const Address = require('../models/address.model');
const AppError = require('../utils/AppError');

const createAddress = async (addressBody) => {
    // If set as default, unset other defaults for this user
    if (addressBody.isDefault) {
        await Address.updateMany(
            { user: addressBody.user, isDefault: true },
            { isDefault: false }
        );
    }

    // If this is the FIRST address, make it default automatically
    const count = await Address.countDocuments({ user: addressBody.user });
    if (count === 0) {
        addressBody.isDefault = true;
    }

    const address = await Address.create(addressBody);
    return address;
};

const getAddresses = async (userId) => {
    const addresses = await Address.find({ user: userId });
    return addresses;
};

const getAddressById = async (addressId, userId) => {
    const address = await Address.findOne({ _id: addressId, user: userId });
    if (!address) {
        throw new AppError('Address not found', 404);
    }
    return address;
};

const updateAddressById = async (addressId, userId, updateBody) => {
    const address = await getAddressById(addressId, userId);

    if (updateBody.isDefault) {
        await Address.updateMany(
            { user: userId, isDefault: true },
            { isDefault: false }
        );
    }

    Object.assign(address, updateBody);
    await address.save();
    return address;
};

const deleteAddressById = async (addressId, userId) => {
    const address = await getAddressById(addressId, userId);
    await address.deleteOne();
    return address;
};

module.exports = {
    createAddress,
    getAddresses,
    getAddressById,
    updateAddressById,
    deleteAddressById,
};
