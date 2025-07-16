import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

export const sendEmailService = async (email: string, subject: string, htmlContent: string) => {
    try {
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false, // upgrade later with STARTTLS
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD,
            },
        });

        const info = await transporter.sendMail({
            from: '"Đại Việt Blood" <daivietblood@gmail.com>',
            to: email,
            subject: subject, 
            html: htmlContent, 
        });

        return info;
    } catch (error) {
        console.error("Error in sendEmailService:", error);
        throw new Error("Failed to send email");
    }
};