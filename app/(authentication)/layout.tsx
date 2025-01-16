import { Box, Container, Stack, Typography } from "@mui/material";
import Image from "next/image";

export default function AuthenticationLayout({ children }: { children: React.ReactNode }) {
  return (
    <Stack direction="column" justifyContent="space-between" alignItems="stretch" spacing={2} height={"100vh"}>
      <Box overflow={"auto"} component="section" sx={{ flex: 1, marginTop: "0 !important" }}>
        <Container maxWidth={"xl"}>
          <Box mt={"17px"} mb={"34px"}>
            {/* <Typography noWrap component="a" href="#app-bar-with-responsive-menu">
              <Image className="logo" src="/img/logo.svg?v=101" alt="Logo" width={140} height={60} />
            </Typography> */}
          </Box>
          {/* <Box component={"section"} textAlign={"center"} mb={"13px"}>
            <Image src={"/img/robot.svg"} width={54} height={81.31} alt="Robot" />
          </Box> */}
          {children}
        </Container>
      </Box>
    </Stack>
  );
}
