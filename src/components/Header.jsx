import { motion } from 'framer-motion';
import { Mail, Sparkles, Clock } from 'lucide-react';
import styles from './Header.module.css';

export default function Header({ stats }) {
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        {/* Brand section */}
        <motion.div
          className={styles.brand}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className={styles.logoMark}>
            <div className={styles.logoInner}>
              <span className={styles.logoLetter}>M</span>
            </div>
            <div className={styles.logoRing} />
          </div>
          <div className={styles.brandText}>
            <h1 className={styles.title}>Mailtrix</h1>
            <span className={styles.tagline}>Recruiter Intelligence</span>
          </div>
        </motion.div>

        {/* Stats pills */}
        <motion.div
          className={styles.statsRow}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className={styles.statPill}>
            <div className={styles.statIcon}>
              <Mail size={16} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>{stats.totalJobs}</span>
              <span className={styles.statLabel}>Active Jobs</span>
            </div>
          </div>

          <div className={styles.statDivider} />

          <div className={`${styles.statPill} ${stats.pendingApprovals > 0 ? styles.statPillActive : ''}`}>
            <div className={`${styles.statIcon} ${styles.statIconPending}`}>
              <Sparkles size={16} />
            </div>
            <div className={styles.statInfo}>
              <span className={`${styles.statValue} ${stats.pendingApprovals > 0 ? styles.statValueHighlight : ''}`}>
                {stats.pendingApprovals}
              </span>
              <span className={styles.statLabel}>Pending Review</span>
            </div>
            {stats.pendingApprovals > 0 && (
              <motion.div
                className={styles.pendingBadge}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 25 }}
              />
            )}
          </div>
        </motion.div>

        {/* Status indicator */}
        <motion.div
          className={styles.statusSection}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className={styles.statusCard}>
            <div className={styles.statusDot}>
              <span className={styles.statusDotPulse} />
              <span className={styles.statusDotCore} />
            </div>
            <div className={styles.statusText}>
              <span className={styles.statusLabel}>System Status</span>
              <span className={styles.statusValue}>Online</span>
            </div>
          </div>
          <div className={styles.timeDisplay}>
            <Clock size={14} />
            <span>{new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
          </div>
        </motion.div>
      </div>

      {/* Decorative bottom border with gradient */}
      <div className={styles.borderGradient} />
    </header>
  );
}
