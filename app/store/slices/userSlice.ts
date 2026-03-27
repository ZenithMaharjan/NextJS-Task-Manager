import { createSlice } from "@reduxjs/toolkit";

export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  fullName: string | null;
  isAdmin: boolean;
}

interface UserState {
  currentUser: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
}

const initialState: UserState = {
  currentUser: null,
  accessToken: null,
  isAuthenticated: false,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action) => {
      const { user, token } = action.payload;
      state.currentUser = user;
      state.accessToken = token || state.accessToken;
      state.isAuthenticated = !!state.accessToken;
    },
    logout: state => {
      state.currentUser = null;
      state.accessToken = null;
      state.isAuthenticated = false;
    },
  },
});

export const { setUser, logout } = userSlice.actions;
export default userSlice.reducer;
