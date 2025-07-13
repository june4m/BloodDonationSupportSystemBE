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