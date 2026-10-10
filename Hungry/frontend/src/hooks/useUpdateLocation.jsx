import axios from 'axios'
import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { serverUrl } from '../App'

function useUpdateLocation() {
    const {userData}=useSelector(state=>state.user)
 
    useEffect(()=>{
        if(!userData) return
const updateLocation=async (lat,lon) => {
    try {
        const result=await axios.post(`${serverUrl}/api/user/update-location`,{lat,lon},{withCredentials:true})
        console.log(result.data)
    } catch (error) {
        console.log("location update failed", error?.response?.data?.message || error.message)
    }
}

navigator.geolocation.watchPosition((pos)=>{
    updateLocation(pos.coords.latitude,pos.coords.longitude)
}, (error) => {
    console.log("geolocation error", error.message)
})
    },[userData])
}

export default useUpdateLocation
