import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../store";

interface FeedsPreferenceState {
  muted: boolean;
}

const initialState: FeedsPreferenceState = {
  muted: true, // Set initial muted state to true
};

export const feedsPrefrenceSlice = createSlice({
  name: "feedsPreference",
  initialState,
  reducers: {
    toggleMutePosts(state) {
      state.muted = !state.muted;
    },
  },
});

export const { toggleMutePosts } = feedsPrefrenceSlice.actions;

export const selectIsMuted = (state: RootState) => state.feedsPreference.muted;

export default feedsPrefrenceSlice.reducer
