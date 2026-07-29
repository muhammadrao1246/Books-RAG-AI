import React, {useContext} from 'react'

import { useNavigate } from "react-router-dom";

import { useSocialSignInMutation } from "src/services/api";

import { useGoogleLogin } from '@react-oauth/google';

import { useDispatch } from 'react-redux';
import { setUserToken } from 'src/services/authSlice';
import { setUserInfo } from 'src/services/userSlice';
import { ClosableToast } from 'src/components/global/Toast';

import { ROUTES } from 'src/routes';
import { SocialButton } from '../SocialButton';

export function GoogleSignInButton({isLoginLoading}) {
  
  const navigate = useNavigate()
  const dispatch = useDispatch()


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
            navigate(ROUTES.CHAT)
        }, 1500);
      }
    },
    onError: (error) => {
      console.error(error)
      ClosableToast("Unable To SignIn via Google...", "error", 2000)
    }
  })
  return (
    <SocialButton text="Sign in with Google" onClick={()=>onClickGoogle()} disabled={(!!isSocialLoading || isLoginLoading)} />
  )
}
