import React from 'react'
import { FaFireFlameCurved } from "react-icons/fa6"

function Logo({ size = "md", light = false }) {
  const box = size === "lg" ? "w-11 h-11 rounded-2xl" : size === "sm" ? "w-9 h-9 rounded-xl" : "w-10 h-10 rounded-xl"
  const icon = size === "lg" ? "text-[22px]" : size === "sm" ? "text-base" : "text-lg"
  const text = size === "lg" ? "text-2xl" : size === "sm" ? "text-lg" : "text-xl sm:text-2xl"
  return (
    <div className='flex items-center gap-2.5 shrink-0 select-none'>
      <div className={`${box} bg-[linear-gradient(135deg,#F95B23_0%,#F0410F_55%,#D53A0B_100%)] flex items-center justify-center shadow-glow`}>
        <FaFireFlameCurved className={`text-white ${icon}`} />
      </div>
      <span className={`${text} font-display font-extrabold tracking-tight ${light ? "text-white" : "text-blinkit-text"}`}>
        Hungry
        <span className='text-blinkit-green'>.</span>
      </span>
    </div>
  )
}

export default Logo
