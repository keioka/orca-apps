import { useRef, useState, useEffect } from 'react';
import Layout from '@/components/layout';
import { Box, TextField, Button, Stack } from '@mui/material';
import { Message } from '@/types/chat';
import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  return (
    <Layout>
      <Box sx={{ background: "#E0F1EF", minHeight: "100vh", width: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Stack spacing={2}>
          <TextField sx={{ background: "#fff", minWidth: 540 }} placeholder='https://' type='url' />
          <Link href='/chat'>
            <Button
              variant='contained'
              color='primary'
            >
              Send
            </Button>
          </Link>
        </Stack>
      </Box>
    </Layout>
  );
}



