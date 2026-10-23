import React from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import SignUp from './pages/SignUp'
import SignIn from './pages/SignIn'
import ForgotPassword from './pages/ForgotPassword'
import useGetCurrentUser from './hooks/useGetCurrentUser'
import { useDispatch, useSelector } from 'react-redux'
import Home from './pages/Home'
import useGetCity from './hooks/useGetCity'
import useGetMyshop from './hooks/useGetMyShop'
import CreateEditShop from './pages/CreateEditShop'
import AddItem from './pages/AddItem'
import EditItem from './pages/EditItem'
import useGetShopByCity from './hooks/useGetShopByCity'
import useGetItemsByCity from './hooks/useGetItemsByCity'
import CartPage from './pages/CartPage'
import CheckOut from './pages/CheckOut'
import OrderPlaced from './pages/OrderPlaced'
import MyOrders from './pages/MyOrders'
import useGetMyOrders from './hooks/useGetMyOrders'
import useGetRecommendations from './hooks/useGetRecommendations'
import useUpdateLocation from './hooks/useUpdateLocation'
import TrackOrderPage from './pages/TrackOrderPage'
import Shop from './pages/Shop'
import AiFoodAssistant from './components/AiFoodAssistant'
import { useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import { setSocket, addMyOrder, updateRealtimeOrderStatus } from './redux/userSlice'
import { useNavigate } from 'react-router-dom'

// Admin Portal Imports
import AdminLayout from './admin/layouts/AdminLayout'
import AdminLogin from './admin/pages/AdminLogin'
import AdminDashboard from './admin/pages/AdminDashboard'
import AdminCustomers from './admin/pages/AdminCustomers'
import AdminOwners from './admin/pages/AdminOwners'
import AdminRiders from './admin/pages/AdminRiders'
import AdminRestaurants from './admin/pages/AdminRestaurants'
import AdminLiveDeliveries from './admin/pages/AdminLiveDeliveries'
import AdminOrders from './admin/pages/AdminOrders'
import AdminPayments from './admin/pages/AdminPayments'
import AdminRevenue from './admin/pages/AdminRevenue'
import AdminComplaints from './admin/pages/AdminComplaints'
import AdminCoupons from './admin/pages/AdminCoupons'
import AdminNotifications from './admin/pages/AdminNotifications'
import AdminAnalytics from './admin/pages/AdminAnalytics'
import AdminSettings from './admin/pages/AdminSettings'
import AdminActivityLogs from './admin/pages/AdminActivityLogs'

export const serverUrl="http://localhost:8000"

const playNotificationChime = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext
    if (!AudioContext) return
    const ctx = new AudioContext()
    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = "sine"
    osc.frequency.setValueAtTime(523.25, now)
    osc.frequency.setValueAtTime(659.25, now + 0.12)
    osc.frequency.setValueAtTime(783.99, now + 0.24)

    gain.gain.setValueAtTime(0.25, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5)

    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(now)
    osc.stop(now + 0.5)
  } catch (err) {
    console.log("Audio notification skipped:", err)
  }
}

function App() {
    const {userData}=useSelector(state=>state.user)
    const dispatch=useDispatch()
    const navigate=useNavigate()
    const [orderNotification, setOrderNotification] = useState(null)

  useGetCurrentUser()
  useUpdateLocation()
  useGetCity()
  useGetMyshop()
  useGetShopByCity()
  useGetItemsByCity()
  useGetMyOrders()
  useGetRecommendations()

  useEffect(() => {
    if (!orderNotification) return
    const timer = setTimeout(() => setOrderNotification(null), 8000)
    return () => clearTimeout(timer)
  }, [orderNotification])

  useEffect(() => {
    if (!userData?._id) return

    const socketInstance = io(serverUrl, { withCredentials: true })
    dispatch(setSocket(socketInstance))

    const sendIdentity = () => {
      console.log("Emitting identity for user:", userData._id)
      socketInstance.emit('identity', { userId: userData._id })
    }

    socketInstance.on('connect', sendIdentity)
    if (socketInstance.connected) {
      sendIdentity()
    }

    const handleNewOrder = (data) => {
      console.log("Global realtime newOrder received:", data)
      const ownerId = data.shopOrders?.owner?._id || data.shopOrders?.owner
      if (ownerId && userData?._id && String(ownerId) === String(userData._id)) {
        dispatch(addMyOrder(data))
        playNotificationChime()
        setOrderNotification({
          id: data._id,
          customer: data.user?.fullName || data.user?.name || "A customer",
          subtotal: data.shopOrders?.subtotal || data.totalAmount || 0,
          itemsCount: data.shopOrders?.shopOrderItems?.length || 1
        })
      }
    }

    const handleUpdateStatus = async ({ orderId, shopId, status, userId, shopOrderId }) => {
      console.log("Global realtime update-status received:", { orderId, shopId, status, userId, shopOrderId })
      dispatch(updateRealtimeOrderStatus({ orderId, shopId, status, shopOrderId }))
      try {
        const result = await axios.get(`${serverUrl}/api/order/my-orders`, { withCredentials: true })
        if (result.data) {
          dispatch(setMyOrders(result.data))
        }
      } catch (err) {
        console.log("Error syncing myOrders on update-status:", err)
      }
    }

    socketInstance.on('newOrder', handleNewOrder)
    socketInstance.on('update-status', handleUpdateStatus)

    return () => {
      socketInstance.off('connect', sendIdentity)
      socketInstance.off('newOrder', handleNewOrder)
      socketInstance.off('update-status', handleUpdateStatus)
      socketInstance.disconnect()
      dispatch(setSocket(null))
    }
  }, [userData?._id, dispatch])

  return (
    <>
      {orderNotification && (
        <div className='fixed top-20 right-4 sm:right-6 z-[99999] bg-white border-2 border-blinkit-green/40 shadow-glow rounded-2xl p-4 flex items-center gap-3.5 max-w-sm animate-fade-in'>
          <div className='w-11 h-11 rounded-xl bg-gradient-to-br from-red-500 to-[#F95B23] grid place-items-center text-white shrink-0 shadow-soft animate-bounce text-lg'>
            🔔
          </div>
          <div className='min-w-0 flex-1'>
            <div className='flex items-center gap-2'>
              <span className='text-xs font-extrabold uppercase tracking-wider text-blinkit-green'>New Order!</span>
              <span className='text-[10px] text-blinkit-text-muted font-bold'>#{String(orderNotification.id).slice(-6)}</span>
            </div>
            <p className='text-sm font-bold text-blinkit-text truncate'>{orderNotification.customer} ordered {orderNotification.itemsCount} item{orderNotification.itemsCount > 1 ? 's' : ''}</p>
            <p className='text-xs font-semibold text-blinkit-text-secondary'>Total ₹{orderNotification.subtotal}</p>
          </div>
          <div className='flex flex-col gap-1.5 shrink-0'>
            <button
              onClick={() => {
                navigate("/my-orders")
                setOrderNotification(null)
              }}
              className='btn btn-primary !py-1.5 !px-3 !text-xs cursor-pointer'
            >
              View
            </button>
            <button
              onClick={() => setOrderNotification(null)}
              className='text-[11px] text-blinkit-text-muted hover:text-blinkit-text font-semibold text-center cursor-pointer'
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
      <Routes>
        {/* Admin Portal Routes */}
        <Route path='/admin/login' element={<AdminLogin />} />
        <Route path='/admin' element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path='customers' element={<AdminCustomers />} />
          <Route path='owners' element={<AdminOwners />} />
          <Route path='riders' element={<AdminRiders />} />
          <Route path='restaurants' element={<AdminRestaurants />} />
          <Route path='live-deliveries' element={<AdminLiveDeliveries />} />
          <Route path='orders' element={<AdminOrders />} />
          <Route path='payments' element={<AdminPayments />} />
          <Route path='revenue' element={<AdminRevenue />} />
          <Route path='complaints' element={<AdminComplaints />} />
          <Route path='coupons' element={<AdminCoupons />} />
          <Route path='notifications' element={<AdminNotifications />} />
          <Route path='analytics' element={<AdminAnalytics />} />
          <Route path='settings' element={<AdminSettings />} />
          <Route path='logs' element={<AdminActivityLogs />} />
        </Route>

        {/* Existing Application Routes */}
        <Route path='/signup' element={!userData?<SignUp/>:<Navigate to={"/"}/>}/>
        <Route path='/signin' element={!userData?<SignIn/>:<Navigate to={"/"}/>}/>
        <Route path='/forgot-password' element={!userData?<ForgotPassword/>:<Navigate to={"/"}/>}/>
        <Route path='/' element={userData?<Home/>:<Navigate to={"/signin"}/>}/>
        <Route path='/create-edit-shop' element={userData?<CreateEditShop/>:<Navigate to={"/signin"}/>}/>
        <Route path='/add-item' element={userData?<AddItem/>:<Navigate to={"/signin"}/>}/>
        <Route path='/edit-item/:itemId' element={userData?<EditItem/>:<Navigate to={"/signin"}/>}/>
        <Route path='/cart' element={userData?<CartPage/>:<Navigate to={"/signin"}/>}/>
        <Route path='/checkout' element={userData?<CheckOut/>:<Navigate to={"/signin"}/>}/>
        <Route path='/order-placed' element={userData?<OrderPlaced/>:<Navigate to={"/signin"}/>}/>
        <Route path='/my-orders' element={userData?<MyOrders/>:<Navigate to={"/signin"}/>}/>
        <Route path='/track-order/:orderId' element={userData?<TrackOrderPage/>:<Navigate to={"/signin"}/>}/>
        <Route path='/shop/:shopId' element={userData?<Shop/>:<Navigate to={"/signin"}/>}/>
      </Routes>
      <AiFoodAssistant />
    </>
  )
}

export default App
