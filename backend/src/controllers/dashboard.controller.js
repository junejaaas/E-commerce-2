const Order = require('../models/order.model');
const Product = require('../models/product.model');
const User = require('../models/user.model');
const catchAsync = require('../utils/catchAsync');

exports.getDashboardStats = catchAsync(async (req, res, next) => {
    console.log('Dashboard stats requested by:', req.user?.email);

    // Basic stats
    const totalOrders = await Order.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalCustomers = await User.countDocuments({ role: 'user' });

    console.log('Basic stats:', { totalOrders, totalProducts, totalCustomers });

    // Revenue calculations - exclude failed/cancelled
    const orders = await Order.find({ 
        paymentStatus: { $ne: 'failed' }, 
        orderStatus: { $ne: 'cancelled' } 
    });
    const totalSales = orders.reduce((acc, order) => acc + (order.totalAmount || 0), 0);

    // Revenue today & this week
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());

    const todayOrders = orders.filter(o => new Date(o.createdAt) >= today);
    const revenueToday = todayOrders.reduce((acc, order) => acc + (order.totalAmount || 0), 0);

    const weekOrders = orders.filter(o => new Date(o.createdAt) >= startOfWeek);
    const revenueThisWeek = weekOrders.reduce((acc, order) => acc + (order.totalAmount || 0), 0);

    // Other stats
    const pendingOrders = await Order.countDocuments({ orderStatus: { $in: ['processing'] } });
    const lowStockAlerts = await Product.find({ stock: { $lt: 10 } })
        .select('name stock price images')
        .limit(5)
        .lean();

    // Top selling
    const topSellingProducts = await Product.find()
        .sort({ sold: -1 })
        .select('name sold price images')
        .limit(5)
        .lean();

    // Recent orders
    const recentOrders = await Order.find()
        .sort({ createdAt: -1 })
        .populate('user', 'name email profilePicture')
        .limit(5)
        .lean();

    // Sales graph (last 7 days)
    const last7Days = new Date(today);
    last7Days.setDate(today.getDate() - 6);

    let salesGraphData = [];
    try {
        const salesGraphDataRaw = await Order.aggregate([
            {
                $match: {
                    paymentStatus: { $ne: 'failed' },
                    orderStatus: { $ne: 'cancelled' },
                    createdAt: { $gte: last7Days }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    sales: { $sum: "$totalAmount" },
                    orders: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Fill in missing days with 0
        for (let i = 0; i < 7; i++) {
            const d = new Date(last7Days);
            d.setDate(last7Days.getDate() + i);
            const dateStr = d.toISOString().split('T')[0];
            const existingData = salesGraphDataRaw.find(item => item._id === dateStr);
            salesGraphData.push({
                date: dateStr,
                sales: existingData ? existingData.sales : 0,
                orders: existingData ? existingData.orders : 0
            });
        }
    } catch (aggErr) {
        console.error('Dashboard aggregation error:', aggErr);
        // Provide empty graph data on error
        for (let i = 0; i < 7; i++) {
            const d = new Date(last7Days);
            d.setDate(last7Days.getDate() + i);
            salesGraphData.push({
                date: d.toISOString().split('T')[0],
                sales: 0,
                orders: 0
            });
        }
    }

    // Order statistics
    let orderStats = {};
    try {
        const orderStatsRaw = await Order.aggregate([
            {
                $group: {
                    _id: "$orderStatus",
                    count: { $sum: 1 }
                }
            }
        ]);
        orderStats = orderStatsRaw.reduce((acc, curr) => {
            acc[curr._id] = curr.count;
            return acc;
        }, {});
    } catch (aggErr) {
        console.error('Order stats aggregation error:', aggErr);
    }

    console.log('Dashboard stats computed successfully');

    res.status(200).json({
        status: 'success',
        data: {
            totalSales,
            totalOrders,
            totalCustomers,
            totalProducts,
            revenueToday,
            revenueThisWeek,
            pendingOrders,
            lowStockAlerts,
            topSellingProducts,
            recentOrders,
            salesGraphData,
            orderStats
        }
    });
});
