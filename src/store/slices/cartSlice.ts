import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/utils/api';

interface CartItem {
  id: number;
  gameId: number;
  quantity: number;
  game: {
    id: number;
    title: string;
    slug: string;
    price: number;
    currency: string;
    coverImage: string;
    developer: string;
    publisher: string;
  };
}

interface CartState {
  items: CartItem[];
  total: number;
  itemCount: number;
  loading: boolean;
  error: string | null;
}

const initialState: CartState = {
  items: [],
  total: 0,
  itemCount: 0,
  loading: false,
  error: null,
};

export const fetchCart = createAsyncThunk('cart/fetchCart', async () => {
  const response = await api.get('/cart');
  return response;
});

export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async (data: { gameId: number; quantity?: number }) => {
    const response = await api.post('/cart/add', data);
    return response;
  }
);

export const updateCartItem = createAsyncThunk(
  'cart/updateCartItem',
  async (data: { id: number; quantity: number }) => {
    const response = await api.put(`/cart/items/${data.id}`, { quantity: data.quantity });
    return response;
  }
);

export const removeFromCart = createAsyncThunk(
  'cart/removeFromCart',
  async (id: number) => {
    const response = await api.delete(`/cart/items/${id}`);
    return response;
  }
);

export const clearCart = createAsyncThunk('cart/clearCart', async () => {
  const response = await api.delete('/cart/clear');
  return response;
});

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items;
        state.total = action.payload.total;
        state.itemCount = action.payload.itemCount;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '获取购物车失败';
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.items = action.payload.items;
        state.total = action.payload.total;
        state.itemCount = action.payload.itemCount;
      })
      .addCase(updateCartItem.fulfilled, (state, action) => {
        state.items = action.payload.items;
        state.total = action.payload.total;
        state.itemCount = action.payload.itemCount;
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.items = action.payload.items;
        state.total = action.payload.total;
        state.itemCount = action.payload.itemCount;
      })
      .addCase(clearCart.fulfilled, (state, action) => {
        state.items = action.payload.items;
        state.total = action.payload.total;
        state.itemCount = action.payload.itemCount;
      });
  },
});

export const { clearError } = cartSlice.actions;
export default cartSlice.reducer;