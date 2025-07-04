import { sendEmailService } from '~/services/email.services';
import { Request, Response } from 'express';

export const sendEmail = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email } = req.body;
        if (email) {
            const response = await sendEmailService(email);
            res.json({ response }); 
            return;
        }
        res.status(400).json({
            status: 'error',
            message: 'Email is required',
        });
    } catch (error) {
        console.error('Error in sendEmail:', error);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error',
        });
    }
};