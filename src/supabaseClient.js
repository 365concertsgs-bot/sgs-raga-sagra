import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

let supabase = null
let supabaseError = null

// Log environment variables for debugging
if (typeof window !== 'undefined') {
  console.log('Supabase URL:', supabaseUrl ? '✓ Set' : '✗ Missing')
  console.log('Supabase runtime URL:', supabaseUrl)
  console.log('Supabase Key:', supabaseAnonKey ? '✓ Set' : '✗ Missing')
}

if (supabaseUrl && supabaseAnonKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey)
    console.log('Supabase client initialized successfully')
  } catch (err) {
    supabaseError = `Failed to initialize Supabase: ${err.message}`
    console.error(supabaseError)
  }
} else {
  supabaseError = `Missing Supabase credentials. URL: ${!supabaseUrl ? '✗' : '✓'}, Key: ${!supabaseAnonKey ? '✗' : '✓'}`
  console.error(supabaseError)
}

export { supabase, supabaseError }