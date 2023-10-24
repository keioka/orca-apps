import { Card, CardContent, CardMedia, Typography, Button, Stack, Box } from '@mui/material';

interface Feed {
  name: string;
  category: string;
  imageUrl: string;
}

interface CardNewsFeedProps {
  feed: Feed
}

export function CardNewsFeed({ feed }: CardNewsFeedProps) {
  // const [feed, setFeed] = useState(null);

  // useEffect(() => {
  //   const parser = new Parser();
  //   parser.parseURL(feedUrl).then(data => {
  //     if (data.items && data.items.length > 0) {
  //       setFeed(data.items[0]);
  //     }
  //   });
  // }, [feedUrl]);

  if (!feed) return <div>Loading...</div>;

  console.log({ feed })
  return (
    <Card sx={{ padding: 2, boxShadow: "none", border: "1px solid #f2f2f2" }}>
      <Stack direction="row" sx={{ alignItems: "center", paddingBottom: 1 }} spacing={2}>
        <Box>
          {feed.imageUrl && (
            <CardMedia
              component="img"
              alt={feed.name}
              height="16"
              image={feed.imageUrl}
            />
          )}
        </Box>
        <CardContent
          sx={{
            padding: 0,
            "&:last-child": {
              paddingBottom: 0
            }
          }}
        >
          <Typography variant="body1">
            {feed.name}
          </Typography>
        </CardContent>
      </Stack>
      <Button variant="outlined" color="secondary" size="small">
        Follow
      </Button>
    </Card >
  );
}
