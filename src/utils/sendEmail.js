import { Resend } from "resend";
import { ApiError } from "./ApiError.js";

export const sendEmail = async (to, subject, html) => {
  const resend = new Resend(process.env.RESEND_KEY);

  try {
    const response = await resend.emails.send({
      from: "StudyMate <onboarding@resend.dev>",
      to,
      subject,
      html,
    });

    return response;
  } catch (error) {
    console.log(error);
    throw new ApiError(500, "error in sending the mail");
  }
};
