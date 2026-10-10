import React from 'react'
import { FaStar } from "react-icons/fa"
import { FaRegStar, FaStarHalfStroke } from "react-icons/fa6"

function Rating({ rating = 0, size = "text-[13px]", showCount = false, count = 0, color = "text-blinkit-yellow" }) {
  const stars = []
  for (let i = 1; i <= 5; i++) {
    if (rating >= i - 0.25) {
      stars.push(<FaStar key={i} className={`${color} ${size}`} />)
    } else if (rating >= i - 0.75) {
      stars.push(<FaStarHalfStroke key={i} className={`${color} ${size}`} />)
    } else {
      stars.push(<FaRegStar key={i} className='text-blinkit-border text-[13px]' />)
    }
  }
  return (
    <span className='inline-flex items-center gap-1' aria-label={`Rated ${rating} out of 5`}>
      {stars}
      {showCount && (
        <span className='text-[11px] text-blinkit-text-secondary font-bold bg-blinkit-bg rounded-md px-1.5 py-0.5 ml-0.5'>
          {count || 0}
        </span>
      )}
    </span>
  )
}

export default Rating
