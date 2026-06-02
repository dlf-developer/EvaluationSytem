import { configureStore } from '@reduxjs/toolkit';

import userSliceReducer from './userSlice';
import  fortnightlySlices  from './Form/fortnightlySlice';
import classroomWalkthroughSliceReducer from './Form/classroomWalkthroughSlice'
import noteBookSliceReducer from './Form/noteBookSlice'
import activityReducer from './Activity/activitySlice'
import coScholasticSlice from "./Form/coScholasticSlice";


const store = configureStore({
  reducer: {
    user: userSliceReducer,
    Forms: fortnightlySlices,
    walkThroughForm:classroomWalkthroughSliceReducer,
    notebook:noteBookSliceReducer,
    activity:activityReducer,
    coScholastic: coScholasticSlice,
  },
});

export default store;
