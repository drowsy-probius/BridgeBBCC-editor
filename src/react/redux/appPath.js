import { createSlice } from "@reduxjs/toolkit"

export const appPathSlice = createSlice({
  name: 'appPath',
  initialState: {
    value: {
      root: "C:\\Users\\k123s\\Desktop\\workspace\\BridgeBBCC", // for debug
      config: "C:\\Users\\k123s\\Desktop\\workspace\\BridgeBBCC\\lib\\config.js",
      iconList: "C:\\Users\\k123s\\Desktop\\workspace\\BridgeBBCC\\lib\\dccon_list.js",
      iconDirectory: "C:\\Users\\k123s\\Desktop\\workspace\\BridgeBBCC\\images\\dccon",
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

