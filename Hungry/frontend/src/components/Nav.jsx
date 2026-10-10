import React, { useEffect, useState } from 'react'
import { FaLocationDot, FaPlus } from "react-icons/fa6";
import { IoIosSearch } from "react-icons/io";
import { FiShoppingCart } from "react-icons/fi";
import { useDispatch, useSelector } from 'react-redux';
import { RxCross2 } from "react-icons/rx";
import axios from 'axios';
import { serverUrl } from '../App';
import { setSearchItems, setUserData } from '../redux/userSlice';
import { TbReceipt2 } from "react-icons/tb";
import { useNavigate } from 'react-router-dom';
import Logo from './ui/Logo';

function SearchBar({ query, setQuery, className = '' }) {
  const { currentCity } = useSelector(state => state.user)
  return (
    <div className={`h-[50px] bg-white rounded-full items-center gap-3 px-2 border border-blinkit-border focus-within:border-blinkit-green/60 focus-within:ring-4 focus-within:ring-blinkit-green/10 focus-within:shadow-card shadow-soft transition-all duration-300 ${className}`}>
      <div className='flex items-center gap-1.5 px-2.5 border-r border-blinkit-border max-w-[34%] overflow-hidden'>
        <FaLocationDot size={16} className="text-blinkit-green shrink-0" />
        <span className='truncate text-blinkit-text-secondary font-semibold text-xs sm:text-sm'>{currentCity || "Locating…"}</span>
      </div>
      <div className='flex-1 flex items-center gap-2 min-w-0'>
        <IoIosSearch size={18} className='text-blinkit-text-muted shrink-0' />
        <input
          type="text"
          placeholder='Search for dishes, cuisines…'
          className='bg-transparent outline-0 w-full text-sm placeholder:text-blinkit-text-muted text-blinkit-text'
          onChange={(e) => setQuery(e.target.value)}
          value={query}
          aria-label="Search food"
        />
      </div>
    </div>
  )
}

function Nav() {
  const { userData, currentCity, cartItems, myOrders } = useSelector(state => state.user)
  const { myShopData } = useSelector(state => state.owner)
  const [showInfo, setShowInfo] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [query, setQuery] = useState("")
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const pendingOrdersCount = myOrders?.filter(order => {
    const status = order?.shopOrders?.status
    return status === "pending"
  })?.length || 0

  const activeOrdersCount = myOrders?.filter(order => {
    const status = order?.shopOrders?.status
    return status && status !== "delivered"
  })?.length || 0

  const ownerBadgeCount = pendingOrdersCount > 0 ? pendingOrdersCount : (activeOrdersCount > 0 ? activeOrdersCount : 0)

  const userActiveOrdersCount = myOrders?.filter(order => {
    if (Array.isArray(order?.shopOrders)) {
      return order.shopOrders.some(so => so.status && so.status !== "delivered")
    }
    return order?.shopOrders?.status && order.shopOrders.status !== "delivered"
  })?.length || 0

  const handleLogOut = async () => {
    try {
      await axios.get(`${serverUrl}/api/auth/signout`, { withCredentials: true })
      dispatch(setUserData(null))
      navigate("/signin")
    } catch (error) {
      console.log(error)
    }
  }

  const handleSearchItems = async () => {
    try {
      const result = await axios.get(`${serverUrl}/api/item/search-items?query=${query}&city=${currentCity}`, { withCredentials: true })
      dispatch(setSearchItems(result.data))
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    if (query) {
      handleSearchItems()
    } else {
      dispatch(setSearchItems(null))
    }
  }, [query])

  return (
    <>
      <header className='w-full h-[72px] flex items-center justify-between md:justify-center gap-3 md:gap-[30px] px-4 md:px-6 fixed top-0 z-[9999] glass shadow-soft'>
        <Logo />

        {userData.role == "user" && (
          <>
            <SearchBar query={query} setQuery={setQuery} className='hidden md:flex w-[44%] lg:w-[38%]' />
            {showSearch && (
              <SearchBar query={query} setQuery={setQuery} className='fixed top-[80px] left-4 right-4 md:hidden animate-scale-in z-[9998]' />
            )}
          </>
        )}

        <div className='flex items-center gap-2 md:gap-3'>
          {userData.role == "user" && (
            showSearch
              ? <RxCross2 size={26} className='text-blinkit-text-secondary md:hidden cursor-pointer transition hover:scale-110' onClick={() => setShowSearch(false)} />
              : <IoIosSearch size={26} className='text-blinkit-text-secondary md:hidden cursor-pointer transition hover:text-blinkit-green hover:scale-110' onClick={() => setShowSearch(true)} />
          )}

          {userData.role == "owner" ? (
            <>
              {myShopData && (
                <>
                  <button className='hidden md:inline-flex btn btn-primary !py-2.5 !px-4 text-sm' onClick={() => navigate("/add-item")}>
                    <FaPlus size={15} />
                    <span>Add Food Item</span>
                  </button>
                  <button className='md:hidden w-10 h-10 rounded-full btn btn-primary !p-0' onClick={() => navigate("/add-item")}>
                    <FaPlus size={18} />
                  </button>
                </>
              )}
              <button
                className='relative hidden md:inline-flex items-center gap-2 cursor-pointer px-4 py-2.5 rounded-full bg-white border border-blinkit-border text-blinkit-text-secondary font-semibold text-sm transition-all duration-200 hover:text-blinkit-green hover:border-blinkit-green/40 hover:bg-blinkit-green-soft/50 hover:shadow-soft'
                onClick={() => navigate("/my-orders")}
              >
                <TbReceipt2 size={18} />
                <span>My Orders</span>
                {ownerBadgeCount > 0 && (
                  <span
                    className={`ml-0.5 inline-flex items-center justify-center min-w-[20px] h-[20px] px-1.5 text-white text-[11px] font-extrabold rounded-full shadow-soft transition-all ${
                      pendingOrdersCount > 0
                        ? 'bg-gradient-to-r from-red-500 to-[#F95B23] animate-pulse ring-2 ring-red-200'
                        : 'bg-blinkit-green ring-2 ring-green-100'
                    }`}
                  >
                    {ownerBadgeCount}
                  </span>
                )}
              </button>
              <button
                className='relative md:hidden w-10 h-10 rounded-full grid place-items-center cursor-pointer bg-white border border-blinkit-border text-blinkit-text-secondary transition-all duration-200 hover:text-blinkit-green hover:shadow-soft'
                onClick={() => navigate("/my-orders")}
                aria-label={`My orders with ${ownerBadgeCount} orders`}
              >
                <TbReceipt2 size={18} />
                {ownerBadgeCount > 0 && (
                  <span
                    className={`absolute -right-1 -top-1.5 text-white text-[10px] font-extrabold min-w-[19px] h-[19px] px-1 rounded-full flex items-center justify-center shadow-soft ring-2 ring-white ${
                      pendingOrdersCount > 0
                        ? 'bg-gradient-to-r from-red-500 to-[#F95B23] animate-pulse'
                        : 'bg-blinkit-green'
                    }`}
                  >
                    {ownerBadgeCount}
                  </span>
                )}
              </button>
            </>
          ) : (
            <>
              {userData.role == "user" && (
                <button className='relative w-11 h-11 rounded-full grid place-items-center bg-white border border-blinkit-border cursor-pointer transition-all duration-200 hover:border-blinkit-green/40 hover:shadow-soft' onClick={() => navigate("/cart")} aria-label={`Cart with ${cartItems.length} items`}>
                  <FiShoppingCart size={20} className='text-blinkit-text-secondary' />
                  {cartItems.length > 0 && (
                    <span className='absolute -right-1 -top-1.5 text-white bg-blinkit-green text-[10px] font-bold w-[19px] h-[19px] rounded-full flex items-center justify-center shadow-soft ring-2 ring-white'>{cartItems.length}</span>
                  )}
                </button>
              )}
              <button
                className='relative hidden md:inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white border border-blinkit-border text-blinkit-text-secondary text-sm font-semibold transition-all duration-200 hover:text-blinkit-text hover:shadow-soft cursor-pointer'
                onClick={() => navigate("/my-orders")}
              >
                <TbReceipt2 size={18} />
                <span>My Orders</span>
                {userActiveOrdersCount > 0 && (
                  <span className='ml-0.5 inline-flex items-center justify-center min-w-[20px] h-[20px] px-1.5 text-white bg-blinkit-green text-[11px] font-extrabold rounded-full shadow-soft ring-2 ring-green-100'>
                    {userActiveOrdersCount}
                  </span>
                )}
              </button>
            </>
          )}

          {userData.role == "admin" && (
            <span className='chip bg-blinkit-green-soft text-blinkit-green-dark font-extrabold text-xs shadow-soft'>
              Operations Admin
            </span>
          )}

          <button
            className='w-10 h-10 rounded-full flex items-center justify-center bg-[linear-gradient(135deg,#F95B23,#D53A0B)] text-white text-[16px] shadow-glow font-bold cursor-pointer transition-all duration-200 hover:scale-105'
            onClick={() => setShowInfo(prev => !prev)}
            aria-label="Account menu"
            aria-expanded={showInfo}
          >
            {userData?.fullName?.slice(0, 1)}
          </button>
        </div>

        {showInfo && (
          <div className='fixed top-[84px] right-4 md:right-[8%] w-[230px] bg-white shadow-lift rounded-2xl p-2 flex flex-col z-[9999] border border-blinkit-border-light animate-scale-in origin-top-right'>
            <div className='flex items-center gap-3 px-3 py-3 border-b border-blinkit-border-light mb-1.5'>
              <div className='w-10 h-10 rounded-full bg-[linear-gradient(135deg,#F95B23,#D53A0B)] grid place-items-center text-white font-bold text-sm shadow-soft shrink-0'>
                {(userData.fullName || "U").slice(0, 1).toUpperCase()}
              </div>
              <div className='min-w-0'>
                <div className='text-[15px] font-bold text-blinkit-text truncate'>{userData.fullName || "Hungry User"}</div>
                <div className='text-xs text-blinkit-text-muted capitalize font-semibold'>
                  {userData.role === "deliveryBoy" ? "Rider" : userData.role === "admin" ? "Platform Administrator" : userData.role}
                </div>
              </div>
            </div>
            {userData.role == "user" && (
              <div className='md:hidden flex items-center justify-between px-3 py-2.5 rounded-xl text-blinkit-text font-semibold cursor-pointer text-sm transition-all duration-150 hover:bg-blinkit-green-soft hover:text-blinkit-green-dark'
                onClick={() => navigate("/my-orders")}>
                <div className='flex items-center gap-2'>
                  <TbReceipt2 size={16} />
                  <span>My Orders</span>
                </div>
                {userActiveOrdersCount > 0 && (
                  <span className='text-xs font-bold px-2 py-0.5 rounded-full text-white bg-blinkit-green'>
                    {userActiveOrdersCount}
                  </span>
                )}
              </div>
            )}
            {userData.role == "owner" && (
              <div className='md:hidden flex items-center justify-between px-3 py-2.5 rounded-xl text-blinkit-text font-semibold cursor-pointer text-sm transition-all duration-150 hover:bg-blinkit-green-soft hover:text-blinkit-green-dark'
                onClick={() => navigate("/my-orders")}>
                <div className='flex items-center gap-2'>
                  <TbReceipt2 size={16} />
                  <span>My Orders</span>
                </div>
                {ownerBadgeCount > 0 && (
                  <span className='text-xs font-bold px-2 py-0.5 rounded-full text-white bg-gradient-to-r from-red-500 to-[#F95B23]'>
                    {ownerBadgeCount}
                  </span>
                )}
              </div>
            )}
            <button className='flex items-center gap-2 px-3 py-2.5 rounded-xl text-red-500 font-semibold cursor-pointer text-sm transition-all duration-150 hover:bg-red-50' onClick={handleLogOut}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
              Log Out
            </button>
          </div>
        )}
      </header>

      {/* click-away for profile dropdown */}
      {showInfo && <div className='fixed inset-0 z-[9998]' onClick={() => setShowInfo(false)} />}
    </>
  )
}

export default Nav
