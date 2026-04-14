import { Router } from "express";
import { getMe, login, register, verifyLoginOTP } from "../controllers/auth.conroller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.post("/register", register);
router.post("/login", login);

// 🔐 Step 2: OTP verify → token milega
router.post("/verify-otp", verifyLoginOTP);
router.get("/me",authMiddleware, getMe);


export default router;
