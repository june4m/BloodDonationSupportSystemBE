import { sendEmailService } from './../services/email.services';
import express from "express"
import { sendEmail } from "~/controller/EmailController"
const router = express.Router()
router.post('/sendEmail', sendEmail);
export default router