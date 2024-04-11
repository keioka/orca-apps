



import React from 'react';
import { FormControl, InputLabel, Select, type SelectChangeEvent, MenuItem } from '@mui/material';

const langs = [
  { code: "en", name: "English" },
  { code: "ja", name: "日本語" },
  { code: "zh", name: "中文" },
  { code: "ko", name: "한국어" },
  { code: "es", name: "Español" },
  { code: "fr", name: "Français" },
  { code: "tr", name: "Türkçe" },
]
export const SelectLang = ({
  lang,
  handleSelectLang,
}) => {
  return (
    <FormControl fullWidth>
      <InputLabel id="select-lang-label">Lang</InputLabel>
      <Select
        labelId="lang"
        id="select-lang"
        size="small"
        value={lang}
        label="Language"
        sx={{ width: 96 }}
        onChange={handleSelectLang}
        MenuProps={
          {
            disablePortal: true,
            anchorOrigin: {
              vertical: "bottom",
              horizontal: "left"
            },
            transformOrigin: {
              vertical: "top",
              horizontal: "left"
            },
          }
        }
      >
        {langs.map((lang: any) => (
          <MenuItem value={lang.code}>{lang.name}</MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}