const { query } = require('../config/db');

// @desc    Get dashboard metrics & analytics (Admin only)
// @route   GET /api/admin/stats
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
  try {
    // 1. Total Sales Revenue
    const salesData = await query.get("SELECT SUM(total_amount) as totalSales FROM orders WHERE status != 'Cancelled'");
    const totalSales = salesData.totalSales || 0;

    // 2. Total Orders count
    const ordersData = await query.get('SELECT COUNT(*) as totalOrders FROM orders');
    const totalOrders = ordersData.totalOrders || 0;

    // 3. Total Users count
    const usersData = await query.get("SELECT COUNT(*) as totalUsers FROM users WHERE role = 'user'");
    const totalUsers = usersData.totalUsers || 0;

    // 4. Total Products count
    const productsData = await query.get('SELECT COUNT(*) as totalProducts FROM products');
    const totalProducts = productsData.totalProducts || 0;

    // 5. Recent 5 Orders with customer names
    const recentOrders = await query.all(`
      SELECT o.id, o.total_amount, o.status, o.created_at, u.name as customer_name
      FROM orders o
      JOIN users u ON o.user_id = u.id
      ORDER BY o.id DESC
      LIMIT 5
    `);

    res.json({
      metrics: {
        totalSales: Number(totalSales.toFixed(2)),
        totalOrders,
        totalUsers,
        totalProducts
      },
      recentOrders
    });
  } catch (error) {
    console.error('Fetch admin stats error:', error.message);
    res.status(500).json({ message: 'Server error generating dashboard statistics' });
  }
};

// @desc    Get all orders (Admin only)
// @route   GET /api/admin/orders
// @access  Private/Admin
const getAllOrders = async (req, res) => {
  try {
    // Get all orders with user names
    const orders = await query.all(`
      SELECT o.*, u.name as customer_name, u.email as customer_email
      FROM orders o
      JOIN users u ON o.user_id = u.id
      ORDER BY o.id DESC
    `);

    const ordersWithItems = [];
    for (const order of orders) {
      const items = await query.all(`
        SELECT oi.*, p.name as product_name, p.image_url 
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = ?
      `, [order.id]);

      ordersWithItems.push({
        ...order,
        items
      });
    }

    res.json(ordersWithItems);
  } catch (error) {
    console.error('Fetch all orders error:', error.message);
    res.status(500).json({ message: 'Server error fetching customer orders' });
  }
};

// @desc    Update order status (Admin only)
// @route   PUT /api/admin/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ message: 'Please specify status' });
  }

  const validStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid order status' });
  }

  try {
    const order = await query.get('SELECT * FROM orders WHERE id = ?', [id]);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    await query.run('UPDATE orders SET status = ? WHERE id = ?', [status, id]);
    res.json({ message: `Order status updated to ${status}` });
  } catch (error) {
    console.error('Update order status error:', error.message);
    res.status(500).json({ message: 'Server error updating order status' });
  }
};

module.exports = {
  getDashboardStats,
  getAllOrders,
  updateOrderStatus
};
