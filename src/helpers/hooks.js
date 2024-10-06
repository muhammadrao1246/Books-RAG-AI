import { useSelector } from 'react-redux'
import { getAuthSelector } from 'src/services/authSlice'
import { getUserSelector } from '../services/userSlice'

// auth hook
export const useAuth = ()=>{
    const {access_token, } = useSelector(state=>getAuthSelector(state))

    return !!access_token
}


// custom hook to check user role
export const useUser = ()=>{
    const user = useSelector(state=>getUserSelector(state))

    return user
}



