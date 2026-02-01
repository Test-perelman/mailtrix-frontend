import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Building2, ChevronDown, ChevronUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import DOMPurify from 'dompurify';
import styles from './MessageBubble.module.css';

const MAX_COLLAPSED_LENGTH = 300;

export default function MessageBubble({ message, index }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const {
    direction,
    from_name,
    from_email,
    body,
    body_html,
    sent_at
  } = message;

  const isInbound = direction === 'inbound';
  const displayName = from_name || from_email?.split('@')[0] || 'Unknown';

  const formattedTime = sent_at
    ? formatDistanceToNow(new Date(sent_at), { addSuffix: true })
    : '';

  // Use HTML if available, otherwise plain text
  const content = body_html || body || '';
  const isLong = content.length > MAX_COLLAPSED_LENGTH;
  const displayContent = isLong && !isExpanded
    ? content.substring(0, MAX_COLLAPSED_LENGTH) + '...'
    : content;

  // Sanitize HTML content
  const sanitizedHtml = body_html
    ? DOMPurify.sanitize(displayContent, {
        ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'a', 'ul', 'ol', 'li', 'span'],
        ALLOWED_ATTR: ['href', 'target', 'rel']
      })
    : null;

  return (
    <motion.div
      className={`${styles.bubble} ${isInbound ? styles.inbound : styles.outbound}`}
      initial={{ opacity: 0, x: isInbound ? -20 : 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className={styles.avatar}>
        {isInbound ? <User size={16} /> : <Building2 size={16} />}
      </div>

      <div className={styles.content}>
        <div className={styles.header}>
          <span className={styles.name}>{displayName}</span>
          <span className={styles.time}>{formattedTime}</span>
        </div>

        <div className={styles.body}>
          {sanitizedHtml ? (
            <div
              className={styles.htmlContent}
              dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
            />
          ) : (
            <p className={styles.textContent}>{displayContent}</p>
          )}
        </div>

        {isLong && (
          <button
            className={styles.expandBtn}
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <>
                <ChevronUp size={14} />
                <span>Show less</span>
              </>
            ) : (
              <>
                <ChevronDown size={14} />
                <span>Show more</span>
              </>
            )}
          </button>
        )}
      </div>
    </motion.div>
  );
}
