import { createSlice } from "@reduxjs/toolkit";

import { Inventory } from "@/types/inventory";

interface WishlistState {
  items: Inventory[];
}

const initialState: WishlistState = {
  items: [],
};

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    addToWishlist: (state, action: { payload: Inventory }) => {
      const exists = state.items.find(item => item.id === action.payload.id);
      if (!exists) {
        state.items.push(action.payload);
      }
    },
    removeFromWishlist: (state, action: { payload: string }) => {
      state.items = state.items.filter(item => item.id !== action.payload);
    },
    setWishlist: (state, action: { payload: Inventory[] }) => {
      state.items = action.payload;
    },
    clearWishlist: state => {
      state.items = [];
    },
  },
});

export const { addToWishlist, removeFromWishlist, setWishlist, clearWishlist } =
  wishlistSlice.actions;

export default wishlistSlice.reducer;
