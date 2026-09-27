import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { query } from '../db';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkrishimitra';

// Generate a random 6-digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

router.post('/register', async (req, res) => {
  const { name, phone_number, preferred_mandi_id, preferred_commodity, cost_price, language_preference, consent_sms, consent_whatsapp } = req.body;

  try {
    // Check if farmer already exists
    const existing = await query(`SELECT id FROM farmers WHERE phone_number = $1`, [phone_number]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Phone number already registered' });
    }

    // Insert farmer as inactive
    const insertRes = await query(
      `INSERT INTO farmers (name, phone_number, preferred_mandi_id, preferred_commodity, cost_price, language_preference, consent_sms, consent_whatsapp, consent_sms_timestamp, consent_whatsapp_timestamp, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, false) RETURNING id`,
      [
        name, phone_number, preferred_mandi_id, preferred_commodity, cost_price, 
        language_preference, consent_sms, consent_whatsapp, 
        consent_sms ? new Date() : null, consent_whatsapp ? new Date() : null
      ]
    );

    // Generate and store OTP
    const otp = generateOTP();
    const otpHash = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + 10 * 60000); // 10 mins

    await query(
      `INSERT INTO otp_verifications (phone_number, otp_code_hash, purpose, expires_at) VALUES ($1, $2, $3, $4)`,
      [phone_number, otpHash, 'registration', expiresAt]
    );

    // In a real app, send OTP via SMS (MSG91/Twilio) here.
    console.log(`[DEV ONLY] OTP for ${phone_number} is ${otp}`);

    res.json({ message: 'OTP sent successfully', farmer_id: insertRes.rows[0].id });
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

router.post('/verify-otp', async (req, res) => {
  const { phone_number, otp_code } = req.body;

  try {
    // Get latest active OTP
    const otpRes = await query(
      `SELECT * FROM otp_verifications WHERE phone_number = $1 AND verified_at IS NULL AND expires_at > NOW() ORDER BY id DESC LIMIT 1`,
      [phone_number]
    );

    if (otpRes.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    const otpRecord = otpRes.rows[0];
    const isValid = await bcrypt.compare(otp_code, otpRecord.otp_code_hash);

    if (!isValid) {
      // Increment attempt count
      await query(`UPDATE otp_verifications SET attempt_count = attempt_count + 1 WHERE id = $1`, [otpRecord.id]);
      return res.status(400).json({ error: 'Incorrect OTP' });
    }

    // Mark as verified
    await query(`UPDATE otp_verifications SET verified_at = NOW() WHERE id = $1`, [otpRecord.id]);
    
    // Activate farmer
    const farmerRes = await query(`UPDATE farmers SET phone_verified = true, is_active = true WHERE phone_number = $1 RETURNING *`, [phone_number]);
    const farmer = farmerRes.rows[0];

    // Issue JWT
    const token = jwt.sign({ id: farmer.id, phone: farmer.phone_number }, JWT_SECRET, { expiresIn: '7d' });

    res.json({ message: 'Verified successfully', token, user: farmer });
  } catch (error: any) {
    console.error('OTP Verification error:', error);
    res.status(500).json({ error: 'Server error during verification' });
  }
});

export default router;
