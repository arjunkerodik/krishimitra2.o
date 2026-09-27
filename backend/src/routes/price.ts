import { Router } from 'express';
import { query } from '../db';

const router = Router();

// GET /api/prices?state=&district=&market=&commodity=&date=
router.get('/', async (req, res) => {
  const { state, district, market, commodity, date } = req.query;

  try {
    let sql = `
      SELECT mp.*, m.name as mandi_name, m.district, m.state 
      FROM market_prices mp
      JOIN mandis m ON mp.mandi_id = m.id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramIndex = 1;

    if (state) {
      sql += ` AND m.state ILIKE $${paramIndex++}`;
      params.push(`%${state}%`);
    }
    if (district) {
      sql += ` AND m.district ILIKE $${paramIndex++}`;
      params.push(`%${district}%`);
    }
    if (market) {
      sql += ` AND m.name ILIKE $${paramIndex++}`;
      params.push(`%${market}%`);
    }
    if (commodity) {
      sql += ` AND mp.commodity ILIKE $${paramIndex++}`;
      params.push(`%${commodity}%`);
    }
    if (date) {
      sql += ` AND mp.arrival_date = $${paramIndex++}`;
      params.push(date);
    }

    sql += ` ORDER BY mp.arrival_date DESC LIMIT 100`;

    const result = await query(sql, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Prices fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/prices/:mandiId/:commodity/trend?range=7d|30d|1y
router.get('/:mandiId/:commodity/trend', async (req, res) => {
  const { mandiId, commodity } = req.params;
  const { range } = req.query; // '7d', '30d', '1y'

  let days = 30;
  if (range === '7d') days = 7;
  else if (range === '1y') days = 365;

  try {
    const result = await query(
      `SELECT arrival_date, min_price, max_price, modal_price 
       FROM market_prices 
       WHERE mandi_id = $1 AND commodity ILIKE $2 
         AND arrival_date >= NOW() - INTERVAL '${days} days'
       ORDER BY arrival_date ASC`,
      [mandiId, commodity]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Trend fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/prices/:mandiId/:commodity/profit-loss?cost_price=
router.get('/:mandiId/:commodity/profit-loss', async (req, res) => {
  const { mandiId, commodity } = req.params;
  const cost_price = parseFloat(req.query.cost_price as string);

  if (isNaN(cost_price)) {
    return res.status(400).json({ error: 'Invalid cost_price parameter' });
  }

  try {
    const result = await query(
      `SELECT modal_price, arrival_date 
       FROM market_prices 
       WHERE mandi_id = $1 AND commodity ILIKE $2 
       ORDER BY arrival_date DESC LIMIT 1`,
      [mandiId, commodity]
    );

    if (result.rows.length === 0) {
      return res.json({ error: 'No recent prices found for this commodity at this mandi.' });
    }

    const currentPrice = result.rows[0].modal_price;
    const profitLoss = currentPrice - cost_price;
    const profitMarginPercentage = ((profitLoss) / cost_price) * 100;

    res.json({
      current_price: currentPrice,
      cost_price: cost_price,
      profit_loss_absolute: profitLoss.toFixed(2),
      profit_margin_percentage: profitMarginPercentage.toFixed(2),
      is_profitable: profitLoss > 0,
      last_updated: result.rows[0].arrival_date
    });

  } catch (error) {
    console.error('P/L calc error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
