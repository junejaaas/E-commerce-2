import { create } from 'zustand';
import API from '../services/api';
import toast from 'react-hot-toast';

export const useCouponStore = create((set, get) => ({
    coupons: [],
    loading: false,

    fetchCoupons: async () => {
        set({ loading: true });
        try {
            const { data } = await API.get('/coupons');
            set({ coupons: data.data.coupons, loading: false });
        } catch (error) {
            set({ loading: false });
            toast.error(error.response?.data?.message || 'Failed to fetch coupons');
        }
    },

    createCoupon: async (couponData) => {
        set({ loading: true });
        try {
            const { data } = await API.post('/coupons', couponData);
            set((state) => ({
                coupons: [data.data.coupon, ...state.coupons],
                loading: false
            }));
            toast.success('Coupon created successfully');
            return true;
        } catch (error) {
            set({ loading: false });
            toast.error(error.response?.data?.message || 'Failed to create coupon');
            return false;
        }
    },

    updateCoupon: async (id, couponData) => {
        set({ loading: true });
        try {
            const { data } = await API.patch(`/coupons/${id}`, couponData);
            set((state) => ({
                coupons: state.coupons.map((c) => (c._id === id ? data.data.coupon : c)),
                loading: false
            }));
            toast.success('Coupon updated successfully');
            return true;
        } catch (error) {
            set({ loading: false });
            toast.error(error.response?.data?.message || 'Failed to update coupon');
            return false;
        }
    },

    deleteCoupon: async (id) => {
        try {
            await API.delete(`/coupons/${id}`);
            set((state) => ({
                coupons: state.coupons.filter((c) => c._id !== id)
            }));
            toast.success('Coupon deleted successfully');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete coupon');
        }
    },

    toggleCouponStatus: async (id, isActive) => {
        try {
            const { data } = await API.patch(`/coupons/${id}`, { isActive });
            set((state) => ({
                coupons: state.coupons.map((c) => (c._id === id ? data.data.coupon : c))
            }));
            toast.success(`Coupon ${isActive ? 'activated' : 'deactivated'}`);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update status');
        }
    }
}));
