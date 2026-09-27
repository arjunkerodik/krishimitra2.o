import cron from 'node-cron';
import axios from 'axios';
import { query } from '../db';
import dotenv from 'dotenv';

dotenv.config();

const AGMARKNET_API_URL = 'https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070';
const API_KEY = process.env.AGMARKNET_API_KEY;

export const syncAgmarknetData = async () => {
  if (!API_KEY) {
    console.error('AGMARKNET_API_KEY is not set. Skipping sync.');
    return;
  }

  const startTime = new Date();
  let syncLogId: number | null = null;
  
  try {
    const logRes = await query(
      `INSERT INTO sync_logs (started_at, status) VALUES ($1, $2) RETURNING id`,
      [startTime, 'pending']
    );
    syncLogId = logRes.rows[0].id;

    let records: any[] = [];
    
    if (API_KEY === 'mock-key' || !API_KEY) {
      console.log('Using mock Agmarknet data since no real API_KEY was provided...');
      records = [
        { state: 'Karnataka', district: 'Bengaluru', market: 'Yeshwanthpur', commodity: 'Onion', variety: 'Red', arrival_date: new Date().toLocaleDateString('en-GB'), min_price: 1800, max_price: 2500, modal_price: 2150 },
        { state: 'Maharashtra', district: 'Nashik', market: 'Lasalgaon', commodity: 'Onion', variety: 'Standard', arrival_date: new Date().toLocaleDateString('en-GB'), min_price: 1200, max_price: 1900, modal_price: 1600 },
        { state: 'Punjab', district: 'Amritsar', market: 'Amritsar', commodity: 'Wheat', variety: '147 Average', arrival_date: new Date().toLocaleDateString('en-GB'), min_price: 2125, max_price: 2125, modal_price: 2125 },
        { state: 'Karnataka', district: 'Kolar', market: 'Kolar', commodity: 'Tomato', variety: 'Hybrid', arrival_date: new Date().toLocaleDateString('en-GB'), min_price: 400, max_price: 800, modal_price: 600 }
      ];
    } else {
      // Fetch the real data
      const response = await axios.get(AGMARKNET_API_URL, {
        params: {
          'api-key': API_KEY,
          format: 'json',
          limit: 1000
        }
      });
      records = response.data.records;
    }
    
    if (!records || records.length === 0) {
      throw new Error('No records found in Agmarknet response.');
    }

    let upsertedCount = 0;

    for (const record of records) {
      const {
        state,
        district,
        market,
        commodity,
        variety,
        arrival_date,
        min_price,
        max_price,
        modal_price
      } = record;

      // 1. Ensure mandi exists
      let mandiRes = await query(
        `SELECT id FROM mandis WHERE agmarknet_market_name = $1`,
        [market]
      );
      
      let mandiId;
      if (mandiRes.rows.length === 0) {
        const insertRes = await query(
          `INSERT INTO mandis (name, state, district, agmarknet_market_name) 
           VALUES ($1, $2, $3, $4) RETURNING id`,
          [market, state, district, market]
        );
        mandiId = insertRes.rows[0].id;
      } else {
        mandiId = mandiRes.rows[0].id;
      }

      // 2. Format Date properly (Agmarknet often sends dd/mm/yyyy)
      let formattedDate = arrival_date;
      if (arrival_date.includes('/')) {
        const [day, month, year] = arrival_date.split('/');
        formattedDate = `${year}-${month}-${day}`;
      }

      // 3. Upsert market price
      await query(
        `INSERT INTO market_prices (mandi_id, commodity, variety, arrival_date, min_price, max_price, modal_price)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (mandi_id, commodity, variety, arrival_date) 
         DO UPDATE SET 
           min_price = EXCLUDED.min_price,
           max_price = EXCLUDED.max_price,
           modal_price = EXCLUDED.modal_price`,
        [mandiId, commodity, variety, formattedDate, min_price, max_price, modal_price]
      );
      upsertedCount++;
    }

    // Mark success
    await query(
      `UPDATE sync_logs SET completed_at = $1, records_fetched = $2, records_upserted = $3, status = $4 WHERE id = $5`,
      [new Date(), records.length, upsertedCount, 'success', syncLogId]
    );

    console.log(`Successfully synced ${upsertedCount} records from Agmarknet.`);

    // Trigger Alert Processing
    console.log('Initiating alerts for active farmers...');
    const { processAlerts } = await import('../services/alertService');
    await processAlerts();

  } catch (error: any) {
    console.error('Error syncing Agmarknet data:', error.message);
    if (syncLogId) {
      await query(
        `UPDATE sync_logs SET completed_at = $1, status = $2, error_detail = $3 WHERE id = $4`,
        [new Date(), 'failed', error.message, syncLogId]
      );
    }
  }
};

// Run daily at 1:00 AM
cron.schedule('0 1 * * *', () => {
  console.log('Running daily Agmarknet sync...');
  syncAgmarknetData();
});

// Run immediately if executed directly from terminal
if (process.argv[1] && process.argv[1].endsWith('agmarknetSync.ts')) {
  console.log('Direct execution detected. Running sync now...');
  syncAgmarknetData().then(() => process.exit(0));
}
