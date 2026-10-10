import React from 'react'
import { FaArrowRight, FaCheck } from "react-icons/fa6";

function CategoryCard({ name, image, onClick, index = 0, isActive = false }) {
  return (
    <button
      className={`group w-[130px] h-[150px] md:w-[168px] md:h-[196px] rounded-2xl shrink-0 overflow-hidden bg-white shadow-soft relative cursor-pointer border transition-all duration-300 hover:-translate-y-1.5 animate-fade-up focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blinkit-green/30
        ${isActive
          ? 'ring-4 ring-blinkit-green border-blinkit-green shadow-glow scale-[1.03] -translate-y-1'
          : 'border-blinkit-border-light hover:shadow-lift'}`}
      style={{ animationDelay: `${Math.min(index, 8) * 0.04}s` }}
      onClick={onClick}
      aria-label={`Browse ${name}`}
      aria-pressed={isActive}
    >
      <img
        src={image}
        alt={name}
        className={`w-full h-full object-cover transform transition-transform duration-700 ease-out group-hover:scale-[1.12] ${isActive ? 'scale-[1.08]' : ''}`}
        loading="lazy"
      />
      <div className={`absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent transition-all duration-300 ${isActive ? 'from-black/90' : 'group-hover:from-black/95'}`} />

      {isActive ? (
        <div className='absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-blinkit-green text-white text-[10px] font-extrabold flex items-center gap-1 shadow-md animate-scale-in'>
          <FaCheck size={9} /> Selected
        </div>
      ) : (
        <div className='absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-white/25 backdrop-blur grid place-items-center opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300'>
          <FaArrowRight size={11} className='text-white' />
        </div>
      )}

      <div className='absolute bottom-0 left-0 w-full p-3 text-left'>
        <span className='text-white font-display font-bold text-[13px] md:text-sm drop-shadow-md leading-tight block'>
          {name}
        </span>
      </div>
      <span className={`absolute bottom-0 left-0 w-full h-[3px] bg-[linear-gradient(90deg,#F0410F,#F5A623)] origin-left transition-transform duration-300 rounded-b-2xl ${isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`} />
    </button>
  )
}

export default CategoryCard
