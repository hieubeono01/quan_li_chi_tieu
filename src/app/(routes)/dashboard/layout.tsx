"use client";
import React, { useState } from "react";
import SideNav from "./_components/SideNav";
import DashboardHeader from "./_components/DashboardHeader";
import SnackbarWrapper from "../../_components/SnackbarWrapper";
import { createTheme, ThemeProvider as MuiThemeProvider } from "@mui/material/styles";
import { Menu } from "lucide-react";
import { ThemeProvider } from "../../_context/ThemeContext";

const theme = createTheme();

function DashboardLayout({ children }) {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  return (
    <MuiThemeProvider theme={theme}>
      <ThemeProvider>
        <SnackbarWrapper>
          <div className="relative min-h-screen bg-background text-text transition-colors duration-200">
            {/* Mobile Menu Button */}
            <button className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-md shadow-md" onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}>
              <Menu size={24} />
            </button>

            {/* Sidebar for both mobile and desktop */}
            <div
              className={`
              ${isMobileNavOpen ? "translate-x-0" : "-translate-x-full"}
              md:translate-x-0
              transition-transform duration-300
              fixed top-0 left-0 z-40 h-full w-64
            `}
            >
              <SideNav onClose={() => setIsMobileNavOpen(false)} />
            </div>

            {/* Overlay for mobile */}
            {isMobileNavOpen && <div className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30" onClick={() => setIsMobileNavOpen(false)} />}

            {/* Main Content */}
            <div className="md:ml-64">
              <DashboardHeader />
              <main className="">{children}</main>
            </div>
          </div>
        </SnackbarWrapper>
      </ThemeProvider>
    </MuiThemeProvider>
  );
}

export default DashboardLayout;
