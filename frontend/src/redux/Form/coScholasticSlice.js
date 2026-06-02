import { axiosInstanceToken } from "../instence";
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

export const CreateCoScholastic = createAsyncThunk('CreateCoScholastic', async (payload) => {
    const response = await axiosInstanceToken.post(`co-scholastic/create`, payload);
    return response.data;
})

export const GetCoScholasticForm = createAsyncThunk('GetCoScholasticForm', async (payload) => {
    const response = await axiosInstanceToken.get(`co-scholastic/${payload}`);
    return response.data;
})

export const TeacherCoScholasticComplete = createAsyncThunk('TeacherCoScholasticComplete', async (payload) => {
    const response = await axiosInstanceToken.put(`co-scholastic/teacher/${payload.id}`, payload.data);
    return response.data;
})

export const GetcreatedByCoScholastic = createAsyncThunk('GetcreatedByCoScholastic', async () => {
    const response = await axiosInstanceToken.get(`co-scholastic/myform`);
    return response.data;
})

export const TeacherCoScholasticForms = createAsyncThunk('TeacherCoScholasticForms', async () => {
    const response = await axiosInstanceToken.get(`co-scholastic/teacherform`);
    return response.data;
})

export const EditUpdateCoScholasticForm = createAsyncThunk('EditUpdateCoScholasticForm', async (payload) => {
    const response = await axiosInstanceToken.put(`co-scholastic/${payload?.id}`, payload?.data);
    return response.data;
})

export const GetAllCoScholasticForms = createAsyncThunk('GetAllCoScholasticForms', async () => {
    const response = await axiosInstanceToken.get(`co-scholastic/`);
    return response.data;
})

export const DeleteCoScholasticForm = createAsyncThunk('DeleteCoScholasticForm', async (payload) => {
    const response = await axiosInstanceToken.delete(`co-scholastic/${payload}`);
    return response.data;
})

const coScholasticSlice = createSlice({
    name: 'coScholastic',
    initialState: {
        formDataList: null,
        GetForms: null,
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
                state.GetForms = action.payload;
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
                state.GetForms = action.payload;
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
                state.GetForms = action.payload;
            })
            .addCase(GetAllCoScholasticForms.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            });
    },
});

export const { resetError, resetMessage } = coScholasticSlice.actions;
export default coScholasticSlice.reducer;
