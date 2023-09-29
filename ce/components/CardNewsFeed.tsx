import { Card, CardContent, CardMedia, Typography, Button, Link } from '@mui/material';

export function CardNewsFeed({ feed }) {
  // const [feed, setFeed] = useState(null);

  // useEffect(() => {
  //   const parser = new Parser();
  //   parser.parseURL(feedUrl).then(data => {
  //     if (data.items && data.items.length > 0) {
  //       setFeed(data.items[0]);
  //     }
  //   });
  // }, [feedUrl]);

  // if (!feed) return <div>Loading...</div>;

  return (
    <Card sx={{ padding: 2, boxShadow: "none", border: "1px solid #f2f2f2" }}>
      {feed.enclosure && feed.enclosure.type.startsWith('image/') && (
        <CardMedia
          component="img"
          alt={feed.title}
          height="140"
          image={feed.enclosure.url}
        />
      )}
      <CardContent sx={{ paddingX: 0, paddingY: 2 }}>
        <Typography variant="body1">
          {feed.name}
        </Typography>
        <Typography variant="subtitle1" color="textSecondary">
          {feed.creator || feed.author}
        </Typography>
        <Typography variant="body2" color="textSecondary" component="p">
          {feed.contentSnippet}
        </Typography>
      </CardContent>
      <Button variant="outlined" color="secondary" size="small">
        Follow
      </Button>
    </Card>
  );
}
