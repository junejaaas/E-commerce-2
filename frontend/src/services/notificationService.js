import API from './api';

export const notificationService = {
    getNotifications: async () => {
        const { data } = await API.get('/notifications');
        return data;
    },
    markAsRead: async (id) => {
        const { data } = await API.patch(`/notifications/${id}/read`);
        return data;
    },
    markAllAsRead: async () => {
        const { data } = await API.patch('/notifications/mark-all-read');
        return data;
    }
};
