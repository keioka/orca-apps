import { useState } from 'react';
import styled from '@emotion/styled';
import MuiAccordion, { AccordionProps } from '@mui/material/Accordion';
import MuiAccordionSummary, { AccordionSummaryProps, } from '@mui/material/AccordionSummary';
import MuiAccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import {
  IoIosArrowForward
} from 'react-icons/io';
import {
  Box
} from "@mui/material"

const Accordion = styled((props: AccordionProps) => (
  <MuiAccordion disableGutters elevation={0} square {...props} />
))(({ theme }) => ({
  '&:not(:last-child)': {
    borderBottom: 0,
  },
  '&:before': {
    display: 'none',
  },
}));

const AccordionSummary = styled((props: AccordionSummaryProps) => (
  <MuiAccordionSummary
    expandIcon={<IoIosArrowForward size={16} />}
    {...props}
  />
))(({ theme }) => ({
  fontSize: '0.8rem',
  height: 32,
  minHeight: 32,
  margin: 0,
  flexDirection: 'row-reverse',
  border: "none",
  '& .MuiAccordionSummary-expandIconWrapper': {
    marginRight: 8,
  },
  '& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {
    transform: 'rotate(90deg)',
  },
  '& .MuiAccordionSummary-content': {
    marginLeft: 1,
  },
}));

const AccordionDetails = styled(MuiAccordionDetails)(({ theme }) => ({
  padding: 0,
  paddingLeft: 42,
  '& > *': {
    cursor: 'pointer',
  }
}));

export function ExpandableMenu({ title, children }) {
  const [expanded, setExpanded] = useState(false);

  const handleChange = (event: React.SyntheticEvent, newExpanded: boolean) => {
    setExpanded(!expanded);
  };

  return (
    <>
      <Accordion
        expanded={expanded}
        onChange={handleChange}
      >
        <AccordionSummary
          aria-controls="panel1d-content"
          id="panel1d-header"
        >
          <Typography sx={{ fontSize: "0.9rem" }}>{title}</Typography>
        </AccordionSummary>
        <AccordionDetails>
          {children}
        </AccordionDetails>
      </Accordion>
    </>
  );
}