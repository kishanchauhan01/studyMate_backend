import { Admin } from "../models/admin.model.js";
import { Institute } from "../models/institute.model.js";
import { ApiError } from "../utils/ApiError.js";
import { generateOtp } from "../utils/generateOtp.js";
import { sendEmail } from "../utils/sendEmail.js";

const instituteRegister = async (req, res) => {
  try {
    const {
      institute: {
        name: instituteName,
        email: instituteEmail,
        contact: instituteContact,
        type: instituteType,
        address: instituteAddress,
      },
      admin: { adminName, adminEmail, adminPassword },
    } = req.body;

    console.log("request came");

    if (
      [
        instituteName,
        instituteAddress,
        instituteContact,
        instituteType,
        adminEmail,
        adminName,
        adminPassword,
      ].some((item) => item.trim() === "")
    ) {
      throw new ApiError(400, "Invalid institute information");
    }

    const institute = await Institute.create({
      name: instituteName,
      email: instituteEmail,
      contact: instituteContact,
      type: instituteType,
      address: instituteAddress,
    });

    console.log(institute);

    if (!institute) {
      throw new ApiError(500, "Error while storing the data");
    }

    const admin = await Admin.create({
      name: adminName,
      email: adminEmail,
      password: adminPassword,
    });

    if (!admin) {
      throw new ApiError(500, "Error while storing the data");
    }

    const otp = generateOtp();
    console.log("OTP =", otp);

    await sendEmail(
      adminEmail,
      "StudyMate Email Verification OTP",
      `<h2>Your OTP is: <b>${otp}</b></h2>
       <p>This OTP is valid for 10 minutes.</p>`
    );

    return res
      .status(200)
      .json({ success: true, message: "Institute registration successfull" });
  } catch (error) {
    console.error("ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export { instituteRegister };
