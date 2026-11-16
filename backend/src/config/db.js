const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

let mongod = null;

const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  // Try standard connection first if URI is provided
  if (uri && uri !== 'memory') {
    try {
      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 8000,
      });
      console.log(`✅ MongoDB Atlas Connected: ${conn.connection.host}`);

      // If database is empty, seed initial SplitFlow data
      try {
        const Group = require('../models/group.model');
        const count = await Group.countDocuments();
        if (count === 0) {
          console.log('🌱 Atlas database is empty. Auto-seeding initial SplitFlow data...');
          const { seedData } = require('../controllers/seed.controller');
          await seedData({ body: {} }, { json: () => {}, status: () => ({ json: () => {} }) });
          console.log('✅ Seeded initial SplitFlow data into MongoDB Atlas cluster!');
        }
      } catch (seedErr) {
        console.warn('Auto-seed check note:', seedErr.message);
      }

      return conn;
    } catch (error) {
      console.warn(`⚠️ Could not connect to MongoDB at ${uri}: ${error.message}`);
      console.log('🔄 Attempting fallback to in-memory MongoDB Server for instant seamless operation...');
    }
  }

  // Fallback to in-memory Mongo if available or if requested
  try {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    mongod = await MongoMemoryServer.create();
    const memoryUri = mongod.getUri();
    const conn = await mongoose.connect(memoryUri);
    console.log(`✅ In-Memory MongoDB Server Connected: ${memoryUri}`);

    // Auto-seed initial data in memory DB
    try {
      const { seedData } = require('../controllers/seed.controller');
      await seedData({ body: {} }, { json: () => {}, status: () => ({ json: () => {} }) });
      console.log('🌱 Seeded initial SplitFlow data automatically into in-memory database');
    } catch (seedErr) {
      console.warn('Seed warning:', seedErr.message);
    }

    return conn;
  } catch (memError) {
    console.warn(`⚠️ In-memory MongoDB not available or failed: ${memError.message}`);
    console.log('👉 Ensure MongoDB is running locally or set MONGO_URI in backend/.env');
  }
};

module.exports = connectDB;
