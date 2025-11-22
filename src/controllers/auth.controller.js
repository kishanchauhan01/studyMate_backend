import { Admin } from "../models/admin.model.js";
import { Institute } from "../models/institute.model.js";
import { ApiError } from "../utils/ApiError.js";
import { generateOtp } from "../utils/generateOtp.js";
import { sendEmail } from "../utils/sendEmail.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { nanoid } from "nanoid";
import { User } from "../models/user.model.js";
import { Otp } from "../models/otp.model.js";

const isOtpCorrect = async (otp, otpRefId) => {
  const toBeVerifiedOtp = await Otp.findOne({ otpRefId });

  if (!toBeVerifiedOtp) {
    return false;
  }

  if (toBeVerifiedOtp.otp === otp) {
    return true;
  }

  return false;
};

const otpSender = asyncHandler(async (req, res) => {
  const { adminEmail } = req.body;

  if (!adminEmail) {
    throw new ApiError(400, "Admin email is required");
  }

  const { otp, otpRefId } = generateOtp();
  console.log("OTP =", otp);

  const newOtp = Otp.create({
    otpRefId,
    otp,
    email: adminEmail,
    expiresAt: Date.now() + 10 * 60 * 1000, // 10 min for testing
  });

  if (!newOtp) {
    throw new ApiError(500, "Error while generating otp");
  }

  const mail = await sendEmail(
    adminEmail,
    "StudyMate Email Verification OTP",
    `<h2>Your OTP is: <b>${otp}</b></h2>
       <p>This OTP is valid for 10 minutes.</p>`
  );

  if(mail.error != null) {
    throw new ApiError(500, "Error while sending OTP")
    
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Otp sent successfully", otpRefId));
});

const instituteRegister = asyncHandler(async (req, res) => {
  console.log("request came");

  const {
    institute: {
      name: instituteName,
      email: instituteEmail,
      contact: instituteContact,
      type: instituteType,
      address: instituteAddress,
    },
    admin: { adminName, adminEmail, adminPassword },
    otp,
    otpRefId,
  } = req.body;

  if (!otp || !otpRefId) {
    throw new ApiError(400, "OTP is missing!!!");
  }

  const correctOtp = isOtpCorrect(otp, otpRefId);

  if (!correctOtp) {
    throw new ApiError(400, "OTP is wrong, check it again");
  }

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

  //generate a unique institue code
  const instituteCode = nanoid(6).toString();

  const institute = await Institute.create({
    name: instituteName,
    email: instituteEmail,
    contact: instituteContact,
    type: instituteType,
    address: instituteAddress,
    code: instituteCode,
  });

  console.log(institute);

  if (!institute) {
    throw new ApiError(500, "Error while storing the data");
  }

  const admin = await Admin.create({
    name: adminName,
    email: adminEmail,
    password: adminPassword,
    instituteId: institute._id,
  });

  if (!admin) {
    throw new ApiError(500, "Error while storing the data");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, "Institue registered Successfully", [
        admin,
        institute,
      ])
    );
});

const userSignup = asyncHandler(async (req, res) => {
  const { email, name, password, institueCode } = req.body;

  //check the fields
  if (
    [email, name, password, institueCode].some((itme) => itme.trim() === "")
  ) {
    throw new ApiError(400, "Fields are invalid");
  }

  const institue = await Institute.findOne({ code: institueCode });

  //if institue not found
  if (!institue) {
    throw new ApiError(400, "Institue is not found");
  }

  //save the user to db
  const user = await User.create({
    userName: name,
    userEmail: email,
    password: password,
    institutionId: institue._id,
  });

  const newUser = await User.findById(user._id).select("-password");

  if (!newUser) {
    throw new ApiError(500, "Error while creating a user");
  }

  //send response
  return res
    .status(200)
    .json(new ApiResponse(200, "User created successfully", newUser));
});

export { instituteRegister, userSignup, otpSender };
