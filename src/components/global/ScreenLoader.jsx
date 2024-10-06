
import { Box } from '@mui/material';
import React from 'react';

export default function ScreenLoader(){
    return (
      <>
      {/* preloader */}
      <Box
            id="loading"
            style={{ backgroundImage: "url('/icons/logo512.png')" }}
          >
            <div id="loading-center"></div>
          </Box>
      </>
    )
  }
