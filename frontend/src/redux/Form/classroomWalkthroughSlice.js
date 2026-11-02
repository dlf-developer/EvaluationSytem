import { axiosInstanceToken } from "../instence";
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

export const CreateWalkThrough = createAsyncThunk('CreateWalkThrough', async (payload) => {
  const response = await axiosInstanceToken.post(`classroom-walkthrough/create`, payload);
  return response.data;
});

export const GetWalkThroughForm = createAsyncThunk('GetWalkThroughForm', async (payload) => {
  const response = await axiosInstanceToken.get(`classroom-walkthrough/get/${payload}`);
  return response.data;
});

export const TeacherWalkThroughComplete = createAsyncThunk('TeacherWalkThroughComplete', async (payload) => {
  const response = await axiosInstanceToken.post(`classroom-walkthrough/teacher/${payload.id}`, payload.data);
  return response.data;
});

export const GetcreatedBy = createAsyncThunk('GetcreatedBy', async (params = {}) => {
  const response = await axiosInstanceToken.get(`classroom-walkthrough/get`, { params });
  return response.data;
});

export const TeacherwalkthroughForms = createAsyncThunk('TeacherwalkthroughForm', async (params = {}) => {
  const response = await axiosInstanceToken.get(`classroom-walkthrough/teachers/get`, { params });
  return response.data;
});

export const EditUpdateClassForm = createAsyncThunk('EditUpdateClassForm', async (payload) => {
  const response = await axiosInstanceToken.put(`classroom-walkthrough/edit/${payload?.id}`, payload?.data);
  return response.data;
});

export const GetAllClassRoomForms = createAsyncThunk('GetAllClassRoomForms', async (params = {}) => {
  const response = await axiosInstanceToken.get(`classroom-walkthrough/teachers/get/all`, { params });
  return response.data;
});

const normalizePayload = (payload) => {
  if (Array.isArray(payload)) {
    return {
      data: payload,
      pagination: {
        total: payload.length,
        page: 1,
        limit: payload.length || 10,
        totalPages: Math.ceil((payload.length || 1) / 10),
      },
      filterOptions: { classes: [], sections: [] },
    };
  }

  const formsArray = Array.isArray(payload?.data)
    ? payload.data
    : Array.isArray(payload?.forms)
    ? payload.forms
    : Array.isArray(payload?.form)
    ? payload.form
    : [];

  const pagination = payload?.pagination || {
    total: formsArray.length,
    page: 1,
    limit: 10,
    totalPages: Math.ceil((formsArray.length || 1) / 10),
  };

  const filterOptions = payload?.filterOptions || { classes: [], sections: [] };

  return {
    data: formsArray,
    pagination,
    filterOptions,
  };
};

const classroomWalkthroughSlice = createSlice({
  name: 'classroomWalkthrough',
  initialState: {
    formDataList: null,
    GetForms: [],
    pagination: { total: 0, page: 1, limit: 10, totalPages: 1 },
    filterOptions: { classes: [], sections: [] },
    isLoading: false,
    error: null,
    message: '',
  },
  reducers: {
    resetError: (state) => {
      state.error = null;
    },
    resetMessage: (state) => {
      state.message = '';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(GetWalkThroughForm.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(GetWalkThroughForm.fulfilled, (state, action) => {
        state.isLoading = false;
        state.formDataList = action.payload;
      })
      .addCase(GetWalkThroughForm.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(GetcreatedBy.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(GetcreatedBy.fulfilled, (state, action) => {
        state.isLoading = false;
        const norm = normalizePayload(action.payload);
        state.GetForms = norm.data;
        state.pagination = norm.pagination;
        state.filterOptions = norm.filterOptions;
      })
      .addCase(GetcreatedBy.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(TeacherwalkthroughForms.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(TeacherwalkthroughForms.fulfilled, (state, action) => {
        state.isLoading = false;
        const norm = normalizePayload(action.payload);
        state.GetForms = norm.data;
        state.pagination = norm.pagination;
        state.filterOptions = norm.filterOptions;
      })
      .addCase(TeacherwalkthroughForms.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(GetAllClassRoomForms.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(GetAllClassRoomForms.fulfilled, (state, action) => {
        state.isLoading = false;
        const norm = normalizePayload(action.payload);
        state.GetForms = norm.data;
        state.pagination = norm.pagination;
        state.filterOptions = norm.filterOptions;
      })
      .addCase(GetAllClassRoomForms.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { resetError, resetMessage } = classroomWalkthroughSlice.actions;
export default classroomWalkthroughSlice.reducer;
