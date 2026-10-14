# 🦖 Dino Keys – Touch Typing Adventure for Kids

A friendly, animated, dinosaur-themed touch typing game for kids that runs entirely in the browser. Zero external physics/audio libraries, zero npm dependencies, and zero build step.

Designed to meet kids where they are:
- Starts **very simply and slowly for a 4-year-old** with "find the big glowing key" to hatch baby dinosaurs, accompanied by friendly spoken voice prompts.
- Progresses systematically through the home row, top row, bottom row, capitals, punctuation, and numbers.
- Advances to full-speed touch typing racing against pterodactyls with real-time WPM and accuracy metrics.

---

## 🎮 How to Run

From the `typing-game` directory:

```bash
# Option 1: Start local server
npm start
# or: python3 -m http.server 8090

# Option 2: Run unit tests
npm test
```

Open your browser to: **`http://localhost:8090`**

*(Note: ES Modules must be served via HTTP/HTTPS, so run a local server rather than double-clicking `index.html`.)*

---

## 🗺️ The 7 Learning Worlds (Curriculum)

1. **🥚 Egg Nest (Ages 4–5)**:
   - **Focus**: Space bar, pointer anchor bumps (`F` & `J`), and finding home-row keys.
   - **Mode**: Hatch Mode. Big glowing target keys, gentle voice instructions, zero penalties for mistakes.
2. **🌼 Home Row Meadow (Ages 5–6)**:
   - **Focus**: Home row mastery (`A S D F G H J K L ;`).
   - **Mode**: Trail Mode & Meteor Shower. Real words appear as soon as the keys are known.
3. **🌴 Top Row Jungle (Ages 6–7)**:
   - **Focus**: Reaching up to `E, I, R, U, T, Y, W, O, Q, P`.
   - **Mode**: Trail walking & Coconut Meteor zapping.
4. **🌋 Bottom Row Volcano (Ages 7+)**:
   - **Focus**: Reaching down to `V, M, B, N, C, ,, X, ., Z`.
   - **Mode**: Trail walking & Volcano Eruption meteors.
5. **🏜️ Capital Canyon (Ages 7+)**:
   - **Focus**: Shift key with opposite pinky finger, capitalizing proper names, sentences, question marks (`?`), and apostrophes (`'`).
   - **Mode**: Trail sentences & Canyon Race.
6. **🏔️ Number Mountain (Ages 8+)**:
   - **Focus**: Number row reaches (`1 2 3 4 5 6 7 8 9 0`) and numbers in sentences.
   - **Mode**: Counting trails & Avalanche meteors.
7. **☁️ Sky Race (Ages 8+)**:
   - **Focus**: Full-speed touch typing, stamina, and accuracy drills on dinosaur facts and pangrams.
   - **Mode**: Speed races against Zip the pterodactyl (15 to 60+ WPM).

---

## 🕹️ 4 Interactive Game Modes

- **🥚 Hatch Mode**:
  - Center nest with a speckled dinosaur egg.
  - Big target key with voice prompts ("Press F!").
  - Each correct press shakes the egg and deepens cracks.
  - Final key hatches a baby dinosaur who leaps up, roars, and celebrates with confetti!
- **🐾 Trail Mode**:
  - Stepping stone conveyor belt across parallax landscape.
  - Dino walks forward on each correct stroke with dust puffs and musical pentatonic chimes.
  - Never forces frustrating backspaces for younger kids—the cursor advances upon striking the correct key.
- **☄️ Meteor Mode**:
  - Words or letters drift down lazily from the sky.
  - Typing the word turns the meteor into sparkles and star particles before it touches ground.
- **🏁 Race Mode**:
  - Pterodactyl aerial race across a marked distance track.
  - Real-time words-per-minute vs a rival racer to encourage speed and rhythm.

---

## 🦕 Collectable Dino Friends

Earn new dinosaurs by completing reward levels across worlds:
- **Rexy** (Green T-Rex, starter buddy)
- **Sunny** (Golden T-Rex)
- **Trixie** (Orange Triceratops)
- **Steggy** (Purple Stegosaurus)
- **Bronty** (Teal Brontosaurus)
- **Petra** (Pink Pterodactyl)
- **Anky** (Tan Ankylosaurus)
- **Parry** (Blue Parasaurolophus)
- **Clover** (Lime Stegosaurus)
- **Mango** (Orange Triceratops)
- **Ember** (Crimson T-Rex)
- **Dusty** (Desert Ankylosaurus)
- **Frosty** (Ice Brontosaurus)
- **Zephyr** (Golden Pterodactyl)

Visit **"My Dinos"** to choose any unlocked friend as your walking and racing buddy!

---

## 🎹 Touch Typing Hands & Keyboard

- Color-coded per-finger palette matching standard touch-typing pedagogy (pinky, ring, middle, index left/right, thumbs).
- Tactile home-row nib indicators on `F` and `J`.
- Live visual hands highlight the active finger and display pulsing guidance rings.
- Shift helper highlights the opposite-hand pinky finger.
- Virtual on-screen keys support touchscreens, tablets, and mouse clicks.

---

## ⚙️ Grown-ups & Settings Dashboard

- **Profiles**: Support for multiple siblings with their own placement, stars, and collected dinos.
- **Adaptive Tricky Keys**: Engine tracks per-key misses and reaction latency, prioritizing difficult keys in practice drills and future lessons.
- **Practice Mode**: One-click custom trail tailored to the child's trickiest keys.
- **Toggles**: Sound FX, Spoken Voice Prompts (Web Speech API), Looping Marimba Music, On-screen Keyboard, Hands Guide, and "Unlock All Levels" mode.
- **Safety**: Clean local storage persistence with reset confirmation.

---

## 🛠️ Architecture

```
typing-game/
├── index.html            # Single-page application shell
├── css/
│   └── style.css         # Parallax scenes, dino animations, keyboard & UI
├── js/
│   ├── layout.js         # QWERTY touch-typing finger map, shift rules, spoken names
│   ├── words.js          # Word, sentence, and dinosaur fact banks
│   ├── textgen.js        # Seeded, constrained, adaptive text generation
│   ├── curriculum.js     # 7 worlds, 40+ levels, unlocking & star scoring
│   ├── dinos.js          # Dino catalogue and species metadata
│   ├── dino-art.js       # Parametric SVG dinosaurs, eggs, nest, meteors
│   ├── scene.js          # 7 procedural parallax-scrolling world backgrounds
│   ├── audio.js          # WebAudio synthesized pentatonic SFX, marimba music, speech
│   ├── fx.js             # Particle bursts, confetti rain, dust puffs, screen shake
│   ├── engine.js         # TypingSession, WPM calculation, latency & adaptive weights
│   ├── storage.js        # Player profiles, settings, and progress persistence
│   ├── keyboard-view.js  # Interactive keyboard & animated hands guide
│   ├── game-modes.js     # HatchMode, TrailMode, MeteorMode, RaceMode runners
│   └── main.js           # Main coordinator connecting screens & navigation
└── test/
    ├── curriculum.test.js
    ├── engine.test.js
    └── storage.test.js
```
