import User from "./models/user.model.js"

export const socketHandler = (io) => {
  io.on('connection', (socket) => {
    console.log("Socket connected:", socket.id)
    socket.on('identity', async ({ userId }) => {
      try {
        if (!userId) return
        const uidStr = userId.toString()
        socket.userId = uidStr
        socket.join(uidStr)
        console.log(`User ${uidStr} (socket ${socket.id}) joined room ${uidStr}`)
        await User.findByIdAndUpdate(userId, {
          socketId: socket.id,
          isOnline: true
        }, { new: true })
      } catch (error) {
        console.log("identity error:", error)
      }
    })


    socket.on('updateLocation', async ({ latitude, longitude, userId }) => {
      try {
        const user = await User.findByIdAndUpdate(userId, {
          location: {
            type: 'Point',
            coordinates: [longitude, latitude]
          },
          isOnline: true,
          socketId: socket.id
        })

        if (user) {
          io.emit('updateDeliveryLocation',{
            deliveryBoyId:userId,
            latitude,
            longitude
          })
        }


      } catch (error) {
          console.log('updateDeliveryLocation error')
      }
    })




    socket.on('disconnect', async () => {
      try {
        console.log("Socket disconnected:", socket.id)
        if (socket.userId) {
          const roomSockets = await io.in(socket.userId).fetchSockets()
          if (!roomSockets || roomSockets.length === 0) {
            await User.findByIdAndUpdate(socket.userId, {
              socketId: null,
              isOnline: false
            })
          }
        } else {
          await User.findOneAndUpdate({ socketId: socket.id }, {
            socketId: null,
            isOnline: false
          })
        }
      } catch (error) {
        console.log(error)
      }

    })
  })
}