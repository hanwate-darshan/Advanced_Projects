import axios from 'axios'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { serverUrl } from '../App'
import { FaLocationDot, FaBoxOpen, FaStar } from "react-icons/fa6"

const statusClass = (status) => {
    const s = (status || "").toLowerCase()
    if (s === "pending") return "status-pending"
    if (s === "preparing") return "status-preparing"
    if (s === "out of delivery") return "status-outofdelivery"
    if (s === "delivered") return "status-delivered"
    return "status-pending"
}

function UserOrderCard({ data, index = 0 }) {
    const navigate = useNavigate()
    const [selectedRating, setSelectedRating] = useState({})//itemId:rating
    const shopOrdersList = Array.isArray(data.shopOrders) ? data.shopOrders : (data.shopOrders ? [data.shopOrders] : [])
    const firstStatus = shopOrdersList[0]?.status || "pending"

    const formatDate = (dateString) => {
        const date = new Date(dateString)
        return date.toLocaleString('en-GB', {
            day: "2-digit",
            month: "short",
            year: "numeric"
        })
    }

    const handleRating = async (itemId, rating) => {
        try {
            await axios.post(`${serverUrl}/api/item/rating`, { itemId, rating }, { withCredentials: true })
            setSelectedRating(prev => ({
                ...prev, [itemId]: rating
            }))
        } catch (error) {
            console.log(error)
        }
    }


    return (
        <div
            className='bg-white rounded-2xl shadow-soft p-4 sm:p-5 space-y-4 border border-blinkit-border-light transition-all duration-300 hover:shadow-card animate-fade-up'
            style={{ animationDelay: `${Math.min(index, 8) * 0.05}s` }}
        >
            <div className='flex flex-wrap justify-between items-start gap-3 border-b border-blinkit-border-light pb-3'>
                <div>
                    <p className='font-extrabold text-blinkit-text tracking-tight'>
                        Order <span className='text-blinkit-green'>#{data._id.slice(-6)}</span>
                    </p>
                    <p className='text-xs text-blinkit-text-muted font-medium mt-0.5'>
                        Placed on {formatDate(data.createdAt)}
                    </p>
                </div>
                <div className='text-right space-y-1.5'>
                    {data.paymentMethod == "cod" ? <span className='chip bg-blinkit-bg text-blinkit-text-secondary !py-1'>{data.paymentMethod?.toUpperCase()}</span> : <span className='chip bg-blinkit-bg text-blinkit-text-secondary !py-1'>Paid: {data.payment ? "Yes" : "No"}</span>}
                    <div>
                        <span className={`status-pill ${statusClass(firstStatus)}`}>
                            <span className='status-badge' /> {firstStatus}
                        </span>
                    </div>
                </div>
            </div>

            {shopOrdersList.map((shopOrder, index) => (
                <div className='rounded-xl p-3 sm:p-4 bg-blinkit-bg/70 border border-blinkit-border-light space-y-3' key={index}>
                    <div className='flex items-center gap-2'>
                        {shopOrder.shop?.image ? (
                            <img src={shopOrder.shop.image} alt={shopOrder.shop.name} className='w-9 h-9 rounded-lg object-cover border border-blinkit-border-light shadow-soft' />
                        ) : (
                            <span className='w-9 h-9 rounded-lg bg-blinkit-green-soft grid place-items-center text-blinkit-green-dark font-extrabold text-xs'>{shopOrder.shop?.name?.slice(0, 1) || "S"}</span>
                        )}
                        <p className='font-bold text-blinkit-text text-sm'>{shopOrder.shop?.name || "Shop"}</p>
                    </div>

                    <div className='flex space-x-3 overflow-x-auto pb-2 no-scrollbar'>
                        {(shopOrder.shopOrderItems || []).map((item, index) => (
                            <div key={index} className='flex-shrink-0 w-44 border border-blinkit-border-light rounded-xl p-2 bg-white shadow-soft transition-all duration-200 hover:-translate-y-0.5'>
                                <img src={item.item?.image || item.image} alt="" className='w-full h-24 object-cover rounded-lg' />
                                <p className='text-sm font-bold mt-1.5 text-blinkit-text truncate' title={item.name}>{item.name}</p>
                                <p className='text-xs text-blinkit-text-muted font-medium tabular-nums'>Qty {item.quantity} × ₹{item.price} = <span className='text-blinkit-green font-bold'>₹{item.price * item.quantity}</span></p>

                                {shopOrder.status == "delivered" && (
                                    <div className='flex items-center gap-0.5 mt-2.5'>
                                        <FaStar size={10} className='text-blinkit-text-muted mr-1' />
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                className={`text-lg leading-none transition-all duration-150 hover:scale-125 ${selectedRating[item.item._id] >= star ? 'text-blinkit-yellow' : 'text-gray-300'}`}
                                                onClick={() => handleRating(item.item._id, star)}
                                                key={star}
                                                aria-label={`Rate ${star} stars`}
                                            >★</button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                    <div className='flex flex-wrap justify-between items-center gap-2 border-t border-blinkit-border-light pt-2.5'>
                        <p className='font-bold text-sm text-blinkit-text tabular-nums'>Subtotal ₹{shopOrder.subtotal}</p>
                        <span className={`status-pill !px-2.5 !py-0.5 ${statusClass(shopOrder.status)}`}>
                            <span className='status-badge' /> {shopOrder.status}
                        </span>
                    </div>
                </div>
            ))}

            <div className='flex flex-wrap justify-between items-center gap-3 border-t border-blinkit-border-light pt-3'>
                <p className='font-extrabold text-lg text-blinkit-text tracking-tight tabular-nums'>Total ₹{data.totalAmount}</p>
                <button className='btn btn-primary !px-5 !py-2.5 text-sm' onClick={() => navigate(`/track-order/${data._id}`)}>
                    <FaLocationDot size={14} />
                    Track Order
                </button>
            </div>
        </div>
    )
}

export default UserOrderCard
