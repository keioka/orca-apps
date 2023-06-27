import {
  useState
} from 'react'

import {
  Tabs,
  Tab,
  Box,
  Card,
  Typography,
  Stack
} from '@mui/material';

export function ScreenLearningMode() {
  const [value, setValue] = useState('one');

  const handleChange = (event, newValue) => {
    setValue(newValue);
  }

  return (
    <>
      <Tabs
        value={value}
        onChange={handleChange}
        textColor="secondary"
        indicatorColor="transparent"
        aria-label="secondary tabs example"
        sx={{
          width: '100%',
          py: 2,
          justifyContent: 'center',
          '& .MuiTabs-flexContainer': {
            justifyContent: 'center',
          }
        }}
      >
        <Tab value="one" label="Summary" />
        <Tab value="two" label="Sentence" />
        <Tab value="three" label="Vocabulary" />
      </Tabs>
      <Box sx={{ height: "100vh", boxSizing: "border-box" }} p={2}>
        {/* {value === 'zero' &&
          <iframe src="https://www.instagram.com" width="100%" height="100%" id="main-frame" allow="fullscreen" />
        } */}

        {value === 'one' &&

          <Card sx={{ width: '100%', padding: 2, boxSizing: "border-box" }}>
            <Typography variant="body2" component="span">
              "Your community club is ready to provide services at its multiple branches and via its online portals."
              Explanation: This sentence uses "community" as a synonym for "local", and "portals" as a synonym for "online services".
              The phrase "ready to provide services" is used to convey the idea of being available to serve you.
            </Typography>
          </Card>

        }

        {value === 'two' &&
          <Stack spacing={1}>
            <Card sx={{ width: '100%', padding: 2, boxSizing: "border-box" }}>
              <Typography variant="body2" component="span">
                "Your community club is ready to provide services at its multiple branches and via its online portals."
              </Typography>
            </Card>

            <Card sx={{ width: '100%', padding: 2, boxSizing: "border-box" }}>
              <Typography variant="body2" component="span">
                "Your community club is ready to provide services at its multiple branches and via its online portals."
              </Typography>
            </Card>
          </Stack>
        }

        {value === 'three' &&
          <Stack spacing={1}>
            <Card sx={{ width: '100%', padding: 2, boxSizing: "border-box" }}>
              <Stack spacing={1}>
                <Typography variant="body2" component="span">
                  Artificial intelligence
                </Typography>
                <Typography variant="body2" component="span">
                  人工知能
                </Typography>
              </Stack>
            </Card>

            <Card sx={{ width: '100%', padding: 2, boxSizing: "border-box" }}>
              <Stack spacing={1}>
                <Typography variant="body2" component="span">
                  Extinction
                </Typography>
                <Typography variant="body2" component="span">
                  絶滅
                </Typography>
              </Stack>
            </Card>
          </Stack>
        }
      </Box>
    </>
  )
}