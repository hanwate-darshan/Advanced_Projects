import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { IoIosArrowRoundBack } from "react-icons/io";
import { FaReceipt } from "react-icons/fa6";
import { useNavigate } from 'react-router-dom';
import UserOrderCard from '../components/UserOrderCard';
import OwnerOrderCard from '../components/OwnerOrderCard';
import { setMyOrders, addMyOrder, updateRealtimeOrderStatus } from '../redux/userSlice';
import Footer from '../components/ui/Footer';


import axios from 'axios';
import { serverUrl } from '../App';

function MyOrders() {
  const { userData, myOrders, socket } = useSelector(state => state.user)
  const navigate = useNavigate()
  const dispatch = useDispatch()

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const result = await axios.get(`${serverUrl}/api/order/my-orders`, { withCredentials: true })
        dispatch(setMyOrders(result.data))
      } catch (error) {
        console.log("fetchOrders error:", error)
      }
    }
    if (userData?._id) {
      fetchOrders()
    }
  }, [userData?._id, dispatch])

  useEffect(() => {
    if (!socket) return

    const handleNewOrder = (data) => {
      const ownerId = data.shopOrders?.owner?._id || data.shopOrders?.owner
      if (ownerId && userData?._id && String(ownerId) === String(userData._id)) {
        dispatch(addMyOrder(data))
      }
    }

    const handleUpdateStatus = async ({ orderId, shopId, status, userId, shopOrderId }) => {
      dispatch(updateRealtimeOrderStatus({ orderId, shopId, status, shopOrderId }))
      try {
        const result = await axios.get(`${serverUrl}/api/order/my-orders`, { withCredentials: true })
        if (result.data) {
          dispatch(setMyOrders(result.data))
        }
      } catch (e) {
        console.log("Error refreshing my-orders:", e)
      }
    }

    socket.on('newOrder', handleNewOrder)
    socket.on('update-status', handleUpdateStatus)

    return () => {
      socket.off('newOrder', handleNewOrder)
      socket.off('update-status', handleUpdateStatus)
    }
  }, [socket, userData?._id, dispatch])

  const orderedCount = myOrders?.length || 0

  return (
    <div className='w-full min-h-screen bg-blinkit-bg flex flex-col'>
      <button className='back-btn' onClick={() => navigate("/")}>
        <IoIosArrowRoundBack size={20} className="text-blinkit-green" />
        <span>Back</span>
      </button>

      <div className='w-full max-w-[800px] mx-auto px-4 flex-1 pb-10'>
        <div className='flex items-center gap-4 mb-8 mt-8 animate-fade-up'>
          <div className='w-12 h-12 rounded-2xl bg-[linear-gradient(135deg,#F95B23,#D53A0B)] grid place-items-center text-white shadow-glow shrink-0'>
            <FaReceipt size={20} />
          </div>
          <div className='flex-1'>
            <h1 className='font-display text-2xl sm:text-3xl font-extrabold text-blinkit-text tracking-tight leading-none'>{userData.role == "owner" ? "Shop Orders" : "My Orders"}</h1>
            <p className='text-sm text-blinkit-text-secondary font-medium mt-1.5'>
              {orderedCount > 0 ? `${orderedCount} order${orderedCount === 1 ? '' : 's'} · live updates on` : "No orders yet"}
            </p>
          </div>
          <span className='hidden sm:inline-flex chip bg-white border border-blinkit-border-light text-blinkit-text-secondary shadow-soft'>
            <span className='w-2 h-2 rounded-full bg-blinkit-green animate-pulse-dot' />
            Realtime
          </span>
        </div>

        {orderedCount == 0 ? (
          <div className='card !rounded-3xl py-16 flex flex-col items-center text-center animate-fade-up' style={{ animationDelay: '.08s' }}>
            <div className='w-20 h-20 rounded-3xl bg-blinkit-green-soft grid place-items-center mb-5 animate-bob'>
              <FaReceipt size={34} className='text-blinkit-green-dark' />
            </div>
            <h2 className='font-display text-xl font-bold text-blinkit-text mb-1.5'>No orders yet</h2>
            <p className='text-blinkit-text-muted text-sm font-medium mb-6 max-w-xs'>
              {userData.role == "owner" ? "New orders from customers will appear here in real time." : "When you place your first order, it will show up here."}
            </p>
            <button className='btn btn-primary !px-7' onClick={() => navigate("/")}>
              {userData.role == "owner" ? "Back to dashboard" : "Browse Food"}
            </button>
          </div>
        ) : (
          <div className='space-y-6'>
            {myOrders?.map((order, index) => (
              userData.role == "user" ?
              (
                <UserOrderCard data={order} index={index} key={index} />
              )
              :
              userData.role == "owner" ? (
                <OwnerOrderCard data={order} index={index} key={index} />
              )
              :
              null
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}

export default MyOrders
