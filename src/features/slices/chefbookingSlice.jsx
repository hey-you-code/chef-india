import {createSlice} from '@reduxjs/toolkit';

const initialState = {
  currentPage: 0,
  bookingType: '',
  formData: {
    menu: {
      items: [],
      numberOfItems: {},
      totalItems: 0,
    },
  },
};

const chefBookingSlice = createSlice({
  name: 'chefBooking',
  initialState: initialState,
  reducers: {
    setBookingType: (state, action) => {
      state.bookingType = action.payload;
    },
    resetBookingType: state => {
      state.bookingType = initialState.bookingType;
    },
    setFormData: (state, action) => {
      const {field, subfield, subfield2, value} = action.payload;

      // If updating a third level nested property.
      if (typeof subfield2 !== 'undefined') {
        state.formData = {
          ...state.formData,
          [field]: {
            ...(state.formData[field] || {}), // fallback to {} if undefined
            [subfield]: {
              ...((state.formData[field] || {})[subfield] || {}), // fallback to {} if undefined
              [subfield2]: value,
            },
          },
        };
      }
      // If updating a two-level nested property.
      else if (typeof subfield !== 'undefined') {
        state.formData = {
          ...state.formData,
          [field]: {
            ...(state.formData[field] || {}), // fallback to {} if undefined
            [subfield]: value,
          },
        };
      }
      // If updating a top-level field.
      else {
        state.formData = {
          ...state.formData,
          [field]: value,
        };
      }
    },

    resetMenu: state => {
      state.formData.menu = {
        items: [],
        numberOfItems: {},
        totalItems: 0,
      };
    },

    // SPECIAL CATERING BOOKING
    takeActionForMenuItems: (state, action) => {
      const existingItem = state.formData.menu?.items?.find(
        item => item.id === action.payload.id,
      );
      if (existingItem) {
        state.formData.menu.items = state.formData?.menu?.items.filter(
          item => item.id !== action.payload.id,
        );

        state.formData.menu.totalItems = Math.max(
          0,
          state.formData.menu.totalItems - 1,
        );

        // Decrement the count for each tag present in the removed item.
        existingItem.itemTags.forEach(tag => {
          // Using lower-case keys for consistency.
          const key = tag.toLowerCase();
          if (state.formData.menu.numberOfItems[key] !== undefined) {
            state.formData.menu.numberOfItems[key] = Math.max(
              0,
              state.formData.menu.numberOfItems[key] - 1,
            );
          }
        });
      } else {
        state.formData.menu.items.push({
          //   category_id: action.payload.category_id,
          id: action.payload.id,
          itemName: action.payload.itemName,
          itemCount: 1,
          itemTags: action.payload.itemTags,
          itemPrice: action.payload.itemPrice,
          itemImage: action.payload.itemImage,
          itemDescription: action.payload.itemDescription,
        });

        state.formData.menu.totalItems += 1;

        // Increment the count for each tag in the new item.
        console.log('tags: ', action.payload.itemTags);
        action.payload.itemTags.forEach(tag => {
          const key = tag.toLowerCase();
          if (state.formData.menu.numberOfItems[key] === undefined) {
            state.formData.menu.numberOfItems[key] = 1;
          } else {
            state.formData.menu.numberOfItems[key] += 1;
          }
        });
      }
    },

    increaseNumberOfItems: (state, action) => {
      action.payload.itemTags.forEach(tag => {
        const key = tag.toLowerCase();
        if (state.formData.menu.numberOfItems[key] === undefined) {
          state.formData.menu.numberOfItems[key] = 1;
        } else {
          state.formData.menu.numberOfItems[key] += 1;
        }
      });
      state.formData.menu.totalItems += 1;
    },
    decreaseNumberOfItems: (state, action) => {
      action.payload.itemTags.forEach(tag => {
        const key = tag.toLowerCase();
        // Find the max itemCount for items with the same tag
        const maxItemCount = state.formData.menu.items.filter(item =>
          item.itemTags.includes(key),
        ).length;

        // Update the numberOfItems entry for the tag
        if (state.formData.menu.numberOfItems[key] !== undefined) {
          state.formData.menu.numberOfItems[key] = Math.max(
            maxItemCount, // ✅ Max itemCount for items with this tag
            state.formData.menu.numberOfItems[key] - 1,
          );
        }

        state.formData.menu.totalItems = Math.max(
          state.formData.menu.items.length,
          state.formData.menu.totalItems - 1,
        );
      });
    },

    // SPECIAL NON CATERING BOOKING

    addMenuItems: (state, action) => {
      const existingItem = state.formData.menu.items.find(
        item => item.id === action.payload.id,
      );
      if (existingItem) {
        // If the item already exists, update its count and price
        const pricePerItem = existingItem.itemPrice / existingItem.itemCount;

        existingItem.itemCount += 1;

        // Update the total price
        existingItem.itemPrice = existingItem.itemCount * pricePerItem;
      } else {
        // If the item doesn't exist, add it to the array
        state.formData.menu.items.push({
          //   category_id: action.payload.category_id,
          id: action.payload.id,
          itemName: action.payload.itemName,
          itemCount: 1,
          itemTags: action.payload.itemTags,
          itemPrice: action.payload.itemPrice,
          itemImage: action.payload.itemImage,
          itemDescription: action.payload.itemDescription,
        });
      }
    },

    //   TODO CHECH IF EVERYTHING IS OKAY

    removeMenuItems: (state, action) => {
      const existingItem = state.formData.menu.items.find(
        item => item.id === action.payload.id,
      );
      if (existingItem) {
        if (existingItem.itemCount > 1) {
          // Decrement the count if greater than 1
          existingItem.itemCount -= 1;
          // Calculate the price per item
          const pricePerItem =
            existingItem.itemPrice / (existingItem.itemCount + 1);

          // Update the total price
          existingItem.itemPrice = existingItem.itemCount * pricePerItem;
        } else {
          // Remove the item entirely if the count is 1
          state.formData.menu.items = state.formData?.menu?.items.filter(
            item => item.id !== action.payload.id,
          );
        }
      }
    },
    deleteMenuItem: (state, action) => {
      const existingItem = state.formData?.menu?.items.find(
        item => item.id === action.payload.id,
      );
      if (existingItem) {
        state.formData.menu.items = state.formData.menu.items.filter(
          item => item.id !== action.payload.id,
        );
      }
    },

    moveToNextPage: state => {
      state.currentPage += 1;
    },

    moveToPreviousPage: state => {
      if (state.currentPage > 0) {
        state.currentPage -= 1;
      }
    },

    resetFormData: state => {
      state.formData = initialState?.formData;
    },
  },
});

export const {
  setFormData,
  resetFormData,
  moveToNextPage,
  moveToPreviousPage,
  takeActionForMenuItems,
  addMenuItems,
  removeMenuItems,
  deleteMenuItem,
  setBookingType,
  resetBookingType,
  increaseNumberOfItems,
  decreaseNumberOfItems,
  resetMenu,
} = chefBookingSlice.actions; // Export actions
export default chefBookingSlice.reducer; // Export reducer
