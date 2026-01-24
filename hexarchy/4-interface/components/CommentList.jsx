// Comment List Component
import React, { useState } from 'react';
import { CommentItem } from './CommentItem.jsx';
import { CommentForm } from './CommentForm.jsx';

export const CommentList = ({ videoId, comments, currentUser, onAddComment, onUpdateComment, onDeleteComment, onLikeComment }) => {
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'oldest', 'popular'

  const sortedComments = [...comments].sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
    if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
    if (sortBy === 'popular') return b.likes - a.likes;
    return 0;
  });

  // Filter top-level comments (no parent)
  const topLevelComments = sortedComments.filter(c => !c.parentId);

  return (
    <div className="comment-list">
      <div className="comment-header">
        <h3>{comments.length} Comments</h3>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="sort-select">
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="popular">Most Popular</option>
        </select>
      </div>

      {currentUser && (
        <CommentForm
          videoId={videoId}
          currentUser={currentUser}
          onSubmit={onAddComment}
          placeholder="Add a comment..."
        />
      )}

      <div className="comments">
        {topLevelComments.map(comment => (
          <CommentItem
            key={comment.id}
            comment={comment}
            replies={sortedComments.filter(c => c.parentId === comment.id)}
            currentUser={currentUser}
            onUpdate={onUpdateComment}
            onDelete={onDeleteComment}
            onLike={onLikeComment}
            onReply={onAddComment}
          />
        ))}
      </div>
    </div>
  );
};

export default CommentList;
