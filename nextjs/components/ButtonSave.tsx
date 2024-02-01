import { Button, Stack, Typography } from '@mui/material';
import { IoBookmark } from 'react-icons/io5';

type ButtonSaveProps = {
  onSave: () => void;
  isSaved: boolean;
};

export function ButtonSave({ onSave, isSaved }: ButtonSaveProps) {
  return (
    <Button onClick={onSave} size="small">
      <Stack justifyContent="center" alignItems="center">
        <IoBookmark color={isSaved ? "#FFD744" : "#b6b6b6"} size={18} />
        <Typography variant="body2" component="span" sx={{ color: "#242424" }}>
          保存
        </Typography>
      </Stack>
    </Button>
  );
}