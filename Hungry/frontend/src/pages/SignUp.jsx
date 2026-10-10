import React from 'react'
import { useState } from 'react';
import { FaRegEye, FaRegEyeSlash, FaEnvelope, FaLock, FaUser, FaStore, FaMotorcycle, FaPhoneAlt } from "react-icons/fa";
import { FaExclamationCircle as FaCircleAlert } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { useNavigate } from 'react-router-dom';
import axios from "axios"
import { serverUrl } from '../App';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../../firebase';
import { ClipLoader } from "react-spinners"
import { useDispatch } from 'react-redux';
import { setUserData } from '../redux/userSlice';
import AuthLayout from '../components/AuthLayout';
import Logo from '../components/ui/Logo';
import { getErrorMessage } from '../utils/error';
function SignUp() {
    const [showPassword, setShowPassword] = useState(false)
    const [role, setRole] = useState("user")
    const navigate = useNavigate()
    const [fullName, setFullName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [mobile, setMobile] = useState("")
    const [err, setErr] = useState("")
    const [loading, setLoading] = useState(false)
    const dispatch = useDispatch()
    const handleSignUp = async () => {
        setLoading(true)
        try {
            const result = await axios.post(`${serverUrl}/api/auth/signup`, {
                fullName, email, password, mobile, role
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
        if (!mobile) {
            return setErr("mobile no is required")
        }
        const provider = new GoogleAuthProvider()
        const result = await signInWithPopup(auth, provider)
        try {
            const { data } = await axios.post(`${serverUrl}/api/auth/google-auth`, {
                fullName: result.user.displayName,
                email: result.user.email,
                role,
                mobile
            }, { withCredentials: true })
            dispatch(setUserData(data))
        } catch (error) {
            console.log(error)
        }
    }

    const roles = [
        { key: "user", label: "Foodie", Icon: FaUser },
        { key: "owner", label: "Owner", Icon: FaStore },
        { key: "deliveryBoy", label: "Rider", Icon: FaMotorcycle },
    ]

    return (
        <AuthLayout>
            <div className='card !rounded-3xl shadow-card p-7 sm:p-8'>
                <div className='lg:hidden flex items-center gap-2.5 mb-6'>
                    <Logo />
                </div>

                <h1 className='font-display text-[26px] font-extrabold tracking-tight text-blinkit-text'>Create your account</h1>
                <p className='text-blinkit-text-secondary mb-6 text-sm mt-1'>Join Hungry and start your food journey.</p>

                {/* role selector */}
                <div className='mb-5'>
                    <label className='label'>I am a</label>
                    <div className='grid grid-cols-3 gap-2.5'>
                        {roles.map(({ key, label, Icon: IconComp }) => {
                            const Icon = IconComp
                            return (
                            <button
                                key={key}
                                className={`flex flex-col items-center gap-1.5 rounded-xl px-2 py-3 text-xs font-bold transition-all duration-200 cursor-pointer border ${role === key ? 'bg-blinkit-green-soft border-blinkit-green text-blinkit-green-dark shadow-soft -translate-y-0.5' : 'bg-white border-blinkit-border text-blinkit-text-secondary hover:border-blinkit-text-muted'}`}
                                onClick={() => setRole(key)}
                            >
                                <Icon size={20} />
                                {label}
                            </button>
                            )
                        })}
                    </div>
                </div>

                <form onSubmit={(e) => { e.preventDefault(); handleSignUp() }}>
                {/* fullName */}
                <div className='mb-4'>
                    <label htmlFor="fullName" className='label'>Full Name</label>
                    <div className='relative'>
                        <FaUser className='absolute left-4 top-1/2 -translate-y-1/2 text-blinkit-text-muted text-sm' />
                        <input id="fullName" type="text" className='input pl-11' placeholder='Enter your Full Name' onChange={(e) => setFullName(e.target.value)} value={fullName} required />
                    </div>
                </div>
                {/* email */}
                <div className='mb-4'>
                    <label htmlFor="email" className='label'>Email</label>
                    <div className='relative'>
                        <FaEnvelope className='absolute left-4 top-1/2 -translate-y-1/2 text-blinkit-text-muted text-sm' />
                        <input id="email" type="email" className='input pl-11' placeholder='Enter your Email' onChange={(e) => setEmail(e.target.value)} value={email} required />
                    </div>
                </div>
                {/* mobile */}
                <div className='mb-4'>
                    <label htmlFor="mobile" className='label'>Mobile</label>
                    <div className='relative'>
                        <FaPhoneAlt className='absolute left-4 top-1/2 -translate-y-1/2 text-blinkit-text-muted text-sm' />
                        <input id="mobile" type="tel" className='input pl-11' placeholder='Enter your Mobile Number' onChange={(e) => setMobile(e.target.value)} value={mobile} required />
                    </div>
                </div>
                {/* password */}
                <div className='mb-5'>
                    <label htmlFor="password" className='label'>Password</label>
                    <div className='relative'>
                        <FaLock className='absolute left-4 top-1/2 -translate-y-1/2 text-blinkit-text-muted text-sm' />
                        <input id="password" type={`${showPassword ? "text" : "password"}`} className='input pl-11 pr-11' placeholder='Enter your password' onChange={(e) => setPassword(e.target.value)} value={password} required />
                        <button type="button" className='absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-blinkit-text-muted hover:text-blinkit-text transition' onClick={() => setShowPassword(prev => !prev)} aria-label="Toggle password visibility">{!showPassword ? <FaRegEye /> : <FaRegEyeSlash />}</button>
                    </div>
                </div>

                <button type="submit" className='btn btn-primary w-full !py-3' disabled={loading}>
                    {loading ? <ClipLoader size={20} color='white' /> : "Sign Up"}
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

                <button className='btn btn-ghost w-full !py-3' onClick={handleGoogleAuth}>
                    <FcGoogle size={20} />
                    <span>Sign up with Google</span>
                </button>

                <p className='text-center mt-6 text-sm text-blinkit-text-secondary'>
                    Already have an account?{' '}
                    <span className='cursor-pointer text-blinkit-green font-bold transition hover:opacity-70' onClick={() => navigate("/signin")}>Sign In</span>
                </p>            </div>
        </AuthLayout>
    )
}

export default SignUp
