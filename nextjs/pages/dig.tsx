"use client";

import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';
import { Pagination } from 'swiper/modules';
import { Box, Typography, Stack, Tabs, Tab } from '@mui/material';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import { CardVocabSM } from "@/components/CardVocabSM"

export default function Dig() {
  return (
    <Box px={2} py={1} sx={{ height: "100vh", background: "#F7F7F7" }}>
      <Main />
    </Box>
  );
}


function Tag({ title }: { title: string }) {
  return (
    <Box sx={{ background: "#fff", borderRadius: 48 }}>
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <Typography sx={{ fontSize: 14, color: "#FF7676", fontWeight: "bold" }} py={1} px={2}>#{title}</Typography>
      </Box>
    </Box>
  )
}

const articles = [
  {
    title: "Japan's Inflation Rate Slows in March, Eyes on Bank of Japan's Next Move",
    image: "https://images.ctfassets.net/hqek9g5wvgtp/7CAvsmUXCqW3FDpg8JpE0t/dee4ed4a18f0d7fed4efa4f7bd28ddf7/Japan-s_Inflation_Rate_Slows_in_March__Eyes_on_Bank_of_Japan-s_Next_Move.png",
    content: "The multipurpose charger has everything you’d expect: It uses magnets to hold your iPhone and Apple Watch in place and still has a free spot to charge your AirPods. The charger offers 15W charging speeds on any Qi2 phone, which, for now, is limited to the iPhone 12 and newer. The base of the charger accepts AirPods and other wireless earbuds that have Qi charging built into the case or any other small devices you might have with Qi charging support.",
    hashtag: "World News"
  },
  {
    title: "New York City Marathon to Return in November",
    image: "https://images.ctfassets.net/hqek9g5wvgtp/7CAvsmUXCqW3FDpg8JpE0t/dee4ed4a18f0d7fed4efa4f7bd28ddf7/Japan-s_Inflation_Rate_Slows_in_March__Eyes_on_Bank_of_Japan-s_Next_Move.png",
    content: "The multipurpose charger has everything you’d expect: It uses magnets to hold your iPhone and Apple Watch in place and still has a free spot to charge your AirPods. The charger offers 15W charging speeds on any Qi2 phone, which, for now, is limited to the iPhone 12 and newer. The base of the charger accepts AirPods and other wireless earbuds that have Qi charging built into the case or any other small devices you might have with Qi charging support.",
    hashtag: "World News"
  }
]
export function Main() {
  const [value, setValue] = useState('1');

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
  };

  return (
    <>
      <Swiper
        direction={'vertical'}
        pagination={{
          clickable: true,
        }}
        modules={[Pagination]}
        className="mySwiper"
        style={{
          height: "100%"
        }}
      >
        {
          articles.map((article, index) => (
            <SwiperSlide key={index}>
              <Box py={4}>
                <Tag title={article.hashtag} />
                <Box p={3} sx={{ background: "#fff", borderRadius: 1 }} mt={2}>
                  <Stack mb={1} direction="row" spacing={1} sx={{ borderBottom: "1px solid #f1f1f1", paddingBottom: 1 }}>
                    <img style={{ width: 96, height: 48, objectFit: "cover" }} src={article.image} />
                    <Typography variant="body2" p={0} sx={{ lineHeight: 1.1 }}>{article.title}</Typography>
                  </Stack>
                  <Box sx={{ lineHeight: 2 }}>
                    {article.content}
                  </Box>
                </Box>
              </Box>
              <TabContext value={value}>
                <Tabs onChange={handleChange}>
                  <TabList onChange={handleChange} aria-label="lab API tabs example">
                    <Tab label="Speaking" value="1" />
                    <Tab label="Vocab" value="2" />
                  </TabList>
                </Tabs>
                <TabPanel value="1" sx={{ padding: 0 }}>Item One</TabPanel>
                <TabPanel value="2" sx={{ padding: 0 }}>
                  <CardVocabSM
                    vocab={{
                      meaning: "English",
                      word: "Apple",
                      pronunciation: "æpl",
                      example: "I eat an apple everyday",
                      image: "https://images.ctfassets.net/hqek9g5wvgtp/7CAvsmUXCqW3FDpg8JpE0t/dee4ed4a18f0d7fed4efa4f7bd28ddf7/Japan-s_Inflation_Rate_Slows_in_March__Eyes_on_Bank_of_Japan-s_Next_Move.png",
                    }}
                  />
                </TabPanel>
                <TabPanel value="3">Item Three</TabPanel>
              </TabContext>
            </SwiperSlide>
          ))
        }
      </Swiper>
    </>
  );
}


