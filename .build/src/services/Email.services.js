import nodemailer from 'nodemailer';
export const sendReminderEmail = (to, subject, text) => {
    const mail = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASSWORD;
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject,
        text,
    };
    const authOptions = {
        user: mail,
        pass,
    };
    return nodemailer
        .createTransport({
        service: 'gmail',
        auth: Object.assign({}, authOptions),
    })
        .sendMail(mailOptions);
};
