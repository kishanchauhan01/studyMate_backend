import { Router } from "express";
import {
  instituteRegister,
  otpSender,
  userLogin,
  userSignup,
} from "../controllers/auth.controller.js";

const router = Router();

router.route("/instituteRegister").post(instituteRegister);
router.route("/sentOTP").post(otpSender);
router.route("/userSignup").post(userSignup);
router.route("/userLogin").post(userLogin);

export default router;
