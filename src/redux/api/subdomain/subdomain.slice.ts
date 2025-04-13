// import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// import axios, { AxiosError } from 'axios';
// import { setSubdomainData } from '../customAxios';

// interface SubdomainData {
//   id: string;
//   name: string;
//   subdomain: string;
//   address: string | null;
//   ownerId: string;
//   kycStatus: string;
//   createdAt: string;
//   updatedAt: string;
//   parentId: string | null;
// }

// interface SubdomainState {
//   data: SubdomainData | null;
//   loading: boolean;
//   error: string | null;
// }

// export const checkSubdomain = createAsyncThunk<
//   SubdomainData | null,
//   void,
//   { rejectValue: string }
// >(
//   'subdomain/checkSubdomain',
//   async (_, { rejectWithValue }) => {
//     console.log('checkSubdomain thunk started');
//     const hostname = window.location.hostname;
//     console.log('Hostname:', hostname);
//     const subdomain = hostname.split('.').length >= 3 ? hostname.split('.')[0] : null;
//     console.log('Extracted subdomain:', subdomain);

//     if (!subdomain) {
//       console.log('No subdomain found');
//       return null;
//     }
//     try {
//       const response = await axios.get<SubdomainData>(
//         `https://api-b2b-dev.lellall.com/restaurants/subdomain/${subdomain}`
//       );
//       setSubdomainData(response.data);
//       return response.data;
//     } catch (error) {
//       const axiosError = error as AxiosError;
//       if (axiosError.response?.status === 404) {
//         setSubdomainData(null);
//         return null;
//       }
//       return rejectWithValue(
//         (axiosError.response?.data as string) || axiosError.message
//       );
//     }
//   }
// );

// const initialState: SubdomainState = {
//   data: null,
//   loading: false,
//   error: null,
// };

// const subdomainSlice = createSlice({
//   name: 'subdomain',
//   initialState,
//   reducers: {},
//   extraReducers: (builder) => {
//     builder
//       .addCase(checkSubdomain.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(checkSubdomain.fulfilled, (state, action) => {
//         state.loading = false;
//         state.data = action.payload;
//       })
//       .addCase(checkSubdomain.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload || 'Failed to check subdomain';
//       });
//   },
// });

// export const selectSubdomain = (state: any) => state.subdomain;

// export default subdomainSlice.reducer;