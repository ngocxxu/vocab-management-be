import nodemailer from 'nodemailer';

export const sendReminderEmail = (
  to: string,
  subject: string,
  text: string
) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    text,
  };

  const authOptions = {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  };

  return nodemailer
    .createTransport({
      service: 'gmail',
      auth: { ...authOptions },
    })
    .sendMail(mailOptions);
};
