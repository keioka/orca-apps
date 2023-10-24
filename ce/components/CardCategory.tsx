import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import styled from '@emotion/styled';
import {
  Box
} from "@mui/material"

const StyledCard = styled(Card)`
  position: relative;
  min-width: 240px;
  width:  240px;
  height: 180px;
  background-size: cover;
  background-position: center;
  box-shadow: none;
`;

export const CardCategory = ({ title, imgUrl, isSelected, onClick }) => {
  return (
    <StyledCard
      style={{ backgroundImage: `url(${imgUrl})` }}
      sx={(theme) => ({
        border: `4px solid ${isSelected ? theme.palette.primary.main : "#f2f2f2"}`,
      })}
      onClick={onClick}
    >
      {/* <StyledCard sx={(theme) => ({ background: theme.palette.primary.main })}> */}

      <CardContent
        sx={{
          position: "relative",
          zIndex: 1,
        }}
      >
        <Box sx={{ left: 0, top: "50%", position: "absolute", zIndex: 3, background: "rgba(0,0,0,0.8)", paddingX: 2, paddingY: 1, borderRadiusTopright: 2, borderRadiusBottomright: 2 }}>
          <Typography sx={{ fontSize: 14, textTransform: "capitalize" }} color="#fff">
            {title}
          </Typography>
        </Box>
      </CardContent>
    </StyledCard>
  );
};