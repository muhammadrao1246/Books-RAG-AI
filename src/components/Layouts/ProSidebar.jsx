import { useEffect, useState } from "react";
import { Sidebar, Menu, MenuItem } from "react-pro-sidebar";
import { Box, IconButton, Typography, useTheme } from "@mui/material";
import { Link, useLocation } from "react-router-dom";
// import "react-pro-sidebar/dist/css/styles.css";
import { tokens } from "src/theme";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined";
import ContactsOutlinedIcon from "@mui/icons-material/ContactsOutlined";
import OndemandVideoOutlinedIcon from '@mui/icons-material/OndemandVideoOutlined';
import ReceiptOutlinedIcon from "@mui/icons-material/ReceiptOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined";
import BarChartOutlinedIcon from "@mui/icons-material/BarChartOutlined";
import PieChartOutlineOutlinedIcon from "@mui/icons-material/PieChartOutlineOutlined";
import TimelineOutlinedIcon from "@mui/icons-material/TimelineOutlined";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import MapOutlinedIcon from "@mui/icons-material/MapOutlined";
import { VideoSettingsOutlined } from "@mui/icons-material";
import { useUser } from "src/helpers/hooks";
import { capitalize } from "lodash";
import { ROUTES } from "src/routes";

const Item = ({ title, to, icon, selected, setSelected }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  return (
    <MenuItem
      active={selected}
      style={{
        color: "#e0e0e0",
      }}
      // onClick={() => setSelected(to)}
      icon={icon}
      component={<Link to={to} />}
    >
      <Typography>{title}</Typography>
    </MenuItem>
  );
};

const HasBaseAddress = (currentRoute, route)=>{
  console.log(currentRoute, route)
  const slice = currentRoute.slice(0, route.length)
  return  slice === route
}

const ProSidebar = () => {
  const theme = useTheme();
  const currentLocation = useLocation().pathname

  const colors = tokens(theme.palette.mode);
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  // const [selected, setSelected] = useState(ROUTES.DASHBOARD);
  
  const currentUser = useUser()
  
  return (
    <Box
      sx={{
        "& .MuiBox-root": {
          background: `#3f0e40 !important`,
        },
        "& .ps-sidebar-container": {
          background: `#3f0e40 !important`,
        },
        "& .ps-sidebar-root": {
          borderColor: "transparent !important",
        },
        "& .pro-icon-wrapper": {
          backgroundColor: "transparent !important",
        },
        "& .ps-menu-button": {
          padding: "5px 20px 5px 20px !important",
        },
        "& .ps-menu-button:hover": {
          color: "#7d3986 !important",
          backgroundColor: "transparent !important",
        },
        "& .ps-menu-button.ps-active": {
          color: "#e0e0e0 !important",
          backgroundColor: "#7d3986 !important",
          borderRadius: "10px",
        },
      }}
    >
      <Sidebar collapsed={isCollapsed} style={{height: "100%"}}>
        <Menu iconShape="square">
          {/* LOGO AND MENU ICON */}
          <MenuItem
            onClick={() => setIsCollapsed(!isCollapsed)}
            icon={isCollapsed ? <MenuOutlinedIcon /> : undefined}
            style={{
              margin: "10px 0 20px 0",
              color: "#e0e0e0",
            }}
          >
            {!isCollapsed && (
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                ml="15px"
              >
                <Typography variant="h3" color="#e0e0e0">
                  Podcast
                </Typography>
                <IconButton onClick={() => setIsCollapsed(!isCollapsed)}>
                  <MenuOutlinedIcon sx={{ color:"#e0e0e0" }} />
                </IconButton>
              </Box>
            )}
          </MenuItem>

          {!isCollapsed && (
            <Box mb="25px">
              <Box display="flex" justifyContent="center" alignItems="center">
                <img
                  alt="profile-user"
                  width="100px"
                  height="100px"
                  // src={`/images/user.png`}
                  src={currentUser.profile_image}
                  style={{ cursor: "pointer", borderRadius: "50%" }}
                />
              </Box>
              <Box textAlign="center">
                <Typography
                  variant="h3"
                  color= "#e0e0e0"
                  fontWeight="bold"
                  sx={{ m: "10px 0 0 0" }}
                >
                  {capitalize( currentUser.fullname )}
                </Typography>
                {/* <Typography variant="h5" color={colors.greenAccent[500]}>
                  Podcast Admin
                </Typography> */}
              </Box>
            </Box>
          )}

          <Box padding={isCollapsed ? undefined : "5%"}>
            <Item
              title="Dashboard"
              to={ROUTES.DASHBOARD}
              icon={<HomeOutlinedIcon />}
              selected={HasBaseAddress(currentLocation, ROUTES.DASHBOARD)}
              // setSelected={setSelected}
            />

            {/* <Typography
              variant="h6"
              color={colors.grey[300]}
              sx={{ m: "15px 0 5px 20px" }}
            >
              Data
            </Typography> */}
            <Item
              title="Manage Team"
              to={ROUTES.TEAM}
              icon={<PeopleOutlinedIcon />}
              selected={HasBaseAddress(currentLocation, ROUTES.TEAM)}
              // setSelected={setSelected}
            />
            <Item
              title="Guests"
              to={ROUTES.GUESTS}
              icon={<ContactsOutlinedIcon />}
              selected={HasBaseAddress(currentLocation, ROUTES.GUESTS)}
              // setSelected={setSelected}
            />
            <Item
              title="Episodes"
              to={ROUTES.EPISODES}
              icon={<OndemandVideoOutlinedIcon />}
              selected={HasBaseAddress(currentLocation, ROUTES.EPISODES)}
              // setSelected={setSelected}
            />
            <Item
              title="Builder"
              to={ROUTES.BUILDER}
              icon={<VideoSettingsOutlined />}
              selected={HasBaseAddress(currentLocation, ROUTES.BUILDER)}
              // setSelected={setSelected}
            />
            {/* <Item
              title="Invoices Balances"
              to="/invoices"
              icon={<ReceiptOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />

            <Typography
              variant="h6"
              color={colors.grey[300]}
              sx={{ m: "15px 0 5px 20px" }}
            >
              Pages
            </Typography>
            <Item
              title="Profile Form"
              to="/form"
              icon={<PersonOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />
            <Item
              title="Calendar"
              to="/calendar"
              icon={<CalendarTodayOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />
            <Item
              title="FAQ Page"
              to="/faq"
              icon={<HelpOutlineOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />

            <Typography
              variant="h6"
              color={colors.grey[300]}
              sx={{ m: "15px 0 5px 20px" }}
            >
              Charts
            </Typography>
            <Item
              title="Bar Chart"
              to="/bar"
              icon={<BarChartOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />
            <Item
              title="Pie Chart"
              to="/pie"
              icon={<PieChartOutlineOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />
            <Item
              title="Line Chart"
              to="/line"
              icon={<TimelineOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />
            <Item
              title="Geography Chart"
              to="/geography"
              icon={<MapOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            /> */}
          </Box>
        </Menu>
      </Sidebar>
    </Box>
  );
};

export default ProSidebar;