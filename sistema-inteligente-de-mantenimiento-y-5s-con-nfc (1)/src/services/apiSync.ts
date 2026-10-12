import { Machine, PlantStation, AppUser } from '../types';

export interface SyncData {
  machines: Machine[];
  stations: PlantStation[];
  users: AppUser[];
  updatedAt: number;
}

export interface ServerStatusResponse {
  status: 'online' | 'offline';
  updatedAt?: number;
  serverTime?: string;
  machineCount?: number;
}

const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

// Check server status
export async function checkServerStatus(): Promise<ServerStatusResponse> {
  try {
    const res = await fetch(`${API_BASE}/api/status`, {
      headers: { Accept: 'application/json' },
      cache: 'no-cache',
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return {
      status: 'online',
      updatedAt: data.updatedAt,
      serverTime: data.serverTime,
      machineCount: data.machineCount,
    };
  } catch {
    return { status: 'offline' };
  }
}

// Fetch all data from server
export async function fetchServerData(): Promise<SyncData | null> {
  try {
    const res = await fetch(`${API_BASE}/api/sync`, {
      headers: { Accept: 'application/json' },
      cache: 'no-cache',
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[apiSync] Failed to fetch server data:', err);
    return null;
  }
}

// Sync full state to server
export async function syncAllToServer(data: {
  machines?: Machine[];
  users?: AppUser[];
  stations?: PlantStation[];
}): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/api/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.ok;
  } catch (err) {
    console.warn('[apiSync] Failed to sync to server:', err);
    return false;
  }
}

// Sync machines to server
export async function syncMachinesToServer(machines: Machine[]): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/api/machines`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(machines),
    });
    return res.ok;
  } catch (err) {
    console.warn('[apiSync] Failed to sync machines:', err);
    return false;
  }
}

// Update single machine on server
export async function updateMachineOnServer(machineId: string, updates: Partial<Machine>): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/api/machines/${encodeURIComponent(machineId)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    return res.ok;
  } catch (err) {
    console.warn('[apiSync] Failed to update machine:', err);
    return false;
  }
}

// Sync users to server
export async function syncUsersToServer(users: AppUser[]): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/api/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(users),
    });
    return res.ok;
  } catch (err) {
    console.warn('[apiSync] Failed to sync users:', err);
    return false;
  }
}

// Reset database on server
export async function resetServerDatabase(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/api/reset`, {
      method: 'POST',
    });
    return res.ok;
  } catch (err) {
    console.warn('[apiSync] Failed to reset database:', err);
    return false;
  }
}
