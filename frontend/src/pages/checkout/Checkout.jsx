import { useEffect, useState } from 'react'
import { useCartStore } from '../../store/cartStore'
import { useAddressStore } from '../../store/addressStore'
import { useCheckoutStore } from '../../store/checkoutStore'
import { useOrderStore } from '../../store/orderStore'
import { Button } from '../../components/common/Button'
import AddressForm from '../../components/checkout/AddressForm'
import { CheckCircle2, Plus, MapPin, CreditCard, Wallet, Truck, ChevronRight, ShoppingBag } from 'lucide-react'
import toast from 'react-hot-toast'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import EmptyState from '../../components/common/EmptyState'
import { useNavigate } from 'react-router-dom'

export default function Checkout() {
    const navigate = useNavigate()
    const { cart } = useCartStore()
    const { addresses, fetchAddresses, loading: addressLoading } = useAddressStore()
    const { 
        summary, 
        shippingMethods, 
        fetchShippingMethods, 
        fetchSummary, 
        loading: checkoutLoading 
    } = useCheckoutStore()
    const { placeOrder, verifyPayment, loading: orderLoading } = useOrderStore()

    const [selectedAddress, setSelectedAddress] = useState(null)
    const [showAddressForm, setShowAddressForm] = useState(false)
    const [selectedShipping, setSelectedShipping] = useState(null)
    const [couponCode, setCouponCode] = useState('')
    const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery')

    const loading = addressLoading || checkoutLoading || orderLoading

    useEffect(() => {
        fetchAddresses()
        fetchShippingMethods().then(methods => {
            if (methods && methods.length > 0) {
                setSelectedShipping(methods[0]._id)
            }
        })
    }, [])

    useEffect(() => {
        if (selectedAddress && selectedShipping) {
            fetchSummary({
                addressId: selectedAddress,
                shippingMethodId: selectedShipping,
                couponCode
            })
        }
    }, [selectedAddress, selectedShipping])

    const handleApplyCoupon = async () => {
        if (!couponCode) return toast.error('Please enter a coupon code')
        if (!selectedAddress || !selectedShipping) return toast.error('Please select address and shipping method first')
        
        await fetchSummary({
            addressId: selectedAddress,
            shippingMethodId: selectedShipping,
            couponCode
        })
    }

    const handlePlaceOrder = async () => {
        if (!selectedAddress) return toast.error('Please select an address')
        if (!selectedShipping) return toast.error('Please select a shipping method')

        const orderData = {
            addressId: selectedAddress,
            paymentMethod,
            shippingMethodId: selectedShipping,
            couponCode: couponCode || undefined
        }

        const order = await placeOrder(orderData)
        if (order) {
            if (paymentMethod === 'Razorpay') {
                initiateRazorpay(order)
            } else {
                toast.success('Order placed successfully!')
                navigate(`/order-success/${order._id}`)
            }
        }
    }

    const initiateRazorpay = (order) => {
        const options = {
            key: import.meta.env.VITE_RAZORPAY_KEY_ID,
            amount: order.totalAmount * 100,
            currency: 'INR',
            name: 'E-SHOP',
            description: 'Order Payment',
            order_id: order.razorpayOrderId,
            handler: async (response) => {
                const verified = await verifyPayment({
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_signature: response.razorpay_signature
                })
                if (verified) {
                    navigate(`/order-success/${order._id}`)
                }
            },
            prefill: {
                name: order.user?.name || '',
                email: order.user?.email || ''
            },
            theme: { color: '#0ea5e9' }
        }
        const rzp = new window.Razorpay(options)
        rzp.open()
    }

    if (!cart || cart.items.length === 0) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-20">
                <EmptyState
                    icon={ShoppingBag}
                    title="Your cart is empty"
                    description="You need to add items to your cart before checking out."
                    actionLabel="Go to Products"
                    actionPath="/products"
                />
            </div>
        )
    }

    const subtotal = cart.items.reduce((acc, item) => acc + (item.product?.price || 0) * item.quantity, 0)

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-20">
            <h1 className="text-4xl font-black text-gray-900 mb-10">Checkout</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
                <div className="lg:col-span-2 space-y-10">
                    {/* Address Selection */}
                    <section>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold flex items-center">
                                <MapPin className="h-6 w-6 mr-2 text-primary-600" /> Shipping Address
                            </h2>
                            <button
                                onClick={() => setShowAddressForm(true)}
                                className="text-primary-600 font-bold hover:underline flex items-center text-sm"
                            >
                                <Plus className="h-4 w-4 mr-1" /> Add New
                            </button>
                        </div>

                        {showAddressForm ? (
                            <AddressForm
                                onSuccess={() => setShowAddressForm(false)}
                                onCancel={() => setShowAddressForm(false)}
                            />
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {addresses.map(addr => (
                                    <button
                                        key={addr._id}
                                        onClick={() => setSelectedAddress(addr._id)}
                                        className={`p-6 rounded-2xl border-2 text-left transition-all relative ${selectedAddress === addr._id ? 'border-primary-600 bg-primary-50' : 'border-gray-100 bg-white hover:border-primary-200'}`}
                                    >
                                        {selectedAddress === addr._id && <CheckCircle2 className="absolute top-4 right-4 h-5 w-5 text-primary-600" />}
                                        <h4 className="font-bold text-gray-900 mb-1">{addr.fullName}</h4>
                                        <p className="text-gray-500 text-sm mb-2">{addr.phoneNumber}</p>
                                        <p className="text-sm text-gray-600 leading-tight">
                                            {addr.street}, {addr.city}, {addr.state} - {addr.postalCode}, {addr.country}
                                        </p>
                                    </button>
                                ))}
                                {addresses.length === 0 && (
                                    <div className="col-span-full py-10 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                                        <p className="text-gray-500">No addresses found. Please add one.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </section>

                    {/* Shipping Method */}
                    <section>
                        <h2 className="text-2xl font-bold flex items-center mb-6">
                            <Truck className="h-6 w-6 mr-2 text-primary-600" /> Shipping Method
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {shippingMethods.map(method => (
                                <button
                                    key={method._id}
                                    onClick={() => setSelectedShipping(method._id)}
                                    className={`p-6 rounded-2xl border-2 text-left transition-all ${selectedShipping === method._id ? 'border-primary-600 bg-primary-100/50' : 'border-gray-100 bg-white hover:border-primary-100'}`}
                                >
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="font-bold text-gray-900">{method.name}</span>
                                        <span className="text-primary-600 font-black">${method.cost}</span>
                                    </div>
                                    <p className="text-gray-500 text-xs">{method.description}</p>
                                    <p className="text-gray-400 text-[10px] mt-1 italic">Est: {method.estimatedDelivery}</p>
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* Payment Method */}
                    <section>
                        <h2 className="text-2xl font-bold flex items-center mb-6">
                            <CreditCard className="h-6 w-6 mr-2 text-primary-600" /> Payment Method
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <button
                                onClick={() => setPaymentMethod('Cash on Delivery')}
                                className={`p-6 rounded-2xl border-2 flex items-center space-x-4 transition-all ${paymentMethod === 'Cash on Delivery' ? 'border-primary-600 bg-primary-100/50' : 'border-gray-100 bg-white hover:border-primary-100'}`}
                            >
                                <div className="bg-gray-100 p-3 rounded-xl text-gray-600">
                                    <Wallet className="h-6 w-6" />
                                </div>
                                <span className="font-bold">Cash on Delivery</span>
                            </button>
                            <button
                                onClick={() => setPaymentMethod('Razorpay')}
                                className={`p-6 rounded-2xl border-2 flex items-center space-x-4 transition-all ${paymentMethod === 'Razorpay' ? 'border-primary-600 bg-primary-100/50' : 'border-gray-100 bg-white hover:border-primary-100'}`}
                            >
                                <div className="bg-primary-100 p-3 rounded-xl text-primary-600">
                                    <CreditCard className="h-6 w-6" />
                                </div>
                                <span className="font-bold">Razorpay / Card</span>
                            </button>
                        </div>
                    </section>
                </div>

                {/* Summary Sticky */}
                <aside className="space-y-6 sticky top-24">
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                        <h3 className="text-2xl font-black text-gray-900 mb-6">Order Summary</h3>

                        {/* Cart Mini List */}
                        <div className="space-y-4 mb-8 max-h-48 overflow-y-auto pr-2">
                            {cart.items.map(item => (
                                <div key={item.product?._id} className="flex justify-between text-sm">
                                    <span className="text-gray-600 truncate max-w-[150px]">{item.product?.name} x {item.quantity}</span>
                                    <span className="font-bold text-gray-900">${((item.product?.price || 0) * item.quantity).toFixed(2)}</span>
                                </div>
                            ))}
                        </div>

                        {/* Coupon */}
                        <div className="mb-8">
                            <div className="flex space-x-2">
                                <input
                                    type="text"
                                    placeholder="Coupon Code"
                                    className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:ring-1 focus:ring-primary-500 outline-none"
                                    value={couponCode}
                                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                />
                                <Button variant="secondary" size="sm" onClick={handleApplyCoupon} isLoading={checkoutLoading}>Apply</Button>
                            </div>
                        </div>

                        <div className="space-y-4 text-gray-600 border-t border-gray-100 pt-6">
                            <div className="flex justify-between items-center">
                                <span className="text-sm">Subtotal</span>
                                <span className="font-bold text-gray-900">${(summary?.subtotal || subtotal).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm">Shipping</span>
                                <span className="font-bold text-gray-900">${summary?.shipping || 0}</span>
                            </div>
                            {summary?.discount > 0 && (
                                <div className="flex justify-between items-center text-green-600">
                                    <span className="text-sm font-bold">Discount</span>
                                    <span className="font-bold">-${summary.discount}</span>
                                </div>
                            )}
                            <div className="flex justify-between items-center">
                                <span className="text-sm">Tax</span>
                                <span className="font-bold text-gray-900">${summary?.tax || 0}</span>
                            </div>
                        </div>

                        <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-100">
                            <span className="text-lg font-bold text-gray-900">Total Amount</span>
                            <span className="text-3xl font-black text-primary-600">${(summary?.total || subtotal).toFixed(2)}</span>
                        </div>

                        <Button
                            className="w-full py-4 mt-8 rounded-2xl text-lg font-bold shadow-xl shadow-primary-200 group"
                            onClick={handlePlaceOrder}
                            disabled={loading}
                            isLoading={loading}
                        >
                            Place Order <ChevronRight className="ml-1 h-5 w-5 group-hover:translate-x-0.5 transition-transform" />
                        </Button>
                    </div>
                </aside>
            </div>
        </div>
    )
}
