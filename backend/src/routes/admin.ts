import { Router } from 'express';
import { query } from '../db';
import { processAlerts } from '../services/alertService';

const router = Router();

// In a real app, this router would be protected by an admin JWT / API Key middleware

// GET /api/admin/stats
router.get('/stats', async (req, res) => {
  try {
    const activeFarmersRes = await query(`SELECT COUNT(*) FROM farmers WHERE is_active = true`);
    const totalMandisRes = await query(`SELECT COUNT(*) FROM mandis`);
    const alertsSentRes = await query(`SELECT COUNT(*) FROM alerts_log WHERE status = 'sent' AND sent_at >= NOW() - INTERVAL '30 days'`);
    const syncLogsRes = await query(`SELECT * FROM sync_logs ORDER BY started_at DESC LIMIT 5`);

    res.json({
      active_farmers: parseInt(activeFarmersRes.rows[0].count),
      total_mandis_covered: parseInt(totalMandisRes.rows[0].count),
      alerts_sent_last_30d: parseInt(alertsSentRes.rows[0].count),
      recent_syncs: syncLogsRes.rows
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/admin/farmers
router.get('/farmers', async (req, res) => {
  try {
    const result = await query(`
      SELECT f.id, f.name, f.phone_number, f.phone_verified, f.is_active, 
             f.preferred_commodity, m.name as mandi_name, f.consent_sms, f.consent_whatsapp, f.created_at
      FROM farmers f
      LEFT JOIN mandis m ON f.preferred_mandi_id = m.id
      ORDER BY f.created_at DESC
      LIMIT 100
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Admin farmers fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/admin/alerts-log
router.get('/alerts-log', async (req, res) => {
  try {
    const result = await query(`
      SELECT a.id, f.name as farmer_name, a.channel, a.status, a.sent_at, a.error_reason 
      FROM alerts_log a
      JOIN farmers f ON a.farmer_id = f.id
      ORDER BY a.sent_at DESC
      LIMIT 100
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Admin alerts log error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/admin/alerts/broadcast
router.post('/alerts/broadcast', async (req, res) => {
  // Triggers manual evaluation of alerts (for testing/ops)
  try {
    await processAlerts();
    res.json({ message: 'Broadcast processing initiated successfully' });
  } catch (error) {
    console.error('Admin broadcast error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
