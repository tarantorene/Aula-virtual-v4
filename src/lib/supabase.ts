import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseClientInstance: SupabaseClient | null = null;

/**
 * Gets the singleton Supabase client instance.
 * Checks for credentials and returns null if not configured,
 * preventing any crash on application startup.
 */
export function getSupabaseClient(): SupabaseClient | null {
  if (supabaseClientInstance) {
    return supabaseClientInstance;
  }

  // 1) Variables de compilación (Vercel/Netlify con variables de entorno) o
  // 2) archivo config.js junto a index.html (sitio ya compilado: se edita sin volver a compilar).
  const enVentana = (typeof window !== 'undefined' ? (window as unknown as { AULA_CONFIG?: { supabaseUrl?: string; supabaseAnonKey?: string } }).AULA_CONFIG : undefined) ?? {};
  // @ts-ignore
  const supabaseUrl: string = import.meta.env.VITE_SUPABASE_URL || enVentana.supabaseUrl || '';
  // @ts-ignore
  const supabaseAnonKey: string = import.meta.env.VITE_SUPABASE_ANON_KEY || enVentana.supabaseAnonKey || '';

  // Gracefully handle missing configuration
  if (!supabaseUrl || !supabaseAnonKey || 
      supabaseUrl === 'https://your-project-id.supabase.co' || 
      supabaseAnonKey === 'your-anon-key-here') {
    return null;
  }

  // Normalize/Sanitize the Supabase URL
  let formattedUrl = supabaseUrl.trim();
  
  // If it's just a project reference ID (no dots, no slashes, e.g., "pcfcafafihtsummdraip")
  if (!formattedUrl.includes('.') && !formattedUrl.includes('/')) {
    formattedUrl = `https://${formattedUrl}.supabase.co`;
  } else if (!/^https?:\/\//i.test(formattedUrl)) {
    formattedUrl = `https://${formattedUrl}`;
  }
  
  // Trim trailing slash
  if (formattedUrl.endsWith('/')) {
    formattedUrl = formattedUrl.slice(0, -1);
  }

  try {
    supabaseClientInstance = createClient(formattedUrl, supabaseAnonKey.trim());
    return supabaseClientInstance;
  } catch (error) {
    console.warn('Error al inicializar el cliente de Supabase:', error);
    return null;
  }
}

let supabaseSyncEnabled = true;

/**
 * Checks if Supabase connection credentials are correctly set up and synchronization is enabled.
 */
export function isSupabaseConfigured(): boolean {
  return getSupabaseClient() !== null && supabaseSyncEnabled;
}

/**
 * Dynamically enables or disables Supabase synchronization (e.g. in case of connection or schema issues).
 */
export function setSupabaseSyncEnabled(enabled: boolean): void {
  supabaseSyncEnabled = enabled;
}
