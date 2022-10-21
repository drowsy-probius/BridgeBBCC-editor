import { createSlice } from "@reduxjs/toolkit";

export const iconListSlice = createSlice({
  name: "iconList",
  initialState: {
    value: []
  },
  reducers: {
    setIconListValue: (state, action) => {
      state.value = [...action.payload];

      
    },
  }
});

export const { setIconListValue } = iconListSlice.actions;
export const selectIconList = (state) => state.iconList.value;

export default iconListSlice.reducer;