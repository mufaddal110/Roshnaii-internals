const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const Otp = require('../models/Otp');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Create email transporter
const getTransporter = () => {
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT),
        secure: false,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });
};

const generateOtp = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

const generateToken = (user) => {
    return jwt.sign(
        { id: user._id, email: user.email, isAdmin: user.isAdmin },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );
};

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
    try {
        const { email, password, fullName, username, favoriteShair } = req.body;

        if (!email || !password || !fullName) {
            return res.status(400).json({ error: 'Email, password, and full name are required.' });
        }
        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters.' });
        }

        const existing = await User.findOne({ email: email.toLowerCase() });
        if (existing) {
            return res.status(400).json({ error: 'This email is already registered.' });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const user = await User.create({
            email: email.toLowerCase(),
            password: hashedPassword,
            fullName,
            username,
            favoriteShair,
            isAdmin: email.toLowerCase() === (process.env.ADMIN_EMAIL || '').toLowerCase(),
        });

        // Generate and send OTP
        const otpCode = generateOtp();
        await Otp.deleteMany({ email: email.toLowerCase() });
        await Otp.create({
            email: email.toLowerCase(),
            code: otpCode,
            expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 min
        });

        try {
            const transporter = getTransporter();
            await transporter.sendMail({
                from: `"Roshnaii" <${process.env.SMTP_USER}>`,
                to: email,
                subject: 'Verify your Roshnaii account',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 400px; margin: 0 auto; padding: 2rem; background: #0a0a0a; color: #fff; border-radius: 12px;">
                        <h2 style="color: #c5a028; text-align: center; letter-spacing: 3px;">ROSHNAII</h2>
                        <p style="text-align: center; color: #999;">Your verification code is:</p>
                        <h1 style="text-align: center; color: #c5a028; font-size: 2.5rem; letter-spacing: 8px; margin: 1.5rem 0;">${otpCode}</h1>
                        <p style="text-align: center; color: #666; font-size: 0.85rem;">This code expires in 10 minutes.</p>
                    </div>
                `,
            });
        } catch (emailErr) {
            console.error('Email send error:', emailErr.message);
            // Don't fail signup if email fails — user can resend
        }

        res.status(201).json({ message: 'Account created. Check your email for the OTP.' });
    } catch (err) {
        console.error('Signup error:', err);
        res.status(500).json({ error: 'Server error. Please try again.' });
    }
});

// POST /api/auth/verify-otp
router.post('/verify-otp', async (req, res) => {
    try {
        const { email, code } = req.body;
        if (!email || !code) {
            return res.status(400).json({ error: 'Email and OTP code are required.' });
        }

        const otp = await Otp.findOne({
            email: email.toLowerCase(),
            code,
            expiresAt: { $gt: new Date() },
        });

        if (!otp) {
            return res.status(400).json({ error: 'Invalid or expired OTP.' });
        }

        await User.updateOne({ email: email.toLowerCase() }, { isVerified: true });
        await Otp.deleteMany({ email: email.toLowerCase() });

        res.json({ message: 'Email verified successfully.' });
    } catch (err) {
        console.error('Verify OTP error:', err);
        res.status(500).json({ error: 'Server error.' });
    }
});

// POST /api/auth/resend-otp
router.post('/resend-otp', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ error: 'Email is required.' });

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) return res.status(404).json({ error: 'User not found.' });
        if (user.isVerified) return res.json({ message: 'Email is already verified.' });

        const otpCode = generateOtp();
        await Otp.deleteMany({ email: email.toLowerCase() });
        await Otp.create({
            email: email.toLowerCase(),
            code: otpCode,
            expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        });

        try {
            const transporter = getTransporter();
            await transporter.sendMail({
                from: `"Roshnaii" <${process.env.SMTP_USER}>`,
                to: email,
                subject: 'Your new Roshnaii verification code',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 400px; margin: 0 auto; padding: 2rem; background: #0a0a0a; color: #fff; border-radius: 12px;">
                        <h2 style="color: #c5a028; text-align: center; letter-spacing: 3px;">ROSHNAII</h2>
                        <p style="text-align: center; color: #999;">Your new verification code is:</p>
                        <h1 style="text-align: center; color: #c5a028; font-size: 2.5rem; letter-spacing: 8px; margin: 1.5rem 0;">${otpCode}</h1>
                        <p style="text-align: center; color: #666; font-size: 0.85rem;">This code expires in 10 minutes.</p>
                    </div>
                `,
            });
        } catch (emailErr) {
            console.error('Resend email error:', emailErr.message);
        }

        res.json({ message: 'New OTP sent to your email.' });
    } catch (err) {
        console.error('Resend OTP error:', err);
        res.status(500).json({ error: 'Server error.' });
    }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required.' });
        }

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        if (!user.isVerified) {
            return res.status(403).json({ error: 'Please verify your email first.', needsVerification: true });
        }

        const token = generateToken(user);

        res.json({
            token,
            user: {
                id: user._id,
                email: user.email,
                fullName: user.fullName,
                username: user.username,
                favoriteShair: user.favoriteShair,
                isAdmin: user.isAdmin,
            },
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Server error.' });
    }
});

// GET /api/auth/me
router.get('/me', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) return res.status(404).json({ error: 'User not found.' });

        res.json({
            id: user._id,
            email: user.email,
            fullName: user.fullName,
            username: user.username,
            favoriteShair: user.favoriteShair,
            isAdmin: user.isAdmin,
            isVerified: user.isVerified,
        });
    } catch (err) {
        res.status(500).json({ error: 'Server error.' });
    }
});

module.exports = router;
