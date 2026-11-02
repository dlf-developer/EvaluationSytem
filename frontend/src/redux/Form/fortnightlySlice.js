import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { axiosInstanceToken } from "../instence";

export const GetObserverPendignForms = createAsyncThunk('GetObserverPendignForms', async (payload) => {
  const response = await axiosInstanceToken.get(`form/fortnightly-monitor/observer/${payload}`);
  return response.data;
});

export const CreateFormOne = createAsyncThunk('CreateFormOne', async (payload) => {
  const response = await axiosInstanceToken.post(`form/fortnightly-monitor/create`, payload);
  return response.data;
});

export const GetFormsOne = createAsyncThunk('GetFormsOne', async (params = {}) => {
  const response = await axiosInstanceToken.get(`/form/fortnightly-monitor`, { params });
  return response.data;
});

export const GetObserverFormsOne = createAsyncThunk('GetObserverFormsOne', async (params = {}) => {
  const response = await axiosInstanceToken.get(`/form/fortnightly-monitor/oberver/get`, { params });
  return response.data;
});

export const GetSingleFormsOne = createAsyncThunk('GetSingleFormsOne', async (payload) => {
  const response = await axiosInstanceToken.get(`/form/fortnightly-monitor/${payload}`);
  return response.data;
});

export const GetSingleFormComplete = createAsyncThunk('GetSingleFormComplete', async (payload) => {
  const response = await axiosInstanceToken.put(`/form/fortnightly-monitor/${payload.id}`, payload.data);
  return response.data;
});

export const GetTodoForms = createAsyncThunk('GetTodoForms', async (payload) => {
  const response = await axiosInstanceToken.post(`/form/fortnightly-monitor/observer-dashboard`, payload);
  return response.data;
});

export const FormInitiationAction = createAsyncThunk('FormInitiationAction', async (payload) => {
  const response = await axiosInstanceToken.post(`/form/fortnightly-monitor/form-initiation`, payload);
  return response.data;
});

export const EditUpdate = createAsyncThunk('EditUpdate', async (payload) => {
  const response = await axiosInstanceToken.put(`/form/fortnightly-monitor/update/${payload?.id}`, payload?.data);
  return response.data;
});

export const GetAllFormsForAdmin = createAsyncThunk('GetAllFormsForAdmin', async (params = {}) => {
  const response = await axiosInstanceToken.get(`/form/fortnightly-monitor/get/all`, { params });
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
    : Array.isArray(payload?.CombinedForm)
    ? payload.CombinedForm
    : Array.isArray(payload?.Combined)
    ? payload.Combined
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

const fortnightlySlice = createSlice({
  name: 'fortnightlySlice',
  initialState: {
    data: null,
    getAllForms: [],
    getAllAdminForms: [],
    GetTodoFormList: null,
    pagination: { total: 0, page: 1, limit: 10, totalPages: 1 },
    filterOptions: { classes: [], sections: [] },
    loading: false,
    error: null,
    message: '',
  },
  reducers: {
    resetError: (state) => {
      state.error = null;
    },
    fortnightlySlices: (state) => {
      state.message = '';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(GetTodoForms.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(GetTodoForms.fulfilled, (state, action) => {
        state.loading = false;
        state.GetTodoFormList = action.payload;
      })
      .addCase(GetTodoForms.rejected, (state) => {
        state.loading = false;
        state.error = { message: "Server Error" };
      })

      .addCase(GetObserverPendignForms.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(GetObserverPendignForms.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(GetObserverPendignForms.rejected, (state) => {
        state.loading = false;
        state.error = { message: "Server Error" };
      })

      .addCase(GetFormsOne.pending, (state, action) => {
        state.loading = true;
        state.error = action.payload;
      })
      .addCase(GetFormsOne.fulfilled, (state, action) => {
        state.loading = false;
        const norm = normalizePayload(action.payload);
        state.getAllForms = norm.data;
        state.getAllAdminForms = norm.data;
        state.pagination = norm.pagination;
        state.filterOptions = norm.filterOptions;
      })
      .addCase(GetFormsOne.rejected, (state) => {
        state.loading = false;
        state.error = { message: "Server Error" };
      })

      .addCase(GetObserverFormsOne.pending, (state, action) => {
        state.loading = true;
        state.error = action.payload;
      })
      .addCase(GetObserverFormsOne.fulfilled, (state, action) => {
        state.loading = false;
        const norm = normalizePayload(action.payload);
        state.getAllForms = norm.data;
        state.getAllAdminForms = norm.data;
        state.pagination = norm.pagination;
        state.filterOptions = norm.filterOptions;
      })
      .addCase(GetObserverFormsOne.rejected, (state) => {
        state.loading = false;
        state.error = { message: "Server Error" };
      })

      .addCase(GetAllFormsForAdmin.pending, (state, action) => {
        state.loading = true;
        state.error = action.payload;
      })
      .addCase(GetAllFormsForAdmin.fulfilled, (state, action) => {
        state.loading = false;
        const norm = normalizePayload(action.payload);
        state.getAllForms = norm.data;
        state.getAllAdminForms = norm.data;
        state.pagination = norm.pagination;
        state.filterOptions = norm.filterOptions;
      })
      .addCase(GetAllFormsForAdmin.rejected, (state) => {
        state.loading = false;
        state.error = { message: "Server Error" };
      })

      .addCase(GetSingleFormsOne.pending, (state, action) => {
        state.loading = true;
        state.error = action.payload;
      })
      .addCase(GetSingleFormsOne.fulfilled, (state, action) => {
        state.loading = false;
        state.GetSingleForms = action.payload;
      })
      .addCase(GetSingleFormsOne.rejected, (state) => {
        state.loading = false;
        state.error = { message: "Server Error" };
      });
  },
});

export const { resetError, fortnightlySlices } = fortnightlySlice.actions;
export default fortnightlySlice.reducer;
