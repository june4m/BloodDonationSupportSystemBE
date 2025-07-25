import { sendEmailService } from './../services/email.services';
import express from "express"
import { sendEmail, sendRecoveryReminderEmail } from "~/controller/EmailController";
import { Request, Response } from "express";
import { wrapAsync } from '~/utils/asyncHandler';
const router = express.Router()
router.post('/sendEmail', wrapAsync(sendEmail));
router.post('/sendRecoveryReminderEmail',  wrapAsync(sendRecoveryReminderEmail));
export default router