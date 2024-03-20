import { useEffect, useState } from "react";
import {
  Button,
  TextField,
  Box,
  Stack,
  Typography,
  Chip,
  Step,
  Stepper,
  StepLabel,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from "@mui/material";
import { TextareaAutosize } from '@mui/base';

import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { sendToBackground } from "@plasmohq/messaging";
import { IoAddCircle } from "react-icons/io5";
import { set } from "lodash";
const jwt = require('jsonwebtoken')

const searchKeywords = [
  {
    query: 'Japan',
    label: '日本全般',
    type: 'search'
  },
  {
    query: 'Japnese economy',
    label: '日本経済',
    type: 'search'
  },
  {

    query: 'Science',
    label: '科学',
    type: 'topic'
  },
  {
    query: 'Technology',
    label: 'テクノロジー',
    type: 'topic'
  },
  {
    query: 'Artificial intelligence',
    label: '人工知能',
    type: 'search'
  },
  {
    query: 'Augumented reality',
    label: '拡張現実',
    type: 'search'
  },
  {
    query: 'web3',
    label: 'web3',
    type: 'search'
  },
  {
    query: 'Israel–Hamas war',
    label: 'イスラエル・ハマス紛争',
    type: 'search'
  },
  {
    query: 'Russo-Ukrainian War',
    label: 'ウクライナ戦争',
    type: 'search'
  },
  {
    query: 'US stock',
    label: '米国株',
    type: 'search'
  }
]

function getDayOfWeek(day) {
  switch (day) {
    case 1:
      return "日"
    case 2:
      return "月"
    case 3:
      return "火"
    case 4:
      return "水"
    case 5:
      return "木"
    case 6:
      return "金"
    case 7:
      return "土"
  }
}


interface Alarm {
  name: string
  periodInMinutes: number
  scheduledTime: number // epoch time
}

enum CEFR {
  A1 = "A1",
  A2 = "A2",
  B1 = "B1",
  B2 = "B2",
  C1 = "C1",
  C2 = "C2"
}


export function Setting({ onSubmit }: { onSubmit: () => void }) {
  const [timeState, setTimeState] = useState<Record<number, Dayjs | null>>({});
  const [currentAlarm, setCurrentAlarm] = useState<Alarm[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [followTags, setFollowTags] = useState<string[]>([]);
  const [keyword, setKeyword] = useState<string>('');
  const [isSyncing, setIsSyncing] = useState<boolean>(true);
  const [popularSearchKeywords, setPopularSearchKeywords] = useState<string[]>([]);
  const [step, setStep] = useState<number>(0);

  const [cefr, setCEFR] = useState<CEFR | null>();
  const [toeic, setTOEIC] = useState<number | null>();
  const [toefl, setTOEFL] = useState<number | null>();
  const [ibt, setIBT] = useState<number | null>();

  const [goal, setGoal] = useState<string>('');

  useEffect(() => {
    async function fetchAlarm() {
      const alarms = await chrome.alarms.getAll()
      console.log({
        alarms
      })
    }

    async function fetchPopularKeywords() {
      const { data, error } = await sendToBackground({
        name: "api/notifications/popularKeywords"
      })

      if (error) {
        console.error(error)
        return
      }

      setPopularSearchKeywords(data)
    }

    async function syncTags() {
      const result = await chrome.storage.sync.get('tags') || []
      setTags(result.tags || [])
    }

    async function syncFollowTags() {
      const result = await chrome.storage.sync.get('followTags') || []
      setFollowTags(result.followTags || [])
    }

    async function syncScores() {
      const result = await chrome.storage.sync.get('scores')
      const scores = result.scores || {}
      setCEFR(scores.cefr || CEFR.A1)
      setTOEIC(scores.toeic || 0)
      setTOEFL(scores.toefl || 0)
      setIBT(scores.ibt || 0)
    }

    async function syncGoal() {
      const result = await chrome.storage.sync.get('goal') || []
      console.log({ result })
      setGoal(result.goal || "")
    }

    chrome.alarms.getAll((alarms) => {
      console.log({ alarms })
      alarms.forEach((alarm: Alarm) => {
        const day = dayjs(alarm.scheduledTime).day() + 1;
        const time = dayjs(alarm.scheduledTime);
        setTimeState((prevState) => ({
          ...prevState,
          [day]: time,
        }));
      })
    })

    syncTags()
    syncFollowTags()
    syncCurrentAlarm()
    syncScores()
    syncGoal()
    fetchPopularKeywords()
    fetchAlarm()
    setIsSyncing(false)
  }, [])

  useEffect(() => {
    if (isSyncing) return
    chrome.storage.sync.set({ tags: tags });
  }, [tags])

  useEffect(() => {
    if (isSyncing) return
    chrome.storage.sync.set({ followTags: followTags });
  }, [followTags])

  async function syncCurrentAlarm() {
    const alarms = await chrome.alarms.getAll()
    setCurrentAlarm(alarms.sort((a, b) => a.scheduledTime - b.scheduledTime))
  }

  const handleChangeCEFR = (event: React.ChangeEvent<{ value: unknown }>) => {
    if (event.target.value === "") {
      setCEFR(null)
      return
    }
    setCEFR(event.target.value as number);
  }

  const handleChangeTOEIC = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.value === "") {
      setTOEIC(null)
      return
    }
    setTOEIC(parseInt(event.target.value));
  }

  const handleChangeTOEFL = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.value === "") {
      setTOEFL(null)
      return
    }
    setTOEFL(parseInt(event.target.value));
  }

  const handleChangeIBT = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIBT(parseInt(event.target.value));
  }

  console.log({ goal })
  const handleSubmit = () => {
    chrome.storage.sync.set({
      scores: {
        cefr,
        toeic,
        toefl,
        ibt
      }
    });
    chrome.storage.sync.set({ goal: goal });
    onSubmit()
  }

  const handleNotificationCreate = async (alarm: Alarm) => {
    const queries = []

    if (followTags.length > 0) {
      queries.push(...followTags)
    }

    if (tags.length > 0) {
      queries.push(...tags.map((tag) => {
        return {
          query: tag,
          label: tag,
          type: 'search'
        }
      }))
    }

    const { data, error } = await sendToBackground({
      name: "api/notifications/genNotificationContent",
      body: {
        queries
      }
    })

    if (error) {
      console.error(error)
      return
    }

    const message = data.queryResult.map((d) => `${d.label}: ${d.articles.length}件`).join('、')
    const token = data.token

    const notificationOptions: NotificationOptions = {
      type: 'basic',
      iconUrl: '/assets/icon.png',
      title: '新着記事をクリックして確認',
      message: `
        ${message}
      `,
    };

    if (error) {
      console.error(error)
      return
    }

    chrome.notifications.create(null, notificationOptions, (notificationId) => {
      console.log('Notification created:', notificationId);
      if (alarm) {
        const nextEpochTime = alarm.scheduledTime + 60 * 60 * 24 * 1000 * 7;
        chrome.alarms.create(`orca-alarm-${nextEpochTime}`, { when: nextEpochTime });
      }
    });

    chrome.notifications.onClicked.addListener(async () => {

      if (error) {
        console.error(error)
      }

      chrome.tabs.create({
        url: `./tabs/notification.html?data=${token}`
      })
      console.log('Button clicked');
    })
  }

  const handleTest = () => {
    handleNotificationCreate()
  }

  const handleClear = async () => {
    await chrome.alarms.clearAll()
    setCurrentAlarm([])
  }

  const handleSaveSetting = async () => {
    await chrome.alarms.clearAll()
    const currentDate = dayjs();
    const currentDay = currentDate.day();
    const currentTime = parseInt(currentDate.format('HH:mm'));

    await Promise.all(Object.entries(timeState).map(async ([day, time]) => {
      if (time) {
        // Convert currentTime to a number
        const nextEpochTimeValue = time.valueOf();

        const alarm = await chrome.alarms.get(`orca-alarm-${nextEpochTimeValue}`);

        if (!alarm) {
          await chrome.alarms.create(`orca-alarm-${nextEpochTimeValue}`, { when: nextEpochTimeValue });
        }


        chrome.alarms.onAlarm.addListener(handleNotificationCreate);
      }
    }))

    syncCurrentAlarm()
  }

  const handleTimeChange = (day: number, newValue: Dayjs | null) => {
    if (!newValue) {
      setTimeState((prevState) => {
        const newState = { ...prevState };
        delete newState[day];
        return newState;
      });
      return;
    }

    if (newValue.isBefore(dayjs())) {
      // assign next week if the day is past
      const currentDate = dayjs();
      const currentDay = currentDate.day();
      const nextDayDistance = (parseInt(day) - 1 - currentDay + 7) % 7;
      const nextDay = nextDayDistance === 0 ? 7 : nextDayDistance;
      newValue = newValue.add(nextDay, 'day');
    }

    setTimeState((prevState) => ({
      ...prevState,
      [day]: newValue,
    }));
  };

  const handleAddTag = () => {
    if (!keyword) {
      return
    }

    if (tags.includes(keyword)) {
      return
    }

    setTags((prevState) => [...prevState, keyword])
    setKeyword("")
  }

  const handleDeleteTag = (tag: string) => {
    setTags((prevState) => prevState.filter((t) => t !== tag))
  }

  const handleOnChangeKeyword = (event: React.ChangeEvent<HTMLInputElement>) => {
    setKeyword(event.target.value);
  }

  const handleSelectTag = (tag: { query: string, label: string }) => {
    if (followTags.find((t) => t.query === tag.query)) {
      setFollowTags((prevState) => prevState.filter((t) => t.query !== tag.query))
      return
    }
    setFollowTags((prevState) => [...prevState, tag])
  }

  const handleClickNext = () => {
    if (step === 2) {
      handleSaveSetting()
    }
    setStep(step + 1)
  }

  const handleClickBack = () => {
    setStep(step - 1)
  }

  return (
    <Stack spacing={step} direction="column">
      <Stepper activeStep={step} alternativeLabel>
        <Step key={0} onClick={() => setStep(0)} >
          <StepLabel>Keyword</StepLabel>
        </Step>
        <Step key={1} onClick={() => setStep(1)}>
          <StepLabel>Time</StepLabel>
        </Step>
        <Step key={2} onClick={() => setStep(2)}>
          <StepLabel>Goal</StepLabel>
        </Step>
      </Stepper>

      <Box>
        {step === 0 && (
          <Stack spacing={2} sx={{ borderTop: "1px solid #d4d4d4", paddingTop: 4, marginTop: 8 }}>
            <Box sx={{ marginBottom: 2 }}>
              <Typography variant="h5">1. 通知を受ける記事のキーワード設定</Typography>
            </Box>
            <Box sx={{ marginBottom: 2 }}>

              <Typography variant="h6">{chrome.i18n.getMessage("setting_keyword_popular_follow_subtitle")}</Typography>
              <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
                {searchKeywords.map((keyword) => {
                  const isFollow = followTags.find((t) => t.query === keyword.query);
                  return (
                    <Box sx={{ marginTop: 1 }}>
                      <Chip
                        sx={{ backgroundColor: isFollow ? "#DFEDF2" : "auto", marginTop: 1 }}
                        key={keyword.query}
                        label={keyword.label}
                        onDelete={() => handleSelectTag(keyword)}
                        deleteIcon={isFollow ? null : <IoAddCircle />}
                      />
                    </Box>
                  );
                })}
                {popularSearchKeywords.map((keyword) => {
                  const isFollow = followTags.find((t) => t.query === keyword.query);
                  return (
                    <Box sx={{ marginTop: 1 }}>
                      <Chip
                        sx={{ backgroundColor: isFollow ? "#DFEDF2" : "auto", marginTop: 1 }}
                        key={keyword.query}
                        label={keyword.label}
                        onDelete={() => handleSelectTag(keyword)}
                        deleteIcon={isFollow ? null : <IoAddCircle />}
                      />
                    </Box>
                  );
                })}
              </Stack>
            </Box>
            <Box sx={{ marginTop: 8 }}>
              <Stack spacing={1}>
                <Typography variant="h6">{chrome.i18n.getMessage("setting_keyword_follow_subtitle")}</Typography>
                <TextField label="Keywords" variant="outlined" onChange={handleOnChangeKeyword} value={keyword} />
                <Stack spacing={1} direction="row">
                  {tags.map((tag) => (
                    <Chip
                      sx={{ backgroundColor: "#DFEDF2" }}
                      key={tag}
                      label={tag}
                      onDelete={() => handleDeleteTag(tag)}
                    />
                  ))}
                </Stack>
                <Box>
                  <Button variant="contained" color="primary" onClick={handleAddTag}>
                    {chrome.i18n.getMessage("setting_keyword_save_button")}
                  </Button>
                </Box>
              </Stack>
            </Box>
          </Stack>
        )}

        {step === 1 && (
          <Stack spacing={2} sx={{ borderTop: "1px solid #d4d4d4", paddingTop: 4, marginTop: 8 }}>
            <Typography variant="h5">2. {chrome.i18n.getMessage("setting_alarm_title")}</Typography>
            <Stack spacing={2} direction="row">
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                {Array.from({ length: 7 }, (_, index) => (
                  <TimePicker
                    sx={{ fontSize: 24 }}
                    ampm={false}
                    key={index}
                    views={['hours', 'minutes']}
                    defaultValue={dayjs('2022-04-17T21:00')}
                    label={`${getDayOfWeek(index + 1)}`}
                    value={timeState[index + 1] || null}
                    onChange={(newValue) => handleTimeChange(index + 1, newValue)}
                    renderInput={(params) => <TextField {...params} sx={{ fontSize: 24 }} />}
                  />

                ))}
              </LocalizationProvider>
            </Stack>
            <Stack spacing={2} direction="column">
              {
                currentAlarm && currentAlarm.length > 0 && currentAlarm.map((alarm) => {
                  return (
                    <Typography>{dayjs(alarm.scheduledTime).format("MM/DD hh:mm A ddd")}</Typography>
                  )
                })
              }
            </Stack>
            <Stack direction="row" spacing={1}>
              <Button variant="contained" color="primary" onClick={handleSaveSetting}>
                {chrome.i18n.getMessage("setting_set_alarm")}
              </Button>
              <Button variant="outlined" color="primary" onClick={handleClear}>
                {chrome.i18n.getMessage("setting_clear_alarm")}
              </Button>
              <Button variant="outlined" color="primary" onClick={handleTest}>
                {chrome.i18n.getMessage("setting_test_alarm")}
              </Button>
            </Stack>
          </Stack>
        )}

        {step === 2 && (
          <Stack spacing={2} sx={{ borderTop: "1px solid #d4d4d4", paddingTop: 4, marginTop: 8 }}>
            <Typography variant="h5">3. {chrome.i18n.getMessage("setting_goal_title")}</Typography>
            <Stack spacing={2} direction="row">
              <Typography variant="h6">{chrome.i18n.getMessage("setting_current_score")}</Typography>
            </Stack>
            <Stack direction="row" spacing={1}>
              <FormControl>
                <InputLabel id="demo-simple-select-label">CSFR</InputLabel>
                <Select
                  small
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  value={cefr}
                  label="CEFR"
                  onChange={handleChangeCEFR}
                  sx={{ fontSize: 24, height: 50 }}
                >
                  {Object.entries(CEFR).map(([key, value]) => {
                    return (
                      <MenuItem key={key} value={value}>{CEFR[key]}</MenuItem>
                    )
                  })}
                </Select>
              </FormControl>
              <TextField label="TOEIC" variant="outlined" onChange={handleChangeTOEIC} value={toeic} />
              <TextField label="TOEFL" variant="outlined" onChange={handleChangeTOEFL} value={toefl} />
              <TextField label="iBT" variant="outlined" onChange={handleChangeIBT} value={ibt} />
            </Stack>

            <Stack direction="column" spacing={1} sx={{ width: "100%" }}>
              <Typography variant="h6">{chrome.i18n.getMessage("setting_goal")}</Typography>
              <TextField
                id="filled-multiline-static"
                value={goal}
                multiline
                rows={4}
                variant="filled"
                placeholder={chrome.i18n.getMessage("setting_goal_placeholder")}
                onChange={(e) => setGoal(e.target.value)}
              />
            </Stack>
          </Stack>
        )}

      </Box>

      <Box sx={{ borderBottom: "1px solid #d4d4d4" }} py={2}></Box>

      <Stack sx={{ marginTop: 1 }} spacing={1} direction="row">
        {step !== 0 && <Button variant="outlined" onClick={handleClickBack}>Back</Button>}
        {step !== 2 && <Button variant="contained" onClick={handleClickNext}>Next</Button>}
        {step === 2 && <Button variant="contained" onClick={handleSubmit}>Submit</Button>}
      </Stack>
    </Stack>
  );
}