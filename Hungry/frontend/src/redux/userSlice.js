import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
  name: "user",
  initialState: {
    userData: null,
    currentCity: null,
    currentState: null,
    currentAddress: null,
    shopInMyCity: null,
    itemsInMyCity: null,
    cartItems: [],
    totalAmount: 0,
    myOrders: [],
    searchItems: null,
    socket: null,
    recommendedItems: null
  },
  reducers: {
    setUserData: (state, action) => {
      state.userData = action.payload
    },
    setCurrentCity: (state, action) => {
      state.currentCity = action.payload
    },
    setCurrentState: (state, action) => {
      state.currentState = action.payload
    },
    setCurrentAddress: (state, action) => {
      state.currentAddress = action.payload
    },
    setShopsInMyCity: (state, action) => {
      state.shopInMyCity = action.payload
    },
    setItemsInMyCity: (state, action) => {
      state.itemsInMyCity = action.payload
    },
    setSocket: (state, action) => {
      state.socket = action.payload
    },
    addToCart: (state, action) => {
      const cartItem = action.payload
      const existingItem = state.cartItems.find(i => i.id == cartItem.id)
      if (existingItem) {
        existingItem.quantity += cartItem.quantity
      } else {
        state.cartItems.push(cartItem)
      }

      state.totalAmount = state.cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0)

    },

    setTotalAmount: (state, action) => {
      state.totalAmount = action.payload
    }

    ,

    updateQuantity: (state, action) => {
      const { id, quantity } = action.payload
      const item = state.cartItems.find(i => i.id == id)
      if (item) {
        item.quantity = quantity
      }
      state.totalAmount = state.cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0)
    },

    removeCartItem: (state, action) => {
      state.cartItems = state.cartItems.filter(i => i.id !== action.payload)
      state.totalAmount = state.cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0)
    },

    clearCart: (state) => {
      state.cartItems = []
      state.totalAmount = 0
    },

    setMyOrders: (state, action) => {
      state.myOrders = action.payload || []
    },
    addMyOrder: (state, action) => {
      if (!action.payload) return
      if (!Array.isArray(state.myOrders)) {
        state.myOrders = []
      }
      const newOrderId = String(action.payload._id)
      const existingIndex = state.myOrders.findIndex(o => String(o._id) === newOrderId)
      if (existingIndex !== -1) {
        state.myOrders[existingIndex] = { ...state.myOrders[existingIndex], ...action.payload }
      } else {
        state.myOrders = [action.payload, ...state.myOrders]
      }
    },

    updateOrderStatus: (state, action) => {
      const { orderId, shopId, status, shopOrderId } = action.payload
      const order = state.myOrders?.find(o => String(o._id) === String(orderId))
      if (!order) return

      if (Array.isArray(order.shopOrders)) {
        let shopOrder = null
        if (shopOrderId) {
          shopOrder = order.shopOrders.find(so => String(so._id) === String(shopOrderId))
        }
        if (!shopOrder && shopId) {
          shopOrder = order.shopOrders.find(so => String(so.shop?._id || so.shop) === String(shopId))
        }
        if (!shopOrder && order.shopOrders.length === 1) {
          shopOrder = order.shopOrders[0]
        }
        if (shopOrder) {
          shopOrder.status = status
        }
      } else if (order.shopOrders) {
        order.shopOrders.status = status
      }
    },

    updateRealtimeOrderStatus: (state, action) => {
      const { orderId, shopId, status, shopOrderId } = action.payload
      const order = state.myOrders?.find(o => String(o._id) === String(orderId))
      if (!order) return

      if (Array.isArray(order.shopOrders)) {
        let shopOrder = null
        if (shopOrderId) {
          shopOrder = order.shopOrders.find(so => String(so._id) === String(shopOrderId))
        }
        if (!shopOrder && shopId) {
          shopOrder = order.shopOrders.find(so => String(so.shop?._id || so.shop) === String(shopId))
        }
        if (!shopOrder && order.shopOrders.length === 1) {
          shopOrder = order.shopOrders[0]
        }
        if (shopOrder) {
          shopOrder.status = status
        }
      } else if (order.shopOrders) {
        order.shopOrders.status = status
      }
    },

    setSearchItems: (state, action) => {
      state.searchItems = action.payload
    },
    setRecommendedItems: (state, action) => {
      state.recommendedItems = action.payload
    }
  }
})

export const { setUserData, setCurrentAddress, setCurrentCity, setCurrentState, setShopsInMyCity, setItemsInMyCity, addToCart, updateQuantity, removeCartItem, clearCart, setMyOrders, addMyOrder, updateOrderStatus, setSearchItems, setTotalAmount, setSocket ,updateRealtimeOrderStatus, setRecommendedItems } = userSlice.actions
export default userSlice.reducer