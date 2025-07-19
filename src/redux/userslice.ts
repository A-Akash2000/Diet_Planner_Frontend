import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface UserState {
  name: string;
  _id: string;
  username: string;
  email: string;
  contactNumber: string;
  password: string;
  role: string;
  deleted: boolean;
  createdAt:string;
}

const initialState: UserState = {
  _id: '',
  name: '',
  email: '',
  password: '',
  role: '',
  deleted: false,
  createdAt:"",
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<UserState>) => {
      return { ...state, ...action.payload };
    },
    clearUser: () => {
      return { ...initialState };
    },
  },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
