import {apiSlice} from '../api/apiSlice';

const BASE_URL = 'https://admin.cheffindia.com/api/v1/admin/menu';
// const BASE_URL = 'http://10.0.2.2:9003/api/v1/admin/menu';

export const menuApiSlice = apiSlice.injectEndpoints({
  endpoints: builder => ({
    getMenu: builder.query({
      query: ({menuType, country, page, limit}) => {
        const params = new URLSearchParams();
        if (menuType) params.append('menuType', menuType);
        if (country) params.append('country', country);
        if (page) params.append('page', page);
        if (limit) params.append('limit', limit);
        return {
          url: `${BASE_URL}?${params.toString()}`,
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        };
      },
    }),
    searchMenuByItemName: builder.query({
      query: ({search, menuType, country, page, limit}) => {
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (menuType) params.append('menuType', menuType);
        if (country) params.append('country', country);
        // Uncomment the next two lines if paging is required:
        // if (page) params.append('page', page);
        // if (limit) params.append('limit', limit);
        return {
          url: `${BASE_URL}/search?${params.toString()}`,
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        };
      },
    }),
    // Mutation endpoint to filter menus by tag (and optionally menuType, country, page, limit)
    filterMenu: builder.mutation({
      query: ({tag, menuType, country, page, limit}) => {
        const params = new URLSearchParams();
        if (tag) params.append('tag', tag);
        if (menuType) params.append('menuType', menuType);
        if (country) params.append('country', country);
        // if (page) body.page = page;
        // if (limit) body.limit = limit;
        return {
          url: `${BASE_URL}/filter?${params.toString()}`,
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        };
      },
    }),
  }),
});

export const {
  useGetMenuQuery,
  useLazySearchMenuByItemNameQuery,
  useFilterMenuMutation,
} = menuApiSlice;
