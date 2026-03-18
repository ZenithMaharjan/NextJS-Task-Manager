import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { PurchaseOrder, PurchaseStatus } from "../../types/purchase";

interface PurchaseState {
  items: PurchaseOrder[];
  filterStatus: PurchaseStatus | "All";
}

const initialState: PurchaseState = {
  items: [],
  filterStatus: "All",
};

const purchaseSlice = createSlice({
  name: "purchase",
  initialState,
  reducers: {
    setOrders: (state, action: PayloadAction<PurchaseOrder[]>) => {
      state.items = action.payload;
    },
    removeOrders: (state, action: PayloadAction<string[]>) => {
      state.items = state.items.filter(order => !action.payload.includes(order._id));
    },
    setFilterStatus: (state, action: PayloadAction<PurchaseStatus | "All">) => {
      state.filterStatus = action.payload;
    },
  },
});

export const { setOrders, removeOrders, setFilterStatus } = purchaseSlice.actions;
export default purchaseSlice.reducer;
