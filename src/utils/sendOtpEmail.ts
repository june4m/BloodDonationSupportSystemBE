import nodemailer from 'nodemailer'

export async function sendOtpEmail(to: string, otp: string) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD
    }
  })

  await transporter.sendMail({
    from: `"Blood Donation Support" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Mã OTP đặt lại mật khẩu',
    text: `Mã OTP của bạn là: ${otp}. OTP sẽ hết hạn sau 5 phút.`
  })
}
