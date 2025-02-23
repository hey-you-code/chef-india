import { apiSlice } from "../api/apiSlice";



const BASE_URL =  "http://10.0.2.2:9101/api/v1/booking";

export const chefBookingApiSlice = apiSlice.injectEndpoints({
    endpoints: builder => ({
        bookChef: builder.mutation({
            query: (payload) => ({
                url: `${BASE_URL}`,
                method: "POST",
                body: payload,
                headers: {
                  "Content-Type": "application/json",
                },
              }), 
        })
    })
})

export const {useBookChefMutation} = chefBookingApiSlice
