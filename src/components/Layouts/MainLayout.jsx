// MainLayout.js
import React from 'react';
import { Outlet, ScrollRestoration } from "react-router-dom";
import { Suspense } from "react";

// import Sidebar from "src/components/layouts/Sidebar";
import Header from "src/components/layouts/Header";
// import LongLoader from 'src/components/global/LongLoader';


// import ScreenLoader from 'src/components/global/ScreenLoader';
import { ClosableToast } from 'src/components/global/Toast';



const MainLayout = () => {
  const [progress, setProgress] = React.useState(30)
  const [loading, setLoading] = React.useState(false)

  

  React.useEffect(()=>{
    document.onreadystatechange = (ev)=>{
      if (document.readyState == "complete") {
        setProgress(100)
      }
    }
  },[])
  
  return (
    <>
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
      <div className="w-screen h-full">        
        {/* shown for large data operation */}
        {/* {loading && <LongLoader />} */}
        {/* <Sidebar /> */}
        <div className="w-full h-full">
          <Header />
          {/* <Outlet /> */}
          {/* screen loader not configured currently */}
          <Suspense>
                    <Outlet context={{loader: [loading, setLoading], progress: [progress, setProgress]}}  />
          </Suspense>
          
        </div>
      </div>
    </div>
      {/* <ScrollRestoration /> */}
    </>
  );
};

export default MainLayout;
