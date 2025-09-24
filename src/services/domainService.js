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
    throw e;
  }
}

export async function listDomains({ force } = {}) {
  const now = Date.now();
  if(!force && domainCache && (now - domainCacheTs) < CACHE_TTL_MS){
    return domainCache;
  }
  const { data } = await request(()=>api.get(API_BASE));
  domainCache = data;
  domainCacheTs = now;
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

const domainService = {
  listDomains,
  createDomain,
  getDomain,
  regenerateDkim,
  verifyDomain,
};

export default domainService;
