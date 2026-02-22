const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log('--------------------------------------------');
        console.log(`✅ FLAG: MONGODB CONNECTED | Host: ${conn.connection.host}`);
        console.log('--------------------------------------------');
        return conn;
    } catch (error) {
        console.error('❌ MONGODB CONNECTION ERROR:', error.message);
        process.exit(1);
    }
};

module.exports = connectDB;
