import { useState, useCallback, useEffect } from 'react';

// In-memory store for job matches (will be populated via webhook)
// In production, this would be backed by a database or localStorage
let globalMatches = [];
let listeners = new Set();

const notifyListeners = () => {
  listeners.forEach(listener => listener([...globalMatches]));
};

// Load from localStorage on init
const loadFromStorage = () => {
  try {
    const stored = localStorage.getItem('mailtrix_matches');
    if (stored) {
      globalMatches = JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load from storage:', e);
  }
};

const saveToStorage = () => {
  try {
    localStorage.setItem('mailtrix_matches', JSON.stringify(globalMatches));
  } catch (e) {
    console.error('Failed to save to storage:', e);
  }
};

// Initialize from storage
loadFromStorage();

export const useJobMatches = () => {
  const [matches, setMatches] = useState([...globalMatches]);

  useEffect(() => {
    listeners.add(setMatches);
    return () => listeners.delete(setMatches);
  }, []);

  const addJobMatch = useCallback((jobMatch) => {
    // Check if job already exists, update if so
    const existingIndex = globalMatches.findIndex(m => m.job_id === jobMatch.job_id);
    if (existingIndex >= 0) {
      globalMatches[existingIndex] = {
        ...globalMatches[existingIndex],
        ...jobMatch,
        candidates: jobMatch.candidates.map(c => ({
          ...c,
          status: globalMatches[existingIndex].candidates.find(
            ec => ec.candidate_id === c.candidate_id
          )?.status || 'pending'
        }))
      };
    } else {
      globalMatches.unshift({
        ...jobMatch,
        candidates: jobMatch.candidates.map(c => ({ ...c, status: 'pending' })),
        created_at: new Date().toISOString()
      });
    }
    saveToStorage();
    notifyListeners();
  }, []);

  const updateCandidateStatus = useCallback((jobId, candidateId, status) => {
    const jobIndex = globalMatches.findIndex(m => m.job_id === jobId);
    if (jobIndex >= 0) {
      const candIndex = globalMatches[jobIndex].candidates.findIndex(
        c => c.candidate_id === candidateId
      );
      if (candIndex >= 0) {
        globalMatches[jobIndex].candidates[candIndex].status = status;
        saveToStorage();
        notifyListeners();
      }
    }
  }, []);

  const setJobStatus = useCallback((jobId, status) => {
    const jobIndex = globalMatches.findIndex(m => m.job_id === jobId);
    if (jobIndex >= 0) {
      globalMatches[jobIndex].status = status;
      saveToStorage();
      notifyListeners();
    }
  }, []);

  const getApprovedCandidates = useCallback((jobId) => {
    const job = globalMatches.find(m => m.job_id === jobId);
    if (!job) return [];
    return job.candidates.filter(c => c.status === 'approved');
  }, []);

  const clearAll = useCallback(() => {
    globalMatches = [];
    saveToStorage();
    notifyListeners();
  }, []);

  const removeJob = useCallback((jobId) => {
    globalMatches = globalMatches.filter(m => m.job_id !== jobId);
    saveToStorage();
    notifyListeners();
  }, []);

  return {
    matches,
    addJobMatch,
    updateCandidateStatus,
    setJobStatus,
    getApprovedCandidates,
    clearAll,
    removeJob
  };
};

// Export for external use (e.g., from webhook handler)
export const addJobMatchExternal = (jobMatch) => {
  const existingIndex = globalMatches.findIndex(m => m.job_id === jobMatch.job_id);
  if (existingIndex >= 0) {
    globalMatches[existingIndex] = {
      ...globalMatches[existingIndex],
      ...jobMatch,
      candidates: jobMatch.candidates.map(c => ({
        ...c,
        status: globalMatches[existingIndex].candidates.find(
          ec => ec.candidate_id === c.candidate_id
        )?.status || 'pending'
      }))
    };
  } else {
    globalMatches.unshift({
      ...jobMatch,
      candidates: jobMatch.candidates.map(c => ({ ...c, status: 'pending' })),
      created_at: new Date().toISOString()
    });
  }
  saveToStorage();
  notifyListeners();
};
