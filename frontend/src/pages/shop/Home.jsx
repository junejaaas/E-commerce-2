import { useEffect, useState } from 'react'
import API from '../../services/api'
import ProductCard from '../../components/product/ProductCard'
import { ArrowRight, Truck, ShieldCheck, Clock } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Home() {
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const { data } = await API.get('/products')
                setProducts(data.products || data)
            } catch (error) {
                console.error('Failed to fetch products', error)
            } finally {
                setLoading(false)
            }
        }
        fetchProducts()
    }, [])

    return (
        <div className="space-y-16 pb-20">
            {/* Hero Section */}
            <section className="relative bg-primary-900 h-[600px] overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-primary-950 to-transparent z-10" />
                <img
                    src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2426&q=80"
                    className="absolute inset-0 w-full h-full object-cover opacity-50"
                    alt="Banner"
                />
                <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center text-white">
                    <h1 className="text-5xl md:text-7xl font-black max-w-2xl leading-tight mb-6">
                        Future of Tech <br />
                        <span className="text-primary-400">Right Now.</span>
                    </h1>
                    <p className="text-xl text-gray-300 max-w-xl mb-10">
                        Discover the most innovative products designed to elevate your lifestyle. Quality guaranteed.
                    </p>
                    <div className="flex space-x-4">
                        <Link to="/products" className="bg-primary-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-primary-700 transition-all flex items-center">
                            Shop Collection <ArrowRight className="ml-2 h-5 w-5" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex items-start space-x-4">
                        <div className="bg-primary-100 p-3 rounded-xl text-primary-600">
                            <Truck className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg">Fast Delivery</h3>
                            <p className="text-gray-500 text-sm">Free shipping on all orders over $100</p>
                        </div>
                    </div>
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex items-start space-x-4">
                        <div className="bg-primary-100 p-3 rounded-xl text-primary-600">
                            <ShieldCheck className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg">Secure Payments</h3>
                            <p className="text-gray-500 text-sm">100% secure payment methods</p>
                        </div>
                    </div>
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex items-start space-x-4">
                        <div className="bg-primary-100 p-3 rounded-xl text-primary-600">
                            <Clock className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg">24/7 Support</h3>
                            <p className="text-gray-500 text-sm">Dedicated support for all customers</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Products */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-end mb-10">
                    <div>
                        <h2 className="text-3xl font-black text-gray-900 mb-2">Featured Products</h2>
                        <div className="h-1.5 w-20 bg-primary-600 rounded-full" />
                    </div>
                    <Link to="/products" className="text-primary-600 font-bold hover:underline">View All</Link>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="h-[400px] bg-gray-200 animate-pulse rounded-2xl" />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {Array.isArray(products) && products.slice(0, 8).map(product => (
                            <ProductCard key={product._id} product={product} />
                        ))}
                    </div>
                )}
            </section>
        </div>
    )
}
