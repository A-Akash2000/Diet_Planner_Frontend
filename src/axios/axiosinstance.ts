import axios from 'axios';
import { ENV } from '../lib/config';
import { getCookie } from '../utils/commonfunc/cookie';
import { encrypt, decrypt } from '../utils/commonfunc/crypto';

const excludedRoutes = ['/api/user/login', '/api/user/add-user'];

export const axiosInstance = axios.create({
  baseURL: ENV.Api_Url,
  timeout: 10000,
});

// Request Interceptor
axiosInstance.interceptors.request.use((config) => {
  const token = getCookie('token');
  const isExcluded = excludedRoutes.some(route => config.url?.includes(route));

  if (token && !isExcluded) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
}, (error) => Promise.reject(error));

// Response Interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response) {
      const { status, data } = error.response;

      let decryptedMessage = '';
      try {
        decryptedMessage = await decrypt<string>(data);
      } catch (decryptionError) {
        decryptedMessage = typeof data === 'string' ? data : JSON.stringify(data);
      }

      console.error(`HTTP Error ${status}:`, decryptedMessage);
      error.decryptedMessage = decryptedMessage;
      return Promise.reject(error);
    } else if (error.request) {
      error.decryptedMessage = 'No response from server';
      return Promise.reject(error);
    } else {
      error.decryptedMessage = 'Request error';
      return Promise.reject(error);
    }
  }
);

// Helpers
const isFormData = (data: any): data is FormData => {
  return typeof FormData !== 'undefined' && data instanceof FormData;
};

export const encryptFormData = async (formData: FormData): Promise<FormData> => {
  const encryptedForm = new FormData();

  for (const [key, value] of formData.entries()) {
    if (value instanceof File) {
      encryptedForm.append(key, value);
    } else {
      const encryptedValue = await encrypt(value.toString());
      encryptedForm.append(key, encryptedValue);
    }
  }

  return encryptedForm;
};

const preparePayload = async (data?: object | FormData): Promise<{ payload: string } | FormData> => {
  if (!data) return { payload: await encrypt('{}') }; // Return a valid encrypted empty object
  if (isFormData(data)) return await encryptFormData(data);
  return { payload: await encrypt(JSON.stringify(data)) };
};


const safeDecrypt = async <T>(data: any): Promise<T> => {
  if (typeof data !== 'string') {
    throw new Error('Expected encrypted string but received non-string data');
  }
  return await decrypt<T>(data);
};

const handleError = (error: any, method: string) => {
  const message = error.decryptedMessage || error.message || 'Unknown error';
  let parsedMessage: any = message;
  try {
    parsedMessage = JSON.parse(message);
  } catch (_) {
    parsedMessage = message;
  }
  console.error(`${method} error:`, parsedMessage);
  return { success: false, data: parsedMessage };
};

// API Methods
export const api = {
  get: async <T>(url: string, params?: object): Promise<{ success: boolean; data?: T; error?: string }> => {
    try {
      const response = await axiosInstance.get<string>(url, { params });
      return { success: true, data: await safeDecrypt<T>(response.data) };
    } catch (error: any) {
      return handleError(error, 'GET');
    }
  },

  post: async <T>(url: string, data?: object | FormData): Promise<{ success: boolean; data?: T; error?: string }> => {
    try {
      const payload = await preparePayload(data);
      const headers = isFormData(data) ? {} : { 'Content-Type': 'application/json' };
      const response = await axiosInstance.post<string>(url, payload, { headers });
      return { success: true, data: await safeDecrypt<T>(response.data) };
    } catch (error: any) {
      return handleError(error, 'POST');
    }
  },

  put: async <T>(url: string, data?: object | FormData): Promise<{ success: boolean; data?: T; error?: string }> => {
    try {
      const payload = await preparePayload(data);
      const headers = isFormData(data) ? {} : { 'Content-Type': 'application/json' };
      const response = await axiosInstance.put<string>(url, payload, { headers });
      return { success: true, data: await safeDecrypt<T>(response.data) };
    } catch (error: any) {
      return handleError(error, 'PUT');
    }
  },

  patch: async <T>(url: string, data?: object | FormData): Promise<{ success: boolean; data?: T; error?: string }> => {
    try {
      const payload = await preparePayload(data);
      const headers = isFormData(data) ? {} : { 'Content-Type': 'application/json' };
      const response = await axiosInstance.patch<string>(url, payload, { headers });
      return { success: true, data: await safeDecrypt<T>(response.data) };
    } catch (error: any) {
      return handleError(error, 'PATCH');
    }
  },

  delete: async <T>(url: string): Promise<{ success: boolean; data?: T; error?: string }> => {
    try {
      const response = await axiosInstance.delete<string>(url);
      return { success: true, data: await safeDecrypt<T>(response.data) };
    } catch (error: any) {
      return handleError(error, 'DELETE');
    }
  }
};
