import { Button, Stack, Typography } from '@mui/material';
import { IoBookmark } from 'react-icons/io5';
import { useTranslation } from "next-i18next";

type ButtonSaveProps = {
  onSave: () => void;
  isSaved: boolean;
};

export function ButtonSave({ onSave, isSaved }: ButtonSaveProps) {
  const { t } = useTranslation('common');
  return (
    <Button onClick={onSave} size="small" data-tour="step3">
      <Stack justifyContent="center" alignItems="center">
        <IoBookmark color={isSaved ? "#FFD744" : "#b6b6b6"} size={18} />
        <Typography variant="body2" component="span" sx={{ color: "#242424" }}>
          {t("vocab.save")}
        </Typography>
      </Stack>
    </Button>
  );
}