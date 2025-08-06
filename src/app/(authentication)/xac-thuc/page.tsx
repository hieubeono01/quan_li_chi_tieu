"use client";
import React, { useState } from "react";
import { Box, Button, TextField, Typography, Stack } from "@mui/material";
import { Google, Facebook, Email } from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import { useAuthState, useSignInWithGoogle, useSignInWithFacebook, useSignInWithEmailAndPassword } from "react-firebase-hooks/auth";
import { auth } from "../../../../firebase/client-config";
import { enqueueSnackbar, useSnackbar } from "notistack";
import Image from "next/image";

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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { enqueueSnackbar } = useSnackbar();
  const [user] = useAuthState(auth);
  const [signInWithGoogle, googleUser, googleLoading, googleError] = useSignInWithGoogle(auth);
  const [signInWithFacebook, facebookUser, facebookLoading, facebookError] = useSignInWithFacebook(auth);
  const [signInWithEmailAndPassword, emailUser, emailLoading, emailError] = useSignInWithEmailAndPassword(auth);

  const handleLoginWithGoogle = async () => {
    try {
      await signInWithGoogle();
      enqueueSnackbar("Đăng nhập thành công!", { variant: "success", autoHideDuration: 1500 });
      window.location.replace("/dashboard");
    } catch (error) {
      enqueueSnackbar("Đăng nhập thất bại. Vui lòng thử lại.", { variant: "error", autoHideDuration: 1500 });
    }
  };

  const handleLoginWithFacebook = async () => {
    try {
      await signInWithFacebook();
      enqueueSnackbar("Đăng nhập thành công!", { variant: "success", autoHideDuration: 1500 });
      window.location.replace("/dashboard");
    } catch (error) {
      enqueueSnackbar("Đăng nhập thất bại. Vui lòng thử lại.", { variant: "error", autoHideDuration: 1500 });
    }
  };

  const handleLoginWithEmail = async () => {
    try {
      await signInWithEmailAndPassword(email, password);
      enqueueSnackbar("Đăng nhập thành công!", { variant: "success", autoHideDuration: 1500 });
      window.location.replace("/dashboard");
    } catch (error) {
      enqueueSnackbar("Đăng nhập thất bại. Vui lòng thử lại.", { variant: "error", autoHideDuration: 1500 });
    }
  };

  return (
    <div className="flex h-screen bg-gray-900">
      <div className="flex bs-full items-center justify-center flex-1 min-bs-[100dvh] relative p-6 max-md:hidden">
        <img src="./7.png" alt="Illustration" className="w-96 scale-150" />
      </div>
      <div className="flex shadow-lg rounded-lg overflow-hidden bg-gray-800 h-screen w-2/6 max-w-8xl ml-auto">
        <div className="h-full w-full p-8 flex flex-col justify-end ml-auto">
          <h2 className="text-2xl font-semibold text-white mb-6">Welcome to mira! 👋</h2>
          <p className="text-gray-400 mb-4">Hãy đăng nhập account của bạn</p>
          <form>
            <div className="mb-4">
              <label className="block text-gray-300 mb-2">Email</label>
              <input type="email" className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="mb-4">
              <label className="block text-gray-300 mb-2">Password</label>
              <input type="password" className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <div className="flex justify-between items-center mb-6">
              <label className="flex items-center text-gray-400">
                <input type="checkbox" className="mr-2" /> Remember me
              </label>
              <a href="#" className="text-indigo-400 text-sm">
                Forgot password?
              </a>
            </div>
            <button className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg transition">Login</button>
          </form>
          <div className="mt-6 flex flex-col gap-2">
            <SocialButton variant="contained" size="large" sx={{ backgroundColor: "#116ADE" }} disabled={googleLoading} onClick={handleLoginWithGoogle}>
              <SocialBox>
                <Google />
              </SocialBox>
              <Typography>Google</Typography>
            </SocialButton>
            <SocialButton variant="contained" size="large" sx={{ backgroundColor: "#3b5998" }} disabled={facebookLoading} onClick={handleLoginWithFacebook}>
              <SocialBox>
                <Facebook />
              </SocialBox>
              <Typography>Facebook</Typography>
            </SocialButton>
          </div>
          <p className="text-gray-400 text-sm mt-6 text-center">
            New on our platform?{" "}
            <a href="#" className="text-indigo-400">
              Create an account
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthenticationPage;
