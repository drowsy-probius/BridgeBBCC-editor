import { configureStore } from '@reduxjs/toolkit'

import appPathReducer from "./appPath";
import iconListReducer from "./iconList";

export default configureStore({
  reducer: {
    appPath: appPathReducer,
    iconList: iconListReducer,
  }
})