import { useEffect, useState } from 'react';
import { useDeliveryStore } from '../../store/deliveryStore';
import { useAuthStore } from '../../store/authStore';
import { 
    Search, MapPin, Phone, CreditCard, Clock, 
    CheckCircle, Truck, Package, ChevronRight,
    AlertCircle, Box, TrendingUp, DollarSign,
    History, Wallet, MessageSquare, ExternalLink
} from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function DeliveryDashboard() {
    const { user, fetchMe } = useAuthStore();
    const { 
        orders, deliveryHistory, historyStats, loading, 
        fetchAvailableOrders, fetchDeliveryHistory, updateDeliveryStatus 
    } = useDeliveryStore();
    
    const [activeTab, setActiveTab] = useState('orders'); // 'orders', 'history', 'wallet'
    const [historyRange, setHistoryRange] = useState('today');
    const [searchTerm, setSearchTerm] = useState('');
    const [collectedAmounts, setCollectedAmounts] = useState({});
    const [otps, setOtps] = useState({});

    useEffect(() => {
        fetchAvailableOrders();
        fetchDeliveryHistory(historyRange);
        fetchMe();
    }, [historyRange]);

    const handleUpdateStatus = async (orderId, status, paymentStatus, amount) => {
        const success = await updateDeliveryStatus(orderId, status, paymentStatus, amount);
        if (success && status === 'delivered') {
            fetchMe();
            fetchDeliveryHistory(historyRange);
        }
    };

    const handleAmountChange = (orderId, value) => {
        setCollectedAmounts(prev => ({
            ...prev,
            [orderId]: value
        }));
    };

    const handleOtpChange = (orderId, value) => {
        setOtps(prev => ({ ...prev, [orderId]: value }));
    };

    const handleVerifyOtp = async (orderId, paymentStatus, amount) => {
        const otp = otps[orderId];
        if (!otp || otp.length !== 6) {
            import('react-hot-toast').then(({ toast }) => toast.error('Please enter a valid 6-digit OTP'));
            return;
        }
        
        const success = await useDeliveryStore.getState().verifyDeliveryOTP(orderId, otp, paymentStatus, amount);
        if (success) {
            fetchMe();
            fetchDeliveryHistory(historyRange);
        }
    };

    const filteredOrders = (activeTab === 'orders' ? orders : deliveryHistory || []).filter(o => 
        (o._id?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (o.user?.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (o.shippingAddress?.phone?.includes(searchTerm))
    );

    const openWhatsApp = (phone) => {
        const cleanPhone = phone.replace(/\D/g, '');
        window.open(`https://wa.me/${cleanPhone}`, '_blank');
    };

    if (loading && (orders || []).length === 0 && (deliveryHistory || []).length === 0) return <LoadingSpinner />;

    return (
        <div className="max-w-2xl mx-auto space-y-6 pb-20">
            {/* Top Stats Overview */}
            <div className="grid grid-cols-2 gap-4">
                <div 
                    onClick={() => setActiveTab('wallet')}
                    className={`p-6 rounded-[32px] transition-all cursor-pointer relative overflow-hidden group ${
                        activeTab === 'wallet' ? 'bg-gray-900 text-white shadow-xl shadow-gray-200' : 'bg-white border border-gray-100 shadow-sm'
                    }`}
                >
                    <TrendingUp className={`absolute -right-4 -top-4 h-24 w-24 opacity-5 rotate-12 group-hover:rotate-0 transition-transform duration-500`} />
                    <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${activeTab === 'wallet' ? 'text-primary-400' : 'text-gray-400'}`}>Total Earnings</p>
                    <p className="text-3xl font-black tracking-tighter">₹{user?.totalEarnings || 0}</p>
                </div>
                <div 
                    onClick={() => setActiveTab('history')}
                    className={`p-6 rounded-[32px] transition-all cursor-pointer ${
                        activeTab === 'history' ? 'bg-gray-900 text-white shadow-xl shadow-gray-200' : 'bg-white border border-gray-100 shadow-sm'
                    }`}
                >
                    <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${activeTab === 'history' ? 'text-primary-400' : 'text-gray-400'}`}>Total Deliveries</p>
                    <p className="text-3xl font-black tracking-tighter">{user?.totalDeliveries || 0}</p>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex bg-gray-100/50 p-1.5 rounded-[24px] gap-1">
                <button 
                    onClick={() => setActiveTab('orders')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-[20px] text-[10px] font-black uppercase tracking-widest transition-all ${
                        activeTab === 'orders' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'
                    }`}
                >
                    <Truck className="h-4 w-4" /> Active
                </button>
                <button 
                    onClick={() => setActiveTab('history')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-[20px] text-[10px] font-black uppercase tracking-widest transition-all ${
                        activeTab === 'history' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'
                    }`}
                >
                    <History className="h-4 w-4" /> History
                </button>
                <button 
                    onClick={() => setActiveTab('wallet')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-[20px] text-[10px] font-black uppercase tracking-widest transition-all ${
                        activeTab === 'wallet' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'
                    }`}
                >
                    <Wallet className="h-4 w-4" /> Wallet
                </button>
            </div>

            {activeTab === 'wallet' ? (
                /* WALLET VIEW */
                <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-300">
                    <div className="bg-gradient-to-br from-gray-900 to-black p-8 rounded-[40px] text-white space-y-8 shadow-2xl">
                        <div className="flex justify-between items-start">
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest font-mono">Current Balance</p>
                                <h2 className="text-5xl font-black tracking-tighter">₹{user?.totalEarnings || 0}</h2>
                            </div>
                            <div className="h-12 w-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md">
                                <Wallet className="h-6 w-6 text-primary-400" />
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-6 pt-4 border-t border-white/10">
                            <div className="space-y-1">
                                <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Cash with You</p>
                                <p className="text-xl font-black text-emerald-400">₹{historyStats.pendingSettlement}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Lifetime Collected</p>
                                <p className="text-xl font-black">₹{historyStats.totalCash}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-amber-50 border border-amber-100 p-6 rounded-[32px] flex gap-4 items-start">
                        <div className="h-10 w-10 bg-amber-100 rounded-2xl flex items-center justify-center shrink-0">
                            <AlertCircle className="h-5 w-5 text-amber-600" />
                        </div>
                        <div className="space-y-1">
                            <h4 className="text-sm font-black text-amber-900">Pending Settlement</h4>
                            <p className="text-xs font-medium text-amber-700/80 leading-relaxed">
                                You have ₹{historyStats.pendingSettlement} in cash that needs to be settled with the admin office.
                            </p>
                        </div>
                    </div>
                </div>
            ) : (
                /* ORDERS / HISTORY LIST VIEW */
                <div className="space-y-6 animate-in fade-in duration-300">
                    <div className="flex flex-col md:flex-row gap-4 items-center">
                        <div className="relative group flex-1 w-full">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                            <input
                                type="text"
                                placeholder={`Search ${activeTab}...`}
                                className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-100 rounded-[24px] focus:border-primary-500 outline-none transition-all shadow-sm font-medium"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        {activeTab === 'history' && (
                            <div className="flex bg-gray-100 p-1 rounded-2xl w-full md:w-auto">
                                {['today', 'weekly', 'all'].map(r => (
                                    <button
                                        key={r}
                                        onClick={() => setHistoryRange(r)}
                                        className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                                            historyRange === r ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400'
                                        }`}
                                    >
                                        {r}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="space-y-4">
                        {filteredOrders.length > 0 ? (
                            filteredOrders.map((order) => (
                                <div key={order._id} className={`bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden hover:border-primary-200 transition-all group ${activeTab === 'history' ? 'opacity-90' : ''}`}>
                                    <div className="p-6 space-y-6">
                                        {/* Header */}
                                        <div className="flex justify-between items-start">
                                            <div className="space-y-1">
                                                <span className="text-[10px] font-black text-primary-600 uppercase tracking-widest">Order ID</span>
                                                <h3 className="font-black text-gray-900 tracking-tight">#{order._id.slice(-8).toUpperCase()}</h3>
                                            </div>
                                            <div className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                                                order.orderStatus === 'delivered' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                order.orderStatus === 'shipped' ? 'bg-purple-50 text-purple-600 border-purple-100' :
                                                order.orderStatus === 'picked' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                                                'bg-blue-50 text-blue-600 border-blue-100'
                                            }`}>
                                                {order.orderStatus}
                                            </div>
                                        </div>

                                        {/* Customer & Interaction */}
                                        <div className="grid grid-cols-2 gap-4 py-4 border-y border-gray-50">
                                            <div className="space-y-3">
                                                <div className="space-y-1">
                                                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                                                        <Phone className="h-3 w-3" /> Customer
                                                    </span>
                                                    <p className="text-sm font-black text-gray-800">{order.user?.name || 'Guest User'}</p>
                                                </div>
                                                {activeTab === 'orders' && (
                                                    <div className="flex gap-2">
                                                        <a 
                                                            href={`tel:${order.shippingAddress?.phone}`}
                                                            className="flex-1 flex items-center justify-center gap-2 py-2 bg-primary-50 text-primary-600 rounded-xl hover:bg-primary-100 transition-colors"
                                                        >
                                                            <Phone className="h-3 w-3" />
                                                            <span className="text-[10px] font-black uppercase tracking-widest">Call</span>
                                                        </a>
                                                        <button 
                                                            onClick={() => openWhatsApp(order.shippingAddress?.phone)}
                                                            className="flex-1 flex items-center justify-center gap-2 py-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-colors"
                                                        >
                                                            <MessageSquare className="h-3 w-3" />
                                                            <span className="text-[10px] font-black uppercase tracking-widest">WA</span>
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="space-y-1">
                                                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                                                    <CreditCard className="h-3 w-3" /> Payment Type
                                                </span>
                                                <p className="text-sm font-black text-gray-800 uppercase">
                                                    {['cod', 'Cash on Delivery'].includes(order.paymentMethod) ? 'COD' : 'Online'}
                                                </p>
                                                <span className={`text-[10px] font-bold ${order.paymentStatus === 'paid' ? 'text-emerald-500' : 'text-amber-500'}`}>
                                                    {order.paymentStatus === 'paid' ? 'Received' : 'To Collect Cash'}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Address */}
                                        <div className="space-y-2">
                                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                                                <MapPin className="h-3 w-3" /> Delivery Address
                                            </span>
                                            <div className="bg-gray-50 p-4 rounded-2xl flex gap-3">
                                                <div className="p-2 bg-white rounded-xl shadow-sm h-fit">
                                                    <MapPin className="h-4 w-4 text-rose-500" />
                                                </div>
                                                <p className="text-sm font-medium text-gray-600 leading-relaxed">
                                                    {order.shippingAddress?.fullName}<br/>
                                                    {order.shippingAddress?.street}, {order.shippingAddress?.city}<br/>
                                                    {order.shippingAddress?.state} - {order.shippingAddress?.postalCode}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Amount & Actions */}
                                        {activeTab === 'orders' ? (
                                            <div className="space-y-6 pt-2">
                                                <div className="flex justify-between items-end">
                                                    <div className="space-y-0.5">
                                                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Order Total</span>
                                                        <p className="text-2xl font-black text-gray-900 tracking-tighter">₹{order.totalAmount}</p>
                                                    </div>
                                                    {['cod', 'Cash on Delivery'].includes(order.paymentMethod) && order.orderStatus === 'shipped' && (
                                                        <div className="flex-1 max-w-[150px] space-y-1">
                                                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Cash Collected</span>
                                                            <input 
                                                                type="number"
                                                                placeholder={order.totalAmount}
                                                                className="w-full px-3 py-2 bg-gray-50 border-2 border-gray-100 focus:border-primary-500 rounded-xl outline-none font-black text-sm transition-all text-right"
                                                                value={collectedAmounts[order._id] || ''}
                                                                onChange={(e) => handleAmountChange(order._id, e.target.value)}
                                                            />
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex flex-col gap-2">
                                                    {['confirmed', 'processing'].includes(order.orderStatus) && (
                                                        <button 
                                                            onClick={() => handleUpdateStatus(order._id, 'picked')}
                                                            className="w-full py-3 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2"
                                                        >
                                                            <Package className="h-4 w-4" /> Mark as Picked Up
                                                        </button>
                                                    )}

                                                    {order.orderStatus === 'picked' && (
                                                        <button 
                                                            onClick={() => handleUpdateStatus(order._id, 'shipped')}
                                                            className="w-full py-3 bg-purple-600 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-purple-700 transition-all shadow-lg shadow-purple-100 flex items-center justify-center gap-2"
                                                        >
                                                            <Truck className="h-4 w-4" /> Out for Delivery
                                                        </button>
                                                    )}

                                                    {order.orderStatus === 'shipped' && (
                                                        <div className="space-y-2">
                                                            <input
                                                                type="text"
                                                                maxLength="6"
                                                                placeholder="Enter 6-digit Delivery OTP"
                                                                className="w-full px-3 py-3 bg-primary-50 border-2 border-primary-100 focus:border-primary-500 rounded-xl outline-none font-black text-center text-lg tracking-[0.5em] transition-all text-primary-900 placeholder:text-primary-300 placeholder:tracking-normal placeholder:text-sm"
                                                                value={otps[order._id] || ''}
                                                                onChange={(e) => handleOtpChange(order._id, e.target.value.replace(/\D/g, ''))}
                                                            />
                                                            <button 
                                                                onClick={() => {
                                                                    if (window.confirm('Confirm Delivery and Payment?')) {
                                                                        const amount = collectedAmounts[order._id] || order.totalAmount;
                                                                        handleVerifyOtp(order._id, 'paid', amount)
                                                                    }
                                                                }}
                                                                className="w-full py-4 bg-gray-900 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-black transition-all shadow-xl shadow-gray-200 flex items-center justify-center gap-2"
                                                            >
                                                                <CheckCircle className="h-4 w-4" /> Verify & Complete
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex justify-between items-center pt-4 border-t border-gray-50">
                                                <div className="flex items-center gap-2">
                                                    <Clock className="h-3 w-3 text-gray-400" />
                                                    <span className="text-[10px] font-bold text-gray-500">
                                                        Delivered {new Date(order.deliveredAt).toLocaleDateString()} at {new Date(order.deliveredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Collected</span>
                                                    <p className="text-lg font-black text-gray-900">₹{order.collectedAmount || order.totalAmount}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-20 text-center flex flex-col items-center">
                                <div className="h-20 w-20 bg-gray-50 rounded-[40px] flex items-center justify-center mb-4">
                                    <Box className="h-10 w-10 text-gray-200" />
                                </div>
                                <h4 className="text-gray-900 font-black tracking-tight">No {activeTab} yet</h4>
                                <p className="text-gray-400 font-medium text-sm">Once you have {activeTab}, they'll appear here</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
