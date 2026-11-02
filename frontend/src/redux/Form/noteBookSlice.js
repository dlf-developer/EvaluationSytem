import { axiosInstanceToken } from "../instence";
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

const prefixURL = 'notebook-checking-proforma'

export const CreateNoteBookForm = createAsyncThunk('CreateNoteBookForm',async (payload) => {
    const response = await axiosInstanceToken.post(`${prefixURL}/create`,payload);
      return response.data;
  })

  export const GetNoteBookForm = createAsyncThunk('GetNoteBookForm',async (payload) => {
    const response = await axiosInstanceToken.get(`${prefixURL}/get/${payload}`);
      return response.data;
  })

  export const ObserverNotebookComplete = createAsyncThunk('TeacherNotebookComplete',async (payload) => {
    const response = await axiosInstanceToken.post(`${prefixURL}/observer/${payload.id}`,payload.data);
      return response.data;
  })

  export const GetcreatedByUser = createAsyncThunk('GetcreatedByUser', async (params = {}) => {
  const response = await axiosInstanceToken.get(`${prefixURL}/get`, { params });
  return response.data;
});

export const GetobserverForms = createAsyncThunk('GetobserverForms', async (params = {}) => {
  const response = await axiosInstanceToken.get(`${prefixURL}/observer/get`, { params });
  return response.data;
});

export const EditNoteBook = createAsyncThunk('EditNoteBook', async (payload) => {
  const response = await axiosInstanceToken.put(`${prefixURL}/observer/edit/${payload?.id}`, payload.data);
  return response.data;
});

export const createInitiate = createAsyncThunk('createInitiate', async (payload) => {
  const response = await axiosInstanceToken.post(`${prefixURL}/createInitiate`, payload);
  return response.data;
});

export const getNootbookForms = createAsyncThunk('getNootbookForms', async (params = {}) => {
  const response = await axiosInstanceToken.get(`${prefixURL}/get-all`, { params });
  return response.data;
});

export const updateTeacherReflationFeedback = createAsyncThunk('updateTeacherReflationFeedback', async (payload) => {
  const response = await axiosInstanceToken.put(`${prefixURL}/teacher/reflation/${payload?.id}`, payload.data);
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

const noteBookSlice = createSlice({
  name: 'noteBook',
  initialState: {
    formDataList: null,
    GetForms2: [],
    pagination: { total: 0, page: 1, limit: 10, totalPages: 1 },
    filterOptions: { classes: [], sections: [] },
    isLoading: false,
    error: null,
    message: '',
    GetForms: null,
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
      .addCase(GetNoteBookForm.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(GetNoteBookForm.fulfilled, (state, action) => {
        state.isLoading = false;
        state.formDataList = action.payload;
      })
      .addCase(GetNoteBookForm.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(GetcreatedByUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(GetcreatedByUser.fulfilled, (state, action) => {
        state.isLoading = false;
        const norm = normalizePayload(action.payload);
        state.GetForms2 = norm.data;
        state.pagination = norm.pagination;
        state.filterOptions = norm.filterOptions;
      })
      .addCase(GetcreatedByUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(GetobserverForms.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(GetobserverForms.fulfilled, (state, action) => {
        state.isLoading = false;
        const norm = normalizePayload(action.payload);
        state.GetForms2 = norm.data;
        state.pagination = norm.pagination;
        state.filterOptions = norm.filterOptions;
      })
      .addCase(GetobserverForms.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      .addCase(getNootbookForms.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getNootbookForms.fulfilled, (state, action) => {
        state.isLoading = false;
        const norm = normalizePayload(action.payload);
        state.GetForms2 = norm.data;
        state.pagination = norm.pagination;
        state.filterOptions = norm.filterOptions;
      })
      .addCase(getNootbookForms.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});
  
  export const { resetError, resetMessage } = noteBookSlice.actions; // Export the reset actions
  export default noteBookSlice.reducer; // Export the reducer
  