import React, { useEffect, useState } from 'react';
import { Modal, Button, Box, Alert, Stack, Typography } from '@mui/material';
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { signUpWithGoogle, loginWithGoogle } from "@/redux/features/auth";
import { IoClose } from "react-icons/io5";
import GoogleLogo from "@/assets/images/google.svg"
import Image from 'next/image';
import { outfit } from '@/font'
import mixpanel from "mixpanel-browser";

const locale = {

}
export function ModalAuth({ isOpen, onClose, alert }: { isOpen: boolean, onClose: () => void }) {
  const [isSignup, setIsSignup] = useState(false);
  const [isInvalidBrowser, setIsInvalidBrowser] = useState(false)

  const dispatch = useAppDispatch();
  const errorSignupMessage = useAppSelector((state) => state.auth.errorSignupMessage);

  useEffect(() => {
    console.log("userAgent", window.navigator.userAgent)
    if (window && window.navigator) {
      setIsInvalidBrowser(
        window.navigator.userAgent.toLowerCase().includes("line") ||
        window.navigator.userAgent.toLowerCase().includes("instagram") ||
        window.navigator.userAgent.toLowerCase().includes("facebook")
      )
    }
  }, [])

  function onClickGoogleSignup() {
    dispatch(signUpWithGoogle());
    mixpanel.track("SignUp");
  }

  function onClickGoogleLogin() {
    dispatch(loginWithGoogle());
    mixpanel.track("Login");
  }

  function onCopyUrl() {
    navigator.clipboard.writeText(window.location.href)
  }

  function toggleSignup() {
    setIsSignup(!isSignup);
  }

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      className={outfit.className}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        fontFamily: "--var(font-outfit)"
      }}
    >


      <Box
        style={{
          width: "100%",
          height: "100%",
          background: "#fff",
          borderRadius: 8,
          padding: 24,
          boxSizing: "border-box",
        }}
      >


        <>
          <Box onClick={onClose}>
            <IoClose size={24} style={{ position: "absolute", top: 32, left: 32, cursor: "pointer" }} />
          </Box>
          <Box padding={2}>
            {
              alert && (
                <Box mb={2}>
                  <Alert mb={4} color="error">
                    {alert}
                  </Alert>
                </Box>
              )
            }
            {isInvalidBrowser && (
              <Stack sx={{ display: "flex", justifyContent: "center", alignItems: "center" }} spacing={2} mt={3}>
                <Typography>LINE内ブラウザではログインできません。他のブラウザをご利用ください。</Typography>
                <Button onClick={onCopyUrl} variant="outlined">URLをコピーする</Button>
              </Stack>
            )}

            {!isInvalidBrowser && isSignup && (
              <Stack
                style={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "center",
                }}
                spacing={2}
              >
                <Typography
                  variant='h5'
                  sx={{
                    fontFamily: "--var(font-outfit)"
                  }}
                >
                  サインアップ
                </Typography>
                <Stack spacing={1}>
                  <Button variant='contained' onClick={onClickGoogleSignup} size='large' sx={{ color: "#fff" }}>
                    <Image
                      src={GoogleLogo}
                      alt="Google logo"
                      width={24}
                      height={24}
                    />
                    Googleでサインアップ
                  </Button>
                  <Button onClick={toggleSignup}>すでにアカウントをお持ちの方</Button>
                </Stack>
              </Stack>
            )}

            {!isInvalidBrowser && !isSignup &&
              <Stack
                style={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "center",
                }}
                spacing={2}
              >
                <Typography variant='h5'>ログイン</Typography>
                <Stack spacing={1}>
                  <Button
                    variant='outlined'
                    onClick={onClickGoogleLogin}
                    sx={{
                      background: "#fff",
                      fontFamily: "--var(font-outfit)",
                    }}
                    size='large'
                  >
                    <Image
                      src={GoogleLogo}
                      alt="Google logo"
                      width={24}
                      height={24}
                    />
                    Googleでログイン
                  </Button>
                  <Button onClick={toggleSignup}>アカウント新規作成</Button>
                  <Typography>{errorSignupMessage}</Typography>
                </Stack>
              </Stack>
            }
            <Typography sx={{ fontSize: 12, color: "#aaaaaa" }}>{window.navigator.userAgent}</Typography>
          </Box>
        </>
      </Box>
    </Modal >
  );
}
