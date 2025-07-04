import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();
export const sendEmailService = async (email: string) =>{
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
            from: '"From:"<minhncse182968@fpt.edu.vn>',
            to: email,
            subject: "Send api.email",
            text: "Donate cho em Minh  hoặc bay acc :) ?", 
            html: "<b> Donate cho em Minh  hoặc bay acc :)</b>", 
        });
        return info;
    } catch (error) {
        console.error("Error in sendEmailService:", error);
        throw new Error("Failed to send email");
    }
}