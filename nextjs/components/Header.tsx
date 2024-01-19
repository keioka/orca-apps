import { useState } from "react";
import { AppBar, Toolbar, Typography, Button, Menu, MenuItem, Box } from "@mui/material";
import Link from 'next/link';
import { RiGlobalLine } from "react-icons/ri";

export function Header() {
  const [showMenu, setShowMenu] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <AppBar position="static">
      <Toolbar sx={{ justifyContent: "space-between" }}>
        <Link href="/" style={{ textDecoration: "none" }}>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, color: "#242424" }}>
            Orca News
          </Typography>
        </Link>
        <Box>
          <Button color="inherit" onClick={handleMenuOpen}>
            <RiGlobalLine size={18} />
            <Typography>JA</Typography>
          </Button>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
          // onClose={handleMenuClose}
          >
            <MenuItem onClick={handleMenuClose}>Option 1</MenuItem>
            <MenuItem onClick={handleMenuClose}>Option 2</MenuItem>
            <MenuItem onClick={handleMenuClose}>Option 3</MenuItem>
          </Menu>
          <Button
            color="inherit"
            // onClick={handleMenuOpen}
            variant="outlined"
          >
            Login
          </Button>
        </Box>
      </Toolbar>
    </AppBar >
  );
}