import { Router } from 'express';
import { query } from '../db';

const router = Router();

// GET /api/mandis/search?q=
router.get('/search', async (req, res) => {
  const searchQuery = req.query.q;
  
  if (!searchQuery || typeof searchQuery !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid search query' });
  }

  try {
    const result = await query(
      `SELECT id, name, state, district, agmarknet_market_name 
       FROM mandis 
       WHERE name ILIKE $1 OR district ILIKE $1 OR state ILIKE $1
       LIMIT 50`,
      [`%${searchQuery}%`]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Mandi search error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/mandis
router.get('/', async (req, res) => {
  try {
    const result = await query(
      `SELECT id, name, state, district, agmarknet_market_name FROM mandis ORDER BY state, district, name`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Mandi fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
