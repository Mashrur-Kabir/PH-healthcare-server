import nodemailer, { TransportOptions } from "nodemailer";
import { envVars } from "../../config/env";
import status from "http-status";
import { AppError } from "../error/AppError";
import ejs from "ejs";
import path from "path";

// Using TransportOptions with SMTP properties
const transporter = nodemailer.createTransport({
  host: envVars.EMAIL_SENDER.SMTP_HOST,
  port: Number(envVars.EMAIL_SENDER.SMTP_PORT),
  secure: envVars.EMAIL_SENDER.SMTP_PORT === "465",
  auth: {
    user: envVars.EMAIL_SENDER.SMTP_USER,
    pass: envVars.EMAIL_SENDER.SMTP_PASS,
  },
} as TransportOptions);

interface sendEmailOptions {
  to: string;
  subject: string;
  templateName: string;
  templateData: Record<string, unknown>;
  attachments?: {
    filename: string;
    content: string | Buffer; // Explicitly defined for Nodemailer
    contentType: string;
  }[];
}

export const sendEmail = async ({
  subject,
  to,
  attachments,
  templateName,
  templateData,
}: sendEmailOptions) => {
  try {
    // 1. Resolve Template Path
    const templatePath = path.resolve(
      process.cwd(),
      `src/app/templates/${templateName}.ejs`,
    );

    // 2. Render HTML from EJS file
    const html = await ejs.renderFile(templatePath, templateData);

    // 3. Send the Mail
    const info = await transporter.sendMail({
      from: `"${envVars.EMAIL_SENDER.SMTP_FROM}" <${envVars.EMAIL_SENDER.SMTP_USER}>`,
      to,
      subject,
      html,
      attachments: attachments?.map((attachment) => ({
        filename: attachment.filename,
        content: attachment.content,
        contentType: attachment.contentType,
      })),
    });

    console.log(`Email sent to ${to}: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error("Email send error:", error);
    throw new AppError(
      status.INTERNAL_SERVER_ERROR,
      "Failed to send email notification. Please check your SMTP settings.",
    );
  }
};
