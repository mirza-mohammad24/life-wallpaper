# Life Wallpaper

A high-performance, visually elegant life timeline visualization tool built with React, TypeScript, and HTML5 Canvas. It provides a reflective perspective on time, mapping out your life in months and visualizing your progress through a clean, interactive interface.

## ✨ Features

- **Dynamic Life Timeline**: Visualizes your entire life expectancy in a grid of months, categorized into past, present, and future states.
- **High-Performance Rendering**: Utilizes a dedicated HTML5 Canvas engine for smooth, low-overhead visualization of thousands of life-month units.
- **Real-Time Progress**: A central high-precision countdown timer showing exactly how much time has passed and how much remains based on your life expectancy.
- **Personalized Experience**:
  - Custom Date of Birth (DOB) and Life Expectancy settings.
  - Personal message banner for daily focus.
  - Choice of cell shapes: **Square**, **Circle**, or **Heart**.
- **Theming & Aesthetics**:
  - Full support for **Light**, **Dark**, and **System** themes.
  - Built with Tailwind CSS for a modern, responsive user interface.
- **Privacy First**: All data is stored locally in your browser's `localStorage`. No personal data ever leaves your device.

## 🏗️ Architecture

The project follows a strict 3-stage data transformation pipeline to ensure performance and architectural clarity:

1.  **User Config**: Raw user input (DOB, expectancy, theme, etc.) persisted in `localStorage`.
2.  **Utils Layer**: Derives temporal runtime values (total months, months lived, current month progress) from the user configuration.
3.  **Render Engine**: A decoupled HTML5 Canvas engine that consumes a `RenderConfig` to draw the timeline with maximum efficiency, independent of the React component lifecycle.

## 🛠️ Tech Stack

- **Framework**: [React 19](https://react.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Bundler**: [Vite 7](https://vitejs.dev/)
- **Graphics**: HTML5 Canvas API

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (Latest LTS recommended)
- [pnpm](https://pnpm.io/) (or npm/yarn)

### Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/your-username/life-wallpaper.git
    cd life-wallpaper
    ```

2.  **Install dependencies**:
    ```bash
    pnpm install
    ```

3.  **Start the development server**:
    ```bash
    pnpm dev
    ```

4.  **Build for production**:
    ```bash
    pnpm build
    ```

---

*“It is not that we have a short time to live, but that we waste a lot of it.”* — **Seneca**
