import { useEffect, useMemo, useRef, useState } from "react";
import { PROMPT_LIST, sketchDataUrl, type Difficulty } from "@/game/sketches";
import { COUNTRIES, countryName, countryOutlineUrl } from "@/game/countries";
import { ScribSay, scribDraw, scribLobby, scribRank, scribReveal, scribSeed, scribVote } from "@/game/scrib";
import { getDrawing, pickDrawing, saveDrawing } from "@/game/drawings.functions";
import { passStatus, studioDrawing, unlockStudio } from "@/game/studio.functions";
import { SignedIn, SignedOut, UserButton } from "@/lib/auth/gates";
import { useP2PRoom } from "@/lib/multiplayer/use-p2p-room";

type Phase = "lobby" | "drawing" | "vote" | "results";
type Mode = "classic" | "same" | "blitz" | "studio" | "countries" | "team" | "imposter";
type Ballot = { image: "A" | "B" };
type Player = { id: string; name: string };
type ChatLine = { id: string; from: string; text: string; system?: boolean };
type PairMeta = {
  playerId: string;
  playerName: string;
  promptIndex: number;
  seed: number;
  humanSide: "A" | "B";
  archiveId?: number | null;
};
type Snap = {
  hostId: string;
  phase: Phase;
  round: number;
  mode: Mode;
  difficulty: Difficulty;
  timerOn: boolean;
  timerSeconds: number;
  commentsOn: boolean;
  deadline: number | null;
  order: Player[];
  topics: Record<string, number>;
  pairs: PairMeta[];
  slot: number;
  revealed: boolean;
  votes: Record<string, Record<string, Ballot>>;
  scores: Record<string, number>;
  chat: ChatLine[];
  aiName: string;
  aliases: Record<string, string>;
  eliminated: string[];
  kicks: Record<string, string>;
  kicked: string;
  winner: "" | "humans" | "ai";
};
type NetMsg =
  | { t: "snap"; snap: Snap }
  | { t: "ink"; playerId: string; png: string }
  | { t: "vote"; image: "A" | "B" }
  | { t: "kick"; target: string }
  | { t: "chat"; text: string }
  | { t: "studio"; promptIndex: number; png: string };

const AI_NAMES = ["Alex", "Sam", "Jordan", "Casey", "Riley", "Quinn"];
const AI_LINES = [
  "I freehanded that, the lines went all over the place",
  "The circle would not close, mouse is awful",
  "I left the feet unfinished on purpose",
  "Mine looks worse, that is how you know it is me",
  "I only had a minute, do not be mean",
  "Look at the gap in the outline, that is a real mouse slip",
  "The other one is too neat, I cannot draw straight",
  "I redrew the head twice and it still looks wrong",
];
const MODES: { id: Mode; label: string; hint: string }[] = [
  { id: "classic", label: "Classic", hint: "Compete against each other" },
  { id: "team", label: "Together", hint: "Beat the AI as a team" },
  { id: "same", label: "Same prompt", hint: "One shared prompt" },
  { id: "blitz", label: "Blitz", hint: "30 seconds, one vote" },
  { id: "studio", label: "Studio", hint: "A real AI drawing" },
  { id: "countries", label: "Countries", hint: "Draw the real border" },
  { id: "imposter", label: "Imposter", hint: "Fake names. Vote one out." },
];
const FAKE = "fake";
const ALIASES = [
  "Pickle",
  "Lamp",
  "Moth",
  "Spoon",
  "Brick",
  "Toast",
  "Puddle",
  "Onion",
  "Moss",
  "Wrench",
  "Carpet",
  "Button",
  "Pebble",
  "Cabbage",
  "Thimble",
  "Gutter",
  "Kettle",
  "Marble",
];
const TEAM_KEY = "__humans";
const SCRIB_KEY = "__scrib";
const DIFFICULTIES: { id: Difficulty; label: string; hint: string }[] = [
  { id: "easy", label: "Easy", hint: "Obvious" },
  { id: "medium", label: "Medium", hint: "Shaky" },
  { id: "hard", label: "Hard", hint: "Close" },
  { id: "expert", label: "Expert", hint: "Tough" },
];
const TIMER_CHOICES = [30, 60, 90, 120, 180];
const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function uid() {
  return Math.random().toString(36).slice(2, 8);
}

function makeCode() {
  let code = "";
  for (let i = 0; i < 4; i++) code += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
  return code;
}

function shuffle<T>(list: T[]): T[] {
  const bag = [...list];
  const rand = new Uint32Array(bag.length);
  crypto.getRandomValues(rand);
  for (let i = bag.length - 1; i > 0; i--) {
    const j = rand[i]! % (i + 1);
    const swap = bag[i]!;
    bag[i] = bag[j]!;
    bag[j] = swap;
  }
  return bag;
}

function dealFrom(total: number, count: number, key: string) {
  const all = Array.from({ length: total }, (_, i) => i);
  let deck: number[] = [];
  try {
    const saved = JSON.parse(sessionStorage.getItem(key) || "[]") as unknown;
    if (Array.isArray(saved)) {
      deck = saved.filter((n): n is number => typeof n === "number" && n >= 0 && n < total);
    }
  } catch {
    deck = [];
  }
  if (deck.length < count) {
    const held = new Set(deck);
    deck = [...deck, ...shuffle(all.filter((i) => !held.has(i)))];
    if (deck.length < count) deck = shuffle(all);
  }
  sessionStorage.setItem(key, JSON.stringify(deck.slice(count)));
  return deck.slice(0, count);
}

function dealPrompts(count: number) {
  return dealFrom(PROMPT_LIST.length, count, "hon-deck");
}

function dealAliases(players: Player[]) {
  const bag = shuffle(ALIASES);
  const aliases: Record<string, string> = { [FAKE]: bag[0] ?? "Shadow" };
  players.forEach((player, index) => {
    aliases[player.id] = bag[index + 1] ?? `Thing ${index + 1}`;
  });
  return aliases;
}

function answerSide(mode: Mode, humanSide: "A" | "B"): "A" | "B" {
  if (mode === "countries" || mode === "team") return humanSide === "A" ? "B" : "A";
  return humanSide;
}

function blankCanvas(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.fillStyle = "#111114";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = "#f4efe6";
  ctx.lineWidth = 4;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
}

function shrinkToJpeg(src: string) {
  return new Promise<string>((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(src);
        return;
      }
      ctx.fillStyle = "#111114";
      ctx.fillRect(0, 0, 512, 512);
      ctx.drawImage(img, 0, 0, 512, 512);
      resolve(canvas.toDataURL("image/jpeg", 0.7));
    };
    img.onerror = () => resolve(src);
    img.src = src;
  });
}

function exportDrawing(canvas: HTMLCanvasElement) {
  const out = document.createElement("canvas");
  out.width = 360;
  out.height = 360;
  const ctx = out.getContext("2d");
  if (!ctx) return "";
  ctx.fillStyle = "#111114";
  ctx.fillRect(0, 0, 360, 360);
  ctx.drawImage(canvas, 0, 0, 360, 360);
  return out.toDataURL("image/jpeg", 0.55);
}

function lobbySnap(
  hostId: string,
  mode: Mode,
  difficulty: Difficulty,
  timerOn: boolean,
  timerSeconds: number,
  commentsOn: boolean,
): Snap {
  return {
    hostId,
    phase: "lobby",
    round: 0,
    mode,
    difficulty,
    timerOn,
    timerSeconds,
    commentsOn,
    deadline: null,
    order: [],
    topics: {},
    pairs: [],
    slot: 0,
    revealed: false,
    votes: {},
    scores: {},
    chat: [],
    aiName: "Alex",
    aliases: {},
    eliminated: [],
    kicks: {},
    kicked: "",
    winner: "",
  };
}

function setRoomInUrl(code: string | null) {
  const url = new URL(window.location.href);
  if (code) url.searchParams.set("room", code);
  else url.searchParams.delete("room");
  window.history.replaceState({}, "", url);
}

export function HumanOrNot() {
  const [entry, setEntry] = useState<{ room: string; name: string; host: boolean } | null>(null);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const room = (params.get("room") ?? "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 4);
    if (room) setCode(room);
    const saved = sessionStorage.getItem("hon-name") ?? "";
    if (saved) setName(saved);
  }, []);

  if (!entry) {
    return (
      <Door
        name={name}
        setName={setName}
        code={code}
        setCode={setCode}
        onCreate={() => {
          const room = makeCode();
          sessionStorage.setItem("hon-name", name.trim());
          sessionStorage.setItem(`hon-host-${room}`, "1");
          setRoomInUrl(room);
          setEntry({ room, name: name.trim(), host: true });
        }}
        onJoin={() => {
          const room = code.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 4);
          sessionStorage.setItem("hon-name", name.trim());
          const host = sessionStorage.getItem(`hon-host-${room}`) === "1";
          setRoomInUrl(room);
          setEntry({ room, name: name.trim(), host });
        }}
      />
    );
  }

  return (
    <Room
      key={`${entry.room}:${entry.name}:${entry.host}`}
      room={entry.room}
      name={entry.name}
      host={entry.host}
      onLeave={() => {
        setRoomInUrl(null);
        setEntry(null);
      }}
    />
  );
}

function Door({
  name,
  setName,
  code,
  setCode,
  onCreate,
  onJoin,
}: {
  name: string;
  setName: (value: string) => void;
  code: string;
  setCode: (value: string) => void;
  onCreate: () => void;
  onJoin: () => void;
}) {
  const clean = code.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 4);
  return (
    <main className="mx-auto flex h-dvh w-full max-w-3xl flex-col overflow-hidden px-4 pt-4 pb-20">
      <header className="mb-4 shrink-0">
        <p className="font-display text-sm tracking-wide text-accent">Doodle duel</p>
        <h1 className="font-display text-5xl leading-none text-fg">Human or Not</h1>
        <p className="mt-2 text-sm text-muted">Draw something dumb. Spot the fake.</p>
        <div className="mt-2">
          <SignedIn>
            <UserButton />
          </SignedIn>
          <SignedOut>
            <a href="/login" className="text-sm text-accent">
              Sign in for Studio
            </a>
          </SignedOut>
        </div>
      </header>
      <section className="min-h-0 flex-1">
        <div className="rounded-card border border-line bg-surface p-4">
          <label className="block text-sm text-muted" htmlFor="name">
            Your name
          </label>
          <input
            id="name"
            value={name}
            maxLength={16}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-xl border border-line bg-bg px-3 py-3 text-fg outline-none focus:border-accent"
            placeholder="Name"
          />
          <button
            type="button"
            disabled={!name.trim()}
            onClick={onCreate}
            className="mt-4 rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-accent-ink disabled:opacity-40"
          >
            Create a game
          </button>
          <p className="mt-6 text-sm text-muted">Or join one</p>
          <div className="mt-2 flex gap-2">
            <input
              value={code}
              maxLength={4}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="w-28 rounded-xl border border-line bg-bg px-3 py-3 text-center tracking-[0.2em] text-fg uppercase outline-none focus:border-accent"
              placeholder="CODE"
              aria-label="Room code"
            />
            <button
              type="button"
              disabled={!name.trim() || clean.length !== 4}
              onClick={onJoin}
              className="rounded-xl bg-raised px-4 py-3 text-sm font-medium disabled:opacity-40"
            >
              Join
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}

function Room({
  room,
  name,
  host,
  onLeave,
}: {
  room: string;
  name: string;
  host: boolean;
  onLeave: () => void;
}) {
  const p2p = useP2PRoom({ room, name });
  const [snap, setSnap] = useState<Snap | null>(null);
  const [inks, setInks] = useState<Record<string, string>>({});
  const [studioInks, setStudioInks] = useState<Record<number, string>>({});
  const studioRef = useRef<Record<number, string>>({});
  const [passOn, setPassOn] = useState(false);
  const [studioNote, setStudioNote] = useState("");
  const [mode, setMode] = useState<Mode>("classic");
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [timerOn, setTimerOn] = useState(true);
  const [timerSeconds, setTimerSeconds] = useState(90);
  const [commentsOn, setCommentsOn] = useState(false);
  const [timeLeft, setTimeLeft] = useState(90);
  const [pickImage, setPickImage] = useState<"A" | "B" | null>(null);
  const [pickKick, setPickKick] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [copied, setCopied] = useState(false);
  const timerBeforeBlitz = useRef(90);
  const snapRef = useRef<Snap | null>(null);
  const inksRef = useRef<Record<string, string>>({});
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawing = useRef(false);
  const sent = useRef(false);
  const finishing = useRef(false);
  const idleFinish = useRef<number | null>(null);

  const roster = useMemo<Player[]>(() => {
    const list: Player[] = [{ id: p2p.selfId, name }];
    for (const peer of p2p.peers) {
      if (peer.connectionState !== "connected") continue;
      list.push({ id: peer.id, name: peer.name || "Player" });
    }
    return list.slice(0, 6);
  }, [p2p.peers, p2p.selfId, name]);

  useEffect(() => {
    if (!host) return;
    passStatus()
      .then((pass) => setPassOn(pass.active))
      .catch(() => setPassOn(false));
  }, [host]);

  function buyStudio() {
    setStudioNote("");
    unlockStudio()
      .then(() => {
        setPassOn(true);
        setStudioNote("Test night is on for 3 hours. Card checkout isn't connected, so this one is free.");
      })
      .catch(() => setStudioNote("Sign in first. Studio nights belong to the host."));
  }

  function publish(next: Snap) {
    snapRef.current = next;
    setSnap(next);
    p2p.send({ t: "snap", snap: next });
  }

  function pushSetup(partial: Partial<Pick<Snap, "mode" | "difficulty" | "timerOn" | "timerSeconds" | "commentsOn">>) {
    if (!host) return;
    const current = snapRef.current;
    if (current && current.phase !== "lobby" && current.phase !== "results") return;
    const base = current ?? lobbySnap(p2p.selfId, mode, difficulty, timerOn, timerSeconds, commentsOn);
    publish({ ...base, hostId: p2p.selfId, ...partial });
  }

  function chooseMode(next: Mode) {
    let seconds = timerSeconds;
    let on = timerOn;
    if (next === "blitz" && mode !== "blitz") {
      timerBeforeBlitz.current = timerSeconds;
      seconds = 30;
      on = true;
      setTimerSeconds(30);
      setTimerOn(true);
    } else if (next !== "blitz" && mode === "blitz") {
      seconds = timerBeforeBlitz.current;
      setTimerSeconds(seconds);
    }
    let comments = commentsOn;
    if (next === "team") {
      comments = true;
      setCommentsOn(true);
    }
    if (next === "imposter") {
      comments = false;
      setCommentsOn(false);
    }
    setMode(next);
    pushSetup({ mode: next, timerOn: on, timerSeconds: seconds, difficulty, commentsOn: comments });
  }

  async function finishDrawing(base: Snap) {
    if (finishing.current) return;
    if (snapRef.current?.phase === "vote" || snapRef.current?.phase === "results") return;
    finishing.current = true;
    if (base.mode === "imposter") {
      const promptIndex = Object.values(base.topics)[0] ?? 0;
      let png = sketchDataUrl(promptIndex, Math.floor(Math.random() * 1e9) + 1, base.difficulty);
      try {
        const picked = await pickDrawing({ data: { promptIndex, notImage: "none" } });
        if (picked?.id) {
          const row = await getDrawing({ data: { id: picked.id } });
          if (row?.image) png = row.image;
        }
      } catch {
        png = sketchDataUrl(promptIndex, Math.floor(Math.random() * 1e9) + 1, base.difficulty);
      }
      for (const player of base.order) {
        const latest = inksRef.current[player.id] ?? "";
        if (latest.startsWith("data:image/jpeg")) {
          void saveDrawing({ data: { promptIndex, image: latest } }).catch(() => {});
        }
      }
      if (snapRef.current?.phase !== "drawing") {
        finishing.current = false;
        return;
      }
      noteInk(FAKE, png);
      p2p.send({ t: "ink", playerId: FAKE, png });
      publish({ ...base, phase: "vote", revealed: false, kicks: {}, kicked: "", commentsOn: false, chat: [] });
      finishing.current = false;
      return;
    }
    if (base.mode === "studio") {
      const promptIndex = base.topics[base.order[0]?.id ?? ""] ?? 0;
      try {
        const drawn = await studioDrawing({ data: { promptIndex } });
        if (drawn.ok) {
          const jpeg = await shrinkToJpeg(drawn.image);
          studioRef.current = { ...studioRef.current, [promptIndex]: jpeg };
          setStudioInks(studioRef.current);
          p2p.send({ t: "studio", promptIndex, png: jpeg });
        } else setStudioNote(drawn.error);
      } catch {
        setStudioNote("The AI drawing failed. The doodle stands in.");
      }
    }
    const players = base.mode === "blitz" ? [base.order[Math.floor(Math.random() * base.order.length)]!] : base.order;
    const pairs: PairMeta[] = [];
    for (const player of players) {
      const promptIndex = base.topics[player.id] ?? 0;
      const human = inksRef.current[player.id] ?? "";
      let archiveId: number | null = null;
      if (base.mode !== "studio" && base.mode !== "countries" && human) {
        try {
          const picked = await pickDrawing({ data: { promptIndex, notImage: human } });
          archiveId = picked?.id ?? null;
        } catch {
          archiveId = null;
        }
      }
      const latest = inksRef.current[player.id] ?? human;
      if (base.mode !== "countries" && latest.startsWith("data:image/jpeg")) {
        void saveDrawing({ data: { promptIndex, image: latest } }).catch(() => {});
      }
      pairs.push({
        playerId: player.id,
        playerName: player.name,
        promptIndex,
        seed: Math.floor(Math.random() * 1e9) + 1,
        humanSide: Math.random() < 0.5 ? "A" : "B",
        archiveId,
      });
    }
    if (snapRef.current?.phase !== "drawing") {
      finishing.current = false;
      return;
    }
    const aiName = AI_NAMES[Math.floor(Math.random() * AI_NAMES.length)]!;
    publish({
      ...base,
      phase: "vote",
      pairs,
      slot: 0,
      revealed: false,
      votes: {},
      aiName,
      chat: base.commentsOn
        ? [
            {
              id: uid(),
              from: "",
              system: true,
              text: base.mode === "countries"
                ? `${pairs[0]?.playerName ?? "They"} stays quiet. Which outline is the real border?`
                : base.mode === "team"
                  ? `${pairs[0]?.playerName ?? "They"} stays quiet. Catch the fake together.`
                  : `${pairs[0]?.playerName ?? "They"} stays quiet. Which drawing is theirs?`,
            },
          ]
        : [],
    });
    if (base.commentsOn && base.mode !== "countries") nudgeAi(0);
    finishing.current = false;
  }

  function nudgeAi(slot: number) {
    window.setTimeout(() => {
      const current = snapRef.current;
      if (!current?.commentsOn || current.phase !== "vote" || current.slot !== slot || current.revealed) return;
      publish({
        ...current,
        chat: [
          ...current.chat,
          { id: uid(), from: current.aiName, text: AI_LINES[Math.floor(Math.random() * AI_LINES.length)]! },
        ],
      });
    }, 1200);
  }

  function noteInk(playerId: string, png: string) {
    if (inksRef.current[playerId] === png) return;
    inksRef.current = { ...inksRef.current, [playerId]: png };
    setInks(inksRef.current);
    const current = snapRef.current;
    if (!host || !current || current.phase !== "drawing") return;
    if (current.deadline) return;
    if (!current.order.every((player) => inksRef.current[player.id])) return;
    if (idleFinish.current) window.clearTimeout(idleFinish.current);
    idleFinish.current = window.setTimeout(() => {
      const snapNow = snapRef.current;
      if (!snapNow || snapNow.phase !== "drawing" || snapNow.deadline) return;
      if (!snapNow.order.every((player) => inksRef.current[player.id])) return;
      finishDrawing(snapNow);
    }, 4000);
  }

  function reveal(base: Snap) {
    if (base.revealed) return;
    const pair = base.pairs[base.slot];
    if (!pair) return;
    const ballots = base.votes[pair.playerId] ?? {};
    const scores = { ...base.scores };
    if (base.mode === "team") {
      let caught = 0;
      let missed = 0;
      for (const vote of Object.values(ballots)) {
        if (vote.image === answerSide(base.mode, pair.humanSide)) caught += 1;
        else missed += 1;
      }
      if (caught > missed) scores[TEAM_KEY] = (scores[TEAM_KEY] ?? 0) + 1;
      else scores[SCRIB_KEY] = (scores[SCRIB_KEY] ?? 0) + 1;
      publish({ ...base, revealed: true, scores });
      return;
    }
    for (const [id, vote] of Object.entries(ballots)) {
      if (vote.image === answerSide(base.mode, pair.humanSide)) scores[id] = (scores[id] ?? 0) + 2;
    }
    publish({ ...base, revealed: true, scores });
  }

  function resolveKick(base: Snap) {
    const tally = new Map<string, number>();
    for (const target of Object.values(base.kicks)) tally.set(target, (tally.get(target) ?? 0) + 1);
    let best = 0;
    for (const count of tally.values()) best = Math.max(best, count);
    const tied = [...tally.keys()].filter((id) => tally.get(id) === best);
    const kicked = tied[Math.floor(Math.random() * tied.length)] ?? "";
    if (!kicked) {
      publish(base);
      return;
    }
    if (kicked === FAKE) {
      publish({ ...base, revealed: true, kicked, winner: "humans" });
      return;
    }
    const eliminated = [...base.eliminated, kicked];
    const stillIn = base.order.filter((player) => !eliminated.includes(player.id));
    publish({ ...base, revealed: true, kicked, eliminated, winner: stillIn.length <= 1 ? "ai" : "" });
  }

  function applyKick(base: Snap, voterId: string, target: string) {
    if (base.mode !== "imposter" || base.phase !== "vote" || base.revealed) return;
    if (!base.order.some((player) => player.id === voterId)) return;
    if (voterId === target || base.kicks[voterId]) return;
    const seats = new Set([...base.order.map((player) => player.id), FAKE]);
    if (!seats.has(target)) return;
    const kicks = { ...base.kicks, [voterId]: target };
    const next = { ...base, kicks };
    if (base.order.every((player) => kicks[player.id])) resolveKick(next);
    else publish(next);
  }

  function applyVote(base: Snap, voterId: string, image: "A" | "B") {
    const pair = base.pairs[base.slot];
    if (!pair || base.revealed || voterId === pair.playerId) return;
    if (base.votes[pair.playerId]?.[voterId]) return;
    const slotVotes = { ...(base.votes[pair.playerId] ?? {}), [voterId]: { image } };
    const next: Snap = { ...base, votes: { ...base.votes, [pair.playerId]: slotVotes } };
    const voters = base.order.filter((player) => player.id !== pair.playerId);
    if (voters.length > 0 && voters.every((player) => slotVotes[player.id])) reveal(next);
    else publish(next);
  }

  useEffect(() => {
    return p2p.onMessage((from, data) => {
      const msg = data as NetMsg;
      if (!msg || typeof msg !== "object" || !("t" in msg)) return;
      if (msg.t === "snap") {
        if (host) return;
        snapRef.current = msg.snap;
        setSnap(msg.snap);
        return;
      }
      if (msg.t === "ink") {
        if (host && from !== msg.playerId) return;
        noteInk(msg.playerId, msg.png);
        return;
      }
      if (msg.t === "studio") {
        studioRef.current = { ...studioRef.current, [msg.promptIndex]: msg.png };
        setStudioInks(studioRef.current);
        return;
      }
      if (!host || !snapRef.current) return;
      if (msg.t === "vote") applyVote(snapRef.current, from, msg.image);
      if (msg.t === "kick") applyKick(snapRef.current, from, msg.target);
      if (msg.t === "chat") {
        const text = msg.text.trim().slice(0, 240);
        const current = snapRef.current;
        const pair = current.pairs[current.slot];
        if (!text || !current.commentsOn || current.phase !== "vote" || current.revealed || from === pair?.playerId) return;
        const who = current.order.find((player) => player.id === from);
        publish({
          ...current,
          chat: [...current.chat, { id: uid(), from: who?.name ?? "Player", text }],
        });
      }
    });
    // Handlers read refs. Re-subscribe only if the socket identity changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [p2p.onMessage, host]);

  useEffect(() => {
    if (!host || snapRef.current) return;
    publish(lobbySnap(p2p.selfId, "classic", "medium", true, 90, false));
    // Announce the lobby once so joiners can see the mode.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [host, p2p.selfId]);

  useEffect(() => {
    if (!host) return;
    for (const [id, png] of Object.entries(inksRef.current)) {
      p2p.send({ t: "ink", playerId: id, png });
    }
    for (const [index, png] of Object.entries(studioRef.current)) {
      p2p.send({ t: "studio", promptIndex: Number(index), png });
    }
    if (snapRef.current) p2p.send({ t: "snap", snap: snapRef.current });
  }, [host, p2p.peers, p2p.send]);

  useEffect(() => {
    if (!host) return;
    const current = snapRef.current;
    if (!current || current.phase !== "drawing" || current.mode === "imposter") return;
    const missing = roster.filter((player) => !current.order.some((entry) => entry.id === player.id));
    if (missing.length === 0) return;
    const shared = current.mode === "same" || current.mode === "studio" || current.mode === "team";
    const sharedIndex = Object.values(current.topics)[0] ?? 0;
    const dealt = shared
      ? []
      : current.mode === "countries"
        ? dealFrom(COUNTRIES.length, missing.length, "hon-countries")
        : dealPrompts(missing.length);
    const topics = { ...current.topics };
    missing.forEach((player, index) => {
      topics[player.id] = shared ? sharedIndex : (dealt[index] ?? 0);
    });
    publish({
      ...current,
      order: [...current.order, ...missing].slice(0, 6),
      topics,
    });
    // Fold players who connect after Start into this round, instead of locking them out.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [host, roster]);

  useEffect(() => {
    setPickImage(null);
    setPickKick(null);
  }, [snap?.slot, snap?.round]);

  useEffect(() => {
    if (snap?.phase !== "drawing") return;
    sent.current = false;
    const canvas = canvasRef.current;
    if (canvas) blankCanvas(canvas);
  }, [snap?.phase, snap?.round]);

  useEffect(() => {
    if (snap?.phase !== "drawing" || !snap.deadline) return;
    const tick = () => setTimeLeft(Math.max(0, Math.ceil((snap.deadline! - Date.now()) / 1000)));
    tick();
    const id = window.setInterval(tick, 200);
    return () => window.clearInterval(id);
  }, [snap?.phase, snap?.deadline]);

  useEffect(() => {
    if (snap?.phase !== "drawing" || !snap.deadline) return;
    const end = snap.deadline;
    const timers = [0, 1600].map((extra) =>
      window.setTimeout(() => {
        if (snapRef.current?.phase === "drawing") sendDrawing();
      }, Math.max(0, end - Date.now()) + extra),
    );
    return () => timers.forEach((id) => window.clearTimeout(id));
    // Send the canvas when time is up, then once more so the last strokes win.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snap?.phase, snap?.round, snap?.deadline]);

  useEffect(() => {
    if (!host || snap?.phase !== "drawing" || !snap.deadline) return;
    const wait = Math.max(0, snap.deadline - Date.now()) + 2800;
    const id = window.setTimeout(() => {
      const current = snapRef.current;
      if (!current || current.phase !== "drawing") return;
      for (const player of current.order) {
        if (inksRef.current[player.id] === undefined) inksRef.current[player.id] = "";
      }
      setInks({ ...inksRef.current });
      finishDrawing(current);
    }, wait);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [host, snap?.phase, snap?.round, snap?.deadline]);

  const pair = snap?.pairs[snap.slot] ?? null;
  const [bank, setBank] = useState<{ id: number; image: string } | null>(null);
  useEffect(() => {
    const id = pair?.archiveId;
    if (!id) {
      setBank(null);
      return;
    }
    let live = true;
    getDrawing({ data: { id } })
      .then((row) => {
        if (live) setBank({ id, image: row?.image ?? "" });
      })
      .catch(() => {
        if (live) setBank({ id, image: "" });
      });
    return () => {
      live = false;
    };
  }, [pair?.archiveId]);
  const procedural = useMemo(() => {
    if (!pair || !snap) return "";
    return sketchDataUrl(pair.promptIndex, pair.seed, snap.difficulty);
  }, [pair, snap]);
  const borderUrl = useMemo(() => {
    if (!pair || snap?.mode !== "countries") return "";
    return countryOutlineUrl(pair.promptIndex);
  }, [pair, snap?.mode]);
  const studioUrl = pair ? studioInks[pair.promptIndex] : "";
  const aiUrl =
    snap?.mode === "countries"
      ? borderUrl
      : snap?.mode === "studio" && studioUrl
        ? studioUrl
        : pair?.archiveId
          ? bank?.id === pair.archiveId
            ? bank.image || procedural
            : ""
          : procedural;
  const mine = snap?.order.some((player) => player.id === p2p.selfId) ?? false;
  const myPrompt = snap?.topics[p2p.selfId];

  function pointerPos(canvas: HTMLCanvasElement, e: React.PointerEvent<HTMLCanvasElement>) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) * canvas.width) / rect.width,
      y: ((e.clientY - rect.top) * canvas.height) / rect.height,
    };
  }

  function onDown(e: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = e.currentTarget;
    canvas.setPointerCapture(e.pointerId);
    drawing.current = true;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.strokeStyle = "#f4efe6";
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    const p = pointerPos(canvas, e);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
  }

  function onMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current) return;
    const canvas = e.currentTarget;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const p = pointerPos(canvas, e);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
  }

  function onUp(e: React.PointerEvent<HTMLCanvasElement>) {
    drawing.current = false;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
  }

  function sendDrawing() {
    const canvas = canvasRef.current;
    const current = snapRef.current;
    if (!canvas || current?.phase !== "drawing") return;
    if (!current.deadline && sent.current) return;
    const png = exportDrawing(canvas);
    if (!png) return;
    sent.current = true;
    noteInk(p2p.selfId, png);
    p2p.send({ t: "ink", playerId: p2p.selfId, png });
  }

  function startRound() {
    if (!host || roster.length < 1) return;
    if (mode === "studio" && !passOn) {
      setStudioNote("Unlock a Studio night first.");
      return;
    }
    const prev = snapRef.current;
    if (mode === "imposter") {
      if (roster.length < 2) return;
      const continuing = prev?.mode === "imposter" && prev.winner === "" && prev.round > 0;
      const aliases = continuing ? { ...prev.aliases } : dealAliases(roster);
      const eliminated = continuing ? prev.eliminated : [];
      const living = roster.filter((player) => !eliminated.includes(player.id));
      if (living.length < 2) {
        if (prev) publish({ ...prev, phase: "results", winner: "ai" });
        return;
      }
      const used = new Set(Object.values(aliases));
      for (const player of living) {
        if (aliases[player.id]) continue;
        const free = ALIASES.find((alias) => !used.has(alias)) ?? `Thing ${used.size}`;
        aliases[player.id] = free;
        used.add(free);
      }
      const prompt = dealPrompts(1)[0] ?? 0;
      const topics: Record<string, number> = {};
      for (const player of living) topics[player.id] = prompt;
      const seconds = timerSeconds;
      inksRef.current = {};
      setInks({});
      sent.current = false;
      finishing.current = false;
      publish({
        hostId: p2p.selfId,
        phase: "drawing",
        round: (prev?.round ?? 0) + 1,
        mode,
        difficulty,
        timerOn,
        timerSeconds: seconds,
        commentsOn: false,
        deadline: timerOn ? Date.now() + seconds * 1000 : null,
        order: living,
        topics,
        pairs: [],
        slot: 0,
        revealed: false,
        votes: {},
        scores: {},
        chat: [],
        aiName: prev?.aiName ?? "Alex",
        aliases,
        eliminated,
        kicks: {},
        kicked: "",
        winner: "",
      });
      return;
    }
    const shared = mode === "same" || mode === "studio" || mode === "team";
    const picked =
      mode === "countries" ? dealFrom(COUNTRIES.length, roster.length, "hon-countries") : dealPrompts(shared ? 1 : roster.length);
    const map: Record<string, number> = {};
    roster.forEach((player, index) => {
      map[player.id] = shared ? (picked[0] ?? 0) : (picked[index] ?? 0);
    });
    const seconds = mode === "blitz" ? 30 : timerSeconds;
    const useTimer = mode === "blitz" ? true : timerOn;
    inksRef.current = {};
    setInks({});
    sent.current = false;
    finishing.current = false;
    publish({
      hostId: p2p.selfId,
      phase: "drawing",
      round: (prev?.round ?? 0) + 1,
      mode,
      difficulty,
      timerOn: useTimer,
      timerSeconds: seconds,
      commentsOn,
      deadline: useTimer ? Date.now() + seconds * 1000 : null,
      order: roster,
      topics: map,
      pairs: [],
      slot: 0,
      revealed: false,
      votes: {},
      scores: prev?.scores ?? {},
      chat: [],
      aiName: prev?.aiName ?? "Alex",
      aliases: {},
      eliminated: [],
      kicks: {},
      kicked: "",
      winner: "",
    });
  }

  function copyLink() {
    const link = `${window.location.origin}${window.location.pathname}?room=${room}`;
    void navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    });
  }

  function sendChat() {
    const text = draft.trim().slice(0, 240);
    if (!text || !snap?.commentsOn || snap.phase !== "vote" || p2p.selfId === pair?.playerId) return;
    setDraft("");
    if (host) {
      publish({
        ...snap,
        chat: [...snap.chat, { id: uid(), from: name, text }],
      });
      return;
    }
    p2p.send({ t: "chat", text });
  }

  function castVote(image: "A" | "B") {
    if (!snap || !pair || snap.revealed || p2p.selfId === pair.playerId) return;
    if (host) applyVote(snap, p2p.selfId, image);
    else p2p.send({ t: "vote", image });
    setPickImage(image);
  }

  function castKick(target: string) {
    if (!snap || snap.mode !== "imposter" || snap.phase !== "vote" || snap.revealed) return;
    if (!snap.order.some((player) => player.id === p2p.selfId) || target === p2p.selfId) return;
    if (host) applyKick(snap, p2p.selfId, target);
    else p2p.send({ t: "kick", target });
    setPickKick(target);
  }

  const phase = snap?.phase ?? "lobby";
  const hostName = roster.find((player) => player.id === (snap?.hostId ?? (host ? p2p.selfId : "")))?.name;

  return (
    <main className="mx-auto flex h-dvh w-full max-w-5xl flex-col overflow-hidden px-4 pt-3 pb-20">
      <header className="mb-3 flex shrink-0 flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-display text-sm tracking-wide text-accent">Doodle duel</p>
          <h1 className="font-display text-4xl leading-none text-fg">Human or Not</h1>
        </div>
        <div className="text-right">
          <p className="ticket inline-block px-3 py-1 text-3xl tracking-[0.12em]">{room}</p>
          <button type="button" onClick={onLeave} className="text-sm text-muted underline">
            Leave
          </button>
        </div>
      </header>

      {phase === "lobby" && (
        <section className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 overflow-y-auto rounded-card border border-line bg-surface p-4">
            <h2 className="font-display text-2xl">{host ? "Lobby" : "You're in"}</h2>
            <div className="mt-2">
              <ScribSay {...scribLobby(host, scribSeed(room, name))} />
            </div>
            <p className="mt-1 text-sm text-muted">
              {host ? "Share the code so friends can join." : `Waiting for ${hostName || "the host"} to start.`}
            </p>
            {!p2p.joined && <p className="mt-2 text-sm text-accent">Connecting…</p>}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <p className="ticket rounded-xl px-3 py-2 text-xl tracking-[0.18em]">{room}</p>
              <button type="button" onClick={copyLink} className="rounded-xl bg-raised px-4 py-3 text-sm">
                {copied ? "Copied" : "Copy link"}
              </button>
            </div>
            <ul className="mt-3 flex flex-wrap gap-2">
              {roster.map((player, index) => (
                <li key={player.id} className="rounded-full border border-line bg-bg px-3 py-1 text-sm">
                  {index + 1}. {player.name}
                  {player.id === (snap?.hostId ?? (host ? p2p.selfId : "")) ? " · host" : ""}
                  {player.id === p2p.selfId ? " · you" : ""}
                </li>
              ))}
              {p2p.peers
                .filter((peer) => peer.connectionState !== "connected")
                .map((peer) => (
                  <li key={peer.id} className="rounded-full border border-line px-3 py-1 text-sm text-muted">
                    {peer.name || "Player"} · {peer.connectionState === "failed" ? "can't connect" : "joining"}
                  </li>
                ))}
            </ul>
            {host ? (
              <>
                <ModePicker mode={mode} onPick={chooseMode} />
                {mode === "imposter" && (
                  <p className="mt-2 text-sm text-muted">Names vanish at the start. Needs 2 players. Nobody talks.</p>
                )}
                {mode === "studio" && (
                  <div className="mt-2">
                    {!passOn && (
                      <button
                        type="button"
                        onClick={buyStudio}
                        className="rounded-full bg-accent px-3 py-1 text-sm font-medium text-accent-ink"
                      >
                        Unlock night
                      </button>
                    )}
                    {passOn && <p className="text-sm text-muted">Studio night is on.</p>}
                    {studioNote && <p className="mt-1 text-sm text-muted">{studioNote}</p>}
                  </div>
                )}
                <Settings
                  difficulty={difficulty}
                  setDifficulty={(value) => {
                    setDifficulty(value);
                    pushSetup({ mode, difficulty: value, timerOn, timerSeconds });
                  }}
                  timerOn={timerOn}
                  setTimerOn={(value) => {
                    const on = typeof value === "function" ? value(timerOn) : value;
                    setTimerOn(on);
                    pushSetup({ mode, difficulty, timerOn: on, timerSeconds });
                  }}
                  timerSeconds={timerSeconds}
                  setTimerSeconds={(seconds) => {
                    setTimerSeconds(seconds);
                    pushSetup({ mode, difficulty, timerOn, timerSeconds: seconds });
                  }}
                  lockTimer={mode === "blitz"}
                  commentsOn={commentsOn}
                  setCommentsOn={(value) => {
                    const on = typeof value === "function" ? value(commentsOn) : value;
                    setCommentsOn(on);
                    pushSetup({ mode, difficulty, timerOn, timerSeconds, commentsOn: on });
                  }}
                />
              </>
            ) : (
              <p className="mt-4 text-sm text-muted">
                <span className="font-medium text-fg">{MODES.find((item) => item.id === (snap?.mode ?? "classic"))?.label}</span>
                {" · "}
                {MODES.find((item) => item.id === (snap?.mode ?? "classic"))?.hint}
              </p>
            )}
          </div>
          {host && (
            <button
              type="button"
              onClick={startRound}
              className="mt-3 shrink-0 self-start rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-accent-ink"
            >
              Start round
            </button>
          )}
        </section>
      )}

      {phase === "drawing" && snap && (
        <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-card border border-line bg-surface p-4">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-xs tracking-[0.16em] text-muted uppercase">
                {MODES.find((item) => item.id === snap.mode)?.label} · Round {snap.round}
              </p>
              <h2 className="font-display mt-1 text-3xl">
                {mine
                  ? snap.mode === "imposter"
                    ? `You are ${snap.aliases[p2p.selfId] ?? "someone"}`
                    : snap.mode === "countries"
                      ? `Draw ${countryName(myPrompt ?? 0)}`
                      : (PROMPT_LIST[myPrompt ?? 0]?.text ?? "Draw")
                  : snap.mode === "imposter"
                    ? "You're out"
                    : "Wait for this round"}
              </h2>
              {mine && snap.mode === "imposter" ? (
                <p className="text-sm text-muted">{PROMPT_LIST[myPrompt ?? 0]?.text ?? "Draw"}</p>
              ) : null}
            </div>
            {snap.timerOn && snap.deadline && (
              <p className={"font-display text-4xl tabular-nums " + (timeLeft <= 10 ? "text-accent" : "text-fg")}>
                {formatTime(timeLeft)}
              </p>
            )}
          </div>
          {mine ? (
            <>
              <div className="mt-2">
                <ScribSay {...scribDraw(snap.mode === "countries", scribSeed(snap.round, name), snap.mode === "team")} />
              </div>
              <p className="mt-1 text-xs text-muted">
                {snap.mode === "imposter" ? "No names. No talking. " : ""}
                {sent.current
                  ? "Sent."
                  : snap.deadline
                    ? "It sends when time runs out."
                    : "Hit submit when you're done."}
              </p>
              <canvas
                ref={(node) => {
                  canvasRef.current = node;
                  if (node && node.dataset.ready !== String(snap.round)) {
                    blankCanvas(node);
                    node.dataset.ready = String(snap.round);
                  }
                }}
                width={512}
                height={512}
                onPointerDown={onDown}
                onPointerMove={onMove}
                onPointerUp={onUp}
                onPointerCancel={onUp}
                className="mt-3 aspect-square w-auto max-w-full min-h-0 flex-1 touch-none self-center rounded-xl border border-line bg-bg"
              />
              {!snap.deadline && (
                <button
                  type="button"
                  onClick={sendDrawing}
                  disabled={sent.current}
                  className="mt-3 shrink-0 self-start rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-accent-ink disabled:opacity-40"
                >
                  {sent.current ? "Sent" : "Submit drawing"}
                </button>
              )}
            </>
          ) : (
            <p className="mt-3 text-sm text-muted">
              {snap.mode === "imposter" ? "You're out. Stay quiet." : "You joined mid-round. You'll draw on the next one."}
            </p>
          )}
        </section>
      )}

      {phase === "vote" && snap?.mode === "imposter" && (
        <ImposterVote
          snap={snap}
          selfId={p2p.selfId}
          inks={inks}
          pick={pickKick}
          onPick={castKick}
          host={host}
          onNext={() => {
            if (snap.winner) publish({ ...snap, phase: "results" });
            else startRound();
          }}
        />
      )}

      {phase === "vote" && snap && pair && snap.mode !== "imposter" && (
        <section className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden">
          <VoteBoard snap={snap} pair={pair} selfId={p2p.selfId} />
          <div className="grid min-h-0 flex-1 grid-cols-2 gap-2">
            {(["A", "B"] as const).map((side) => {
              const humanUrl = inks[pair.playerId] || "";
              const shown = side === pair.humanSide ? humanUrl : aiUrl;
              const mine = p2p.selfId === pair.playerId;
              const picked = (snap.votes[pair.playerId]?.[p2p.selfId]?.image ?? pickImage) === side;
              const answer = answerSide(snap.mode, pair.humanSide) === side;
              const stamp = snap.revealed
                ? answer
                  ? snap.mode === "countries"
                    ? "Border"
                    : snap.mode === "team"
                      ? "Fake"
                      : "Human"
                  : snap.mode === "countries"
                    ? "Sketch"
                    : snap.mode === "team"
                      ? "Human"
                      : "Not"
                : picked
                  ? "Your pick"
                  : mine
                    ? ""
                    : "Tap";
              return (
                <button
                  key={side}
                  type="button"
                  disabled={snap.revealed || mine}
                  onClick={() => castVote(side)}
                  className={
                    "flex min-h-0 flex-col overflow-hidden rounded-card border-4 bg-bg text-left " +
                    (snap.revealed
                      ? answer
                        ? "border-accent"
                        : "border-line opacity-80"
                      : picked
                        ? "border-accent"
                        : "border-line")
                  }
                >
                  <span className="flex shrink-0 items-center justify-between px-3 py-1">
                    <span className="font-display text-3xl leading-none">{side}</span>
                    <span
                      className={
                        "font-display text-sm tracking-wide uppercase " +
                        (snap.revealed && answer ? "text-accent" : "text-muted")
                      }
                    >
                      {stamp}
                    </span>
                  </span>
                  {shown ? (
                    <img src={shown} alt={`Drawing ${side}`} className="min-h-0 flex-1 object-contain" />
                  ) : (
                    <span className="min-h-0 flex-1 bg-bg" />
                  )}
                </button>
              );
            })}
          </div>

          {!snap.revealed && snap.commentsOn && (
            <div className="shrink-0 rounded-card border border-line bg-surface">
              <div className="space-y-1 overflow-hidden px-3 py-2 text-sm">
                {snap.chat.slice(-2).map((line) =>
                  line.system ? (
                    <p key={line.id} className="text-muted italic">
                      {line.text}
                    </p>
                  ) : (
                    <p key={line.id}>{line.text}</p>
                  ),
                )}
              </div>
              {p2p.selfId === pair.playerId ? (
                <p className="border-t border-line px-4 py-3 text-sm text-muted">You drew this. Stay quiet.</p>
              ) : (
                <form
                  className="flex gap-2 border-t border-line p-3"
                  onSubmit={(e) => {
                    e.preventDefault();
                    sendChat();
                  }}
                >
                  <input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder="Say something"
                    className="min-w-0 flex-1 rounded-xl border border-line bg-bg px-3 py-3 outline-none focus:border-accent"
                  />
                  <button type="submit" className="rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-accent-ink">
                    Send
                  </button>
                </form>
              )}
            </div>
          )}

          {!snap.revealed && (
            <div className="flex shrink-0 items-center justify-between gap-3">
              <ScribSay
                {...scribVote(
                  p2p.selfId === pair.playerId,
                  Boolean(snap.votes[pair.playerId]?.[p2p.selfId] ?? pickImage),
                  scribSeed(snap.round, snap.slot, name),
                  snap.mode === "team",
                )}
              />
              {host && (
                <button type="button" onClick={() => reveal(snap)} className="shrink-0 text-sm text-muted underline">
                  Reveal
                </button>
              )}
              <span className="shrink-0 text-xs text-muted">
                {Object.keys(snap.votes[pair.playerId] ?? {}).length}/{Math.max(0, snap.order.length - 1)}
              </span>
            </div>
          )}

          {snap.revealed && (
            <div className="shrink-0">
              <ScribSay
                {...scribReveal(
                  p2p.selfId === pair.playerId,
                  Boolean(snap.votes[pair.playerId]?.[p2p.selfId]),
                  snap.votes[pair.playerId]?.[p2p.selfId]?.image === answerSide(snap.mode, pair.humanSide),
                  name,
                  scribSeed(snap.round, snap.slot, name, "reveal"),
                  snap.mode === "team",
                )}
              />
              <h2 className="font-display mt-2 text-2xl leading-none">
                {snap.mode === "countries"
                  ? `${answerSide(snap.mode, pair.humanSide)} is the real border`
                  : snap.mode === "team"
                    ? teamWon(snap, pair)
                      ? `Caught it. The fake was ${answerSide(snap.mode, pair.humanSide)}`
                      : `Fooled. The fake was ${answerSide(snap.mode, pair.humanSide)}`
                    : `${pair.humanSide} is ${pair.playerName}`}
              </h2>
              <ul className="mt-2 flex flex-wrap gap-2">
                {snap.order
                  .filter((player) => player.id !== pair.playerId)
                  .map((player) => {
                    const choice = snap.votes[pair.playerId]?.[player.id]?.image;
                    const hit = choice === answerSide(snap.mode, pair.humanSide);
                    return (
                      <li
                        key={player.id}
                        className={
                          "rounded-full px-3 py-1 text-sm " + (hit ? "bg-accent text-accent-ink" : "bg-bg text-muted")
                        }
                      >
                        {player.name} {hit ? (snap.mode === "team" ? "caught it" : "+2") : choice ? "miss" : "no vote"}
                      </li>
                    );
                  })}
              </ul>
              {host ? (
                <button
                  type="button"
                  onClick={() => {
                    if (snap.slot + 1 >= snap.pairs.length) publish({ ...snap, phase: "results" });
                    else {
                      const slot = snap.slot + 1;
                      const nextPair = snap.pairs[slot];
                      publish({
                        ...snap,
                        slot,
                        revealed: false,
                        aiName: AI_NAMES[Math.floor(Math.random() * AI_NAMES.length)]!,
                        chat: snap.commentsOn
                          ? [
                              {
                                id: uid(),
                                from: "",
                                system: true,
                                text:
                                  snap.mode === "countries"
                                    ? `${nextPair?.playerName ?? "They"} stays quiet. Which outline is the real border?`
                                    : snap.mode === "team"
                                      ? `${nextPair?.playerName ?? "They"} stays quiet. Catch the fake together.`
                                      : `${nextPair?.playerName ?? "They"} stays quiet. Which drawing is theirs?`,
                              },
                            ]
                          : [],
                      });
                      if (snap.commentsOn && snap.mode !== "countries") nudgeAi(slot);
                    }
                  }}
                  className="mt-3 shrink-0 rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-accent-ink"
                >
                  {snap.slot + 1 >= snap.pairs.length ? "Scores" : "Next duel"}
                </button>
              ) : (
                <p className="mt-2 text-sm text-muted">Waiting for the host.</p>
              )}
            </div>
          )}
        </section>
      )}

      {phase === "results" && snap && (
        <section className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden">
          <div className="min-h-0 flex-1 overflow-y-auto rounded-card border border-line bg-surface p-4">
          <p className="text-xs tracking-[0.16em] text-muted uppercase">
            {MODES.find((item) => item.id === snap.mode)?.label} · Round {snap.round}
          </p>
          <h2 className="font-display mt-1 text-4xl leading-none">
            {snap.mode === "imposter" ? (snap.winner === "humans" ? "Humans win" : "The fake wins") : snap.mode === "team" ? "Humans vs the fake" : "Scores"}
          </h2>
          {snap.mode === "imposter" ? (
            <ImposterEnd snap={snap} />
          ) : snap.mode === "team" ? (
            <TeamBoard snap={snap} />
          ) : (
            <Scoreboard snap={snap} selfId={p2p.selfId} />
          )}
          {snap.mode !== "imposter" && (
          <ul className="mt-3 space-y-1 text-xs text-muted">
            {snap.pairs.map((item) => (
              <li key={item.playerId}>
                {snap.mode === "countries"
                  ? `${item.playerName}: ${answerSide(snap.mode, item.humanSide)} was the border`
                  : snap.mode === "team"
                    ? `${item.playerName}: the fake was ${answerSide(snap.mode, item.humanSide)}`
                    : `${item.playerName} was ${item.humanSide}`}
              </li>
            ))}
          </ul>
          )}
          {host && (
            <>
              <ModePicker mode={mode} onPick={chooseMode} />
              {mode === "studio" && !passOn && (
                <button
                  type="button"
                  onClick={buyStudio}
                  className="mt-2 rounded-full bg-accent px-3 py-1 text-sm font-medium text-accent-ink"
                >
                  Unlock night
                </button>
              )}
              <Settings
                difficulty={difficulty}
                setDifficulty={(value) => {
                  setDifficulty(value);
                  pushSetup({ mode, difficulty: value, timerOn, timerSeconds });
                }}
                timerOn={timerOn}
                setTimerOn={(value) => {
                  const on = typeof value === "function" ? value(timerOn) : value;
                  setTimerOn(on);
                  pushSetup({ mode, difficulty, timerOn: on, timerSeconds });
                }}
                timerSeconds={timerSeconds}
                setTimerSeconds={(seconds) => {
                  setTimerSeconds(seconds);
                  pushSetup({ mode, difficulty, timerOn, timerSeconds: seconds });
                }}
                lockTimer={mode === "blitz"}
                commentsOn={commentsOn}
                setCommentsOn={(value) => {
                  const on = typeof value === "function" ? value(commentsOn) : value;
                  setCommentsOn(on);
                  pushSetup({ mode, difficulty, timerOn, timerSeconds, commentsOn: on });
                }}
              />
            </>
          )}
          </div>
          {host && (
            <button
              type="button"
              onClick={startRound}
              className="shrink-0 self-start rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-accent-ink"
            >
              Next round
            </button>
          )}
        </section>
      )}
    </main>
  );
}

function teamWon(snap: Snap, pair: PairMeta) {
  let caught = 0;
  let missed = 0;
  for (const vote of Object.values(snap.votes[pair.playerId] ?? {})) {
    if (vote.image === answerSide(snap.mode, pair.humanSide)) caught += 1;
    else missed += 1;
  }
  return caught > missed;
}

function ImposterVote({
  snap,
  selfId,
  inks,
  pick,
  onPick,
  host,
  onNext,
}: {
  snap: Snap;
  selfId: string;
  inks: Record<string, string>;
  pick: string | null;
  onPick: (id: string) => void;
  host: boolean;
  onNext: () => void;
}) {
  const seats = [...snap.order.map((player) => player.id), FAKE].sort(
    (a, b) => (scribSeed(a, snap.round) % 997) - (scribSeed(b, snap.round) % 997),
  );
  const votesIn = Object.keys(snap.kicks).length;
  const tally = new Map<string, number>();
  if (snap.revealed) {
    for (const target of Object.values(snap.kicks)) tally.set(target, (tally.get(target) ?? 0) + 1);
  }
  const kickedName = snap.kicked === FAKE ? snap.aliases[FAKE] : snap.order.find((player) => player.id === snap.kicked)?.name;
  const prompt = PROMPT_LIST[Object.values(snap.topics)[0] ?? 0]?.text ?? "";
  return (
    <section className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden">
      <div className="shrink-0">
        <p className="text-xs tracking-[0.16em] text-muted uppercase">Imposter · Round {snap.round}</p>
        <h2 className="font-display text-3xl leading-none">{snap.revealed ? "Voted out" : "Vote someone out"}</h2>
        <p className="mt-1 text-sm text-muted">{prompt}</p>
      </div>
      <div className="grid min-h-0 flex-1 grid-cols-3 gap-2 overflow-y-auto">
        {seats.map((id) => {
          const alias = snap.aliases[id] ?? "???";
          const mine = id === selfId;
          const chosen = (snap.kicks[selfId] ?? pick) === id;
          const dumped = snap.revealed && snap.kicked === id;
          return (
            <button
              key={id}
              type="button"
              disabled={snap.revealed || mine || !snap.order.some((player) => player.id === selfId)}
              onClick={() => onPick(id)}
              className={
                "flex min-h-0 flex-col overflow-hidden rounded-card border-4 bg-bg text-left " +
                (dumped ? "border-accent" : chosen ? "border-accent" : "border-line")
              }
            >
              <span className="flex shrink-0 items-center justify-between px-2 py-1">
                <span className="truncate font-display text-lg leading-none">{alias}</span>
                <span className="text-xs text-muted">
                  {mine ? "you" : snap.revealed ? (tally.get(id) ?? 0) : chosen ? "vote" : ""}
                </span>
              </span>
              {inks[id] ? <img src={inks[id]} alt="" className="min-h-0 flex-1 object-contain" /> : <span className="min-h-0 flex-1" />}
            </button>
          );
        })}
      </div>
      {snap.revealed ? (
        <div className="shrink-0">
          <p className="font-display text-2xl leading-none">
            {snap.kicked === FAKE
              ? `${snap.aliases[FAKE]} was the fake.`
              : `${snap.aliases[snap.kicked] ?? "They"} was ${kickedName}.`}
          </p>
          <p className="mt-1 text-sm text-muted">
            {snap.winner === "humans" ? "Humans win." : snap.winner === "ai" ? "One human left. The fake wins." : "Still in it."}
          </p>
          {host ? (
            <button type="button" onClick={onNext} className="mt-2 rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-accent-ink">
              {snap.winner ? "See the names" : "Next round"}
            </button>
          ) : (
            <p className="mt-2 text-sm text-muted">Waiting for the host.</p>
          )}
        </div>
      ) : (
        <p className="shrink-0 text-sm text-muted">
          {votesIn}/{snap.order.length} votes. You can't vote for yourself.
        </p>
      )}
    </section>
  );
}

function ImposterEnd({ snap }: { snap: Snap }) {
  return (
    <ul className="mt-3 space-y-1 text-sm">
      {snap.order.map((player) => (
        <li key={player.id}>
          {snap.aliases[player.id]} was {player.name}
          {snap.eliminated.includes(player.id) ? " · out" : ""}
        </li>
      ))}
      <li>{snap.aliases[FAKE]} was the fake</li>
    </ul>
  );
}

function VoteBoard({ snap, pair, selfId }: { snap: Snap; pair: PairMeta; selfId: string }) {
  const ranked = [...snap.order].sort(
    (a, b) => (snap.scores[b.id] ?? 0) - (snap.scores[a.id] ?? 0) || a.name.localeCompare(b.name),
  );
  const prompt = snap.mode === "countries" ? countryName(pair.promptIndex) : PROMPT_LIST[pair.promptIndex]?.text;
  return (
    <div className="shrink-0">
      <p className="text-xs tracking-[0.16em] text-muted uppercase">
        Round {snap.round}
        {snap.mode === "blitz" ? " · one vote" : ` · ${snap.slot + 1} of ${snap.pairs.length}`}
      </p>
      <h2 className="font-display text-3xl leading-none">
        {snap.mode === "countries"
          ? "Tap the real border"
          : snap.mode === "team"
            ? "Catch the fake together"
            : `Tap ${pair.playerName}'s drawing`}
      </h2>
      <p className="mt-1 text-sm text-muted">{prompt}</p>
      {snap.mode === "team" ? (
        <p className="mt-2 text-sm">
          Humans {snap.scores[TEAM_KEY] ?? 0}
          <span className="text-muted"> · </span>
          The fake {snap.scores[SCRIB_KEY] ?? 0}
        </p>
      ) : (
        <ol className="mt-2 flex gap-2 overflow-hidden">
          {ranked.map((player, index) => (
            <li
              key={player.id}
              className={
                "shrink-0 rounded-full px-2 py-0.5 text-xs " +
                (player.id === selfId ? "bg-accent text-accent-ink" : "bg-raised text-fg")
              }
            >
              {index + 1}. {player.name} {snap.scores[player.id] ?? 0}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

function TeamBoard({ snap }: { snap: Snap }) {
  const humans = snap.scores[TEAM_KEY] ?? 0;
  const scrib = snap.scores[SCRIB_KEY] ?? 0;
  const ahead = humans === scrib ? "tied" : humans > scrib ? "humans" : "scrib";
  const lines =
    ahead === "humans"
      ? ["The pack is ahead. Rude.", "You're winning as a group. I hate groups.", "Humans in front. I'll fix that."]
      : ahead === "scrib"
        ? ["I'm beating every one of you.", "The fake is ahead. Bow a little.", "Teamwork, and you still trail."]
        : ["Still even. I like my odds.", "Tied. Nobody gets to gloat.", "Even score. I'm patient."];
  const talk = {
    mood: ahead === "humans" ? ("glare" as const) : ahead === "scrib" ? ("laugh" as const) : ("smug" as const),
    line: lines[scribSeed(snap.round, ahead) % lines.length]!,
  };
  return (
    <>
      <div className="mt-2">
        <ScribSay {...talk} />
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className={"rounded-2xl px-3 py-3 " + (ahead === "humans" ? "bg-accent text-accent-ink" : "bg-bg")}>
          <p className="text-sm">Humans</p>
          <p className="font-display text-5xl leading-none">{humans}</p>
        </div>
        <div className={"rounded-2xl px-3 py-3 " + (ahead === "scrib" ? "bg-accent text-accent-ink" : "bg-bg")}>
          <p className="text-sm">The fake</p>
          <p className="font-display text-5xl leading-none">{scrib}</p>
        </div>
      </div>
    </>
  );
}

function Scoreboard({ snap, selfId }: { snap: Snap; selfId: string }) {
  const ranked = [...snap.order].sort(
    (a, b) => (snap.scores[b.id] ?? 0) - (snap.scores[a.id] ?? 0) || a.name.localeCompare(b.name),
  );
  const best = Math.max(0, ...ranked.map((player) => snap.scores[player.id] ?? 0));
  const me = ranked.find((player) => player.id === selfId);
  const myScore = me ? (snap.scores[me.id] ?? 0) : 0;
  const place = ranked.filter((player) => (snap.scores[player.id] ?? 0) > myScore).length + 1;
  const tied = ranked.filter((player) => (snap.scores[player.id] ?? 0) === best).length > 1;
  const last =
    ranked.some((player) => (snap.scores[player.id] ?? 0) > myScore) &&
    !ranked.some((player) => (snap.scores[player.id] ?? 0) < myScore);
  const talk = scribRank(me?.name ?? "You", place, best, last, tied, scribSeed(snap.round, me?.name ?? ""));
  let spot = 0;
  let previous = -1;
  return (
    <>
      <div className="mt-2">
        <ScribSay {...talk} />
      </div>
      <ol className="mt-3 space-y-2">
        {ranked.map((player, index) => {
          const score = snap.scores[player.id] ?? 0;
          if (score !== previous) {
            spot = index + 1;
            previous = score;
          }
          const first = spot === 1 && score > 0;
          const width = best > 0 ? (score / best) * 100 : 6;
          return (
            <li
              key={player.id}
              className={"rounded-2xl px-3 py-2 " + (first ? "bg-accent text-accent-ink" : "bg-bg")}
            >
              <div className="flex items-center gap-3">
                <span className="font-display w-6 text-2xl leading-none">{spot}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">
                    {player.name}
                    {player.id === selfId ? " · you" : ""}
                  </p>
                  <div className={"mt-1 h-2 overflow-hidden rounded-full " + (first ? "bg-accent-ink/20" : "bg-raised")}>
                    <div
                      className={"h-full rounded-full " + (first ? "bg-accent-ink" : "bg-accent")}
                      style={{ width: `${Math.max(score === 0 ? 6 : 12, width)}%` }}
                    />
                  </div>
                </div>
                <span className="font-display text-3xl leading-none tabular-nums">{score}</span>
              </div>
            </li>
          );
        })}
      </ol>
    </>
  );
}

function ModePicker({ mode, onPick }: { mode: Mode; onPick: (mode: Mode) => void }) {
  return (
    <>
      <p className="mt-3 text-sm text-muted">Mode</p>
      <div className="mt-1 grid grid-cols-2 gap-2">
        {MODES.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onPick(item.id)}
            className={
              "rounded-xl px-2 py-1.5 text-left " + (mode === item.id ? "bg-accent text-accent-ink" : "bg-raised text-fg")
            }
          >
            <span className="block text-sm font-medium leading-tight">{item.label}</span>
            <span className={"block text-[11px] leading-tight " + (mode === item.id ? "text-accent-ink/80" : "text-muted")}>
              {item.hint}
            </span>
          </button>
        ))}
      </div>
    </>
  );
}

function Settings({
  difficulty,
  setDifficulty,
  timerOn,
  setTimerOn,
  timerSeconds,
  setTimerSeconds,
  lockTimer,
  commentsOn,
  setCommentsOn,
}: {
  difficulty: Difficulty;
  setDifficulty: (value: Difficulty) => void;
  timerOn: boolean;
  setTimerOn: (value: boolean | ((on: boolean) => boolean)) => void;
  timerSeconds: number;
  setTimerSeconds: (value: number) => void;
  lockTimer?: boolean;
  commentsOn: boolean;
  setCommentsOn: (value: boolean | ((on: boolean) => boolean)) => void;
}) {
  return (
    <>
      <p className="mt-3 text-sm text-muted">Difficulty</p>
      <div className="mt-1 grid grid-cols-4 gap-2">
        {DIFFICULTIES.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setDifficulty(item.id)}
            className={
              "rounded-xl px-2 py-1.5 text-left " +
              (difficulty === item.id ? "bg-accent text-accent-ink" : "bg-raised text-fg")
            }
          >
            <span className="block text-sm font-medium leading-tight">{item.label}</span>
            <span className={"block text-[11px] leading-tight " + (difficulty === item.id ? "text-accent-ink/80" : "text-muted")}>
              {item.hint}
            </span>
          </button>
        ))}
      </div>
      {lockTimer ? (
        <p className="mt-3 text-sm text-muted">Blitz is always 30 seconds, then one vote.</p>
      ) : (
        <>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <p className="text-sm text-muted">Timer</p>
            <button
              type="button"
              onClick={() => setTimerOn((on) => !on)}
              className={
                "rounded-full px-3 py-1 text-sm font-medium " +
                (timerOn ? "bg-accent text-accent-ink" : "bg-raised text-fg")
              }
            >
              {timerOn ? "On" : "Off"}
            </button>
            {timerOn &&
              TIMER_CHOICES.map((seconds) => (
                <button
                  key={seconds}
                  type="button"
                  onClick={() => setTimerSeconds(seconds)}
                  className={
                    "rounded-full px-2.5 py-1 text-sm " +
                    (timerSeconds === seconds ? "bg-accent text-accent-ink" : "bg-raised text-fg")
                  }
                >
                  {formatTime(seconds)}
                </button>
              ))}
          </div>
        </>
      )}
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <p className="text-sm text-muted">Comments</p>
        <button
          type="button"
          onClick={() => setCommentsOn((on) => !on)}
          className={
            "rounded-full px-3 py-1 text-sm font-medium " +
            (commentsOn ? "bg-accent text-accent-ink" : "bg-raised text-fg")
          }
        >
          {commentsOn ? "On" : "Off"}
        </button>
      </div>
    </>
  );
}
