const storeToken = (value) => {
    if (value) {
      // console.log("Store Token")
      const { access_token, refresh_token } = value
      localStorage.setItem('access_token', access_token)
      localStorage.setItem('refresh_token', refresh_token)
    }
  }
  
  const getToken = () => {
    let access_token = localStorage.getItem('access_token')
    let refresh_token = localStorage.getItem('refresh_token')
    return { access_token, refresh_token }
  }
  
  const removeToken = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
  }
  
  export { storeToken, getToken, removeToken }