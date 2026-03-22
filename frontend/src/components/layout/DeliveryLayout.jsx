import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { LogOut, Package, User } from 'lucide-react';
import { Button } from '../common/Button';

export default function DeliveryLayout({ children }) {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Simple Mobile Header */}
            <header className="bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center sticky top-0 z-10">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-primary-100 rounded-xl">
                        <Package className="h-5 w-5 text-primary-600" />
                    </div>
                    <div>
                        <h1 className="text-sm font-black text-gray-900 leading-tight">Delivery Portal</h1>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Shift Active</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-4">
                    <div className="hidden sm:flex flex-col items-end">
                        <span className="text-xs font-black text-gray-900">{user?.name}</span>
                        <span className="text-[10px] font-bold text-gray-400 uppercase">Agent</span>
                    </div>
                    <button 
                        onClick={handleLogout}
                        className="p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                    >
                        <LogOut className="h-5 w-5" />
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 p-4 pb-20">
                {children}
            </main>

            {/* Simple Bottom Nav for Mobile */}
            <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-8 py-3 flex justify-around items-center sm:hidden shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
                <button className="flex flex-col items-center gap-1 text-primary-600">
                    <Package className="h-6 w-6" />
                    <span className="text-[9px] font-black uppercase tracking-widest">Orders</span>
                </button>
                <button className="flex flex-col items-center gap-1 text-gray-400">
                    <User className="h-6 w-6" />
                    <span className="text-[9px] font-black uppercase tracking-widest">Profile</span>
                </button>
            </nav>
        </div>
    );
}
