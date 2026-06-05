"use client";

import { useState, useTransition } from "react";
import CommentInput from "./CommentInput";
import Avatar from "@/components/ui/Avatar";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { updateCommentAction, archiveCommentAction } from "@/app/(dashboard)/dreams/[id]/actions";

type CommentType = {
  id: string;
  content: string;
  createdAt: Date;
  userId: string;
  user: { username: string; avatarId: number };
  replies: CommentType[];
};

interface CommentNodeProps {
  comment: CommentType;
  dreamId: string;
  currentUserId?: string;
  onReply: (parentId: string, content: string) => Promise<{ error?: string; success?: boolean }>;
  depth?: number;
}

function CommentNode({ comment, dreamId, currentUserId, onReply, depth = 0 }: CommentNodeProps) {
  const [showReply, setShowReply] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isDeletePending, startDeleteTransition] = useTransition();

  const isOwn = currentUserId === comment.userId;

  function handleSaveEdit() {
    setEditError(null);
    startTransition(async () => {
      const result = await updateCommentAction(comment.id, dreamId, editContent);
      if (result?.error) {
        setEditError(result.error);
      } else {
        setEditing(false);
      }
    });
  }

  function handleDelete() {
    startDeleteTransition(async () => {
      await archiveCommentAction(comment.id, dreamId);
      setDeleteOpen(false);
    });
  }

  return (
    <div className={depth > 0 ? "ml-10 border-l-2 border-dream-purple/30 pl-4" : ""}>
      <div className="flex items-start gap-3 py-3">
        <Avatar avatarId={comment.user.avatarId} className="w-8 h-8 mt-0.5" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-sans font-semibold text-dream-text text-sm">{comment.user.username}</span>
            <span className="font-sans text-dream-muted text-xs">
              {new Date(comment.createdAt).toLocaleDateString()}
            </span>
            {/* Edit / Delete — only visible to comment author */}
            {isOwn && !editing && (
              <div className="flex items-center gap-2 ml-auto">
                <button
                  onClick={() => { setEditing(true); setEditContent(comment.content); }}
                  className="font-sans text-xs text-dream-muted hover:text-dream-text transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => setDeleteOpen(true)}
                  className="font-sans text-xs text-red-400/60 hover:text-red-400 transition-colors"
                >
                  Delete
                </button>
              </div>
            )}
          </div>

          {/* Inline edit mode */}
          {editing ? (
            <div className="space-y-2">
              {editError && <p className="font-sans text-red-400 text-xs">{editError}</p>}
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={3}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 font-sans text-sm text-dream-text resize-none focus:outline-none focus:border-dream-violet transition-colors"
              />
              <div className="flex gap-3">
                <button
                  onClick={handleSaveEdit}
                  disabled={isPending || !editContent.trim()}
                  className="font-sans text-xs text-dream-violet hover:text-dream-bright transition-colors disabled:opacity-50"
                >
                  {isPending ? "Saving…" : "Save"}
                </button>
                <button
                  onClick={() => { setEditing(false); setEditContent(comment.content); setEditError(null); }}
                  className="font-sans text-xs text-dream-muted hover:text-dream-text transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className="font-sans text-dream-text text-sm leading-relaxed">{comment.content}</p>
          )}

          {/* Reply button */}
          {!editing && depth < 3 && (
            <button
              onClick={() => setShowReply((v) => !v)}
              className="font-sans text-dream-muted text-xs mt-2 hover:text-dream-bright transition-colors"
            >
              {showReply ? "Cancel" : "Reply"}
            </button>
          )}
          {showReply && (
            <div className="mt-3">
              <CommentInput
                placeholder="Write a reply..."
                onSubmit={(content) => onReply(comment.id, content)}
                onCancel={() => setShowReply(false)}
              />
            </div>
          )}
        </div>
      </div>

      {/* Nested replies */}
      {comment.replies.map((reply) => (
        <CommentNode
          key={reply.id}
          comment={reply}
          dreamId={dreamId}
          currentUserId={currentUserId}
          onReply={onReply}
          depth={depth + 1}
        />
      ))}

      {/* Delete confirmation modal */}
      <ConfirmModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        isPending={isDeletePending}
        title="Delete this comment?"
        message="This will permanently delete your comment and any replies to it. This action cannot be undone."
      />
    </div>
  );
}

interface CommentThreadProps {
  comments: CommentType[];
  dreamId: string;
  currentUserId?: string;
  onComment: (content: string) => Promise<{ error?: string; success?: boolean }>;
  onReply: (parentId: string, content: string) => Promise<{ error?: string; success?: boolean }>;
}

export default function CommentThread({ comments, dreamId, currentUserId, onComment, onReply }: CommentThreadProps) {
  return (
    <div>
      <CommentInput placeholder="Share your thoughts on this dream..." onSubmit={onComment} />
      <div className="mt-6 space-y-1 divide-y divide-white/8">
        {comments.map((comment) => (
          <CommentNode
            key={comment.id}
            comment={comment}
            dreamId={dreamId}
            currentUserId={currentUserId}
            onReply={onReply}
          />
        ))}
        {comments.length === 0 && (
          <p className="font-sans text-dream-muted text-sm pt-6">No comments yet. Start the conversation!</p>
        )}
      </div>
    </div>
  );
}
