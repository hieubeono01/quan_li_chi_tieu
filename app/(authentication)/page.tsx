// import BottomNav from "@/app/components/bottom-nav/bottom-nav.component";
import React from "react";
import { Box, Container, Stack, Typography } from "@mui/material";
import Image from "next/image";
import { SnackbarProvider } from "notistack";
// import CompanyInfo from "../components/company-info/company-info.component";

export default function AuthenticationLayout({ children }: { children: React.ReactNode }) {
  return (
    <Stack direction="column" justifyContent="space-between" alignItems="stretch" spacing={2} height={"100vh"}>
      <Box overflow={"auto"} component="section" sx={{ flex: 1, marginTop: "0 !important" }}>
        <Container maxWidth={"xl"}>
          {children}
          {/* <CompanyInfo /> */}
        </Container>
      </Box>
      {/* <BottomNav /> */}
    </Stack>
  );
}
