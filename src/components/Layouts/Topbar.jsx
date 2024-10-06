import { Box, IconButton, useTheme} from "@mui/material";
import React, { useContext } from "react";
import { ColorModeContext, tokens } from "src/theme";
import InputBase from "@mui/material/InputBase";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import SearchIcon from "@mui/icons-material/Search";

import Tooltip from '@mui/material/Tooltip';
import { AccountMenu } from "../global/Menus";

const Topbar  = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const colorMode = useContext(ColorModeContext);

    const [open, setOpen] = React.useState(null)
    const [anchorEl, setAnchorEl] = React.useState(null);

    const openMenu = React.useCallback((e, menu_name)=>{
        setAnchorEl(event.target);
        setOpen(menu_name)
        
    },[])

    const closeMenu = React.useCallback((e)=>{
        setAnchorEl(null)
        setOpen(null)
    },[])

    return (
        <Box display="flex" justifyContent="space-between" p={2} backgroundColor="#350d36">
            {/* Search Bar */}
            <Box
             display="flex"
             justifyContent="center"
             alignItems="center"
             width="100%"
            >
<Box 
            display="flex" 
            backgroundColor="#653e66"
            borderRadius="5px"
            width="50%"
            height="30px"
            >
                <InputBase size="medium" sx={{ ml: 2, flex: 1, color: "#e0e0e0" }} placeholder="Search" />
                <IconButton type="button" sx={{ p: 1}}>
                    <SearchIcon sx={{ color: "#e0e0e0" }}/>
                </IconButton>
            </Box>
            </Box>
            {/* Icons */}
            <Box display="flex">
                <IconButton onClick={()=>colorMode.toggleColorMode()}>
                    {theme.palette.mode === 'dark' ? (
                        <LightModeOutlinedIcon sx={{ color:"#e0e0e0" }} />
                    ) : (
                        <DarkModeOutlinedIcon sx={{ color:"#e0e0e0" }} />
                    )}
                    
                </IconButton>
                <IconButton>
                    <NotificationsOutlinedIcon sx={{ color:"#e0e0e0" }} />
                </IconButton>
                <IconButton>
                    <SettingsOutlinedIcon sx={{ color:"#e0e0e0" }} />
                </IconButton>
                <IconButton onClick={e=>openMenu(e, "account-menu")}>
                    <PersonOutlinedIcon sx={{ color:"#e0e0e0" }} />
                </IconButton>
            </Box>
            {
                anchorEl !== null && (
                    <>
                    <AccountMenu anchorEl={anchorEl} open={open === "account-menu"} onClose={closeMenu} />
                    </>
                )
            }
            
        </Box>
    );
}

export default Topbar;