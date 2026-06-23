import { useEffect, useRef, useState } from "react";
import { Application } from "pixi.js";
import type { CategoryFilterId } from "@/components/skills/categoryFilter";
import {
  createCategoryFilters,
  loadCategoryFilterTextures,
} from "@/components/skills/categoryFilterSprites";
import { loadBlankSkinTextures } from "@/components/skills/blankSkin";
import { getLineupPositions } from "@/components/skills/lineup";
import { SkillNpc } from "@/components/skills/SkillNpc";
import { NPC_CONFIG, getNpcLayoutKey } from "@/components/skills/npcConfig";
import { createTrumpetButton, loadTrumpetTextures } from "@/components/skills/trumpet";
import { skills } from "@/data/skills";

const PANEL_HEIGHT = 400;
const PANEL_PADDING = 24;

function getWanderOthers(npcs: SkillNpc[], npc: SkillNpc) {
  return npcs.filter(
    (other) =>
      other !== npc &&
      other.inFilter &&
      !other.hidden &&
      !other.exiting,
  );
}

function getLandingOthers(npcs: SkillNpc[], npc: SkillNpc) {
  return npcs.filter((other) => other !== npc && !other.hidden);
}

export function SkillsSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const categoryFilterRef = useRef<
    ((category: CategoryFilterId, options?: { holdPost?: boolean }) => void) | null
  >(null);
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
        app.stage.eventMode = "passive";
        app.stage.hitArea = app.screen;

        const blankSkinTextures = await loadBlankSkinTextures();
        const trumpetTextures = await loadTrumpetTextures();
        const categoryFilterTextures = await loadCategoryFilterTextures();

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
          npc.setupPointerEvents(app!.stage, bounds);
          return npc;
        });

        let wanderDelay = NPC_CONFIG.wanderDelaySeconds;
        let lineupSignRevealDelay =
          NPC_CONFIG.wanderDelaySeconds +
          NPC_CONFIG.lineupSignDelayAfterWanderSeconds;
        let currentCategory: CategoryFilterId = "all";

        function hideLineupSignUntilWanderDelay() {
          lineupSign.visible = false;
          lineupSignRevealDelay =
            NPC_CONFIG.wanderDelaySeconds +
            NPC_CONFIG.lineupSignDelayAfterWanderSeconds;
        }

        function hideLineupSignUntilHoldPostDelay() {
          lineupSign.visible = false;
          lineupSignRevealDelay =
            NPC_CONFIG.stayTimeAfterSummonSeconds +
            NPC_CONFIG.lineupSignDelayAfterWanderSeconds;
        }

        function summonLineup() {
          hideLineupSignUntilHoldPostDelay();

          const category = currentCategory;
          const filteredSkills =
            category === "all"
              ? skills
              : skills.filter((skill) => skill.category === category);
          const filteredLineup = getLineupPositions(filteredSkills, bounds);
          const positionByName = new Map(
            filteredSkills.map((skill, index) => [
              skill.name,
              filteredLineup[index],
            ]),
          );

          for (const npc of npcs) {
            const isActive =
              category === "all" || npc.skill.category === category;
            const position = positionByName.get(npc.skill.name);

            if (!isActive || !position) {
              continue;
            }

            npc.setHome(position.x, position.y);

            if (npc.hidden) {
              npc.reactivateFromHidden(position.x, position.y);
            }

            npc.beginSummon({ holdPost: true });
          }
        }

        let updateFilterSelection: (category: CategoryFilterId) => void = () => {};

        function applyCategoryFilter(
          category: CategoryFilterId,
          options?: { holdPost?: boolean },
        ) {
          const holdPost = options?.holdPost ?? false;
          const filteredSkills =
            category === "all"
              ? skills
              : skills.filter((skill) => skill.category === category);
          const filteredLineup = getLineupPositions(filteredSkills, bounds);
          const positionByName = new Map(
            filteredSkills.map((skill, index) => [
              skill.name,
              filteredLineup[index],
            ]),
          );

          wanderDelay = NPC_CONFIG.wanderDelaySeconds;
          hideLineupSignUntilWanderDelay();
          currentCategory = category;
          updateFilterSelection(category);

          for (const npc of npcs) {
            const isActive =
              category === "all" || npc.skill.category === category;
            const position = positionByName.get(npc.skill.name);

            npc.setInFilter(isActive);

            if (isActive && position) {
              npc.setHome(position.x, position.y);

              if (npc.hidden) {
                npc.reactivateFromHidden(position.x, position.y);
              }

              npc.beginSummon({ holdPost });
              continue;
            }

            if (!npc.hidden) {
              npc.beginExit();
            }
          }
        }

        categoryFilterRef.current = applyCategoryFilter;

        const { container: categoryFilters, setSelected } = createCategoryFilters(
          categoryFilterTextures,
          bounds,
          (category) => applyCategoryFilter(category),
        );
        updateFilterSelection = setSelected;

        const { container: trumpet, lineupSign } = createTrumpetButton(
          trumpetTextures,
          bounds,
          summonLineup,
        );
        app.stage.addChild(categoryFilters, trumpet);

        app.ticker.add((ticker) => {
          const dt = ticker.deltaMS / 1000;

          if (lineupSignRevealDelay > 0) {
            lineupSignRevealDelay -= dt;

            if (lineupSignRevealDelay <= 0) {
              lineupSign.visible = true;
            }
          }

          if (wanderDelay > 0) {
            wanderDelay -= dt;

            for (const npc of npcs) {
              if (npc.hidden) {
                continue;
              }

              if (npc.dragging) {
                npc.updateDrag(dt);
              } else if (npc.landing) {
                npc.updateLanding(dt, bounds, getLandingOthers(npcs, npc));
              } else if (npc.summoning) {
                npc.updateSummon(dt, bounds);
              }
            }

            return;
          }

          for (const npc of npcs) {
            if (npc.hidden) {
              continue;
            }

            if (npc.dragging) {
              npc.updateDrag(dt);
              continue;
            }

            if (npc.landing) {
              npc.updateLanding(dt, bounds, getLandingOthers(npcs, npc));
              continue;
            }

            if (npc.summoning) {
              npc.updateSummon(dt, bounds);
              continue;
            }

            if (!npc.inFilter) {
              continue;
            }

            if (npc.wandering) {
              npc.update(dt, bounds, getWanderOthers(npcs, npc));
            } else {
              npc.updateAtPost(dt, bounds, getWanderOthers(npcs, npc));
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
      categoryFilterRef.current = null;
      app?.destroy(true);
      mount.replaceChildren();
    };
  }, [npcLayoutKey]);

  return (
    <section id="skills" className="scroll-mt-14 py-14 sm:py-14 sm:scroll-mt-16">
      <div className="mb-6">
        <h2 className="portfolio-about-section-title">Skills</h2>
        <p className="portfolio-about-body mt-2">
          This is my skills section! 
          Watch them wander and line them up when you are ready. 
          You can hold them up by dragging or filter them by categories :)
        </p>
      </div>

      {error ? (
        <p className="rounded-2xl border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <div>
        <div
          ref={containerRef}
          className="h-[400px] w-full overflow-hidden rounded-2xl border border-border/80 bg-card"
        />
        <p className="mt-1.5 text-right text-[0.9375rem] text-[#8f8f8f]">
          Inspired by Wii Plaza and the Escapist games
        </p>
      </div>
    </section>
  );
}
