# 🦖 Guess by Genus

**Guess by Genus** is an educational paleontology game designed for enthusiasts and biological systematics fans. Test your knowledge of dinosaurs and other prehistoric creatures by correctly identifying species based on their genus.

---

## 🌟 Key Features

*   **Three Game Modes:**
    *   **Classic:** A relaxed pace with a customizable number of rounds.
    *   **Blitz:** High-speed challenge. How many species can you name before the time runs out?
    *   **Survival:** Test your endurance with a limited number of lives.
*   **Smart Validation:** Integrated **Levenshtein** and **Jaro-Winkler** algorithms allow the game to forgive minor typos, ensuring a smooth user experience.
*   **Deep Customization:** 
    *   Import your own databases via `.csv` or `.txt` files.
    *   Connect local image folders to display custom images.
*   **Sleek Interface:** Features Dark/Light themes, smooth animations, and dedicated soundtracks for each mode.

---

## 🚀 Installation & Setup

### For Players
1. Download the latest `Dino-Game-Setup.exe` from the [Releases](https://github.com/Quazzy23/dino-game/releases) section.
2. Run the installer.
3. Launch the game via the desktop shortcut or Start menu.

### For Developers
If you want to run or modify the source code:
1. **Clone the repository:**
   `git clone https://github.com/Quazzy23/dino-game.git`
2. **Install dependencies:**
   `npm install`
3. **Run the app in development mode:**
   `npm start`
4. **Build the production directory:**
   `npm run dist`  
   *(This creates an unpacked version in the `dist/win-unpacked` folder)*
5. **Create the final installer:**
   - Install [Inno Setup](https://jrsoftware.org/isdl.php) (Windows).
   - Open `installer.iss` and choose **Save & Compile Script**.
   - The final `.exe` will be generated in the `dist/` folder.

---

## 🛠 Tech Stack

*   **Framework:** [Electron.js](https://www.electronjs.org/)
*   **Frontend:** HTML5, CSS3, Vanilla JavaScript (ES6+)
*   **Storage:** LocalStorage (Settings) & Node.js FS (Game Progress)
*   **Logic:** Fuzzy string matching for species validation.

---

## 👥 Authors & Credits

*   **Project Lead:** Quazzy ([@Quazzy23](https://github.com/Quazzy23))
*   **Illustrations:** All arts by [cisiopurple](https://www.deviantart.com/cisiopurple).
*   **Development:** Created with the support of Google AI Gemini.

---

## 📝 License
This project is for educational purposes. Use of images is subject to the illustrator's (cisiopurple) original terms.

---
*Created with passion for paleontology and science popularization.*