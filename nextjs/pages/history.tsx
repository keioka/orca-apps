import { useRef, useState, useEffect } from 'react';
import Layout from '@/components/layout';
import { Box, TextField, Button, Stack, Typography } from '@mui/material';
import { Message } from '@/types/chat';
import Image from 'next/image';
import Link from 'next/link';
import { CardNews } from '@/components/CardNews';

import axios from 'axios';
import { Article } from '@/types/articles';


export default function History() {
  const [articles, setArticles] = useState<Article[]>([]);

  useEffect(() => {
    async function getArticles() {
      const articles = await fetchArticles()
      setArticles(articles)
    }
    getArticles()
  }, [])

  return (
    <Layout>
      <Box sx={{ minHeight: "100vh", width: "100%", justifyContent: "center", padding: 3, boxSizing: "border-box" }}>
        <Box p={2}>
          <Typography variant="h6" sx={{ fontFamily: "var(--font-m-plus-rounded-1c)", color: "#535353" }}>記事を探す</Typography>
        </Box>
        <Stack sx={{ width: "100%" }} spacing={1}>
          {
            articles.map((article) => <Link href={'/chat'} style={{ textDecoration: "none" }}><CardNews article={article} /></Link>)
          }
        </Stack>
      </Box>
    </Layout >
  );
}
