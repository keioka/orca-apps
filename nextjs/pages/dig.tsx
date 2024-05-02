"use client";

import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';
import { Pagination } from 'swiper/modules';
import { Box, Typography } from '@mui/material';

enum Tab {
  Vocab = 0,
  Paraphrase = 1
}

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
export function Main() {
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
        <SwiperSlide>
          <Box py={4}>
            <Tag title="World News" />
            <Box p={3} sx={{ background: "#fff", borderRadius: 1 }} mt={2}>
              <Box sx={{ lineHeight: 2 }}>
                The multipurpose charger has everything you’d expect: It uses magnets to hold your iPhone and Apple Watch in place and still has a free spot to charge your AirPods. The charger offers 15W charging speeds on any Qi2 phone, which, for now, is limited to the iPhone 12 and newer. The base of the charger accepts AirPods and other wireless earbuds that have Qi charging built into the case or any other small devices you might have with Qi charging support.
              </Box>
            </Box>
          </Box>
        </SwiperSlide>
        <SwiperSlide>
          <Box py={4}>
            <Tag title="World News" />
            <Box p={3} sx={{ background: "#fff", borderRadius: 1 }} mt={2}>
              <Box sx={{ lineHeight: 3 }}>
                The multipurpose charger has everything you’d expect: It uses magnets to hold your iPhone and Apple Watch in place and still has a free spot to charge your AirPods. The charger offers 15W charging speeds on any Qi2 phone, which, for now, is limited to the iPhone 12 and newer. The base of the charger accepts AirPods and other wireless earbuds that have Qi charging built into the case or any other small devices you might have with Qi charging support.
              </Box>
            </Box>
          </Box>
        </SwiperSlide>
        <SwiperSlide>Slide 3</SwiperSlide>
        <SwiperSlide>Slide 4</SwiperSlide>
        <SwiperSlide>Slide 5</SwiperSlide>
        <SwiperSlide>Slide 6</SwiperSlide>
        <SwiperSlide>Slide 7</SwiperSlide>
        <SwiperSlide>Slide 8</SwiperSlide>
        <SwiperSlide>Slide 9</SwiperSlide>
      </Swiper>
    </>
  );
}


