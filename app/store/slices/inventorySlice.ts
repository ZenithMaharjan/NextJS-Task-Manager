import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { Inventory } from "../../types/inventory";

interface InventoryState {
  tempEdits: Record<string, Partial<Inventory>>;
  tempDeletes: Record<string, boolean>;
}

const initialState: InventoryState = {
  tempEdits: {},
  tempDeletes: {},
};

const inventorySlice = createSlice({
  name: "inventory",
  initialState,
  reducers: {
    setTempEdit: (state, action: PayloadAction<{ id: string; data: Partial<Inventory> }>) => {
      const { id, data } = action.payload;
      state.tempEdits[id] = {
        ...state.tempEdits[id],
        ...data,
      };
    },
    clearTempEdit: (state, action: PayloadAction<string>) => {
      delete state.tempEdits[action.payload];
    },
    setTempDelete: (state, action: PayloadAction<string>) => {
      state.tempDeletes[action.payload] = true;
    },
    clearTempDelete: (state, action: PayloadAction<string>) => {
      delete state.tempDeletes[action.payload];
    },
    resetInventoryState: state => {
      state.tempEdits = {};
      state.tempDeletes = {};
    },
  },
});

export const { setTempEdit, clearTempEdit, setTempDelete, clearTempDelete, resetInventoryState } =
  inventorySlice.actions;
export default inventorySlice.reducer;
