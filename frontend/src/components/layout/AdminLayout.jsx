import { Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { LayoutDashboard, Package, ShoppingCart, MessageSquare, LogOut, Menu } from 'lucide-react'
import { useState } from 'react'

export default function AdminLayout({ children }) {
    const { user, logout } = useAuthStore()
    const location = useLocation()
    const [sidebarOpen, setSidebarOpen] = useState(false)

    const menuItems = [
        { title: 'Inventory', path: '/admin', icon: <Package className="h-5 w-5" /> },
        { title: 'Orders', path: '/admin/orders', icon: <ShoppingCart className="h-5 w-5" /> },
        { title: 'Support', path: '/admin/support', icon: <MessageSquare className="h-5 w-5" /> },
    ]

    const handleLogout = () => {
        logout()
        window.location.href = '/login'
    }

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 bg-white border-r border-gray-200 w-64 transform transition-transform duration-200 ease-in-out z-30 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static`}>
                <div className="h-16 flex items-center justify-center border-b border-gray-200">
                    <span className="text-2xl font-black text-primary-600 tracking-tight flex items-center">
                        <LayoutDashboard className="h-6 w-6 mr-2" /> ADMIN
                    </span>
                </div>
                
                <nav className="p-4 space-y-1">
                    {menuItems.map((item) => {
                        const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path))
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center px-4 py-3 rounded-xl transition-all font-semibold ${
                                    isActive 
                                    ? 'bg-primary-600 text-white shadow-md shadow-primary-200' 
                                    : 'text-gray-500 hover:bg-primary-50 hover:text-primary-600'
                                }`}
                            >
                                {item.icon}
                                <span className="ml-3">{item.title}</span>
                            </Link>
                        )
                    })}
                </nav>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Topbar */}
                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 lg:px-8 z-20">
                    <button 
                        className="md:hidden p-2 text-gray-400 hover:text-gray-600 bg-gray-50 rounded-lg"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                    >
                        <Menu className="h-6 w-6" />
                    </button>
                    
                    <div className="flex-1"></div>

                    <div className="flex items-center space-x-4">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-bold text-gray-900">{user?.name}</p>
                            <p className="text-xs text-gray-500 font-medium uppercase tracking-widest">{user?.role}</p>
                        </div>
                        <div className="h-10 w-10 rounded-xl bg-primary-100 flex items-center justify-center text-primary-700 font-bold overflow-hidden border border-primary-200">
                            {user?.profilePicture ? (
                                <img 
                                    src={user.profilePicture.startsWith('http') ? user.profilePicture : `${(import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1').replace('/api/v1', '')}${user.profilePicture}`}
                                    alt="Admin"
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                user?.name?.charAt(0) || 'A'
                            )}
                        </div>
                        <button 
                            onClick={handleLogout}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all ml-2"
                        >
                            <LogOut className="h-5 w-5" />
                        </button>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto">
                    {children}
                </main>
            </div>
            
            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div 
                    className="fixed inset-0 bg-gray-900/50 z-20 md:hidden backdrop-blur-sm"
                    onClick={() => setSidebarOpen(false)}
                />
            )}
        </div>
    )
}
