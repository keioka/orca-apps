import { createClient } from '@supabase/supabase-js'
import type { NextApiRequest, NextApiResponse } from 'next';
import { getCookies } from 'cookies-next';

const supabaseUrl = "REDACTED_SECRET"
const supabaseAnonKey = "REDACTED_SECRET"

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})

export const validateToken = async (req: NextApiRequest, res: NextApiResponse) => {
  const cookies = getCookies({ req, res })
  const token = cookies.orca
  const response = await supabase.auth.getUser(
    token,
  )
  const user = response.data.user

  console.log({ response })
  if (!user) {

    res.status(401).json({ error: 'Unauthorized' });
  } else {
    req.user = user
  }
}