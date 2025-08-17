import nodemailer from "nodemailer";
import { randomBytes } from "crypto";

const sendEmail = async ({ to, subject, text, html }: {
  to: string;
  subject: string;
  text: string;
  html: string;
}) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: `"Hadith Learning Platform" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  });
};

// Generate a random verification token
export const generateVerificationToken = (): string => {
  return randomBytes(32).toString('hex');
};

// Send verification email
export const sendVerificationEmail = async (
  email: string, 
  token: string, 
  firstName?: string
) => {
  const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${token}`;
  
  const html = `
    <p>Please verify your email address by clicking link below:</p>
    <p><a href="${verificationUrl}">${verificationUrl}</a></p>
  `;

  await sendEmail({
    to: email,
    subject: "Verify Your Email - Hadith Learning Platform",
    text: `Please verify your email by visiting: ${verificationUrl}`,
    html
  });
};

export default sendEmail;
