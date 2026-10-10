import axios from 'axios'
import React, { useEffect } from 'react'
import { serverUrl } from '../App'
import { useDispatch, useSelector } from 'react-redux'
import { setRecommendedItems } from '../redux/userSlice'

function useGetRecommendations() {
    const dispatch = useDispatch()
    const { userData, currentCity } = useSelector(state => state.user)
    useEffect(() => {
        if (!userData || !currentCity) return
        const fetchRecommendations = async () => {
            try {
                const result = await axios.get(`${serverUrl}/api/recommendations?city=${encodeURIComponent(currentCity)}`, { withCredentials: true })
                dispatch(setRecommendedItems(result.data))
            } catch (error) {
                console.log("recommendations fetch failed", error?.response?.data?.message || error.message)
                dispatch(setRecommendedItems([]))
            }
        }
        fetchRecommendations()
    }, [userData?._id, currentCity])
}

export default useGetRecommendations
