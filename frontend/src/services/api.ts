import axios from 'axios';
import type { ImagePickerAsset } from 'expo-image-picker';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://sad-insects-unite.loca.lt';

export const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Web entrega um File; no nativo o FormData do RN aceita { uri, name, type }.
export function anexarFoto(dados: FormData, foto: ImagePickerAsset) {
  dados.append(
    'foto',
    foto.file ??
      ({ uri: foto.uri, name: foto.fileName || 'foto.jpg', type: foto.mimeType || 'image/jpeg' } as any)
  );
}

export const CABECALHO_UPLOAD = { 'Content-Type': 'multipart/form-data' };

// Fotos salvas no servidor vêm como caminho relativo (/uploads/...).
export function urlFoto(caminho?: string | null) {
  return caminho?.startsWith('/') ? `${api.defaults.baseURL}${caminho}` : caminho ?? undefined;
}

export default api; 