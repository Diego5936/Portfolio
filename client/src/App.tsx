import { useEffect, useState } from 'react'
import './App.css'

// Response types
type HealthResponse = {
  ok: boolean;
  message: string;
}

type SkillNode = {
  id: string;
  label: string;
  type: "skill" | "project";
};

type SkillEdge = {
  from: string;
  to: string;
};

type SkillsGraph = {
  nodes: SkillNode[];
  edges: SkillEdge[];
};

// Main App
export default function App() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [skills, setSkills] = useState<SkillsGraph | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/health");
        if (!res.ok) 
          throw new Error(`HTTP ${res.status}`);
        const data: HealthResponse = await res.json();
        setHealth(data);

        const skillsRes = await fetch("/api/skills");
        if (!skillsRes.ok)
          throw new Error(`Skills HTTP ${skillsRes.status}`);
        const skillsData: SkillsGraph = await skillsRes.json();
        setSkills(skillsData);
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      }
    };

    load();
  }, []);

  return (
    <main style={{ padding: 24, fontFamily: "system-ui" }}>
      <h1 className="text-4xl font-bold text-blue-500">
        Portfolio
      </h1>

      <a href="/api/resume"style={{display: "inline-block", marginBottom: 16}}>
        Download Resume
      </a>

      <h2>Skills Graph</h2>
      {!skills ? (
        <p>Loading skills...</p>
      ) : (
        <pre style={{ background: "#111", color: "#0f0", padding: 12 }}>
          {JSON.stringify(skills, null, 2)}
        </pre>
      )}

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