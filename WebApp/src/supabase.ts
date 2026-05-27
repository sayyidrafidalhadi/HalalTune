import { createClient } from "@supabase/supabase-js"

const supabaseUrl = "https://iyixgzdhvdsictyopbao.supabase.co"
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml5aXhnemRodmRzaWN0eW9wYmFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4NTI5NTAsImV4cCI6MjA5NTQyODk1MH0.xIck-6Cen7WLTfk4yltTwR7gN1aF9qaG4D4Q30R2bF8"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
