import React from "react";
import styled from "@emotion/styled";
import { Box } from "@mui/material";

const BouncingLoader = styled(Box)({
  display: "flex",
  justifyContent: "center",
  "& > div": {
    width: "8px",
    height: "8px",
    margin: "3px 3px",
    borderRadius: "50%",
    backgroundColor: "#a3a1a1",
    opacity: 1,
    animation: "bouncing-loader 0.6s infinite alternate",
    "&:nth-child(2)": {
      animationDelay: "0.2s",
    },
    "&:nth-child(3)": {
      animationDelay: "0.4s",
    },
  },
  "@keyframes bouncing-loader": {
    to: {
      opacity: 0.1,
      transform: "translateY(-16px)",
    },
  },
});

export const LoaderBounce = (props) => {
  return (
    <BouncingLoader>
      <div></div>
      <div></div>
      <div></div>
    </BouncingLoader>
  );
};
