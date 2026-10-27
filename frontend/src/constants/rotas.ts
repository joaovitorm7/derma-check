import type { Href } from 'expo-router';

export const ROTAS = {
  inicio: '/inicio' as Href,
  login: '/login' as Href,
  cadastro: '/cadastro' as Href,
  esqueciSenha: '/esqueci-senha' as Href,
  explorar: '/explore' as Href,
  aposOnboarding: '/login' as Href,
} as const;