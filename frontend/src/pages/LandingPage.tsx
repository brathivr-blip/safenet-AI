import { useEffect, useState } from "react";
import { getHealth, type HealthResponse } from "../services/api";

export default function LandingPage() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [connectionError, setConnectionError] = useState(false);

  useEffect(() => {
    getHealth()
      .then(setHealth)
      .catch(() => setConnectionError(true));
  }, []);

  const connectionLabel = health
    ? "Backend connected"
    : connectionError
      ? "Backend unavailable"
      : "Connecting to backend";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6 text-center">
      <span className="text-xs uppercase tracking-widest text-safenet-accent border border-safenet-accent/40 rounded-full px-3 py-1">
        Demo Mode
      </span>
      <span className="text-xs uppercase tracking-widest text-white/60">
        {connectionLabel}
        {health && ` · ${health.env}`}
      </span>
      <h1 className="text-4xl md:text-5xl font-bold">
        One Network. Faster Response. Safer Communities.
      </h1>
      <p className="max-w-xl text-white/70">
        SafeNet AI connects citizens, emergency responders, hospitals and authorities
        through intelligent emergency coordination.
      </p>
      <p className="text-xs text-white/40 max-w-md">
        SafeNet AI is a decision-support prototype. In a real emergency, contact the
        appropriate official emergency service.
      </p>
    </div>
  );
}
