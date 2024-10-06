import React, {useContext} from 'react'

import { useNavigate } from "react-router-dom";

import { useLoginUserMutation, useSocialSignInMutation } from "src/services/api";
import  { useFacebookLogin } from "@kazion/react-facebook-login";
import { useGoogleLogin } from '@react-oauth/google';

import { useDispatch } from 'react-redux';
import { setUserToken } from 'src/services/authSlice';
import { setUserInfo } from 'src/services/userSlice';
import { ClosableToast } from 'src/components/global/Toast';

import { FacebookOutlined, Google } from '@mui/icons-material';
import { Box, Button, TextField, Typography, useTheme, IconButton, Link, Divider } from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';
import { ColorModeContext, tokens } from "src/theme";
import { ROUTES } from 'src/routes';

export function GoogleSignInButton({isLoginLoading}) {
  
  const navigate = useNavigate()
  const dispatch = useDispatch()

  
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const colorMode = useContext(ColorModeContext);
  const isNonMobile = useMediaQuery('(min-width:600px)');


  const [socialSignIn, {isSocialLoading}] = useSocialSignInMutation()
  const onClickGoogle = useGoogleLogin({
    onSuccess: async (response)=>{
      console.log(response)
      const {access_token} = response
      const social_response = await socialSignIn({access_token, backend: "google-oauth2"})
      if (social_response.error) {
        console.error(social_response.error)
        ClosableToast("Unable To Sign In via Google...", "error", 2000)
      }else{
        const data = social_response.data.data 
        dispatch(setUserToken(data.token))
        dispatch(setUserInfo(data.user))
        ClosableToast("User logged in successfully!", "success", 2000)
        setTimeout(() => {
            navigate(ROUTES.DASHBOARD)
        }, 1500);
      }
    },
    onError: (error) => {
      console.error(error)
      ClosableToast("Unable To SignIn via Google...", "error", 2000)
    }
  })

  return (
    <IconButton disabled={(!!isSocialLoading || isLoginLoading)} sx={{
        backgroundColor: "#e2726e", padding: "2px",
        width: "50px", height: "50px",
        display: "flex",
        transition: ".5s all",
        '&:hover': {
          backgroundColor: "#b15a56",
        }
      }} onClick={()=>onClickGoogle()}>
      <Google sx={{fontSize: "2.2em", margin: 0, marginLeft: "-.5px", padding: 0, color: "white"}} />
    </IconButton>
  )
}



export function FacebookSignInButton({isLoginLoading}) {
  
  const navigate = useNavigate()
  const dispatch = useDispatch()

  
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const colorMode = useContext(ColorModeContext);
  const isNonMobile = useMediaQuery('(min-width:600px)');


  const [socialSignIn, {isSocialLoading}] = useSocialSignInMutation()
  const onClickFacebook = useFacebookLogin({
    scopes: ["profile_pic", "email"],
    fetchUserProfile: true,
    onSuccess: (response)=>{
      console.log(response)
      // const access_token = response.authResponse.accessToken
      // const social_response = socialSignIn({access_token, backend: "facebook"})
      // if (social_response.error) {
      //   console.error(social_response.error)
      //   ClosableToast("Unable To Sign In via Facebook...", "error", 2000)
      // }else{
      //   const data = social_response.data.data 
      //   dispatch(setUserToken(data.token))
      //   dispatch(setUserInfo(data.user))
      //   ClosableToast("User logged in successfully!", "success", 2000)
      //   setTimeout(() => {
      //       navigate(ROUTES.DASHBOARD)
      //   }, 1500);
      // }
    },
    onError: (error) => {
      if (error.status != "connected") {
        ClosableToast("Unable To Sign In via Facebook...", "error", 2000)
      }
      // else{        
      //   console.info("Error: ", error)
      // }
    }
  })

  return (
    <IconButton disabled={(!!isSocialLoading || isLoginLoading)} sx={{
      backgroundColor: "#0e82ff", padding: "2px",
      width: "50px", height: "50px",
      display: "flex",
      '&:hover': {
        backgroundColor: "#0a61bd",
      }
    }} onClick={()=>onClickFacebook()}>
      <FacebookOutlined sx={{fontSize: "2.2em", margin: 0, marginLeft: "-.5px", padding: 0, color: "white"}} />
    </IconButton>
  )
}
