type Props = {
  secondsRemaining: number;
  title?: string;
  message?: string;
};

function formatSeconds(totalSeconds: number) {
  const safeSeconds = Math.max(0, totalSeconds);
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;

  if (minutes <= 0) {
    return `${seconds}s`;
  }

  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export default function AuthCooldownNotice({
  secondsRemaining,
  title = "Please wait before trying again",
  message = "For security reasons, reset-link requests are temporarily limited.",
}: Props) {
  if (secondsRemaining <= 0) {
    return null;
  }

  return (
    <div className="rounded-xl border border-amber-400/40 bg-amber-500/10 px-3.5 py-3 text-sm text-amber-800 dark:text-amber-300">
      <p className="font-semibold">{title}</p>

      <p className="mt-1">
        {message} You can request another link in{" "}
        <span className="font-semibold">
          {formatSeconds(secondsRemaining)}
        </span>
        .
      </p>
    </div>
  );
}