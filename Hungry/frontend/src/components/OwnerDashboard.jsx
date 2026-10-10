import React from 'react'
import Nav from './Nav'
import { useSelector } from 'react-redux'
import { FaUtensils } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import { FaPen } from "react-icons/fa";
import { FaLocationDot, FaStore, FaCircleCheck, FaBoxOpen } from "react-icons/fa6";
import OwnerItemCard from './OwnerItemCard';
import Footer from './ui/Footer';

function EmptyCard({ icon, title, text, cta, onCta, delay = 0 }) {
  const Icon = icon
  return (
    <div className='w-full max-w-md card card-hover !rounded-3xl p-8 animate-fade-up' style={{ animationDelay: `${delay}s` }}>
      <div className='flex flex-col items-center text-center'>
        <div className='relative mb-5'>
          <div className='w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-blinkit-green-soft grid place-items-center animate-bob'>
            <Icon className='text-blinkit-green-dark w-10 h-10 sm:w-12 sm:h-12' />
          </div>
          <span className='absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-blinkit-yellow ring-4 ring-white animate-pulse-dot' />
        </div>
        <h2 className='font-display text-xl sm:text-2xl font-bold text-blinkit-text mb-2'>{title}</h2>
        <p className='text-blinkit-text-secondary mb-6 text-sm sm:text-[15px] leading-relaxed'>{text}</p>
        <button className='btn btn-primary !px-7 !py-3' onClick={onCta}>
          {cta}
        </button>
      </div>
    </div>
  )
}

function OwnerDashboard() {
  const { myShopData } = useSelector(state => state.owner)
  const navigate = useNavigate()


  return (
    <div className='w-full min-h-screen bg-blinkit-bg flex flex-col items-center'>
      <Nav />
      {!myShopData && (
        <div className='flex justify-center items-center px-4 sm:px-6 pb-6 pt-24 sm:pt-28 w-full flex-1'>
          <EmptyCard
            icon={FaStore}
            title="Add Your Restaurant"
            text="Join Hungry and reach thousands of hungry customers every day."
            cta="Get Started"
            onCta={() => navigate("/create-edit-shop")}
            delay={0.1}
          />
        </div>
      )}

      {myShopData && (
        <div className='w-full flex flex-col items-center gap-6 px-4 sm:px-6 pb-6 pt-24 sm:pt-28 flex-1'>
          <h1 className='page-header text-2xl sm:text-3xl text-center leading-snug animate-fade-up'>
            <span className='w-12 h-12 grid place-items-center rounded-2xl bg-[linear-gradient(135deg,#F95B23,#D53A0B)] text-white shadow-glow shrink-0'>
              <FaUtensils size={20} />
            </span>
            <span>Welcome to <span className='text-blinkit-green'>{myShopData.name}</span></span>
          </h1>

          <div className='card overflow-hidden w-full max-w-3xl relative group animate-fade-up' style={{ animationDelay: '.06s' }}>
            <div className='absolute top-4 right-4 z-10 w-10 h-10 rounded-xl bg-white/90 backdrop-blur grid place-items-center shadow-card text-blinkit-green-dark hover:bg-blinkit-green hover:text-white transition-all duration-200 cursor-pointer hover:scale-105 hover:rotate-6' onClick={() => navigate("/create-edit-shop")}>
              <FaPen size={15} />
            </div>
            <div className='overflow-hidden'>
              <img src={myShopData.image} alt={myShopData.name} className='w-full h-48 sm:h-64 object-cover transition-transform duration-700 group-hover:scale-[1.04]' />
            </div>
            <div className='relative p-5 sm:p-6'>
              <span className='chip bg-blinkit-green-soft text-blinkit-green-dark absolute -top-4 left-5 shadow-soft'>
                <FaCircleCheck size={13} /> Live on Hungry
              </span>
              <h2 className='font-display text-xl sm:text-2xl font-bold text-blinkit-text mb-1.5'>{myShopData.name}</h2>
              <div className='flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm text-blinkit-text-secondary font-medium'>
                <span className='flex items-center gap-1.5'>
                  <FaLocationDot size={13} className='text-blinkit-green shrink-0' />
                  {myShopData.city}, {myShopData.state}
                </span>
                <span className='flex items-center gap-1.5 truncate max-w-full sm:max-w-md'>
                  {myShopData.address}
                </span>
              </div>
            </div>
          </div>

          {myShopData.items.length == 0 && (
            <EmptyCard
              icon={FaBoxOpen}
              title="Add Your Food Item"
              text="Share your delicious creations with our customers by adding them to the menu."
              cta="Add Food Item"
              onCta={() => navigate("/add-item")}
              delay={0.1}
            />
          )}

          {myShopData.items.length > 0 && (
            <div className='flex flex-col items-center gap-4 w-full max-w-3xl animate-fade-up' style={{ animationDelay: '.12s' }}>
              <h2 className='section-title flex items-center gap-2.5 self-start ml-1'>
                <span className='w-9 h-9 grid place-items-center rounded-xl bg-blinkit-green-soft text-blinkit-green-dark'><FaUtensils size={16} /></span>
                Menu Items
                <span className='chip bg-blinkit-bg text-blinkit-text-secondary !py-0.5 tabular-nums'>{myShopData.items.length}</span>
              </h2>
              {myShopData.items.map((item, index) => (
                <OwnerItemCard data={item} index={index} key={item._id || index} />
              ))}
            </div>
          )}
        </div>
      )}
      <Footer />
    </div>
  )
}

export default OwnerDashboard
