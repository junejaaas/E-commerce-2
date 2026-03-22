import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { dashboardService } from '../../services/dashboardService';
import toast from 'react-hot-toast';
import { 
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { 
    DollarSign, ShoppingBag, Users, Package, AlertCircle, Clock, TrendingUp, PieChart as PieChartIcon, 
    MousePointer2, Share2, Target, ArrowUpRight
} from 'lucide-react';

const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

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
            {/* Header */}
            <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight">Executive Dashboard</h1>
                    <p className="text-gray-500 mt-2 font-medium">Real-time business intelligence and operational alerts.</p>
                </div>
                <div className="flex flex-wrap gap-4">
                    <div className="bg-white px-5 py-3 rounded-2xl border border-gray-100 shadow-sm flex items-center space-x-3">
                        <Target className="text-primary-600 h-5 w-5" />
                        <div>
                            <p className="text-[10px] uppercase font-black text-gray-400 tracking-widest leading-none mb-1">Conv. Rate</p>
                            <p className="text-lg font-black text-gray-900 leading-none">{stats.conversionRate || 0}%</p>
                        </div>
                    </div>
                    <div className="bg-primary-600 px-5 py-3 rounded-2xl shadow-lg shadow-primary-100 flex items-center space-x-3">
                        <DollarSign className="text-white h-5 w-5" />
                        <div>
                            <p className="text-[10px] uppercase font-black text-white/70 tracking-widest leading-none mb-1">Today's Revenue</p>
                            <p className="text-lg font-black text-white leading-none">${stats.revenueToday?.toFixed(0) || 0}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Top Operational Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <StatCard 
                    title="Total Revenue" 
                    value={`$${stats.totalSales?.toFixed(2) || '0.00'}`} 
                    icon={<DollarSign className="text-green-600 h-6 w-6" />} 
                    bg="bg-green-50"
                />
                <StatCard 
                    title="Active Orders" 
                    value={stats.totalOrders} 
                    icon={<ShoppingBag className="text-blue-600 h-6 w-6" />} 
                    bg="bg-blue-50"
                />
                <StatCard 
                    title="Pending Action" 
                    value={stats.pendingOrders || 0} 
                    icon={<Clock className="text-yellow-600 h-6 w-6" />} 
                    bg="bg-yellow-50"
                    isAlert={stats.pendingOrders > 0}
                />
                <StatCard 
                    title="Stock Alerts" 
                    value={stats.lowStockAlerts?.length || 0} 
                    icon={<AlertCircle className="text-red-600 h-6 w-6" />} 
                    bg="bg-red-50"
                    isAlert={stats.lowStockAlerts?.length > 0}
                />
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
                {/* Daily Revenue Graph (Restored) */}
                <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-lg transition-shadow duration-300">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Daily Sales</h2>
                            <p className="text-sm font-medium text-gray-400">Past 7 days performance</p>
                        </div>
                        <div className="flex items-center space-x-2 text-green-600 bg-green-50 px-3 py-1 rounded-full text-xs font-black">
                            <ArrowUpRight className="h-4 w-4" />
                            <span>Trending Up</span>
                        </div>
                    </div>
                    <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={stats.salesGraphData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <XAxis dataKey="date" tick={{fontSize: 10, fill: '#9ca3af', fontWeight: 600}} axisLine={false} tickLine={false} />
                                <YAxis tick={{fontSize: 10, fill: '#9ca3af', fontWeight: 600}} axisLine={false} tickLine={false} tickFormatter={(val) => `$${val}`} />
                                <RechartsTooltip 
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}
                                    formatter={(value) => [`$${value}`, 'Sales']}
                                />
                                <Line type="monotone" dataKey="sales" stroke="#0ea5e9" strokeWidth={4} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 8, stroke: '#0ea5e9', strokeWidth: 2, fill: '#fff' }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Sidebar: Operational Lists (Restored) */}
                <div className="space-y-8">
                    {/* Low Stock Alerts List */}
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300">
                        <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center">
                            <AlertCircle className="mr-2 h-4 w-4 text-red-500" /> Critical Stock
                        </h3>
                        <div className="space-y-4">
                            {stats.lowStockAlerts?.map(item => (
                                <div key={item._id} className="flex justify-between items-center p-3 hover:bg-red-50 rounded-2xl transition-colors group">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 rounded-lg overflow-hidden bg-gray-50 border border-gray-100 p-1">
                                            <img src={typeof item.images?.[0] === 'string' ? item.images[0] : (item.images?.[0]?.url || 'https://via.placeholder.com/40')} alt="" className="w-full h-full object-contain" />
                                        </div>
                                        <span className="font-bold text-gray-700 text-sm truncate max-w-[120px]">{item.name}</span>
                                    </div>
                                    <span className="text-red-500 font-black bg-red-100/50 px-2 py-1 rounded-md text-[10px] uppercase">{item.stock} left</span>
                                </div>
                            ))}
                            {!stats.lowStockAlerts?.length && (
                                <div className="py-6 text-center text-gray-400 text-xs font-bold">All items well stocked.</div>
                            )}
                        </div>
                    </div>

                    {/* Pending Activity */}
                    <div className="bg-gradient-to-br from-primary-600 to-primary-700 p-6 rounded-3xl shadow-xl shadow-primary-200 text-white">
                        <h3 className="text-[10px] font-black text-white/60 uppercase tracking-widest mb-2">Pending Orders</h3>
                        <div className="flex items-end justify-between">
                            <p className="text-4xl font-black">{stats.pendingOrders || 0}</p>
                            <Link to="/admin/orders" className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl text-xs font-black transition-colors">Process Now</Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Analytics Section */}
            <h2 className="text-2xl font-black text-gray-900 mb-8 flex items-center">
                Business Intelligence <div className="ml-4 h-1 flex-grow bg-gray-100 rounded-full" />
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-10">
                {/* Monthly Revenue Bar Chart */}
                <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Revenue Trend</h3>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.monthlyRevenue}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <XAxis dataKey="_id" tick={{fontSize: 10, fill: '#9ca3af'}} axisLine={false} tickLine={false} />
                                <YAxis hide />
                                <RechartsTooltip 
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}
                                />
                                <Bar dataKey="revenue" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Category Performance */}
                <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center justify-between">
                        Categories <span className="text-xs font-black text-primary-500 uppercase">by Sales</span>
                    </h3>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={stats.categoryPerformance}
                                    cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={5}
                                    dataKey="sales"
                                >
                                    {stats.categoryPerformance?.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <RechartsTooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Traffic Sources */}
                <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Traffic Sources</h3>
                    <div className="space-y-4 pt-2">
                        {stats.trafficSources?.map((source, index) => (
                            <div key={source._id} className="space-y-1.5">
                                <div className="flex justify-between text-xs font-bold">
                                    <span className="text-gray-600">{source._id}</span>
                                    <span className="text-gray-400">{source.count}</span>
                                </div>
                                <div className="w-full bg-gray-50 rounded-full h-1.5 overflow-hidden">
                                    <div 
                                        className="h-full rounded-full transition-all duration-1000" 
                                        style={{ 
                                            width: `${(source.count / stats.trafficSources[0].count) * 100}%`,
                                            backgroundColor: COLORS[index % COLORS.length]
                                        }} 
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom Row: Performance & Recent Orders */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Orders Table */}
                <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                    <h2 className="text-xl font-bold text-gray-900 mb-8">Recent Orders</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-gray-50">
                                    <th className="py-4 font-black text-gray-400 text-[10px] uppercase tracking-widest">Customer</th>
                                    <th className="py-4 font-black text-gray-400 text-[10px] uppercase tracking-widest">Amount</th>
                                    <th className="py-4 font-black text-gray-400 text-[10px] uppercase tracking-widest">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {stats.recentOrders?.map(order => (
                                    <tr key={order._id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="py-5 font-bold text-gray-900">{order.user?.name || 'Guest'}</td>
                                        <td className="py-5 font-black text-primary-600">${order.totalAmount}</td>
                                        <td className="py-5 text-right lg:text-left">
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
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Top Selling Products List */}
                <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                    <h2 className="text-xl font-bold text-gray-900 mb-8">Top Selling Products</h2>
                    <div className="space-y-4">
                        {stats.topSellingProducts?.map((product, index) => (
                            <div key={product._id} className="flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl border border-gray-100 hover:border-gray-200 transition-all">
                                <div className="flex items-center space-x-4">
                                    <div className="h-12 w-12 bg-white border border-gray-100 p-1 rounded-xl shrink-0">
                                        <img src={typeof product.images?.[0] === 'string' ? product.images[0] : (product.images?.[0]?.url || 'https://via.placeholder.com/40')} alt="" className="h-full w-full object-contain" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900 text-sm truncate max-w-[150px]">{product.name}</p>
                                        <p className="text-xs text-primary-600 font-extrabold mt-0.5">${product.price}</p>
                                    </div>
                                </div>
                                <p className="font-black text-gray-700 text-sm">{product.sold} <span className="text-xs font-bold text-gray-400 uppercase">sold</span></p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

const getFontSize = (text) => {
    const len = String(text).length;
    if (len > 15) return 'text-lg';
    if (len > 12) return 'text-xl';
    if (len > 10) return 'text-2xl';
    return 'text-3xl';
};

const StatCard = ({ title, value, icon, bg, isAlert }) => (
    <div className={`bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center space-x-4 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-default group ${isAlert ? 'ring-2 ring-red-100 bg-red-50/10' : ''}`}>
        <div className={`p-3 rounded-2xl ${bg} group-hover:scale-110 transition-transform duration-300 ${isAlert ? 'animate-pulse' : ''} shrink-0`}>
            {icon}
        </div>
        <div className="flex-1 min-w-0">
            <h3 className="text-gray-400 font-black text-[10px] uppercase tracking-widest leading-none mb-1.5">{title}</h3>
            <p className={`${getFontSize(value)} font-black text-gray-900 tracking-tight leading-none transition-all duration-300`}>{value}</p>
        </div>
    </div>
);
