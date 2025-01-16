"use client";
import { Box, Button, Stack, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import { Google, Phone } from "@mui/icons-material";
import FacebookOutlinedIcon from "@mui/icons-material/FacebookOutlined";
import Link from "next/link";
import { enqueueSnackbar, useSnackbar } from "notistack";
import { useState } from "react";
import { useLoadingCallback } from "react-loading-hook";
import { signInWithPopup, GoogleAuthProvider, FacebookAuthProvider } from "firebase/auth";
import { auth } from "../../../firebase/client-config"; // Đảm bảo import đúng đường dẫn tới firebase config

const SocialButton = styled(Button)(({ theme }) => ({
  lineHeight: "26px",
  fontSize: "14px",
  color: "#fff",
  padding: "7px",
  position: "relative",
  textTransform: "none",
  fontWeight: 600,
  borderRadius: "5px",
  boxShadow: "0 3px 1px -2px rgba(0,0,0,.2),0 2px 2px 0px rgba(0,0,0,.14),0 1px 5px 0px rgba(0,0,0,.12)",
}));

const SocialBox = styled(Box)(({ theme }) => ({
  borderRightWidth: "1px",
  borderRightStyle: "solid",
  position: "absolute",
  left: 0,
  top: 0,
  width: "48px",
  height: "100%",
  fontSize: "14px",
  borderRightColor: "rgba(0,0,0,.1)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  cursor: "pointer",
}));

const AuthenticationPage = () => {
  const [hasLogged, setHasLogged] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const [handleLoginWithGoogle, isGoogleLoading] = useLoadingCallback(async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      setHasLogged(true);
      enqueueSnackbar("Đăng nhập thành công!", {
        variant: "success",
        autoHideDuration: 1500,
      });
      // Có thể chuyển hướng người dùng sau khi đăng nhập thành công
      window.location.replace('/dashboard');
    } catch (error) {
      console.error(error);
      enqueueSnackbar("Đăng nhập thất bại. Vui lòng thử lại.", {
        variant: "error",
        autoHideDuration: 1500,
      });
    }
  });

  const [handleLoginWithFacebook, isFacebookLoading] = useLoadingCallback(async () => {
    try {
      const provider = new FacebookAuthProvider();
      const result = await signInWithPopup(auth, provider);
      setHasLogged(true);
      enqueueSnackbar("Đăng nhập thành công!", {
        variant: "success",
        autoHideDuration: 1500,
      });
      // Có thể chuyển hướng người dùng sau khi đăng nhập thành công
      window.location.replace('/dashboard');
    } catch (error) {
      console.error(error);
      enqueueSnackbar("Đăng nhập thất bại. Vui lòng thử lại.", {
        variant: "error",
        autoHideDuration: 1500,
      });
    }
  });

  return (
    <>
      <Box textAlign={"center"} fontWeight={700} lineHeight={"27.45px"} mb={"16px"}>
        <Typography component={"h1"} textTransform={"uppercase"} color={"#FFA600"} fontSize={"15px"} lineHeight={"18px"} mb={"6px"}>
          Bạn chưa đăng nhập
        </Typography>
        <Typography color={"#AFC536"} fontSize={"23px"}>
          Tạo Tài khoản mới hoặc Đăng nhập
        </Typography>
      </Box>
      <Typography fontSize={"13px"} lineHeight={"15.51px"} mb={"35px"} color={"#535353"}>
        Bằng việc{" "}
        <Typography component={"span"} color={"#AFC536"}>
          Tạo Tài khoản mới hoặc Đăng nhập
        </Typography>
        , bạn đã đồng ý với{" "}
        <Typography href={""} component={"a"} color="primary">
          Điều khoản người dùng
        </Typography>
      </Typography>
      <Stack gap={"9px"} mb={"30px"}>
        <SocialButton variant="contained" size="large" sx={{ backgroundColor: "#116ADE" }} disabled={isFacebookLoading || hasLogged} onClick={handleLoginWithFacebook}>
          <SocialBox>
            <FacebookOutlinedIcon />
          </SocialBox>
          <Typography>Facebook</Typography>
        </SocialButton>
        <SocialButton variant="contained" size="large" sx={{ backgroundColor: "#DB4B40" }} disabled={isGoogleLoading || hasLogged} onClick={handleLoginWithGoogle}>
          <SocialBox>
            <Google />
          </SocialBox>
          <Typography>Google</Typography>
        </SocialButton>
        <SocialButton href="/xac-thuc-so-dien-thoai" variant="contained" LinkComponent={Link} disabled={hasLogged} size="large" sx={{ backgroundColor: "#2F9D9A" }}>
          <SocialBox>
            <Phone />
          </SocialBox>
          <Typography>Số điện thoại</Typography>
        </SocialButton>
      </Stack>
    </>
  );
};

export default AuthenticationPage;
