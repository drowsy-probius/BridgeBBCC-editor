import { createSlice } from "@reduxjs/toolkit"

export const appPathSlice = createSlice({
  name: 'appPath',
  initialState: {
    value: {
      root: "", // for debug
      config: "",
      iconList: "",
      iconDirectory: "",
    }
  },
  reducers: {
    setAppPathValue: (state, action) => {
      state.value = {...action.payload}
    }
  }
});

export const { setAppPathValue } = appPathSlice.actions;
export const selectAppPath = (state) => state.appPath.value;

export default appPathSlice.reducer;

