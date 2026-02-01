import { motion } from 'framer-motion';
import { User, Award, Clock, Check, X, Sparkles } from 'lucide-react';
import styles from './CandidateRow.module.css';

export default function CandidateRow({ candidate, onApprove, onReject, index }) {
  const {
    candidate_name,
    candidate_email,
    candidate_skills = [],
    candidate_experience,
    match_score,
    match_reason,
    status = 'pending'
  } = candidate;

  const getScoreColor = () => {
    if (match_score >= 85) return 'excellent';
    if (match_score >= 70) return 'good';
    return 'fair';
  };

  const getStatusClass = () => {
    switch (status) {
      case 'approved': return styles.approved;
      case 'rejected': return styles.rejected;
      default: return styles.pending;
    }
  };

  const skillsArray = Array.isArray(candidate_skills)
    ? candidate_skills
    : typeof candidate_skills === 'string'
      ? candidate_skills.split(',').map(s => s.trim())
      : [];

  // Generate initials from name
  const initials = candidate_name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <motion.div
      className={`${styles.row} ${getStatusClass()}`}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Candidate info */}
      <div className={styles.candidateInfo}>
        <div className={styles.avatar} data-score={getScoreColor()}>
          <span className={styles.initials}>{initials}</span>
        </div>
        <div className={styles.details}>
          <div className={styles.nameRow}>
            <span className={styles.name}>{candidate_name}</span>
            {candidate_experience && (
              <span className={styles.experience}>
                <Clock size={12} />
                {candidate_experience} yrs
              </span>
            )}
          </div>
          <span className={styles.email}>{candidate_email}</span>
        </div>
      </div>

      {/* Skills */}
      <div className={styles.skills}>
        {skillsArray.slice(0, 4).map((skill, i) => (
          <span key={i} className={styles.skillTag}>{skill}</span>
        ))}
        {skillsArray.length > 4 && (
          <span className={styles.moreSkills}>+{skillsArray.length - 4}</span>
        )}
      </div>

      {/* Match Score */}
      <div className={styles.scoreSection}>
        <div className={styles.scoreCard} data-score={getScoreColor()}>
          <div className={styles.scoreRing}>
            <svg viewBox="0 0 36 36" className={styles.scoreCircle}>
              <path
                className={styles.scoreTrack}
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className={styles.scoreProgress}
                strokeDasharray={`${match_score}, 100`}
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className={styles.scoreInner}>
              <Award size={12} className={styles.scoreIcon} />
              <span className={styles.scoreValue}>{match_score}</span>
            </div>
          </div>
          <span className={styles.matchReason}>{match_reason}</span>
        </div>
      </div>

      {/* Actions */}
      <div className={styles.actions}>
        {status === 'pending' ? (
          <>
            <motion.button
              className={styles.approveBtn}
              onClick={onApprove}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <Check size={16} strokeWidth={2.5} />
              <span>Approve</span>
            </motion.button>
            <motion.button
              className={styles.rejectBtn}
              onClick={onReject}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <X size={16} strokeWidth={2.5} />
              <span>Pass</span>
            </motion.button>
          </>
        ) : (
          <motion.div
            className={styles.statusBadge}
            data-status={status}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
          >
            {status === 'approved' ? (
              <>
                <Sparkles size={14} />
                <span>Approved</span>
              </>
            ) : (
              <>
                <X size={14} />
                <span>Passed</span>
              </>
            )}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
