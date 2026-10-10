import React from 'react'

function VegBadge({ type, size = "md" }) {
  const box = size === "lg" ? "w-5 h-5" : "w-4 h-4"
  const dot = size === "lg" ? "w-2.5 h-2.5" : "w-2 h-2"
  const isVeg = type === "veg"
  return (
    <span
      className={`inline-flex items-center justify-center ${box} rounded-[4px] border-2 bg-white shrink-0`}
      style={{ borderColor: isVeg ? "#16A34A" : "#DC2626" }}
      title={isVeg ? "Veg" : "Non-veg"}
      aria-label={isVeg ? "Veg" : "Non-veg"}
    >
      <span className={`${dot} rounded-full`} style={{ background: isVeg ? "#16A34A" : "#DC2626" }} />
    </span>
  )
}

export default VegBadge
