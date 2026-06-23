import { createSlice } from "@reduxjs/toolkit";

// User-specific localStorage keys
const cartKey = (userId) => (userId ? `cart_${userId}` : "cart_guest");
const promoKey = (userId) =>
  userId ? `cartPromotion_${userId}` : "cartPromotion_guest";

// On page reload, restore cart for already-logged-in user
const getInitialState = () => {
  try {
    const user = localStorage.getItem("user");
    const userId = user ? JSON.parse(user)._id : null;
    const stored = localStorage.getItem(cartKey(userId));
    const promo = localStorage.getItem(promoKey(userId));
    return {
      userId,
      items: stored ? JSON.parse(stored) : [],
      promotion: promo ? JSON.parse(promo) : null,
    };
  } catch {
    return { userId: null, items: [], promotion: null };
  }
};

const cartSlice = createSlice({
  name: "cart",
  initialState: getInitialState(),
  reducers: {
    // Called on login/register — loads that specific user's cart
    initCart: (state, action) => {
      const userId = action.payload;
      state.userId = userId;
      const stored = localStorage.getItem(cartKey(userId));
      const promo = localStorage.getItem(promoKey(userId));
      state.items = stored ? JSON.parse(stored) : [];
      state.promotion = promo ? JSON.parse(promo) : null;
    },

    // Called on logout — clears Redux state but keeps localStorage so cart
    // is restored on next login
    resetCartState: (state) => {
      state.userId = null;
      state.items = [];
      state.promotion = null;
    },

    addToCart: (state, action) => {
      const exists = state.items.find((i) => i._id === action.payload._id);
      if (exists) {
        exists.qty += action.payload.qty || 1;
      } else {
        state.items.push({ ...action.payload, qty: action.payload.qty || 1 });
      }
      localStorage.setItem(cartKey(state.userId), JSON.stringify(state.items));
      state.promotion = null;
      localStorage.removeItem(promoKey(state.userId));
    },

    removeFromCart: (state, action) => {
      state.items = state.items.filter((i) => i._id !== action.payload);
      localStorage.setItem(cartKey(state.userId), JSON.stringify(state.items));
      state.promotion = null;
      localStorage.removeItem(promoKey(state.userId));
    },

    updateQty: (state, action) => {
      const item = state.items.find((i) => i._id === action.payload.id);
      if (item) item.qty = action.payload.qty;
      localStorage.setItem(cartKey(state.userId), JSON.stringify(state.items));
      state.promotion = null;
      localStorage.removeItem(promoKey(state.userId));
    },

    setCartPromotion: (state, action) => {
      state.promotion = action.payload;
      localStorage.setItem(
        promoKey(state.userId),
        JSON.stringify(action.payload),
      );
    },

    clearCartPromotion: (state) => {
      state.promotion = null;
      localStorage.removeItem(promoKey(state.userId));
    },

    // Full wipe — used after successful checkout
    clearCart: (state) => {
      localStorage.removeItem(cartKey(state.userId));
      localStorage.removeItem(promoKey(state.userId));
      state.items = [];
      state.promotion = null;
    },
  },
});

export const {
  initCart,
  resetCartState,
  addToCart,
  removeFromCart,
  updateQty,
  setCartPromotion,
  clearCartPromotion,
  clearCart,
} = cartSlice.actions;

export default cartSlice.reducer;
