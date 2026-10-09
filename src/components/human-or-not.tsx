import { useEffect, useRef, useState } from "react";
import { PROMPT_LIST, sketchDataUrl } from "@/game/sketches";

type Phase = "lobby" | "drawing" | "discuss" | "vote" | "reveal";

type Mate = { id: string; name: string };

type ChatLine = { id: string; from: string; text: string; system?: boolean };

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

function uid() {
  return Math.random().toString(36).slice(2, 8);
}

export function HumanOrNot() {
  const [phase, setPhase] = useState<Phase>("lobby");
  const [you, setYou] = useState("");
  const [mates, setMates] = useState<Mate[]>([]);
  const [mateDraft, setMateDraft] = useState("");
  const [aiName, setAiName] = useState("Alex");
  const [promptIndex, setPromptIndex] = useState(0);
  const [artistId, setArtistId] = useState<string | null>(null);
  const [humanSide, setHumanSide] = useState<"A" | "B">("A");
  const [imgA, setImgA] = useState("");
  const [imgB, setImgB] = useState("");
  const [chat, setChat] = useState<ChatLine[]>([]);
  const [draft, setDraft] = useState("");
  const [pickImage, setPickImage] = useState<"A" | "B" | null>(null);
  const [pickPerson, setPickPerson] = useState<string | null>(null);
  const [votes, setVotes] = useState<Record<string, { image: "A" | "B"; person: string }>>({});
  const [voter, setVoter] = useState<string | null>(null);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [round, setRound] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawing = useRef(false);
  const chatEnd = useRef<HTMLDivElement | null>(null);

  const humans: Mate[] = you.trim()
    ? [{ id: "you", name: you.trim() }, ...mates]
    : mates;
  const artist = humans.find((h) => h.id === artistId) ?? null;
  const youAreArtist = artistId === "you";
  const prompt = PROMPT_LIST[promptIndex]?.text ?? "";

  useEffect(() => {
    chatEnd.current?.scrollIntoView({ block: "end" });
  }, [chat]);

  useEffect(() => {
    if (phase !== "drawing") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#111114";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#f4efe6";
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, [phase, artistId]);

  function addMate() {
    const name = mateDraft.trim().slice(0, 16);
    if (!name || humans.length >= 6) return;
    setMates((m) => [...m, { id: uid(), name }]);
    setMateDraft("");
  }

  function startRound() {
    if (!you.trim() || humans.length < 1) return;
    const next = (round + 1) % 999;
    setRound(next);
    const pi = Math.floor(Math.random() * PROMPT_LIST.length);
    setPromptIndex(pi);
    const pool = you.trim() ? [{ id: "you", name: you.trim() }, ...mates] : mates;
    const picked = pool[Math.floor(Math.random() * pool.length)]!;
    setArtistId(picked.id);
    setAiName(AI_NAMES[Math.floor(Math.random() * AI_NAMES.length)]!);
    setPhase("drawing");
    setChat([]);
    setVotes({});
    setPickImage(null);
    setPickPerson(null);
    setVoter(null);
    setImgA("");
    setImgB("");
  }

  function pointerPos(e: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }

  function onDown(e: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.setPointerCapture(e.pointerId);
    drawing.current = true;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const p = pointerPos(e);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
  }

  function onMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx) return;
    const p = pointerPos(e);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
  }

  function onUp() {
    drawing.current = false;
  }

  function clearCanvas() {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.fillStyle = "#111114";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  function submitDrawing() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const human = canvas.toDataURL("image/png");
    const ai = sketchDataUrl(promptIndex, Math.floor(Math.random() * 1e9) + 1);
    const side = Math.random() < 0.5 ? "A" : "B";
    setHumanSide(side);
    if (side === "A") {
      setImgA(human);
      setImgB(ai);
    } else {
      setImgA(ai);
      setImgB(human);
    }
    setPhase("discuss");
    setChat([
      {
        id: uid(),
        from: "",
        text: "Both drawings are up. The artist stays quiet. Figure out which scribble is human.",
        system: true,
      },
    ]);
    window.setTimeout(() => {
      setChat((c) => [
        ...c,
        { id: uid(), from: aiName, text: AI_LINES[Math.floor(Math.random() * AI_LINES.length)]! },
      ]);
    }, 1600);
  }

  function sendChat() {
    const text = draft.trim().slice(0, 240);
    if (!text || youAreArtist) return;
    setDraft("");
    setChat((c) => [...c, { id: uid(), from: you.trim() || "You", text }]);
    if (Math.random() < 0.55) {
      window.setTimeout(() => {
        setChat((c) => [
          ...c,
          { id: uid(), from: aiName, text: AI_LINES[Math.floor(Math.random() * AI_LINES.length)]! },
        ]);
      }, 900 + Math.random() * 1200);
    }
  }

  const voters = humans.filter((h) => h.id !== artistId);

  function castVote() {
    if (!voter || !pickImage || !pickPerson) return;
    if (voter === artistId) return;
    const next = { ...votes, [voter]: { image: pickImage, person: pickPerson } };
    setVotes(next);
    setPickImage(null);
    setPickPerson(null);
    setVoter(null);
    if (Object.keys(next).length >= voters.length && voters.length > 0) {
      finish(next);
    }
  }

  function finish(finalVotes: Record<string, { image: "A" | "B"; person: string }>) {
    const gained: Record<string, number> = {};
    for (const [id, vote] of Object.entries(finalVotes)) {
      let pts = 0;
      if (vote.image === humanSide) pts += 2;
      if (vote.person === "ai") pts += 2;
      gained[id] = pts;
    }
    setScores((prev) => {
      const copy = { ...prev };
      for (const [id, pts] of Object.entries(gained)) {
        copy[id] = (copy[id] ?? 0) + pts;
      }
      return copy;
    });
    setPhase("reveal");
  }

  const peopleForVote = [
    ...humans.map((h) => ({ id: h.id, name: h.name })),
    { id: "ai", name: aiName },
  ];

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 py-6 sm:px-6">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-medium tracking-[0.18em] text-muted uppercase">Party drawing game</p>
          <h1 className="font-display text-4xl leading-none text-fg sm:text-5xl">Human or Not</h1>
        </div>
        <p className="max-w-xs text-sm leading-snug text-muted">
          One person draws. An AI scribbles the same prompt, badly. Everyone else decides.
        </p>
      </header>

      {phase === "lobby" && (
        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-card border border-line bg-surface p-5">
            <h2 className="font-display text-2xl">Who is playing</h2>
            <p className="mt-1 text-sm text-muted">
              Add the people on this screen. Pass the device when it is their turn to draw or vote.
            </p>
            <label className="mt-5 block text-sm text-muted" htmlFor="you">
              Your name
            </label>
            <input
              id="you"
              value={you}
              maxLength={16}
              onChange={(e) => setYou(e.target.value)}
              className="mt-1 w-full rounded-xl border border-line bg-bg px-3 py-3 text-fg outline-none focus:border-accent"
              placeholder="Name"
            />
            <label className="mt-4 block text-sm text-muted" htmlFor="mate">
              Add a friend
            </label>
            <div className="mt-1 flex gap-2">
              <input
                id="mate"
                value={mateDraft}
                maxLength={16}
                onChange={(e) => setMateDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") addMate();
                }}
                className="min-w-0 flex-1 rounded-xl border border-line bg-bg px-3 py-3 text-fg outline-none focus:border-accent"
                placeholder="Friend's name"
              />
              <button
                type="button"
                onClick={addMate}
                className="rounded-xl bg-raised px-4 py-3 text-sm font-medium text-fg"
              >
                Add
              </button>
            </div>
            <ul className="mt-4 flex flex-wrap gap-2">
              {humans.map((h) => (
                <li key={h.id} className="rounded-full border border-line bg-bg px-3 py-1 text-sm">
                  {h.name}
                  {h.id === "you" ? " · you" : ""}
                </li>
              ))}
              <li className="rounded-full border border-line bg-bg px-3 py-1 text-sm text-muted">
                plus a quiet extra player
              </li>
            </ul>
            <button
              type="button"
              disabled={!you.trim()}
              onClick={startRound}
              className="mt-6 rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-accent-ink disabled:opacity-40"
            >
              Start round
            </button>
          </div>
          <aside className="rounded-card border border-line bg-surface p-5 text-sm leading-relaxed text-muted">
            <p className="font-display text-xl text-fg">How a round goes</p>
            <ol className="mt-3 list-decimal space-y-2 pl-4">
              <li>One human gets the prompt and draws with the mouse or finger.</li>
              <li>The AI draws the same thing, rushed and unfinished.</li>
              <li>The artist cannot talk or vote.</li>
              <li>Everyone else picks the human drawing and who the AI is.</li>
            </ol>
          </aside>
        </section>
      )}

      {phase === "drawing" && (
        <section className="rounded-card border border-line bg-surface p-5">
          <p className="text-xs tracking-[0.16em] text-muted uppercase">Round {round}</p>
          <h2 className="font-display mt-1 text-3xl">{prompt}</h2>
          <p className="mt-2 text-sm text-muted">
            {artist?.name} is drawing. Pass them this screen. They stay quiet after submit.
          </p>
          <canvas
            ref={canvasRef}
            width={512}
            height={512}
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerCancel={onUp}
            className="mt-4 w-full max-w-lg touch-none rounded-xl border border-line bg-bg"
          />
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" onClick={clearCanvas} className="rounded-xl bg-raised px-4 py-3 text-sm">
              Clear
            </button>
            <button
              type="button"
              onClick={submitDrawing}
              className="rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-accent-ink"
            >
              Submit drawing
            </button>
          </div>
        </section>
      )}

      {(phase === "discuss" || phase === "vote" || phase === "reveal") && (
        <section className="flex flex-col gap-4">
          <div className="grid gap-3 sm:grid-cols-2">
            {(["A", "B"] as const).map((side) => (
              <figure key={side} className="overflow-hidden rounded-card border border-line bg-bg">
                <figcaption className="px-3 py-2 text-xs tracking-[0.14em] text-muted uppercase">
                  Image {side}
                </figcaption>
                <img
                  src={side === "A" ? imgA : imgB}
                  alt={`Drawing ${side}`}
                  className="aspect-square w-full object-contain"
                />
              </figure>
            ))}
          </div>
          <p className="text-sm text-muted">Prompt: {prompt}</p>

          {phase !== "reveal" && (
            <div className="rounded-card border border-line bg-surface">
              <div className="max-h-56 space-y-2 overflow-y-auto px-4 py-3 text-sm">
                {chat.map((line) =>
                  line.system ? (
                    <p key={line.id} className="text-muted italic">
                      {line.text}
                    </p>
                  ) : (
                    <p key={line.id}>
                      <span className="font-medium text-accent">{line.from}</span> {line.text}
                    </p>
                  ),
                )}
                <div ref={chatEnd} />
              </div>
              {youAreArtist ? (
                <p className="border-t border-line px-4 py-3 text-sm text-muted">
                  The artist cannot chat this round.
                </p>
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

          {phase === "discuss" && (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setPhase("vote")}
                className="rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-accent-ink"
              >
                Open voting
              </button>
              <button
                type="button"
                onClick={() => finish(votes)}
                className="rounded-xl bg-raised px-4 py-3 text-sm"
              >
                Reveal now
              </button>
            </div>
          )}

          {phase === "vote" && (
            <div className="rounded-card border border-line bg-surface p-4">
              <p className="mb-3 text-sm text-muted">
                {artist?.name} drew this round and cannot vote.
              </p>
              {voters.length === 0 ? (
                <p className="text-sm text-muted">
                  Only the artist is here, so nobody can vote. Reveal when you are ready.
                </p>
              ) : (
                <>
                  <p className="text-sm text-muted">Who is voting?</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {voters.map((v) => (
                      <button
                        key={v.id}
                        type="button"
                        disabled={Boolean(votes[v.id])}
                        onClick={() => setVoter(v.id)}
                        className={
                          "rounded-full px-3 py-2 text-sm " +
                          (voter === v.id ? "bg-accent text-accent-ink" : "bg-raised text-fg")
                        }
                      >
                        {v.name}
                        {votes[v.id] ? " · voted" : ""}
                      </button>
                    ))}
                  </div>
                  <p className="mt-4 text-sm text-muted">Which image is the human drawing?</p>
                  <div className="mt-2 flex gap-2">
                    {(["A", "B"] as const).map((side) => (
                      <button
                        key={side}
                        type="button"
                        onClick={() => setPickImage(side)}
                        className={
                          "rounded-xl px-4 py-3 text-sm " +
                          (pickImage === side ? "bg-accent text-accent-ink" : "bg-raised")
                        }
                      >
                        Image {side}
                      </button>
                    ))}
                  </div>
                  <p className="mt-4 text-sm text-muted">Who is the AI?</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {peopleForVote.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setPickPerson(p.id)}
                        className={
                          "rounded-full px-3 py-2 text-sm " +
                          (pickPerson === p.id ? "bg-accent text-accent-ink" : "bg-raised")
                        }
                      >
                        {p.name}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    disabled={!voter || !pickImage || !pickPerson}
                    onClick={castVote}
                    className="mt-4 rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-accent-ink disabled:opacity-40"
                  >
                    Submit vote
                  </button>
                </>
              )}
              <button type="button" onClick={() => finish(votes)} className="mt-3 text-sm text-muted underline">
                Reveal
              </button>
            </div>
          )}

          {phase === "reveal" && (
            <div className="rounded-card border border-line bg-surface p-5">
              <h2 className="font-display text-3xl">
                Image {humanSide} was drawn by {artist?.name}
              </h2>
              <p className="mt-2 text-muted">The AI was {aiName}.</p>
              <ul className="mt-4 space-y-1 text-sm">
                {humans.map((h) => (
                  <li key={h.id}>
                    {h.name}: {scores[h.id] ?? 0} pts
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => setPhase("lobby")}
                className="mt-5 rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-accent-ink"
              >
                Next round
              </button>
            </div>
          )}
        </section>
      )}
    </main>
  );
}
