import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstanceToken } from "../instence"; // Tumhara custom axios instance

// ** Thunk to fetch activities **
export const getRecentActivities = createAsyncThunk(
  "activity/getRecentActivities",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstanceToken.get("/activity/recent-activities");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Something went wrong");
    }
  }
);


export const CreateActivityApi = createAsyncThunk('CreateActivityApi',async (payload) => {
  const response = await axiosInstanceToken.post(`activity/create`,payload);
  return response.data;
})

export const getSingleActivityApi = createAsyncThunk('getSingleActivityApi', async (payload) => {
  const roleParam = payload?.role ? `&role=${payload.role}` : '';
  const response = await axiosInstanceToken.get(`activity/get/${payload?.id}?fromNo=${payload?.fromNo}${roleParam}`);
  return response.data;
});




const activitySlice = createSlice({
  name: "activity",
  initialState: {
    activities: [],
    loading: false,
    error: null,
  },
  reducers: {
    resetActivityError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
    .addCase(getSingleActivityApi.pending, (state) => {
      state.loading = true;
      state.error = null;
    }
    )
    .addCase(getSingleActivityApi.fulfilled, (state, action) => {

      state.loading = false;
      state.activities = action.payload;
    }
    )
    .addCase(getSingleActivityApi.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    }
    )

      // .addCase(getRecentActivities.pending, (state) => {
      //   state.loading = true;
      //   state.error = null;
      // })
      // .addCase(getRecentActivities.fulfilled, (state, action) => {
      //   state.loading = false;
      //   state.activities = action.payload;
      // })
      // .addCase(getRecentActivities.rejected, (state, action) => {
      //   state.loading = false;
      //   state.error = action.payload;
      // });
  },
});

export const { resetActivityError } = activitySlice.actions;
export default activitySlice.reducer;
