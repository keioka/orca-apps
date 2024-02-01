import React, { useState } from 'react';
import { Modal, Button, Box, TextField, Stack, Typography } from '@mui/material';
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { signUpWithGoogle, loginWithGoogle } from "@/redux/features/auth";
import { IoClose } from "react-icons/io5";
import GoogleLogo from "@/assets/images/google.svg"
import Image from 'next/image';
import { outfit } from '@/font'

export function ModalAuth({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [isSignup, setIsSignup] = useState(false);
  const dispatch = useAppDispatch();
  const errorSignupMessage = useAppSelector((state) => state.auth.errorSignupMessage);

  function onClickGoogleSignup() {
    dispatch(signUpWithGoogle());
  }

  function onClickGoogleLogin() {
    dispatch(loginWithGoogle());
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
        <Box onClick={onClose}>
          <IoClose size={24} style={{ position: "absolute", top: 32, left: 32, cursor: "pointer" }} />
        </Box>
        <Box padding={2}>
          {isSignup && (
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
                Sign up
              </Typography>
              <Stack spacing={1}>
                <Button variant='contained' onClick={onClickGoogleSignup} size='large'>
                  <Image
                    src={GoogleLogo}
                    alt="Google logo"
                    width={24}
                    height={24}
                  />
                  Sign up with Google
                </Button>
                <Button onClick={toggleSignup}>Login</Button>
              </Stack>
            </Stack>
          )}

          {!isSignup &&
            <Stack
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "center",
              }}
              spacing={2}
            >
              <Typography variant='h5'>Login</Typography>
              <Stack spacing={1}>
                <Button
                  variant='outlined'
                  onClick={onClickGoogleLogin}
                  sx={{
                    background: "#fff",
                    fontFamily: "--var(font-outfit)"
                  }}
                  size='large'
                >
                  <Image
                    src={GoogleLogo}
                    alt="Google logo"
                    width={24}
                    height={24}
                  />
                  Login with Google
                </Button>
                <Button onClick={toggleSignup}>Create a new account</Button>
                <Typography>{errorSignupMessage}</Typography>
              </Stack>
            </Stack>
          }
        </Box>
      </Box>
    </Modal >
  );
}
