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
        const { donorEmail, donorName } = req.params; 

   
        if (!donorEmail || !donorName) {
            res.status(400).json({
                status: 'error',
                message: 'Email and Donor name are required',
            });
            return;
        }


        const subject = 'Nhắc nhở phục hồi sau khi hiến máu';
        const htmlContent = `
            <p>Xin chào ${donorName},</p>
            <p>Cảm ơn bạn đã hiến máu! Vui lòng nhớ:</p>
            <ul>
                <li>Nghỉ ngơi và tránh các hoạt động gắng sức.</li>
                <li>Uống nhiều nước để giữ cơ thể đủ nước.</li>
                <li>Ăn thực phẩm dinh dưỡng để phục hồi nhanh chóng.</li>
            </ul>
            <p>Chúng tôi rất trân trọng sự đóng góp của bạn trong việc cứu sống mọi người!</p>
            <p>Trân trọng,<br>Đội ngũ Đại Việt Blood</p>
        `;

        const response = await sendEmailService(donorEmail, subject, htmlContent);
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