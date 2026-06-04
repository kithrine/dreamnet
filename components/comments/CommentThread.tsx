"use client";

import { useState } from "react";
import CommentInput from "./CommentInput";

type CommentType = {
  id: string;
  content: string;
  createdAt: Date;
  user: { username: string; avatarId: number };
  replies: CommentType[];
};

const AVATAR_COLORS: Record<number, string> = {
  1: "#7c3aed", 2: "#2563eb", 3: "#16a34a", 4: "#dc2626", 5: "#ca8a04",
};

interface CommentProps {
  comment: CommentType;
  onReply: (parentId: string, content: string) => Promise<{ error?: string; success?: boolean }>;
  depth?: number;
}

function CommentNode({ comment, onReply, depth = 0 }: CommentProps) {
  const [showReply, setShowReply] = useState(false);

  return (
    <div className={depth > 0 ? "ml-10 border-l-2 border-dream-purple/30 pl-4" : ""}>
      <div className="flex items-start gap-3 py-3">
        <div
          className="w-8 h-8 rounded-full flex-shrink-0 mt-0.5"
          style={{ backgroundColor: AVATAR_COLORS[comment.user.avatarId] ?? "#7c3aed" }}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-sans font-semibold text-dream-text text-sm">{comment.user.username}</span>
            <span className="font-sans text-dream-muted text-xs">
              {new Date(comment.createdAt).toLocaleDateString()}
            </span>
          </div>
          <p className="font-sans text-dream-text text-sm leading-relaxed">{comment.content}</p>
          {depth < 3 && (
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
      {comment.replies.map((reply) => (
        <CommentNode key={reply.id} comment={reply} onReply={onReply} depth={depth + 1} />
      ))}
    </div>
  );
}

interface CommentThreadProps {
  comments: CommentType[];
  onComment: (content: string) => Promise<{ error?: string; success?: boolean }>;
  onReply: (parentId: string, content: string) => Promise<{ error?: string; success?: boolean }>;
}

export default function CommentThread({ comments, onComment, onReply }: CommentThreadProps) {
  return (
    <div>
      <CommentInput placeholder="Share your thoughts on this dream..." onSubmit={onComment} />
      <div className="mt-6 space-y-1 divide-y divide-white/8">
        {comments.map((comment) => (
          <CommentNode key={comment.id} comment={comment} onReply={onReply} />
        ))}
        {comments.length === 0 && (
          <p className="font-sans text-dream-muted text-sm pt-6">No comments yet. Start the conversation!</p>
        )}
      </div>
    </div>
  );
}
