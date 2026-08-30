import mongoose from 'mongoose';

// Fallback to hardcoded URI to ensure it always works even if user forgets env var on Vercel
const MONGODB_URI = process.env.MONGO_URI || 'mongodb+srv://teerapatchiamram5_db_user:hmyzKxXPj9BqPLrI@cluster0.1qfiopq.mongodb.net/water_management?retryWrites=true&w=majority';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGO_URI environment variable inside .env.local');
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }
  
  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default dbConnect;
