import { AppBar, Toolbar, Typography, Button } from "@mui/material";
import Link from 'next/link';

export function Header() {
  return (
    <AppBar position="static">
      <Toolbar sx={{ justifyContent: "space-between" }}>
        <Link href="/" style={{ textDecoration: "none" }}>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, color: "#242424" }}>
            Orca News
          </Typography>
        </Link>
        <Button color="inherit">Login</Button>
      </Toolbar>
    </AppBar>
  )
}