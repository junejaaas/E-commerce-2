import API from './api';

export const dashboardService = {
    getStats: async () => {
        const response = await API.get('/dashboard/stats');
        return response.data;
    },
    trackVisit: async (data) => {
        try {
            await API.post('/dashboard/track', data);
        } catch (error) {
            console.error('Tracking error:', error);
        }
    }
};
