import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Trash2, Plus, Sparkles } from 'lucide-react';
import Header from './components/Header';
import JobCard from './components/JobCard';
import EmptyState from './components/EmptyState';
import { useJobMatches, addJobMatchExternal } from './store/useStore';
import styles from './App.module.css';

// Demo data for testing
const DEMO_JOB = {
  job_id: 'JOB' + Date.now(),
  job_title: 'Senior Java Developer',
  job_location: 'San Francisco, CA',
  recruiter_email: 'recruiter@techvendor.com',
  recruiter_name: 'Sarah Johnson',
  received_at: new Date().toISOString(),
  required_skills: ['Java', 'Spring Boot', 'Microservices', 'AWS', 'Kafka'],
  min_experience: 5,
  candidates: [
    {
      match_id: 'MATCH001',
      candidate_id: 'CAND001',
      candidate_name: 'John Smith',
      candidate_email: 'john.smith@email.com',
      candidate_skills: ['Java', 'Spring Boot', 'AWS', 'Docker'],
      candidate_experience: 7,
      match_score: 92,
      match_reason: 'Strong Java/Spring expertise, AWS certified, local'
    },
    {
      match_id: 'MATCH002',
      candidate_id: 'CAND002',
      candidate_name: 'Emily Chen',
      candidate_email: 'emily.chen@email.com',
      candidate_skills: ['Java', 'Microservices', 'Kafka', 'Kubernetes'],
      candidate_experience: 5,
      match_score: 87,
      match_reason: 'Excellent microservices experience, H1B ready'
    },
    {
      match_id: 'MATCH003',
      candidate_id: 'CAND003',
      candidate_name: 'Michael Rodriguez',
      candidate_email: 'michael.r@email.com',
      candidate_skills: ['Java', 'Spring', 'React', 'PostgreSQL'],
      candidate_experience: 6,
      match_score: 74,
      match_reason: 'Good Java skills, willing to relocate'
    }
  ]
};

function App() {
  const { matches, addJobMatch, updateCandidateStatus, clearAll } = useJobMatches();
  const [isLoading, setIsLoading] = useState(false);

  // Calculate stats
  const stats = {
    totalJobs: matches.length,
    pendingApprovals: matches.reduce(
      (acc, job) => acc + job.candidates.filter(c => c.status === 'pending').length,
      0
    )
  };

  // Set up message listener for webhook data (via Netlify function redirect)
  useEffect(() => {
    // Check URL for incoming data (fallback mechanism)
    const params = new URLSearchParams(window.location.search);
    const data = params.get('data');
    if (data) {
      try {
        const jobMatch = JSON.parse(decodeURIComponent(data));
        addJobMatch(jobMatch);
        // Clear the URL params
        window.history.replaceState({}, '', window.location.pathname);
      } catch (e) {
        console.error('Failed to parse incoming data:', e);
      }
    }

    // Poll for new data from localStorage (set by serverless function)
    const pollInterval = setInterval(() => {
      const pending = localStorage.getItem('mailtrix_pending');
      if (pending) {
        try {
          const jobs = JSON.parse(pending);
          jobs.forEach(job => addJobMatch(job));
          localStorage.removeItem('mailtrix_pending');
        } catch (e) {
          console.error('Failed to process pending jobs:', e);
        }
      }
    }, 2000);

    return () => clearInterval(pollInterval);
  }, [addJobMatch]);

  const handleAddDemo = () => {
    setIsLoading(true);
    setTimeout(() => {
      addJobMatch({
        ...DEMO_JOB,
        job_id: 'JOB' + Date.now(),
        received_at: new Date().toISOString()
      });
      setIsLoading(false);
    }, 500);
  };

  const handleClearAll = () => {
    if (confirm('Clear all job matches? This cannot be undone.')) {
      clearAll();
    }
  };

  return (
    <div className={styles.app}>
      {/* Ambient background */}
      <div className="ambient-bg" />

      {/* Header */}
      <Header stats={stats} />

      {/* Main content */}
      <main className={styles.main}>
        {/* Toolbar */}
        <div className={styles.toolbar}>
          <div className={styles.toolbarLeft}>
            <h2 className={styles.pageTitle}>Job Matches</h2>
            <span className={styles.pageSubtitle}>Review and approve candidate submissions</span>
          </div>

          <div className={styles.toolbarRight}>
            <motion.button
              className={styles.addDemoBtn}
              onClick={handleAddDemo}
              disabled={isLoading}
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
            >
              {isLoading ? (
                <RefreshCw size={16} className={styles.spinning} />
              ) : (
                <Plus size={16} />
              )}
              <span>Add Demo</span>
            </motion.button>

            {matches.length > 0 && (
              <motion.button
                className={styles.clearBtn}
                onClick={handleClearAll}
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
              >
                <Trash2 size={16} />
                <span>Clear All</span>
              </motion.button>
            )}
          </div>
        </div>

        {/* Content area */}
        <div className={styles.content}>
          <AnimatePresence mode="wait">
            {matches.length === 0 ? (
              <EmptyState key="empty" />
            ) : (
              <motion.div
                key="jobs"
                className={styles.jobsList}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {matches.map((job, index) => (
                  <JobCard
                    key={job.job_id}
                    job={job}
                    onUpdateCandidate={updateCandidateStatus}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerBrand}>
            <Sparkles size={14} />
            <span>Mailtrix</span>
          </div>
          <span className={styles.footerDivider} />
          <span className={styles.footerText}>Recruiter Intelligence System</span>
        </div>
        <div className={styles.footerWebhook}>
          <span className={styles.footerLabel}>Webhook:</span>
          <code className={styles.footerCode}>
            {import.meta.env.VITE_N8N_WEBHOOK_URL || 'https://n8n.352674918.xyz/webhook/approval'}
          </code>
        </div>
      </footer>
    </div>
  );
}

export default App;
