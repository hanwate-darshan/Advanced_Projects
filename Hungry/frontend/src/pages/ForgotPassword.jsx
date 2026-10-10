import axios from 'axios';
import React, { useState } from 'react'
import { IoIosArrowRoundBack } from "react-icons/io";
import { FaEnvelope, FaHashtag, FaKey, FaCheck, FaExclamationCircle as FaCircleAlert } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import { serverUrl } from '../App';
import { ClipLoader } from 'react-spinners';
import AuthLayout from '../components/AuthLayout';
import Logo from '../components/ui/Logo';
import { getErrorMessage } from '../utils/error';
function ForgotPassword() {
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [err, setErr] = useState("")
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const handleSendOtp = async () => {
    setLoading(true)
    try {
      const result = await axios.post(`${serverUrl}/api/auth/send-otp`, { email }, { withCredentials: true })
      console.log(result)
      setErr("")
      setStep(2)
      setLoading(false)
    } catch (error) {
      setErr(getErrorMessage(error, "Could not send the OTP. Please try again."))
      setLoading(false)
    }
  }
  const handleVerifyOtp = async () => {
    setLoading(true)
    try {
      const result = await axios.post(`${serverUrl}/api/auth/verify-otp`, { email, otp }, { withCredentials: true })
      console.log(result)
      setErr("")
      setStep(3)
      setLoading(false)
    } catch (error) {
      setErr(getErrorMessage(error, "Could not verify the OTP. Please try again."))
      setLoading(false)
    }
  }
  const handleResetPassword = async () => {
    if (newPassword != confirmPassword) {
      setErr("Passwords do not match.")
      return null
    }
    if (newPassword.length < 6) {
      setErr("Password must be at least 6 characters.")
      return null
    }
    setLoading(true)
    try {
      const result = await axios.post(`${serverUrl}/api/auth/reset-password`, { email, newPassword }, { withCredentials: true })
      setErr("")
      console.log(result)
      setLoading(false)
      navigate("/signin")
    } catch (error) {
      setErr(getErrorMessage(error, "Could not reset the password. Please try again."))
      setLoading(false)
    }
  }

  const steps = [
    { n: 1, label: "Email" },
    { n: 2, label: "OTP" },
    { n: 3, label: "Password" },
  ]

  return (
    <AuthLayout>
      <div className='card !rounded-3xl shadow-card p-7 sm:p-8'>
        <div className='flex items-center gap-3 mb-5'>
          <div className='w-10 h-10 grid place-items-center rounded-xl bg-white border border-blinkit-border cursor-pointer transition hover:-translate-x-1 hover:shadow-soft' onClick={() => navigate("/signin")}>
            <IoIosArrowRoundBack size={22} className='text-blinkit-green' />
          </div>
          <div className='lg:hidden flex items-center gap-2'>
            <Logo size="sm" />
          </div>
          <h1 className='font-display text-xl font-bold text-blinkit-text'>Reset Password</h1>
        </div>

        {/* progress steps */}
        <div className='flex items-center mb-7'>
          {steps.map((s, i) => (
            <React.Fragment key={s.n}>
              <div className='flex flex-col items-center gap-1.5'>
                <div className={`w-9 h-9 rounded-full grid place-items-center text-xs font-bold transition-all duration-300 ${step > s.n ? 'bg-blinkit-green text-white' : step === s.n ? 'bg-blinkit-green-soft text-blinkit-green-dark ring-2 ring-blinkit-green animate-ring' : 'bg-blinkit-bg text-blinkit-text-muted border border-blinkit-border'}`}>
                  {step > s.n ? <FaCheck size={14} /> : s.n}
                </div>
                <span className={`text-[11px] font-semibold ${step >= s.n ? 'text-blinkit-green-dark' : 'text-blinkit-text-muted'}`}>{s.label}</span>
              </div>
              {i < steps.length - 1 && <div className={`flex-1 h-1 mx-2 rounded-full transition-all duration-500 ${step > s.n ? 'bg-blinkit-green' : 'bg-blinkit-border'}`} />}
            </React.Fragment>
          ))}
        </div>

        {step == 1 && (
          <form className='animate-fade-in' onSubmit={(e) => { e.preventDefault(); handleSendOtp() }}>
            <div className='mb-6'>
              <label htmlFor="email" className='label'>Email</label>
              <div className='relative'>
                <FaEnvelope className='absolute left-4 top-1/2 -translate-y-1/2 text-blinkit-text-muted text-sm' />
                <input id="email" type="email" className='input pl-11' placeholder='Enter your Email' onChange={(e) => setEmail(e.target.value)} value={email} required />
              </div>
            </div>
            <button type="submit" className='btn btn-primary w-full !py-3' disabled={loading}>
              {loading ? <ClipLoader size={20} color='white' /> : "Send Otp"}
            </button>
            {err && <div className="flex items-center gap-2 mt-4 text-red-500 text-sm bg-red-50 border border-red-100 rounded-xl px-3.5 py-2.5 animate-scale-in"><FaCircleAlert size={16} /><span>{err}</span></div>}
          </form>
        )}

        {step == 2 && (
          <form className='animate-fade-in' onSubmit={(e) => { e.preventDefault(); handleVerifyOtp() }}>
            <div className='mb-6'>
              <label htmlFor="otp" className='label'>OTP</label>
              <div className='relative'>
                <FaHashtag className='absolute left-4 top-1/2 -translate-y-1/2 text-blinkit-text-muted text-sm' />
                <input id="otp" type="text" className='input pl-11 tracking-[0.4em] font-semibold' placeholder='Enter OTP' onChange={(e) => setOtp(e.target.value)} value={otp} required />
              </div>
            </div>
            <button type="submit" className='btn btn-primary w-full !py-3' disabled={loading}>
              {loading ? <ClipLoader size={20} color='white' /> : "Verify"}
            </button>
            {err && <div className="flex items-center gap-2 mt-4 text-red-500 text-sm bg-red-50 border border-red-100 rounded-xl px-3.5 py-2.5 animate-scale-in"><FaCircleAlert size={16} /><span>{err}</span></div>}
          </form>
        )}
        {step == 3 && (
          <form className='animate-fade-in' onSubmit={(e) => { e.preventDefault(); handleResetPassword() }}>
            <div className='mb-5'>
              <label htmlFor="newPassword" className='label'>New Password</label>
              <div className='relative'>
                <FaKey className='absolute left-4 top-1/2 -translate-y-1/2 text-blinkit-text-muted text-sm' />
                <input id="newPassword" type="password" className='input pl-11' placeholder='Enter New Password' onChange={(e) => setNewPassword(e.target.value)} value={newPassword} />
              </div>
            </div>
            <div className='mb-6'>
              <label htmlFor="confirmPassword" className='label'>Confirm Password</label>
              <div className='relative'>
                <FaKey className='absolute left-4 top-1/2 -translate-y-1/2 text-blinkit-text-muted text-sm' />
                <input id="confirmPassword" type="password" className='input pl-11' placeholder='Confirm Password' onChange={(e) => setConfirmPassword(e.target.value)} value={confirmPassword} required />
              </div>
            </div>
            <button type="submit" className='btn btn-primary w-full !py-3' disabled={loading}>
              {loading ? <ClipLoader size={20} color='white' /> : "Reset Password"}
            </button>
            {err && <div className="flex items-center gap-2 mt-4 text-red-500 text-sm bg-red-50 border border-red-100 rounded-xl px-3.5 py-2.5 animate-scale-in"><FaCircleAlert size={16} /><span>{err}</span></div>}
          </form>
        )}
      </div>
    </AuthLayout>
  )
}

export default ForgotPassword
