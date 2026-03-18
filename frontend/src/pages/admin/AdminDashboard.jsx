import { useEffect, useState } from 'react';
import { dashboardService } from '../../services/dashboardService';
import toast from 'react-hot-toast';
import { 
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer
} from 'recharts';
import { 
    DollarSign, ShoppingBag, Users, Package, AlertCircle, Clock
} from 'lucide-react';

export default function AdminDashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await dashboardService.getStats();
                console.log('Dashboard data received:', data);
                setStats(data.data);
            } catch (error) {
                console.error('Dashboard fetch error:', error);
                toast.error('Failed to load dashboard data');
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return <div className="p-20 text-center animate-pulse font-sans font-bold text-gray-500">Loading dashboard metrics...</div>;
    if (!stats) return null;

    return (
        <div className="max-w-7xl mx-auto px-4 py-10 md:py-16 font-sans">
            <div className="mb-10">
                <h1 className="text-4xl font-black text-gray-900">Dashboard Overview</h1>
                <p className="text-gray-500 mt-2 font-medium">Welcome back, here's what's happening today.</p>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <StatCard 
                    title="Total Sales" 
                    value={`$${stats.totalSales?.toFixed(2) || '0.00'}`} 
                    icon={<DollarSign className="text-green-600 h-6 w-6" />} 
                    bg="bg-green-50"
                />
                <StatCard 
                    title="Total Orders" 
                    value={stats.totalOrders} 
                    icon={<ShoppingBag className="text-blue-600 h-6 w-6" />} 
                    bg="bg-blue-50"
                />
                <StatCard 
                    title="Total Customers" 
                    value={stats.totalCustomers} 
                    icon={<Users className="text-purple-600 h-6 w-6" />} 
                    bg="bg-purple-50"
                />
                <StatCard 
                    title="Total Products" 
                    value={stats.totalProducts} 
                    icon={<Package className="text-orange-600 h-6 w-6" />} 
                    bg="bg-orange-50"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
                {/* Main Graph */}
                <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-lg transition-shadow duration-300">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-gray-900">Revenue (Last 7 Days)</h2>
                        <div className="text-sm font-bold text-gray-500 bg-gray-100 px-4 py-2 rounded-full">
                            Today: <span className="text-green-600 font-black">${stats.revenueToday?.toFixed(2) || '0.00'}</span>
                        </div>
                    </div>
                    <div className="h-80 w-full hover:opacity-90 transition-opacity">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={stats.salesGraphData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <XAxis dataKey="date" tick={{fontSize: 12, fill: '#9ca3af', fontWeight: 600}} axisLine={false} tickLine={false} />
                                <YAxis tick={{fontSize: 12, fill: '#9ca3af', fontWeight: 600}} axisLine={false} tickLine={false} tickFormatter={(val) => `$${val}`} />
                                <RechartsTooltip 
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)' }}
                                    formatter={(value) => [`$${value}`, 'Sales']}
                                />
                                <Line type="monotone" dataKey="sales" stroke="#0ea5e9" strokeWidth={4} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 8, stroke: '#0ea5e9', strokeWidth: 2, fill: '#fff' }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Secondary Info */}
                <div className="space-y-8">
                    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-lg transition-transform hover:-translate-y-1 duration-300">
                        <div className="flex items-center space-x-4 mb-6">
                            <div className="p-3 bg-red-50 text-red-600 rounded-2xl">
                                <AlertCircle className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="text-gray-400 font-black text-xs uppercase tracking-widest">Low Stock Alerts</h3>
                                <p className="text-3xl font-black text-gray-900 mt-1">{stats.lowStockAlerts?.length || 0}</p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            {stats.lowStockAlerts?.map(item => (
                                <div key={item._id} className="flex justify-between items-center text-sm border-b border-gray-50 pb-3 last:border-0 last:pb-0">
                                    <span className="font-bold text-gray-700 truncate max-w-[150px]">{item.name}</span>
                                    <span className="text-red-500 font-extrabold bg-red-50 px-2 py-1 rounded-md text-xs">{item.stock} left</span>
                                </div>
                            ))}
                            {!stats.lowStockAlerts?.length && (
                                <div className="text-gray-400 text-sm font-bold">All products well-stocked.</div>
                            )}
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-lg transition-transform hover:-translate-y-1 duration-300">
                        <div className="flex items-center space-x-4">
                            <div className="p-3 bg-yellow-50 text-yellow-600 rounded-2xl">
                                <Clock className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="text-gray-400 font-black text-xs uppercase tracking-widest">Pending Orders</h3>
                                <p className="text-3xl font-black text-gray-900 mt-1">{stats.pendingOrders || 0}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Orders */}
                <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-lg transition-shadow duration-300">
                    <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                        Recent Orders <span className="ml-3 text-xs bg-gray-100 text-gray-500 px-3 py-1 rounded-full">{stats.recentOrders?.length || 0}</span>
                    </h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50/50">
                                <tr>
                                    <th className="py-4 px-4 text-xs font-black text-gray-400 uppercase tracking-widest rounded-l-xl">Customer</th>
                                    <th className="py-4 px-4 text-xs font-black text-gray-400 uppercase tracking-widest">Amount</th>
                                    <th className="py-4 px-4 text-xs font-black text-gray-400 uppercase tracking-widest rounded-r-xl">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {stats.recentOrders?.map(order => (
                                    <tr key={order._id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="py-4 px-4 font-bold text-gray-900 truncate max-w-[150px]">{order.user?.name || 'Guest'}</td>
                                        <td className="py-4 px-4 font-black text-primary-600">${order.totalAmount}</td>
                                        <td className="py-4 px-4">
                                            <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full ${
                                                order.orderStatus === 'delivered' ? 'bg-green-100 text-green-700' :
                                                order.orderStatus === 'processing' ? 'bg-blue-100 text-blue-700' :
                                                'bg-gray-100 text-gray-700'
                                            }`}>
                                                {order.orderStatus}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {!stats.recentOrders?.length && (
                                    <tr>
                                        <td colSpan="3" className="py-8 text-center text-gray-400 font-bold">No recent orders</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Top Selling Products */}
                <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-lg transition-shadow duration-300">
                    <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                        Top Selling <span className="ml-3 text-xs bg-primary-100 text-primary-600 px-3 py-1 rounded-full">Products</span>
                    </h2>
                    <div className="space-y-4">
                        {stats.topSellingProducts?.map((product, index) => (
                            <div key={product._id} className="flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl border border-gray-100 hover:bg-gray-50 hover:border-gray-200 transition-colors">
                                <div className="flex items-center space-x-4">
                                    <div className="h-12 w-12 bg-white border border-gray-100 p-1 rounded-xl overflow-hidden shrink-0 shadow-sm">
                                        <img src={typeof product.images?.[0] === 'string' ? product.images[0] : (product.images?.[0]?.url || 'https://via.placeholder.com/40')} alt={product.name} className="h-full w-full object-contain" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900 text-sm truncate max-w-[200px]">{product.name}</p>
                                        <p className="text-xs text-primary-600 font-black mt-0.5">${product.price}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-black text-gray-700 text-sm bg-gray-200 px-3 py-1 rounded-lg inline-block">{product.sold} <span className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">sold</span></p>
                                </div>
                            </div>
                        ))}
                        {!stats.topSellingProducts?.length && (
                             <div className="py-8 text-center text-gray-400 font-bold">No sales data yet</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

const StatCard = ({ title, value, icon, bg }) => (
    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex items-center space-x-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-default group">
        <div className={`p-4 rounded-2xl ${bg} group-hover:scale-110 transition-transform duration-300`}>
            {icon}
        </div>
        <div>
            <h3 className="text-gray-400 font-black text-xs uppercase tracking-widest mb-1.5">{title}</h3>
            <p className="text-3xl font-black text-gray-900 tracking-tight">{value}</p>
        </div>
    </div>
);
