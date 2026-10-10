import nodemailer from "nodemailer"
import dotenv from "dotenv"
dotenv.config()
const transporter = nodemailer.createTransport({
  service: "Gmail",
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASS,
  },
});

const isProduction = process.env.NODE_ENV === "production"

// In development, if the SMTP mail fails to send, log the OTP so the
// forgot-password / delivery flow can still be tested without a valid
// Gmail App Password. In production this fallback is disabled and the
// error propagates so real emails are always delivered.
const trySend = async (mailOptions, { subject, otp, to }) => {
  try {
    await transporter.sendMail(mailOptions)
    console.log(`[Hungry Mail] ${subject} OTP sent to ${to}`)
  } catch (error) {
    if (!isProduction) {
      console.log("")
      console.log(`[Hungry Mail] EMAIL FAILED (${error.message.split("\n")[0]})`)
      console.log(`[Hungry Mail] DEV FALLBACK -> OTP for ${to}: ${otp}`)
      console.log("")
    } else {
      throw error
    }
  }
}

export const sendOtpMail = async (to, otp) => {
  await trySend({
    from: process.env.EMAIL,
    to,
    subject: "Reset Your Password - Hungry",
    html: `<p>Your OTP for password reset is <b>${otp}</b>. It expires in 5 minutes.</p>`
  }, { subject: "Password Reset", otp, to })
}


export const sendDeliveryOtpMail = async (user, otp) => {
  await trySend({
    from: process.env.EMAIL,
    to: user.email,
    subject: "Delivery OTP - Hungry",
    html: `<p>Your OTP for delivery is <b>${otp}</b>. It expires in 5 minutes.</p>`
  }, { subject: "Delivery", otp, to: user.email })
}
