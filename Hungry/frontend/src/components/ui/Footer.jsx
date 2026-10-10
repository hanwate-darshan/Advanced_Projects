import React from 'react'
import Logo from './Logo'

function Footer() {
  return (
    <footer className='w-full mt-auto border-t border-blinkit-border-light bg-white'>
      <div className='max-w-6xl mx-auto px-5 py-8 flex flex-col sm:flex-row items-center justify-between gap-4'>
        <div>
          <Logo size="sm" />
          <p className='text-xs text-blinkit-text-muted font-medium mt-2'>Cravings delivered.</p>
        </div>
        <p className='text-xs text-blinkit-text-muted font-medium'>
          © {new Date().getFullYear()} Hungry Food Delivery. All rights reserved.
        </p>
      </div>
    </footer>
  )
}

export default Footer
