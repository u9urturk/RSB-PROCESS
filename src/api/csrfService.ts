// src/api/csrfService.ts
import { apiGet } from './httpClient';

export const fetchCsrfToken = async () => await apiGet('/auth/csrf');
