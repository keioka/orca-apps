import { useEffect, useState } from "react";
import { Button, TextField, Box, Stack, Typography, Chip } from "@mui/material";
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { sendToBackground } from "@plasmohq/messaging";
import { IoAddCircle } from "react-icons/io5";
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

export function Setting() {
  const [timeState, setTimeState] = useState<Record<number, Dayjs | null>>({});
  const [currentAlarm, setCurrentAlarm] = useState<Record<number, Dayjs | null>>({});
  const [tags, setTags] = useState<string[]>([]);
  const [followTags, setFollowTags] = useState<string[]>([]);
  const [keyword, setKeyword] = useState<string>('');
  const [isSyncing, setIsSyncing] = useState<boolean>(true);
  const [popularSearchKeywords, setPopularSearchKeywords] = useState<string[]>([]);

  console.log({ timeState })
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
      setTags(result.tags)
    }

    async function syncFollowTags() {
      const result = await chrome.storage.sync.get('followTags') || []
      setFollowTags(result.followTags)
    }

    chrome.alarms.getAll((alarms) => {
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
    fetchPopularKeywords()
    setCurrentAlarm(chrome.alarms)
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
      title: '新着記事のお知らせ。クリックして確認',
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

  const handleSaveSetting = async () => {
    await chrome.alarms.clearAll()

    Object.entries(timeState).forEach(async ([day, time]) => {
      if (time) {
        const notificationTime = time.format('HH:mm');
        const currentDate = dayjs();
        const currentDay = currentDate.day();
        const currentTime = currentDate.format('HH:mm');
        const nextDay = (parseInt(day) - currentDay + 7) % 7 - 1;
        const nextTime = dayjs(`${currentDate.format('YYYY-MM-DD')}T${time.format('HH:mm')}`).add(nextDay, 'day');
        const nextEpochTimeValue = nextTime.valueOf();
        const nextEpochTime = currentTime > nextEpochTimeValue ? nextEpochTimeValue + 60 * 60 * 24 * 1000 * 7 : nextEpochTimeValue;

        const alarm = await chrome.alarms.get(`orca-alarm-${nextEpochTime}`);

        console.log({ nextEpochTime, nextTime, nextDay, currentDay, day: dayjs(`${currentDate.format('YYYY-MM-DD')}T${time.format('HH:mm')}`), time: time.format('HH:mm') })

        if (!alarm) {
          await chrome.alarms.create(`orca-alarm-${nextEpochTime}`, { when: nextEpochTime });
        }


        chrome.alarms.onAlarm.addListener(handleNotificationCreate);
      }
    })
  }

  const handleTimeChange = (day: number, newValue: Dayjs | null) => {
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

  return (
    <Stack spacing={2} direction="column">
      <Typography variant="h5">通知を受ける記事のキーワード設定</Typography>
      <Typography variant="h6">人気のキーワードをフォローする</Typography>
      <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
        {searchKeywords.map((keyword) => {
          const isFollow = followTags.find((t) => t.query === keyword.query);
          return (
            <Chip
              sx={{ backgroundColor: isFollow ? "#DFEDF2" : "auto", marginBottom: 2 }}
              key={keyword.query}
              label={keyword.label}
              onDelete={() => handleSelectTag(keyword)}
              deleteIcon={isFollow ? null : <IoAddCircle />}
            />
          );
        })}
        {popularSearchKeywords.map((keyword) => {
          const isFollow = followTags.find((t) => t.query === keyword.query);
          return (
            <Chip
              sx={{ backgroundColor: isFollow ? "#DFEDF2" : "auto", marginBottom: 2 }}
              key={keyword.query}
              label={keyword.label}
              onDelete={() => handleSelectTag(keyword)}
              deleteIcon={isFollow ? null : <IoAddCircle />}
            />
          );
        })}
      </Stack>
      <Typography variant="h6">任意のキーワードをフォローする</Typography>
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
          追加
        </Button>
      </Box>

      <Box sx={{ borderBottom: "1px solid #d4d4d4" }} py={2}></Box>
      <Typography variant="h5">Set Study Time</Typography>
      <Stack spacing={2} direction="row">
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          {Array.from({ length: 7 }, (_, index) => (
            <TimePicker
              sx={{
                fontSize: 24
              }}
              key={index}
              views={['hours', 'minutes']}
              defaultValue={dayjs('2022-04-17T21:00')}
              label={`${getDayOfWeek(index + 1)}`}
              value={timeState[index + 1] || null}
              onChange={(newValue) => handleTimeChange(index + 1, newValue)}
              renderInput={(params) => <TextField {...params} />}
            />
          ))}
        </LocalizationProvider>
      </Stack>
      <Stack direction="row" spacing={1}>
        <Button variant="contained" color="primary" onClick={handleSaveSetting}>
          アラームをセット
        </Button>
        <Button variant="outlined" color="primary" onClick={handleTest}>
          Test
        </Button>
      </Stack>
    </Stack>
  );
}