import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from 'file:///d:/Dhananjay/Web development/Ecomerce/backend/models/User.js';

dotenv.config({ path: 'd:/Dhananjay/Web development/Ecomerce/backend/.env' });

const getUsers = async () => {
  const mongoURI = process.env.MONGO_URI;
  try {
    await mongoose.connect(mongoURI);
    const users = await User.find({}).select('-password');
    console.log("=== All Users in DB ===");
    users.forEach((user, index) => {
      console.log(`${index + 1}. Name: ${user.name} | Email: ${user.email} | Role: ${user.role}`);
    });
    console.log("=======================");
    process.exit(0);
  } catch (error) {
    console.error('Error fetching users:', error);
    process.exit(1);
  }
};

getUsers();
