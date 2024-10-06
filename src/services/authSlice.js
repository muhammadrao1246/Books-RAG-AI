import { createSlice, createSelector } from '@reduxjs/toolkit'

const initialState = {
  access_token: null,
  refresh_token: null,
}

const authSlice = createSlice({
  name: 'auth_token_slice',
  initialState,
  reducers: {
    setUserToken: (state, action) =>{
      state.access_token = action.payload.access_token
      state.refresh_token = action.payload.refresh_token
    },
    unsetUserToken: (state, action) => {
      state.access_token = initialState.access_token
      state.refresh_token = initialState.refresh_token
    }
  }
})

// help return auth state value here are tokens
export const getAuthSelector = createSelector(state => state.auth, state=>state)

export const { setUserToken, unsetUserToken } = authSlice.actions
export default authSlice.reducer
