import { useEffect } from 'react'
import { useCartStore } from '../../store/cartStore'
import { Link } from 'react-router-dom'
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight } from 'lucide-react'
import { Button } from '../../components/common/Button'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import EmptyState from '../../components/common/EmptyState'
import { useAnalytics } from '../../hooks/useAnalytics'

export default function Cart() {
    const { cart, fetchCart, updateQuantity, removeFromCart, clearCart, loading } = useCartStore()
    
    useAnalytics('cart')

    useEffect(() => {
        fetchCart()
    }, [])

    if (loading && (!cart || cart.items.length === 0)) return <div className="p-20"><LoadingSpinner size="lg" /></div>

    if (!cart || cart.items.length === 0) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-20">
                <EmptyState
                    icon={ShoppingBag}
                    title="Your cart is empty"
                    description="Looks like you haven't added anything to your cart yet."
                    actionLabel="Start Shopping"
                    actionPath="/products"
                />
            </div>
        )
    }

    const subtotal = cart.items.reduce((acc, item) => acc + item.product.price * item.quantity, 0)

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-20">
            <div className="flex justify-between items-center mb-10">
                <h1 className="text-4xl font-black text-gray-900">Shopping Cart</h1>
                <button
                    onClick={clearCart}
                    className="text-red-500 hover:text-red-700 font-bold text-sm bg-red-50 px-4 py-2 rounded-xl transition-colors"
                >
                    Clear Cart
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
                {/* Cart Items */}
                <div className="lg:col-span-2 space-y-6">
                    {Array.isArray(cart?.items) && cart.items.map((item) => (
                        <div key={item.product._id} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col sm:flex-row items-center gap-6">
                            <div className="h-32 w-32 bg-gray-50 rounded-2xl p-4 flex-shrink-0">
                                <img src={item.product.images[0]?.url} alt={item.product.name} className="h-full w-full object-contain" />
                            </div>

                            <div className="flex-1 space-y-1 text-center sm:text-left">
                                <Link to={`/products/${item.product._id}`} className="text-xl font-bold text-gray-900 hover:text-primary-600 transition-colors">
                                    {item.product.name}
                                </Link>
                                <p className="text-sm text-gray-500">{item.product.category?.name || item.product.category}</p>
                                <p className="text-primary-600 font-black text-lg mt-2">${item.product.price}</p>
                            </div>

                            <div className="flex items-center space-x-6">
                                <div className="flex items-center border border-gray-200 rounded-xl p-1 bg-gray-50">
                                    <button
                                        onClick={() => updateQuantity(item.product._id, Math.max(1, item.quantity - 1))}
                                        className="p-1.5 hover:bg-white rounded-lg transition-all shadow-sm active:scale-95"
                                    >
                                        <Minus className="h-4 w-4" />
                                    </button>
                                    <span className="w-10 text-center font-bold">{item.quantity}</span>
                                    <button
                                        onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                                        className="p-1.5 hover:bg-white rounded-lg transition-all shadow-sm active:scale-95"
                                    >
                                        <Plus className="h-4 w-4" />
                                    </button>
                                </div>

                                <button
                                    onClick={() => removeFromCart(item.product._id)}
                                    className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                                >
                                    <Trash2 className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Order Summary */}
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 sticky top-24">
                    <h3 className="text-2xl font-black text-gray-900 mb-6">Order Summary</h3>

                    <div className="space-y-4 text-gray-600 border-b border-gray-100 pb-6 mb-6">
                        <div className="flex justify-between">
                            <span>Subtotal</span>
                            <span className="font-bold text-gray-900">${subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Shipping</span>
                            <span className="text-green-600 font-bold uppercase text-xs bg-green-50 px-2 py-1 rounded">Calculated at checkout</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Estimated Tax</span>
                            <span className="font-bold text-gray-900">$0.00</span>
                        </div>
                    </div>

                    <div className="flex justify-between items-center mb-8">
                        <span className="text-lg font-bold text-gray-900">Total</span>
                        <span className="text-3xl font-black text-primary-600">${subtotal.toFixed(2)}</span>
                    </div>

                    <Link to="/checkout">
                        <Button className="w-full py-4 rounded-2xl text-lg font-bold shadow-lg shadow-primary-100 group">
                            Checkout <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </Link>

                    <p className="text-center text-xs text-gray-400 mt-6 px-4">
                        Shipping, taxes, and discounts will be calculated during checkout.
                    </p>
                </div>
            </div>
        </div>
    )
}
