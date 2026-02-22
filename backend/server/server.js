require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const app = express();

// Middleware - MUST be registered before routes
app.use(cors({
    origin: true, // Allow all origins
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/poets', require('./routes/poets'));
app.use('/api/poetry', require('./routes/poetry'));
app.use('/api/genres', require('./routes/genres'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/saved', require('./routes/saved'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/follow', require('./routes/follow'));
app.use('/api/likes', require('./routes/likes'));
app.use('/api/ratings', require('./routes/ratings'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/users', require('./routes/users'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/feedback', require('./routes/feedback'));

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error.' });
});

// Create default admin user
const createAdminUser = async () => {
    try {
        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPassword = process.env.ADMIN_PASSWORD;
        
        if (!adminEmail || !adminPassword) {
            console.log('⚠️  Admin credentials not set in .env');
            return;
        }

        const existingAdmin = await User.findOne({ email: adminEmail.toLowerCase() });
        
        if (!existingAdmin) {
            const hashedPassword = await bcrypt.hash(adminPassword, 12);
            await User.create({
                email: adminEmail.toLowerCase(),
                password: hashedPassword,
                fullName: 'Admin',
                username: 'admin',
                isAdmin: true,
                isVerified: true,
            });
            console.log('✅ Admin user created successfully');
            console.log(`   Email: ${adminEmail}`);
            console.log(`   Password: ${adminPassword}`);
        } else {
            console.log('✅ Admin user already exists');
        }
    } catch (err) {
        console.error('❌ Error creating admin user:', err.message);
    }
};

// Connect to MongoDB & Start Server
const startServer = async () => {
    try {
        await connectDB();
        await createAdminUser();
        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
        });
    } catch (err) {
        console.error('Failed to start server:', err);
    }
};

startServer();