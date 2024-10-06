import { Box } from "@mui/material";
import Header from "src/components/Layouts/Header/Header";

const Dashboard  = () => {
    return (
        <Box m="20px">
            <Box display="flex" justifyContent="space-between" alignItems="center">
                <Header title="Dashboard" subtitle="Welocome to Dashboard" />
            </Box>
        </Box>
    );
}

export default Dashboard;