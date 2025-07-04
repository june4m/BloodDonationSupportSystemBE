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
            from: 'Đại Việt Blood"From:"<daivietblood@gmail.com>',
            to: email,
            subject: "Send api.email",
            text: "Bạn có đồng ý hỗ trợ hiến máu không?", 
            html: "<b> Có người cần đăng ký hiến máu và phù hợp với nhóm máu của bạn, bạn có thể giúp đỡ họ không? </b>", 
        });
        return info;
    } catch (error) {
        console.error("Error in sendEmailService:", error);
        throw new Error("Failed to send email");
    }
}