import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'myjournal_token';
const CURRENT_USER_KEY = 'myjournal_current_user';
const PAGES_CACHE_KEY = 'myjournal_pages_cache_v4';

// Change this to your server URL
import { API_BASE } from './config';

async function getToken() {
  try {
    return await AsyncStorage.getItem(TOKEN_KEY);
  } catch (e) {
    return null;
  }
}

async function setToken(token) {
  try {
    if (token) {
      await AsyncStorage.setItem(TOKEN_KEY, token);
    } else {
      await AsyncStorage.removeItem(TOKEN_KEY);
    }
  } catch (e) {}
}

async function getCurrentUser() {
  try {
    return await AsyncStorage.getItem(CURRENT_USER_KEY);
  } catch (e) {
    return null;
  }
}

async function setCurrentUser(username) {
  try {
    if (username) {
      await AsyncStorage.setItem(CURRENT_USER_KEY, username);
    } else {
      await AsyncStorage.removeItem(CURRENT_USER_KEY);
    }
  } catch (e) {}
}

async function getAuthHeaders() {
  const headers = { 'Content-Type': 'application/json' };
  const token = await getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export async function loginUser(username, password) {
  try {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const result = await res.json();
    if (result.success) {
      await setCurrentUser(result.user.username);
      await setToken(result.token);
    }
    return result;
  } catch (e) {
    return { success: false, message: 'Unable to connect to the server.' };
  }
}

export async function registerUser(username, email, password, confirmPassword) {
  try {
    const res = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password, confirmPassword }),
    });
    const result = await res.json();
    if (result.success) {
      await setCurrentUser(result.user.username);
      await setToken(result.token);
    }
    return result;
  } catch (e) {
    return { success: false, message: 'Unable to connect to the server.' };
  }
}

export async function logoutUser() {
  await setCurrentUser(null);
  await setToken(null);
  try {
    await AsyncStorage.removeItem(PAGES_CACHE_KEY);
  } catch (e) {}
}

export async function loadPages(forceRefresh = false) {
  if (!forceRefresh) {
    try {
      const cached = await AsyncStorage.getItem(PAGES_CACHE_KEY);
      if (cached) {
        return { success: true, pages: JSON.parse(cached) };
      }
    } catch (e) {}
  }
  try {
    const res = await fetch(`${API_BASE}/api/pages`, {
      headers: await getAuthHeaders(),
    });
    if (res.status === 401) {
      await logoutUser();
      return { success: false, pages: [], authError: true };
    }
    const result = await res.json();
    if (result.success && result.pages) {
      await AsyncStorage.setItem(PAGES_CACHE_KEY, JSON.stringify(result.pages));
      return result;
    }
    return { success: false, pages: [] };
  } catch (e) {
    try {
      const cached = await AsyncStorage.getItem(PAGES_CACHE_KEY);
      if (cached) {
        return { success: true, pages: JSON.parse(cached), offline: true };
      }
    } catch (e2) {}
    return { success: false, pages: [] };
  }
}

export async function createPage(name) {
  try {
    const res = await fetch(`${API_BASE}/api/pages`, {
      method: 'POST',
      headers: await getAuthHeaders(),
      body: JSON.stringify({ name }),
    });
    const result = await res.json();
    if (result.success) {
      await AsyncStorage.removeItem(PAGES_CACHE_KEY);
    }
    return result;
  } catch (e) {
    return { success: false, message: 'Unable to create page.' };
  }
}

export async function updatePage(pageId, name) {
  try {
    const res = await fetch(`${API_BASE}/api/pages/${encodeURIComponent(pageId)}`, {
      method: 'PUT',
      headers: await getAuthHeaders(),
      body: JSON.stringify({ name }),
    });
    const result = await res.json();
    if (result.success) {
      await AsyncStorage.removeItem(PAGES_CACHE_KEY);
    }
    return result;
  } catch (e) {
    return { success: false, message: 'Unable to update page.' };
  }
}

export async function deletePage(pageId) {
  try {
    const res = await fetch(`${API_BASE}/api/pages/${encodeURIComponent(pageId)}`, {
      method: 'DELETE',
      headers: await getAuthHeaders(),
    });
    const result = await res.json();
    if (result.success) {
      await AsyncStorage.removeItem(PAGES_CACHE_KEY);
    }
    return result;
  } catch (e) {
    return { success: false, message: 'Unable to delete page.' };
  }
}

export async function loadPageOptions(pageId) {
  try {
    const res = await fetch(`${API_BASE}/api/pages/${encodeURIComponent(pageId)}/options`, {
      headers: await getAuthHeaders(),
    });
    return await res.json();
  } catch (e) {
    return { success: false };
  }
}

export async function savePageOptions(pageId, options) {
  try {
    const res = await fetch(`${API_BASE}/api/pages/${encodeURIComponent(pageId)}/options`, {
      method: 'PUT',
      headers: await getAuthHeaders(),
      body: JSON.stringify({ options }),
    });
    const result = await res.json();
    if (result.success) {
      await AsyncStorage.removeItem(PAGES_CACHE_KEY);
    }
    return result;
  } catch (e) {
    return { success: false, message: 'Unable to save options.' };
  }
}

export async function loadTrackerData(pageId, year) {
  try {
    const res = await fetch(`${API_BASE}/api/trackers/${encodeURIComponent(pageId)}/${year}`, {
      headers: await getAuthHeaders(),
    });
    if (res.status === 401) {
      await logoutUser();
      return {};
    }
    const result = await res.json();
    if (result.success && result.data) {
      return result.data;
    }
    return {};
  } catch (e) {
    return {};
  }
}

export async function saveTrackerData(pageId, year, data) {
  try {
    const res = await fetch(`${API_BASE}/api/trackers/${encodeURIComponent(pageId)}/${year}`, {
      method: 'POST',
      headers: await getAuthHeaders(),
      body: JSON.stringify(data),
    });
    const result = await res.json();
    return res.ok && result.success;
  } catch (e) {
    return false;
  }
}

export async function loadHighlights(year) {
  try {
    const res = await fetch(`${API_BASE}/api/highlights/${year}`, {
      headers: await getAuthHeaders(),
    });
    if (res.status === 401) {
      await logoutUser();
      return {};
    }
    const result = await res.json();
    if (result.success && result.data) {
      return result.data;
    }
    return {};
  } catch (e) {
    return {};
  }
}

export async function saveHighlights(year, data) {
  try {
    const res = await fetch(`${API_BASE}/api/highlights/${year}`, {
      method: 'POST',
      headers: await getAuthHeaders(),
      body: JSON.stringify(data),
    });
    const result = await res.json();
    return res.ok && result.success;
  } catch (e) {
    return false;
  }
}

export async function loadProfile() {
  try {
    const res = await fetch(`${API_BASE}/api/auth/me`, {
      headers: await getAuthHeaders(),
    });
    return await res.json();
  } catch (e) {
    return { success: false };
  }
}

export async function updateProfile(data) {
  try {
    const res = await fetch(`${API_BASE}/api/auth/profile`, {
      method: 'PUT',
      headers: await getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return await res.json();
  } catch (e) {
    return { success: false, message: 'Unable to update profile.' };
  }
}

export async function changePassword(data) {
  try {
    const res = await fetch(`${API_BASE}/api/auth/password`, {
      method: 'PUT',
      headers: await getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return await res.json();
  } catch (e) {
    return { success: false, message: 'Unable to change password.' };
  }
}

export async function getOrCreateVisionBoard(timeframe, targetDate) {
  try {
    const res = await fetch(`${API_BASE}/api/vision-boards/${encodeURIComponent(timeframe)}/${encodeURIComponent(targetDate)}`, {
      headers: await getAuthHeaders(),
    });
    return await res.json();
  } catch (e) {
    return { success: false };
  }
}

export async function updateVisionBoardTitle(boardId, title) {
  try {
    const res = await fetch(`${API_BASE}/api/vision-boards/${boardId}`, {
      method: 'PUT',
      headers: await getAuthHeaders(),
      body: JSON.stringify({ title }),
    });
    return await res.json();
  } catch (e) {
    return { success: false };
  }
}

export async function addVisionBoardItem(boardId, itemType, content) {
  try {
    const res = await fetch(`${API_BASE}/api/vision-boards/${boardId}/items`, {
      method: 'POST',
      headers: await getAuthHeaders(),
      body: JSON.stringify({ itemType, content }),
    });
    return await res.json();
  } catch (e) {
    return { success: false };
  }
}

export async function deleteVisionBoardItem(itemId) {
  try {
    const res = await fetch(`${API_BASE}/api/vision-boards/items/${itemId}`, {
      method: 'DELETE',
      headers: await getAuthHeaders(),
    });
    return await res.json();
  } catch (e) {
    return { success: false };
  }
}

export async function getDefaultVisionTarget(timeframe) {
  try {
    const res = await fetch(`${API_BASE}/api/vision-boards/default/${encodeURIComponent(timeframe)}`, {
      headers: await getAuthHeaders(),
    });
    return await res.json();
  } catch (e) {
    return { success: false };
  }
}

export { getToken, setToken, getCurrentUser, setCurrentUser, logoutUser };
