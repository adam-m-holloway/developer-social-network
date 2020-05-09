// mongo DB connection
const mongoose = require('mongoose');
const config = require('config');
const db = config.get('mongoURI'); // gets value from default.json

const connectDB = async () => {
  try {
    await mongoose.connect(db, { useNewUrlParser: true });
    console.log('MongoDB Connected...');
  } catch (error) {
    console.error(error.message);
    process.exit(1); // exit process with failure
  }
};

module.exports = connectDB;
