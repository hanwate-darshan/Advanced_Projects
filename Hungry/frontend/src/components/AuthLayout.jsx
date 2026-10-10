import React from 'react'
import Logo from './ui/Logo'
import { FaUtensils, FaTruck, FaShieldAlt } from "react-icons/fa";
import { FaMotorcycle } from "react-icons/fa6";
import image4 from '../assets/image4.avif'
import image5 from '../assets/image5.jpg'
import image3 from '../assets/image3.jpg'
import image9 from '../assets/image9.jpg'

function AuthLayout({ children }) {
  return (
    <div className='min-h-screen w-full flex items-center justify-center bg-blinkit-bg p-4 sm:p-6 lg:p-8 overflow-hidden'>
      <div className='w-full max-w-[1240px] grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-6'>

        {/* Brand panel */}
        <div className='relative hidden lg:flex flex-col justify-between p-10 xl:p-12 text-white overflow-hidden rounded-[32px] bg-[linear-gradient(150deg,#8C2408_0%,#C03109_55%,#F0410F_100%)] shadow-lift border border-white/10'>
          <div className='absolute -top-20 -right-16 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-blob' />
          <div className='absolute bottom-10 -left-14 w-80 h-80 bg-blinkit-yellow/15 rounded-full blur-3xl animate-blob' style={{ animationDelay: '3s' }} />

          <Logo light />

          <div className='relative flex-1 flex flex-col justify-center'>
            <div className='relative h-[230px] mb-8 max-w-[420px]' aria-hidden="true">
              <div className='absolute left-0 top-6 w-36 h-36 rounded-3xl overflow-hidden ring-4 ring-white/25 shadow-lift -rotate-6 animate-bob'>
                <img src={image4} alt="" className='w-full h-full object-cover' />
              </div>
              <div className='absolute left-28 top-24 w-40 h-40 rounded-3xl overflow-hidden ring-4 ring-white/25 shadow-lift rotate-3 animate-bob' style={{ animationDelay: '1.2s' }}>
                <img src={image5} alt="" className='w-full h-full object-cover' />
              </div>
              <div className='absolute left-56 top-4 w-32 h-32 rounded-3xl overflow-hidden ring-4 ring-white/25 shadow-lift rotate-6 animate-bob' style={{ animationDelay: '2s' }}>
                <img src={image3} alt="" className='w-full h-full object-cover' />
              </div>
              <div className='absolute left-56 bottom-0 w-28 h-28 rounded-3xl overflow-hidden ring-4 ring-white/25 shadow-lift -rotate-3 animate-bob' style={{ animationDelay: '.6s' }}>
                <img src={image9} alt="" className='w-full h-full object-cover' />
              </div>

              <div className='absolute -right-2 top-1/2 -translate-y-1/2 flex items-center gap-2 bg-white/95 text-blinkit-text rounded-full pl-2 pr-4 py-2 shadow-lift animate-float'>
                <span className='w-8 h-8 rounded-full bg-[linear-gradient(135deg,#F95B23,#D53A0B)] grid place-items-center text-white'>
                  <FaMotorcycle size={14} />
                </span>
                <div className='leading-tight'>
                  <p className='text-[11px] font-extrabold'>30–35 min</p>
                  <p className='text-[10px] text-blinkit-text-muted font-semibold'>Delivery time</p>
                </div>
              </div>
            </div>

            <h2 className='font-display text-4xl xl:text-[52px] font-extrabold leading-[1.05] tracking-tight animate-fade-up'>
              Good food.<br />Great mood.
            </h2>
            <p className='mt-4 text-white/80 text-[15px] leading-relaxed max-w-md animate-fade-up' style={{ animationDelay: '.08s' }}>
              Discover delicious meals from your favorite restaurants and get them delivered to your doorstep.
            </p>

            <div className='mt-8 flex flex-wrap items-center gap-x-8 gap-y-4 animate-fade-up' style={{ animationDelay: '.16s' }}>
              {[
                { Icon: FaUtensils, label: 'Local Kitchens' },
                { Icon: FaTruck, label: 'Live Tracking' },
                { Icon: FaShieldAlt, label: 'Secure Pay' },
              ].map(({ Icon: IconComp, label }, i) => {
                const Icon = IconComp
                return (
                  <div key={i} className='flex items-center gap-2 text-white/90'>
                    <span className='w-9 h-9 rounded-xl bg-white/10 backdrop-blur grid place-items-center ring-1 ring-white/20'>
                      <Icon size={15} />
                    </span>
                    <span className='text-[13px] font-semibold'>{label}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Form panel */}
        <div className='relative flex items-center justify-center bg-white rounded-[32px] border border-blinkit-border-light shadow-card p-6 sm:p-10'>
          <div className='relative w-full max-w-md animate-fade-up' style={{ animationDelay: '.1s' }}>
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AuthLayout
