import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../store";

interface UserState {
  pan: string;
  currentInvestmentValue: number;
  id: string;
  firebaseId: string;
  email: string;
  username: string;
  bio: string;
  followersIDs: string[];
  followingIDs: string[];
  PostLikedIDs: string[];
  avatarPath?: string;
  shares: number;
  equity: number;
  balance: number;
  price: number;
  INRLocked: number;
  userEquity: number;
  posts: number;
  investment_on_self: number;
  platformEquity: number;
  verified?: boolean;
  dob?: string;
  mobile?: string | number;
  gender?: "MALE" | "FEMALE";
  paymentMethods: [];
}

export const userSlice = createSlice({
  name: "user",
  initialState: JSON.parse(
    localStorage.getItem("bluedibs:user") || "{}"
  ) as UserState,
  reducers: {
    setUser(user, action: PayloadAction<any>) {
      user = { ...action.payload };
      localStorage.setItem("bluedibs:user", JSON.stringify(user));
      return user;
    },
    updateUser(user, action: PayloadAction<Partial<UserState>>) {
      user = { ...user, ...action.payload };
      localStorage.setItem("bluedibs:user", JSON.stringify(user));
      return user;
    },
    follow(user, action: PayloadAction<string>) {
      user.followingIDs = user.followingIDs ?? [];

      user.followingIDs.push(action.payload);
      localStorage.setItem("bluedibs:user", JSON.stringify(user));

      return user;
    },
    unfollow(user, action: PayloadAction<string>) {
      user.followingIDs = user.followingIDs ?? [];

      user.followingIDs = user.followingIDs.filter(
        (id) => id != action.payload
      );

      localStorage.setItem("bluedibs:user", JSON.stringify(user));
      return user;
    },
    likePostUser(user, action: PayloadAction<string>) {
      user.PostLikedIDs.push(action.payload);

      localStorage.setItem("bluedibs:user", JSON.stringify(user));
      return user;
    },
    unLikePostUser(user, action: PayloadAction<string>) {
      user.PostLikedIDs = user.PostLikedIDs.filter(
        (postId) => postId != action.payload
      );

      localStorage.setItem("bluedibs:user", JSON.stringify(user));
      return user;
    },
  },
});

export const {
  setUser,
  follow,
  unfollow,
  likePostUser,
  unLikePostUser,
  updateUser,
} = userSlice.actions;
export const selectUser = (state: RootState) => state.user;
export default userSlice.reducer;
