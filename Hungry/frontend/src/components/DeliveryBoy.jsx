import React from 'react'
import Nav from './Nav'
import { useSelector } from 'react-redux'
import axios from 'axios'
import { serverUrl } from '../App'
import { useEffect } from 'react'
import { useState } from 'react'
import { FaMotorcycle, FaLocationDot, FaRoute, FaCircleCheck, FaClock, FaPhone } from "react-icons/fa6";
import { FaRupeeSign } from "react-icons/fa";
import DeliveryBoyTracking from './DeliveryBoyTracking'
import { ClipLoader } from 'react-spinners'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

function DeliveryBoy() {
  const { userData, socket } = useSelector(state => state.user)
  const [currentOrder, setCurrentOrder] = useState()
  const [showOtpBox, setShowOtpBox] = useState(false)
  const [availableAssignments, setAvailableAssignments] = useState(null)
  const [otp, setOtp] = useState("")
  const [todayDeliveries, setTodayDeliveries] = useState([])
const [deliveryBoyLocation, setDeliveryBoyLocation] = useState(null)
const [loading, setLoading] = useState(false)
const [verifying, setVerifying] = useState(false)
const [message, setMessage] = useState("")
const [errorMsg, setErrorMsg] = useState("")
  useEffect(() => {
if (!socket || userData.role !== "deliveryBoy") return
let watchId
if (navigator.geolocation) {
watchId = navigator.geolocation.watchPosition((position) => {
    const latitude = position.coords.latitude
    const longitude = position.coords.longitude
    setDeliveryBoyLocation({ lat: latitude, lon: longitude })
    socket.emit('updateLocation', {
      latitude,
      longitude,
      userId: userData._id
    })
  }),
  (error) => {
    console.log(error)
  },
  {
    enableHighAccuracy: true
  }
}

return () => {
  if (watchId) navigator.geolocation.clearWatch(watchId)
}

  }, [socket, userData])


const ratePerDelivery = 50
const totalEarning = todayDeliveries.reduce((sum, d) => sum + d.count * ratePerDelivery, 0)

  const getAssignments = async () => {
    try {
      const result = await axios.get(`${serverUrl}/api/order/get-assignments`, { withCredentials: true })
      // Deduplicate by assignmentId to avoid duplicate cards
      const unique = (result.data || []).filter((item, index, self) =>
        index === self.findIndex((t) => String(t.assignmentId) === String(item.assignmentId))
      )
      setAvailableAssignments(unique)
    } catch (error) {
      console.log("getAssignments error:", error)
    }
  }

  const getCurrentOrder = async () => {
    try {
      const result = await axios.get(`${serverUrl}/api/order/get-current-order`, { withCredentials: true })
      setCurrentOrder(result.data)
    } catch (error) {
      // Clear currentOrder when no active assignment
      setCurrentOrder(null)
    }
  }

  const acceptOrder = async (assignmentId) => {
    try {
      const result = await axios.get(`${serverUrl}/api/order/accept-order/${assignmentId}`, { withCredentials: true })
      console.log("Order accepted:", result.data)
      setAvailableAssignments(prev => (prev || []).filter(a => String(a.assignmentId) !== String(assignmentId)))
      await getCurrentOrder()
      await getAssignments()
    } catch (error) {
      console.log("acceptOrder error:", error)
    }
  }

  useEffect(() => {
    if (!socket) return

    const handleNewAssignment = (data) => {
      console.log("DeliveryBoy received newAssignment event:", data)
      if (data?.sentTo && userData?._id && String(data.sentTo) !== String(userData._id)) {
        return
      }
      if (data?.assignmentId) {
        setAvailableAssignments(prev => {
          if (!Array.isArray(prev)) return [data]
          const exists = prev.some(item => String(item.assignmentId) === String(data.assignmentId))
          if (exists) return prev
          return [data, ...prev]
        })
      }
      getAssignments()
      getCurrentOrder()
    }

    const handleBroadcast = (data) => {
      console.log("DeliveryBoy received newAssignmentBroadcast event:", data)
      getAssignments()
      getCurrentOrder()
    }

    const handleOrderAssigned = () => {
      getCurrentOrder()
      getAssignments()
    }

    socket.on('newAssignment', handleNewAssignment)
    socket.on('newAssignmentBroadcast', handleBroadcast)
    socket.on('orderAssigned', handleOrderAssigned)
    return () => {
      socket.off('newAssignment', handleNewAssignment)
      socket.off('newAssignmentBroadcast', handleBroadcast)
      socket.off('orderAssigned', handleOrderAssigned)
    }
  }, [socket, userData?._id])

  const sendOtp = async () => {
    setLoading(true)
    setErrorMsg("")
    setMessage("")
    try {
      const result = await axios.post(`${serverUrl}/api/order/send-delivery-otp`, {
        orderId: currentOrder._id,
        shopOrderId: currentOrder.shopOrder._id
      }, { withCredentials: true })
      setLoading(false)
      setShowOtpBox(true)
      console.log("OTP sent:", result.data)
    } catch (error) {
      console.log("sendOtp error:", error)
      setErrorMsg(error.response?.data?.message || "Failed to send OTP. Please try again.")
      setLoading(false)
    }
  }

  const verifyOtp = async () => {
    if (!otp || !otp.trim()) {
      setErrorMsg("Please enter the 4-digit OTP provided by customer")
      return
    }
    setMessage("")
    setErrorMsg("")
    setVerifying(true)
    try {
      const result = await axios.post(`${serverUrl}/api/order/verify-delivery-otp`, {
        orderId: currentOrder._id,
        shopOrderId: currentOrder.shopOrder._id,
        otp: otp.trim()
      }, { withCredentials: true })

      console.log("verifyOtp result:", result.data)
      setMessage(result.data.message || "Order Delivered Successfully! 🎉")
      setErrorMsg("")

      setTimeout(async () => {
        setCurrentOrder(null)
        setShowOtpBox(false)
        setOtp("")
        setMessage("")
        await handleTodayDeliveries()
        await getAssignments()
      }, 1500)
    } catch (error) {
      console.error("verifyOtp error:", error)
      setErrorMsg(error.response?.data?.message || "Invalid or expired OTP. Please verify with customer.")
    } finally {
      setVerifying(false)
    }
  }

  const handleTodayDeliveries = async () => {
    try {
      const result = await axios.get(`${serverUrl}/api/order/get-today-deliveries`, { withCredentials: true })
      setTodayDeliveries(result.data || [])
    } catch (error) {
      console.log("handleTodayDeliveries error:", error)
    }
  }

  useEffect(() => {
    getAssignments()
    getCurrentOrder()
    handleTodayDeliveries()

    const interval = setInterval(() => {
      getAssignments()
    }, 5000)

    const handleFocus = () => {
      getAssignments()
      getCurrentOrder()
    }
    window.addEventListener('focus', handleFocus)

    return () => {
      clearInterval(interval)
      window.removeEventListener('focus', handleFocus)
    }
  }, [userData])
  return (
    <div className='w-screen min-h-screen flex flex-col gap-5 items-center bg-blinkit-bg overflow-y-auto'>
      <Nav />
      <div className='w-full max-w-[800px] flex flex-col gap-5 items-center pt-[110px] pb-10'>

        {/* welcome */}
        <div className='w-full relative overflow-hidden rounded-3xl bg-[linear-gradient(150deg,#2B120A_0%,#7A1F08_45%,#F0410F_100%)] p-6 sm:p-7 text-white shadow-card animate-fade-up'>
          <div className='absolute -top-14 -right-8 w-56 h-56 bg-white/10 rounded-full blur-2xl animate-blob' />
          <div className='absolute -bottom-16 left-1/4 w-64 h-64 bg-blinkit-yellow/15 rounded-full blur-3xl animate-blob' style={{ animationDelay: '2s' }} />
          <div className='relative flex flex-wrap items-center justify-between gap-4'>
            <div className='flex items-center gap-4'>
              <div className='w-14 h-14 rounded-2xl bg-white/15 backdrop-blur grid place-items-center ring-1 ring-white/25 shrink-0 animate-bob'>
                <FaMotorcycle size={26} className='text-white' />
              </div>
              <div>
                <span className='chip bg-white/15 backdrop-blur ring-1 ring-white/20 !py-0.5 mb-1.5'>
                  <span className='w-1.5 h-1.5 rounded-full bg-white animate-pulse-dot' /> Live
                </span>
                <h1 className='text-xl font-display font-bold tracking-tight'>Welcome, {userData.fullName}</h1>
              </div>
            </div>
            <div className='flex items-center gap-2 bg-white/10 backdrop-blur rounded-xl px-3.5 py-2 ring-1 ring-white/15 text-xs font-semibold tabular-nums'>
              <FaLocationDot size={13} className='text-blinkit-yellow' />
              <span className='text-white/80'>Lat {deliveryBoyLocation?.lat?.toFixed(4) ?? '—'},</span>
              <span className='text-white/80'>Lon {deliveryBoyLocation?.lon?.toFixed(4) ?? '—'}</span>
            </div>
          </div>
        </div>

        {/* stats + chart */}
        <div className='w-full grid grid-cols-1 sm:grid-cols-5 gap-5'>
          <div className='w-full sm:col-span-2 bg-white rounded-2xl shadow-soft p-5 border border-blinkit-border-light animate-fade-up' style={{ animationDelay: '.06s' }}>
            <p className='flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-blinkit-text-muted mb-4'>
              <span className='w-7 h-7 rounded-lg bg-blinkit-green-soft grid place-items-center text-blinkit-green-dark'><FaRupeeSign size={13} /></span>
              Today's Earning
            </p>
            <span className='font-display text-4xl font-extrabold text-blinkit-green tracking-tight tabular-nums'>₹{totalEarning}</span>
            <p className='text-xs font-semibold text-blinkit-text-muted mt-2'>{todayDeliveries.reduce((s, d) => s + d.count, 0)} deliveries today</p>
            <div className='mt-4 rounded-xl bg-blinkit-green-soft/60 border border-blinkit-green/15 p-3 text-xs font-bold text-blinkit-green-dark flex items-center gap-2'>
              <FaCircleCheck size={14} /> ₹{ratePerDelivery} per delivery
            </div>
          </div>

          <div className='w-full sm:col-span-3 bg-white rounded-2xl shadow-soft p-5 border border-blinkit-border-light animate-fade-up' style={{ animationDelay: '.12s' }}>
            <p className='flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-blinkit-text-muted mb-4'>
              <span className='w-7 h-7 rounded-lg bg-blinkit-yellow-soft grid place-items-center text-blinkit-yellow-dark'><FaRoute size={13} /></span>
              Deliveries by Hour
            </p>
            <ResponsiveContainer width="100%" height={170}>
              <BarChart data={todayDeliveries}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EDF1EF" />
                <XAxis dataKey="hour" tickFormatter={(h) => `${h}:00`} tick={{ fontSize: 11, fill: '#52606D' }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#52606D' }} axisLine={false} tickLine={false} width={24} />
                <Tooltip
                  formatter={(value) => [value, "orders"]}
                  labelFormatter={label => `${label}:00`}
                  contentStyle={{ borderRadius: 14, border: '1px solid #EDF1EF', boxShadow: '0 6px 20px -6px rgba(16,24,40,.12)', fontSize: 12, fontFamily: 'inherit' }} />
                <Bar dataKey="count" fill='url(#barGrad)' radius={[6, 6, 0, 0]}>
                  <defs>
                    <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#F95B23" />
                      <stop offset="100%" stopColor="#D53A0B" />
                    </linearGradient>
                  </defs>
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* available orders */}
        {!currentOrder && (
          <div className='w-full bg-white rounded-2xl p-5 shadow-soft border border-blinkit-border-light animate-fade-up' style={{ animationDelay: '.18s' }}>
            <h1 className='flex items-center gap-2.5 text-lg font-display font-bold mb-4 text-blinkit-text'>
              <span className='w-9 h-9 grid place-items-center rounded-xl bg-blinkit-yellow-soft text-blinkit-yellow-dark'><FaClock size={16} /></span>
              Available Orders
              {availableAssignments?.length > 0 && <span className='chip bg-blinkit-yellow-soft text-blinkit-yellow-dark !py-0.5 tabular-nums'>{availableAssignments.length}</span>}
            </h1>

            <div className='space-y-4'>
              {availableAssignments?.length > 0 ? (
                availableAssignments.map((a, index) => (
                  <div key={index} className='border border-blinkit-border rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:border-blinkit-green/40 hover:shadow-soft transition-all duration-200 animate-fade-up' style={{ animationDelay: `${index * 0.06}s` }}>
                    <div className='min-w-0'>
                      <div className='flex items-center gap-2'>
                        {a.image ? (
                          <img src={a.image} alt={a?.shopName} className='w-11 h-11 rounded-xl object-cover border border-blinkit-border-light shadow-soft shrink-0' />
                        ) : (
                          <span className='w-11 h-11 rounded-xl bg-blinkit-green-soft grid place-items-center text-blinkit-green-dark font-extrabold shrink-0'>{a?.shopName?.slice(0, 1)}</span>
                        )}
                        <p className='text-[15px] font-bold text-blinkit-text truncate'>{a?.shopName}</p>
                      </div>
                      <p className='text-sm text-blinkit-text-secondary mt-2'><span className='font-semibold'>Delivery Address:</span> {a?.deliveryAddress.text}</p>
                      <p className='text-xs text-blinkit-text-muted font-medium mt-1 tabular-nums'>{a.items.length} items · {a.subtotal}</p>
                    </div>
                    <button className='btn btn-primary !px-7 !py-2.5 text-sm shrink-0' onClick={() => acceptOrder(a.assignmentId)}>Accept</button>
                  </div>
                )))
              : <div className='py-8 flex flex-col items-center text-center text-blinkit-text-muted'>
                  <FaMotorcycle size={30} className='text-blinkit-border mb-3' />
                  <p className='text-sm font-semibold'>No available orders right now</p>
                  <p className='text-xs font-medium mt-1'>New orders will appear here automatically</p>
                </div>}
            </div>
          </div>
        )}

        {/* current order */}
        {currentOrder && (
          <div className='w-full bg-white rounded-2xl p-5 shadow-soft border border-blinkit-border-light animate-fade-up' style={{ animationDelay: '.18s' }}>
            <div className='flex items-center justify-between mb-4 gap-3'>
              <h2 className='flex items-center gap-2.5 text-lg font-display font-bold text-blinkit-text'>
                <span className='w-9 h-9 grid place-items-center rounded-xl bg-blinkit-green-soft text-blinkit-green-dark'><FaRoute size={16} /></span>
                Current Order
              </h2>
              <span className='chip bg-blinkit-yellow-soft text-blinkit-yellow-dark shadow-soft'>
                <span className='w-1.5 h-1.5 rounded-full bg-blinkit-yellow-dark animate-pulse-dot' /> Active
              </span>
            </div>

            <div className='flex items-center gap-3.5 border border-blinkit-border rounded-2xl p-4 mb-4 bg-blinkit-bg/50'>
              {currentOrder?.shopOrder?.shop?.image ? (
                <img src={currentOrder.shopOrder.shop.image} alt={currentOrder?.shopOrder?.shop?.name} className='w-14 h-14 rounded-xl object-cover border border-blinkit-border-light shadow-soft shrink-0' />
              ) : (
                <span className='w-14 h-14 rounded-xl bg-blinkit-green-soft grid place-items-center text-blinkit-green-dark font-extrabold text-lg shrink-0'>
                  {(currentOrder?.shopOrder?.shop?.name || "S").slice(0, 1)}
                </span>
              )}
              <div className='min-w-0'>
                <p className='font-bold text-blinkit-text truncate'>{currentOrder?.shopOrder?.shop?.name || "Restaurant"}</p>
                <p className='text-sm text-blinkit-text-secondary truncate mt-0.5'>{currentOrder?.deliveryAddress?.text}</p>
                <p className='text-xs text-blinkit-text-muted font-semibold mt-1 tabular-nums'>
                  {currentOrder?.shopOrder?.shopOrderItems?.length || 0} items · ₹{currentOrder?.shopOrder?.subtotal || 0}
                </p>
              </div>
            </div>

            <DeliveryBoyTracking data={{
              deliveryBoyLocation: deliveryBoyLocation || {
                lat: userData?.location?.coordinates?.[1],
                lon: userData?.location?.coordinates?.[0]
              },
              customerLocation: {
                lat: currentOrder?.deliveryAddress?.latitude,
                lon: currentOrder?.deliveryAddress?.longitude
              }}} />

            {!showOtpBox ? (
              <button className='mt-5 w-full btn btn-primary !py-3.5 !text-[15px] relative overflow-hidden group' onClick={sendOtp} disabled={loading}>
                {loading ? <ClipLoader size={20} color='white' /> : (
                  <span className='relative z-10 flex items-center gap-2'>
                    <FaCircleCheck size={16} /> Mark As Delivered
                  </span>
                )}
                <span className='absolute inset-0 translate-x-[-120%] group-hover:translate-x-[120%] transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12' />
              </button>
            ) : (
              <div className='mt-5 p-4 sm:p-5 border border-blinkit-border rounded-2xl bg-blinkit-bg/60 animate-scale-in'>
                <p className='text-sm font-bold mb-3 text-blinkit-text flex items-center gap-2'>
                  <FaPhone size={14} className='text-blinkit-green' />
                  Enter OTP sent to <span className='text-blinkit-green'>{currentOrder?.user?.fullName || "Customer"}</span>
                </p>
                <input
                  type="text"
                  maxLength={4}
                  className={`input tracking-[0.5em] font-bold text-center mb-3 ${errorMsg ? 'border-red-400 focus:ring-red-300' : ''}`}
                  placeholder='• • • •'
                  onChange={(e) => {
                    setOtp(e.target.value)
                    if (errorMsg) setErrorMsg("")
                  }}
                  value={otp}
                  disabled={verifying}
                  autoFocus
                />
                {errorMsg && (
                  <p className='text-center text-red-600 font-bold text-sm mb-3 bg-red-50 p-2.5 rounded-xl border border-red-200 animate-shake'>
                    ⚠️ {errorMsg}
                  </p>
                )}
                {message && (
                  <p className='text-center text-blinkit-green-dark font-extrabold text-base mb-3 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200 animate-pop'>
                    {message}
                  </p>
                )}
                <div className='flex gap-2.5 items-center'>
                  <button
                    className="flex-1 btn btn-primary !py-3"
                    onClick={verifyOtp}
                    disabled={verifying}
                  >
                    {verifying ? <ClipLoader size={18} color='white' /> : "Submit OTP"}
                  </button>
                  <button
                    className="btn bg-white border border-blinkit-border !text-xs !py-3 px-3 text-blinkit-text-secondary hover:bg-gray-50"
                    onClick={sendOtp}
                    disabled={loading || verifying}
                    title="Resend OTP"
                  >
                    {loading ? <ClipLoader size={14} color='#666' /> : "Resend"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default DeliveryBoy
