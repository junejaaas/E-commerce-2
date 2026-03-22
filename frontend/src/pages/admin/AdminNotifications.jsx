import { useEffect } from 'react';
import { useNotificationStore } from '../../store/notificationStore';
import { ShoppingBag, AlertTriangle, XCircle, UserPlus, ArrowLeftRight, Check, Clock, Trash2, BellOff } from 'lucide-react';
import { format } from 'date-fns';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const NOTIFICATION_ICONS = {
    'NEW_ORDER': <ShoppingBag className="text-blue-500" />,
    'LOW_INVENTORY': <AlertTriangle className="text-yellow-500" />,
    'PAYMENT_FAILURE': <XCircle className="text-red-500" />,
    'NEW_SIGNUP': <UserPlus className="text-green-500" />,
    'RETURN_REQUEST': <ArrowLeftRight className="text-purple-500" />,
};

export default function AdminNotifications() {
    const { notifications, loading, fetchNotifications, markRead, markAllRead } = useNotificationStore();

    useEffect(() => {
        fetchNotifications();
    }, []);

    if (loading && notifications.length === 0) return <div className="p-20"><LoadingSpinner size="lg" /></div>;

    return (
        <div className="max-w-5xl mx-auto px-4 py-10 md:py-16">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight">System Alerts</h1>
                    <p className="text-gray-500 mt-2 font-medium">Manage and track all administrative notifications.</p>
                </div>
                {notifications.some(n => !n.isRead) && (
                    <button 
                        onClick={markAllRead}
                        className="flex items-center justify-center space-x-2 bg-white border border-gray-200 px-6 py-3 rounded-2xl font-bold text-sm text-gray-700 hover:bg-gray-50 hover:border-primary-200 transition-all shadow-sm active:scale-95"
                    >
                        <Check className="h-4 w-4" />
                        <span>Mark all as read</span>
                    </button>
                )}
            </div>

            <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden mb-10">
                {notifications.length > 0 ? (
                    <div className="divide-y divide-gray-50">
                        {notifications.map((n) => (
                            <div 
                                key={n._id} 
                                className={`p-6 md:p-8 flex flex-col sm:flex-row gap-6 hover:bg-gray-50/50 transition-colors relative group ${!n.isRead ? 'bg-primary-50/10' : ''}`}
                            >
                                <div className="h-14 w-14 flex-shrink-0 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    {NOTIFICATION_ICONS[n.type] || <Check className="text-gray-400" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                                        <div className="flex items-center gap-3">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                                !n.isRead ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-500'
                                            }`}>
                                                {n.type.replace('_', ' ')}
                                            </span>
                                            <span className="text-xs font-bold text-gray-400 flex items-center">
                                                <Clock className="h-3 w-3 mr-1" />
                                                {format(new Date(n.createdAt), 'MMM dd, yyyy • hh:mm a')}
                                            </span>
                                        </div>
                                        {!n.isRead && (
                                            <button 
                                                onClick={() => markRead(n._id)}
                                                className="self-start md:self-auto text-primary-600 hover:text-primary-700 font-bold text-xs bg-primary-50 px-3 py-1 rounded-lg transition-colors"
                                            >
                                                Mark as Read
                                            </button>
                                        )}
                                    </div>
                                    <h3 className={`text-xl font-bold text-gray-900 mb-2 ${!n.isRead ? '' : 'text-gray-600'}`}>
                                        {n.title}
                                    </h3>
                                    <p className="text-gray-500 font-medium leading-relaxed max-w-3xl">
                                        {n.message}
                                    </p>
                                    
                                    {/* Action Links based on type */}
                                    <div className="mt-4 flex gap-4">
                                        {n.type === 'NEW_ORDER' && n.metadata?.orderId && (
                                            <Link to={`/admin/orders/${n.metadata.orderId}`} className="text-sm font-black text-primary-600 hover:underline">View Order details</Link>
                                        )}
                                        {n.type === 'LOW_INVENTORY' && n.metadata?.productId && (
                                            <Link to={`/admin/products`} className="text-sm font-black text-primary-600 hover:underline">Manage Inventory</Link>
                                        )}
                                        {n.type === 'RETURN_REQUEST' && n.metadata?.orderId && (
                                            <Link to={`/admin/orders/${n.metadata.orderId}`} className="text-sm font-black text-primary-600 hover:underline">Check Return status</Link>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-24 px-6 text-center">
                        <div className="h-24 w-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-dashed border-gray-100">
                            <BellOff className="h-10 w-10 text-gray-200" />
                        </div>
                        <h2 className="text-2xl font-black text-gray-900">Clear Skies!</h2>
                        <p className="text-gray-400 font-bold mt-2 max-w-sm mx-auto">You don't have any notifications at the moment. We'll alert you when something needs your attention.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
