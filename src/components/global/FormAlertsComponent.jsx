import { Alert } from '@mui/material'
import React from 'react'

function FormAlertsComponent ({type, message, sx}) {
  return (
    <Alert severity={type === "success" ? "success" : "error"} sx={sx} variant='outlined' >
        {
            type !== "non_field_errors" && type !== "success" ? (
                <>
                {
                    message.map(mItem=>(
                        <>
                        {type}: {mItem}
                        </>
                    ))
                }
                </>
            ):(
                <>
                {message[0]}
                </>
            )
        }
    </Alert>
  )
}

export default FormAlertsComponent 