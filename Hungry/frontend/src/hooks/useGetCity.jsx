import axios from 'axios'
import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {  setCurrentAddress, setCurrentCity, setCurrentState } from '../redux/userSlice'
import { setAddress, setLocation } from '../redux/mapSlice'

function useGetCity() {
    const dispatch = useDispatch()
    const { userData, currentCity } = useSelector(state => state.user)
    const apiKey = import.meta.env.VITE_GEOAPIKEY

    useEffect(() => {
        if (!navigator.geolocation) {
            if (!currentCity) dispatch(setCurrentCity("Pune"))
            return
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    const latitude = position.coords.latitude
                    const longitude = position.coords.longitude
                    dispatch(setLocation({ lat: latitude, lon: longitude }))

                    if (apiKey) {
                        const result = await axios.get(`https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&format=json&apiKey=${apiKey}`)
                        const detectedCity = result?.data?.results[0]?.city || result?.data?.results[0]?.county || result?.data?.results[0]?.state_district || "Pune"
                        dispatch(setCurrentCity(detectedCity))
                        dispatch(setCurrentState(result?.data?.results[0]?.state || "Maharashtra"))
                        dispatch(setCurrentAddress(result?.data?.results[0]?.address_line2 || result?.data?.results[0]?.address_line1 || "Current Location"))
                        dispatch(setAddress(result?.data?.results[0]?.address_line2 || result?.data?.results[0]?.address_line1 || "Current Location"))
                    } else if (!currentCity) {
                        dispatch(setCurrentCity("Pune"))
                    }
                } catch (err) {
                    console.log("Geoapify error:", err)
                    if (!currentCity) dispatch(setCurrentCity("Pune"))
                }
            },
            (error) => {
                console.log("Geolocation error/denied:", error)
                if (!currentCity) dispatch(setCurrentCity("Pune"))
            },
            { timeout: 10000 }
        )
    }, [userData])
}

export default useGetCity
