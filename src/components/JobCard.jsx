import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Briefcase, MapPin, Clock, Code2, ChevronDown,
  Send, Users, CheckCircle, Loader2, AlertCircle, User, MessageSquare
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import CandidateRow from './CandidateRow';
import ConversationThread from './ConversationThread';
import { useJobMatches } from '../store/useStore';
import styles from './JobCard.module.css';

const N8N_WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL || 'https://n8n.352674918.xyz/webhook/mailtrix-approval';
const API_KEY = import.meta.env.VITE_APPROVAL_API_KEY || '';

export default function JobCard({ job, onUpdateCandidate }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState('candidates'); // 'candidates' or 'conversation'
  const [isSending, setIsSending] = useState(false);
  const [sendStatus, setSendStatus] = useState(null);
  const [managerNotes, setManagerNotes] = useState('');

  const { getThreadsByJobId, setThreads, markThreadsRead } = useJobMatches();

  const {
    job_id,
    job_title,
    job_location,
    recruiter_email,
    recruiter_name,
    received_at,
    required_skills = [],
    min_experience,
    candidates = [],
    unread_count = 0,
    thread_count = 0
  } = job;

  const threads = getThreadsByJobId(job_id);

  const approvedCount = candidates.filter(c => c.status === 'approved').length;
  const pendingCount = candidates.filter(c => c.status === 'pending').length;
  const totalCount = candidates.length;

  const formattedTime = received_at
    ? formatDistanceToNow(new Date(received_at), { addSuffix: true })
    : 'Unknown time';

  const skillsArray = Array.isArray(required_skills)
    ? required_skills
    : typeof required_skills === 'string'
      ? required_skills.split(',').map(s => s.trim())
      : [];

  const handleSendApprovals = async () => {
    const approvedCandidates = candidates
      .filter(c => c.status === 'approved')
      .map(c => ({
        match_id: c.match_id,
        candidate_id: c.candidate_id
      }));

    if (approvedCandidates.length === 0) {
      setSendStatus('error');
      setTimeout(() => setSendStatus(null), 3000);
      return;
    }

    setIsSending(true);
    setSendStatus(null);

    try {
      const response = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(API_KEY && { 'X-API-Key': API_KEY })
        },
        body: JSON.stringify({
          job_id,
          approved_candidates: approvedCandidates,
          manager_notes: managerNotes
        })
      });

      if (response.ok) {
        setSendStatus('success');
      } else {
        throw new Error('Failed to send approvals');
      }
    } catch (error) {
      console.error('Error sending approvals:', error);
      setSendStatus('error');
    } finally {
      setIsSending(false);
      setTimeout(() => setSendStatus(null), 5000);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'conversation' && unread_count > 0) {
      markThreadsRead(job_id);
    }
  };

  const handleRefreshThreads = async (jobId) => {
    // In a real implementation, this would fetch threads from the backend
    // For now, we just trigger a re-render
    console.log('Refreshing threads for job:', jobId);
  };

  return (
    <motion.article
      className={styles.card}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Accent stripe */}
      <div className={styles.accentStripe} />

      {/* Card Header */}
      <div className={styles.header} onClick={() => setIsExpanded(!isExpanded)}>
        <div className={styles.headerMain}>
          <div className={styles.jobIcon}>
            <Briefcase size={22} />
          </div>

          <div className={styles.jobInfo}>
            <h2 className={styles.jobTitle}>{job_title}</h2>
            <div className={styles.jobMeta}>
              <span className={styles.metaItem}>
                <MapPin size={14} />
                {job_location || 'Remote'}
              </span>
              <span className={styles.metaDot} />
              <span className={styles.metaItem}>
                <Clock size={14} />
                {formattedTime}
              </span>
              {min_experience && (
                <>
                  <span className={styles.metaDot} />
                  <span className={styles.metaItem}>{min_experience}+ years</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className={styles.headerRight}>
          {/* Recruiter info */}
          <div className={styles.recruiterCard}>
            <div className={styles.recruiterAvatar}>
              <User size={16} />
            </div>
            <div className={styles.recruiterInfo}>
              <span className={styles.recruiterName}>{recruiter_name || 'Unknown Recruiter'}</span>
              <span className={styles.recruiterEmail}>{recruiter_email}</span>
            </div>
          </div>

          {/* Stats badges */}
          <div className={styles.statsBadges}>
            <div className={styles.badge}>
              <Users size={14} />
              <span>{totalCount}</span>
            </div>
            {approvedCount > 0 && (
              <div className={`${styles.badge} ${styles.badgeSuccess}`}>
                <CheckCircle size={14} />
                <span>{approvedCount}</span>
              </div>
            )}
            {pendingCount > 0 && (
              <div className={`${styles.badge} ${styles.badgePending}`}>
                <span className={styles.pendingDot} />
                <span>{pendingCount}</span>
              </div>
            )}
            {/* Thread/Message badge */}
            {(thread_count > 0 || threads.length > 0) && (
              <div className={`${styles.badge} ${styles.badgeMessage} ${unread_count > 0 ? styles.badgeUnread : ''}`}>
                <MessageSquare size={14} />
                <span>{threads.length || thread_count}</span>
                {unread_count > 0 && (
                  <span className={styles.unreadIndicator}>{unread_count}</span>
                )}
              </div>
            )}
          </div>

          {/* Expand button */}
          <motion.button
            className={styles.expandButton}
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <ChevronDown size={20} />
          </motion.button>
        </div>
      </div>

      {/* Skills Row */}
      <div className={styles.skillsRow}>
        <Code2 size={16} className={styles.skillsIcon} />
        <div className={styles.skillsList}>
          {skillsArray.map((skill, i) => (
            <span key={i} className={styles.skillChip}>{skill}</span>
          ))}
        </div>
      </div>

      {/* Expandable Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className={styles.expandedContent}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Tab navigation */}
            <div className={styles.tabNav}>
              <button
                className={`${styles.tabBtn} ${activeTab === 'candidates' ? styles.tabActive : ''}`}
                onClick={(e) => { e.stopPropagation(); handleTabChange('candidates'); }}
              >
                <Users size={16} />
                <span>Candidates</span>
                <span className={styles.tabCount}>{totalCount}</span>
              </button>
              <button
                className={`${styles.tabBtn} ${activeTab === 'conversation' ? styles.tabActive : ''}`}
                onClick={(e) => { e.stopPropagation(); handleTabChange('conversation'); }}
              >
                <MessageSquare size={16} />
                <span>Conversation</span>
                {threads.length > 0 && <span className={styles.tabCount}>{threads.length}</span>}
                {unread_count > 0 && <span className={styles.unreadBadge}>{unread_count}</span>}
              </button>
            </div>

            {/* Tab content */}
            {activeTab === 'candidates' ? (
              <>
                {/* Candidates section header */}
                <div className={styles.sectionHeader}>
                  <span className={styles.sectionTitle}>Matched Candidates</span>
                  <span className={styles.sectionCount}>{totalCount} total</span>
                </div>

                {/* Candidates list */}
                <div className={styles.candidatesList}>
                  {candidates.map((candidate, index) => (
                    <CandidateRow
                      key={candidate.candidate_id || index}
                      candidate={candidate}
                      index={index}
                      onApprove={() => onUpdateCandidate(job_id, candidate.candidate_id, 'approved')}
                      onReject={() => onUpdateCandidate(job_id, candidate.candidate_id, 'rejected')}
                    />
                  ))}
                </div>

                {/* Action bar */}
                {approvedCount > 0 && (
                  <div className={styles.actionBar}>
                    <div className={styles.notesField}>
                      <label className={styles.notesLabel}>Add notes for recruiter</label>
                      <input
                        type="text"
                        className={styles.notesInput}
                        placeholder="Optional notes about the candidates..."
                        value={managerNotes}
                        onChange={(e) => setManagerNotes(e.target.value)}
                      />
                    </div>

                    <div className={styles.sendSection}>
                      <span className={styles.selectedCount}>
                        {approvedCount} candidate{approvedCount !== 1 ? 's' : ''} ready
                      </span>
                      <motion.button
                        className={`${styles.sendButton} ${sendStatus === 'success' ? styles.sendSuccess : ''} ${sendStatus === 'error' ? styles.sendError : ''}`}
                        onClick={handleSendApprovals}
                        disabled={isSending || sendStatus === 'success'}
                        whileHover={{ scale: isSending ? 1 : 1.02 }}
                        whileTap={{ scale: isSending ? 1 : 0.98 }}
                      >
                        {isSending ? (
                          <>
                            <Loader2 size={18} className={styles.spinner} />
                            <span>Sending...</span>
                          </>
                        ) : sendStatus === 'success' ? (
                          <>
                            <CheckCircle size={18} />
                            <span>Sent!</span>
                          </>
                        ) : sendStatus === 'error' ? (
                          <>
                            <AlertCircle size={18} />
                            <span>Failed</span>
                          </>
                        ) : (
                          <>
                            <Send size={18} />
                            <span>Send to Recruiter</span>
                          </>
                        )}
                      </motion.button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className={styles.conversationSection}>
                <ConversationThread
                  jobId={job_id}
                  threads={threads}
                  onRefresh={handleRefreshThreads}
                />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
}
