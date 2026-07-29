import { createSlice, createSelector } from '@reduxjs/toolkit'

const initialState = {
  email: "",
  fullname: "",
  profile_image: null,
  role: ""
}

export const userSlice = createSlice({
  name: 'user_info',
  initialState,
  reducers: {
    setUserInfo: (state, action) => {
      state.email = action.payload.email
      state.fullname = action.payload.fullname
      state.profile_image = action.payload.profile_image ?? "/images/user.png"
      state.role = action.payload.role
    },
    unsetUserInfo: (state, action) => {
      state.email = initialState.email
      state.fullname = initialState.fullname
      state.profile_image = initialState.profile_image
      state.role = initialState.payload.role
    },
  }
})

export const getUserSelector = createSelector(state=>state.user, state=>state)

export const { setUserInfo, unsetUserInfo } = userSlice.actions

export default userSlice.reducer