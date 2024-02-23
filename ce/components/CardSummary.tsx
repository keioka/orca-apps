import React, { useState } from 'react';
import {
  Button,
  Input,
  Link,
  Stack,
  Typography,
  Box,
  Tooltip,
  Drawer,
  Card,
  CardActions,
  Chip,
  Grid,
  Alert,
  Accordion,
  AccordionSummary as MuiAccordionSummary,
  AccordionDetails
} from "@mui/material"
import type { AccordionSummaryProps } from '@mui/material';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, } from '@mui/material';

import { ButtonRound } from "./ButtonRound";
import { AiOutlineQuestionCircle } from "react-icons/ai"
import { sendToBackground } from "@plasmohq/messaging"
import type { Summary } from "~types";
import styled from "@emotion/styled";

interface CardSummaryProps extends Summary {
  onClick: () => void;
}


const AccordionSummary = styled((props: AccordionSummaryProps) => (
  <MuiAccordionSummary
    expandIcon={<AiOutlineQuestionCircle size={18} />}
    {...props}
  />
))(({ theme }) => ({
  fontSize: '0.8rem',
  margin: 0,
  border: "none",
  alignItems: "center",
  '& .MuiAccordionSummary-expandIconWrapper': {
    marginRight: 8,
  },
  '& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {
    transform: 'none',
  },
  '& .MuiAccordionSummary-content': {
    marginLeft: 1,
  },
}));


export function CardSummary({ level, summary }: CardSummaryProps) {
  const [isLoadingTranlate, setIsLoadingTranslate] = useState(false)
  const [translate, setTranslate] = useState(null)
  const [error, setError] = useState(null)

  async function handleClickTranslate() {
    if (!summary) return

    setIsLoadingTranslate(true)
    const resp = await sendToBackground({
      name: "translate",
      body: {
        text: summary
      }
    })

    if (resp.error) {
      setError(resp.error)
      return
    }

    setTranslate(resp.translation)
    setIsLoadingTranslate(false)
  }

  return (
    <Card sx={{ width: "100%", height: "auto", boxShadow: "none", border: "1px solid #eeeeee" }}>
      <Stack p={3} spacing={1}>
        <Accordion sx={{ boxShadow: "none", borderBottom: "1px solid #f2f2f2" }}>
          <AccordionSummary
            aria-controls="panel1a-content"
            id="panel1a-header"
            sx={{ padding: 0 }}
          >
            <Typography>{level}</Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ padding: 0, paddingBottom: 2 }}>
            <EnglishProficiencyTable level={level} />
          </AccordionDetails>
        </Accordion>
        <Typography sx={{ fontSize: 14, fontWeight: 500 }}>
          {summary}
        </Typography>
        <Box>
          <ButtonRound onClick={handleClickTranslate}>
            {chrome.i18n.getMessage("translate")}
          </ButtonRound>
        </Box>
        <Box>
          {translate && <Typography sx={{ fontSize: 14, fontWeight: 600 }}>{translate}</Typography>}
        </Box>
      </Stack>
    </Card>
  )
}



function EnglishProficiencyTable({ level }: { level: string }) {
  const data = {
    'K5': {
      description: "Pre-A1",
      CEFR: 'Understand/use familiar everyday expressions and basic phrases.',
      IELTS: '-',
      TOEFL: '-',
      TOEIC: '-'
    },
    '5Y': {
      description: "Pre-A1",
      CEFR: 'Understand/use familiar everyday expressions and basic phrases.',
      IELTS: '-',
      TOEFL: '-',
      TOEIC: '-'
    },
    'A1': {
      description: "Beginner",
      CEFR: 'Understand/use familiar everyday expressions and basic phrases.',
      IELTS: '< 4.0',
      TOEFL: '-',
      TOEIC: '< 220'
    },
    'A2': {
      description: "Elementary",
      CEFR: 'Understand sentences/expressions related to immediate relevance.',
      IELTS: '4.0',
      TOEFL: '-',
      TOEIC: '220 - 545'
    },
    'B1': {
      description: "Intermediate",
      CEFR: 'Deal with situations arising while traveling in English-speaking areas.',
      IELTS: '4.5 - 5.0',
      TOEFL: '42 - 71',
      TOEIC: '546 - 780'
    },
    'B2': {
      description: "Upper Intermediate",
      CEFR: 'Interact with fluency and spontaneity with native speakers.',
      IELTS: '5.5 - 6.5',
      TOEFL: '72 - 94',
      TOEIC: '780 - 940'
    },
    'C1': {
      description: "Advanced",
      CEFR: 'Use language flexibly for social, academic, and professional purposes.',
      IELTS: '7.0 - 8.0',
      TOEFL: '95 - 120',
      TOEIC: '941 - 990'
    },
    'C2': {
      description: "Proficient",
      CEFR: 'Understand nearly everything; express spontaneously and fluently.',
      IELTS: '8.5-9.0',
      TOEFL: '-',
      TOEIC: '-'
    }
  };

  return (
    <TableContainer component={Box} sx={{ border: "1px solid #eeeeee" }}>
      <Table aria-label="English proficiency table">
        <TableHead >
          <TableRow>
            <TableCell sx={{ paddingY: 1 }}>Level</TableCell>
            <TableCell sx={{ paddingY: 1 }}>CEFR</TableCell>
            <TableCell sx={{ paddingY: 1 }}>IELTS</TableCell>
            <TableCell sx={{ paddingY: 1 }}>TOEFL iBT</TableCell>
            <TableCell sx={{ paddingY: 1 }}>TOEIC</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow key={level}>
            <TableCell>{level}({data[level].description})</TableCell>
            <TableCell>{data[level].CEFR}</TableCell>
            <TableCell>{data[level].IELTS}</TableCell>
            <TableCell>{data[level].TOEFL}</TableCell>
            <TableCell>{data[level].TOEIC}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default EnglishProficiencyTable;