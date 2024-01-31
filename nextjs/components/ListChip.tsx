import { Box } from '@mui/material'
import { Chip } from './Chip'

interface ChipInfo {
  label: string
  onClick?: () => void
}

export function ListChip({ items }: {
  items: ChipInfo[]
}) {
  return (
    <Box>
      {items.map((item, index) => (
        <Box mr={1}>
          <Chip label={item.label} onClick={item.onClick} />
        </Box>
      ))}
    </Box>
  )
}