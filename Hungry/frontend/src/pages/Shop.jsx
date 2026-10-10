import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { serverUrl } from '../App'
import { useNavigate, useParams } from 'react-router-dom'
import { FaStore, FaLocationDot, FaUtensils, FaArrowLeft, FaBowlFood } from "react-icons/fa6";
import FoodCard from '../components/FoodCard';
import { FoodGridSkeleton } from '../components/ui/Skeleton';
import { EmptyState, ErrorState } from '../components/ui/Feedback';
import Footer from '../components/ui/Footer';

function Shop() {
  const { shopId } = useParams()
  const [items, setItems] = useState(null)
  const [shop, setShop] = useState(null)
  const [error, setError] = useState(false)
  const navigate = useNavigate()

  const handleShop = async () => {
    setError(false)
    try {
      const result = await axios.get(`${serverUrl}/api/item/get-by-shop/${shopId}`, { withCredentials: true })
      setShop(result.data.shop)
      setItems(result.data.items)
    } catch (error) {
      console.log(error)
      setError(true)
    }
  }

  useEffect(() => {
    handleShop()
  }, [shopId])

  const loading = items === null

  return (
    <div className='min-h-screen bg-blinkit-bg flex flex-col'>
      <button className='back-btn' onClick={() => navigate("/")}>
        <FaArrowLeft size={14} className='text-blinkit-green' />
        <span>Back</span>
      </button>

      {shop && (
        <div className='relative w-full h-[280px] sm:h-[360px] lg:h-[420px] animate-fade-in'>
          <img src={shop.image} alt={shop.name} className='w-full h-full object-cover' />
          <div className='absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent flex flex-col justify-end items-center text-center px-4 pb-8'>
            <h1 className='font-display text-3xl md:text-5xl font-extrabold text-white drop-shadow-lg animate-fade-up' style={{ animationDelay: '.08s' }}>{shop.name}</h1>
            <div className='flex items-center gap-2 mt-3 chip bg-white/15 backdrop-blur-md ring-1 ring-white/20 text-white animate-fade-up' style={{ animationDelay: '.14s' }}>
              <FaLocationDot size={14} className='text-blinkit-yellow' />
              <span className='font-semibold text-sm'>{shop.address}</span>
            </div>
            <span className='mt-3 chip bg-white/15 backdrop-blur-md ring-1 ring-white/20 text-white animate-fade-up' style={{ animationDelay: '.2s' }}>
              <FaStore size={12} className='text-blinkit-yellow' />
              {shop.city}, {shop.state}
            </span>
          </div>
        </div>
      )}

      <div className='max-w-7xl mx-auto px-5 py-10 flex-1 w-full'>
        <h2 className='flex items-center justify-center gap-3 text-2xl sm:text-3xl font-display font-bold mb-10 text-blinkit-text'>
          <span className='bg-blinkit-green-soft p-2.5 rounded-xl text-blinkit-green-dark'><FaUtensils /></span>
          Our Menu
        </h2>

        {loading ? (
          <FoodGridSkeleton count={6} />
        ) : error ? (
          <ErrorState title="Couldn't load this restaurant" text="Please check your connection and try again." onRetry={handleShop} />
        ) : items.length > 0 ? (
          <div className='flex flex-wrap justify-center gap-6'>
            {items.map((item, index) => (
              <FoodCard data={item} index={index} key={item._id} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={FaBowlFood}
            title="No items available"
            text="This restaurant hasn't added menu items yet. Check back soon!"
            ctaLabel="Back to home"
            onCta={() => navigate("/")}
          />
        )}
      </div>
      <Footer />
    </div>
  )
}

export default Shop
