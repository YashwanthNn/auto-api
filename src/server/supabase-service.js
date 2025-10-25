// src/server/supabase-service.js
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
// Load environment variables from .env file
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !serviceKey) {
  throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in environment variables.");
}

// Create the Supabase client using the Service Role Key
// This client has elevated privileges (bypasses RLS) and is only used on the server.
export const supabase = createClient(supabaseUrl, serviceKey, {
  auth: {
    persistSession: false, // Prevents storing a session, as this is a server process
  }
});