import { Router } from 'express';
import { query } from '../db';

const router = Router();

// GET /api/pharmacy/products
router.get('/products', async (req, res) => {
  try {
    const result = await query(`
      SELECT id, name, category, price, image_icon, delivery_time_mins, in_stock 
      FROM products 
      WHERE in_stock = true
      ORDER BY category, name
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Products fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/pharmacy/order
router.post('/order', async (req, res) => {
  // In a real app, farmer_id is extracted from the JWT auth token
  const { farmer_id, mandi_hub_id, items } = req.body;
  
  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'No items in order' });
  }

  try {
    // Calculate total and fetch current prices
    let totalAmount = 0;
    const orderItemsToInsert = [];

    for (const item of items) {
      const productRes = await query(`SELECT price FROM products WHERE id = $1 AND in_stock = true`, [item.product_id]);
      
      if (productRes.rows.length === 0) {
        return res.status(400).json({ error: \`Product \${item.product_id} not available\` });
      }

      const priceAtTime = parseFloat(productRes.rows[0].price);
      totalAmount += (priceAtTime * item.quantity);
      
      orderItemsToInsert.push({
        product_id: item.product_id,
        quantity: item.quantity,
        price_at_time: priceAtTime
      });
    }

    // Insert Order
    const orderRes = await query(
      `INSERT INTO orders (farmer_id, mandi_hub_id, total_amount, status) 
       VALUES ($1, $2, $3, 'pending') RETURNING id`,
      [farmer_id, mandi_hub_id, totalAmount]
    );

    const orderId = orderRes.rows[0].id;

    // Insert Order Items
    for (const oi of orderItemsToInsert) {
      await query(
        `INSERT INTO order_items (order_id, product_id, quantity, price_at_time) 
         VALUES ($1, $2, $3, $4)`,
        [orderId, oi.product_id, oi.quantity, oi.price_at_time]
      );
    }

    // In a real app, we might trigger a WebSocket event to the HubPortal here to notify the agent of a new order

    res.json({ message: 'Order placed successfully', order_id: orderId, total_amount: totalAmount });
  } catch (error) {
    console.error('Order placement error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/pharmacy/orders/hub/:hubId
// Used by the APMC Hub operator to view pending orders
router.get('/orders/hub/:hubId', async (req, res) => {
  const { hubId } = req.params;
  try {
    const ordersRes = await query(`
      SELECT o.id, o.total_amount, o.status, o.created_at, f.name as farmer_name, f.phone_number
      FROM orders o
      LEFT JOIN farmers f ON o.farmer_id = f.id
      WHERE o.mandi_hub_id = $1
      ORDER BY o.created_at DESC
      LIMIT 50
    `, [hubId]);

    // For a production app, we would also fetch and attach the order_items here
    res.json(ordersRes.rows);
  } catch (error) {
    console.error('Hub orders fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
