import { useRef, useState, useEffect } from 'react';
import Layout from '@/components/layout';
import { Box, TextField, Button } from '@mui/material';
import { Message } from '@/types/chat';
import Image from 'next/image';

export default function Home() {
  return (
    <Layout>
      <Box sx={{ background: "#E0F1EF", minHeight: "100vh", width: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <TextField sx={{ background: "#fff", minWidth: 540 }} />
        <Button
          sx={{ color: "#9FD1D5" }}
          variant='contained'
          color='primary'
        >
          Send
        </Button>
      </Box>
    </Layout>
  );
}



