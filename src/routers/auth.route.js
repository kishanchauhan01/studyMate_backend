import { Router } from "express";
import { instituteRegister } from "../controllers/auth.controller.js";

const router = Router();

router.route("/instituteRegister").post(instituteRegister);

export default router;
