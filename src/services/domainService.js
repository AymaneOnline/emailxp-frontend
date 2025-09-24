// emailxp/frontend/src/services/domainService.js

import api from './api';
import { store } from '../store/store';
import { logout, reset } from '../store/slices/authSlice';

// api instance already has baseURL '/api'
// Backend mounts router: app.use('/api/sending-domains', domainAuthRoutes)
const API_BASE = '/sending-domains';

// Simple in-memory cache (lifetime reset on tab refresh)
let domainCache = null;
let domainCacheTs = 0;
const CACHE_TTL_MS = 30_000; // 30s; adjust as needed

async function request(fn){
  try {
    return await fn();
  } catch (e) {
    const status = e.response?.status;
    if(status === 401){
      // Normalize: clear auth state only if we currently believe we have a user
      if(store.getState().auth.user){
        store.dispatch(logout());
        store.dispatch(reset());
      }
      const err = new Error('AUTH_REQUIRED');
      err.original = e;
      throw err;
    }
    // Handle rate limiting
    if(status === 429){
      const err = new Error('RATE_LIMITED');
      err.original = e;
      err.retryAfter = e.response?.headers?.['retry-after'];
      throw err;
    }
    // Handle validation errors
    if(status === 400 && e.response?.data?.message){
      const err = new Error(e.response.data.message);
      err.original = e;
      throw err;
    }
    throw e;
  }
}

export async function listDomains({ force, page = 1, limit = 20, search, status } = {}) {
  const now = Date.now();
  if(!force && domainCache && (now - domainCacheTs) < CACHE_TTL_MS && !search && !status && page === 1){
    return domainCache;
  }

  const params = new URLSearchParams();
  if (page && page !== 1) params.append('page', page);
  if (limit && limit !== 20) params.append('limit', limit);
  if (search) params.append('search', search);
  if (status) params.append('status', status);

  const queryString = params.toString();
  const url = queryString ? `${API_BASE}?${queryString}` : API_BASE;

  const { data } = await request(()=>api.get(url));

  // Ensure we always return an array for backward compatibility
  const domains = data.domains || data || [];
  domainCache = domains;
  domainCacheTs = now;
  return domains;
}

export async function getDomainStats() {
  const { data } = await request(()=>api.get(`${API_BASE}/stats`));
  return data;
}

export async function createDomain(domain) {
  const { data } = await request(()=>api.post(API_BASE, { domain }));
  // Invalidate cache
  domainCache = null;
  return data;
}

export async function getDomain(id) {
  const { data } = await request(()=>api.get(`${API_BASE}/${id}`));
  return data;
}

export async function regenerateDkim(id) {
  const { data } = await request(()=>api.post(`${API_BASE}/${id}/regenerate-dkim`));
  domainCache = null; // may change verification status
  return data;
}

export async function verifyDomain(id) {
  const { data } = await request(()=>api.post(`${API_BASE}/${id}/verify`));
  domainCache = null; // verification state changed
  return data;
}

export async function setPrimaryDomain(id) {
  const { data } = await request(()=>api.put(`${API_BASE}/${id}/primary`));
  domainCache = null; // Invalidate cache
  return data;
}

export async function deleteDomain(id) {
  const { data } = await request(()=>api.delete(`${API_BASE}/${id}`));
  domainCache = null; // Invalidate cache
  return data;
}

const domainService = {
  listDomains,
  createDomain,
  getDomain,
  regenerateDkim,
  verifyDomain,
  getDomainStats,
  setPrimaryDomain,
  deleteDomain,
};
