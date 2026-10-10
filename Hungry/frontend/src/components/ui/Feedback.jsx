import React from 'react'

export function EmptyState({ icon, title, text, ctaLabel, onCta, compact = false }) {
  const Icon = icon
  return (
    <div className={`${compact ? "py-10" : "py-16"} w-full flex flex-col items-center text-center animate-fade-up`}>
      <div className={`${compact ? "w-14 h-14" : "w-20 h-20"} rounded-3xl bg-blinkit-green-soft grid place-items-center mb-5`}>
        <Icon className={`${compact ? "text-2xl" : "text-[34px]"} text-blinkit-green-dark`} />
      </div>
      <h3 className={`${compact ? "text-lg" : "text-xl"} font-display font-bold text-blinkit-text mb-1.5`}>{title}</h3>
      {text && <p className='text-blinkit-text-muted text-sm font-medium mb-6 max-w-xs'>{text}</p>}
      {ctaLabel && onCta && (
        <button className='btn btn-primary !px-7' onClick={onCta}>{ctaLabel}</button>
      )}
    </div>
  )
}

export function ErrorState({ title = "Something went wrong", text = "We couldn't load this right now. Please try again.", onRetry }) {
  return (
    <div className='py-16 w-full flex flex-col items-center text-center animate-fade-in'>
      <div className='w-16 h-16 rounded-full bg-red-50 border border-red-100 grid place-items-center mb-4'>
        <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#E11D48" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
      </div>
      <h3 className='text-lg font-display font-bold text-blinkit-text mb-1.5'>{title}</h3>
      <p className='text-blinkit-text-muted text-sm font-medium mb-6 max-w-xs'>{text}</p>
      {onRetry && (
        <button className='btn btn-ghost !px-6' onClick={onRetry}>Try Again</button>
      )}
    </div>
  )
}
