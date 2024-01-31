import { Chip as MuiChip } from '@mui/material'

export function Chip({ label, sx, onClick }) {
  return (
    <MuiChip
      sx={{
        fontFamily: 'var(--font-outfit)',
        fontSize: 14,
        padding: 2,
        lineHeight: 24,
        height: 24,
        "& .MuiChip-label": {
          fontSize: 14,
          lineHeight: "24px",
          height: 24,
        },
        ...sx
      }}
      label={label}
      onClick={onClick}
    />
  )
}