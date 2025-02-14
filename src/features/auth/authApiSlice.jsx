import { apiSlice } from "../api/apiSlice";

// const BASE_URL =
//   "http://10.0.2.2:9100/api/v1/auth/user";
const BASE_URL = 'https://auth.cheffindia.com/api/v1/auth/user';

export const authApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    sendOtp: builder.mutation({
      query: ({ phoneNumber }) => ({
        url: `${BASE_URL}/otp`,
        method: "POST",
        body: { phoneNumber },
        headers: {
          "Content-Type": "application/json",
        },
      }),
    }),
    verifyOtp: builder.mutation({
      query: ({ phoneNumber, otp, type }) => ({
        url: `${BASE_URL}/verifyOtp`,
        method: "POST",
        body: { phoneNumber, otp },
        headers: {
          "Content-Type": "application/json",
        },
      }),
    }),
    register: builder.mutation({
      query: ({ phoneNumber, name }) => ({
        url: `${BASE_URL}/register`,
        method: "POST",
        body: { phoneNumber, name },
        headers: {
          "Content-Type": "application/json",
        },
      }),
    }),
    refreshAccessToken: builder.mutation({
      query: () => ({
        url: `${BASE_URL}/refresh`,
        method: "POST",
      }),
    }),
    logout: builder.mutation({
      query: () => ({
        url: `${BASE_URL}/logout`,
        method: "POST",
      }),
    }),

    storeFcmToken: builder.mutation({
      query: ({ fcmToken }) => ({
        url: `${BASE_URL}/fcmToken`,
        method: "POST",
        body: { fcmToken },
        headers: {
          "Content-Type": "application/json",
        },
      }),
    }),
  }),
});

export const {
  useSendOtpMutation,
  useVerifyOtpMutation,
  useRegisterMutation,
  useRefreshAccessTokenMutation,
  useLogoutMutation,
  useStoreFcmTokenMutation,
} = authApiSlice;
