import { useState } from "react";
import { Avatar, AppBar, Toolbar, Typography, Button, Menu, MenuItem as MenuItemCore, Box, Stack } from "@mui/material";
import Link from 'next/link';
import { RiGlobalLine } from "react-icons/ri";
import { ModalAuth } from "./ModalAuth";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { signOut } from "@/redux/features/auth";
import { useRouter } from "next/router";
import styled from "@emotion/styled"
import { outfit } from '@/font';

const MenuItem = styled(MenuItemCore)`
`

function stringToColor(string: string) {
  let hash = 0;
  let i;

  /* eslint-disable no-bitwise */
  for (i = 0; i < string.length; i += 1) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }

  let color = '#';

  for (i = 0; i < 3; i += 1) {
    const value = (hash >> (i * 8)) & 0xff;
    color += `00${value.toString(16)}`.slice(-2);
  }
  /* eslint-enable no-bitwise */

  return color;
}

function stringAvatar(name: string) {
  return {
    sx: {
      width: 32,
      height: 32,
      bgcolor: stringToColor(name),
      fontSize: 14,
    },
    children: `${name[0]}`,
  };
}

export function Header() {
  const [shouldShowModalAuth, setShouldShowModalAuth] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const currentUser = useAppSelector((state) => state.auth.currentUser);
  const dispatch = useAppDispatch();
  const router = useRouter();

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleModalAuthClose = () => {
    setShouldShowModalAuth(false);
  }

  const handleNavNote = () => {
    router.push("/note")
  }

  const handleNavPlan = () => {
    router.push("/plan")
  }

  const handleSignout = () => {
    dispatch(signOut());
    handleMenuClose();
    setShouldShowModalAuth(false)
  }

  return (
    <AppBar position="static">
      {shouldShowModalAuth && <ModalAuth isOpen={!currentUser && shouldShowModalAuth} onClose={handleModalAuthClose} />}
      <Toolbar sx={{ justifyContent: "space-between" }}>
        <Link href="/" style={{ textDecoration: "none" }}>
          <Stack direction="row" justifyContent="center" alignItems="center" spacing={1}>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1, color: "#242424" }}>
              Orca News
            </Typography>
            <Typography variant="caption" component="div" sx={{ flexGrow: 1, color: "#242424" }}>
              β版試験運転中
            </Typography>
          </Stack>
        </Link>
        <Stack direction="row" sx={{ alignItems: "center" }} spacing={1}>
          <Button color="inherit">
            <RiGlobalLine size={18} />
            <Typography>JA</Typography>
          </Button>
          {!currentUser &&
            <Button
              color="inherit"
              onClick={() => setShouldShowModalAuth(true)}
              variant="outlined"
            >
              Login
            </Button>
          }
          {currentUser && (
            <Avatar
              onClick={handleMenuOpen}
              alt={currentUser.username}
              {...stringAvatar(currentUser.username)}
              onClick={handleMenuOpen}
            />
          )}
        </Stack>
      </Toolbar>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        style={{ fontFamily: "Outfit" }}
        className={outfit.className}
      >
        <MenuItem
          onClick={handleNavNote}
          className={outfit.className}
        >
          復習ノート
        </MenuItem>
        <MenuItem
          onClick={handleNavPlan}
          className={outfit.className}
        >
          プラン
        </MenuItem>
        <MenuItem onClick={handleSignout} className={outfit.className}>ログアウト</MenuItem>
      </Menu>
    </AppBar >
  );
}