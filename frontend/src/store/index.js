import { configureStore } from '@reduxjs/toolkit'
import userReducer from './userSlice'
import gameReducer from './gameSlice'
import cartReducer from './cartSlice'
import developerReducer from './developerSlice'

const store = configureStore({
  reducer: {
    user: userReducer,
    game: gameReducer,
    cart: cartReducer,
    developer: developerReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // 忽略一些不可序列化的值
        ignoredActions: ['user/login/fulfilled'],
        ignoredPaths: ['user.token', 'user.refreshToken'],
      },
    }),
})

export default store