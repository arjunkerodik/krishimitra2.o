import axios from 'axios';
import { query } from '../db';

const MSG91_AUTH_KEY = process.env.MSG91_AUTH_KEY;
const WHATSAPP_API_TOKEN = process.env.WHATSAPP_API_TOKEN;
const WHATSAPP_PHONE_ID = process.env.WHATSAPP_PHONE_ID;

/**
 * Sends a WhatsApp message via Meta Cloud API using pre-approved templates
 */
const sendWhatsAppAlert = async (phoneNumber: string, farmerName: string, commodity: string, price: string, mandi: string) => {
  if (!WHATSAPP_API_TOKEN || !WHATSAPP_PHONE_ID) {
    console.warn(`[Mock WhatsApp] To: ${phoneNumber} | MSG: Hello ${farmerName}, ${commodity} price at ${mandi} is now ₹${price}.`);
    return { status: 'sent', provider_id: 'mock-wa-' + Date.now() };
  }

  try {
    const response = await axios.post(
      `https://graph.facebook.com/v17.0/${WHATSAPP_PHONE_ID}/messages`,
      {
        messaging_product: 'whatsapp',
        to: phoneNumber.replace('+', ''),
        type: 'template',
        template: {
          name: 'krishimitra_price_alert', // Must be pre-approved in Meta Business Manager
          language: { code: 'en' }, // Extend with farmer's language_preference
          components: [
            {
              type: 'body',
              parameters: [
                { type: 'text', text: farmerName },
                { type: 'text', text: commodity },
                { type: 'text', text: price },
                { type: 'text', text: mandi }
              ]
            }
          ]
        }
      },
      {
        headers: { Authorization: `Bearer ${WHATSAPP_API_TOKEN}` }
      }
    );
    return { status: 'sent', provider_id: response.data.messages[0].id };
  } catch (error: any) {
    console.error('WhatsApp sending failed:', error?.response?.data || error.message);
    throw new Error(error?.response?.data?.error?.message || 'WhatsApp sending failed');
  }
};

/**
 * Sends an SMS via MSG91 (DLT Compliant)
 */
const sendSMSAlert = async (phoneNumber: string, farmerName: string, commodity: string, price: string, mandi: string) => {
  if (!MSG91_AUTH_KEY) {
    console.warn(`[Mock SMS] To: ${phoneNumber} | MSG: KrishiMitra Alert: ${commodity} at ${mandi} is ₹${price}.`);
    return { status: 'sent', provider_id: 'mock-sms-' + Date.now() };
  }

  try {
    // MSG91 DLT compliant payload
    const response = await axios.post(
      'https://api.msg91.com/api/v5/flow/',
      {
        template_id: 'dlt_approved_template_id_here',
        short_url: '0',
        recipients: [
          {
            mobiles: `91${phoneNumber}`,
            farmer_name: farmerName,
            commodity: commodity,
            price: price,
            mandi: mandi
          }
        ]
      },
      {
        headers: {
          authkey: MSG91_AUTH_KEY,
          'Content-Type': 'application/json'
        }
      }
    );
    return { status: 'sent', provider_id: response.data.message };
  } catch (error: any) {
    console.error('SMS sending failed:', error?.response?.data || error.message);
    throw new Error(error?.response?.data?.message || 'SMS sending failed');
  }
};

/**
 * Evaluates active farmers and sends alerts based on their profit thresholds
 */
export const processAlerts = async () => {
  console.log('Starting alert processing for all active farmers...');
  
  try {
    // Get all active farmers who have opted in to either SMS or WhatsApp
    const farmersRes = await query(`
      SELECT f.*, m.name as mandi_name 
      FROM farmers f
      JOIN mandis m ON f.preferred_mandi_id = m.id
      WHERE f.is_active = true AND (f.consent_sms = true OR f.consent_whatsapp = true)
    `);

    let sentCount = 0;

    for (const farmer of farmersRes.rows) {
      // Get the latest price for their commodity at their mandi
      const priceRes = await query(`
        SELECT modal_price, arrival_date 
        FROM market_prices 
        WHERE mandi_id = $1 AND commodity ILIKE $2 
        ORDER BY arrival_date DESC LIMIT 1
      `, [farmer.preferred_mandi_id, farmer.preferred_commodity]);

      if (priceRes.rows.length === 0) continue;

      const latestPrice = priceRes.rows[0].modal_price;
      
      // Basic Logic: Send alert if price > cost_price (Profit)
      // In production, we'd add logic to prevent spam (e.g. only once a day, or only if moved 5%)
      if (latestPrice > farmer.cost_price) {
        
        // Handle WhatsApp
        if (farmer.consent_whatsapp) {
          try {
            const result = await sendWhatsAppAlert(farmer.phone_number, farmer.name, farmer.preferred_commodity, latestPrice, farmer.mandi_name);
            await logAlert(farmer.id, 'whatsapp', 'sent', result.provider_id, null);
            sentCount++;
          } catch (e: any) {
            await logAlert(farmer.id, 'whatsapp', 'failed', null, e.message);
          }
        }

        // Handle SMS
        if (farmer.consent_sms) {
          try {
            const result = await sendSMSAlert(farmer.phone_number, farmer.name, farmer.preferred_commodity, latestPrice, farmer.mandi_name);
            await logAlert(farmer.id, 'sms', 'sent', result.provider_id, null);
            sentCount++;
          } catch (e: any) {
            await logAlert(farmer.id, 'sms', 'failed', null, e.message);
          }
        }
      }
    }

    console.log(`Finished processing alerts. Sent ${sentCount} messages.`);
  } catch (error) {
    console.error('Error processing alerts:', error);
  }
};

const logAlert = async (farmer_id: number, channel: string, status: string, provider_message_id: string | null, error_reason: string | null) => {
  await query(
    `INSERT INTO alerts_log (farmer_id, message, channel, status, provider_message_id, error_reason) 
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [farmer_id, 'Price Alert Triggered', channel, status, provider_message_id, error_reason]
  );
};
