"use client";
import React, { useEffect, useState } from "react";
import { useRedirect } from "../../../lib/useRedirect";
import { exitInAppBrowser } from "../../../lib/utils";
import { facebookAuth, googleAuth, setUserData } from "../../../services/auth.service";
import { Google, Phone } from "@mui/icons-material";
import FacebookOutlinedIcon from "@mui/icons-material/FacebookOutlined";
import { Box, Button, Container, Stack, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useSnackbar } from "notistack";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { enqueueSnackbar } from "notistack";
import { useLoadingCallback } from "react-loading-hook";
import Image from "next/image";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../../firebase/client-config";

// Styling for Social Button and Box
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
  const [user, loading, error] = useAuthState(auth);

  const searchParams = useSearchParams();
  const getQueryParams = () => {
    const queryParamString = new URLSearchParams(searchParams).toString();
    return queryParamString;
  };
  useEffect(() => {
    let url = `${window.location.origin}/xac-thuc?${getQueryParams()}`;
    exitInAppBrowser(url);
  }, []);
  // const refID = searchParams?.get("refID");
  useRedirect();
  console.log(user)
  const [handleLoginWithGoogle, isGoogleLoading, googleError] = useLoadingCallback(async () => {
    try {
      setHasLogged(false);
      const res = await googleAuth(); // Kết quả trả về từ googleAuth
      if (!res?.user) {
        throw new Error("Không nhận được thông tin người dùng");
      }

      const uid = await setUserData(res.user); // Thực thi `setUserData`
      console.log("User logged in with UID:", uid);
      setHasLogged(true);
      window.location.replace('/dashboard'); // Điều hướng khi thành công
    } catch (error) {
      console.error("Đăng nhập thất bại:", error);
      // Hiển thị thông báo lỗi cho người dùng
    }
  });

  const [handleLoginWithFacebook, isFacebookLoading, facebookError] = useLoadingCallback(async () => {
    // setHasLogged(false);
    // facebookAuth()
    //   .then((res) => {
    //     setHasLogged(true);
    //     // enqueueSnackbar("Hệ thống đang xác thực. Vui lòng chờ trong giây lát.", {
    //     //   variant: "success",
    //     //   autoHideDuration: 1500,
    //     // });
    //     // window.location.replace('/thong-tin-tai-khoan');
    //   })
    //   .catch((error) => {
    //     // enqueueSnackbar("Đã xảy ra lỗi. Vui lòng thử lại sau.", {
    //     //   variant: "error",
    //     //   autoHideDuration: 1500,
    //     // });
    //   });
    try {
      setHasLogged(false);
      const res = await facebookAuth(); // Kết quả trả về từ facebookAuth
      if (!res?.user) {
        throw new Error("Không nhận được thông tin người dùng");
      }

      const uid = await setUserData(res.user); // Thực thi `setUserData`
      console.log("User logged in with UID:", uid);
      setHasLogged(true);
      window.location.replace('/dashboard'); // Điều hướng khi thành công
    } catch (error) {
      console.error("Đăng nhập thất bại:", error);
      // Hiển thị thông báo lỗi cho người dùng
    }
  });

  return (
    <Stack direction="column" justifyContent="space-between" alignItems="stretch" spacing={2} height={"100vh"}>
      <Box overflow={"auto"} component="section" sx={{ flex: 1, marginTop: "0 !important" }}>
        <Container maxWidth={"xl"}>
          <Box mt={"17px"} mb={"34px"}>
            <Typography noWrap component="a" href="#app-bar-with-responsive-menu">
              <Image className="logo" src="/logo.png" alt="Logo" width={140} height={60} />
            </Typography>
          </Box>
          <Box component={"section"} textAlign={"center"} mb={"13px"} justifyItems={"center"}>
            <Image src={"/logo.png"} width={54} height={81.31} alt="Robot" />
          </Box>
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
            <SocialButton href={`/xac-thuc-so-dien-thoai?${getQueryParams()}`} variant="contained" LinkComponent={Link} disabled={hasLogged} size="large" sx={{ backgroundColor: "#2F9D9A" }}>
              <SocialBox>
                <Phone />
              </SocialBox>
              <Typography>Số điện thoại</Typography>
            </SocialButton>
          </Stack>
        </Container>
      </Box>
    </Stack>
  );
};

export default AuthenticationPage;
