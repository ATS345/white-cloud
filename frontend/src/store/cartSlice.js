import { createSlice } from '@reduxjs/toolkit'

// 从本地存储获取初始购物车数据
const getInitialCart = () => {
  const cartStr = localStorage.getItem('cart')
  return cartStr ? JSON.parse(cartStr) : []
}

// 创建cartSlice
const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: getInitialCart(),
    totalAmount: 0,
    totalItems: 0
  },
  reducers: {
    // 添加商品到购物车
    addToCart: (state, action) => {
      const { game } = action.payload
      
      // 检查商品是否已在购物车中
      const existingItem = state.items.find(item => item.id === game.id)
      
      if (existingItem) {
        // 如果商品已存在，增加数量
        existingItem.quantity += 1
      } else {
        // 如果商品不存在，添加到购物车
        state.items.push({
          id: game.id,
          title: game.title,
          price: game.discount_price || game.price,
          originalPrice: game.price,
          image: game.main_image_url || 'https://via.placeholder.com/300x200/6366f1/ffffff?text=Game+Image',
          quantity: 1,
          isFree: game.price === 0
        })
      }
      
      // 更新购物车统计信息
      state.totalItems = state.items.reduce((total, item) => total + item.quantity, 0)
      state.totalAmount = state.items.reduce((total, item) => total + (item.price * item.quantity), 0)
      
      // 保存到本地存储
      localStorage.setItem('cart', JSON.stringify(state.items))
    },
    
    // 从购物车移除商品
    removeFromCart: (state, action) => {
      const { gameId } = action.payload
      
      // 过滤掉要移除的商品
      state.items = state.items.filter(item => item.id !== gameId)
      
      // 更新购物车统计信息
      state.totalItems = state.items.reduce((total, item) => total + item.quantity, 0)
      state.totalAmount = state.items.reduce((total, item) => total + (item.price * item.quantity), 0)
      
      // 保存到本地存储
      localStorage.setItem('cart', JSON.stringify(state.items))
    },
    
    // 更新商品数量
    updateQuantity: (state, action) => {
      const { gameId, quantity } = action.payload
      
      // 找到要更新的商品
      const item = state.items.find(item => item.id === gameId)
      
      if (item && quantity > 0) {
        // 更新数量
        item.quantity = quantity
        
        // 更新购物车统计信息
        state.totalItems = state.items.reduce((total, item) => total + item.quantity, 0)
        state.totalAmount = state.items.reduce((total, item) => total + (item.price * item.quantity), 0)
        
        // 保存到本地存储
        localStorage.setItem('cart', JSON.stringify(state.items))
      } else if (item && quantity <= 0) {
        // 如果数量小于等于0，移除商品
        state.items = state.items.filter(item => item.id !== gameId)
        
        // 更新购物车统计信息
        state.totalItems = state.items.reduce((total, item) => total + item.quantity, 0)
        state.totalAmount = state.items.reduce((total, item) => total + (item.price * item.quantity), 0)
        
        // 保存到本地存储
        localStorage.setItem('cart', JSON.stringify(state.items))
      }
    },
    
    // 清空购物车
    clearCart: (state) => {
      state.items = []
      state.totalItems = 0
      state.totalAmount = 0
      
      // 清除本地存储
      localStorage.removeItem('cart')
    },
    
    // 初始化购物车统计信息
    initializeCart: (state) => {
      state.totalItems = state.items.reduce((total, item) => total + item.quantity, 0)
      state.totalAmount = state.items.reduce((total, item) => total + (item.price * item.quantity), 0)
    }
  }
})

// 导出actions
export const { addToCart, removeFromCart, updateQuantity, clearCart, initializeCart } = cartSlice.actions

// 导出reducer
export default cartSlice.reducer