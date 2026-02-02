import { useEffect, useState } from 'react'
import './App.css'

type HealthResponse = {
  ok: boolean;
  message: string;
}

export default function App() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/health");
        if (!res.ok) 
          throw new Error(`HTTP ${res.status}`);
        const data: HealthResponse = await res.json();
        setHealth(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      }
    };

    load();
  }, []);

  return (
    <main style={{ padding: 24, fontFamily: "system-ui" }}>
      <h1>Portfolio</h1>

      {!health && !error && <p>Loading...</p>}
      {error && <p>API error: {error}</p>}
      {health && (
        <pre style={{ background: "#111", color: "#0f0", padding: 12 }}>
          {JSON.stringify(health, null, 2)}
        </pre>
      )}
    </main>
  );
}