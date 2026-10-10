import React from 'react'
import { IoIosArrowRoundBack } from "react-icons/io";
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FaUtensils } from "react-icons/fa";
import { FaStore, FaImage } from "react-icons/fa6";
import { FaSave } from "react-icons/fa";
import { useState } from 'react';
import axios from 'axios';
import { serverUrl } from '../App';
import { setMyShopData } from '../redux/ownerSlice';
import { ClipLoader } from 'react-spinners';
function CreateEditShop() {
    const navigate = useNavigate()
    const { myShopData } = useSelector(state => state.owner)
    const { currentCity, currentState, currentAddress } = useSelector(state => state.user)
    const [name, setName] = useState(myShopData?.name || "")
    const [address, setAddress] = useState(myShopData?.address || currentAddress)
    const [city, setCity] = useState(myShopData?.city || currentCity)
    const [state, setState] = useState(myShopData?.state || currentState)
    const [frontendImage, setFrontendImage] = useState(myShopData?.image || null)
    const [backendImage, setBackendImage] = useState(null)
    const [loading, setLoading] = useState(false)
    const [err, setErr] = useState("")
    const dispatch = useDispatch()
    const handleImage = (e) => {
        const file = e.target.files[0]
        setBackendImage(file)
        setFrontendImage(URL.createObjectURL(file))
        setErr("")
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setErr("")
        if (!name || !city || !state || !address) {
            setErr("Please fill all required fields")
            return
        }
        if (!myShopData && !backendImage) {
            setErr("Please select a shop image")
            return
        }
        setLoading(true)
        try {
            const formData = new FormData()
            formData.append("name", name)
            formData.append("city", city)
            formData.append("state", state)
            formData.append("address", address)
            if (backendImage) {
                formData.append("image", backendImage)
            }
            const result = await axios.post(`${serverUrl}/api/shop/create-edit`, formData, { withCredentials: true })
            dispatch(setMyShopData(result.data))
            setLoading(false)
            navigate("/")
        } catch (error) {
            console.log(error)
            setErr(error.response?.data?.message || "Something went wrong while saving the shop")
            setLoading(false)
        }
    }
    return (
        <div className='flex justify-center flex-col items-center p-6 bg-blinkit-bg relative min-h-screen'>
            <button className='back-btn' onClick={() => navigate("/")}>
                <IoIosArrowRoundBack size={20} className="text-blinkit-green" />
                <span>Back</span>
            </button>

            <div className='max-w-lg w-full mt-10 sm:mt-0 animate-fade-up'>
                <div className='bg-white card !rounded-3xl shadow-card p-6 sm:p-8 overflow-hidden'>
                    <div className='flex flex-col items-center mb-8 relative'>
                        <div className='w-20 h-20 rounded-3xl bg-[linear-gradient(135deg,#F95B23,#F0410F_60%,#D53A0B)] grid place-items-center shadow-glow mb-4 animate-bob'>
                            <FaStore className='text-white w-9 h-9' />
                        </div>
                        <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-blinkit-text tracking-tight">
                            {myShopData ? "Edit Shop" : "Add Shop"}
                        </h2>
                        <p className='text-sm text-blinkit-text-secondary mt-1 font-medium'>
                            {myShopData ? "Update your shop details anytime" : "Set up your shop in under a minute"}
                        </p>
                    </div>
                    {err && (
                        <div className='mb-4 p-3 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-xs font-semibold text-center animate-fade-in'>
                            {err}
                        </div>
                    )}
                    <form className='space-y-5' onSubmit={handleSubmit}>
                        <div>
                            <label className='label'>Shop Name</label>
                            <input type="text" placeholder='Enter Shop Name' className='input'
                                onChange={(e) => setName(e.target.value)}
                                value={name}
                            />
                        </div>
                        <div>
                            <label className='label'>Shop Image</label>
                            {frontendImage && <div className='relative group animate-scale-in mb-3'>
                                <img src={frontendImage} alt="" className='w-full h-48 object-cover rounded-2xl border border-blinkit-border-light' />
                                <span className='chip bg-blinkit-green text-white absolute top-3 right-3 shadow-soft'>Preview</span>
                            </div>}
                            <label className='flex flex-col items-center justify-center border-2 border-dashed border-blinkit-border rounded-2xl p-5 cursor-pointer transition-all duration-200 hover:border-blinkit-green/50 hover:bg-blinkit-green-soft/40'>
                                <input type="file" accept='image/*' className='w-full text-xs' onChange={handleImage} />
                                {!backendImage && (
                                    <span className='flex items-center gap-2 text-xs font-semibold text-blinkit-text-muted -mt-1'>
                                        <FaImage size={14} /> {myShopData ? "Change cover image (optional)" : "PNG, JPG or WEBP"}
                                    </span>
                                )}
                            </label>
                        </div>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                            <div>
                                <label className='label'>City</label>
                                <input type="text" placeholder='City' className='input' onChange={(e) => setCity(e.target.value)}
                                    value={city} />
                            </div>
                            <div>
                                <label className='label'>State</label>
                                <input type="text" placeholder='State' className='input' onChange={(e) => setState(e.target.value)}
                                    value={state} />
                            </div>
                        </div>
                        <div>
                            <label className='label'>Address</label>
                            <input type="text" placeholder='Enter Shop Address' className='input' onChange={(e) => setAddress(e.target.value)}
                                value={address} />
                        </div>
                        <button className='btn btn-primary w-full !py-3.5 mt-2' disabled={loading}>
                            {loading ? <ClipLoader size={20} color='white' /> : <><FaSave size={14} /> Save Shop</>}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default CreateEditShop
