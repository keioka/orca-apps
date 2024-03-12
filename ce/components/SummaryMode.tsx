import React, { useState, useMemo } from "react";
import {
  Box,
  Stack,
  Chip,
  Tooltip
} from "@mui/material";
import { sendToBackground } from "@plasmohq/messaging";
import { CardSummary } from "./CardSummary";
import { Player } from '@lottiefiles/react-lottie-player';


const levels = ["5Y", "K5", "A1", "A2", "B1", "B2", "C1", "C2"];

const description = {
  "5Y": "5 years old: knows only 250 basic words.",
  "K5": "Kindergarten: TOEIC < 220, TOEFL iBT < 42, IELTS < 4.0",
  "A1": "Beginner: TOEIC < 220, TOEFL iBT < 42, IELTS < 4.0",
  "A2": "Elementary: TOEIC 220 - 545, TOEFL iBT 42 - 71, IELTS 4.0",
  "B1": "Intermediate: TOEIC 546 - 780, TOEFL iBT 42 - 71, IELTS 4.0 - 5.0",
  "B2": "Upper Intermediate: TOEIC 780 - 940, TOEFL iBT 72 - 94, IELTS 5.5 - 6.5",
  "C1": "Advanced: TOEIC 941 - 990, TOEFL iBT 95 - 120, IELTS 7.0 - 8.0",
  "C2": "Proficient: IELTS 8.5 - 9.0"
}

export function SummaryMode({
  summaries,
  isLoadingSummaries,
  onSelectLevel
}) {

  const [selectedLevel, setSelectedLevel] = useState("5Y");

  const handleClickLevel = (level) => {
    if (isLoadingSummaries) return
    if (!summaries.filter((summary) => Boolean(summary)).some((summary) => summary && summary.level === level)) {
      onSelectLevel(level);
    }
    setSelectedLevel(level);
  }

  const selectedSummary = useMemo(() => {

    if (!selectedLevel || !summaries) {
      return;
    }

    return summaries.filter((summary) => Boolean(summary)).find((summary) => summary.level === selectedLevel);
  }, [selectedLevel, summaries]);


  return (
    <Box mt={2}>
      <Stack direction="row" spacing={1}>
        {levels.map((level: Level) => {
          return (
            <Tooltip
              title={description[level]}
              PopperProps={{
                disablePortal: true,
                popperOptions: {
                  positionFixed: true,
                  modifiers: {
                    preventOverflow: {
                      enabled: true,
                      boundariesElement: "window" // where "window" is the boundary
                    }
                  }
                }
              }}
            >
              <Chip
                key={level}
                label={level}
                onClick={() => {
                  handleClickLevel(level)
                }}
              />
            </Tooltip>
          )
        })}
      </Stack>
      {isLoadingSummaries &&
        <Player
          autoplay
          loop
          src="https://lottie.host/f5d3cdb1-d14c-4e57-9287-df6f93f302af/1yKt5SJGbU.json"
          style={{ height: '300px', width: '300px' }}
        />
      }
      {selectedSummary &&
        <Box key={selectedSummary.level} my={1}>
          <CardSummary level={selectedSummary.level} summary={selectedSummary.content} />
        </Box>
      }
    </Box>
  );
}