// Need to use the React-specific entry point to import createApi
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { VITE_APP_BACKEND_SERVER, VITE_DEFAULT_AUTH_CLIENT_KEY, VITE_DEFAULT_AUTH_CLIENT_SECRET } from 'src/config'
// import { getToken, removeToken, storeToken } from './token';
import { setUserToken, unsetUserToken } from './authSlice';
import { setUserInfo, unsetUserInfo } from './userSlice';


const baseQueryWithAuthorizationToken = fetchBaseQuery({
    baseUrl: `${VITE_APP_BACKEND_SERVER}/api/`,
    prepareHeaders: (headers, { getState }) => {
        console.log(getState())
      const token = getState().auth.access_token; // Retrieve access token from Redux state
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  });

  const baseQueryWithoutAuthorization = fetchBaseQuery({
    baseUrl: `${VITE_APP_BACKEND_SERVER}/api/`,
  });

  const baseQueryWithReauth = async (args, api, extraOptions) => {
    // when a request is initiated
    let result = await baseQueryWithAuthorizationToken(args, api, extraOptions); // Execute the original request
  
    // if it returns unauthorized error
    if (result.error && result.error.status === 401) {
      // If Unauthorized, attempt to refresh the token
      const refreshToken = api.getState().auth.refresh_token;
  
    //   if refresh token exists
      if (refreshToken) {
        // obtain new access and refresh tokens from server
        const refreshResult = await baseQueryWithoutAuthorization({
          url: `oauth/token`,
          method: 'POST',
          body: {
            grant_type: 'refresh_token',
            client_id: VITE_DEFAULT_AUTH_CLIENT_KEY,
            client_secret: VITE_DEFAULT_AUTH_CLIENT_SECRET,
            refresh_token: refreshToken,
          }
        },
        api,
        extraOptions
      );

        if (refreshResult.data) {
            const data = refreshResult.data 
            // Refresh was successful
            const token = {
                access_token: data.access_token,
                refresh_token: data.refresh_token,
            };
            // Update the Redux store with the new tokens
            api.dispatch(setUserToken(token)); // Correct context for dispatch
            
            result = await baseQueryWithAuthorizationToken(args, api, extraOptions); // Retry the original request
        } else {
            // Refresh failed, clear the token
            api.dispatch(unsetUserToken()); // Clear tokens in the Redux store
            api.dispatch(unsetUserInfo());
            return { error: { status: 401, data: 'Unauthorized' } };
        }
  
      } else {
        // No refresh token available, clear the token
        api.dispatch(unsetUserToken());
        api.dispatch(unsetUserInfo());
        return { error: { status: 401, data: 'Unauthorized' } };
      }
    }
  
    // return request if completed without a major error
    return result;
  };
  
  
  
// Define a service using a base URL and expected endpoints
export const authApi = createApi({
  reducerPath: 'userAuthApi',
  baseQuery: baseQueryWithoutAuthorization,
  endpoints: (builder) => ({
    socialSignIn: builder.mutation({
        query: (data)=>{
            const {backend, access_token} = data
            return  {
                url: `auth/login/social/${backend}`,
                method: "POST",
                body: {
                    access_token
                },
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        }
    }),
    registerUser: builder.mutation({
        query: (user)=>{
            return  {
                url: "auth/register",
                method: "POST",
                body: user,
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        }
    }),
    loginUser: builder.mutation({
        query: (user)=>{
            return  {
                url: "auth/login",
                method: "POST",
                body: user,
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        }
    }),
    forgotPassword: builder.mutation({
        query: (data)=>{
            data.frontend_password_reset_route = window.location.origin + "/reset"
            return  {
                url: "auth/forgot",
                method: "POST",
                body: data,
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        }
    }),
    resetPassword: builder.mutation({
        query: (data)=>{
            const {uid, token} = data.params
            return  {
                url: `auth/reset/${uid}/${token}`,
                method: "POST",
                body: data.body,
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        }
    }),
    
  }),
})


// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const {
  useRegisterUserMutation,
  useLoginUserMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useSocialSignInMutation
} = authApi;


// defining a service and its endpoints related to data manipulation and fetching from the server
export const dataApi = createApi({
    baseQuery: baseQueryWithReauth,
    endpoints: builder => ({
        logoutUser: builder.mutation({
            query: ()=>{
                return  {
                    url: "/oauth/invalidate-refresh-tokens",
                    method: "POST",
                    body: {
                        client_id: VITE_DEFAULT_AUTH_CLIENT_KEY
                    },
                }
            }
        }),
        getEpisodesList: builder.mutation({
            query: ()=>{
                return  {
                    url: "episodes",
                    method: "GET",
                    // body: user,
                }
            }
        }),
        getEpisodeChaptersList: builder.mutation({
            query: (episode)=>{
                return  {
                    url: `episodes/${episode}/chapters`,
                    method: "GET",
                    // body: user,
                }
            }
        }),
        getEpisodeChapterDetail: builder.mutation({
            query: (data)=>{
                const {episodeId, chapterId} = data
                return  {
                    url: `episodes/${episodeId}/chapters/${chapterId}`,
                    method: "GET",
                    // body: user,
                }
            }
        }),
        updateEpisodeChapter: builder.mutation({
            query: (data)=>{
                const {episodeId, chapterId, body} = data
                return  {
                    url: `episodes/${episodeId}/chapters/${chapterId}`,
                    method: "PUT",
                    body: body,
                }
            }
        }),
        getEpisodesDetail: builder.mutation({
            query: (episode)=>{
                return  {
                    url: `episodes/${episode}`,
                    method: "GET",
                    // body: user,
                }
            }
        }),
        deleteEpisodes: builder.mutation({
            query: (episode)=>{
                return  {
                    url: `episodes/${episode}`,
                    method: "DELETE",
                    // body: user,
                }
            }
        }),
        saveEpisodesSheet: builder.mutation({
            query: (body)=>{
                return  {
                    url: `episodes/add`,
                    method: "POST",
                    body: body,
                }
            }
        }),
        
        getReelsList: builder.mutation({
            query: (data)=>{
                const {episodeId, chapterId} = data
                return  {
                    url: `episodes/${episodeId}/chapters/${chapterId}/reels`,
                    method: "GET",
                    // body: user,
                }
            }
        }),
        getReelsDetail: builder.mutation({
            query: (data)=>{
                const {episodeId, chapterId, reelId} = data
                return  {
                    url: `episodes/${episodeId}/chapters/${chapterId}/reels/${reelId}`,
                    method: "GET",
                    // body: user,
                }
            }
        }),
        addReel: builder.mutation({
            query: (data)=>{
                const {episodeId, chapterId, body} = data
                return  {
                    url: `episodes/${episodeId}/chapters/${chapterId}/reels/add`,
                    method: "POST",
                    body: body,
                }
            }
        }),
        updateReel: builder.mutation({
            query: (data)=>{
                const {episodeId, chapterId, reelId, body} = data
                return  {
                    url: `episodes/${episodeId}/chapters/${chapterId}/reels/${reelId}`,
                    method: "PUT",
                    body: body,
                }
            }
        }),
        deleteReels: builder.mutation({
            query: (data)=>{
                const {episodeId, chapterId, reelId} = data
                return  {
                    url: `episodes/${episodeId}/chapters/${chapterId}/reels/${reelId}`,
                    method: "DELETE",
                }
            }
        }),
    })
})

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const {
    useLogoutUserMutation,
    useGetEpisodesListMutation,
    useGetEpisodeChaptersListMutation,
    useGetEpisodeChapterDetailMutation,
    useGetEpisodesDetailMutation,
    useSaveEpisodesSheetMutation,
    useUpdateEpisodeChapterMutation,
    useDeleteEpisodesMutation,
    useGetReelsListMutation,
    useAddReelMutation,
    useDeleteReelsMutation,
    useUpdateReelMutation,
    useGetReelsDetailMutation,
  } = dataApi;