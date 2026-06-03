import dotenv from "dotenv";
dotenv.config();

import bcrypt from "bcryptjs";

import connectDB from "../config/database.js";
import User from "../modules/auth/auth.model.js";
import { ROLES } from "../constants/roles.js";

const createAdmin = async () => {
  try {
    await connectDB();

    const existingAdmin = await User.findOne({
      email: "admin@company.com",
    });

    if (existingAdmin) {
      console.log("Admin already exists");
      process.exit(0);
    }

    const passwordHash = await bcrypt.hash(
      "Admin@123",
      10
    );

    await User.create({
      name: "System Admin",
      email: "admin@company.com",
      passwordHash,
      role: ROLES.ADMIN,
    });

    console.log("Admin created successfully");

    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

createAdmin();