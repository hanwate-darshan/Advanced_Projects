import React from 'react'
import { useSelector } from 'react-redux'
import UserDashboard from '../components/UserDashboard'
import OwnerDashboard from '../components/OwnerDashboard'
import DeliveryBoy from '../components/DeliveryBoy'
import AdminDashboard from '../components/AdminDashboard'

function Home() {
    const {userData}=useSelector(state=>state.user)
  return (
    <div className='w-[100vw] min-h-[100vh] flex flex-col items-center bg-blinkit-bg'>
      {userData.role=="user" && <UserDashboard/>}
      {userData.role=="owner" && <OwnerDashboard/>}
      {userData.role=="deliveryBoy" && <DeliveryBoy/>}
      {userData.role=="admin" && <AdminDashboard/>}
    </div>
  )
}

export default Home
