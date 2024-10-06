import { ArrowBackIosNewOutlined, ArrowBackIosNewRounded, ArrowBackOutlined, ArrowBackTwoTone } from "@mui/icons-material";
import { Typography, Box, useTheme, IconButton, Button } from "@mui/material";
import React from "react";
import { Link } from "react-router-dom";
import { tokens } from "src/theme";

const Header = ({title, subtitle, backButtonRoute}) => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    
    const [show, setShow] = React.useState(false)
    return (
      <Box mb="30px">
        <Box display="flex" gap="10px" alignItems="center" sx={{ mb: "5px" }} >
          
          <Typography
            variant="h2"
            color={colors.grey[100]}
            fontWeight="bold"
          >
            {title}
          </Typography>
          {
            !!backButtonRoute && (
                <IconButton size="large" color={colors.grey[300]} LinkComponent={Link} to={"/episodes"} >
                    <ArrowBackTwoTone fontSize="h2" />
                </IconButton>
            )
          }
        </Box>
        <Typography variant="h5" color={colors.greenAccent[400]}>
          {subtitle}
        </Typography>
      </Box>
    );
}

export default Header;