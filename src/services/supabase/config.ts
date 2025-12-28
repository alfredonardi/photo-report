import { createClient } from '@supabase/supabase-js';

/**
 * Configuração do Supabase
 *
 * IMPORTANTE: Você precisa configurar as variáveis de ambiente:
 * - VITE_SUPABASE_URL: URL do seu projeto Supabase
 * - VITE_SUPABASE_ANON_KEY: Chave pública (anon key) do Supabase
 *
 * Essas variáveis são configuradas no Netlify (Site Settings → Environment Variables)
 * Ver SUPABASE_SETUP.md para instruções completas
 */

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Verifica se as credenciais estão configuradas
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '⚠️ Supabase não configurado. Autenticação e PDFs não funcionarão.\n' +
    'Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no Netlify.\n' +
    'Ver SUPABASE_AUTH_SETUP.md para instruções.'
  );
}

/**
 * Cliente do Supabase
 * Usado para autenticação, storage e database
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

/**
 * Verifica se o Supabase está configurado
 */
export const isSupabaseConfigured = (): boolean => {
  return !!(supabaseUrl && supabaseAnonKey);
};
