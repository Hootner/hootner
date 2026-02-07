// Comment Presenter
import { CommentViewModel } from '../viewmodels/CommentViewModel.js';

export class CommentPresenter {
  constructor(commentService) {
    this.commentService = commentService;
  }

  // Present video comments
  async presentVideoComments(videoId, currentUser) {
    const comments = await this.commentService.getVideoComments(videoId);
    return comments.map(comment => {
      const viewModel = new CommentViewModel(comment);
      return {
        ...viewModel,
        canEdit: viewModel.canBeEditedBy(currentUser?.id),
        canDelete: viewModel.canBeDeletedBy(currentUser?.id, currentUser?.role),
        canPin: viewModel.canBePinnedBy(currentUser?.id, videoId)
      };
    });
  }

  // Present comment replies
  async presentCommentReplies(commentId, currentUser) {
    const replies = await this.commentService.getCommentReplies(commentId);
    return replies.map(reply => {
      const viewModel = new CommentViewModel(reply);
      return {
        ...viewModel,
        canEdit: viewModel.canBeEditedBy(currentUser?.id),
        canDelete: viewModel.canBeDeletedBy(currentUser?.id, currentUser?.role)
      };
    });
  }

  // Present comment form data
  presentCommentForm(videoId, parentId, currentUser) {
    return {
      videoId,
      parentId,
      userId: currentUser.id,
      maxLength: 1000
    };
  }

  // Present comment for editing
  async presentCommentForEdit(commentId, currentUser) {
    const comment = await this.commentService.getCommentById(commentId);
    if (!comment) return null;

    const viewModel = new CommentViewModel(comment);

    if (!viewModel.canBeEditedBy(currentUser.id)) {
      throw new Error('Unauthorized to edit this comment');
    }

    return viewModel;
  }
}

export default CommentPresenter;
