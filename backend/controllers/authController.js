const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const pool = require('../config/db');

const signup = async (req, res) => {
    const { name, email, password } = req.body;

    if (!email || !password)
        return res.status(400).json({ error: 'Email and password required' });

    try {
        const exists = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
        if (exists.rows.length > 0)
            return res.status(400).json({ error: 'Email already registered' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const adminEmails = ['admin@essential.com', 'admin@ecommerce.com', 'admin@gmail.com'];
        const role = adminEmails.includes(email.toLowerCase()) ? 'admin' : 'user';

        const result = await pool.query(
            `INSERT INTO users (name, email, password, role, created_at)
             VALUES ($1, $2, $3, $4, NOW()) RETURNING id, email, role`,
            [name || '', email, hashedPassword, role]
        );

        const user = result.rows[0];

        // Generate a token using the same settings as login.
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET || 'essential_mart_secret',
            { expiresIn: '7d' }
        );

        res.status(201).json({
            message: 'Account created successfully',
            token,
            user: { id: user.id, email: user.email, role: user.role },
        });
    } catch (err) {
        console.error('Signup Error:', err.message);
        res.status(500).json({ error: 'Signup failed' });
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password)
        return res.status(400).json({ error: 'Email and password required' });

    try {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

        if (result.rows.length === 0)
            return res.status(401).json({ error: 'Invalid email or password' });

        const user = result.rows[0];

        const isBcryptHash = /^\$2[ab]\$/.test(user.password);
        let isMatch = false;

        if (isBcryptHash) {
            isMatch = await bcrypt.compare(password, user.password);
        } else {
            isMatch = (password === user.password);
            if (isMatch) {
                const hashed = await bcrypt.hash(password, 10);
                await pool.query('UPDATE users SET password = $1 WHERE id = $2', [hashed, user.id]);
            }
        }

        if (!isMatch)
            return res.status(401).json({ error: 'Invalid email or password' });

        const role = (user.role || 'user').toLowerCase();

        const token = jwt.sign(
            { id: user.id, email: user.email, role },
            process.env.JWT_SECRET || 'essential_mart_secret',
            { expiresIn: '7d' }
        );

        res.json({
            token,
            user: { id: user.id, email: user.email, role },
        });
    } catch (err) {
        console.error('Login Error:', err.message);
        res.status(500).json({ error: 'Login failed' });
    }
};


const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    
    // Security: same response chahe user ho ya na ho
    if (result.rows.length === 0)
      return res.json({ message: 'If this email exists, a reset link has been sent.' });

    // Generate a secure reset token.
    const token = crypto.randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Save the reset token in the database.
    await pool.query(
      'UPDATE users SET reset_token = $1, reset_token_expiry = $2 WHERE email = $3',
      [token, expiry, email]
    );

    // Email bhejo
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,   // your gmail
        pass: process.env.EMAIL_PASS,   // gmail app password
      },
    });

    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}`;

    await transporter.sendMail({
      from: `"KIA Jewellers" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Reset Your Password — KIA Fashion',
      html: `
        <div style="font-family:'Georgia',serif;max-width:480px;margin:0 auto;background:#0f0c08;color:#f5efe6;padding:40px;border-radius:8px;">
          <h1 style="font-size:1.8rem;font-weight:300;font-style:italic;color:#f5efe6;margin:0 0 8px;">KIA <span style="color:#c9a96e;">Jewellers</span></h1>
          <div style="height:1px;background:#c9a96e;margin:16px 0 32px;opacity:0.3;"></div>
          <h2 style="font-size:1.3rem;font-weight:300;color:#f5efe6;margin:0 0 16px;">Reset Your Password</h2>
          <p style="color:rgba(255,255,255,0.5);font-size:14px;line-height:1.7;margin:0 0 32px;">
            We received a request to reset your password. Click the button below to create a new password. This link will expire in <strong style="color:#c9a96e;">1 hour</strong>.
          </p>
          <a href="${resetLink}" 
             style="display:block;background:#c9a96e;color:#0b0905;text-align:center;padding:14px 24px;text-decoration:none;font-size:11px;font-weight:600;letter-spacing:0.3em;text-transform:uppercase;border-radius:2px;margin-bottom:24px;">
            Reset Password
          </a>
          <p style="color:rgba(255,255,255,0.25);font-size:11px;line-height:1.6;margin:0;">
            If you didn't request this, please ignore this email. Your password will remain unchanged.
          </p>
          <div style="height:1px;background:rgba(255,255,255,0.08);margin:24px 0 16px;"></div>
          <p style="color:rgba(255,255,255,0.2);font-size:10px;letter-spacing:0.2em;text-transform:uppercase;margin:0;">
            KIA Fashion — Style is everything.
          </p>
        </div>
      `,
    });

    res.json({ message: 'If this email exists, a reset link has been sent.' });
  } catch (err) {
    console.error('Forgot Password Error:', err.message);
    res.status(500).json({ error: 'Failed to send reset email' });
  }
};

// ── RESET PASSWORD ───────────────────────────────────────
const resetPassword = async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) return res.status(400).json({ error: 'Token and password required' });

  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE reset_token = $1 AND reset_token_expiry > NOW()',
      [token]
    );

    if (result.rows.length === 0)
      return res.status(400).json({ error: 'Invalid or expired reset link' });

    const hashed = await bcrypt.hash(password, 10);

    await pool.query(
      'UPDATE users SET password = $1, reset_token = NULL, reset_token_expiry = NULL WHERE reset_token = $2',
      [hashed, token]
    );

    res.json({ message: 'Password reset successfully' });
  } catch (err) {
    console.error('Reset Password Error:', err.message);
    res.status(500).json({ error: 'Failed to reset password' });
  }
};

module.exports = { signup, login, forgotPassword, resetPassword};
