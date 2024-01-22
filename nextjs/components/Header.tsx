import { useState } from "react";
import { Avatar, AppBar, Toolbar, Typography, Button, Menu, MenuItem, Box, Stack } from "@mui/material";
import Link from 'next/link';
import { RiGlobalLine } from "react-icons/ri";
import { ModalAuth } from "./ModalAuth";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { signOut } from "@/redux/features/auth";

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
    children: `${name.split(' ')[0][0]}${name.split(' ')[1][0]}`,
  };
}

export function Header() {
  const [shouldShowModalAuth, setShouldShowModalAuth] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const currentUser = useAppSelector((state) => state.auth.currentUser);
  const dispatch = useAppDispatch();

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleSignout = () => {
    dispatch(signOut());
    handleMenuClose();
    setShouldShowModalAuth(false)
  }

  return (
    <AppBar position="static">
      <ModalAuth isOpen={!currentUser && shouldShowModalAuth} onClose={handleMenuClose} />
      <Toolbar sx={{ justifyContent: "space-between" }}>
        <Link href="/" style={{ textDecoration: "none" }}>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, color: "#242424" }}>
            Orca News
          </Typography>
        </Link>
        <Stack direction="row">
          <Button color="inherit" onClick={handleMenuOpen}>
            <RiGlobalLine size={18} />
            <Typography>JA</Typography>
          </Button>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
          >
            <MenuItem onClick={handleSignout}>Signout</MenuItem>
          </Menu>
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
    </AppBar >
  );
}