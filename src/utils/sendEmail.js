import nodemailer from "nodemailer";

export const sendEmail = async (to, subject, html) => {
  // Transporter
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,   // your gmail
      pass: process.env.EMAIL_PASS,   // app password
    },
  });

  // Send email
  return transporter.sendMail({
    from: `"StudyMate" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
};
