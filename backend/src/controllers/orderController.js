const { query } = require('../config/db');

// @desc    Create a new order (Checkout)
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res) => {
  const { cartItems } = req.body;
  const userId = req.user.id;

  if (!cartItems || cartItems.length === 0) {
    return res.status(400).json({ message: 'No items in the cart' });
  }

  try {
    let totalAmount = 0;
    const validatedItems = [];

    // 1. Validate stock and calculate prices
    for (const item of cartItems) {
      const product = await query.get('SELECT id, name, price, stock FROM products WHERE id = ?', [item.id]);
      
      if (!product) {
        return res.status(404).json({ message: `Product with ID ${item.id} not found` });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for product: ${product.name}. Available: ${product.stock}` });
      }

      const itemTotal = product.price * item.quantity;
      totalAmount += itemTotal;

      validatedItems.push({
        id: product.id,
        name: product.name,
        quantity: item.quantity,
        price: product.price,
        newStock: product.stock - item.quantity
      });
    }

    // 2. Insert order
    const orderResult = await query.run(
      'INSERT INTO orders (user_id, total_amount, status) VALUES (?, ?, ?)',
      [userId, totalAmount, 'Processing']
    );
    const orderId = orderResult.id;

    // 3. Insert order items & update product stock
    for (const item of validatedItems) {
      // Create order item
      await query.run(
        'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
        [orderId, item.id, item.quantity, item.price]
      );

      // Decrement stock
      await query.run(
        'UPDATE products SET stock = ? WHERE id = ?',
        [item.newStock, item.id]
      );
    }

    res.status(201).json({
      message: 'Order created successfully',
      orderId,
      totalAmount
    });
  } catch (error) {
    console.error('Create order error:', error.message);
    res.status(500).json({ message: 'Server error creating order' });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = async (req, res) => {
  const userId = req.user.id;
  try {
    // Get user orders sorted by date
    const orders = await query.all('SELECT * FROM orders WHERE user_id = ? ORDER BY id DESC', [userId]);

    // For each order, fetch its items
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
    console.error('Fetch my orders error:', error.message);
    res.status(500).json({ message: 'Server error fetching your orders' });
  }
};

module.exports = {
  createOrder,
  getMyOrders
};
