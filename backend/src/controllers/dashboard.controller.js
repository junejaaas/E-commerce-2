const Order = require('../models/order.model');
const Product = require('../models/product.model');
const User = require('../models/user.model');
const Analytics = require('../models/analytics.model');
const Category = require('../models/category.model');
const catchAsync = require('../utils/catchAsync');
const Notification = require('../models/notification.model');
const { createNotification } = require('./notification.controller');

exports.trackVisit = catchAsync(async (req, res, next) => {
    const { pageType, productId, visitorId, referrer } = req.body;
    
    await Analytics.create({
        pageType,
        productId,
        visitorId,
        referrer: referrer || 'Direct',
        userAgent: req.headers['user-agent'],
        ip: req.ip
    });

    res.status(200).json({ status: 'success' });
});

exports.getDashboardStats = catchAsync(async (req, res, next) => {
    console.log('Dashboard stats requested by:', req.user?.email);

    // Basic stats
    const totalOrders = await Order.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalCustomers = await User.countDocuments({ role: 'user' });

    console.log('Basic stats:', { totalOrders, totalProducts, totalCustomers });

    // Revenue calculations - ONLY include paid orders
    const orders = await Order.find({ 
        paymentStatus: 'paid', 
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

    // Backfill: Create notifications for these low stock items if they don't exist
    const io = req.app.get('io');
    for (const prod of lowStockAlerts) {
        const existingNote = await Notification.findOne({
            type: 'LOW_INVENTORY',
            'metadata.productId': prod._id,
            isRead: false
        });

        if (!existingNote) {
            await createNotification(io, {
                recipientType: 'admin',
                type: 'LOW_INVENTORY',
                title: 'Existing Low Stock',
                message: `Product "${prod.name}" is currently low on stock (${prod.stock} left).`,
                metadata: { productId: prod._id, stock: prod.stock, productName: prod.name }
            });
        }
    }

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
                    paymentStatus: 'paid',
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

    // 1. Monthly Revenue (Last 12 Months)
    const lastYear = new Date();
    lastYear.setFullYear(lastYear.getFullYear() - 1);
    lastYear.setDate(1); // Start of month
    
    const monthlyRevenue = await Order.aggregate([
        {
            $match: {
                paymentStatus: 'paid',
                createdAt: { $gte: lastYear }
            }
        },
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
                revenue: { $sum: "$totalAmount" },
                orders: { $sum: 1 }
            }
        },
        { $sort: { _id: 1 } }
    ]);

    // 2. Customer Growth (Last 30 Days)
    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);
    
    const customerGrowth = await User.aggregate([
        {
            $match: {
                role: 'user',
                createdAt: { $gte: last30Days }
            }
        },
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                count: { $sum: 1 }
            }
        },
        { $sort: { _id: 1 } }
    ]);

    // 3. Category Performance
    const categoryPerformance = await Order.aggregate([
        { $match: { paymentStatus: 'paid' } },
        { $unwind: "$items" },
        {
            $lookup: {
                from: "products",
                localField: "items.product",
                foreignField: "_id",
                as: "productDetails"
            }
        },
        { $unwind: "$productDetails" },
        {
            $group: {
                _id: "$productDetails.category",
                sales: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
                orders: { $sum: 1 }
            }
        },
        {
            $lookup: {
                from: "categories",
                localField: "_id",
                foreignField: "_id",
                as: "categoryInfo"
            }
        },
        { $unwind: "$categoryInfo" },
        {
            $project: {
                name: "$categoryInfo.name",
                sales: 1,
                orders: 1
            }
        },
        { $sort: { sales: -1 } }
    ]);

    // 4. Conversion Rate & Traffic Sources
    const totalVisits = await Analytics.countDocuments();
    const uniqueVisitors = (await Analytics.distinct('visitorId')).length;
    const paidOrdersCount = await Order.countDocuments({ paymentStatus: 'paid' });
    
    const conversionRate = uniqueVisitors > 0 ? (paidOrdersCount / uniqueVisitors) * 100 : 0;
    
    const trafficSources = await Analytics.aggregate([
        {
            $group: {
                _id: "$referrer",
                count: { $sum: 1 }
            }
        },
        { $sort: { count: -1 } },
        { $limit: 5 }
    ]);

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
            orderStats,
            monthlyRevenue,
            customerGrowth,
            categoryPerformance,
            conversionRate: conversionRate.toFixed(2),
            trafficSources
        }
    });
});
