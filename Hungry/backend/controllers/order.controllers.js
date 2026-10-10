import DeliveryAssignment from "../models/deliveryAssignment.model.js"
import Order from "../models/order.model.js"
import Shop from "../models/shop.model.js"
import User from "../models/user.model.js"
import PlatformSetting from "../models/platformSetting.model.js"
import { sendDeliveryOtpMail } from "../utils/mail.js"
import RazorPay from "razorpay"
import dotenv from "dotenv"
import { count } from "console"

dotenv.config()
let instance = new RazorPay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export const placeOrder = async (req, res) => {
    try {
        const { cartItems, paymentMethod, deliveryAddress, totalAmount } = req.body
        if (cartItems.length == 0 || !cartItems) {
            return res.status(400).json({ message: "cart is empty" })
        }
        if (!deliveryAddress.text || !deliveryAddress.latitude || !deliveryAddress.longitude) {
            return res.status(400).json({ message: "send complete deliveryAddress" })
        }

        const groupItemsByShop = {}

        cartItems.forEach(item => {
            const shopId = item.shop
            if (!groupItemsByShop[shopId]) {
                groupItemsByShop[shopId] = []
            }
            groupItemsByShop[shopId].push(item)
        });

        const shopOrders = await Promise.all(Object.keys(groupItemsByShop).map(async (shopId) => {
            const shop = await Shop.findById(shopId).populate("owner")
            if (!shop) {
                return res.status(400).json({ message: "shop not found" })
            }
            const items = groupItemsByShop[shopId]
            const subtotal = items.reduce((sum, i) => sum + Number(i.price) * Number(i.quantity), 0)
            return {
                shop: shop._id,
                owner: shop.owner._id,
                subtotal,
                shopOrderItems: items.map((i) => ({
                    item: i.id,
                    price: i.price,
                    quantity: i.quantity,
                    name: i.name
                }))
            }
        }
        ))

        if (paymentMethod == "online") {
            const razorOrder = await instance.orders.create({
                amount: Math.round(totalAmount * 100),
                currency: 'INR',
                receipt: `receipt_${Date.now()}`
            })
            const newOrder = await Order.create({
                user: req.userId,
                paymentMethod,
                deliveryAddress,
                totalAmount,
                shopOrders,
                razorpayOrderId: razorOrder.id,
                payment: false
            })

            return res.status(200).json({
                razorOrder,
                orderId: newOrder._id,
            })

        }

        const newOrder = await Order.create({
            user: req.userId,
            paymentMethod,
            deliveryAddress,
            totalAmount,
            shopOrders
        })

        await newOrder.populate("shopOrders.shopOrderItems.item", "name image price")
        await newOrder.populate("shopOrders.shop", "name image")
        await newOrder.populate("shopOrders.owner", "fullName email mobile socketId")
        await newOrder.populate("user", "fullName email mobile socketId")

        const io = req.app.get('io')

        if (io) {
            newOrder.shopOrders.forEach(shopOrder => {
                const ownerSocketId = shopOrder.owner?.socketId
                const ownerId = shopOrder.owner?._id ? shopOrder.owner._id.toString() : shopOrder.owner?.toString()
                const payload = {
                    _id: newOrder._id,
                    paymentMethod: newOrder.paymentMethod,
                    user: newOrder.user,
                    shopOrders: shopOrder,
                    createdAt: newOrder.createdAt,
                    deliveryAddress: newOrder.deliveryAddress,
                    payment: newOrder.payment
                }
                console.log(`Emitting newOrder to owner room: ${ownerId}, socketId: ${ownerSocketId}`)
                if (ownerId) io.to(ownerId).emit('newOrder', payload)
                if (ownerSocketId && ownerSocketId !== ownerId) io.to(ownerSocketId).emit('newOrder', payload)
            });
        }



        return res.status(201).json(newOrder)
    } catch (error) {
        return res.status(500).json({ message: `place order error ${error}` })
    }
}

export const verifyPayment = async (req, res) => {
    try {
        const { razorpay_payment_id, orderId } = req.body
        const payment = await instance.payments.fetch(razorpay_payment_id)
        if (!payment || payment.status != "captured") {
            return res.status(400).json({ message: "payment not captured" })
        }
        const order = await Order.findById(orderId)
        if (!order) {
            return res.status(400).json({ message: "order not found" })
        }

        order.payment = true
        order.razorpayPaymentId = razorpay_payment_id
        await order.save()

        await order.populate("shopOrders.shopOrderItems.item", "name image price")
        await order.populate("shopOrders.shop", "name image")
        await order.populate("shopOrders.owner", "fullName email mobile socketId")
        await order.populate("user", "fullName email mobile socketId")

        const io = req.app.get('io')

        if (io) {
            order.shopOrders.forEach(shopOrder => {
                const ownerSocketId = shopOrder.owner?.socketId
                const ownerId = shopOrder.owner?._id ? shopOrder.owner._id.toString() : shopOrder.owner?.toString()
                const payload = {
                    _id: order._id,
                    paymentMethod: order.paymentMethod,
                    user: order.user,
                    shopOrders: shopOrder,
                    createdAt: order.createdAt,
                    deliveryAddress: order.deliveryAddress,
                    payment: order.payment
                }
                console.log(`Emitting verified newOrder to owner room: ${ownerId}, socketId: ${ownerSocketId}`)
                if (ownerId) io.to(ownerId).emit('newOrder', payload)
                if (ownerSocketId && ownerSocketId !== ownerId) io.to(ownerSocketId).emit('newOrder', payload)
            });
        }


        return res.status(200).json(order)

    } catch (error) {
        return res.status(500).json({ message: `verify payment  error ${error}` })
    }
}



export const getMyOrders = async (req, res) => {
    try {
        const user = await User.findById(req.userId)
        if (user.role == "user") {
            const orders = await Order.find({ user: req.userId })
                .sort({ createdAt: -1 })
                .populate("shopOrders.shop", "name image")
                .populate("shopOrders.owner", "fullName email mobile")
                .populate("shopOrders.shopOrderItems.item", "name image price")

            return res.status(200).json(orders)
        } else if (user.role == "owner") {
            const orders = await Order.find({ "shopOrders.owner": req.userId })
                .sort({ createdAt: -1 })
                .populate("shopOrders.shop", "name image")
                .populate("shopOrders.owner", "fullName email mobile socketId")
                .populate("user", "fullName email mobile")
                .populate("shopOrders.shopOrderItems.item", "name image price")
                .populate("shopOrders.assignedDeliveryBoy", "fullName mobile")

            const filteredOrders = orders.map((order => {
                const ownerShopOrder = order.shopOrders.find(o => {
                    const oOwnerId = o.owner?._id ? o.owner._id.toString() : o.owner?.toString()
                    return oOwnerId === req.userId.toString()
                })
                return {
                    _id: order._id,
                    paymentMethod: order.paymentMethod,
                    user: order.user,
                    shopOrders: ownerShopOrder,
                    createdAt: order.createdAt,
                    deliveryAddress: order.deliveryAddress,
                    payment: order.payment
                }
            })).filter(order => Boolean(order.shopOrders))

            return res.status(200).json(filteredOrders)
        }

    } catch (error) {
        return res.status(500).json({ message: `get User order error ${error}` })
    }
}


export const updateOrderStatus = async (req, res) => {
    try {
        const { orderId, shopId } = req.params
        const { status } = req.body
        const order = await Order.findById(orderId)

        if (!order) {
            return res.status(400).json({ message: "Order not found" })
        }

        const shopOrder = order.shopOrders.find(o => String(o.shop) === String(shopId))
        if (!shopOrder) {
            return res.status(400).json({ message: "shop order not found" })
        }
        shopOrder.status = status
        let deliveryBoysPayload = []

        if (status == "out of delivery") {
            const { longitude, latitude } = order.deliveryAddress || {}
            const platformSetting = await PlatformSetting.findOne()
            const maxDistanceMeters = (platformSetting?.deliveryRadiusKm || 5) * 1000

            let nearByDeliveryBoys = []
            if (longitude && latitude && !isNaN(Number(longitude)) && !isNaN(Number(latitude))) {
                try {
                    nearByDeliveryBoys = await User.find({
                        role: "deliveryBoy",
                        approvalStatus: { $ne: "rejected" },
                        accountStatus: { $ne: "suspended" },
                        location: {
                            $near: {
                                $geometry: { type: "Point", coordinates: [Number(longitude), Number(latitude)] },
                                $maxDistance: maxDistanceMeters
                            }
                        }
                    })
                } catch (geoErr) {
                    console.log("Geospatial rider query error:", geoErr.message)
                }
            }

            // Fallback: If no rider is within the distance radius (e.g. testing or GPS not set), find all active riders
            if (!nearByDeliveryBoys || nearByDeliveryBoys.length === 0) {
                nearByDeliveryBoys = await User.find({
                    role: "deliveryBoy",
                    approvalStatus: { $ne: "rejected" },
                    accountStatus: { $ne: "suspended" }
                })
            }

            const nearByIds = nearByDeliveryBoys.map(b => b._id)
            const busyIds = await DeliveryAssignment.find({
                assignedTo: { $in: nearByIds },
                status: { $nin: ["brodcasted", "completed"] }
            }).distinct("assignedTo")

            const busyIdSet = new Set(busyIds.map(id => String(id)))
            const availableBoys = nearByDeliveryBoys.filter(b => !busyIdSet.has(String(b._id)))
            const candidates = availableBoys.map(b => b._id)

            if (candidates.length == 0) {
                await order.save()
                return res.json({
                    message: "order status updated but there is no available delivery boys",
                    availableBoys: []
                })
            }

            let existingAssignment = await DeliveryAssignment.findOne({
                order: order._id,
                shopOrderId: shopOrder._id,
                status: { $in: ["brodcasted", "assigned"] }
            })

            let deliveryAssignment = existingAssignment
            if (!deliveryAssignment) {
                deliveryAssignment = await DeliveryAssignment.create({
                    order: order?._id,
                    shop: shopOrder.shop,
                    shopOrderId: shopOrder?._id,
                    brodcastedTo: candidates,
                    assignedTo: null,
                    status: "brodcasted"
                })
            } else if (deliveryAssignment.status === "brodcasted") {
                deliveryAssignment.brodcastedTo = candidates
                await deliveryAssignment.save()
            }

            shopOrder.assignedDeliveryBoy = deliveryAssignment.assignedTo || null
            shopOrder.assignment = deliveryAssignment._id
            deliveryBoysPayload = availableBoys.map(b => ({
                id: b._id,
                fullName: b.fullName,
                longitude: b.location?.coordinates?.[0],
                latitude: b.location?.coordinates?.[1],
                mobile: b.mobile
            }))

            await deliveryAssignment.populate('order')
            await deliveryAssignment.populate('shop')
            const io = req.app.get('io')
            if (io) {
                const targetShopOrder = deliveryAssignment.order?.shopOrders?.find(so => String(so._id) === String(deliveryAssignment.shopOrderId)) || shopOrder
                availableBoys.forEach(boy => {
                    const boyId = boy._id ? boy._id.toString() : boy.toString()
                    const payload = {
                        sentTo: boyId,
                        assignmentId: deliveryAssignment._id,
                        orderId: deliveryAssignment.order?._id || order._id,
                        shopName: deliveryAssignment.shop?.name || "Restaurant",
                        deliveryAddress: deliveryAssignment.order?.deliveryAddress || order.deliveryAddress,
                        items: targetShopOrder?.shopOrderItems || [],
                        subtotal: targetShopOrder?.subtotal || 0
                    }
                    console.log(`[Order] Emitting newAssignment broadcast for order ${order._id} to rider room ${boyId} (${boy.fullName})`)
                    if (boyId) {
                        io.to(boyId).emit('newAssignment', payload)
                    }
                    if (boy.socketId) {
                        io.to(boy.socketId).emit('newAssignment', payload)
                    }
                });

                // Global broadcast fallback for delivery boys
                io.emit('newAssignmentBroadcast', {
                    assignmentId: deliveryAssignment._id,
                    orderId: order._id
                })
            }

        }

        await order.save()
        const updatedShopOrder = order.shopOrders.find(o => String(o.shop) === String(shopId))
        await order.populate("shopOrders.shop", "name")
        await order.populate("shopOrders.assignedDeliveryBoy", "fullName email mobile location socketId")
        await order.populate("user", "fullName email mobile socketId")

        const io = req.app.get('io')
        if (io) {
            const userSocketId = order.user?.socketId
            const userId = order.user?._id ? order.user._id.toString() : order.user?.toString()
            const payload = {
                orderId: order._id,
                shopId: updatedShopOrder.shop?._id || updatedShopOrder.shop,
                status: updatedShopOrder.status,
                assignedDeliveryBoy: updatedShopOrder.assignedDeliveryBoy,
                userId: userId
            }
            if (userId) io.to(userId).emit('update-status', payload)
            if (userSocketId && userSocketId !== userId) io.to(userSocketId).emit('update-status', payload)
            io.emit('update-status', payload)

            const ownerId = updatedShopOrder.owner?._id ? updatedShopOrder.owner._id.toString() : updatedShopOrder.owner?.toString()
            if (ownerId) io.to(ownerId).emit('update-status', payload)
        }

        return res.status(200).json({
            shopOrder: updatedShopOrder,
            assignedDeliveryBoy: updatedShopOrder?.assignedDeliveryBoy,
            availableBoys: deliveryBoysPayload,
            assignment: updatedShopOrder?.assignment?._id

        })



    } catch (error) {
        return res.status(500).json({ message: `order status error ${error}` })
    }
}


export const getDeliveryBoyAssignment = async (req, res) => {
    try {
        const deliveryBoyId = req.userId
        const assignments = await DeliveryAssignment.find({
            brodcastedTo: deliveryBoyId,
            status: "brodcasted"
        })
            .populate("order")
            .populate("shop")

        const formated = assignments.filter(a => Boolean(a.order)).map(a => {
            const targetShopOrder = a.order?.shopOrders?.find(so => String(so._id) === String(a.shopOrderId))
            return {
                assignmentId: a._id,
                orderId: a.order?._id,
                shopName: a.shop?.name || "Restaurant",
                deliveryAddress: a.order?.deliveryAddress,
                items: targetShopOrder?.shopOrderItems || [],
                subtotal: targetShopOrder?.subtotal || 0
            }
        })

        return res.status(200).json(formated)
    } catch (error) {
        return res.status(500).json({ message: `get Assignment error ${error}` })
    }
}


export const acceptOrder = async (req, res) => {
    try {
        const { assignmentId } = req.params
        const assignment = await DeliveryAssignment.findById(assignmentId)
        if (!assignment) {
            return res.status(400).json({ message: "assignment not found" })
        }
        if (assignment.status !== "brodcasted") {
            return res.status(400).json({ message: "assignment is expired" })
        }

        const alreadyAssigned = await DeliveryAssignment.findOne({
            assignedTo: req.userId,
            status: { $nin: ["brodcasted", "completed"] }
        })

        if (alreadyAssigned) {
            return res.status(400).json({ message: "You are already assigned to another order" })
        }

        assignment.assignedTo = req.userId
        assignment.status = 'assigned'
        assignment.acceptedAt = new Date()
        await assignment.save()

        const order = await Order.findById(assignment.order)
        if (!order) {
            return res.status(400).json({ message: "order not found" })
        }

        let shopOrder = order.shopOrders.id(assignment.shopOrderId)
        shopOrder.assignedDeliveryBoy = req.userId
        await order.save()

        const io = req.app.get('io')
        if (io) {
            await order.populate("shopOrders.shop", "name image")
            await order.populate("shopOrders.assignedDeliveryBoy", "fullName email mobile location socketId")
            await order.populate("user", "fullName email mobile socketId")
            const userId = order.user?._id ? order.user._id.toString() : order.user?.toString()
            const userSocketId = order.user?.socketId
            const updatedShopOrder = order.shopOrders.id(assignment.shopOrderId)
            const payload = {
                orderId: order._id,
                shopId: updatedShopOrder.shop?._id || updatedShopOrder.shop,
                status: updatedShopOrder.status,
                assignedDeliveryBoy: updatedShopOrder.assignedDeliveryBoy,
                userId: userId
            }
            if (userId) io.to(userId).emit('update-status', payload)
            if (userSocketId && userSocketId !== userId) io.to(userSocketId).emit('update-status', payload)
            io.emit('update-status', payload)

            const ownerId = updatedShopOrder.owner?._id ? updatedShopOrder.owner._id.toString() : updatedShopOrder.owner?.toString()
            if (ownerId) io.to(ownerId).emit('update-status', payload)
        }

        return res.status(200).json({
            message: 'order accepted'
        })
    } catch (error) {
        return res.status(500).json({ message: `accept order error ${error}` })
    }
}



export const getCurrentOrder = async (req, res) => {
    try {
        const assignment = await DeliveryAssignment.findOne({
            assignedTo: req.userId,
            status: "assigned"
        })
            .populate("shop", "name")
            .populate("assignedTo", "fullName email mobile location")
            .populate({
                path: "order",
                populate: [
                    { path: "user", select: "fullName email location mobile" },
                    { path: "shopOrders.shop", select: "name image" },
                    { path: "shopOrders.shopOrderItems.item", select: "name image price" }
                ]
            })

        if (!assignment) {
            return res.status(400).json({ message: "assignment not found" })
        }
        if (!assignment.order) {
            return res.status(400).json({ message: "order not found" })
        }

        const shopOrder = assignment.order.shopOrders.find(so => String(so._id) == String(assignment.shopOrderId))

        if (!shopOrder) {
            return res.status(400).json({ message: "shopOrder not found" })
        }

        let deliveryBoyLocation = { lat: null, lon: null }
        if (assignment.assignedTo?.location?.coordinates?.length === 2) {
            deliveryBoyLocation.lat = assignment.assignedTo.location.coordinates[1]
            deliveryBoyLocation.lon = assignment.assignedTo.location.coordinates[0]
        }

        let customerLocation = { lat: null, lon: null }
        if (assignment.order.deliveryAddress) {
            customerLocation.lat = assignment.order.deliveryAddress.latitude
            customerLocation.lon = assignment.order.deliveryAddress.longitude
        }

        return res.status(200).json({
            _id: assignment.order._id,
            user: assignment.order.user,
            shopOrder,
            deliveryAddress: assignment.order.deliveryAddress,
            deliveryBoyLocation,
            customerLocation
        })

    } catch (error) {
        console.error("getCurrentOrder error:", error)
        return res.status(500).json({ message: `get current order error: ${error.message}` })
    }
}

export const getOrderById = async (req, res) => {
    try {
        const { orderId } = req.params
        const order = await Order.findById(orderId)
            .populate("user")
            .populate({
                path: "shopOrders.shop",
                model: "Shop"
            })
            .populate({
                path: "shopOrders.assignedDeliveryBoy",
                model: "User"
            })
            .populate({
                path: "shopOrders.shopOrderItems.item",
                model: "Item"
            })
            .lean()

        if (!order) {
            return res.status(400).json({ message: "order not found" })
        }
        return res.status(200).json(order)
    } catch (error) {
        return res.status(500).json({ message: `get by id order error ${error}` })
    }
}

export const sendDeliveryOtp = async (req, res) => {
    try {
        const { orderId, shopOrderId } = req.body
        const order = await Order.findById(orderId).populate("user")
        const shopOrder = order.shopOrders.id(shopOrderId)
        if (!order || !shopOrder) {
            return res.status(400).json({ message: "enter valid order/shopOrderid" })
        }
        const otp = Math.floor(1000 + Math.random() * 9000).toString()
        shopOrder.deliveryOtp = otp
        shopOrder.otpExpires = Date.now() + 5 * 60 * 1000
        await order.save()

        try {
            await sendDeliveryOtpMail(order.user, otp)
        } catch (mailErr) {
            console.log("Error sending delivery OTP email:", mailErr.message)
        }

        const io = req.app.get('io')
        if (io) {
            const userId = order.user?._id ? order.user._id.toString() : order.user?.toString()
            const userSocketId = order.user?.socketId
            const otpPayload = {
                orderId: order._id,
                shopOrderId: shopOrder._id,
                otp: otp,
                expiresIn: 300,
                message: "Share this OTP with your delivery partner to receive your order."
            }
            console.log(`[OTP] Emitting real-time deliveryOtp to user ${userId}:`, otp)
            if (userId) io.to(userId).emit('deliveryOtp', otpPayload)
            if (userSocketId && userSocketId !== userId) io.to(userSocketId).emit('deliveryOtp', otpPayload)
            io.emit('deliveryOtp', otpPayload)
        }

        return res.status(200).json({ message: `Otp sent successfully to ${order?.user?.fullName}`, otp })
    } catch (error) {
        return res.status(500).json({ message: `delivery otp error ${error}` })
    }
}

export const verifyDeliveryOtp = async (req, res) => {
    try {
        const { orderId, shopOrderId, otp } = req.body
        if (!orderId || !shopOrderId || !otp) {
            return res.status(400).json({ message: "Please provide orderId, shopOrderId, and OTP" })
        }
        const order = await Order.findById(orderId).populate("user")
        if (!order) {
            return res.status(400).json({ message: "Order not found" })
        }
        const shopOrder = order.shopOrders.id(shopOrderId) || order.shopOrders.find(so => String(so._id) === String(shopOrderId))
        if (!shopOrder) {
            return res.status(400).json({ message: "Shop order not found" })
        }

        const currentOtp = shopOrder.deliveryOtp ? String(shopOrder.deliveryOtp).trim() : null
        const enteredOtp = String(otp).trim()
        const isExpired = !shopOrder.otpExpires || new Date(shopOrder.otpExpires).getTime() < Date.now()

        if (!currentOtp || currentOtp !== enteredOtp || isExpired) {
            return res.status(400).json({ message: "Invalid or expired OTP. Please verify with customer." })
        }

        shopOrder.status = "delivered"
        shopOrder.deliveredAt = Date.now()
        shopOrder.deliveryOtp = null
        await order.save()

        // Clean up assignment and mark completed
        await DeliveryAssignment.updateMany(
            { $or: [{ shopOrderId: shopOrder._id }, { order: order._id, assignedTo: req.userId }] },
            { status: "completed" }
        )
        await DeliveryAssignment.deleteMany({
            $or: [
                { shopOrderId: shopOrder._id },
                { order: order._id, assignedTo: req.userId }
            ]
        })

        const io = req.app.get('io')
        if (io) {
            const userId = order.user?._id ? order.user._id.toString() : order.user?.toString()
            const userSocketId = order.user?.socketId
            const payload = {
                orderId: order._id,
                shopOrderId: shopOrder._id,
                shopId: shopOrder.shop,
                status: "delivered",
                userId: userId
            }
            console.log(`[Order] Emitting delivered status for order ${order._id}`)
            if (userId) io.to(userId).emit('update-status', payload)
            if (userSocketId && userSocketId !== userId) io.to(userSocketId).emit('update-status', payload)
            io.emit('update-status', payload)

            const ownerId = shopOrder.owner?._id ? shopOrder.owner._id.toString() : shopOrder.owner?.toString()
            if (ownerId) io.to(ownerId).emit('update-status', payload)
        }

        return res.status(200).json({ message: "Order Delivered Successfully!" })

    } catch (error) {
        console.error("verify delivery otp error:", error)
        return res.status(500).json({ message: `verify delivery otp error ${error.message}` })
    }
}

export const getTodayDeliveries=async (req,res) => {
    try {
        const deliveryBoyId=req.userId
        const startsOfDay=new Date()
        startsOfDay.setHours(0,0,0,0)

        const orders=await Order.find({
           "shopOrders.assignedDeliveryBoy":deliveryBoyId,
           "shopOrders.status":"delivered",
           "shopOrders.deliveredAt":{$gte:startsOfDay}
        }).lean()

     let todaysDeliveries=[] 
     
     orders.forEach(order=>{
        order.shopOrders.forEach(shopOrder=>{
            if(shopOrder.assignedDeliveryBoy==deliveryBoyId &&
                shopOrder.status=="delivered" &&
                shopOrder.deliveredAt &&
                shopOrder.deliveredAt>=startsOfDay
            ){
                todaysDeliveries.push(shopOrder)
            }
        })
     })

let stats={}

todaysDeliveries.forEach(shopOrder=>{
    const hour=new Date(shopOrder.deliveredAt).getHours()
    stats[hour]=(stats[hour] || 0) + 1
})

let formattedStats=Object.keys(stats).map(hour=>({
 hour:parseInt(hour),
 count:stats[hour]   
}))

formattedStats.sort((a,b)=>a.hour-b.hour)

return res.status(200).json(formattedStats)
  

    } catch (error) {
        return res.status(500).json({ message: `today deliveries error ${error}` }) 
    }
}



