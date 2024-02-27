import React, { useMemo, useState } from 'react';
import { Box, Tab, Tabs, Typography, Tooltip, Select, MenuItem } from '@mui/material';
import moment from "moment";
import { BarChart } from '@mui/x-charts/BarChart';
import { axisClasses } from '@mui/x-charts';

enum StastsTab {
  lessons = 'lessons',
  vocabulary = 'vocabulary',
  paraphrase = 'paraphrase',
  wordCount = 'wordCount',
}

enum ChartLabel {
  lessons = 'lessons',
  vocabulary = 'vocabulary',
  paraphrase = 'paraphrase',
  wordCount = 'wordCount',
}

function convertTabToKey(tab: StastsTab) {
  switch (tab) {
    case StastsTab.lessons:
      return "lessonsByDay"
    case StastsTab.vocabulary:
      return "vocabulariesByDay"
    case StastsTab.paraphrase:
      return "paraphrasesByDay"
    case StastsTab.wordCount:
      return "wordCountByDay"
  }
}


function convertTabToCharLabel(tab: StastsTab) {
  switch (tab) {
    case StastsTab.lessons:
      return "レッスン数（学習した記事数）"
    case StastsTab.vocabulary:
      return "単語数"
    case StastsTab.paraphrase:
      return "言い換え表現数"
    case StastsTab.wordCount:
      return "喋ったワード数"
  }
}

const goals: { [key: StastsTab]: number } = {
  lessons: 3,
  vocabulary: 20,
  paraphrase: 10,
  wordCount: 30,
}

const addMissingDates = (data, type) => {
  if (!data || data.length === 0) {
    return [];
  }
  const dataCopy = [...data];
  const sortedData = dataCopy.sort((a, b) => new Date(a.date) - new Date(b.date));
  const startDate = moment(new Date(sortedData[0].date));
  const endDate = moment(); // Set the end date to today
  let result = [];

  const dataMap = new Map(dataCopy.map(item => [moment(item.date).format('YYYY-MM-DD'), item]));

  for (let date = moment(startDate); date.isSameOrBefore(endDate); date.add(1, 'days')) {
    const dateString = date.format('YYYY-MM-DD');
    const found = dataMap.get(dateString);
    const goal = goals[type];
    if (found) {
      result.push({
        ...found,
        label: moment(found.date).format('MM/DD'),
        frontColor: found.value > goal ? '#2FABE8' : '#CCCCCC', // Adjust color based on goal
        topLabelComponent: () =>
          found.value > goal ? (
            <Tooltip title={found.value}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="caption">{found.value}</Typography>
              </Box>
            </Tooltip>
          ) : (
            <Typography variant="caption">{found.value}</Typography>
          ),
      });
    } else {
      if (!date.isSame(endDate, 'day')) {
        result.push({
          date: dateString,
          label: date.format('MM/DD'),
          value: 0, // Default value for missing dates
        });
      }
    }
  }

  return result;
};
// Assuming `convertTabToKey` and `addMissingDates` functions remain unchanged

export function UserStats({ stats }) {
  const [tab, setTab] = useState('lessons');

  const handleChange = (event, newValue) => {
    setTab(newValue);
  };

  const dataToDisplay = useMemo(() => {
    if (!stats) {
      return [];
    }

    const key = convertTabToKey(tab);
    return addMissingDates(stats[key], tab);
  }, [stats, tab]);

  const chartSetting = {
    yAxis: [
      {
        label: convertTabToCharLabel(tab),
      },
    ],
    width: 500,
    height: 300,
    sx: {
      [`.${axisClasses.left} .${axisClasses.label}`]: {
        transform: 'translate(0px, 0)',
        marginRight: 96,
      },
    },
  };

  return (
    <Box>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tab} onChange={handleChange} aria-label="basic tabs example">
          <Tab label="レッスン数" value="lessons" />
          <Tab label="保存した単語" value="vocabulary" />
          <Tab label="言い換え表現" value="paraphrase" />
          <Tab label="喋った言葉数" value="wordCount" />
        </Tabs>
      </Box>
      {dataToDisplay.length === 0 ? (
        <Box
          sx={{
            width: '100%',
            height: 240,
            marginTop: 2,
            marginBottom: 4,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f4f4f4',
            borderRadius: 1,
          }}
        >
          <Typography>No Data</Typography>
        </Box>
      ) : (
        <BarChart
          width={600}
          height={300}
          series={[{ data: dataToDisplay.map((data) => data.value), type: 'bar' }]}
          xAxis={[{ data: dataToDisplay.map((data) => data.label), scaleType: 'band' }]}
          slotProps={{
            bar: {
              style: {
                fill: "#2FABE8",
              }
            }
          }}
          {...chartSetting}
        />
      )}
    </Box>
  );
}