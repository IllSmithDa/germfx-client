"use client";

import { useEffect, useRef, useState } from "react";
import {
  Check,
  ChevronDown,
  Copy,
  ExternalLink,
  Mail,
  Share2,
} from "lucide-react";

type ContentShareButtonProps = {
  title: string;
  text?: string;
  className?: string;
};

export default function ContentShareButton({
  title,
  text,
  className = "",
}: ContentShareButtonProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function getShareUrl() {
    return window.location.href;
  }

  function getShareBody() {
    const normalizedText = text?.trim();

    return normalizedText
      ? `${normalizedText}\n\n${getShareUrl()}`
      : getShareUrl();
  }

  function openInCurrentBrowser(url: string) {
    window.open(url, "_blank", "noopener,noreferrer");
    setOpen(false);
  }

  async function handleCopyLink() {
    const url = getShareUrl();

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        window.prompt("Copy this link:", url);
      }

      setCopied(true);
      setOpen(false);

      if (resetTimerRef.current) {
        clearTimeout(resetTimerRef.current);
      }

      resetTimerRef.current = setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error("Unable to copy share link:", error);
    }
  }

  function shareToGmail() {
    const subject = encodeURIComponent(title);
    const body = encodeURIComponent(getShareBody());

    openInCurrentBrowser(
      `https://mail.google.com/mail/?view=cm&fs=1&su=${subject}&body=${body}`,
    );
  }

  function shareToEmail() {
    const subject = encodeURIComponent(title);
    const body = encodeURIComponent(getShareBody());

    window.location.href = `mailto:?subject=${subject}&body=${body}`;
    setOpen(false);
  }

  function shareToFacebook() {
    const url = encodeURIComponent(getShareUrl());

    openInCurrentBrowser(
      `https://www.facebook.com/sharer/sharer.php?u=${url}`,
    );
  }

  function shareToX() {
    const url = encodeURIComponent(getShareUrl());
    const shareTitle = encodeURIComponent(title);

    openInCurrentBrowser(
      `https://twitter.com/intent/tweet?text=${shareTitle}&url=${url}`,
    );
  }

  function shareToLinkedIn() {
    const url = encodeURIComponent(getShareUrl());

    openInCurrentBrowser(
      `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
    );
  }

  async function handleShareButton() {
    const hasDesktopPointer = window.matchMedia(
      "(hover: hover) and (pointer: fine)",
    ).matches;

    if (!hasDesktopPointer && navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url: getShareUrl(),
        });

        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        console.error("Native share failed:", error);
      }
    }

    setOpen((current) => !current);
  }

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);

      if (resetTimerRef.current) {
        clearTimeout(resetTimerRef.current);
      }
    };
  }, []);

  return (
    <div ref={menuRef} className="relative inline-flex">
      <button
        type="button"
        onClick={handleShareButton}
        aria-haspopup="menu"
        aria-expanded={open}
        className={[
          "inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg",
          "border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 py-2",
          "text-xs font-semibold text-[hsl(var(--foreground))] cursor-pointer",
          "transition-colors hover:bg-[hsl(var(--muted))]",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]",
          "sm:text-sm",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        aria-label={copied ? "Link copied" : `Share ${title}`}
      >
        {copied ? (
          <Check className="h-4 w-4" aria-hidden="true" />
        ) : (
          <Share2 className="h-4 w-4" aria-hidden="true" />
        )}

        <span>{copied ? "Link copied" : "Share"}</span>

        {!copied ? (
          <ChevronDown
            className={[
              "h-3.5 w-3.5 transition-transform",
              open ? "rotate-180" : "",
            ].join(" ")}
            aria-hidden="true"
          />
        ) : null}
      </button>

      {open ? (
        <div
          role="menu"
          aria-label="Share options"
          className={[
            "absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden",
            "rounded-xl border border-[hsl(var(--border))]",
            "bg-[hsl(var(--card))] p-1.5 shadow-lg",
          ].join(" ")}
        >
          <ShareMenuItem
            label="Copy link"
            icon={<Copy className="h-4 w-4" aria-hidden="true" />}
            onClick={handleCopyLink}
          />

          <div
            className="my-1 border-t border-[hsl(var(--border))]"
            aria-hidden="true"
          />

          <ShareMenuItem
            label="Gmail"
            icon={<Mail className="h-4 w-4" aria-hidden="true" />}
            onClick={shareToGmail}
          />

          <ShareMenuItem
            label="Email"
            icon={<Mail className="h-4 w-4" aria-hidden="true" />}
            onClick={shareToEmail}
          />

          <ShareMenuItem
            label="Facebook"
            icon={<ExternalLink className="h-4 w-4" aria-hidden="true" />}
            onClick={shareToFacebook}
          />

          <ShareMenuItem
            label="X"
            icon={<ExternalLink className="h-4 w-4" aria-hidden="true" />}
            onClick={shareToX}
          />

          <ShareMenuItem
            label="LinkedIn"
            icon={<ExternalLink className="h-4 w-4" aria-hidden="true" />}
            onClick={shareToLinkedIn}
          />
        </div>
      ) : null}
    </div>
  );
}

function ShareMenuItem({
  label,
  icon,
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className={[
        "flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 cursor-pointer",
        "text-left text-sm text-[hsl(var(--foreground))]",
        "transition-colors hover:bg-[hsl(var(--muted))]",
        "focus:outline-none focus-visible:bg-[hsl(var(--muted))]",
      ].join(" ")}
    >
      <span className="flex h-5 w-5 shrink-0 items-center justify-center text-[hsl(var(--muted-foreground))]">
        {icon}
      </span>

      <span>{label}</span>
    </button>
  );
}