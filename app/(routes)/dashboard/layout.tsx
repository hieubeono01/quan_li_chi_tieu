"use client";
import React from "react";
import SideNav from "./_components/SideNav";
import DashboardHeader from "./_components/DashboardHeader";
import SnackbarWrapper from "../../_components/SnackbarWrapper";
import { createTheme, ThemeProvider } from "@mui/material/styles";

const theme = createTheme();
function DashboardLayout({ children }) {
  return (
    <ThemeProvider theme={theme}>
      <SnackbarWrapper>
        <div>
          <div className="fixed md:w-64 hidden md:block ">
            <SideNav />
          </div>
          <div className="md:ml-64">
            <DashboardHeader />
            {children}
          </div>
        </div>
      </SnackbarWrapper>
    </ThemeProvider>
  );
}

export default DashboardLayout;
