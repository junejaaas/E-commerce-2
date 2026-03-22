import { Link, useNavigate } from 'react-router-dom'
import { ShoppingCart, Heart, User, Search, LogOut, Package, ShieldCheck, MapPin, MessageSquare, X } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useCartStore } from '../../store/cartStore'
import { useWishlistStore } from '../../store/wishlistStore'
import { useProductStore } from '../../store/productStore'
import { useState, useEffect, useRef } from 'react'

export default function Navbar() {
    const { user, logout } = useAuthStore()
    const { cart, fetchCart } = useCartStore()
    const { setFilters } = useProductStore()
    const [showProfileMenu, setShowProfileMenu] = useState(false)
    const [showSearch, setShowSearch] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const navigate = useNavigate()
    const searchRef = useRef(null)

    useEffect(() => {
        if (user) fetchCart()
    }, [user])

    useEffect(() => {
        if (showSearch && searchRef.current) {
            searchRef.current.focus()
        }
    }, [showSearch])

    const handleSearch = (e) => {
        if (e.key === 'Enter' || e.type === 'click') {
            if (!searchQuery.trim()) return
            setFilters({ search: searchQuery.trim(), page: 1 })
            setShowSearch(false)
            navigate('/')
        }
    }

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    const cartCount = cart?.items?.length || 0
    const { items: wishlistItems } = useWishlistStore()
    const wishlistCount = wishlistItems?.length || 0

    return (
        <>
            <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16 relative">

                        {/* Left: Logo image + Search */}
                        <div className="flex items-center gap-3">
                            <button onClick={() => { window.location.href = user?.role === 'admin' ? '/admin' : '/' }}>
                                <img
                                    src="https://urali.in/storage/media/SoVuABghcpnssD4H86yxoQ5weOsXuNcrAV0fYY7D.png"
                                    alt="URALI"
                                    className="h-9 w-auto object-contain"
                                />
                            </button>
                            <button
                                onClick={() => setShowSearch(true)}
                                className="p-2 text-gray-700 hover:text-black transition-colors"
                                aria-label="Search"
                            >
                                <Search className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Center: URALI brand name styled */}
                        <button
                            onClick={() => { window.location.href = user?.role === 'admin' ? '/admin' : '/' }}
                            className="absolute left-1/2 -translate-x-1/2 flex items-center border-2 border-black overflow-hidden"
                        >
                            <span className="bg-black text-white font-black text-xl tracking-[0.1em] uppercase px-3 py-1 leading-none">
                                URA
                            </span>
                            <span className="bg-white text-black font-black text-xl tracking-[0.1em] uppercase px-3 py-1 leading-none">
                                LI
                            </span>
                        </button>

                        {/* Right: Icons */}
                        <div className="flex items-center gap-1">
                            <Link
                                to="/wishlist"
                                className="relative p-2 text-gray-700 hover:text-black transition-colors"
                                aria-label="Wishlist"
                            >
                                <Heart className="h-5 w-5" />
                                {wishlistCount > 0 && (
                                    <span className="absolute top-0 right-0 bg-red-500 text-white text-[9px] font-black rounded-full h-4 w-4 flex items-center justify-center leading-none">
                                        {wishlistCount}
                                    </span>
                                )}
                            </Link>

                            <Link
                                to="/cart"
                                className="relative p-2 text-gray-700 hover:text-black transition-colors"
                                aria-label="Cart"
                            >
                                <ShoppingCart className="h-5 w-5" />
                                {cartCount > 0 && (
                                    <span className="absolute top-0 right-0 bg-red-500 text-white text-[9px] font-black rounded-full h-4 w-4 flex items-center justify-center leading-none">
                                        {cartCount}
                                    </span>
                                )}
                            </Link>

                            {user ? (
                                <div className="relative">
                                    <button
                                        onClick={() => setShowProfileMenu(!showProfileMenu)}
                                        className="p-2 text-gray-700 hover:text-black transition-colors"
                                        aria-label="Account"
                                    >
                                        <div className="h-7 w-7 rounded-full bg-gray-100 border border-gray-300 flex items-center justify-center text-black font-black text-xs uppercase overflow-hidden">
                                            {user?.profilePicture ? (
                                                <img
                                                    src={user.profilePicture.startsWith('http')
                                                        ? user.profilePicture
                                                        : `${(import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1').replace('/api/v1', '').replace(/\/$/, '')}${user.profilePicture}`}
                                                    alt={user.name}
                                                    className="h-full w-full object-cover"
                                                    onError={(e) => {
                                                        e.target.style.display = 'none'
                                                        e.target.parentElement.innerText = user?.name?.charAt(0)
                                                    }}
                                                />
                                            ) : (
                                                user.name?.charAt(0)
                                            )}
                                        </div>
                                    </button>

                                    {showProfileMenu && (
                                        <>
                                            <div
                                                className="fixed inset-0 z-40"
                                                onClick={() => setShowProfileMenu(false)}
                                            />
                                            <div className="absolute right-0 mt-2 w-52 bg-white border border-gray-200 shadow-xl py-1 z-50">
                                                <div className="px-4 py-3 border-b border-gray-100">
                                                    <p className="text-sm font-black text-gray-900 truncate">{user.name}</p>
                                                    <p className="text-xs text-gray-400 truncate mt-0.5">{user.email}</p>
                                                </div>

                                                <Link to="/profile" onClick={() => setShowProfileMenu(false)} className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 font-medium">
                                                    <User className="h-4 w-4 mr-3 text-gray-400" /> My Profile
                                                </Link>
                                                <Link to="/orders" onClick={() => setShowProfileMenu(false)} className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 font-medium">
                                                    <Package className="h-4 w-4 mr-3 text-gray-400" /> My Orders
                                                </Link>
                                                <Link to="/addresses" onClick={() => setShowProfileMenu(false)} className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 font-medium">
                                                    <MapPin className="h-4 w-4 mr-3 text-gray-400" /> My Addresses
                                                </Link>
                                                <Link to="/support/tickets" onClick={() => setShowProfileMenu(false)} className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 font-medium border-b border-gray-100">
                                                    <MessageSquare className="h-4 w-4 mr-3 text-gray-400" /> Help & Support
                                                </Link>

                                                {user.role === 'admin' && (
                                                    <div className="bg-gray-50">
                                                        <Link to="/admin" onClick={() => setShowProfileMenu(false)} className="flex items-center px-4 py-2.5 text-sm font-black text-black hover:bg-gray-100">
                                                            <ShieldCheck className="h-4 w-4 mr-3" /> Admin Panel
                                                        </Link>
                                                        <Link to="/admin/support" onClick={() => setShowProfileMenu(false)} className="flex items-center px-4 py-2.5 text-sm font-black text-black hover:bg-gray-100">
                                                            <MessageSquare className="h-4 w-4 mr-3" /> Support Panel
                                                        </Link>
                                                    </div>
                                                )}

                                                <button
                                                    onClick={handleLogout}
                                                    className="w-full flex items-center px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 font-medium"
                                                >
                                                    <LogOut className="h-4 w-4 mr-3" /> Sign Out
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ) : (
                                <Link
                                    to="/login"
                                    className="p-2 text-gray-700 hover:text-black transition-colors"
                                    aria-label="Login"
                                >
                                    <User className="h-5 w-5" />
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Compact Search Bar — drops below navbar */}
            {showSearch && (
                <div className="fixed top-16 left-0 right-0 z-[99] bg-white border-b border-gray-300 shadow-md px-4">
                    <div className="max-w-7xl mx-auto flex items-center gap-2 py-2">
                        <div className="flex-1 flex items-center border-2 border-black px-4 py-2 bg-white">
                            <div className="flex flex-col flex-1">
                                <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest leading-none mb-1">Search</span>
                                <input
                                    ref={searchRef}
                                    type="text"
                                    placeholder=""
                                    className="w-full text-sm font-medium outline-none text-black bg-transparent placeholder-transparent"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={handleSearch}
                                />
                            </div>
                            <button onClick={handleSearch} className="ml-3 text-gray-400 hover:text-black transition-colors">
                                <Search className="h-4 w-4" />
                            </button>
                        </div>
                        <button
                            onClick={() => { setShowSearch(false); setSearchQuery('') }}
                            className="p-2 text-gray-500 hover:text-black transition-colors"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            )}
        </>
    )
}
