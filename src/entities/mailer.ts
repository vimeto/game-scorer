import nodemailer from 'nodemailer';
import { env } from "../env/server.mjs";

const send = async (to: string, subject: string, text: string, html: string) => {
  const transporter = nodemailer.createTransport({
    host: env.EMAIL_HOST,
    port: env.EMAIL_PORT,
    secure: true,
    auth: {
      user: env.EMAIL_USER,
      pass: env.EMAIL_PASSWORD,
    },
  });

  const mail = await transporter.sendMail({
    from: env.EMAIL_FROM,
    to,
    subject,
    text,
    html,
  });

  return mail;
}

const sendEmailRegistration = async (to: string, token: string) => {
  const subject = "Email registration";
  const text = `Please click the link below to confirm your email address:
  ${env.NEXTAUTH_URL}/account/verify_email?emailToken?${token}`;
  const html = `<p>Please click the link below to confirm your email address:</p>
  <a href="${env.NEXTAUTH_URL}/account/verify_email?emailToken=${token}">Verify</a>`;
  const mail = await send(to, subject, text, html);

  console.log("mail sent");
}

export { sendEmailRegistration };
