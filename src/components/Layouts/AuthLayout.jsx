// AuthLayout.js
import React from 'react';
import { Outlet } from 'react-router-dom';


const AuthLayout = () => {
  
  const [loading, setLoading] = React.useState(false)

  return (
    <div className="app" style={{scrollBehavior:"smooth", overflow: "hidden"}}>
      {
        loading && (
          <div style={{alignItems: "center"}} className="flex gap-2 justify-center w-screen h-screen absolute z-50 backdrop-brightness-125 backdrop-blur-sm">
            <div className="w-5 h-5 rounded-full animate-pulse bg-blue-600"></div>
            <div className="w-5 h-5 rounded-full animate-pulse bg-blue-600"></div>
            <div className="w-5 h-5 rounded-full animate-pulse bg-blue-600"></div>
        </div>
        )
      }
      <Outlet context={{loader: [loading, setLoading]}} />
    </div>
  );
};

export default AuthLayout;
