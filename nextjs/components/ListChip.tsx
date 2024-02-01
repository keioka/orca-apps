import { Box, Stack } from '@mui/material'
import { Chip } from './Chip'

interface ChipInfo {
  label: string
  onClick?: () => void
}

export function ListChip({ items }: {
  items: ChipInfo[]
}) {
  return (
    <Stack sx={{ width: "100%" }} direction="row">
      {items.map((item, index) => (
        <Box mr={1} sx={{ cursor: "pointer" }}>
          <Chip label={item.label} onClick={item.onClick} isActive={item.isActive} />
        </Box>
      ))}
    </Stack>
  )
}