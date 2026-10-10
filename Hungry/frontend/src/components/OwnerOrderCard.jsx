import axios from 'axios';
import React from 'react'
import { MdPhone } from "react-icons/md";
import { FaBoxOpen, FaMotorcycle } from "react-icons/fa6";
import { FaMapMarkedAlt } from "react-icons/fa";
import { serverUrl } from '../App';
import { useDispatch } from 'react-redux';
import { updateOrderStatus } from '../redux/userSlice';
import { useState } from 'react';

const statusClass = (status) => {
  const s = (status || "").toLowerCase()
  if (s === "pending") return "status-pending"
  if (s === "preparing") return "status-preparing"
  if (s === "out of delivery" || s === "outfor delivery" || s === "out of delivery") return "status-outofdelivery"
  if (s === "delivered") return "status-delivered"
  return "status-pending"
}

function OwnerOrderCard({ data, index = 0 }) {
    const [availableBoys, setAvailableBoys] = useState([])
    const dispatch = useDispatch()
    const shopOrder = data?.shopOrders || {}
    const customerName = data?.user?.fullName || data?.user?.name || "Customer"
    const customerInitial = customerName.slice(0, 1).toUpperCase()
    const customerEmail = data?.user?.email || ""
    const customerMobile = data?.user?.mobile || "N/A"
    const shopId = shopOrder.shop?._id || shopOrder.shop

    const handleUpdateStatus = async (orderId, shopId, status) => {
        if (!status) return
        try {
            const result = await axios.post(`${serverUrl}/api/order/update-status/${orderId}/${shopId}`, { status }, { withCredentials: true })
             dispatch(updateOrderStatus({ orderId, shopId, status }))
             setAvailableBoys(result.data.availableBoys || [])
             console.log(result.data)
        } catch (error) {
            console.log(error)
        }
    }

  return (
    <div
      className='bg-white rounded-2xl shadow-soft p-4 sm:p-5 space-y-4 border border-blinkit-border-light transition-all duration-300 hover:shadow-card animate-fade-up'
      style={{ animationDelay: `${Math.min(index, 8) * 0.05}s` }}
    >
        <div className='flex flex-wrap items-start justify-between gap-3'>
            <div className='flex items-center gap-3 min-w-0'>
              <div className='w-11 h-11 rounded-full bg-blinkit-green-soft grid place-items-center text-blinkit-green-dark font-extrabold text-sm shrink-0 shadow-soft'>
                {customerInitial}
              </div>
              <div className='min-w-0'>
                <h2 className='text-lg font-bold text-blinkit-text truncate'>{customerName}</h2>
                <p className='text-sm text-blinkit-text-secondary truncate'>{customerEmail}</p>
              </div>
            </div>
            <div className='flex flex-col items-end gap-1.5'>
              <span className={`status-pill ${statusClass(shopOrder.status)}`}>
                <span className='status-badge' /> {shopOrder.status || "pending"}
              </span>
              <span className='inline-flex items-center gap-1.5 text-xs font-semibold text-blinkit-text-muted chip bg-blinkit-bg'>
                <MdPhone size={12} /> {customerMobile}
              </span>
            </div>
        </div>

        <div className='flex flex-wrap items-center gap-2'>
          <span className='chip bg-blinkit-yellow-soft text-blinkit-yellow-dark capitalize'>
            {data.paymentMethod == "online" ? (data.payment ? "Paid online" : "Online (unpaid)") : "Cash on Delivery"}
          </span>
        </div>

        <div className='flex items-start gap-2.5 text-blinkit-text-secondary text-sm bg-blinkit-bg/70 border border-blinkit-border-light rounded-xl p-3'>
          <FaMapMarkedAlt size={16} className='text-blinkit-green mt-0.5 shrink-0' />
          <div className='min-w-0'>
            <p className='font-medium text-blinkit-text'>{data?.deliveryAddress?.text}</p>
            <p className='text-[11px] text-blinkit-text-muted mt-0.5'>Lat: {data?.deliveryAddress?.latitude} , Lon {data?.deliveryAddress?.longitude}</p>
          </div>
        </div>

        <div>
          <p className='flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blinkit-text-muted mb-2'>
            <FaBoxOpen size={13} /> Items
          </p>
          <div className='flex space-x-3 overflow-x-auto pb-2 no-scrollbar'>
            {(shopOrder.shopOrderItems || []).map((item, index) => (
                <div key={index} className='flex-shrink-0 w-40 border border-blinkit-border-light rounded-xl p-2 bg-white shadow-soft transition-all duration-200 hover:shadow-soft hover:-translate-y-0.5'>
                    <img src={item.item?.image || item.image} alt="" className='w-full h-24 object-cover rounded-lg' />
                    <p className='text-sm font-semibold mt-1.5 text-blinkit-text truncate'>{item.name}</p>
                    <p className='text-xs text-blinkit-text-muted font-medium tabular-nums'>Qty: {item.quantity} x ₹{item.price}</p>
                </div>
            ))}
          </div>
        </div>

        <div className='flex flex-wrap justify-between items-center gap-3 pt-3 border-t border-blinkit-border-light'>
            <div className="rounded-xl border border-blinkit-border bg-white px-3.5 py-2 flex items-center gap-2 shrink-0">
              <span className='text-xs font-bold text-blinkit-text-muted uppercase tracking-wide'>Status</span>
              <select
                className='rounded-lg border-0 text-sm focus:outline-none focus:ring-2 focus:ring-blinkit-green/30 text-blinkit-green-dark font-bold bg-white cursor-pointer'
                value={shopOrder.status || "pending"}
                onChange={(e) => handleUpdateStatus(data._id, shopId, e.target.value)}>
                <option value="pending">Pending</option>
                <option value="preparing">Preparing</option>
                <option value="out of delivery">Out Of Delivery</option>
                <option value="delivered">Delivered</option>
              </select>
            </div>
            <div className='font-extrabold text-lg text-blinkit-text tracking-tight tabular-nums'>
              Total ₹{shopOrder.subtotal || 0}
            </div>
        </div>

        {(shopOrder.status == "out of delivery" || data?.shopOrders?.status == "out of delivery") &&
        <div className="mt-1 p-3.5 border border-violet-100 rounded-xl text-sm bg-violet-50/60">
          <p className='flex items-center gap-2 font-bold text-violet-800 mb-2'>
            <FaMotorcycle size={15} />
            {(shopOrder.assignedDeliveryBoy || data?.shopOrders?.assignedDeliveryBoy) ? "Assigned Delivery Rider" : "Available Delivery Riders"}
          </p>
          {availableBoys?.length > 0 ? (
            <div className='flex flex-col gap-1.5'>
              {availableBoys.map((b, index) => (
                <div className='flex items-center gap-2 text-blinkit-text-secondary font-medium chip bg-white border border-blinkit-border-light !px-2.5' key={index}>
                  <span className='w-6 h-6 rounded-full bg-violet-100 text-violet-700 grid place-items-center text-[10px] font-extrabold shrink-0'>{b.fullName?.slice(0, 1)}</span>
                  {b.fullName} · {b.mobile}
                </div>
              ))}
            </div>
          ) : (shopOrder.assignedDeliveryBoy || data?.shopOrders?.assignedDeliveryBoy) ? (
            <div className='flex items-center gap-2 text-blinkit-text-secondary font-medium chip bg-white border border-blinkit-border-light !px-2.5'>
              <span className='w-6 h-6 rounded-full bg-violet-100 text-violet-700 grid place-items-center text-[10px] font-extrabold shrink-0'>{(shopOrder.assignedDeliveryBoy || data?.shopOrders?.assignedDeliveryBoy).fullName?.slice(0, 1)}</span>
              {(shopOrder.assignedDeliveryBoy || data?.shopOrders?.assignedDeliveryBoy).fullName} · {(shopOrder.assignedDeliveryBoy || data?.shopOrders?.assignedDeliveryBoy).mobile}
            </div>
          ) : <div className='text-violet-500 text-xs font-semibold animate-pulse'>Waiting for a rider to accept…</div>}
        </div>}
    </div>
  )
}

export default OwnerOrderCard
