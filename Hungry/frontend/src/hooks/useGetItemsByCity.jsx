import axios from 'axios'
import React, { useEffect } from 'react'
import { serverUrl } from '../App'
import { useDispatch, useSelector } from 'react-redux'
import { setItemsInMyCity } from '../redux/userSlice'

function useGetItemsByCity() {
    const dispatch = useDispatch()
    const { currentCity } = useSelector(state => state.user)

    useEffect(() => {
        if (!currentCity) return

        const fetchItems = async () => {
            try {
                const encodedCity = encodeURIComponent(currentCity.trim())
                const result = await axios.get(`${serverUrl}/api/item/get-by-city/${encodedCity}`, { withCredentials: true })
                dispatch(setItemsInMyCity(result.data || []))
            } catch (error) {
                console.error("fetchItems error:", error)
                dispatch(setItemsInMyCity([]))
            }
        }
        fetchItems()
    }, [currentCity])
}

export default useGetItemsByCity
