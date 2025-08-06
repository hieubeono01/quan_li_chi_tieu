import { Box, Container, Stack, Typography } from "@mui/material";
import Image from "next/image";

export default function AuthenticationLayout({ children }: { children: React.ReactNode }) {
  return (
    <Stack direction="column" justifyContent="space-between" alignItems="stretch" spacing={2} height={"100vh"}>
      <Box overflow={"auto"} component="section" sx={{ flex: 1, marginTop: "0 !important" }}>
        
          {children}
        
      </Box>
    </Stack>
  );
}
