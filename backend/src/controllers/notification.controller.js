const Notification = require('../models/notification.model');
const User = require('../models/user.model');
const catchAsync = require('../utils/catchAsync');

/**
 * Create a notification and emit via socket.io
 * @param {Object} io - Socket.io instance
 * @param {Object} data - Notification data
 */
const createNotification = async (io, { recipientType, recipientId, type, title, message, metadata }) => {
    let recipients = [];

    if (recipientType === 'admin') {
        const admins = await User.find({ role: 'admin' }).select('_id');
        recipients = admins.map(admin => admin._id);
    } else if (recipientId) {
        recipients = [recipientId];
    }

    const notifications = await Promise.all(recipients.map(async (recipient) => {
        const notification = await Notification.create({
            recipient,
            type,
            title,
            message,
            metadata
        });
        
        if (io) {
            io.to(recipient.toString()).emit('newNotification', notification);
        }
        
        return notification;
    }));

    return notifications;
};

const getNotifications = catchAsync(async (req, res) => {
    const notifications = await Notification.find({ recipient: req.user.id })
        .sort({ createdAt: -1 })
        .limit(50);

    const unreadCount = await Notification.countDocuments({ recipient: req.user.id, isRead: false });

    res.status(200).json({
        notifications,
        unreadCount
    });
});

const markAsRead = catchAsync(async (req, res) => {
    const notification = await Notification.findOneAndUpdate(
        { _id: req.params.id, recipient: req.user.id },
        { isRead: true },
        { new: true }
    );

    if (!notification) {
        return res.status(404).json({ message: 'Notification not found' });
    }

    res.status(200).json(notification);
});

const markAllAsRead = catchAsync(async (req, res) => {
    await Notification.updateMany(
        { recipient: req.user.id, isRead: false },
        { isRead: true }
    );

    res.status(200).json({ message: 'All notifications marked as read' });
});

module.exports = {
    createNotification,
    getNotifications,
    markAsRead,
    markAllAsRead
};
