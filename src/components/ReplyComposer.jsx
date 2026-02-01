import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Send, Loader2, CheckCircle, AlertCircle,
  Bold, Italic, Link2
} from 'lucide-react';
import styles from './ReplyComposer.module.css';

export default function ReplyComposer({ onSend, isSending, sendStatus, disabled }) {
  const [content, setContent] = useState('');
  const textareaRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim() || isSending || disabled) return;

    onSend(content);
    if (sendStatus !== 'error') {
      setContent('');
    }
  };

  const insertFormatting = (prefix, suffix = prefix) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const before = content.substring(0, start);
    const after = content.substring(end);

    const newText = before + prefix + selectedText + suffix + after;
    setContent(newText);

    // Reset cursor position after the formatting
    setTimeout(() => {
      textarea.focus();
      const newPosition = start + prefix.length + selectedText.length + suffix.length;
      textarea.setSelectionRange(
        selectedText ? newPosition : start + prefix.length,
        selectedText ? newPosition : start + prefix.length
      );
    }, 0);
  };

  const handleBold = () => insertFormatting('**');
  const handleItalic = () => insertFormatting('_');
  const handleLink = () => {
    const url = prompt('Enter URL:');
    if (url) {
      const textarea = textareaRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = content.substring(start, end) || 'link text';
      const before = content.substring(0, start);
      const after = content.substring(end);

      setContent(before + `[${selectedText}](${url})` + after);
    }
  };

  const handleKeyDown = (e) => {
    // Ctrl/Cmd + Enter to submit
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit(e);
    }
    // Ctrl/Cmd + B for bold
    if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
      e.preventDefault();
      handleBold();
    }
    // Ctrl/Cmd + I for italic
    if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
      e.preventDefault();
      handleItalic();
    }
  };

  const isDisabled = disabled || isSending;
  const isEmpty = !content.trim();

  return (
    <form onSubmit={handleSubmit} className={styles.composer}>
      <div className={styles.toolbar}>
        <button
          type="button"
          className={styles.toolbarBtn}
          onClick={handleBold}
          disabled={isDisabled}
          title="Bold (Ctrl+B)"
        >
          <Bold size={14} />
        </button>
        <button
          type="button"
          className={styles.toolbarBtn}
          onClick={handleItalic}
          disabled={isDisabled}
          title="Italic (Ctrl+I)"
        >
          <Italic size={14} />
        </button>
        <button
          type="button"
          className={styles.toolbarBtn}
          onClick={handleLink}
          disabled={isDisabled}
          title="Insert Link"
        >
          <Link2 size={14} />
        </button>
      </div>

      <div className={styles.inputWrapper}>
        <textarea
          ref={textareaRef}
          className={styles.textarea}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={disabled ? "Send candidates first to start a conversation..." : "Type your reply... (Ctrl+Enter to send)"}
          disabled={isDisabled}
          rows={3}
        />

        <div className={styles.actions}>
          <span className={styles.hint}>
            {content.length > 0 && `${content.length} characters`}
          </span>

          <motion.button
            type="submit"
            className={`${styles.sendBtn} ${sendStatus === 'success' ? styles.success : ''} ${sendStatus === 'error' ? styles.error : ''}`}
            disabled={isDisabled || isEmpty}
            whileHover={{ scale: isDisabled || isEmpty ? 1 : 1.02 }}
            whileTap={{ scale: isDisabled || isEmpty ? 1 : 0.98 }}
          >
            {isSending ? (
              <>
                <Loader2 size={16} className={styles.spinner} />
                <span>Sending...</span>
              </>
            ) : sendStatus === 'success' ? (
              <>
                <CheckCircle size={16} />
                <span>Sent!</span>
              </>
            ) : sendStatus === 'error' ? (
              <>
                <AlertCircle size={16} />
                <span>Failed</span>
              </>
            ) : (
              <>
                <Send size={16} />
                <span>Send Reply</span>
              </>
            )}
          </motion.button>
        </div>
      </div>
    </form>
  );
}
