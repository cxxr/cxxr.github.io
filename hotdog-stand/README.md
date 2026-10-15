# Hot Dog Stand: The Works 🌭

> A web-based educational business simulation and math game inspired by the 1996 Sunburst Communications classic **Hot Dog Stand: The Works**.

Designed to teach children and students (ages 8–14 / Grades 3–8) the fundamentals of entrepreneurship, financial literacy, forecasting, and practical mathematics through running a hot dog stand across an 8-event season.

---

## 🎮 How to Play

### Running Locally
No build tools, bundlers, or external dependencies required! You can run the game with any static HTTP server or Python:

```bash
cd ~/personal/math-game/hotdog-stand/
python3 -m http.server 8080
```
Then open your browser to [http://localhost:8080](http://localhost:8080).

### Running Unit Tests
A built-in test suite verifies demand curves, price elasticity formulas, pack math, and income statement accounting:

```bash
npm test
```

---

## 🌟 Key Features

1. **Frankie the Weather Wiener Mascot**:
   - An animated, expressive hot dog character who delivers daily forecasts with customized outfits (sunglasses on hot days, raincoat on wet days, knit scarf in chilly winds) and friendly business advice.
2. **Realistic Packaging Math & Spoilage**:
   - Hot dogs come in packs of 10, cartons of 50, or wholesale crates of 100.
   - Bakery fresh buns come in bags of 8, trays of 48, or wholesale bins of 96.
   - **Math Challenge**: Players must calculate multiples and remainders to avoid shortages or excess. Fresh buns spoil after 1 event if unused!
3. **External Variables Beyond Control**:
   - Dynamic weather conditions (Blazing Heatwave, Sunny & Warm, Chilly Wind, Rain Drizzle, Storms) drastically alter crowd size and beverage demand (e.g. cold sodas surge in heat, while hot cocoa surges in chilly rain).
4. **Price Elasticity & Consumer Psychology**:
   - Setting unit prices too high triggers consumer outrage ("Highway robbery!") and tanking demand. Setting fair prices or bargain combo deals drives high turnover.
5. **Advertising ROI & Break-Even Analysis**:
   - 5 advertising tiers (Word of Mouth, Flyers, Local Newspaper, Mascot, and Radio Commercials) require students to balance upfront cash expense against extra customer draw.
6. **Live 2D "Game Day" Canvas Simulation**:
   - Watch customers walk up to the red-and-white hot dog stand, wait in line, and react to prices or stockouts with speech bubbles. Includes 1x, 2x, 4x, and instant skip controls.
7. **Authentic Financial Accounting**:
   - Line-by-line Income Statement breaking down **Gross Revenue**, **Cost of Goods Sold (COGS)**, **Operating Expenses (Advertising & Permits)**, and **Spoilage Loss** to calculate **Net Profit or Loss**.
   - Interactive Canvas chart tracking season profit trajectory against the target goal.
8. **Student Business Calculator & Math Bonus**:
   - On-screen desk calculator with business formula helpers (Margin %, Bun Matcher).
   - Post-game math challenge questions that award bonus bankroll cash for correct calculations!

---

## 📚 Curriculum & Educational Alignment

| Educational Concept | Practical Application in the Game |
| :--- | :--- |
| **Common Multiples & Remainders** | Matching 10-packs of franks with 8-packs of buns. |
| **Unit Rates & Pricing** | Calculating cost per unit when buying in cartons vs single packs. |
| **Percentage & Margins** | Computing Gross Profit Margin: $\frac{\text{Price} - \text{Cost}}{\text{Price}} \times 100\%$. |
| **Supply, Demand & Elasticity** | Analyzing how price increases deter budget-conscious consumers. |
| **Risk Management & Perishability** | Budgeting for unpredictable weather drops and perishable shelf life. |
| **Data Interpretation** | Reading financial ledgers, line graphs, and performance metrics. |

---

## 🛠️ Technical Architecture

- **Zero-Dependency Architecture**: Built using pure ES6 JavaScript modules, semantic HTML5, and responsive CSS3.
- **Web Audio API Sound Engine**: All sound effects (cash register chime, clicks, fanfares) are procedurally synthesized in real time without external audio files.
- **HTML5 Canvas 2D**: Smooth animated simulation with weather particle physics and customer sprites.
- **LocalStorage State Persistence**: Progress is automatically saved, allowing students to pause and resume their 8-event campaign anytime.

---

## 📜 License
MIT License. Inspired with admiration by the classic educational software developed by Sunburst Communications.
