import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  // eslint-disable-next-line no-console
  console.warn(
    'Supabase URL or anon key is missing. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env.local'
  )
}

export const supabase = createClient(
  SUPABASE_URL ?? '',
  SUPABASE_ANON_KEY ?? ''
)

export const SUPABASE_TABLE = import.meta.env.VITE_SUPABASE_TABLE || 'students'


