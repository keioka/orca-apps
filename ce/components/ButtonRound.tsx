import React from 'react';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

export const ButtonRound = ({ isActive, onClick, children }) => (
  <Button
    sx={{
      background: 'rgba(0,0,0,0.1)',
      borderRadius: '64px',
      padding: '6px 12px',
      backgroundColor: isActive ? '#3c223c' : 'rgba(0,0,0,0.1)',
      '&:hover': {
        backgroundColor: isActive ? '#3c223c' : 'rgba(0,0,0,0.1)',
      },
    }}
    onClick={onClick}
  >
    <Typography
      variant="caption"
      component="h6"
      sx={{ fontSize: 12, color: isActive ? '#fff' : '#787c80', fontWeight: 700 }}
    >
      {children}
    </Typography>
  </Button>
);