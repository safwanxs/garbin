/**
 * Global API Configuration
 * Driven by VITE_API_URL environment variable or falls back to same-origin /api
 */
export const API_BASE = import.meta.env.VITE_API_URL || '/api';
