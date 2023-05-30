import {
  AppBar,
  Box,
  Grid
} from '@mui/material'

interface LayoutProps {
  children?: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <Box sx={{ minHeight: "100vh" }}>
      {children}
    </Box>
  );
}
