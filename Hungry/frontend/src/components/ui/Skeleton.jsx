import React from 'react'

export function Skeleton({ className = "" }) {
  return <div className={`skeleton ${className}`} aria-hidden="true" />
}

export function FoodCardSkeleton() {
  return (
    <div className='w-[250px] rounded-2xl border border-blinkit-border-light bg-white shadow-soft overflow-hidden'>
      <Skeleton className='w-full h-[168px] rounded-none' />
      <div className='p-4 space-y-2.5'>
        <Skeleton className='h-4 w-3/4' />
        <Skeleton className='h-3 w-1/2' />
        <div className='flex items-center justify-between pt-2'>
          <Skeleton className='h-5 w-14' />
          <Skeleton className='h-8 w-20 rounded-full' />
        </div>
      </div>
    </div>
  )
}

export function RestaurantCardSkeleton() {
  return (
    <div className='w-[168px] h-[196px] rounded-2xl border border-blinkit-border-light bg-white shadow-soft overflow-hidden'>
      <Skeleton className='w-full h-full rounded-none' />
    </div>
  )
}

export function FoodGridSkeleton({ count = 6 }) {
  return (
    <div className='w-full flex flex-wrap gap-5 justify-center' aria-busy="true" aria-label="Loading">
      {Array.from({ length: count }).map((_, i) => (
        <FoodCardSkeleton key={i} />
      ))}
    </div>
  )
}

export function CategoryRowSkeleton({ count = 5 }) {
  return (
    <div className='w-full flex gap-4 pb-2 overflow-hidden' aria-busy="true" aria-label="Loading categories">
      {Array.from({ length: count }).map((_, i) => (
        <RestaurantCardSkeleton key={i} />
      ))}
    </div>
  )
}
