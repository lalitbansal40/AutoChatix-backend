import { Request, Response } from "express";
import User from "../models/user.model";
import Subscription from "../models/subcription.model";
import Account from "../models/account.model"; // ✅ NEW
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import path from "path";
import bcrypt from "bcryptjs";
import { AuthRequest } from "../types/auth.types";
import { generateOTP, verifyOTP } from "../services/otp.service";
import { sendOTPEmail } from "../services/email.service";

dotenv.config({ path: path.join(".env") });

/* =====================================================
   REGISTER (CREATE ACCOUNT + ADMIN USER)
===================================================== */
export const register = async (req: Request, res: Response) => {
  try {
    const { email, phone, password, user_name, account_name } = req.body;

    if (!email || !phone || !password || !user_name || !account_name) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    // 🔍 check existing user
    const existingUser = await User.findOne({
      $or: [{ email }, { phone }],
    });

    if (existingUser) {
      return res.status(400).json({
        message: "Email or phone already registered",
      });
    }

    // 🔐 hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 🏢 1️⃣ CREATE ACCOUNT (company name)
    const account = await Account.create({
      name: account_name,
    });

    // 👤 2️⃣ CREATE USER (person name)
    const user = await User.create({
      email,
      phone,
      password: hashedPassword,
      name: user_name, // 👤 person
      role: "user",
      account_id: account._id,
      account_name: account_name,
    });

    // 🔗 link owner
    account.owner_id = user._id;
    await account.save();

    // 💰 subscription
    await Subscription.create({
      account_id: account._id,
      payment_status: "pending",
    });

    return res.json({
      message: "Registered successfully",
    });
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};

/* =====================================================
   LOGIN
===================================================== */
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // 🔍 check user
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // 🔐 check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // 🎟️ generate token (direct)
    const token = jwt.sign(
      {
        user_id: user._id,
        account_id: user.account_id,
        role: user.role,
      },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    return res.json({
      token,
      message: "Login successful",
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};

export const verifyLoginOTP = async (req: Request, res: Response) => {
  const { email, otp } = req.body;

  const isValid = verifyOTP(email, otp);

  if (!isValid) {
    return res.status(400).json({
      message: "Invalid or expired OTP",
    });
  }

  const user = await User.findOne({ email });

  const token = jwt.sign(
    {
      user_id: user._id,
      account_id: user.account_id,
      role: user.role,
    },
    process.env.JWT_SECRET!,
    { expiresIn: "7d" }
  );

  return res.json({
    token,
    message: "Login successful",
  });
};

/* =====================================================
   GET ME
===================================================== */
export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user?.user_id).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.json({ user });
  } catch (error) {
    console.error("GetMe error:", error);
    return res.status(500).json({
      message: "Server error",
    });
  }
};
