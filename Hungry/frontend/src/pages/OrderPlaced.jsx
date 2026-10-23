import React, { useEffect } from 'react'
import { FaCircleCheck, FaBurger, FaClock, FaBoxOpen, FaLocationDot } from "react-icons/fa6";
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { clearCart } from '../redux/userSlice';

function OrderPlaced() {
    const navigate = useNavigate()
    const location = useLocation()
    const dispatch = useDispatch()
    const { myOrders } = useSelector(state => state.user)
    const targetOrderId = location.state?.orderId || myOrders?.[0]?._id

    useEffect(() => {
        dispatch(clearCart())
    }, [dispatch])
  return (
    <div className='min-h-screen bg-blinkit-bg flex flex-col justify-center items-center px-4 text-center relative overflow-hidden'>
      <div className='absolute top-0 left-1/2 -translate-x-1/2 w-[560px] h-[280px] bg-blinkit-green/10 blur-3xl rounded-full pointer-events-none' />
      <div className='relative flex flex-col items-center -mt-16'>
        <div className='relative mb-8'>
          <span className='absolute inset-0 rounded-full bg-blinkit-green/20 blur-xl animate-ring' />
          <div className='bg-white rounded-full p-5 shadow-lift animate-check-pop'>
            <FaCircleCheck className='text-blinkit-green text-6xl' />
          </div>
          <span className='absolute -top-1 right-2 w-4 h-4 rounded-full bg-blinkit-yellow ring-4 ring-blinkit-bg animate-pulse-dot' />
        </div>
        <h1 className='font-display text-3xl sm:text-4xl font-extrabold text-blinkit-text tracking-tight mb-3 animate-fade-up' style={{ animationDelay: '.15s' }}>
          Order Placed Successfully!
        </h1>
        <p className='text-blinkit-text-secondary max-w-md mb-8 text-[15px] leading-relaxed font-medium animate-fade-up' style={{ animationDelay: '.22s' }}>
          Thank you for ordering with Hungry. Your payment has been received and the restaurant is preparing your food.
        </p>

        <div className='flex items-center gap-3 mb-10 animate-fade-up' style={{ animationDelay: '.3s' }}>
          {[
            { Icon: FaClock, label: 'Prepared with care' },
            { Icon: FaBoxOpen, label: 'Packed fresh' },
            { Icon: FaBurger, label: 'Speed delivered' },
          ].map(({ Icon: IconComp, label }, i) => {
            const Icon = IconComp
            return (
              <div key={i} className='flex flex-col items-center gap-1.5 card !rounded-2xl px-4 py-3 shadow-soft transition-all duration-200 hover:-translate-y-1 hover:shadow-card cursor-default'>
                <Icon size={17} className='text-blinkit-green' />
                <span className='text-[11px] font-bold text-blinkit-text-secondary whitespace-nowrap'>{label}</span>
              </div>
            )
          })}
        </div>

        <div className='flex flex-wrap items-center justify-center gap-3 animate-fade-up' style={{ animationDelay: '.38s' }}>
          {targetOrderId ? (
            <button
              className='btn btn-primary !px-8 !py-3.5 !text-base flex items-center gap-2 shadow-glow'
              onClick={() => navigate(`/track-order/${targetOrderId}`)}
            >
              <FaLocationDot size={16} /> Track Order
            </button>
          ) : (
            <button
              className='btn btn-primary !px-8 !py-3.5 !text-base flex items-center gap-2 shadow-glow'
              onClick={() => navigate("/my-orders")}
            >
              <FaLocationDot size={16} /> Track Order in My Orders
            </button>
          )}
          <button
            className='btn btn-ghost !px-8 !py-3.5 !text-base border border-blinkit-border-light bg-white text-blinkit-text hover:bg-blinkit-bg'
            onClick={() => navigate("/my-orders")}
          >
            My Orders
          </button>
          <button className='btn btn-ghost !px-8 !py-3.5 !text-base' onClick={() => navigate("/")}>
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  )
}

export default OrderPlaced
