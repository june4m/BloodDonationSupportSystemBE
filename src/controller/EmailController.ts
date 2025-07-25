import { sendEmailService } from '~/services/email.services';
import { Request, Response } from 'express';

export const sendEmail = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, subject, htmlContent } = req.body;

        // Kiểm tra các tham số bắt buộc
        if (!email || !subject || !htmlContent) {
            res.status(400).json({
                status: 'error',
                message: 'Email, subject, and htmlContent are required',
            });
            return;
        }

        // Gửi email
        const response = await sendEmailService(email, subject, htmlContent);
        res.status(200).json({
            status: 'success',
            message: 'Email sent successfully',
            response,
        });
    } catch (error) {
        console.error('Error in sendEmail:', error);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error',
        });
    }
};

export const sendRecoveryReminderEmail = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, name } = req.body;

        // Kiểm tra các tham số bắt buộc
        if (!email || !name) {
            res.status(400).json({
                status: 'error',
                message: 'Email and name are required',
            });
            return;
        }

        // Gửi email
        const subject = 'Recovery Reminder After Blood Donation';
        const htmlContent = `
            <p>Dear ${name},</p>
            <p>Thank you for donating blood! Please remember to:</p>
            <ul>
                <li>Rest and avoid strenuous activities.</li>
                <li>Stay hydrated by drinking plenty of fluids.</li>
                <li>Eat nutritious food to recover quickly.</li>
            </ul>
            <p>We appreciate your contribution to saving lives!</p>
            <p>Best regards,<br>Đại Việt Blood Team</p>
        `;

        const response = await sendEmailService(email, subject, htmlContent);
        res.status(200).json({
            status: 'success',
            message: 'Recovery reminder email sent successfully',
            response,
        });
    } catch (error) {
        console.error('Error in sendRecoveryReminderEmail:', error);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error',
        });
    }
};