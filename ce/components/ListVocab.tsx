import {
  Button,
  Input,
  Link,
  Stack,
  Typography,
  Box,
  Drawer,
  Card,
  CardActions,
  Chip,
  Grid,
  Alert,
  Avatar
} from "@mui/material"

const vocabs = [
  {
    id: "1",
    name: "Gargantuan",
    word: "gargantuan",
    trans: {
      ja: "巨大な",
    },
    meaning: "extremely large or massive",
    example: "The elephant was truly gargantuan in size, towering over everything in its path.",
    pronounce: "/ɡɑrˈɡæn.tju.ən/",
    imageUrls: ["https://example.com/gargantuan-image.jpg"],
    audioFile: "https://example.com/gargantuan-audio.mp3",
    tags: [
      "IELTS",
      "TOEFL",
    ]
  },
  {
    id: "2",
    name: "Serendipity",
    word: "serendipity",
    trans: {
      ja: "偶然の幸運",
    },
    meaning: "the occurrence of fortunate events by chance",
    example: "Their meeting was a serendipitous moment that changed their lives forever.",
    pronounce: "/ˌser.ənˈdɪp.ɪ.ti/",
    imageUrls: ["https://example.com/serendipity-image.jpg"],
    audioFile: "https://example.com/serendipity-audio.mp3",
    tags: [
      "IELTS",
      "TOEFL",
    ]
  },
  {
    id: "3",
    name: "Ubiquitous",
    word: "ubiquitous",
    trans: {
      ja: "至る所にある",
    },
    meaning: "present or found everywhere",
    example: "In today's digital age, smartphones have become ubiquitous in our daily lives.",
    pronounce: "/juːˈbɪk.wɪ.təs/",
    imageUrls: ["https://example.com/ubiquitous-image.jpg"],
    audioFile: "https://example.com/ubiquitous-audio.mp3",
    tags: [
      "TOEIC",
    ]
  },
  {
    id: "4",
    name: "Ephemeral",
    word: "ephemeral",
    trans: {
      ja: "つかの間の",
    },
    meaning: "lasting for a very short time",
    example: "The beauty of the cherry blossoms is ephemeral, as they bloom for only a few weeks each spring.",
    pronounce: "/ɪˈfɛmərəl/",
    imageUrls: ["https://example.com/ephemeral-image.jpg"],
    audioFile: "https://example.com/ephemeral-audio.mp3",
    tags: [
      "TOEIC",
    ]
  },
  {
    id: "5",
    name: "Cacophony",
    word: "cacophony",
    trans: {
      ja: "不協和音",
    },
    meaning: "a harsh, discordant mixture of sounds",
    example: "The cacophony of car horns and sirens in the city can be overwhelming at times.",
    pronounce: "/kəˈkɒfəni/",
    imageUrls: ["https://example.com/cacophony-image.jpg"],
    audioFile: "https://example.com/cacophony-audio.mp3",
    tags: [
      "GRE"
    ]
  },
  {
    id: "6",
    name: "Esoteric",
    word: "esoteric",
    trans: {
      ja: "難解な",
    },
    meaning: "intended for or understood by only a small group with specialized knowledge",
    example: "Her research focused on such esoteric topics that few people could grasp its significance.",
    pronounce: "/ˌɛsəˈtɛrɪk/",
    imageUrls: ["https://example.com/esoteric-image.jpg"],
    audioFile: "https://example.com/esoteric-audio.mp3",
    tags: [
      "Eiken 2",
    ]
  },
  {
    id: "7",
    name: "Pernicious",
    word: "pernicious",
    trans: {
      ja: "有害な",
    },
    meaning: "having a harmful effect, especially in a gradual or subtle way",
    example: "The pernicious influence of social media on mental health is a growing concern.",
    pronounce: "/pəˈnɪʃəs/",
    imageUrls: ["https://example.com/pernicious-image.jpg"],
    audioFile: "https://example.com/pernicious-audio.mp3",
    tags: [
      "Eiken 3",
    ]
  },
  {
    id: "8",
    name: "Quixotic",
    word: "quixotic",
    trans: {
      ja: "空想的な",
    },
    meaning: "exceedingly idealistic; unrealistic and impractical",
    example: "His quixotic quest for world peace, while noble, seemed unlikely to succeed in the face of global conflicts.",
    pronounce: "/kwɪkˈsɒtɪk/",
    imageUrls: ["https://example.com/quixotic-image.jpg"],
    audioFile: "https://example.com/quixotic-audio.mp3",
    tags: [
      "Eiken 3",
    ]
  },
  {
    id: "9",
    name: "Verisimilitude",
    word: "verisimilitude",
    trans: {
      ja: "逼真さ",
    },
    meaning: "the appearance of being true or real",
    example: "The film's attention to detail and set design gave it a high degree of verisimilitude, making viewers feel as though they were in a different era.",
    pronounce: "/ˌvɛrɪsɪˈmɪlɪˌtjuːd/",
    imageUrls: ["https://example.com/verisimilitude-image.jpg"],
    audioFile: "https://example.com/quixotic-audio.mp3",
    tags: [
      "Eiken 3",
    ]
  }
]

function ListVocab() {
  return (
    <>
      {
        vocabs.map((vocab) => (
          <Box key={vocab.word} sx={{ marginBottom: 1 }}>
            <Card sx={{ width: "100%", height: "auto" }}>
              <Stack p={3} spacing={1}>

                <Stack
                  direction="row"
                  justifyContent="space-between"
                  sx={{
                    paddingBottom: 1,
                    borderBottom: "1px solid #f2f2f2"
                  }}
                >
                  <Stack spacing={0.5} >
                    <Typography variant="h6" component="h5">
                      {vocab.word}
                    </Typography>
                    <Typography variant="body2" component="span">
                      {vocab.pronounce}
                    </Typography>
                  </Stack>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      cursor: "pointer",
                    }}
                  >
                    <IoPlayCircle size={28} color="d4d4d4" />
                  </Box>
                </Stack>
                <Typography variant="body2" component="h6">
                  {vocab.meaning}
                </Typography>
                <Typography variant="body2" component="h6">
                  {vocab.trans.ja}
                </Typography>

                <Typography variant="body2" component="h6">
                  <q cite="https://google.com" >
                    {vocab.example}
                  </q>
                </Typography>

                <Box>
                  {
                    vocab.tags.map((tag) => (
                      <Chip label={tag} sx={{ width: "auto", marginRight: 1 }} />
                    ))
                  }
                </Box>
                <CardActions sx={{ borderTop: "1px solid #f2f2f2", padding: 0, paddingTop: 1 }}>
                  <Stack direction="row" spacing={1}>
                    <Button variant="contained">Save</Button>
                    <Button variant="outlined">Discard</Button>
                    <Button variant="outlined">Source</Button>
                  </Stack>
                </CardActions>
                {/* <Typography variant="body2" component="div">
              {vocab.audioFile}
            </Typography> */}
              </Stack>
            </Card>
          </Box>
        ))
      }
    </>
  )
}
