import React from 'react'

import "src/assets/css/report-loader.css"
import { Box } from '@mui/material';

function LongLoader() {
  return (
    // <div className="report-loader"></div>
    <Box bgcolor={"rgba(1, 1, 1, .5)"} width={"100vw"} height={"100vh"} zIndex={1350} display={"flex"} justifyContent={"center"} alignItems={"center"} position={"fixed"}>
      <div className="report-loader">
      <div className="loader_cogs">
        <div className="loader_cogs__top">
          <div className="top_part"></div>
          <div className="top_part"></div>
          <div className="top_part"></div>
          <div className="top_hole"></div>
        </div>
        <div className="loader_cogs__left">
          <div className="left_part"></div>
          <div className="left_part"></div>
          <div className="left_part"></div>
          <div className="left_hole"></div>
        </div>
        <div className="loader_cogs__bottom">
          <div className="bottom_part"></div>
          <div className="bottom_part"></div>
          <div className="bottom_part"></div>
          <div className="bottom_hole"></div>
        </div>
      </div>
    </div>
    </Box>
  );
}

export default LongLoader