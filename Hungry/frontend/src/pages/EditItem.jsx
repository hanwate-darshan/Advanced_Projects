import React, { useEffect } from 'react'
import { IoIosArrowRoundBack } from "react-icons/io";
import { useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { FaUtensils } from "react-icons/fa";
import { useState } from 'react';
import axios from 'axios';
import { serverUrl } from '../App';
import { setMyShopData } from '../redux/ownerSlice';
import { ClipLoader } from 'react-spinners';
import { FaImage } from "react-icons/fa6";
import { FaSave } from "react-icons/fa";
function EditItem() {
    const navigate = useNavigate()
  const { itemId } = useParams()
    const [currentItem, setCurrentItem] = useState(null)
    const [name, setName] = useState("")
    const [price, setPrice] = useState(0)
    const [frontendImage, setFrontendImage] = useState("")
    const [backendImage, setBackendImage] = useState(null)
    const [category, setCategory] = useState("")
    const [foodType, setFoodType] = useState("")
    const [loading, setLoading] = useState(false)
    const categories = ["Snacks",
        "Main Course",
        "Desserts",
        "Pizza",
        "Burgers",
        "Sandwiches",
        "South Indian",
        "North Indian",
        "Chinese",
        "Fast Food",
        "Others"]
    const dispatch = useDispatch()
    const handleImage = (e) => {
        const file = e.target.files[0]
        setBackendImage(file)
        setFrontendImage(URL.createObjectURL(file))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const formData = new FormData()
            formData.append("name", name)
            formData.append("category", category)
            formData.append("foodType", foodType)
            formData.append("price", price)
            if (backendImage) {
                formData.append("image", backendImage)
            }
            const result = await axios.post(`${serverUrl}/api/item/edit-item/${itemId}`, formData, { withCredentials: true })
            dispatch(setMyShopData(result.data))
            setLoading(false)
            navigate("/")
        } catch (error) {
            console.log(error)
            setLoading(false)
        }
    }

    useEffect(() => {
        const handleGetItemById = async () => {
            try {
                const result = await axios.get(`${serverUrl}/api/item/get-by-id/${itemId}`, { withCredentials: true })
                setCurrentItem(result.data)
            } catch (error) {
                console.log(error)
            }
        }
        handleGetItemById()
    }, [itemId])

    useEffect(() => {
        setName(currentItem?.name || "")
        setPrice(currentItem?.price || 0)
        setCategory(currentItem?.category || "")
        setFoodType(currentItem?.foodType || "")
        setFrontendImage(currentItem?.image || "")
    }, [currentItem])
    return (
        <div className='flex justify-center flex-col items-center p-6 bg-blinkit-bg relative min-h-screen'>
            <button className='back-btn' onClick={() => navigate("/")}>
                <IoIosArrowRoundBack size={20} className="text-blinkit-green" />
                <span>Back</span>
            </button>

            <div className='max-w-lg w-full mt-10 sm:mt-0 animate-fade-up'>
                <div className='bg-white card !rounded-3xl shadow-card p-6 sm:p-8 overflow-hidden'>
                    <div className='flex flex-col items-center mb-8 relative'>
                        <div className='w-20 h-20 rounded-3xl bg-[linear-gradient(135deg,#FFC24B,#F6A92B)] grid place-items-center shadow-glow-amber mb-4 animate-bob'>
                            <FaUtensils className='text-brand-ink w-9 h-9' />
                        </div>
                        <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-blinkit-text tracking-tight">
                            Edit Food Item
                        </h2>
                        <p className='text-sm text-blinkit-text-secondary mt-1 font-medium'>Changes save straight to your menu</p>
                    </div>
                    <form className='space-y-5' onSubmit={handleSubmit}>
                        <div>
                            <label className='label'>Name</label>
                            <input type="text" placeholder='Enter Item Name' className='input'
                                onChange={(e) => setName(e.target.value)}
                                value={name}
                            />
                        </div>
                        <div>
                            <label className='label'>Food Image</label>
                            {frontendImage && <div className='relative group animate-scale-in mb-3'>
                                <img src={frontendImage} alt="" className='w-full h-48 object-cover rounded-2xl border border-blinkit-border-light' />
                                <span className='chip bg-blinkit-green text-white absolute top-3 right-3 shadow-soft'>Preview</span>
                            </div>}
                            <label className='flex flex-col items-center justify-center border-2 border-dashed border-blinkit-border rounded-2xl p-5 cursor-pointer transition-all duration-200 hover:border-blinkit-green/50 hover:bg-blinkit-green-soft/40'>
                                <input type="file" accept='image/*' className='w-full text-xs' onChange={handleImage} />
                                {!backendImage && (
                                    <span className='flex items-center gap-2 text-xs font-semibold text-blinkit-text-muted -mt-1'>
                                        <FaImage size={14} /> Change image (optional)
                                    </span>
                                )}
                            </label>
                        </div>
                        <div className='grid grid-cols-2 gap-4'>
                            <div>
                                <label className='label'>Price (₹)</label>
                                <input type="number" placeholder='0' className='input'
                                    onChange={(e) => setPrice(e.target.value)}
                                    value={price}
                                />
                            </div>
                            <div>
                                <label className='label'>Food Type</label>
                                <select className='input cursor-pointer'
                                    onChange={(e) => setFoodType(e.target.value)}
                                    value={foodType}
                                >
                                    <option value="veg">veg</option>
                                    <option value="non veg">non veg</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className='label'>Select Category</label>
                            <select className='input cursor-pointer'
                                onChange={(e) => setCategory(e.target.value)}
                                value={category}
                            >
                                <option value="">select Category</option>
                                {categories.map((cate, index) => (
                                    <option value={cate} key={index}>{cate}</option>
                                ))}
                            </select>
                        </div>

                        <button className='btn btn-primary w-full !py-3.5 mt-2' disabled={loading}>
                            {loading ? <ClipLoader size={20} color='white' /> : <><FaSave size={14} /> Save Changes</>}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default EditItem
