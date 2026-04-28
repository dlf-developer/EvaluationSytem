import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance, axiosInstanceToken } from "./instence";

export const UserLogin = createAsyncThunk("UserLogin", async (payload) => {
  const response = await axiosInstance.post(`/auth/login`, payload);
  return response.data;
});

export const SendLoginOTP = createAsyncThunk("SendLoginOTP", async (payload) => {
  const response = await axiosInstance.post(`/auth/send-login-otp`, payload);
  return response.data;
});

export const VerifyLoginOTP = createAsyncThunk("VerifyLoginOTP", async (payload) => {
  const response = await axiosInstance.post(`/auth/verify-login-otp`, payload);
  return response.data;
});

export const FromDataAuth = createAsyncThunk(
  "FromDataAuth",
  async (payload) => {
    const response = await axiosInstanceToken.get(`/auth/form-data`, payload);
    return response.data;
  },
);

export const getFilteredData = createAsyncThunk(
  "getFilteredData",
  async (payload) => {
    const response = await axiosInstanceToken.post(
      `/auth/getFilteredData`,
      payload,
    );
    return response.data;
  },
);

export const GetUserList = createAsyncThunk(
  "GetUserList",
  async (params = {}) => {
    const response = await axiosInstanceToken.get(`/user/get`, { params });
    return response.data;
  },
);

export const GetTeacherList = createAsyncThunk(
  "GetTeacherList",
  async (payload) => {
    const response = await axiosInstanceToken.get(`/user/get/teachers`);
    return response.data;
  },
);

export const GetObserverList = createAsyncThunk(
  "GetObserverList",
  async (payload) => {
    const response = await axiosInstanceToken.get(`/user/get/observer`);
    return response.data;
  },
);

export const CreateUserList = createAsyncThunk(
  "CreateUserList",
  async (payload) => {
    const response = await axiosInstanceToken.post(`/user/create`, payload);
    return response.data;
  },
);

export const GetSignleUser = createAsyncThunk(
  "GetSignleUser",
  async (payload) => {
    const response = await axiosInstanceToken.get(`/user/single/${payload}`);
    return response.data;
  },
);

export const UpdateUser = createAsyncThunk("UpdateUser", async (payload) => {
  const response = await axiosInstanceToken.put(
    `/user/update/${payload.id}`,
    payload,
  );
  return response.data;
});
export const BulkUserCreate = createAsyncThunk(
  "BulkUserCreate",
  async (payload) => {
    const response = await axiosInstanceToken.post(
      `/user/bulk-upload`,
      payload,
    );
    return response.data;
  },
);

export const DeleteUser = createAsyncThunk("DeleteUser", async (payload) => {
  const response = await axiosInstanceToken.delete(`/user/delete/${payload}`);
  return response.data;
});

export const getUserNotification = createAsyncThunk(
  "getUserNotification",
  async (payload) => {
    const response = await axiosInstanceToken.get(`/notification/get`);
    return response.data;
  },
);

export const CReateClassSection = createAsyncThunk(
  "CReateClassSection",
  async (payload) => {
    const response = await axiosInstanceToken.post(`/class/create`, payload);
    return response.data;
  },
);

export const getCreateClassSection = createAsyncThunk(
  "getCreateClassSection",
  async () => {
    const response = await axiosInstanceToken.get(`/class/get`);
    return response.data;
  },
);

export const deleteCreateClassSection = createAsyncThunk(
  "deleteCreateClassSection",
  async (payload) => {
    const response = await axiosInstanceToken.delete(
      `/class/delete/${payload}`,
    );
    return response.data;
  },
);

// weekly 4 form

export const initiateFromObserver = createAsyncThunk(
  "initiateFromObserver",
  async (payload) => {
    const response = await axiosInstanceToken.post(
      `/weekly4Form/create`,
      payload,
    );
    return response.data;
  },
);

export const UpdateFromObserver = createAsyncThunk(
  "UpdateFromObserver",
  async (payload) => {
    const response = await axiosInstanceToken.put(
      `/weekly4Form/${payload.id}`,
      payload.data,
    );
    return response.data;
  },
);

export const getAllWeeklyFrom = createAsyncThunk(
  "getAllWeeklyFrom",
  async () => {
    const response = await axiosInstanceToken.get(`/weekly4Forms`);
    return response.data;
  },
);

export const getAllWeeklyFromById = createAsyncThunk(
  "getAllWeeklyFromById",
  async (payload) => {
    const response = await axiosInstanceToken.get(`/weekly4Form/${payload}`);
    return response.data;
  },
);

export const getAllWeeklyFromAll = createAsyncThunk(
  "getAllWeeklyFromAll",
  async (payload) => {
    const response = await axiosInstanceToken.get(`/weekly4Form/get/all`);
    return response.data;
  },
);

export const FormOneReminder = createAsyncThunk(
  "FormOneReminder",
  async (payload) => {
    const response = await axiosInstanceToken.post(
      `/form/fortnightly-monitor/reminder/${payload}`,
    );
    return response.data;
  },
);

export const FormTwoReminder = createAsyncThunk(
  "FormTwoReminder",
  async (payload) => {
    const response = await axiosInstanceToken.post(
      `classroom-walkthrough/reminder/${payload}`,
    );
    return response.data;
  },
);

export const FormThreeReminder = createAsyncThunk(
  "FormThreeReminder",
  async (payload) => {
    const response = await axiosInstanceToken.post(
      `notebook-checking-proforma/reminder/${payload}`,
    );
    return response.data;
  },
);

export const FormFourReminder = createAsyncThunk(
  "FormFourReminder",
  async (payload) => {
    const response = await axiosInstanceToken.post(
      `weekly4form/reminder/${payload}`,
    );
    return response.data;
  },
);
export const createWingForm = createAsyncThunk(
  "createWingForm",
  async (payload) => {
    const response = await axiosInstanceToken.post(
      `/wing-coordinator`,
      payload,
    );
    return response.data;
  },
);

export const updateWingForm = createAsyncThunk(
  "updateWingForm",
  async (payload) => {
    const response = await axiosInstanceToken.put(
      `/wing-coordinator/${payload?.id}`,
      payload?.checkdata,
    );
    return response.data;
  },
);
export const GetWingFrom = createAsyncThunk("GetWingFrom", async (payload) => {
  const response = await axiosInstanceToken.get(`/wing-coordinator/${payload}`);
  return response.data;
});

export const GetSingleWingFrom = createAsyncThunk(
  "GetSingleWingFrom",
  async (payload) => {
    const response = await axiosInstanceToken.get(
      `/wing-coordinator/single/${payload}`,
    );
    return response.data;
  },
);

export const WingPublished = createAsyncThunk(
  "WingPublished",
  async (payload) => {
    const response = await axiosInstanceToken.put(
      `/wing-coordinator/status/${payload?.id}`,
      payload?.checkdata,
    );
    return response.data;
  },
);

const userSlice = createSlice({
  name: "Users",
  initialState: {
    Notification: null,
    GetUsers: null,
    GetTeachersLists: null,
    GetObserverLists: null,
    getAllWeeklyFroms: null,
    loading: false,
    error: null,
    signupSuccess: false,
    getFilteredDataList: null,
    getWingFormlist: null,
    message: "",
  },
  reducers: {
    resetError: (state) => {
      state.error = null;
    },
    resetSignupState: (state) => {
      state.signupSuccess = false;
      state.message = "";
    },
  },
  extraReducers: (builder) => {
    builder

      //Get User Notification

      .addCase(getUserNotification.pending, (state, action) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserNotification.fulfilled, (state, action) => {
        state.loading = false;
        state.Notification = action.payload;
      })
      .addCase(getUserNotification.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getFilteredData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getFilteredData.fulfilled, (state, action) => {
        state.loading = false;
        state.getFilteredDataList = action.payload;
      })
      .addCase(getFilteredData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(GetWingFrom.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(GetWingFrom.fulfilled, (state, action) => {
        state.loading = false;
        state.getWingFormlist = action.payload;
      })
      .addCase(GetWingFrom.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get user profile
      .addCase(GetUserList.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(GetUserList.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(GetUserList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // GetTeacherList
      .addCase(GetTeacherList.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(GetTeacherList.fulfilled, (state, action) => {
        state.loading = false;
        state.GetTeachersLists = action.payload;
      })
      .addCase(GetTeacherList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      //GetObserverList

      .addCase(GetObserverList.pending, (state, action) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(GetObserverList.fulfilled, (state, action) => {
        state.loading = false;
        state.GetObserverLists = action.payload;
      })
      .addCase(GetObserverList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // weekly form
      .addCase(getAllWeeklyFrom.pending, (state, action) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllWeeklyFrom.fulfilled, (state, action) => {
        state.loading = false;
        state.getAllWeeklyFroms = action.payload;
      })
      .addCase(getAllWeeklyFrom.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getAllWeeklyFromAll.pending, (state, action) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllWeeklyFromAll.fulfilled, (state, action) => {
        state.loading = false;
        state.getAllWeeklyFroms = action.payload;
      })
      .addCase(getAllWeeklyFromAll.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetError, resetSignupState } = userSlice.actions;
export default userSlice.reducer;
