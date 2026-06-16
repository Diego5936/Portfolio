import { useEffect, useRef, useState } from "react";
import { Application } from "pixi.js";
import { loadBlankSkinTextures } from "@/components/skills/blankSkin";
import { getLineupPositions } from "@/components/skills/lineup";
import { SkillNpc } from "@/components/skills/SkillNpc";
import { NPC_CONFIG, getNpcLayoutKey } from "@/components/skills/npcConfig";
import { createTrumpetButton, loadTrumpetTexture } from "@/components/skills/trumpet";
import { skills } from "@/data/skills";

const PANEL_HEIGHT = 400;
const PANEL_PADDING = 24;


export function SkillsSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const npcLayoutKey = getNpcLayoutKey();

  useEffect(() => {
    const mount = containerRef.current;
    if (!mount) return;

    let app: Application | null = null;
    let cancelled = false;

    async function init() {
      try {
        await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

        if (cancelled || !mount) return;

        const width = mount.clientWidth || mount.getBoundingClientRect().width;
        if (width <= 0) {
          setError("Skills panel has no width yet — try refreshing.");
          return;
        }

        const bounds = {
          width,
          height: PANEL_HEIGHT,
          padding: PANEL_PADDING,
        };

        app = new Application();

        await app.init({
          width,
          height: PANEL_HEIGHT,
          background: 0x2a3a5c,
          antialias: true,
          resizeTo: mount,
        });

        if (cancelled || !mount) {
          app.destroy(true);
          return;
        }

        app.canvas.style.display = "block";
        mount.appendChild(app.canvas);

        const blankSkinTextures = await loadBlankSkinTextures();
        const trumpetTexture = await loadTrumpetTexture();

        if (cancelled || !mount) {
          app.destroy(true);
          return;
        }

        const lineup = getLineupPositions(skills, bounds);
        const npcs = skills.map((skill, index) => {
          const position = lineup[index];
          const npc = new SkillNpc(
            skill,
            blankSkinTextures,
            position.x,
            position.y,
          );

          app!.stage.addChild(npc.container);
          return npc;
        });

        function summonAll() {
          for (const npc of npcs) {
            npc.beginSummon();
          }
        }

        const trumpet = createTrumpetButton(trumpetTexture, bounds, summonAll);
        app.stage.addChild(trumpet);

        let wanderDelay = NPC_CONFIG.wanderDelaySeconds;

        app.ticker.add((ticker) => {
          const dt = ticker.deltaMS / 1000;

          if (wanderDelay > 0) {
            wanderDelay -= dt;
            return;
          }

          for (const npc of npcs) {
            const others = npcs.filter((other) => other !== npc);

            if (npc.summoning) {
              npc.updateSummon(dt);
            } else if (npc.wandering) {
              npc.update(dt, bounds, others);
            } else {
              npc.updateAtPost(dt, bounds, others);
            }
          }
        });
      } catch (err) {
        console.error("Pixi init failed:", err);
        setError(err instanceof Error ? err.message : "Failed to start Pixi canvas.");
      }
    }

    void init();

    return () => {
      cancelled = true;
      app?.destroy(true);
      mount.replaceChildren();
    };
  }, [npcLayoutKey]);

  return (
    <section id="skills" className="py-14 sm:py-20">
      <div className="mb-6">
        <h2 className="portfolio-section-title">Skills</h2>
        <p className="mt-2 text-muted-foreground">
          Watch them wander — line them up when you're ready.
        </p>
      </div>

      {error ? (
        <p className="rounded-2xl border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <div
        ref={containerRef}
        className="h-[400px] w-full overflow-hidden rounded-2xl border border-border/80 bg-card"
      />
    </section>
  );
}
