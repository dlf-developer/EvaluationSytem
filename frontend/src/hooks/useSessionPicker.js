import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { getUserId } from '../Utils/auth';

// REACT_APP_API_URL already includes /api (e.g. http://localhost:8001/api)
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8001/api';

// The three academic sessions available in the dropdown
export const SESSIONS = ['2024-2025', '2025-2026', '2026-2027'];

// Derive the current default session based on today's date:
// After April 1 the new academic year has begun, so bump forward.
const deriveDefaultSession = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1; // 1-indexed
  const startYear = month >= 4 ? year : year - 1;
  const session = `${startYear}-${startYear + 1}`;
  return SESSIONS.includes(session) ? session : SESSIONS[1]; // fallback to middle option
};

/**
 * useSessionPicker
 * Loads the user's saved session from the backend on mount,
 * and exposes `session` + `changeSession()` for the sidebar dropdown.
 */
export function useSessionPicker() {
  const userData = getUserId();
  const userId = userData?._id || userData?.id || null;

  const [session, setSession] = useState(deriveDefaultSession());
  const [loading, setLoading] = useState(false);

  // Fetch persisted session from backend
  useEffect(() => {
    if (!userId) return;
    axios
      .get(`${API_URL}/session/${userId}`)
      .then((res) => {
        if (res.data?.session) {
          setSession(res.data.session);
        }
      })
      .catch(() => {
        // Silently keep the derived default on error
      });
  }, [userId]);

  const changeSession = useCallback(
    async (newSession) => {
      setSession(newSession);
      if (!userId) return;
      setLoading(true);
      try {
        await axios.post(`${API_URL}/session/set`, {
          userId,
          session: newSession,
        });
        // Reload the entire app so all components re-fetch data for the new session
        window.location.reload();
      } catch (err) {
        console.error('Failed to persist session:', err);
      } finally {
        setLoading(false);
      }
    },
    [userId]
  );

  return { session, changeSession, loading, userId };
}
