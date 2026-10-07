"""
Human or Not? - Multiplayer social deduction game
Chat + images prototype
"""

import asyncio
import json
import random
import uuid
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, UploadFile, File, Form
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, HTMLResponse
from starlette.websockets import WebSocketState

app = FastAPI(title="Human or Not?")

# Serve static files
app.mount("/static", StaticFiles(directory="static"), name="static")
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# In-memory game state
rooms: Dict[str, dict] = {}

# Sample prompts for rounds
PROMPTS = [
    "A cat wearing sunglasses sitting on the moon",
    "A robot eating spaghetti in a fancy restaurant",
    "A pirate ship sailing through a sea of clouds",
    "An astronaut riding a bicycle on Mars",
    "A dragon reading a book in a cozy library",
    "A penguin in a business suit giving a presentation",
    "A treehouse floating in the sky with balloons",
    "A fox playing electric guitar on stage",
    "A mermaid shopping in a supermarket",
    "A dinosaur wearing a top hat and monocle",
]

# Simple AI chat responses (placeholder – later replace with real LLM)
AI_PHRASES = [
    "Haha yeah I spent ages on the details of that one",
    "Look at the shading, pure human struggle right there",
    "I freehanded most of it, the proportions are a bit off on purpose",
    "The AI one looks too perfect, mine has soul",
    "I used reference photos but drew it myself",
    "Check the hands... AI always messes up hands",
    "That was my third attempt, the first two were worse",
    "I went for a more sketchy style so it feels real",
    "The background took the longest, trust me",
    "Anyone else notice the weird artifact on the AI one?",
]


def generate_room_code() -> str:
    return "".join(random.choices("ABCDEFGHJKLMNPQRSTUVWXYZ23456789", k=5))


def get_room(code: str) -> Optional[dict]:
    return rooms.get(code.upper())


async def broadcast(room: dict, message: dict, exclude: Optional[str] = None):
    """Send message to all connected players in a room."""
    dead = []
    for pid, player in room["players"].items():
        if pid == exclude:
            continue
        ws = player.get("ws")
        if ws and ws.client_state == WebSocketState.CONNECTED:
            try:
                await ws.send_json(message)
            except Exception:
                dead.append(pid)
        else:
            dead.append(pid)
    for pid in dead:
        if pid in room["players"]:
            del room["players"][pid]


async def send_to(player: dict, message: dict):
    ws = player.get("ws")
    if ws and ws.client_state == WebSocketState.CONNECTED:
        try:
            await ws.send_json(message)
        except Exception:
            pass


def public_state(room: dict, for_player_id: str = None) -> dict:
    """Return a safe public view of the room state."""
    players = []
    for pid, p in room["players"].items():
        players.append({
            "id": pid,
            "name": p["name"],
            "isHost": p.get("isHost", False),
            "isAI": False,  # never reveal
            "connected": p.get("ws") is not None and p["ws"].client_state == WebSocketState.CONNECTED,
        })

    state = {
        "code": room["code"],
        "phase": room["phase"],
        "players": players,
        "prompt": room.get("prompt"),
        "hostId": room.get("hostId"),
        "artistId": room.get("artistId") if room["phase"] in ("drawing", "reveal") else None,
        "images": room.get("images"),
        "votes": room.get("votes") if room["phase"] == "reveal" else None,
        "scores": room.get("scores", {}),
        "round": room.get("round", 0),
        "myRole": None,
    }

    if for_player_id and for_player_id in room["players"]:
        p = room["players"][for_player_id]
        if room["phase"] == "drawing" and room.get("artistId") == for_player_id:
            state["myRole"] = "artist"
        elif p.get("isAI"):
            state["myRole"] = "ai"  # only the AI knows
        else:
            state["myRole"] = "guesser"

    return state


@app.get("/")
async def index():
    return FileResponse("static/index.html")


@app.post("/api/create")
async def create_room(name: str = Form(...)):
    code = generate_room_code()
    while code in rooms:
        code = generate_room_code()

    player_id = str(uuid.uuid4())[:8]
    rooms[code] = {
        "code": code,
        "phase": "lobby",  # lobby | drawing | discussion | voting | reveal
        "players": {
            player_id: {
                "id": player_id,
                "name": name.strip()[:20] or "Player",
                "isHost": True,
                "isAI": False,
                "ws": None,
                "score": 0,
            }
        },
        "hostId": player_id,
        "prompt": None,
        "artistId": None,
        "images": {"A": None, "B": None},
        "humanImageSide": None,  # "A" or "B"
        "votes": {},
        "scores": {},
        "round": 0,
        "chat": [],
        "ai_player_id": None,
    }
    return {"code": code, "playerId": player_id, "name": rooms[code]["players"][player_id]["name"]}


@app.post("/api/join")
async def join_room(code: str = Form(...), name: str = Form(...)):
    code = code.upper().strip()
    room = get_room(code)
    if not room:
        return {"error": "Room not found"}
    if room["phase"] != "lobby":
        return {"error": "Game already started"}
    if len(room["players"]) >= 6:
        return {"error": "Room is full (max 6)"}

    player_id = str(uuid.uuid4())[:8]
    room["players"][player_id] = {
        "id": player_id,
        "name": name.strip()[:20] or "Player",
        "isHost": False,
        "isAI": False,
        "ws": None,
        "score": 0,
    }
    return {"code": code, "playerId": player_id, "name": room["players"][player_id]["name"]}


@app.post("/api/upload")
async def upload_image(
    code: str = Form(...),
    playerId: str = Form(...),
    file: UploadFile = File(...),
):
    room = get_room(code)
    if not room:
        return {"error": "Room not found"}
    if room["phase"] != "drawing":
        return {"error": "Not in drawing phase"}
    if room.get("artistId") != playerId:
        return {"error": "You are not the artist"}

    # Save file
    ext = Path(file.filename).suffix.lower() or ".png"
    if ext not in (".png", ".jpg", ".jpeg", ".webp", ".gif"):
        ext = ".png"
    filename = f"{code}_{playerId}_{uuid.uuid4().hex[:6]}{ext}"
    path = Path("uploads") / filename
    content = await file.read()
    path.write_bytes(content)

    # Assign to a random side
    side = room["humanImageSide"]
    room["images"][side] = f"/uploads/{filename}"

    # Also create a fake AI image (placeholder for now)
    other = "B" if side == "A" else "A"
    # For MVP we use a simple colored placeholder + note
    # In real version we'd call an image gen API here
    room["images"][other] = None  # will be filled by AI placeholder logic

    await broadcast(room, {
        "type": "image_uploaded",
        "side": side,
        "by": room["players"][playerId]["name"],
    })

    # Check if both ready → move to discussion
    # For now, after human uploads we immediately generate AI placeholder and start discussion
    await start_discussion(room)
    return {"ok": True, "side": side}


async def start_discussion(room: dict):
    """After human image is in, create AI image placeholder and open chat."""
    human_side = room["humanImageSide"]
    ai_side = "B" if human_side == "A" else "A"

    # Placeholder AI image (in real app call Flux / SD / Grok Imagine API)
    # For now we use a public placeholder service or just mark it
    room["images"][ai_side] = f"https://placehold.co/512x512/1a1a2e/e0e0e0?text=AI+Image%0A(placeholder)"

    room["phase"] = "discussion"
    room["chat"] = []

    await broadcast(room, {
        "type": "phase",
        "phase": "discussion",
        "images": room["images"],
        "prompt": room["prompt"],
        "message": "Both images are ready! Discuss and figure out which is human-made and who the AI is.",
    })

    # Kick off AI chatter after a short delay
    if room.get("ai_player_id"):
        asyncio.create_task(ai_chat_loop(room))


async def ai_chat_loop(room: dict):
    """Simple AI that occasionally posts in chat during discussion."""
    ai_id = room.get("ai_player_id")
    if not ai_id or ai_id not in room["players"]:
        return

    await asyncio.sleep(4)
    while room["phase"] == "discussion":
        if random.random() < 0.4:  # 40% chance each cycle
            phrase = random.choice(AI_PHRASES)
            msg = {
                "type": "chat",
                "from": room["players"][ai_id]["name"],
                "fromId": ai_id,
                "text": phrase,
                "ts": datetime.utcnow().isoformat(),
            }
            room["chat"].append(msg)
            await broadcast(room, msg)
        await asyncio.sleep(random.uniform(6, 14))


@app.websocket("/ws/{code}/{player_id}")
async def websocket_endpoint(websocket: WebSocket, code: str, player_id: str):
    code = code.upper()
    room = get_room(code)
    if not room or player_id not in room["players"]:
        await websocket.close(code=4000)
        return

    await websocket.accept()
    room["players"][player_id]["ws"] = websocket

    # Send current state
    await send_to(room["players"][player_id], {
        "type": "state",
        "state": public_state(room, player_id),
    })

    # Notify others
    await broadcast(room, {
        "type": "player_joined",
        "player": {
            "id": player_id,
            "name": room["players"][player_id]["name"],
            "isHost": room["players"][player_id].get("isHost", False),
        },
        "players": public_state(room)["players"],
    }, exclude=player_id)

    try:
        while True:
            data = await websocket.receive_json()
            msg_type = data.get("type")

            if msg_type == "start_round":
                if room["players"][player_id].get("isHost") and room["phase"] == "lobby":
                    await start_round(room)

            elif msg_type == "chat":
                text = (data.get("text") or "").strip()[:300]
                if text and room["phase"] in ("discussion", "voting", "lobby"):
                    chat_msg = {
                        "type": "chat",
                        "from": room["players"][player_id]["name"],
                        "fromId": player_id,
                        "text": text,
                        "ts": datetime.utcnow().isoformat(),
                    }
                    room["chat"].append(chat_msg)
                    await broadcast(room, chat_msg)

            elif msg_type == "vote":
                if room["phase"] == "voting":
                    image_vote = data.get("image")  # "A" or "B"
                    person_vote = data.get("person")  # player id
                    room["votes"][player_id] = {
                        "image": image_vote,
                        "person": person_vote,
                    }
                    await broadcast(room, {
                        "type": "vote_cast",
                        "from": room["players"][player_id]["name"],
                        "count": len(room["votes"]),
                        "total": len([p for p in room["players"].values() if not p.get("isAI")]),
                    })
                    # Auto-reveal when all humans voted
                    humans = [p for p in room["players"].values() if not p.get("isAI")]
                    if len(room["votes"]) >= len(humans):
                        await reveal(room)

            elif msg_type == "start_voting":
                if room["players"][player_id].get("isHost") and room["phase"] == "discussion":
                    room["phase"] = "voting"
                    await broadcast(room, {
                        "type": "phase",
                        "phase": "voting",
                        "message": "Voting is open! Choose which image is human and who the AI is.",
                    })

            elif msg_type == "force_reveal":
                if room["players"][player_id].get("isHost") and room["phase"] in ("discussion", "voting"):
                    await reveal(room)

            elif msg_type == "next_round":
                if room["players"][player_id].get("isHost"):
                    room["phase"] = "lobby"
                    room["prompt"] = None
                    room["artistId"] = None
                    room["images"] = {"A": None, "B": None}
                    room["votes"] = {}
                    await broadcast(room, {
                        "type": "phase",
                        "phase": "lobby",
                        "message": "Back to lobby. Host can start next round.",
                    })

            elif msg_type == "add_ai":
                # Host can add an AI player
                if room["players"][player_id].get("isHost") and room["phase"] == "lobby":
                    if not room.get("ai_player_id"):
                        ai_id = "ai-" + str(uuid.uuid4())[:6]
                        ai_name = random.choice(["Alex", "Sam", "Jordan", "Casey", "Riley", "Quinn"])
                        room["players"][ai_id] = {
                            "id": ai_id,
                            "name": ai_name + " (AI)",
                            "isHost": False,
                            "isAI": True,
                            "ws": None,
                            "score": 0,
                        }
                        room["ai_player_id"] = ai_id
                        await broadcast(room, {
                            "type": "player_joined",
                            "player": {"id": ai_id, "name": room["players"][ai_id]["name"], "isHost": False},
                            "players": public_state(room)["players"],
                            "message": f"{ai_name} joined the room",
                        })

    except WebSocketDisconnect:
        pass
    finally:
        if player_id in room["players"]:
            room["players"][player_id]["ws"] = None
            await broadcast(room, {
                "type": "player_left",
                "playerId": player_id,
                "name": room["players"][player_id]["name"],
                "players": public_state(room)["players"],
            })
            # Clean empty rooms
            if not any(p.get("ws") for p in room["players"].values() if not p.get("isAI")):
                # keep for a bit, or delete
                pass


async def start_round(room: dict):
    room["round"] = room.get("round", 0) + 1
    room["phase"] = "drawing"
    room["prompt"] = random.choice(PROMPTS)
    room["votes"] = {}
    room["images"] = {"A": None, "B": None}
    room["humanImageSide"] = random.choice(["A", "B"])

    # Pick a random human artist (not AI)
    humans = [pid for pid, p in room["players"].items() if not p.get("isAI")]
    if not humans:
        return
    room["artistId"] = random.choice(humans)

    await broadcast(room, {
        "type": "phase",
        "phase": "drawing",
        "prompt": room["prompt"],
        "artistId": room["artistId"],
        "artistName": room["players"][room["artistId"]]["name"],
        "message": f"Round {room['round']}: Draw this → “{room['prompt']}”",
        "state": public_state(room),
    })

    # Tell the artist privately
    artist = room["players"][room["artistId"]]
    await send_to(artist, {
        "type": "you_are_artist",
        "prompt": room["prompt"],
        "message": "You are the Artist! Upload your drawing of the prompt.",
    })


async def reveal(room: dict):
    room["phase"] = "reveal"
    human_side = room["humanImageSide"]
    artist_id = room["artistId"]
    ai_id = room.get("ai_player_id")

    # Score calculation (simple)
    scores_this_round = {}
    for pid, vote in room["votes"].items():
        correct_image = vote.get("image") == human_side
        correct_person = vote.get("person") == (ai_id or artist_id)  # guessing the AI or the artist
        points = (2 if correct_image else 0) + (2 if correct_person else 0)
        scores_this_round[pid] = points
        if pid in room["players"]:
            room["players"][pid]["score"] = room["players"][pid].get("score", 0) + points

    await broadcast(room, {
        "type": "reveal",
        "humanSide": human_side,
        "artistId": artist_id,
        "artistName": room["players"][artist_id]["name"] if artist_id else None,
        "aiId": ai_id,
        "aiName": room["players"][ai_id]["name"] if ai_id else None,
        "images": room["images"],
        "votes": room["votes"],
        "scoresThisRound": scores_this_round,
        "totalScores": {pid: p.get("score", 0) for pid, p in room["players"].items()},
        "message": f"Image {human_side} was the human drawing by {room['players'][artist_id]['name']}!",
    })


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
