import { Router } from "express";
import {
  instituteRegister,
  otpSender,
  userSignup,
} from "../controllers/auth.controller.js";

const router = Router();

router.route("/instituteRegister").post(instituteRegister);
router.route("/sentOTP").post(otpSender);
router.route("/userSignup").post(userSignup);

export default router;
