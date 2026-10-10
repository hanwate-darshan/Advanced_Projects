import React from 'react'
import { FaMinus, FaPlus } from "react-icons/fa";
import { FaTrashAlt } from "react-icons/fa";
import { useDispatch } from 'react-redux';
import { removeCartItem, updateQuantity } from '../redux/userSlice';
import VegBadge from './ui/VegBadge';

function CartItemCard({ data, index = 0 }) {
  const dispatch = useDispatch()
  const handleIncrease = (id, currentQty) => {
    dispatch(updateQuantity({ id, quantity: currentQty + 1 }))
  }
  const handleDecrease = (id, currentQty) => {
    if (currentQty > 1) {
      dispatch(updateQuantity({ id, quantity: currentQty - 1 }))
    }
  }
  return (
    <div
      className='group flex items-center justify-between bg-white p-3 sm:p-4 rounded-2xl shadow-soft border border-blinkit-border-light transition-all duration-300 hover:shadow-card hover:-translate-y-0.5 hover:border-blinkit-green/25 animate-fade-up'
      style={{ animationDelay: `${Math.min(index, 8) * 0.05}s` }}
    >
      <div className='flex items-center gap-4 min-w-0'>
        <div className='relative shrink-0'>
          <img src={data.image} alt={data.name} className='w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-xl border border-blinkit-border-light flex-shrink-0 transition-transform duration-300 group-hover:scale-[1.04]' loading="lazy" />
          <span className='absolute -top-2 -right-2 min-w-[22px] h-[22px] px-1 rounded-full bg-blinkit-green text-white text-[11px] font-extrabold grid place-items-center shadow-soft ring-2 ring-white tabular-nums'>
            {data.quantity}
          </span>
        </div>
        <div className='min-w-0'>
          <div className='flex items-center gap-1.5'>
            <VegBadge type={data.foodType} />
            <h3 className='font-bold text-blinkit-text text-sm truncate' title={data.name}>{data.name}</h3>
          </div>
          <p className="text-blinkit-green font-extrabold text-base mt-1 tracking-tight tabular-nums">₹{data.price * data.quantity}</p>
          <p className='text-xs text-blinkit-text-muted font-medium'>₹{data.price} each × {data.quantity}</p>
        </div>
      </div>
      <div className='flex items-center gap-2 sm:gap-3 flex-shrink-0'>
        <div className='flex items-center rounded-full border border-blinkit-green/30 overflow-hidden bg-white shadow-soft'>
          <button className='w-8 h-8 grid place-items-center text-blinkit-green hover:bg-blinkit-green-soft transition cursor-pointer' onClick={() => handleDecrease(data.id, data.quantity)} aria-label="Decrease quantity"><FaMinus size={10} /></button>
          <span className='font-extrabold text-sm text-blinkit-text min-w-[24px] text-center tabular-nums'>{data.quantity}</span>
          <button className='w-8 h-8 grid place-items-center text-blinkit-green hover:bg-blinkit-green-soft transition cursor-pointer' onClick={() => handleIncrease(data.id, data.quantity)} aria-label="Increase quantity"><FaPlus size={10} /></button>
        </div>
        <button className="p-2.5 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all duration-200 border border-red-100 cursor-pointer hover:scale-105 hover:shadow-soft" onClick={() => dispatch(removeCartItem(data.id))} aria-label="Remove item">
          <FaTrashAlt size={14} />
        </button>
      </div>
    </div>
  )
}

export default CartItemCard
