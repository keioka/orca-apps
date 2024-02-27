import React, { useEffect } from "react";
import { Box } from "@mui/material";
import { sendToBackground } from "@plasmohq/messaging";
import { CardSummary } from "./CardSummary";
import { Player } from '@lottiefiles/react-lottie-player';


export function SummaryMode({
  summaries,
  isLoadingSummaries,
  setError,
  onSaveVocab
}) {

  if (isLoadingSummaries) {
    return (
      <Player
        autoplay
        loop
        src="https://lottie.host/f5d3cdb1-d14c-4e57-9287-df6f93f302af/1yKt5SJGbU.json"
        style={{ height: '300px', width: '300px' }}
      />
    )
  }

  return (
    <Box mt={2}>
      {summaries.map((summary, i) => (
        <Box key={summary.level} my={1}>
          <CardSummary level={summary.level} summary={summary.summary} />
        </Box>
      ))}
    </Box>
  );
}