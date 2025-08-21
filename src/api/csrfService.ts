// src/api/csrfService.ts
import httpClient from './httpClient';

export const fetchCsrfToken = () => httpClient.get('/auth/csrf');
