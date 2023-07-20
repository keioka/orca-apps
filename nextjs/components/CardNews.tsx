import { Article } from '@/types/articles';
import { Card, CardContent, Typography, CardMedia } from '@mui/material';

export function CardNews({ article }: { article: Article }) {
  console.log(article)
  return (
    <Card sx={{ width: "100%", borderBottom: "1px solid #f4f4f4" }}>
      <CardContent>
        <Typography variant="subtitle2">{article.source?.name}</Typography>
        <Typography variant="body1" gutterBottom>{article.title}</Typography>
        {/* {article.imageUrl && <CardMedia component="img" src={article.imageUrl} alt={article.title} />} */}
      </CardContent>
    </Card>
  )
}


