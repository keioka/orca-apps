import React, { useEffect } from "react";
import { Box } from "@mui/material";
import { sendToBackground } from "@plasmohq/messaging";
import { CardSummary } from "./CardSummary";
import { Player } from '@lottiefiles/react-lottie-player';

const levels = ["K5", "5Y", "A1", "A2", "B1", "B2", "C1", "C2"];

export function SummaryMode({
  url,
  summaries,
  setSummaries,
  setIsLoadingSummaries,
  isLoadingSummaries,
  setError,
  onSaveVocab
}) {
  useEffect(() => {
    if (summaries.length > 0) {
      return;
    }

    async function init() {
      setIsLoadingSummaries(true);
      try {
        const resp = await sendToBackground({
          name: "summaryByLevel",
          body: {
            url,
            levels: levels
          },
        });

        console.log({ resp });
        if (resp.error) {
          setError(resp.error);
        } else {
          setIsLoadingSummaries(false);
          setSummaries(prevSummaries => [...prevSummaries, ...resp.summaries]);
        }
      } catch (e) {
        console.error(e);
      }

    }

    init(); // Calling the init function inside the useEffect.
  }, []);

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