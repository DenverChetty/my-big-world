import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL=https://bmpiymiloblzowjqpcls.supabase.co;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_2cfNSLHmgkhylZQUz6ty9Q_YYSJe6tP;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
