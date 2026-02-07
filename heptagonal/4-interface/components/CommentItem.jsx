// Comment Item Component
import React, { useState } from 'react';
import { CommentForm } from './CommentForm.jsx';
import { formatDate } from '../utils/formatters.js';

export const CommentItem = ({ comment, replies, currentUser, onUpdate, onDelete, onLike, onReply }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [editedText, setEditedText] = useState(comment.text);

  const isOwner = currentUser?.id === comment.userId;

  const handleSaveEdit = () => {
    onUpdate(comment.id, editedText);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditedText(comment.text);
    setIsEditing(false);
  };

  return (
    <div className="comment-item">
      <img src={comment.author.avatar || '/assets/default-avatar.jpg'} alt={comment.author.username} className="comment-avatar" />

      <div className="comment-content">
        <div className="comment-header">
          <span className="comment-author">{comment.author.username}</span>
          <span className="comment-date">{formatDate(comment.createdAt)}</span>
          {comment.isPinned && <span className="pinned-badge">📌 Pinned</span>}
        </div>

        {isEditing ? (
          <div className="comment-edit">
            <textarea
              value={editedText}
              onChange={(e) => setEditedText(e.target.value)}
              className="comment-textarea"
            />
            <div className="edit-buttons">
              <button onClick={handleSaveEdit} className="btn-save">Save</button>
              <button onClick={handleCancelEdit} className="btn-cancel">Cancel</button>
            </div>
          </div>
        ) : (
          <p className="comment-text">{comment.text}</p>
        )}

        <div className="comment-actions">
          <button onClick={() => onLike(comment.id)} className="btn-like">
            👍 {comment.likes}
          </button>

          {currentUser && !isEditing && (
            <button onClick={() => setShowReplyForm(!showReplyForm)} className="btn-reply">
              Reply
            </button>
          )}

          {isOwner && !isEditing && (
            <>
              <button onClick={() => setIsEditing(true)} className="btn-edit">
                Edit
              </button>
              <button onClick={() => onDelete(comment.id)} className="btn-delete">
                Delete
              </button>
            </>
          )}
        </div>

        {showReplyForm && currentUser && (
          <CommentForm
            videoId={comment.videoId}
            parentId={comment.id}
            currentUser={currentUser}
            onSubmit={(data) => {
              onReply(data);
              setShowReplyForm(false);
            }}
            onCancel={() => setShowReplyForm(false)}
            placeholder={`Reply to ${comment.author.username}...`}
          />
        )}

        {replies && replies.length > 0 && (
          <div className="comment-replies">
            {replies.map(reply => (
              <CommentItem
                key={reply.id}
                comment={reply}
                replies={[]}
                currentUser={currentUser}
                onUpdate={onUpdate}
                onDelete={onDelete}
                onLike={onLike}
                onReply={onReply}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentItem;
