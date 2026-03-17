const catchAsync = require('../utils/catchAsync');
const addressService = require('../services/address.service');

const createAddress = catchAsync(async (req, res) => {
    const address = await addressService.createAddress({
        ...req.body,
        user: req.user.id,
    });
    res.status(201).send(address);
});

const getAddresses = catchAsync(async (req, res) => {
    const addresses = await addressService.getAddresses(req.user.id);
    res.send(addresses);
});

const getAddress = catchAsync(async (req, res) => {
    const address = await addressService.getAddressById(req.params.addressId, req.user.id);
    res.send(address);
});

const updateAddress = catchAsync(async (req, res) => {
    const address = await addressService.updateAddressById(req.params.addressId, req.user.id, req.body);
    res.send(address);
});

const deleteAddress = catchAsync(async (req, res) => {
    await addressService.deleteAddressById(req.params.addressId, req.user.id);
    res.status(204).send();
});

module.exports = {
    createAddress,
    getAddresses,
    getAddress,
    updateAddress,
    deleteAddress,
};
