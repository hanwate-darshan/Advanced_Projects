import React from 'react'
import { useState } from 'react';
import { FaRegEye, FaRegEyeSlash, FaEnvelope, FaLock } from "react-icons/fa";
import { FaExclamationCircle as FaCircleAlert } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { useNavigate } from 'react-router-dom';
import axios from "axios"
import { serverUrl } from '../App';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../../firebase';
import { ClipLoader } from 'react-spinners';
import { useDispatch } from 'react-redux';
import { setUserData } from '../redux/userSlice';
import AuthLayout from '../components/AuthLayout';
import Logo from '../components/ui/Logo';
import { getErrorMessage } from '../utils/error';
function SignIn() {
    const [showPassword, setShowPassword] = useState(false)
    const navigate = useNavigate()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [err, setErr] = useState("")
    const [loading, setLoading] = useState(false)
    const dispatch = useDispatch()
    const handleSignIn = async () => {
        setLoading(true)
        try {
            const result = await axios.post(`${serverUrl}/api/auth/signin`, {
                email, password
            }, { withCredentials: true })
            dispatch(setUserData(result.data))
            setErr("")
            setLoading(false)
        } catch (error) {
            setErr(getErrorMessage(error))
            setLoading(false)
        }
    }
    const handleGoogleAuth = async () => {
        setErr("")
        const provider = new GoogleAuthProvider()
        try {
            const result = await signInWithPopup(auth, provider)
            const { data } = await axios.post(`${serverUrl}/api/auth/google-auth`, {
                fullName: result.user.displayName || "",
                email: result.user.email,
            }, { withCredentials: true })
            dispatch(setUserData(data))
        } catch (error) {
            setErr(getErrorMessage(error, "Google sign-in failed. Please try again."))
        }
    }
    return (
        <AuthLayout>
            <div className='card !rounded-3xl shadow-card p-7 sm:p-8'>
                {/* compact logo for mobile */}
                <div className='lg:hidden flex items-center gap-2.5 mb-6'>
                <Logo />
            </div>

                <h1 className='font-display text-[26px] font-extrabold tracking-tight text-blinkit-text'>Welcome back</h1>
                <p className='text-blinkit-text-secondary mb-7 text-sm mt-1'>Sign in to satisfy your cravings.</p>

                <form onSubmit={(e) => { e.preventDefault(); handleSignIn() }}>
                {/* email */}
                <div className='mb-4'>
                    <label htmlFor="email" className='label'>Email</label>
                    <div className='relative'>
                        <FaEnvelope className='absolute left-4 top-1/2 -translate-y-1/2 text-blinkit-text-muted text-sm' />
                        <input id="email" type="email" className='input pl-11' placeholder='Enter your Email' onChange={(e) => setEmail(e.target.value)} value={email} required />
                    </div>
                </div>
                {/* password */}
                <div className='mb-2'>
                    <label htmlFor="password" className='label'>Password</label>
                    <div className='relative'>
                        <FaLock className='absolute left-4 top-1/2 -translate-y-1/2 text-blinkit-text-muted text-sm' />
                        <input id="password" type={`${showPassword ? "text" : "password"}`} className='input pl-11 pr-11' placeholder='Enter your password' onChange={(e) => setPassword(e.target.value)} value={password} required />
                        <button type="button" className='absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-blinkit-text-muted hover:text-blinkit-text transition' onClick={() => setShowPassword(prev => !prev)} aria-label="Toggle password visibility">{!showPassword ? <FaRegEye /> : <FaRegEyeSlash />}</button>
                    </div>
                </div>

                <div className='flex justify-end mb-5 -mt-1'>
                    <span className='cursor-pointer text-blinkit-green font-semibold text-sm transition hover:opacity-70' onClick={() => navigate("/forgot-password")}>
                        Forgot Password?
                    </span>
                </div>

                <button type="submit" className='btn btn-primary w-full !py-3' disabled={loading}>
                    {loading ? <ClipLoader size={20} color='white' /> : "Sign In"}
                </button>
                </form>

                {err && (
                    <div className='flex items-center gap-2 mt-4 text-red-500 text-sm bg-red-50 border border-red-100 rounded-xl px-3.5 py-2.5 animate-scale-in'>
                        <FaCircleAlert size={16} /> <span>{err}</span>
                    </div>
                )}

                <div className='flex items-center gap-3 my-5'>
                    <span className='h-px flex-1 bg-blinkit-border' />
                    <span className='text-xs text-blinkit-text-muted font-semibold uppercase tracking-wide'>or</span>
                    <span className='h-px flex-1 bg-blinkit-border' />
                </div>

                <button type="button" className='btn btn-ghost w-full !py-3' onClick={handleGoogleAuth}>
                    <FcGoogle size={20} />
                    <span>Continue with Google</span>
                </button>

                <p className='text-center mt-6 text-sm text-blinkit-text-secondary'>
                    New to Hungry?{' '}
                    <span className='cursor-pointer text-blinkit-green font-bold transition hover:opacity-70' onClick={() => navigate("/signup")}>Create account</span>
                </p>
            </div>
        </AuthLayout>
    )
}

export default SignIn
