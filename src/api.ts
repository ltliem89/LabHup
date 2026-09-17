export const API_URL = import.meta.env.VITE_APPS_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycbzxAOtryNkDMpprEobUZZ-8mU1AE7jFjw_l8K4Qu4PRPIkrI5Pnp71Uzh-p4ciazxlb/exec';

export interface ApiResponse<T = any> {
  ok: boolean;
  code: string;
  message: string;
  data: T;
  request_id?: string;
}

const handleResponse = async (res: Response) => {
  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }
  const json: ApiResponse = await res.json();
  if (!json.ok) {
    throw new Error(json.message || json.code || 'API Error');
  }
  return json.data;
};

export const api = {
  get: async (action: string, params: Record<string, string> = {}) => {
    if (!API_URL) throw new Error('Missing VITE_APPS_SCRIPT_URL');
    const url = new URL(API_URL);
    url.searchParams.append('action', action);
    Object.keys(params).forEach((key) => url.searchParams.append(key, params[key]));

    const response = await fetch(url.toString(), {
      method: 'GET',
    });
    return handleResponse(response);
  },

  post: async (action: string, body: any = {}) => {
    if (!API_URL) throw new Error('Missing VITE_APPS_SCRIPT_URL');
    // using text/plain to avoid CORS preflight issues with Apps Script
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify({ action, ...body }),
    });
    return handleResponse(response);
  },

  bootstrap: async () => {
    return api.get('bootstrap');
  },

  inventory: async () => {
    return api.get('inventory');
  },

  myBorrows: async () => {
    return api.get('my-borrows');
  },

  borrow: async (payload: {
    client_request_id: string;
    room_id: string;
    subject_id: string;
    class_id: string;
    topic_id: string;
    lesson_id: string;
    items: Array<{ equipment_id: string; quantity: number; note?: string }>;
    note?: string;
  }) => {
    return api.post('borrow', payload);
  },

  returnBorrow: async (payload: { borrow_id: string }) => {
    return api.post('return', payload);
  },
};
