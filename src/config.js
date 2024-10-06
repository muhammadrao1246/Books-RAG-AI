// CONFIG VARIABLES
export const {
    VITE_APP_BACKEND_SERVER, // Backend Django Server Address
    // system security keys for password based authentication
    VITE_DEFAULT_AUTH_CLIENT_KEY,
    VITE_DEFAULT_AUTH_CLIENT_SECRET,
    // facebook consent credentials
    VITE_SOCIAL_AUTH_FACEBOOK_KEY,
    VITE_SOCIAL_AUTH_FACEBOOK_SECRET,
    // google consent oauth2 credentials
    VITE_SOCIAL_AUTH_GOOGLE_OAUTH2_KEY,
    VITE_SOCIAL_AUTH_GOOGLE_OAUTH2_SECRET
} = import.meta.env
