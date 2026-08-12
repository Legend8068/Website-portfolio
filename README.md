# AYUSH.OS — Interactive Portfolio

An interactive portfolio engineered as a pixel operating system interface. Built with **React**, **Vite**, **Three.js**, and **GSAP**, featuring interactive system modules, real-time visualizers, and project telemetry.

---

## ⚡ Key Architecture & Features

- **Interactive Machine UI**: Custom pixel aesthetic with zero-cost hover cross-highlighting driven by data attributes and static CSS.
- **Motherboard Memory Map**: Direct mapping of technologies and skills disguised as CPU/register telemetry.
- **Interactive Terminal Shell**: Embedded interactive command shell allowing real-time navigation and system logs.
- **Project Showcase (Builds)**:
  - **SG-MeetHalfway** — Transit-weighted fair commute meeting point calculator.
  - **World Cup Tracker** — Multi-feed realtime match score & fixture state reconciliation.
  - **Telegram Task Bot** — NLP free-text date parsing & persistent reminder job queue.
  - **MakanMates** — Native Android group dining transit-fairness recommendation app.
  - **AYUSH.OS** — The portfolio interface itself.

---

## 🛠 Tech Stack

| Domain | Technologies |
| :--- | :--- |
| **Frontend Framework** | [React 18](https://react.dev/), [Vite](https://vitejs.dev/) |
| **Animation & 3D** | [GSAP](https://greensock.com/gsap/), [Three.js](https://threejs.org/), Canvas 2D |
| **Styles & Assets** | Custom CSS (Strata paper & geological depth system), Custom Typography |
| **Backend & Services** | Node.js, Firebase, SQLite, Telegram API |

---

## 📁 Repository Structure

```text
portfolio-v2/
├── public/                 # Static assets, diagrams, and project demos
├── src/
│   ├── components/         # System UI components (Boot, Builds, Machine, CoreBot, etc.)
│   ├── lib/                # Core system logic, registry, shell parser, & utilities
│   ├── assets/             # Custom fonts and styling assets
│   ├── App.jsx             # Main OS layout orchestrator
│   └── styles.css          # Core design system and layout styling
├── vite.config.js          # Vite build configuration
└── package.json            # Project dependencies and scripts
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18.x or higher)
- npm

### Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Legend8068/Website-portfolio.git
   cd Website-portfolio
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the local development server:**
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`.

---

## 📦 Build for Production

To create an optimized production build:

```bash
npm run build
```

To preview the built application locally:

```bash
npm run preview
```

---

## 📄 License

Distributed under the MIT License.
