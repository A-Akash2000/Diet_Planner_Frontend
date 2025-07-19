import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface UserState {
  name: string;
  _id: string;
  username: string;
  email: string;
  contactNumber: string;
  password: string;
  confirmPassword: string;
  role: string;
  shiftStart: string;
  shiftEnd: string;
  address: string;
  gender: string;
  isAvailable: boolean;
  lastUpdated: string;
  deleted: boolean;
  createdAt:string;
  profilePicture?: File | null |string ;
}

const initialState: UserState = {
  _id: '',
  username: '',
  email: '',
  contactNumber: '',
  password: '',
  confirmPassword: '',
  role: '',
  shiftStart: '',
  shiftEnd: '',
  address: '',
  gender: '',
  isAvailable: true,
  lastUpdated: '',
  deleted: false,
  createdAt:"",
  profilePicture: ""
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
