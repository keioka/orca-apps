import {
  Button,
  Card,
  Stack,
  Typography
} from '@mui/material';
import { FaCircleCheck } from "react-icons/fa6";

export function ContentPremiumPlan({ handleUpgrade }) {
  return (
    <Card sx={{ width: "100%" }}>
      <Stack sx={{ mt: 2, alignItems: "center", background: "#f4f4f4", borderRadius: 1 }} p={2} spacing={2}>
        <Typography variant="h6">有料プラン</Typography>
        <Typography variant="h5">$9 / 月</Typography>
        <Stack spacing={1} sx={{ alignItems: "center", background: "#f4f4f4", borderRadius: 1 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <FaCircleCheck color='green' />
            <Typography variant="body1">単語帳保存機能</Typography>
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            <FaCircleCheck color='green' />
            <Typography variant="body1">言い換え表現機能</Typography>
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            <FaCircleCheck color='green' />
            <Typography variant="body1">AIによる返答サンプル機能</Typography>
          </Stack>
          <Typography variant="body1">追加予定：単語聞き流し機能</Typography>
          <Typography variant="body1">追加予定：単語クイズ機能</Typography>
          <Typography variant="body1">追加予定：文法チェック機能</Typography>
        </Stack>
        <Button onClick={handleUpgrade} variant="contained" sx={{ color: "#fff" }}>アップグレードする</Button>
      </Stack>
    </Card>
  );
}