import axios from 'axios';

// ATENÇÃO PARA O ENDEREÇO IP:
// - Emulador Android: 'http://10.0.2.2:3000'
// - Simulador iOS: 'http://localhost:3000'
// - Dispositivo Físico (Expo Go no celular): 'http://SEU_IP_LOCAL:3000' (ex: http://192.168.1.15:3000)
const API_URL = 'http://192.168.1.8:3000';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 segundos de timeout
});