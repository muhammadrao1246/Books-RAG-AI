// import * as React from 'react';
// import { CloseOutlined } from '@mui/icons-material';
// import { IconButton, colors, useTheme } from '@mui/material';
import { closeSnackbar, enqueueSnackbar } from 'notistack';




export function ClosableToast(message, status, duration = 2000, props) {
    return enqueueSnackbar(message,{
        anchorOrigin: {vertical: "top", horizontal: "center"},
        autoHideDuration: duration,
        style: {
            zIndex: "10000 !important"
        },
        // action: key=>(
        //     <IconButton onClick={()=>closeSnackbar(key)}>
        //         <CloseOutlined />
        //     </IconButton>
        // ),
        variant: status,
        ...props
    })
}