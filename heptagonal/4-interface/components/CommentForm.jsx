// Comment Form Component
import React, { useState } from 'react';

export const CommentForm = ({ videoId, parentId, currentUser, onSubmit, onCancel, placeholder }) => {
  const [text, setText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        videoId,
        parentId,
        text: text.trim()
      });
      setText('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="comment-form" onSubmit={handleSubmit}>
      <img src={currentUser.avatar || '/assets/default-avatar.jpg'} alt={currentUser.username} className="comment-avatar" />

      <div className="comment-input-wrapper">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={placeholder || 'Add a comment...'}
          className="comment-textarea"
          rows="2"
          disabled={isSubmitting}
        />

        <div className="comment-actions">
          {onCancel && (
            <button type="button" onClick={onCancel} className="btn-cancel" disabled={isSubmitting}>
              Cancel
            </button>
          )}
          <button type="submit" className="btn-submit" disabled={!text.trim() || isSubmitting}>
            {isSubmitting ? 'Posting...' : 'Comment'}
          </button>
        </div>
      </div>
    </form>
  );
};

export default CommentForm;
