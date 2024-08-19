import nodemailer from 'nodemailer';

const email = process.env.EMAIL_USER || '';
const pass = process.env.EMAIL_PASSWORD || '';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: email,
    pass,
  },
});

export const sendReminderEmail = (to:string, subject:string, text:string) => {
  const mailOptions = {
    from: email,
    to,
    subject,
    text,
  };

  return transporter.sendMail(mailOptions);
};