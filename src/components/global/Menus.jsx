import React from "react";

import { Menu, MenuItem, ListItemIcon, Avatar, Divider } from "@mui/material";
import PersonAdd from "@mui/icons-material/PersonAdd";
import Settings from "@mui/icons-material/Settings";
import Logout from "@mui/icons-material/Logout";
import { persistor } from "src/services/store";
import { ROUTES } from "src/routes";
import { ClosableToast } from "./Toast";
import { useLogoutUserMutation } from "src/services/api";



export function AccountMenu({ anchorEl, onClose, open }) {
    
    const [logoutUser, {isLoading}] = useLogoutUserMutation()
    const handleLogout = async ()=>{
        const response = await logoutUser()
        
        ClosableToast("Logged Out Successfully! Redirecting...", "success", 2000)
        persistor.purge()
        setTimeout(() => {
            window.location.href = ROUTES.LOGIN    
        }, 2000);
        
    }

    return (
    <Menu
      anchorEl={anchorEl}
      id="account-menu"
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          elevation: 0,
          sx: {
            overflow: "visible",
            filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
            mt: 2.5,
            "& .MuiAvatar-root": {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
            "&::before": {
              content: '""',
              display: "block",
              position: "absolute",
              top: 0,
              right: 5,
              width: 10,
              height: 10,
              bgcolor: "background.paper",
              transform: "translateY(-50%) rotate(45deg)",
              zIndex: 0,
            },
          },
        },
      }}
      transformOrigin={{ horizontal: "right", vertical: "top" }}
      anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
    >
      {/* <MenuItem onClick={onClose}>
        <Avatar /> Profile
      </MenuItem>
      <MenuItem onClick={onClose}>
        <Avatar /> My account
      </MenuItem>
      <Divider />
      <MenuItem onClick={onClose}>
        <ListItemIcon>
          <PersonAdd fontSize="small" />
        </ListItemIcon>
        Add another account
      </MenuItem>
      <MenuItem onClick={onClose}>
        <ListItemIcon>
          <Settings fontSize="small" />
        </ListItemIcon>
        Settings
      </MenuItem> */}
      <MenuItem onClick={()=>{onClose();handleLogout();}}>
        <ListItemIcon>
          <Logout fontSize="small" />
        </ListItemIcon>
        Logout
      </MenuItem>
    </Menu>
  );
}
