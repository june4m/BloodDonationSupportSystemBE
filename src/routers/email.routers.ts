import { sendEmailService } from './../services/email.services';
import express from "express"
import { sendEmail } from "~/controller/EmailController";
import { Request, Response } from "express";
import { wrapAsync } from '~/utils/asyncHandler';
const router = express.Router()
router.post('/sendEmail', wrapAsync(sendEmail));
export default router