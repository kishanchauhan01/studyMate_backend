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
import fs from "fs";
import path from "path";

const __dirname = path.resolve();
const templatePath = path.join(__dirname, "src/templates", "otp_template.html");
const template = fs.readFileSync(templatePath, "utf8");

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

  const htmlTemplate = template
    .replace("{{OTP}}", otp)
    .replace("{{OTP}}", otp)
    .replace("{{YEAR}}", new Date().getFullYear());

  const mail = await sendEmail(
    adminEmail,
    "StudyMate Email Verification OTP",
    htmlTemplate
  );

  if (mail.error != null) {
    throw new ApiError(500, "Error while sending OTP");
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
  console.log("req.come");
  const { email, name, password, instituteCode } = req.body;
  console.log(req.body);
  //check the fields
  if (
    [email, name, password, instituteCode].some((item) => {
      console.log(item);
      return !item || item.trim() === "";
    })
  ) {
    throw new ApiError(400, "Fields are invalid");
  }

  const institute = await Institute.findOne({ code: instituteCode });

  //if institue not found
  if (!institute) {
    throw new ApiError(400, "Institue is not found");
  }

  //save the user to db
  const user = await User.create({
    userName: name,
    userEmail: email,
    password: password,
    institutionId: institute._id,
  });

  const newUser = await User.findById(user._id).select("-password");

  if (!newUser) {
    throw new ApiError(500, "Error while creating a user");
  }

  //send response
  console.log("all done");
  return res
    .status(200)
    .json(
      new ApiResponse(200, "User created successfully", { newUser, institute })
    );
});

const userLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  console.log("request came");

  // vlaidate the data
  if (email.trim() === "" || password.trim() === req.body) {
    throw new ApiError(400, "Invalid fields");
  }

  // check for already exists
  const user = await User.findOne({ userEmail: email }).select("-password");

  if (!user) {
    throw new ApiError(400, "User not found");
  }

  const isPasswordCorrect = await user.isPasswordCorrect(password);

  if (!isPasswordCorrect) {
    throw new ApiError(400, "Incorrect password");
  }

  const institute = await Institute.findById(user.institutionId);

  //login the user
  // have to send user info and the institute info
  if (!institute) {
    throw new ApiError(400, "User is not joined any institue yet");
  }

  //send the response
  return res
    .status(200)
    .json(
      new ApiResponse(200, "Usr logedIn successfully", { user, institute })
    );
});

export { instituteRegister, userSignup, otpSender };
