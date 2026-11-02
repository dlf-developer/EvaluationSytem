import { axiosInstanceToken } from "../instence";
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

export const CreateCoScholastic = createAsyncThunk('CreateCoScholastic', async (payload) => {
    const response = await axiosInstanceToken.post(`co-scholastic/create`, payload);
    return response.data;
});

export const GetCoScholasticForm = createAsyncThunk('GetCoScholasticForm', async (payload) => {
    const response = await axiosInstanceToken.get(`co-scholastic/${payload}`);
    return response.data;
});

export const TeacherCoScholasticComplete = createAsyncThunk('TeacherCoScholasticComplete', async (payload) => {
    const response = await axiosInstanceToken.put(`co-scholastic/teacher/${payload.id}`, payload.data);
    return response.data;
});

export const GetcreatedByCoScholastic = createAsyncThunk('GetcreatedByCoScholastic', async (params = {}) => {
    const response = await axiosInstanceToken.get(`co-scholastic/myform`, { params });
    return response.data;
});

export const TeacherCoScholasticForms = createAsyncThunk('TeacherCoScholasticForms', async (params = {}) => {
    const response = await axiosInstanceToken.get(`co-scholastic/teacherform`, { params });
    return response.data;
});

export const EditUpdateCoScholasticForm = createAsyncThunk('EditUpdateCoScholasticForm', async (payload) => {
    const response = await axiosInstanceToken.put(`co-scholastic/${payload?.id}`, payload?.data);
    return response.data;
});

export const GetAllCoScholasticForms = createAsyncThunk('GetAllCoScholasticForms', async (params = {}) => {
    const response = await axiosInstanceToken.get(`co-scholastic/`, { params });
    return response.data;
});

export const DeleteCoScholasticForm = createAsyncThunk('DeleteCoScholasticForm', async (payload) => {
    const response = await axiosInstanceToken.delete(`co-scholastic/${payload}`);
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

const coScholasticSlice = createSlice({
    name: 'coScholastic',
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
            .addCase(GetCoScholasticForm.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(GetCoScholasticForm.fulfilled, (state, action) => {
                state.isLoading = false;
                state.formDataList = action.payload;
            })
            .addCase(GetCoScholasticForm.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })

            .addCase(GetcreatedByCoScholastic.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(GetcreatedByCoScholastic.fulfilled, (state, action) => {
                state.isLoading = false;
                const norm = normalizePayload(action.payload);
                state.GetForms = norm.data;
                state.pagination = norm.pagination;
                state.filterOptions = norm.filterOptions;
            })
            .addCase(GetcreatedByCoScholastic.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })

            .addCase(TeacherCoScholasticForms.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(TeacherCoScholasticForms.fulfilled, (state, action) => {
                state.isLoading = false;
                const norm = normalizePayload(action.payload);
                state.GetForms = norm.data;
                state.pagination = norm.pagination;
                state.filterOptions = norm.filterOptions;
            })
            .addCase(TeacherCoScholasticForms.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })

            .addCase(GetAllCoScholasticForms.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(GetAllCoScholasticForms.fulfilled, (state, action) => {
                state.isLoading = false;
                const norm = normalizePayload(action.payload);
                state.GetForms = norm.data;
                state.pagination = norm.pagination;
                state.filterOptions = norm.filterOptions;
            })
            .addCase(GetAllCoScholasticForms.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            });
    },
});

export const { resetError, resetMessage } = coScholasticSlice.actions;
export default coScholasticSlice.reducer;
