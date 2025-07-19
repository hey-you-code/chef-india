import {apiSlice} from '../api/apiSlice';

const BASE_URL ='https://chef-booking.cheffindia.com/api/v1/booking';
// const BASE_URL = 'http://10.0.2.2:9101/api/v1/booking';

export const chefBookingApiSlice = apiSlice.injectEndpoints({
  endpoints: builder => ({
    bookChef: builder.mutation({
      query: payload => ({
        url: `${BASE_URL}/`,
        method: 'POST',
        body: payload,
        headers: {
          'Content-Type': 'application/json',
        },
      }),
    }),
    getAvailableChefs: builder.mutation({
      query: payload => ({
        url: `${BASE_URL}/availableChefs`,
        method: 'POST',
        body: payload,
        headers: {
          'Content-Type': 'application/json',
        },
      }),
    }),
    findCatering: builder.mutation({
      query: ({latitude, longitude, startDate, endDate, timeSlots, isVeg = false}) => {
        const params = new URLSearchParams({
          latitude: latitude,
          longitude: longitude,
          startDate: startDate ? encodeURIComponent(startDate) : '',
          endDate: encodeURIComponent(endDate ?? startDate),
          isVeg: isVeg,
          // timeSlots: timeSlots?.[0], 
        });

        timeSlots?.forEach(slot => params.append('timeSlots[]', slot));

        return {
          url: `${BASE_URL}/catering?${params.toString()}`,
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        };
      },
    }),
    bookCatering: builder.mutation({
      query: payload => {
        return {
          url: `${BASE_URL}/catering`,
          method: 'POST',
          body: payload,
          headers: {
            'Content-Type': 'application/json',
          },
        };
      },
    }),
    bookingRatings: builder.query({
      query: (userId) => {
        const params = new URLSearchParams({
          userId: userId,
        });
        return {
        url: `${BASE_URL}/userRatings?${params.toString()}`,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      };
    },
    }),
    postBookingRatings: builder.mutation({
      query: payload => {
        return {
          url: `${BASE_URL}/userRatings`,
          method: 'POST',
          body: payload,
          headers: {
            'Content-Type': 'application/json',
          },
        };
      },
    }),
    
  }),
});

export const {
  useBookChefMutation,
  useFindCateringMutation,
  useBookCateringMutation,
  useGetAvailableChefsMutation,
  useBookingRatingsQuery,
  usePostBookingRatingsMutation
} = chefBookingApiSlice;
