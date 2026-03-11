import { Facebook, Twitter, Instagram, Youtube } from 'lucide-react'

export default function Footer() {
    return (
        <footer className="bg-gray-900 text-white py-12 mt-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-blue-500 bg-clip-text text-transparent">E-SHOP</h2>
                        <p className="text-gray-400 text-sm">
                            Your one-stop destination for premium tech and lifestyle products. We deliver quality and happiness to your doorstep.
                        </p>
                        <div className="flex space-x-4">
                            <Facebook className="h-5 w-5 text-gray-400 hover:text-white cursor-pointer" />
                            <Twitter className="h-5 w-5 text-gray-400 hover:text-white cursor-pointer" />
                            <Instagram className="h-5 w-5 text-gray-400 hover:text-white cursor-pointer" />
                            <Youtube className="h-5 w-5 text-gray-400 hover:text-white cursor-pointer" />
                        </div>
                    </div>

                    <div>
                        <h3 className="font-bold text-lg mb-4">Quick Links</h3>
                        <ul className="space-y-2 text-gray-400 text-sm">
                            <li className="hover:text-white cursor-pointer">About Us</li>
                            <li className="hover:text-white cursor-pointer">Shop Products</li>
                            <li className="hover:text-white cursor-pointer">Categories</li>
                            <li className="hover:text-white cursor-pointer">Contact Us</li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-bold text-lg mb-4">Customer Care</h3>
                        <ul className="space-y-2 text-gray-400 text-sm">
                            <li className="hover:text-white cursor-pointer">My Account</li>
                            <li className="hover:text-white cursor-pointer">Order History</li>
                            <li className="hover:text-white cursor-pointer">Wishlist</li>
                            <li className="hover:text-white cursor-pointer">Shipping Policy</li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-bold text-lg mb-4">Newsletter</h3>
                        <p className="text-gray-400 text-sm mb-4">Subscribe to get updates on new products and offers.</p>
                        <div className="flex">
                            <input
                                type="email"
                                placeholder="Enter email"
                                className="bg-gray-800 border-none rounded-l-lg px-4 py-2 w-full focus:ring-1 focus:ring-primary-500 text-sm"
                            />
                            <button className="bg-primary-600 px-4 py-2 rounded-r-lg hover:bg-primary-700 transition-colors">
                                Join
                            </button>
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-500 text-sm">
                    <p>© {new Date().getFullYear()} E-SHOP. All rights reserved.</p>
                </div>
            </div>
        </footer>
    )
}
