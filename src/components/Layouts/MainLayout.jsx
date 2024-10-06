// MainLayout.js
import React from 'react';
import { Outlet, ScrollRestoration } from "react-router-dom";
import { Suspense } from "react";

import Sidebar from "src/components/Layouts/ProSidebar";
import Topbar from "src/components/Layouts/Topbar";
import LongLoader from 'src/components/global/LongLoader';

import LoadingBar from 'react-top-loading-bar'
import ScreenLoader from 'src/components/global/ScreenLoader';
import { ClosableToast } from '../global/Toast';



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
  // ClosableToast("kjjkjk", "success", 10000)
  return (
    <>
    {/* not used currently */}
    <LoadingBar
          color="var(--bg-primary)"
          progress={progress}
          height={5}
          // ref={loader}
          onLoaderFinished={()=>setProgress(0)}
        />
    <div className="app" style={{scrollBehavior:"smooth", overflow: "hidden"}}>
      <Sidebar />
      {/* shown for large data operation */}
      {loading && <LongLoader />}
  {/* <LongLoader /> */}
      <main className="content" style={{overflow: "auto", position: "relative", marginLeft: "-1px"}}>
        <Topbar />
        {/* screen loader not configured currently */}
        <Suspense  fallback={<ScreenLoader />}>
                  <Outlet context={{loader: [loading, setLoading], progress: [progress, setProgress]}}  />
        </Suspense>
      </main>
    </div>
      {/* <ScrollRestoration /> */}
    </>
  );
};

export default MainLayout;
