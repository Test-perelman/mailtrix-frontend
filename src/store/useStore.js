import { useState, useCallback, useEffect } from 'react';

// In-memory store for job matches (will be populated via webhook)
// In production, this would be backed by a database or localStorage
let globalMatches = [];
let globalThreads = {}; // Keyed by job_id
let listeners = new Set();
let threadListeners = new Set();

const notifyListeners = () => {
  listeners.forEach(listener => listener([...globalMatches]));
};

const notifyThreadListeners = () => {
  threadListeners.forEach(listener => listener({ ...globalThreads }));
};

// Load from localStorage on init
const loadFromStorage = () => {
  try {
    const stored = localStorage.getItem('mailtrix_matches');
    if (stored) {
      globalMatches = JSON.parse(stored);
    }
    const storedThreads = localStorage.getItem('mailtrix_threads');
    if (storedThreads) {
      globalThreads = JSON.parse(storedThreads);
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

const saveThreadsToStorage = () => {
  try {
    localStorage.setItem('mailtrix_threads', JSON.stringify(globalThreads));
  } catch (e) {
    console.error('Failed to save threads to storage:', e);
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
    globalThreads = {};
    saveToStorage();
    saveThreadsToStorage();
    notifyListeners();
    notifyThreadListeners();
  }, []);

  const removeJob = useCallback((jobId) => {
    globalMatches = globalMatches.filter(m => m.job_id !== jobId);
    delete globalThreads[jobId];
    saveToStorage();
    saveThreadsToStorage();
    notifyListeners();
    notifyThreadListeners();
  }, []);

  // Thread management
  const addThreadMessage = useCallback((jobId, message) => {
    if (!globalThreads[jobId]) {
      globalThreads[jobId] = [];
    }
    // Check for duplicate by message id
    const exists = globalThreads[jobId].find(m => m.id === message.id);
    if (!exists) {
      globalThreads[jobId].push(message);
      // Update unread count on job
      const jobIndex = globalMatches.findIndex(m => m.job_id === jobId);
      if (jobIndex >= 0 && message.direction === 'inbound' && !message.is_read) {
        globalMatches[jobIndex].unread_count = (globalMatches[jobIndex].unread_count || 0) + 1;
      }
      saveToStorage();
      saveThreadsToStorage();
      notifyListeners();
      notifyThreadListeners();
    }
  }, []);

  const setThreads = useCallback((jobId, messages) => {
    globalThreads[jobId] = messages;
    // Calculate unread count
    const unreadCount = messages.filter(m => m.direction === 'inbound' && !m.is_read).length;
    const jobIndex = globalMatches.findIndex(m => m.job_id === jobId);
    if (jobIndex >= 0) {
      globalMatches[jobIndex].unread_count = unreadCount;
      globalMatches[jobIndex].thread_count = messages.length;
    }
    saveToStorage();
    saveThreadsToStorage();
    notifyListeners();
    notifyThreadListeners();
  }, []);

  const getThreadsByJobId = useCallback((jobId) => {
    return globalThreads[jobId] || [];
  }, []);

  const markThreadsRead = useCallback((jobId) => {
    if (globalThreads[jobId]) {
      globalThreads[jobId] = globalThreads[jobId].map(m => ({
        ...m,
        is_read: true
      }));
      // Reset unread count
      const jobIndex = globalMatches.findIndex(m => m.job_id === jobId);
      if (jobIndex >= 0) {
        globalMatches[jobIndex].unread_count = 0;
      }
      saveToStorage();
      saveThreadsToStorage();
      notifyListeners();
      notifyThreadListeners();
    }
  }, []);

  return {
    matches,
    addJobMatch,
    updateCandidateStatus,
    setJobStatus,
    getApprovedCandidates,
    clearAll,
    removeJob,
    // Thread methods
    addThreadMessage,
    setThreads,
    getThreadsByJobId,
    markThreadsRead
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

// External function to add thread message (used by webhook handlers)
export const addThreadMessageExternal = (jobId, message) => {
  if (!globalThreads[jobId]) {
    globalThreads[jobId] = [];
  }
  // Check for duplicate
  const exists = globalThreads[jobId].find(m => m.id === message.id);
  if (!exists) {
    globalThreads[jobId].push(message);
    // Update unread count on job
    const jobIndex = globalMatches.findIndex(m => m.job_id === jobId);
    if (jobIndex >= 0 && message.direction === 'inbound' && !message.is_read) {
      globalMatches[jobIndex].unread_count = (globalMatches[jobIndex].unread_count || 0) + 1;
      globalMatches[jobIndex].thread_count = globalThreads[jobId].length;
    }
    saveToStorage();
    saveThreadsToStorage();
    notifyListeners();
    notifyThreadListeners();
  }
};

// Hook to subscribe to thread changes
export const useThreads = () => {
  const [threads, setThreads] = useState({ ...globalThreads });

  useEffect(() => {
    threadListeners.add(setThreads);
    return () => threadListeners.delete(setThreads);
  }, []);

  return threads;
};
