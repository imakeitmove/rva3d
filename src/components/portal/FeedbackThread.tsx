"use client";

import { useMemo, useState } from "react";
import type { FeedbackStatus, PortalFeedbackMessage } from "@/lib/notion";

function formatTimecode(sec?: number) {
  if (sec === undefined || Number.isNaN(sec)) return undefined;
  const minutes = Math.floor(sec / 60)
    .toString()
    .padStart(2, "0");
  const seconds = Math.floor(sec % 60)
    .toString()
    .padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function parseTimecode(input: string): number | undefined {
  if (!input.trim()) return undefined;
  if (/^\d+$/.test(input.trim())) return Number(input.trim());
  const parts = input.split(":").map((p) => Number(p));
  if (parts.some((p) => Number.isNaN(p))) return undefined;
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return undefined;
}

function formatDate(value: string) {
  const date = new Date(value);
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

type Props = {
  postPageId: string;
  portalPageId: string;
  initialMessages: PortalFeedbackMessage[];
  currentUserName?: string | null;
  currentUserEmail?: string | null;
};

const STATUS_OPTIONS: FeedbackStatus[] = ["Comment", "Needs Changes", "Approved"];

export default function FeedbackThread({
  postPageId,
  portalPageId,
  initialMessages,
  currentUserEmail,
  currentUserName,
}: Props) {
  const [messages, setMessages] = useState<PortalFeedbackMessage[]>(initialMessages);
  const [draft, setDraft] = useState("");
  const [timecode, setTimecode] = useState("");
  const [status, setStatus] = useState<FeedbackStatus>("Comment");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isDisabled = useMemo(() => !draft.trim() || isSubmitting, [draft, isSubmitting]);

  async function submitMessage() {
    if (!draft.trim()) return;
    setIsSubmitting(true);
    setError(null);

    const timecodeSec = parseTimecode(timecode);

    try {
      const res = await fetch("/api/portal/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          postPageId,
          portalPageId,
          message: draft.trim(),
          status,
          timecodeSec,
        }),
      });

      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload.error || "Unable to send feedback");
      }

      const payload = await res.json();
      const newMessage: PortalFeedbackMessage = {
        id: payload.id ?? crypto.randomUUID(),
        author: currentUserName || currentUserEmail || "You",
        role: payload.role ?? "Client",
        message: draft.trim(),
        createdAt: payload.createdAt ?? new Date().toISOString(),
        timecodeSec,
        status,
      };

      setMessages((prev) => [...prev, newMessage]);
      setDraft("");
      setTimecode("");
      setStatus("Comment");
    } catch (err: unknown) {
      console.error("Feedback submit failed", err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Something went wrong");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="thread-card">
      <div className="thread-header">
        <div>
          <h3>Conversation</h3>
          <p className="muted">Shared with your team and the studio.</p>
        </div>
        <div className="status-picker">
          <label htmlFor="status">Decision</label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value as FeedbackStatus)}
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="message-list">
        {messages.length === 0 && <p className="muted">No comments yet.</p>}
        {messages.map((msg) => (
          <div key={msg.id} className="message-row">
            <div className="message-meta">
              <span className="pill">{msg.role}</span>
              <strong>{msg.author}</strong>
              <span className="muted">· {formatDate(msg.createdAt)}</span>
              {msg.timecodeSec !== undefined && (
                <span className="pill pill-timecode">{formatTimecode(msg.timecodeSec)}</span>
              )}
              {msg.status && msg.status !== "Comment" && (
                <span className="pill pill-status">{msg.status}</span>
              )}
            </div>
            <p className="message-text">{msg.message}</p>
          </div>
        ))}
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="composer">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Add your feedback..."
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submitMessage();
            }
          }}
        />
        <div className="composer-actions">
          <input
            type="text"
            value={timecode}
            onChange={(e) => setTimecode(e.target.value)}
            placeholder="Timecode (m:s)"
            className="timecode-input"
          />
          <button className="primary" disabled={isDisabled} onClick={submitMessage}>
            {isSubmitting ? "Sending..." : "Add comment"}
          </button>
        </div>
      </div>
    </div>
  );
}
