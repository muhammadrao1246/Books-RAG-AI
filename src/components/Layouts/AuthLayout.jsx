// AuthLayout.js
import React from 'react';
import { Outlet } from 'react-router-dom';


const AuthLayout = () => {
  return (
    <div className="app" style={{scrollBehavior:"smooth", overflow: "hidden"}}>
      <div className="auth-layout" >
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;
