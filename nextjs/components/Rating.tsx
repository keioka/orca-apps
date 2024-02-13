import * as React from 'react';
import { Box, Stack } from '@mui/material';
import { styled } from '@mui/material/styles';
import Rating, { IconContainerProps } from '@mui/material/Rating';
import {
  SentimentVeryDissatisfied as SentimentVeryDissatisfiedIcon,
  SentimentDissatisfied as SentimentDissatisfiedIcon,
  SentimentSatisfied as SentimentSatisfiedIcon,
  SentimentSatisfiedAltOutlined as SentimentSatisfiedAltIcon,
  SentimentVerySatisfied as SentimentVerySatisfiedIcon,
} from '@mui/icons-material';

const StyledRating = styled(Rating)(({ theme }) => ({
  '& .MuiRating-iconEmpty .MuiSvgIcon-root': {
    color: theme.palette.action.disabled,
  },
}));

const customIcons: {
  [index: string]: {
    icon: React.ReactElement;
    label: string;
  };
} = {
  1: {
    icon: <SentimentVeryDissatisfiedIcon color="error" fontSize='large' />,
  },
  2: {
    icon: <SentimentDissatisfiedIcon color="error" fontSize='large' />,
  },
  3: {
    icon: <SentimentSatisfiedIcon color="warning" fontSize='large' />,
  },
  4: {
    icon: <SentimentSatisfiedAltIcon color="success" fontSize='large' />,
  },
  5: {
    icon: <SentimentVerySatisfiedIcon color="success" fontSize='large' />,
  },
};

function IconContainer(props: IconContainerProps) {
  const { value, ...other } = props;
  return <span {...other}>{customIcons[value].icon}</span>;
}

export function RatingSentiment({ value, labels = [], onChange }: { value: string }) {
  return (
    <Stack sx={{ justifyContent: "center", alignItems: "center" }}>
      <StyledRating
        name="highlight-selected-only"
        defaultValue={3}
        IconContainerComponent={IconContainer}
        highlightSelectedOnly
        value={parseInt(value)}
        onChange={onChange}
      />
      <Box sx={{ height: 16 }}>{labels[value] ? labels[value] : "Select one"} </Box>
    </Stack>
  );
}