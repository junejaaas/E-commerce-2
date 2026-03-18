import { Link, useNavigate } from 'react-router-dom'
import { ShoppingCart, Heart, User, Search, Menu, LogOut, Package, ShieldCheck, MapPin, MessageSquare } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useCartStore } from '../../store/cartStore'
import { useProductStore } from '../../store/productStore'
import { useState, useEffect } from 'react'

export default function Navbar() {
    const { user, logout } = useAuthStore()
    const { cart, fetchCart } = useCartStore()
    const { setFilters } = useProductStore()
    const [showProfileMenu, setShowProfileMenu] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const navigate = useNavigate()

    useEffect(() => {
        if (user) fetchCart()
    }, [user])

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    const handleSearch = (e) => {
        if (e.key === 'Enter' || e.type === 'click') {
            setFilters({ search: searchQuery, page: 1 })
            if (window.location.pathname !== '/products') {
                navigate('/products')
            }
        }
    }

    return (
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center">
                        <span className="text-2xl font-bold text-primary-600 tracking-tight">E-SHOP</span>
                    </Link>

                    {/* Search Bar */}
                    <div className="hidden md:flex flex-1 max-w-lg mx-8">
                        <div className="relative w-full">
                            <input
                                type="text"
                                placeholder="Search for products..."
                                className="w-full pl-10 pr-4 py-2 bg-gray-100 border-none rounded-full focus:ring-2 focus:ring-primary-500 text-sm"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={handleSearch}
                            />
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 cursor-pointer" onClick={handleSearch} />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-4">
                        <Link to="/wishlist" className="p-2 text-gray-600 hover:text-primary-600 transition-colors relative">
                            <Heart className="h-6 w-6" />
                        </Link>

                        <Link to="/cart" className="p-2 text-gray-600 hover:text-primary-600 transition-colors relative">
                            <ShoppingCart className="h-6 w-6" />
                            {cart?.items?.length > 0 && (
                                <span className="absolute top-0 right-0 bg-primary-600 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                                    {cart.items.length}
                                </span>
                            )}
                        </Link>

                        {user ? (
                            <div className="relative">
                                <button
                                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                                    className="flex items-center space-x-2 p-1 rounded-full hover:bg-gray-100 transition-colors"
                                >
                                    <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold uppercase overflow-hidden">
                                        {user?.profilePicture ? (
                                            <img 
                                                src={user.profilePicture.startsWith('http') 
                                                    ? user.profilePicture 
                                                    : `${(import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1').replace('/api/v1', '').replace(/\/$/, '')}${user.profilePicture}`} 
                                                alt={user.name} 
                                                className="h-full w-full object-cover"
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                    e.target.parentElement.innerText = user?.name?.charAt(0);
                                                }}
                                            />
                                        ) : (
                                            user.name?.charAt(0)
                                        )}
                                    </div>
                                </button>

                                {showProfileMenu && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-lg py-1 z-50 animate-in fade-in slide-in-from-top-2">
                                        <div className="px-4 py-2 border-b border-gray-100">
                                            <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                                            <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                        </div>

                                        <Link to="/profile" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                                            <User className="h-4 w-4 mr-2" /> My Profile
                                        </Link>
                                        <Link to="/orders" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                                            <Package className="h-4 w-4 mr-2" /> My Orders
                                        </Link>
                                        <Link to="/addresses" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                                            <MapPin className="h-4 w-4 mr-2" /> My Addresses
                                        </Link>
                                        <Link to="/support/tickets" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 border-b border-gray-50">
                                            <MessageSquare className="h-4 w-4 mr-2" /> Help & Support
                                        </Link>
                                        {user.role === 'admin' && (
                                            <div className="bg-primary-50/50 py-1">
                                                <Link to="/admin" className="flex items-center px-4 py-2 text-sm font-black text-primary-600 hover:bg-primary-50">
                                                    <ShieldCheck className="h-4 w-4 mr-2" /> Admin Inventory
                                                </Link>
                                                <Link to="/admin/support" className="flex items-center px-4 py-2 text-sm font-black text-primary-600 hover:bg-primary-50">
                                                    <MessageSquare className="h-4 w-4 mr-2" /> Support Panel
                                                </Link>
                                            </div>
                                        )}
                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                        >
                                            <LogOut className="h-4 w-4 mr-2" /> Sign Out
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Link to="/login" className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary-700 transition-colors">
                                Login
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    )
}
