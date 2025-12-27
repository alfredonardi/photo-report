import { createClient, SupabaseClient } from '@supabase/supabase-js';

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

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let supabase: SupabaseClient | null = null;

/**
 * Retorna cliente do Supabase
 * Se as credenciais não estiverem configuradas, retorna null
 */
export const getSupabaseClient = (): SupabaseClient | null => {
  // Se já foi inicializado, retorna a instância
  if (supabase) {
    return supabase;
  }

  // Verifica se as credenciais estão configuradas
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn(
      '⚠️ Supabase não configurado. PDFs não serão salvos na nuvem.\n' +
      'Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no Netlify.\n' +
      'Ver SUPABASE_SETUP.md para instruções.'
    );
    return null;
  }

  // Inicializa o cliente
  supabase = createClient(supabaseUrl, supabaseAnonKey);
  return supabase;
};

/**
 * Verifica se o Supabase está configurado
 */
export const isSupabaseConfigured = (): boolean => {
  return !!(supabaseUrl && supabaseAnonKey);
};
