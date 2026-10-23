import axios from 'axios'
import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { serverUrl } from '../App'
import { useEffect } from 'react'
import { useState } from 'react'
import { IoIosArrowRoundBack } from "react-icons/io";
import { FaLocationDot, FaMotorcycle, FaCircleCheck, FaPhone, FaIdCard, FaShieldHalved } from "react-icons/fa6";
import DeliveryBoyTracking from '../components/DeliveryBoyTracking'
import { useSelector } from 'react-redux'
import { Skeleton } from '../components/ui/Skeleton'

const statusClass = (status) => {
    const s = (status || "").toLowerCase()
    if (s === "pending") return "status-pending"
    if (s === "preparing") return "status-preparing"
    if (s === "out of delivery") return "status-outofdelivery"
    if (s === "delivered") return "status-delivered"
    return "status-pending"
}

const ORDER_STEPS = [
    { key: "pending", label: "Order Placed" },
    { key: "preparing", label: "Preparing" },
    { key: "out of delivery", label: "Out for Delivery" },
    { key: "delivered", label: "Delivered" },
]

function OrderTimeline({ status }) {
    const current = ORDER_STEPS.findIndex(s => s.key === (status || "pending").toLowerCase())
    return (
        <div className='flex items-center w-full py-2'>
            {ORDER_STEPS.map((step, i) => {
                const done = i < current
                const active = i === current
                return (
                    <React.Fragment key={step.key}>
                        <div className='flex flex-col items-center gap-1.5 relative'>
                            <div className={`w-8 h-8 rounded-full grid place-items-center text-[11px] font-extrabold transition-all duration-300
                                ${done ? 'bg-blinkit-green text-white shadow-glow' :
                                  active ? 'bg-blinkit-green text-white ring-4 ring-blinkit-green/20 animate-ring' :
                                  'bg-white text-blinkit-text-muted border border-blinkit-border'}`}>
                                {done ? <FaCircleCheck size={13} /> : i + 1}
                            </div>
                            <span className={`absolute top-10 whitespace-nowrap text-[10px] font-bold ${done || active ? 'text-blinkit-green-dark' : 'text-blinkit-text-muted'}`}>
                                {step.label}
                            </span>
                        </div>
                        {i < ORDER_STEPS.length - 1 && (
                            <div className={`flex-1 h-1 mx-1 sm:mx-2 rounded-full transition-all duration-500 ${i < current ? 'bg-blinkit-green' : 'bg-blinkit-border'}`} />
                        )}
                    </React.Fragment>
                )
            })}
        </div>
    )
}

function TrackOrderPage() {
    const { orderId } = useParams()
    const [currentOrder, setCurrentOrder] = useState()
    const [liveOtp, setLiveOtp] = useState(null)
    const navigate = useNavigate()
    const { socket } = useSelector(state => state.user)
    const [liveLocations, setLiveLocations] = useState({})
    const handleGetOrder = async () => {
        try {
            const result = await axios.get(`${serverUrl}/api/order/get-order-by-id/${orderId}`, { withCredentials: true })
            setCurrentOrder(result.data)
            const activeOtp = result.data?.shopOrders?.find(so => (so.status || "").toLowerCase().trim() !== "delivered")?.deliveryOtp
            if (activeOtp) setLiveOtp(activeOtp)
            else if (result.data?.shopOrders?.every(so => (so.status || "").toLowerCase().trim() === "delivered")) setLiveOtp(null)
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        if (!socket) return

        const handleLocation = ({ deliveryBoyId, latitude, longitude }) => {
            setLiveLocations(prev => ({
                ...prev,
                [deliveryBoyId]: { lat: latitude, lon: longitude }
            }))
        }

        const handleStatus = ({ orderId: updatedOrderId, status }) => {
            if (String(updatedOrderId) === String(orderId)) {
                if (status === "delivered") setLiveOtp(null)
                handleGetOrder()
            }
        }

        const handleDeliveryOtp = ({ orderId: otpOrderId, otp }) => {
            if (String(otpOrderId) === String(orderId)) {
                setLiveOtp(otp)
            }
        }

        socket.on('updateDeliveryLocation', handleLocation)
        socket.on('update-status', handleStatus)
        socket.on('deliveryOtp', handleDeliveryOtp)

        return () => {
            socket.off('updateDeliveryLocation', handleLocation)
            socket.off('update-status', handleStatus)
            socket.off('deliveryOtp', handleDeliveryOtp)
        }
    }, [socket, orderId])

    useEffect(() => {
        handleGetOrder()
    }, [orderId])

    if (!currentOrder) {
        return (
            <div className='max-w-4xl mx-auto p-4 pt-6 pb-16 min-h-screen bg-blinkit-bg'>
                <div className='mt-8 mb-8 flex items-center gap-4'>
                    <Skeleton className='w-12 h-12 rounded-2xl' />
                    <div className='space-y-2'>
                        <Skeleton className='h-7 w-48' />
                        <Skeleton className='h-4 w-32' />
                    </div>
                </div>
                <div className='space-y-4'>
                    {[0, 1].map(i => (
                        <div key={i} className='bg-white p-5 rounded-2xl shadow-soft border border-blinkit-border-light space-y-4'>
                            <Skeleton className='h-5 w-40' />
                            <Skeleton className='h-20 w-full' />
                            <Skeleton className='h-64 w-full' />
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className='max-w-4xl mx-auto p-4 pt-6 pb-16 min-h-screen bg-blinkit-bg'>
            <button className='back-btn' onClick={() => navigate("/")}>
                <IoIosArrowRoundBack size={20} className="text-blinkit-green" />
                <span>Back</span>
            </button>

            <div className='mt-8 mb-8 flex items-center gap-4 animate-fade-up'>
                <div className='w-12 h-12 rounded-2xl bg-[linear-gradient(135deg,#F95B23,#D53A0B)] grid place-items-center text-white shadow-glow shrink-0'>
                    <FaLocationDot size={20} />
                </div>
                <div>
                    <h1 className='font-display text-2xl sm:text-3xl font-extrabold text-blinkit-text tracking-tight leading-none'>Track Order</h1>
                    <p className='text-sm text-blinkit-text-secondary font-medium mt-1.5'>
                        {`#${currentOrder._id.slice(-6)} · live rider location`}
                    </p>
                </div>
            </div>

      {currentOrder?.shopOrders?.map((shopOrder, index) => (
        <div
          className='bg-white p-5 sm:p-6 rounded-2xl shadow-soft border border-blinkit-border-light space-y-5 mb-6 transition-all duration-300 hover:shadow-card animate-fade-up'
          style={{ animationDelay: `${index * 0.08}s` }}
          key={index}
        >
          <div className='flex flex-wrap items-start justify-between gap-3'>
            <div className='min-w-0'>
              <div className='flex items-center gap-2.5'>
                {shopOrder.shop.image ? (
                  <img src={shopOrder.shop.image} alt={shopOrder.shop.name} className='w-10 h-10 rounded-xl object-cover border border-blinkit-border-light shadow-soft shrink-0' />
                ) : (
                  <span className='w-10 h-10 rounded-xl bg-blinkit-green-soft grid place-items-center text-blinkit-green-dark font-extrabold shrink-0'>{shopOrder.shop.name?.slice(0, 1)}</span>
                )}
                <p className='font-display text-lg font-bold text-blinkit-text truncate'>{shopOrder.shop.name}</p>
              </div>
              <p className='font-semibold text-sm mt-2.5'><span className='text-blinkit-text-muted font-medium'>Items:</span> <span className='text-blinkit-text'>{shopOrder.shopOrderItems?.map(i => i.name).join(", ")}</span></p>
              <p className='text-sm mt-1'><span className='font-semibold text-blinkit-text-muted'>Subtotal:</span> <span className='text-blinkit-text font-bold tabular-nums'>₹{shopOrder.subtotal}</span></p>
            </div>
            <span className={`status-pill ${statusClass(shopOrder.status)}`}>
              <span className='status-badge' /> {shopOrder.status}
            </span>
          </div>

          <OrderTimeline status={shopOrder.status} />

          <div className='flex items-start gap-2.5 text-sm bg-blinkit-bg/70 border border-blinkit-border-light rounded-xl p-3.5'>
            <FaLocationDot size={15} className='text-blinkit-green mt-0.5 shrink-0' />
            <div>
              <p className='text-xs font-bold uppercase tracking-wider text-blinkit-text-muted mb-0.5'>Delivery Address</p>
              <p className='text-blinkit-text font-medium'>{currentOrder.deliveryAddress?.text}</p>
            </div>
          </div>

          {((liveOtp || shopOrder.deliveryOtp) && (shopOrder.status || "").toLowerCase().trim() !== "delivered") && (
            <div className='bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border-2 border-orange-300 rounded-2xl p-4 sm:p-5 shadow-soft animate-scale-in'>
              <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
                <div className='flex items-center gap-3.5'>
                  <div className='w-12 h-12 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white grid place-items-center shadow-glow shrink-0'>
                    <FaShieldHalved size={22} />
                  </div>
                  <div>
                    <span className='inline-block text-[11px] font-extrabold uppercase tracking-wider text-orange-800 bg-orange-100/90 border border-orange-300 px-2.5 py-0.5 rounded-full'>
                      Delivery Verification OTP
                    </span>
                    <h3 className='font-display font-extrabold text-base sm:text-lg text-blinkit-text mt-1'>
                      Share this code with your Delivery Partner
                    </h3>
                    <p className='text-xs text-blinkit-text-secondary mt-0.5'>
                      Provide this 4-digit code to the delivery rider at your doorstep to receive your order.
                    </p>
                  </div>
                </div>
                <div className='flex items-center justify-center gap-2 bg-white border-2 border-orange-400 px-5 py-3 rounded-2xl shadow-sm shrink-0 self-start sm:self-center'>
                  <span className='font-mono text-3xl sm:text-4xl font-extrabold tracking-[0.3em] text-orange-600 pl-1 select-all'>
                    {liveOtp || shopOrder.deliveryOtp}
                  </span>
                </div>
              </div>
            </div>
          )}

          {(shopOrder.status || "").toLowerCase().trim() !== "delivered" ? <>
            {shopOrder.assignedDeliveryBoy ? (
              <div className='flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-blinkit-text-secondary bg-blinkit-bg/70 p-4 rounded-xl border border-blinkit-border-light animate-fade-in'>
                <div className='flex flex-col gap-1.5'>
                  <p className='flex items-center gap-2 font-bold text-blinkit-text text-xs uppercase tracking-wider text-blinkit-text-muted'><FaIdCard size={13} /> Rider</p>
                  <p className='font-bold text-blinkit-text'>{shopOrder.assignedDeliveryBoy.fullName}</p>
                </div>
                <div className='flex flex-col gap-1.5'>
                  <p className='flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-blinkit-text-muted'><FaPhone size={13} /> Contact</p>
                  <p className='font-bold text-blinkit-text tabular-nums'>{shopOrder.assignedDeliveryBoy.mobile}</p>
                </div>
                <span className='hidden sm:inline-flex chip bg-white border border-blinkit-border-light text-blinkit-green-dark ml-auto shadow-soft'>
                  <FaMotorcycle size={13} /> On the way
                </span>
              </div>
            ) : (
              <p className='font-semibold text-blinkit-text-secondary text-sm flex items-center gap-2 animate-fade-in'>
                <FaMotorcycle size={15} className='text-blinkit-text-muted animate-bob' />
                Delivery rider is being assigned…
              </p>
            )}
          </> : (
            <div className='flex items-center gap-3 bg-blinkit-green-soft/70 border border-blinkit-green/20 p-4 rounded-xl animate-scale-in'>
              <FaCircleCheck className='text-blinkit-green-dark text-2xl' />
              <div>
                <p className='font-extrabold text-blinkit-green-dark text-base'>Delivered</p>
                <p className='text-xs font-semibold text-blinkit-green-dark/70'>Enjoy your meal! Rate the items you loved in My Orders.</p>
              </div>
            </div>
          )}

          {(Boolean(shopOrder.assignedDeliveryBoy) && (shopOrder.status || "").toLowerCase().trim() !== "delivered") && (
            <div className="h-[400px] w-full rounded-2xl overflow-hidden border border-blinkit-border-light shadow-soft">
              <DeliveryBoyTracking data={{
                deliveryBoyLocation: (shopOrder.assignedDeliveryBoy && liveLocations[shopOrder.assignedDeliveryBoy._id]) || {
                  lat: shopOrder.assignedDeliveryBoy?.location?.coordinates?.[1],
                  lon: shopOrder.assignedDeliveryBoy?.location?.coordinates?.[0]
                },
                customerLocation: {
                  lat: currentOrder.deliveryAddress?.latitude,
                  lon: currentOrder.deliveryAddress?.longitude
                }
              }} />
            </div>
          )}
        </div>
      ))}
        </div>
    )
}

export default TrackOrderPage
