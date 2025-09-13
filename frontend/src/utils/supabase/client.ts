import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Este cliente usa la ANON KEY (segura para el navegador)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)