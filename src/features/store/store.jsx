import { configureStore } from "@reduxjs/toolkit";
import chefBookingReducer from "../slices/chefbookingSlice"
import { apiSlice } from "../api/apiSlice";
import userReducer from "../slices/userSlice"

export const store = configureStore({
    reducer: {
        chefBooking: chefBookingReducer,
        user: userReducer, 
        [apiSlice.reducerPath]: apiSlice.reducer,
    },
    middleware: getDefaultMiddleware =>
        getDefaultMiddleware({
            immutableCheck: false,  // Disable immutable state check
            serializableCheck: false,  // Disable the serializable state check middleware
        }).concat(apiSlice.middleware),
      devTools: true,
});