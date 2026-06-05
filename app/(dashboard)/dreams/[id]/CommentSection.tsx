"use client";

import CommentThread from "@/components/comments/CommentThread";
import { addCommentAction } from "./actions";

type Comment = {
  id: string;
  content: string;
  createdAt: Date;
  userId: string;
  user: { username: string; avatarId: number };
  replies: Comment[];
};

export default function CommentSection({
  dreamId,
  comments,
  canComment,
  currentUserId,
}: {
  dreamId: string;
  comments: Comment[];
  canComment: boolean;
  currentUserId?: string;
}) {
  if (!canComment) {
    return <p className="font-sans text-dream-muted text-sm">Sign in to comment.</p>;
  }

  return (
    <CommentThread
      comments={comments}
      dreamId={dreamId}
      currentUserId={currentUserId}
      onComment={(content) => addCommentAction(dreamId, content)}
      onReply={(parentId, content) => addCommentAction(dreamId, content, parentId)}
    />
  );
}
