import { createClient } from '@supabase/supabase-js'

const PRODUCTION_SUPABASE_URL = 'https://dvbytrdyauodgdckvegv.supabase.co'
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || (import.meta.env.PROD ? PRODUCTION_SUPABASE_URL : undefined)
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
    supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
      },
      global: {
        fetch: (url, options) => {
          // Add custom fetch with better error handling
          return fetch(url, {
            ...options,
            // Add headers to help with CORS
            headers: {
              ...options?.headers,
              'Content-Type': 'application/json',
            },
          }).catch(err => {
            console.error('Fetch error:', err, 'URL:', url)
            throw err
          })
        },
      },
    })
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