import { Chip as MuiChip } from '@mui/material'

export function Chip({ label, sx, onClick, isActive }) {
  return (
    <MuiChip
      sx={{
        fontFamily: 'var(--font-outfit)',
        fontSize: 14,
        padding: 2,
        lineHeight: 24,
        height: 24,
        color: isActive ? "white" : "auto",
        backgroundColor: isActive ? "#191c29" : "auto",
        "&:hover": {
          color: isActive ? "white" : "auto",
          backgroundColor: isActive ? "#191c29" : "auto",
        },
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