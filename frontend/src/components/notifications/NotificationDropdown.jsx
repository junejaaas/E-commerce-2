import { useState, useRef, useEffect } from 'react';
import { Bell, ShoppingBag, AlertTriangle, XCircle, UserPlus, ArrowLeftRight, Check, CheckCircle2, Clock } from 'lucide-react';
import { useNotificationStore } from '../../store/notificationStore';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';

const NOTIFICATION_ICONS = {
    'NEW_ORDER': <ShoppingBag className="text-blue-500" />,
    'LOW_INVENTORY': <AlertTriangle className="text-yellow-500" />,
    'PAYMENT_FAILURE': <XCircle className="text-red-500" />,
    'NEW_SIGNUP': <UserPlus className="text-green-500" />,
    'RETURN_REQUEST': <ArrowLeftRight className="text-purple-500" />,
};

export default function NotificationDropdown() {
    const { notifications, unreadCount, markRead, markAllRead } = useNotificationStore();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all"
            >
                <Bell className="h-6 w-6" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 h-5 w-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center ring-2 ring-white">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white border border-gray-100 rounded-3xl shadow-2xl py-0 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-5 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                        <h3 className="text-lg font-black text-gray-900">Notifications</h3>
                        {unreadCount > 0 && (
                            <button 
                                onClick={markAllRead}
                                className="text-xs font-bold text-primary-600 hover:text-primary-700 bg-white px-3 py-1.5 rounded-full border border-primary-100 shadow-sm transition-all active:scale-95"
                            >
                                Mark all as read
                            </button>
                        )}
                    </div>

                    <div className="max-h-[400px] overflow-y-auto divide-y divide-gray-50">
                        {notifications.length > 0 ? (
                            notifications.map((n) => (
                                <div 
                                    key={n._id} 
                                    className={`p-5 flex gap-4 hover:bg-gray-50 transition-colors relative group ${!n.isRead ? 'bg-primary-50/20' : ''}`}
                                >
                                    <div className="h-10 w-10 flex-shrink-0 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center">
                                        {NOTIFICATION_ICONS[n.type] || <Bell className="text-gray-400" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start mb-1">
                                            <p className={`text-sm tracking-tight ${!n.isRead ? 'font-black text-gray-900' : 'font-bold text-gray-600'}`}>
                                                {n.title}
                                            </p>
                                            {!n.isRead && (
                                                <button 
                                                    onClick={() => markRead(n._id)}
                                                    className="opacity-0 group-hover:opacity-100 p-1 text-primary-600 hover:bg-primary-100 rounded-md transition-all"
                                                    title="Mark as read"
                                                >
                                                    <Check className="h-4 w-4" />
                                                </button>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-500 font-medium leading-relaxed mb-2 line-clamp-2">
                                            {n.message}
                                        </p>
                                        <div className="flex items-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                            <Clock className="h-3 w-3 mr-1" />
                                            {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="py-12 px-6 text-center">
                                <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-dashed border-gray-200">
                                    <Bell className="h-8 w-8 text-gray-300" />
                                </div>
                                <p className="text-gray-900 font-black">No new alerts</p>
                                <p className="text-gray-400 text-xs font-bold mt-1">We'll notify you when something important happens.</p>
                            </div>
                        )}
                    </div>

                    <Link 
                        to="/admin/notifications" 
                        onClick={() => setIsOpen(false)}
                        className="block p-4 text-center text-sm font-black text-primary-600 hover:bg-gray-50 transition-colors bg-gray-50/30 border-t border-gray-50"
                    >
                        View all activity
                    </Link>
                </div>
            )}
        </div>
    );
}
