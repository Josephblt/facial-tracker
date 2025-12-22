# Facial Tracker

A **local, browser-based facial movement tracking application** designed to support **assessment and longitudinal monitoring of facial muscle function**, with a particular focus on **peripheral facial palsy** (e.g. Bell’s palsy).

The application runs **entirely locally**, uses **free and open-source technologies**, and performs all computer-vision processing **on-device** using the browser.

---

## 1. Medical Context & Goals

### 1.1 Motivation

Peripheral facial palsy affects voluntary muscle control on one side of the face, often resulting in:

* Facial asymmetry
* Reduced eye closure
* Altered mouth movement
* Involuntary synkinesis during recovery

Clinical follow-up typically relies on:

* Visual inspection
* Subjective grading scales (e.g. House–Brackmann)
* Intermittent clinical visits

This project explores a **complementary, quantitative approach** by tracking facial movement over time using computer vision, with the goal of:

* Supporting clinicians and patients with objective measurements
* Enabling longitudinal comparisons under controlled conditions
* Remaining accessible, low-cost, and privacy-preserving

> ⚠️ **Important:** This software is **not a medical device** and is **not intended for diagnosis**. It is a research and self-tracking tool intended to complement professional medical evaluation.

---

### 1.2 Design Principles (Medical)

* **Privacy-first**: No cloud processing, no data transmission
* **Reproducibility**: Same pose, same camera, same metrics over time
* **Stability over novelty**: Prefer robust, explainable measurements
* **Patient control**: All data stored locally

---

## 2. Technical Overview

### 2.1 Architecture Summary

* **Platform**: Modern web browser
* **Execution**: Local only (`http://localhost`)
* **Rendering**: `<canvas>`
* **Computer Vision**: MediaPipe (WebAssembly)
* **Camera Access**: Web MediaDevices API

There is:

* ❌ No backend
* ❌ No database server
* ❌ No cloud dependency

---

### 2.2 Current Features

* Webcam access (local)
* Real-time video rendering to canvas
* Horizontal mirroring (selfie view)
* Face detection (bounding box)
* Stable, throttled inference loop (no WASM crashes)

This constitutes a **validated technical baseline**.

---

### 2.3 Technology Stack (All Free)

| Component    | Technology                                  |
| ------------ | ------------------------------------------- |
| Language     | JavaScript (ES modules)                     |
| UI           | HTML + Canvas                               |
| CV           | MediaPipe Face Detection                    |
| Acceleration | WebGL (GPU)                                 |
| Tooling      | VS Code, Git                                |
| Runtime      | Any modern browser (Chrome, Edge, Firefox*) |

> *Note: MediaPipe performs best on Chromium-based browsers.

---

## 3. Privacy & Data Handling

### 3.1 Privacy Guarantees

* Camera feed never leaves the device
* No network requests during runtime (except initial library load)
* No analytics, cookies, or telemetry
* No user identification

### 3.2 Data Storage (Planned)

Future versions may optionally store:

* Images or short video clips
* Derived metrics (numerical only)

All storage will be:

* Local-only
* Explicitly user-triggered
* Human-readable when possible

Sensitive folders are excluded from version control by default.

---

## 4. Development Status

### 4.1 Current State

✔ Stable camera pipeline
✔ Stable face detection
✔ Clean render/detection separation
✔ Git-tracked baseline

### 4.2 Next Planned Milestones

1. Face Mesh integration (468 landmarks)
2. Controlled pose capture (rest, smile, blink, etc.)
3. Asymmetry metrics (left vs right)
4. Longitudinal comparison tools
5. Local data export (CSV / JSON)

Each milestone will be implemented incrementally and validated for stability before proceeding.

---

## 5. Development Philosophy

This project intentionally avoids frameworks at the early stage.

**Why:**

* Computer vision requires precise control over timing
* WASM debugging is easier without abstraction layers
* Medical-adjacent software benefits from inspectable pipelines

Frameworks (React, Vue, etc.) may be introduced later **only if** they demonstrably reduce complexity.

---

## 6. Disclaimer

This project:

* Is **experimental**
* Does **not replace medical advice**

Always consult qualified healthcare professionals for diagnosis and treatment decisions.

---

## 7. License

This project uses only free and open-source dependencies.

---

## 8. Acknowledgements

* MediaPipe team (Google) for open-source computer vision tools
* Open web standards that make privacy-first applications possible

---

**Status:** Active development
