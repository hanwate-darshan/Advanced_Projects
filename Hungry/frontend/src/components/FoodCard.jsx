import React, { useState } from 'react'
import { FaMinus, FaPlus } from "react-icons/fa6";
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../redux/userSlice';
import VegBadge from './ui/VegBadge';
import Rating from './ui/Rating';

function FoodCard({ data, index = 0, reason = null }) {
  const [quantity, setQuantity] = useState(0)
  const dispatch = useDispatch()
  const { cartItems } = useSelector(state => state.user)

  const handleIncrease = () => setQuantity(quantity + 1)
  const handleDecrease = () => { if (quantity > 0) setQuantity(quantity - 1) }

  const inCart = cartItems.some(i => i.id == data._id)
  const shopId = data.shop?._id || data.shop

  return (
    <div
      className='group w-[250px] rounded-2xl border border-blinkit-border-light bg-white shadow-soft overflow-hidden hover:shadow-lift hover:-translate-y-1.5 hover:border-blinkit-green/30 transition-all duration-300 flex flex-col animate-fade-up'
      style={{ animationDelay: `${Math.min(index, 8) * 0.05}s` }}
    >
      <div className='relative w-full h-[168px] overflow-hidden bg-blinkit-bg'>
        <img src={data.image} alt={data.name} className='w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.08]' loading="lazy" />

        <div className='absolute top-3 left-3'>
          <span className='inline-flex items-center justify-center w-7 h-7 rounded-lg bg-white/95 backdrop-blur shadow-soft'>
            <VegBadge type={data.foodType} />
          </span>
        </div>

        {data.rating?.average > 0 && (
          <div className='absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-full bg-white/95 backdrop-blur px-2 py-1 shadow-soft'>
            <span className='text-[11px] font-extrabold text-blinkit-text tabular-nums'>{Number(data.rating.average).toFixed(1)}</span>
            <span className='text-blinkit-yellow text-[11px] leading-none'>★</span>
          </div>
        )}

        <div className='absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300' />
      </div>

      <div className="flex-1 flex flex-col p-4">
        <div className='flex items-start gap-1.5'>
          <h3 className='font-bold text-blinkit-text text-[15px] leading-tight flex-1 min-w-0' title={data.name}>
            <span className='line-clamp-2'>{data.name}</span>
          </h3>
        </div>
        {reason && (
          <p className='mt-2 text-[11px] leading-snug font-medium text-blinkit-text-secondary bg-blinkit-green-soft/70 border border-blinkit-green/15 rounded-lg px-2 py-1.5 line-clamp-2'>
            <span className='text-blinkit-green-dark font-bold'>Why this? </span>{reason}
          </p>
        )}
        <div className='flex items-center justify-between mt-2'>
          {data.shop?.name ? (
            <span className='text-[11px] font-semibold text-blinkit-text-muted truncate max-w-[70%]'>{data.shop.name}</span>
          ) : (
            <span className='text-[11px] font-semibold text-blinkit-text-muted capitalize'>{data.category}</span>
          )}
          <Rating rating={data.rating?.average || 0} showCount count={data.rating?.count || 0} />
        </div>
      </div>

      <div className='flex items-center justify-between gap-2 px-4 pb-4 border-t border-blinkit-border-light bg-gradient-to-b from-transparent to-blinkit-bg/40 -mt-2 pt-3'>
        <span className='font-extrabold text-blinkit-text text-lg tracking-tight tabular-nums'>₹{data.price}</span>

        <div className='flex items-center gap-2'>
          <div className={`flex items-center rounded-full border overflow-hidden transition-all duration-300 ${inCart ? 'border-blinkit-green/40 bg-blinkit-green-soft/60' : 'border-blinkit-green/30 bg-white'}`}>
            <button className='w-7 h-7 grid place-items-center text-blinkit-green hover:bg-blinkit-green hover:text-white transition-all duration-200' onClick={handleDecrease} aria-label="Decrease quantity"><FaMinus size={9} /></button>
            <span className='font-extrabold text-xs px-1 min-w-[20px] text-center text-blinkit-text tabular-nums transition-all duration-200'>{quantity}</span>
            <button className='w-7 h-7 grid place-items-center text-blinkit-green hover:bg-blinkit-green hover:text-white transition-all duration-200' onClick={handleIncrease} aria-label="Increase quantity"><FaPlus size={9} /></button>
          </div>
          <button
            className={`btn !px-4 !py-2 text-xs !rounded-full tracking-wide ${inCart ? 'bg-blinkit-green-dark text-white shadow-soft' : 'btn-primary'}`}
            onClick={() => (quantity > 0 ? dispatch(addToCart({
              id: data._id,
              name: data.name,
              price: data.price,
              image: data.image,
              shop: shopId,
              quantity,
              foodType: data.foodType
            })) : null)}
          >
            {inCart ? "ADDED" : "ADD"}
          </button>
        </div>
      </div>
    </div>
  )
}

export default FoodCard
