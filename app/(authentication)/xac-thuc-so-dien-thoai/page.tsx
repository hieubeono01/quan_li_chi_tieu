"use client";
import React, { Suspense } from "react";
import { Box, Button, FormControl, Stack, TextField, Typography } from "@mui/material";
import KeyboardBackspaceOutlinedIcon from "@mui/icons-material/KeyboardBackspaceOutlined";
import Link from "next/link";
import { z } from "zod";
import { FormEvent, useEffect, useState } from "react";
import { phoneAuth } from "../../../services/auth.service";
import { ConfirmationResult } from "firebase/auth";
import { LoadingButton } from "@mui/lab";
import { useRedirect } from "../../../lib/useRedirect";
import { enqueueSnackbar } from "notistack";

const schemaPhone = z.object({
  phoneNumber: z
    .string({
      required_error: "Vui lòng nhập số điện thoại",
      invalid_type_error: "Vui lòng nhập số điện thoại",
    })
    .regex(/^(0|\+84|84)[1-9]{1}[0-9]{8,9}$/, "Số điện thoại không hợp lệ"),
});

const schemaOtp = z.object({
  otp: z.string({ required_error: "Vui lòng nhập OTP", invalid_type_error: "Vui lòng nhập OTP" }).regex(/^\d{6}$/, "Mã OTP không hợp lệ"),
});

// Separate component for the authentication content
const PhoneAuthContent = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOTP] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

  useRedirect();

  // Handle query params on the client side
  const getQueryParams = () => {
    if (typeof window !== "undefined") {
      return new URLSearchParams(window.location.search).toString();
    }
    return "";
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    try {
      let phone = phoneNumber;
      schemaPhone.parse({ phoneNumber: phone });
      if (phone?.charAt(0) === "0") {
        phone = phone?.substring(1);
      }
      phone = `+84${phone}`;
      phoneAuth("recaptcha-container", phone)
        .then((confirmationResult) => {
          setConfirmationResult(confirmationResult);
          setError(null);
          setLoading(false);
        })
        .catch((error) => {
          switch (error.code) {
            case "auth/invalid-phone-number": {
              setError("Số điện thoại không hợp lệ");
              break;
            }
            case "auth/too-many-requests": {
              setError("Bạn đã bị chặn do gửi quá nhiều yêu cầu. Vui lòng thử lại sau");
              break;
            }
            default: {
              setError(error?.message);
              break;
            }
          }
          setLoading(false);
        });
    } catch (error: any) {
      setError(error?.message);
      setLoading(false);
    }
  };

  const confirmOtp = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    try {
      if (!confirmationResult) {
        return;
      }
      confirmationResult
        .confirm(otp)
        .then(async (result) => {
          enqueueSnackbar("Hệ thống đang xác thực. Vui lòng chờ trong giây lát.", {
            variant: "success",
            autoHideDuration: 1500,
          });
        })
        .catch((error) => {
          switch (error.code) {
            case "auth/invalid-verification-code": {
              enqueueSnackbar("Mã OTP không hợp lệ.", {
                variant: "error",
                autoHideDuration: 1500,
              });
              break;
            }
            case "auth/code-expired": {
              enqueueSnackbar("Mã OTP đã hết hạn. Vui lòng thử lại.", {
                variant: "error",
                autoHideDuration: 1500,
              });
              break;
            }
            default:
              setError(error?.message);
              break;
          }
          setLoading(false);
        });
    } catch (error: any) {
      setError(error?.message);
      setLoading(false);
    }
  };

  const handleChangePhoneNumber = (event: any) => {
    try {
      const phoneNumber = event.target?.value;
      schemaPhone.parse({ phoneNumber });
      setPhoneNumber(phoneNumber);
      setError(null);
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleChangeOtp = (event: any) => {
    try {
      const otp = event.target?.value;
      schemaOtp.parse({ otp });
      setOTP(otp);
      setError(null);
    } catch (error: any) {
      setError(error.message);
    }
  };

  return (
    <>
      <div id="recaptcha-container" style={{ position: "fixed", top: "-99999px", left: "-99999px" }}></div>
      {!confirmationResult && (
        <>
          <Box textAlign={"center"} fontWeight={700} lineHeight={"27.45px"} mb={"16px"}>
            <Typography component={"h1"} textTransform={"uppercase"} color={"#FFA600"} fontSize={"15px"} lineHeight={"18px"} mb={"6px"}>
              Bạn chưa đăng nhập
            </Typography>
            <Typography color={"#AFC536"} fontSize={"23px"}>
              Bạn vui lòng nhập số điện thoại để lấy mã OTP
            </Typography>
          </Box>
          <Box component={"form"} onSubmit={onSubmit}>
            <FormControl fullWidth focused>
              <TextField type="text" variant="outlined" name="phoneNumber" onChange={handleChangePhoneNumber} inputProps={{ inputMode: "numeric" }} autoFocus focused sx={{ mb: "19px", fontSize: "18px", fontWeight: 600 }} placeholder="Số điện thoại của bạn" />
            </FormControl>
            <Stack gap={"9px"} mb={"30px"}>
              <LoadingButton type="submit" loading={loading} loadingPosition="end" variant="contained" size="large" color="primary" fullWidth>
                Tiếp theo
              </LoadingButton>
              <Button
                href="/xac-thuc"
                type="button"
                LinkComponent={Link}
                sx={{
                  lineHeight: "26px",
                  fontSize: "14px",
                  color: "#fff",
                  padding: "7px",
                  position: "relative",
                  textTransform: "none",
                  fontWeight: 600,
                  borderRadius: "5px",
                  boxShadow: "0 3px 1px -2px rgba(0,0,0,.2),0 2px 2px 0px rgba(0,0,0,.14),0 1px 5px 0px rgba(0,0,0,.12)",
                }}
                style={{ color: "black" }}
                variant="text"
                startIcon={<KeyboardBackspaceOutlinedIcon />}
              >
                Quay lại
              </Button>
            </Stack>
          </Box>
        </>
      )}
      {!!confirmationResult && (
        <>
          <Box textAlign={"center"} fontWeight={700} lineHeight={"27.45px"} mb={"16px"}>
            <Typography component={"h1"} textTransform={"uppercase"} color={"#FFA600"} fontSize={"15px"} lineHeight={"18px"} mb={"6px"}>
              Xác thực OTP
            </Typography>
            <Typography color={"#AFC536"} fontSize={"23px"}>
              Mã xác thực đã được gửi qua số điện thoại của bạn
            </Typography>
          </Box>
          <Box component={"form"} onSubmit={confirmOtp}>
            <FormControl fullWidth focused>
              <TextField type="text" variant="outlined" name="otp" onChange={handleChangeOtp} inputProps={{ inputMode: "numeric" }} autoFocus focused sx={{ mb: "19px", fontSize: "18px", fontWeight: 600 }} placeholder="Mã OTP" />
            </FormControl>
            <Stack gap={"9px"} mb={"30px"}>
              <LoadingButton type="submit" loading={loading} loadingPosition="end" variant="contained" size="large" color="primary" fullWidth>
                Gửi
              </LoadingButton>
              <Button
                href={`/xac-thuc?${getQueryParams()}`}
                type="button"
                LinkComponent={Link}
                sx={{
                  lineHeight: "26px",
                  fontSize: "14px",
                  color: "#fff",
                  padding: "7px",
                  position: "relative",
                  textTransform: "none",
                  fontWeight: 600,
                  borderRadius: "5px",
                  boxShadow: "0 3px 1px -2px rgba(0,0,0,.2),0 2px 2px 0px rgba(0,0,0,.14),0 1px 5px 0px rgba(0,0,0,.12)",
                }}
                style={{ color: "black" }}
                variant="text"
                startIcon={<KeyboardBackspaceOutlinedIcon />}
              >
                Quay lại
              </Button>
            </Stack>
          </Box>
        </>
      )}
    </>
  );
};

// Main component with Suspense boundary
const SignInPhonePage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PhoneAuthContent />
    </Suspense>
  );
};

export default SignInPhonePage;
