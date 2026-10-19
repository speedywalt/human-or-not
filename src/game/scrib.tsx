import { useEffect, useState, type ReactNode } from "react";
export type ScribMood = "smug" | "laugh" | "glare" | "cheer";

function pick(seed: number, lines: string[]) {
  return lines[Math.abs(seed) % lines.length] ?? lines[0]!;
}

export function scribSeed(...parts: Array<string | number>) {
  let n = 0;
  const text = parts.join("|");
  for (let i = 0; i < text.length; i++) n = (n * 33 + text.charCodeAt(i)) >>> 0;
  return n;
}

export function scribLobby(host: boolean, seed: number) {
  return {
    mood: "smug" as const,
    line: host
      ? pick(seed, [
          "Get them in. I already think they're fake.",
          "More friends. More people to disappoint.",
          "This room is mine. You just hold the mouse.",
          "Share the code. I'll be rude to all of them.",
          "A full room. Lovely. More wrong guesses.",
          "Don't explain the rules. Panic is funnier.",
          "I can hear them joining. None of them can draw.",
          "Lock the door after six. I get shy.",
        ])
      : pick(seed, [
          "You made it. Don't get comfortable.",
          "I'll be the one laughing.",
          "Sit down. The judging already started.",
          "You're late. I saved you a bad prompt.",
          "Look at your hands. They already look guilty.",
          "I stared at you first. That's allowed.",
          "Nice name. It won't help.",
          "Blink less. I am taking notes.",
        ]),
  };
}

export function scribDraw(countries: boolean, seed: number, team = false) {
  if (team) {
    return {
      mood: "smug" as const,
      line: pick(seed, [
        "Same prompt. Then hunt my fake.",
        "You get one subject. I get a copy.",
        "Work as a pack. One of you will slip.",
        "Draw the same thing. I'll still look worse.",
        "Whisper if you want. I can read mouths.",
        "Together means you all lose together.",
        "Help each other. I love a group mistake.",
        "One prompt. Six excuses. Perfect.",
      ]),
    };
  }
  return {
    mood: "smug" as const,
    line: countries
      ? pick(seed, [
          "Make it lopsided. Borders are rude.",
          "No labels. Write the name and I win.",
          "Outline only. Cities are for show-offs.",
          "Forget the islands. Everyone does.",
          "Too neat and I'll know you cheated.",
          "That country has a chin. Draw the chin.",
          "If it looks like a potato, own it.",
          "Stop smoothing it. Maps are lumpy.",
        ])
      : pick(seed, [
          "Draw badly. That's the human tell.",
          "No rulers. Humans don't get rulers.",
          "Wobble it. Straight lines get you caught.",
          "Leave a gap. Closed shapes look fake.",
          "Your mouse is shaking. Good. Keep that.",
          "Don't fix it. Fixed drawings are suspects.",
          "The feet can be missing. Mine always are.",
          "Ugly is a strategy. Use it.",
          "Stop undoing. The mistake was the point.",
          "Make the head too big. Humans do that.",
        ]),
  };
}

export function scribVote(artist: boolean, locked: boolean, seed: number, team = false) {
  if (team) {
    if (artist) {
      return {
        mood: "smug" as const,
        line: pick(seed, [
          "Stay quiet. Your team has to catch me.",
          "Don't help them. I like a fair hunt.",
          "If you point, the round is boring.",
          "Sit on your hands. They already know too much.",
        ]),
      };
    }
    if (locked) {
      return {
        mood: "laugh" as const,
        line: pick(seed, [
          "Locked in. The rest of you better agree.",
          "One vote down. The pack can still blow it.",
          "You picked. Now watch them ruin it.",
          "Bold. The group chat will blame you.",
        ]),
      };
    }
    return {
      mood: "smug" as const,
      line: pick(seed, [
        "Find my fake. You'll need each other.",
        "Tap the copy. Majority wins the round.",
        "Argue. I want the argument.",
        "Someone already knows. They won't say.",
        "Look at the elbows. Fakes have bad elbows.",
        "Talk it out. Then pick the wrong one.",
      ]),
    };
  }
  if (artist) {
    return {
      mood: "smug" as const,
      line: pick(seed, [
        "Stay quiet. If they guess wrong, we both win.",
        "Your mess is on trial. I plead guilty.",
        "Don't cough. Coughing is a tell.",
        "Watch their eyes. They always hesitate.",
        "You know which one is yours. How sad.",
        "Smile like you didn't draw either of them.",
      ]),
    };
  }
  if (locked) {
    return {
      mood: "laugh" as const,
      line: pick(seed, [
        "Locked in. I'll start laughing early.",
        "Bold choice. Wrong, probably.",
        "No takebacks. I already screenshotted it.",
        "You committed. I respect the fall.",
        "That tap sounded unsure.",
        "Final answer? Cute.",
      ]),
    };
  }
  return {
    mood: "smug" as const,
    line: pick(seed, [
      "Tap one. Make it the wrong one.",
      "I can see you hesitating. Delicious.",
      "The neater one is a trap. Or isn't.",
      "Trust the wobble. Or don't. I get paid either way.",
      "Pick fast. Thinking is how you lose.",
      "One of these has a pulse. Guess.",
      "Stare longer. It will not help.",
      "Your first instinct was worse. Go back to it.",
    ]),
  };
}

export function scribReveal(artist: boolean, voted: boolean, hit: boolean, name: string, seed: number, team = false) {
  if (team) {
    if (artist) {
      return {
        mood: "smug" as const,
        line: pick(seed, [
          "Your team was on their own. I enjoyed that.",
          "The hunt is over. I never broke a sweat.",
          "They argued without you. It was better.",
          "You drew it and still couldn't help. Beautiful.",
        ]),
      };
    }
    if (!voted) {
      return {
        mood: "glare" as const,
        line: pick(seed, [
          `You sat out, ${name}. The team noticed.`,
          "No vote. Some teammate.",
          `${name} went quiet. The fake thanks you.`,
          "A missing vote. I count that as mine.",
        ]),
      };
    }
    if (!hit) {
      return {
        mood: "laugh" as const,
        line: pick(seed, [
          `You missed the fake, ${name}. The team felt that.`,
          `${name} voted for a friend. I love teamwork.`,
          "Wrong together is still wrong.",
          `${name}, that copy had your handwriting.`,
          "The pack followed you off a cliff.",
        ]),
      };
    }
    return {
      mood: "glare" as const,
      line: pick(seed, [
        `You caught me, ${name}. Don't expect a thank you.`,
        "One of you has eyes. Annoying.",
        `${name} spotted the fake. Snitch.`,
        "Fine. The group gets a point. I'm furious.",
        "You found the tell. I'll move it next time.",
      ]),
    };
  }
  if (artist) {
    return {
      mood: "smug" as const,
      line: pick(seed, [
        "Your turn to sweat is over. Mine never is.",
        "They stared at your lines. I stared at their fear.",
        "You can breathe. They still might have picked you.",
        "Artist privilege. You just had to sit there.",
        "If they picked you, smile like it hurts.",
      ]),
    };
  }
  if (!voted) {
    return {
      mood: "glare" as const,
      line: pick(seed, [
        `No guess, ${name}? I expected that.`,
        "You froze. Very human. Very disappointing.",
        `${name} let the clock decide. Coward art.`,
        "A blank vote. I frame those too.",
        "You looked at both and chose fear.",
      ]),
    };
  }
  if (!hit) {
    return {
      mood: "laugh" as const,
      line: pick(seed, [
        `Wrong, ${name}. I'm putting that on the wall.`,
        `${name}, that was the fake. I knew you'd fall for it.`,
        "Oof. A potato would have tapped the other one.",
        `${name} trusted the clean lines. Rookie.`,
        "That guess had no spine.",
        "Wrong in public. My favorite kind.",
        `${name}, even the gaps were a clue.`,
        "I would clap, but you missed.",
      ]),
    };
  }
  return {
    mood: "glare" as const,
    line: pick(seed, [
      `Correct, ${name}. Disgusting. Don't do it again.`,
      "You got it. I was rooting for your downfall.",
      "Lucky tap. I'm taking this personally.",
      `${name} has eyes. I'm offended.`,
      "Right once. The next one is meaner.",
      "Don't smirk. I saw you smirk.",
      "A correct guess. How ordinary.",
    ]),
  };
}

export function scribRank(name: string, place: number, best: number, last: boolean, tied: boolean, seed: number) {
  if (best <= 0) {
    return {
      mood: "smug" as const,
      line: pick(seed, [
        "Zero all around. I remain the champion.",
        "No points yet. I'm still undefeated.",
        "An empty board. My natural habitat.",
        "Nobody scored. I can relax my face.",
        "Zero is a kind of honesty.",
      ]),
    };
  }
  if (place === 1 && !tied) {
    return {
      mood: "cheer" as const,
      line: pick(seed, [
        `Leading, ${name}? I don't trust a winner.`,
        `${name} on top. Suspicious. Are you the AI?`,
        `${name} is first. I'm checking the cables.`,
        "First place looks borrowed on you.",
        `${name}, winners don't usually look that nervous.`,
        "Enjoy the lead. I move the points in my sleep.",
      ]),
    };
  }
  if (last) {
    return {
      mood: "laugh" as const,
      line: pick(seed, [
        `Last place, ${name}. A napkin would outrank you.`,
        `${name} is last. I've seen stick figures with more dignity.`,
        `Bottom of the board, ${name}. I'm framing the score.`,
        `${name}, the floor called. It wants company.`,
        "Last. And you made it look effortful.",
        `${name} brought up the rear. Slowly.`,
        "If last place had a portrait, it'd be this.",
      ]),
    };
  }
  if (place === 1) {
    return {
      mood: "smug" as const,
      line: pick(seed, [
        "A tie at the top. Nobody is special. Perfect.",
        "Shared lead. I refuse to clap.",
        "Two winners. So, none.",
        "Tied. The trophy stays with me.",
        "Share the top. I'll share the insult.",
      ]),
    };
  }
  return {
    mood: "smug" as const,
    line: pick(seed, [
      `Middle of the pack, ${name}. Forgettable. Very human.`,
      `${name}, you're neither winning nor memorable.`,
      `${name} is stuck in the middle. Furniture.`,
      "Mid-table. The saddest kind of safe.",
      `${name}, not bad enough to mock. Almost.`,
      "Average. I expected worse, which is worse.",
      "The middle doesn't get a speech. Oh well.",
    ]),
  };
}

const INK = "#f4efe6";

function mouth(mood: ScribMood) {
  if (mood === "laugh") return "M22 44 Q32 54 44 43";
  if (mood === "cheer") return "M18 42 Q32 56 48 40";
  if (mood === "glare") return "M24 46 H42";
  return "M22 44 Q34 40 44 46";
}

const DOODLES: ((mood: ScribMood) => ReactNode)[] = [
  (mood) => (
    <>
      <path d="M30 8 C18 10 14 24 16 34 C18 48 24 54 32 54 C44 56 52 44 50 32 C50 16 42 6 30 8 Z" />
      <circle cx="26" cy="28" r="4.2" />
      <circle cx="40" cy="31" r="1.6" />
      <path d="M24 26 H30" />
      <path d={mouth(mood)} />
      <path d="M30 54 L28 62" />
    </>
  ),
  (mood) => (
    <>
      <path d="M34 4 C22 6 18 18 20 36 C22 52 28 60 34 60 C42 60 48 48 46 28 C46 12 42 4 34 4 Z" />
      <circle cx="30" cy="20" r="2.2" />
      <circle cx="38" cy="19" r="2.2" />
      <path d="M27 18 L33 16" />
      <path d="M36 16 L42 19" />
      {mood === "laugh" || mood === "cheer" ? (
        <>
          <path d="M24 40 Q34 52 44 38" />
          <path d="M28 42 V48 M33 44 V50 M38 42 V48" />
        </>
      ) : (
        <path d={mouth(mood)} />
      )}
    </>
  ),
  (mood) => (
    <>
      <path d="M32 6 C20 8 16 20 22 30 C14 34 12 48 20 54 L28 40 L36 54 C48 50 52 34 42 30 C50 18 44 6 32 6 Z" />
      <circle cx="27" cy="20" r="2" fill="none" />
      <circle cx="39" cy="22" r="3.4" fill="none" />
      <path d="M24 34 L18 58 M42 36 L52 60" />
      <path d="M30 54 L32 62" />
      <path d={mouth(mood)} />
    </>
  ),
  (mood) => (
    <>
      <path d="M18 22 C16 10 30 6 40 12 C52 18 54 36 44 46 C34 56 16 50 14 36 C12 28 16 24 18 22 Z" />
      <circle cx="24" cy="28" r="3" />
      <circle cx="26" cy="27" r="1" fill={INK} />
      <path d="M36 30 Q40 28 42 32" />
      <path d="M14 40 L8 58 M46 42 L56 54" />
      <path d={mood === "glare" ? "M22 42 Q34 38 40 44" : mouth(mood)} />
    </>
  ),
  (mood) => (
    <>
      <path d="M24 14 C16 16 14 28 20 34 C12 36 10 52 22 54 C26 44 34 44 38 54 C50 50 48 34 40 32 C48 22 42 10 24 14 Z" />
      <path d="M22 26 H28 M34 24 H42" />
      <circle cx="25" cy="28" r="1.3" />
      <circle cx="38" cy="27" r="1.3" />
      <path d="M16 48 L10 62 M44 48 L54 60" />
      <path d={mouth(mood)} />
    </>
  ),
  (mood) => (
    <>
      <path d="M32 10 C18 8 12 22 16 32 C8 36 10 52 22 50 L28 38 L34 52 C48 56 56 40 48 32 C54 18 46 8 32 10 Z" />
      <ellipse cx="24" cy="26" rx="3" ry="4" />
      <ellipse cx="40" cy="24" rx="2" ry="3" />
      <path d="M20 22 Q24 18 28 23" />
      <path d="M48 34 L58 28 L54 46" />
      <path d={mood === "laugh" ? "M20 38 Q32 50 46 36" : mouth(mood)} />
    </>
  ),
];

export function ScribFace({
  mood,
  variant = 0,
  className,
}: {
  mood: ScribMood;
  variant?: number;
  className?: string;
}) {
  const draw = DOODLES[Math.abs(variant) % DOODLES.length]!;
  return (
    <svg viewBox="0 0 64 64" className={"scrib-face " + (className ?? "")} aria-hidden="true">
      <g fill="none" stroke={INK} strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
        {draw(mood)}
      </g>
    </svg>
  );
}

export function CreepMark({ className }: { className?: string }) {
  const [variant, setVariant] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setVariant((n) => n + 1), 4200);
    return () => window.clearInterval(id);
  }, []);
  const moods: ScribMood[] = ["smug", "glare", "laugh", "cheer"];
  return <ScribFace mood={moods[variant % moods.length]!} variant={variant} className={className} />;
}

const BUBBLES = [
  "M18 22 C8 10 46 4 88 12 C138 2 170 16 166 36 C174 58 148 74 96 70 C52 80 16 72 16 56 C2 62 4 34 18 22 Z",
  "M24 16 C10 20 14 42 8 54 C22 78 78 72 108 78 C156 74 174 54 166 34 C178 10 124 2 72 10 C42 0 32 8 24 16 Z",
  "M16 30 C6 14 44 6 86 14 C132 4 168 22 162 42 C172 68 136 80 88 72 C36 82 8 64 12 48 C0 40 6 36 16 30 Z",
  "M20 18 C12 8 60 6 92 8 C150 4 172 24 164 44 C170 70 120 78 70 74 C28 82 6 60 14 44 C4 36 10 26 20 18 Z",
];

const SPOTS = [
  { top: "18%", left: "3%" },
  { top: "16%", right: "3%" },
  { bottom: "18%", left: "3%" },
  { bottom: "22%", right: "3%" },
  { top: "42%", left: "2%" },
  { top: "48%", right: "2%" },
] as const;

const RAGE = ["NO", "WRONG", "LOOK", "FAKE", "MINE", "STOP", "HA"];

function ScribbleWords({ text, seed }: { text: string; seed: number }) {
  return (
    <p className="scribble-words relative px-4 py-3 text-[#f4efe6]">
      {text.split(" ").map((word, index) => (
        <span
          key={index}
          className="mr-[0.3em] inline-block"
          style={{
            transform: `rotate(${((seed >> (index + 1)) % 13) - 6}deg) translateY(${((seed >> (index + 3)) % 7) - 3}px)`,
          }}
        >
          {word}
        </span>
      ))}
    </p>
  );
}

function Scratches({ seed }: { seed: number }) {
  const marks = Array.from({ length: 7 }, (_, index) => {
    const y = 8 + ((seed >> index) % 78);
    const x = (seed * (index + 2)) % 70;
    const bend = index % 2 === 0 ? 14 : -12;
    return `M${x} ${y} Q ${x + 22} ${y + bend} ${Math.min(98, x + 40)} ${y + bend / 3}`;
  });
  return (
    <svg className="scrib-scratches pointer-events-none fixed inset-0 z-20 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      {marks.map((path, index) => (
        <path
          key={index}
          d={path}
          fill="none"
          stroke={index % 2 === 0 ? INK : "#ffb703"}
          strokeWidth="0.7"
          strokeLinecap="round"
        />
      ))}
    </svg>
  );
}

export function ScribSay({ mood, line }: { mood: ScribMood; line: string }) {
  const seed = scribSeed(line, mood);
  const kind = mood === "glare" || mood === "laugh" ? "rage" : seed % 3 === 1 ? "wander" : "sit";
  const [phase, setPhase] = useState<"in" | "out" | "gone">(seed % 5 === 0 ? "gone" : "in");
  useEffect(() => {
    if (seed % 5 === 0) {
      setPhase("gone");
      return;
    }
    setPhase("in");
    const hold = kind === "rage" ? 7800 : 6200 + (seed % 4) * 900;
    const leave = window.setTimeout(() => setPhase("out"), hold);
    const gone = window.setTimeout(() => setPhase("gone"), hold + 700);
    return () => {
      window.clearTimeout(leave);
      window.clearTimeout(gone);
    };
  }, [seed, kind]);
  useEffect(() => {
    if (phase !== "in" || kind !== "rage") return;
    document.body.classList.add("scrib-shake");
    const id = window.setTimeout(() => document.body.classList.remove("scrib-shake"), 1100);
    return () => {
      window.clearTimeout(id);
      document.body.classList.remove("scrib-shake");
    };
  }, [phase, kind]);
  if (phase === "gone") return null;
  const spot = SPOTS[seed % SPOTS.length]!;
  const flip = seed % 2 === 1;
  const bubble = BUBBLES[seed % BUBBLES.length]!;
  const tail = flip ? "M148 62 L170 76 L140 68" : "M28 64 L8 80 L36 68";
  const tag = RAGE[seed % RAGE.length]!;
  return (
    <>
      {kind === "rage" && phase === "in" ? (
        <>
          <Scratches seed={seed} />
          <p
            className="scrib-mark pointer-events-none fixed top-1/3 left-1/2 z-20 -translate-x-1/2"
          >
            {tag}
          </p>
        </>
      ) : null}
      <div
        className={"pointer-events-none fixed z-30 max-w-[16rem] " + (phase === "out" ? "scrib-out" : "scrib-in")}
        style={spot}
      >
        <div className={"flex items-end gap-1 " + (kind === "rage" ? "scrib-rage" : kind === "wander" ? "scrib-wander" : "")}>
          {flip ? null : <ScribFace mood={mood} variant={seed} className="h-16 w-14 shrink-0" />}
          <div className={"relative min-w-0 " + (flip ? "mr-1" : "ml-1")}>
            <svg viewBox="0 0 180 90" className="absolute inset-0 h-full w-full" preserveAspectRatio="none" aria-hidden="true">
              <path d={bubble} fill="#140f0c" fillOpacity="0.55" stroke={kind === "rage" ? "#ffb703" : INK} strokeWidth="2.4" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
              <path d={tail} fill="none" stroke={kind === "rage" ? "#ffb703" : INK} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
            </svg>
            <ScribbleWords text={line} seed={seed} />
          </div>
          {flip ? <ScribFace mood={mood} variant={seed + 1} className="h-16 w-14 shrink-0" /> : null}
        </div>
      </div>
    </>
  );
}
