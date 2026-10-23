import axios from 'axios'
import React, { useEffect } from 'react'
import { serverUrl } from '../App'
import { useDispatch, useSelector } from 'react-redux'
import { setShopsInMyCity } from '../redux/userSlice'

function useGetShopByCity() {
    const dispatch = useDispatch()
    const { currentCity } = useSelector(state => state.user)

    useEffect(() => {
        if (!currentCity) return

        const fetchShops = async () => {
            try {
                const encodedCity = encodeURIComponent(currentCity.trim())
                const result = await axios.get(`${serverUrl}/api/shop/get-by-city/${encodedCity}`, { withCredentials: true })
                dispatch(setShopsInMyCity(result.data || []))
            } catch (error) {
                console.error("fetchShops error:", error)
                dispatch(setShopsInMyCity([]))
            }
        }
        fetchShops()
    }, [currentCity])
}

export default useGetShopByCity
