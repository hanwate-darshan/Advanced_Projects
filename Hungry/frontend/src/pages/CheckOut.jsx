import React, { useEffect, useState } from 'react'
import { IoIosArrowRoundBack } from "react-icons/io";
import { IoSearchOutline } from "react-icons/io5";
import { TbCurrentLocation } from "react-icons/tb";
import { IoLocationSharp } from "react-icons/io5";
import { MapContainer, Marker, TileLayer, useMap } from 'react-leaflet';
import { useDispatch, useSelector } from 'react-redux';
import "leaflet/dist/leaflet.css"
import { setAddress, setLocation } from '../redux/mapSlice';
import { MdDeliveryDining } from "react-icons/md";
import { FaCreditCard } from "react-icons/fa";
import axios from 'axios';
import { FaLock, FaCircleCheck } from "react-icons/fa6";
import { useNavigate } from 'react-router-dom';
import { serverUrl } from '../App';
import { addMyOrder, clearCart } from '../redux/userSlice';
import { ClipLoader } from 'react-spinners';

function RecenterMap({ location }) {
  const map = useMap()
  if (location.lat && location.lon) {
    map.setView([location.lat, location.lon], 16, { animate: true })
  }
  return null

}

function SectionTitle({ step, icon, children }) {
  const Icon = icon
  return (
    <h2 className='flex items-center gap-3 text-lg font-display font-bold text-blinkit-text mb-4 animate-fade-up'>
      <span className='step-badge'>{step}</span>
      <Icon size={17} className='text-blinkit-green' />
      {children}
    </h2>
  )
}

function CheckOut() {
  const { location, address } = useSelector(state => state.map)
    const { cartItems, totalAmount, userData } = useSelector(state => state.user)
  const [addressInput, setAddressInput] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("cod")
  const [placing, setPlacing] = useState(false)
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const apiKey = import.meta.env.VITE_GEOAPIKEY
  const deliveryFee = totalAmount > 500 ? 0 : 40
  const AmountWithDeliveryFee = totalAmount + deliveryFee

  const onDragEnd = (e) => {
    const { lat, lng } = e.target._latlng
    dispatch(setLocation({ lat, lon: lng }))
    getAddressByLatLng(lat, lng)
  }
  const getCurrentLocation = () => {
      const latitude = userData.location.coordinates[1]
      const longitude = userData.location.coordinates[0]
      dispatch(setLocation({ lat: latitude, lon: longitude }))
      getAddressByLatLng(latitude, longitude)
  }

  const getAddressByLatLng = async (lat, lng) => {
    try {
      const result = await axios.get(`https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lng}&format=json&apiKey=${apiKey}`)
      dispatch(setAddress(result?.data?.results[0].address_line2))
    } catch (error) {
      console.log(error)
    }
  }

  const getLatLngByAddress = async () => {
    try {
      const result = await axios.get(`https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(addressInput)}&apiKey=${apiKey}`)
      const { lat, lon } = result.data.features[0].properties
      dispatch(setLocation({ lat, lon }))
    } catch (error) {
      console.log(error)
    }
  }

  const handlePlaceOrder = async () => {
    setPlacing(true)
    try {
      const result = await axios.post(`${serverUrl}/api/order/place-order`, {
        paymentMethod,
        deliveryAddress: {
          text: addressInput,
          latitude: location.lat,
          longitude: location.lon
        },
        totalAmount: AmountWithDeliveryFee,
        cartItems
      }, { withCredentials: true })

      if (paymentMethod == "cod") {
        dispatch(addMyOrder(result.data))
        dispatch(clearCart())
        navigate("/order-placed", { state: { orderId: result.data._id } })
      } else {
        const orderId = result.data.orderId
        const razorOrder = result.data.razorOrder
        openRazorpayWindow(orderId, razorOrder)
      }
      setPlacing(false)
    } catch (error) {
      console.log(error)
      setPlacing(false)
    }
  }

const openRazorpayWindow = (orderId, razorOrder) => {

  const options = {
  key: import.meta.env.VITE_RAZORPAY_KEY_ID,
  amount: razorOrder.amount,
  currency: 'INR',
  name: "Hungry",
  description: "Cravings delivered.",
  order_id: razorOrder.id,
  handler: async function (response) {
   try {
    const result = await axios.post(`${serverUrl}/api/order/verify-payment`, {
      razorpay_payment_id: response.razorpay_payment_id,
      orderId
    }, { withCredentials: true })
    dispatch(addMyOrder(result.data))
    dispatch(clearCart())
    navigate("/order-placed", { state: { orderId: result.data?._id || orderId } })
   } catch (error) {
    console.log(error)
   }
  }
  }

  const rzp = new window.Razorpay(options)
  rzp.open()
}

  useEffect(() => {
    setAddressInput(address)
  }, [address])
  return (
    <div className='min-h-screen bg-blinkit-bg flex items-start justify-center p-4 sm:p-6 py-10'>
      <button className='back-btn' onClick={() => navigate("/")}>
        <IoIosArrowRoundBack size={20} className="text-blinkit-green" />
        <span>Back</span>
      </button>
      <div className='w-full max-w-[900px] mt-8 animate-fade-up'>

        <div className='flex items-center gap-4 mb-6'>
          <div className='w-12 h-12 rounded-2xl bg-[linear-gradient(135deg,#F95B23,#D53A0B)] grid place-items-center text-white shadow-glow shrink-0'>
            <FaCreditCard size={20} />
          </div>
          <div>
            <h1 className='font-display text-2xl sm:text-3xl font-extrabold text-blinkit-text tracking-tight leading-none'>Checkout</h1>
            <p className='text-sm text-blinkit-text-secondary font-medium mt-1.5'>Almost there — confirm delivery & payment</p>
          </div>
        </div>

        {cartItems?.length === 0 ? (
          <div className='card !rounded-3xl py-16 flex flex-col items-center text-center'>
            <h2 className='font-display text-xl font-bold text-blinkit-text mb-1.5'>Your cart is empty</h2>
            <p className='text-blinkit-text-muted text-sm font-medium mb-6'>Add something delicious before checking out.</p>
            <button className='btn btn-primary !px-7' onClick={() => navigate("/")}>Explore Food</button>
          </div>
        ) : (
        <div className='bg-white rounded-2xl shadow-card p-5 sm:p-7 space-y-8 border border-blinkit-border-light'>

          <section>
            <SectionTitle step={1} icon={IoLocationSharp}>Delivery Location</SectionTitle>
            <div className='flex gap-2 mb-3'>
              <input type="text" className='input flex-1' placeholder='Enter Your Delivery Address..' value={addressInput} onChange={(e) => setAddressInput(e.target.value)} />
              <button className='btn btn-ghost !px-3.5 gap-0' title="Search address" onClick={getLatLngByAddress}><IoSearchOutline size={17} /></button>
              <button className='btn btn-primary !px-3.5 gap-0' title="Use my current location" onClick={getCurrentLocation}><TbCurrentLocation size={17} /></button>
            </div>
            <div className='rounded-2xl border border-blinkit-border overflow-hidden shadow-soft'>
              <div className='h-64 w-full flex items-center justify-center'>
                <MapContainer
                  className={"w-full h-full"}
                  center={[location?.lat, location?.lon]}
                  zoom={16}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <RecenterMap location={location} />
                  <Marker position={[location?.lat, location?.lon]} draggable eventHandlers={{ dragend: onDragEnd }} />


                </MapContainer>
              </div>
            </div>
          </section>

          <section>
            <SectionTitle step={2} icon={MdDeliveryDining}>Payment Method</SectionTitle>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              <div
                className={`relative flex items-center gap-3 rounded-2xl border-2 p-4 text-left transition-all duration-200 cursor-pointer ${paymentMethod === "cod" ? "border-blinkit-green bg-blinkit-green-soft/50 shadow-soft" : "border-blinkit-border hover:border-blinkit-text-muted hover:-translate-y-0.5"
                  }`}
                onClick={() => setPaymentMethod("cod")}
              >
                {paymentMethod === "cod" && <span className='absolute top-3 right-3 w-5 h-5 rounded-full bg-blinkit-green text-white grid place-items-center animate-pop'><FaCircleCheck size={11} /></span>}
                <span className='inline-flex h-11 w-11 items-center justify-center rounded-xl bg-blinkit-green/10 shrink-0'>
                  <MdDeliveryDining className='text-blinkit-green text-xl' />
                </span>
                <div>
                  <p className='font-bold text-blinkit-text text-sm'>Cash On Delivery</p>
                  <p className='text-xs text-blinkit-text-muted font-medium mt-0.5'>Pay when your food arrives</p>
                </div>
              </div>
              <div
                className={`relative flex items-center gap-3 rounded-2xl border-2 p-4 text-left transition-all duration-200 cursor-pointer ${paymentMethod === "online" ? "border-blinkit-green bg-blinkit-green-soft/50 shadow-soft" : "border-blinkit-border hover:border-blinkit-text-muted hover:-translate-y-0.5"
                  }`}
                onClick={() => setPaymentMethod("online")}
              >
                {paymentMethod === "online" && <span className='absolute top-3 right-3 w-5 h-5 rounded-full bg-blinkit-green text-white grid place-items-center animate-pop'><FaCircleCheck size={11} /></span>}
                <span className='inline-flex h-11 w-11 items-center justify-center rounded-xl bg-sky-50 shrink-0'>
                  <FaCreditCard className='text-sky-600 text-xl' />
                </span>
                <div>
                  <p className='font-bold text-blinkit-text text-sm'>UPI / Credit / Debit Card</p>
                  <p className='text-xs text-blinkit-text-muted font-medium mt-0.5'>Pay Securely Online</p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <SectionTitle step={3} icon={FaCircleCheck}>Order Summary</SectionTitle>
            <div className='rounded-2xl border border-blinkit-border-light bg-blinkit-bg/70 p-4 sm:p-5 space-y-2.5'>
              {cartItems.map((item, index) => (
                <div key={index} className='flex justify-between text-sm text-blinkit-text-secondary font-medium animate-fade-in' style={{ animationDelay: `${index * 0.04}s` }}>
                  <span className='truncate pr-4'>{item.name} <span className='text-blinkit-text-muted'>× {item.quantity}</span></span>
                  <span className='font-semibold text-blinkit-text tabular-nums shrink-0'>₹{item.price * item.quantity}</span>
                </div>
              ))}
              <hr className='border-blinkit-border my-3' />
              <div className='flex justify-between font-semibold text-blinkit-text text-sm'>
                <span>Subtotal</span>
                <span className='tabular-nums'>₹{totalAmount}</span>
              </div>
              <div className='flex justify-between text-blinkit-text-secondary text-sm font-medium'>
                <span>Delivery Fee {deliveryFee == 0 && <span className='chip bg-blinkit-green-soft text-blinkit-green-dark !py-0 !px-2 ml-1.5 text-[10px]'>Free above ₹500</span>}</span>
                <span className={deliveryFee == 0 ? 'text-blinkit-green font-bold' : ''}>{deliveryFee == 0 ? "Free" : `₹${deliveryFee}`}</span>
              </div>
              <div className='flex justify-between text-lg font-extrabold text-blinkit-text pt-2 border-t border-blinkit-border-light mt-1 tracking-tight'>
                <span>Total</span>
                <span className='tabular-nums'>₹{AmountWithDeliveryFee}</span>
              </div>
            </div>
          </section>

          <button className='btn btn-primary w-full !py-4 !text-base relative overflow-hidden group' onClick={handlePlaceOrder} disabled={placing}>
            <span className='relative z-10 flex items-center gap-2'>
              {placing ? <ClipLoader size={20} color='white' /> : <FaLock size={14} />}
              {placing ? "Placing Order…" : paymentMethod == "cod" ? "Place Order" : "Pay & Place Order"}
            </span>
            <span className='absolute inset-0 translate-x-[-120%] group-hover:translate-x-[120%] transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12' />
          </button>
        </div>
        )}
      </div>
    </div>
  )
}

export default CheckOut
