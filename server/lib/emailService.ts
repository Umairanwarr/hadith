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
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Verify Your Email</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #1e40af; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; background: #1e40af; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Hadith Learning Platform</h1>
        </div>
        <div class="content">
          <h2>Welcome${firstName ? `, ${firstName}` : ''}!</h2>
          <p>Thank you for registering with our platform. To complete your registration, please verify your email address by clicking the button below:</p>
          
          <a href="${verificationUrl}" class="button">Verify Email Address</a>
          
          <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
          <p><a href="${verificationUrl}">${verificationUrl}</a></p>
          
          <p>This verification link will expire in 24 hours.</p>
          
          <p>If you didn't create an account, you can safely ignore this email.</p>
        </div>
        <div class="footer">
          <p>&copy; 2024 Hadith Learning Platform. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await sendEmail({
    to: email,
    subject: "Verify Your Email - Hadith Learning Platform",
    text: `Please verify your email by visiting: ${verificationUrl}`,
    html
  });
};

export default sendEmail;
