import cartReducer, { fetchCart, addToCart, updateCartItem, removeFromCart, clearCart, clearError } from '../store/slices/cartSlice';

describe('cartSlice', () => {
  let initialState: ReturnType<typeof cartReducer>;

  beforeEach(() => {
    initialState = {
      items: [],
      total: 0,
      itemCount: 0,
      loading: false,
      error: null,
    };
  });

  const mockCartItem = {
    id: 1,
    gameId: 1,
    quantity: 1,
    game: {
      id: 1,
      title: 'Test Game',
      slug: 'test-game',
      price: 99.99,
      currency: 'CNY',
      coverImage: 'https://example.com/cover.jpg',
      developer: 'Test Developer',
      publisher: 'Test Publisher',
    },
  };

  const mockCartResponse = {
    items: [mockCartItem],
    total: 99.99,
    itemCount: 1,
  };

  describe('reducers', () => {
    it('should return the initial state', () => {
      expect(cartReducer(undefined, { type: 'unknown' })).toEqual(initialState);
    });

    it('should handle clearError', () => {
      const stateWithError = { ...initialState, error: 'Some error' };
      const newState = cartReducer(stateWithError, clearError());
      expect(newState.error).toBeNull();
    });
  });

  describe('async actions', () => {
    it('should handle fetchCart.pending', () => {
      const action = { type: fetchCart.pending.type };
      const newState = cartReducer(initialState, action);
      expect(newState.loading).toBe(true);
      expect(newState.error).toBeNull();
    });

    it('should handle fetchCart.fulfilled', () => {
      const action = {
        type: fetchCart.fulfilled.type,
        payload: mockCartResponse,
      };
      const newState = cartReducer(initialState, action);
      expect(newState.loading).toBe(false);
      expect(newState.items).toEqual(mockCartResponse.items);
      expect(newState.total).toBe(99.99);
      expect(newState.itemCount).toBe(1);
    });

    it('should handle fetchCart.rejected', () => {
      const action = {
        type: fetchCart.rejected.type,
        error: { message: '获取购物车失败' },
      };
      const newState = cartReducer(initialState, action);
      expect(newState.loading).toBe(false);
      expect(newState.error).toBe('获取购物车失败');
    });

    it('should handle addToCart.fulfilled', () => {
      const action = {
        type: addToCart.fulfilled.type,
        payload: mockCartResponse,
      };
      const newState = cartReducer(initialState, action);
      expect(newState.items).toEqual(mockCartResponse.items);
      expect(newState.total).toBe(99.99);
      expect(newState.itemCount).toBe(1);
    });

    it('should handle updateCartItem.fulfilled', () => {
      const updatedResponse = {
        ...mockCartResponse,
        items: [{ ...mockCartItem, quantity: 2 }],
        total: 199.98,
      };
      const action = {
        type: updateCartItem.fulfilled.type,
        payload: updatedResponse,
      };
      const newState = cartReducer(initialState, action);
      expect(newState.items[0].quantity).toBe(2);
      expect(newState.total).toBe(199.98);
    });

    it('should handle removeFromCart.fulfilled', () => {
      const emptyCart = {
        items: [],
        total: 0,
        itemCount: 0,
      };
      const action = {
        type: removeFromCart.fulfilled.type,
        payload: emptyCart,
      };
      const stateWithItem = {
        ...initialState,
        items: [mockCartItem],
        total: 99.99,
        itemCount: 1,
      };
      const newState = cartReducer(stateWithItem, action);
      expect(newState.items).toHaveLength(0);
      expect(newState.total).toBe(0);
    });

    it('should handle clearCart.fulfilled', () => {
      const emptyCart = {
        items: [],
        total: 0,
        itemCount: 0,
      };
      const action = {
        type: clearCart.fulfilled.type,
        payload: emptyCart,
      };
      const stateWithItems = {
        ...initialState,
        items: [mockCartItem],
        total: 99.99,
        itemCount: 1,
      };
      const newState = cartReducer(stateWithItems, action);
      expect(newState.items).toHaveLength(0);
      expect(newState.total).toBe(0);
      expect(newState.itemCount).toBe(0);
    });
  });
});
