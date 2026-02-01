import { motion } from 'framer-motion';
import { Inbox, Sparkles, ArrowRight, Zap } from 'lucide-react';
import styles from './EmptyState.module.css';

export default function EmptyState() {
  return (
    <motion.div
      className={styles.container}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Decorative background elements */}
      <div className={styles.bgDecor}>
        <div className={styles.circle1} />
        <div className={styles.circle2} />
        <div className={styles.circle3} />
      </div>

      <motion.div
        className={styles.content}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Icon */}
        <div className={styles.iconWrapper}>
          <div className={styles.iconBg}>
            <Inbox size={40} className={styles.icon} />
          </div>
          <div className={styles.iconRing1} />
          <div className={styles.iconRing2} />
        </div>

        {/* Text content */}
        <h2 className={styles.title}>Waiting for job matches</h2>
        <p className={styles.description}>
          New job matches will appear here automatically when your n8n workflow
          processes incoming recruiter emails. It's like magic, but with webhooks.
        </p>

        {/* Status indicator */}
        <div className={styles.statusPill}>
          <span className={styles.statusDot} />
          <span className={styles.statusText}>Webhook listening</span>
          <Zap size={14} className={styles.statusIcon} />
        </div>

        {/* Endpoint info */}
        <div className={styles.endpointCard}>
          <div className={styles.endpointHeader}>
            <span className={styles.endpointLabel}>Your webhook endpoint</span>
            <span className={styles.methodBadge}>POST</span>
          </div>
          <code className={styles.endpointUrl}>{window.location.origin}/api/matches</code>
        </div>

        {/* How it works section */}
        <div className={styles.howItWorks}>
          <span className={styles.howLabel}>How it works</span>
          <div className={styles.flowSteps}>
            <div className={styles.flowStep}>
              <div className={styles.stepIcon}>
                <span>1</span>
              </div>
              <span className={styles.stepText}>Email arrives</span>
            </div>
            <ArrowRight size={16} className={styles.flowArrow} />
            <div className={styles.flowStep}>
              <div className={styles.stepIcon}>
                <span>2</span>
              </div>
              <span className={styles.stepText}>n8n processes</span>
            </div>
            <ArrowRight size={16} className={styles.flowArrow} />
            <div className={styles.flowStep}>
              <div className={styles.stepIcon}>
                <Sparkles size={14} />
              </div>
              <span className={styles.stepText}>Matches appear</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Placeholder cards */}
      <motion.div
        className={styles.placeholderGrid}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        {[1, 2, 3].map((i) => (
          <div key={i} className={styles.placeholderCard} style={{ animationDelay: `${i * 0.2}s` }}>
            <div className={styles.placeholderHeader}>
              <div className={styles.placeholderIcon} />
              <div className={styles.placeholderLines}>
                <div className={styles.placeholderLine} style={{ width: '70%' }} />
                <div className={styles.placeholderLine} style={{ width: '50%' }} />
              </div>
            </div>
            <div className={styles.placeholderBody}>
              <div className={styles.placeholderLine} style={{ width: '90%' }} />
              <div className={styles.placeholderLine} style={{ width: '75%' }} />
              <div className={styles.placeholderLine} style={{ width: '60%' }} />
            </div>
          </div>
        ))}
      </motion.div>
    </motion.div>
  );
}
