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
import { useTranslation } from 'next-i18next'

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
  const [anchorLocaleEl, setAnchorLocaleEl] = useState(null);
  const currentUser = useAppSelector((state) => state.auth.currentUser);
  const dispatch = useAppDispatch();
  const router = useRouter();

  const { t, i18n } = useTranslation('common')

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLocaleOpen = (event) => {
    setAnchorLocaleEl(event.currentTarget);
  };

  const handleLocaleClose = () => {
    setAnchorLocaleEl(null);
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

  const handleClickLocales = (locale) => {
    router.push({
      route: router.route,
      query: router.query
    }, router.asPath, { locale });
    i18n.changeLanguage(locale)
  }

  return (
    <AppBar position="static">
      {shouldShowModalAuth && <ModalAuth isOpen={!currentUser && shouldShowModalAuth} onClose={handleModalAuthClose} />}
      <Toolbar sx={{ justifyContent: "space-between" }}>
        <Link href="/" style={{ textDecoration: "none" }}>
          <Stack direction="row" justifyContent="center" alignItems="center" spacing={1}>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1, color: "#242424" }}>
              {t("appName")}
            </Typography>
            <Typography variant="caption" component="div" sx={{ flexGrow: 1, color: "#242424" }}>
              {t("appStatus")}
            </Typography>
          </Stack>
        </Link>
        <Stack direction="row" sx={{ alignItems: "center" }} spacing={1}>
          <Button color="inherit" onClick={handleLocaleOpen}>
            <RiGlobalLine size={18} />
            <Typography>{i18n.language && i18n.language.toUpperCase()}</Typography>
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
          {t("reviewNotes")}
        </MenuItem>
        <MenuItem
          onClick={handleNavPlan}
          className={outfit.className}
        >
          {t("plan")}
        </MenuItem>
        <MenuItem onClick={handleSignout} className={outfit.className}>{t("logout")}</MenuItem>
      </Menu>
      <Menu
        anchorEl={anchorLocaleEl}
        open={Boolean(anchorLocaleEl)}
        onClose={handleLocaleClose}
        style={{ fontFamily: "Outfit" }}
        className={outfit.className}
      >
        <MenuItem
          onClick={() => handleClickLocales("ja")}
          className={outfit.className}
        >
          日本語
        </MenuItem>
        <MenuItem
          onClick={() => handleClickLocales("en")}
          className={outfit.className}
        >
          English
        </MenuItem>
      </Menu>
    </AppBar >
  );
}