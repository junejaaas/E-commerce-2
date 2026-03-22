import { create } from 'zustand';
import { notificationService } from '../services/notificationService';
import { io } from 'socket.io-client';

const socketUrl = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:5000';

export const useNotificationStore = create((set, get) => ({
    notifications: [],
    unreadCount: 0,
    socket: null,
    loading: false,

    fetchNotifications: async () => {
        set({ loading: true });
        try {
            const data = await notificationService.getNotifications();
            set({ 
                notifications: data.notifications, 
                unreadCount: data.unreadCount,
                loading: false 
            });
        } catch (error) {
            console.error('Failed to fetch notifications', error);
            set({ loading: false });
        }
    },

    initSocket: (userId) => {
        if (get().socket) return;

        const socket = io(socketUrl);
        
        socket.on('connect', () => {
            console.log('Connected to notification socket');
            socket.emit('join', userId);
        });

        socket.on('newNotification', (notification) => {
            set((state) => ({
                notifications: [notification, ...state.notifications],
                unreadCount: state.unreadCount + 1
            }));
            // Show a toast or desktop notification here if needed
        });

        set({ socket });
    },

    disconnectSocket: () => {
        const { socket } = get();
        if (socket) {
            socket.disconnect();
            set({ socket: null });
        }
    },

    markRead: async (id) => {
        try {
            await notificationService.markAsRead(id);
            set((state) => ({
                notifications: state.notifications.map(n => 
                    n._id === id ? { ...n, isRead: true } : n
                ),
                unreadCount: Math.max(0, state.unreadCount - 1)
            }));
        } catch (error) {
            console.error('Failed to mark notification as read', error);
        }
    },

    markAllRead: async () => {
        try {
            await notificationService.markAllAsRead();
            set((state) => ({
                notifications: state.notifications.map(n => ({ ...n, isRead: true })),
                unreadCount: 0
            }));
        } catch (error) {
            console.error('Failed to mark all as read', error);
        }
    }
}));
