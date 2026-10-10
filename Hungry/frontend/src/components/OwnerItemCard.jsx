import axios from 'axios';
import React from 'react'
import { FaPen } from "react-icons/fa";
import { FaTrashAlt } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import { serverUrl } from '../App';
import { useDispatch } from 'react-redux';
import { setMyShopData } from '../redux/ownerSlice';
import VegBadge from './ui/VegBadge';

function OwnerItemCard({ data, index = 0 }) {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const handleDelete = async () => {
      if (!window.confirm(`Remove "${data.name}" from your menu?`)) return
      try {
        const result = await axios.get(`${serverUrl}/api/item/delete/${data._id}`, { withCredentials: true })
        dispatch(setMyShopData(result.data))
      } catch (error) {
        console.log(error)
      }
    }
  return (
    <div
      className='group flex bg-white rounded-2xl shadow-soft overflow-hidden border border-blinkit-border-light w-full max-w-2xl transition-all duration-300 hover:shadow-card hover:-translate-y-0.5 hover:border-blinkit-green/25 animate-fade-up'
      style={{ animationDelay: `${Math.min(index, 8) * 0.05}s` }}
    >
      <div className='w-36 flex-shrink-0 relative overflow-hidden'>
        <img src={data.image} alt={data.name} className='w-full h-full object-cover min-h-[110px] transition-transform duration-500 group-hover:scale-[1.08]' loading="lazy" />
      </div>
      <div className='flex flex-col justify-between p-3 sm:p-4 flex-1 gap-2'>
          <div>
            <div className='flex items-center gap-2'>
              <VegBadge type={data.foodType} />
              <h2 className='text-base font-bold text-blinkit-text truncate' title={data.name}>{data.name}</h2>
            </div>
            <div className='flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5'>
              <p className='text-sm flex items-center gap-1.5'>
                <span className='font-medium text-blinkit-text-muted text-xs uppercase tracking-wide'>Category</span>
                <span className='chip bg-blinkit-bg text-blinkit-text-secondary !py-0.5'>{data.category}</span>
              </p>
            </div>
          </div>
          <div className='flex items-center justify-between'>
            <div className='font-extrabold text-lg text-blinkit-green tracking-tight tabular-nums'>₹{data.price}</div>
            <div className='flex items-center gap-1.5'>
              <button className='p-2 cursor-pointer rounded-xl bg-blinkit-green-soft text-blinkit-green-dark hover:bg-blinkit-green hover:text-white transition-all duration-200 hover:scale-105 hover:shadow-soft' onClick={()=>navigate(`/edit-item/${data._id}`)} aria-label={`Edit ${data.name}`}>
                <FaPen size={13}/>
              </button>
              <button className='p-2 cursor-pointer rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all duration-200 hover:scale-105 hover:shadow-soft' onClick={handleDelete} aria-label={`Delete ${data.name}`}>
                <FaTrashAlt size={13}/>
              </button>
            </div>
          </div>
      </div>
    </div>
  )
}

export default OwnerItemCard
