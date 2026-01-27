import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from "redux-persist";
import storage from "redux-persist/lib/storage";
import wishlistReducer from "./slices/wishlistSlice";
import userReducer from "./slices/userSlice";
import inventoryReducer from "./slices/inventorySlice";
import notificationsReducer from "./slices/notificationsSlice";

const persistConfig = {
  key: "root",
  storage,
};

const persistedReducer = persistReducer(persistConfig, wishlistReducer);
const persistedUserReducer = persistReducer({ key: "user", storage }, userReducer);

export const store = configureStore({
  reducer: {
    wishlist: persistedReducer,
    user: persistedUserReducer,
    inventory: inventoryReducer,
    notifications: notificationsReducer,
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
