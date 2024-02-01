import { Crimson_Text, Outfit } from 'next/font/google';

export const crimsonText = Crimson_Text({
  variable: '--font-crimson-text',
  weight: ["400", "600"],
  subsets: ['latin'],
})

export const outfit = Outfit({
  variable: '--font-outfit',
  weight: ["400", "600"],
  subsets: ['latin'],
})
