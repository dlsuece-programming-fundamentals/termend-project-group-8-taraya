[![Open in Codespaces](https://classroom.github.com/assets/launch-codespace-2972f46106e565e64193e422d61a12cf1da4916b45550586e14ef0a7c637dd04.svg)](https://classroom.github.com/open-in-codespaces?assignment_repo_id=23416374)
# LBYCPG3 Term End Project — Taekwondo Manager

**Group Members:** Marcus Alden D. Taraya

## Abstract

This project is a locally-run desktop application that helps taekwondo coaches manage their equipment inventory and student payment records. The system allows coaches to add, remove, and filter equipment, as well as track student payment dues automatically based on the current date.

## Introduction

Taekwondo coaches and sellers have a problem and it's keeping track of inventory and students' payment schedules. This project addresses that problem by providing an offline management tool for them to use. It's simple enough to set up and requires no internet connection.

## Description of the Proposed System

The Taekwondo Manager is a full-stack web application served locally via a Node.js + Express backend, with an HTML/CSS/JavaScript frontend. It is packaged into a standalone Windows executable using `pkg`, so it can be run on any Windows machine without Node.js installed.

The system has 2 tabs: The equipment tab and the student tab. The equipment tab manages all the equipment by sorting out the csv file and displays it all. The inventory can be managed by removing or adding more equipment based on what is needed. The student tab manages students by keeping track of their name, age, date enrolled, and date due. You can add, delete, or edit students' data.

## Objectives

- Build an offline, easy-to-use application that requires no internet connection and runs on any Windows computer.
- Provide a digital alternative to manual equipment tracking via spreadsheets or memory.
- Automatically calculate and display student payment statuses based on the current date.
- Allow coaches to add, remove, and filter equipment inventory with minimal effort.
- Allow coaches to add, remove, and edit student records including payment dates.
- Package the application into a single executable that any Windows user can run without installing Node.js.


## Web Development Tools and Algorithms

- **Payment Status Calculation** — on every page load, each student's `next_payment` date is compared against `new Date()` (today). The difference in days is calculated using `Math.round((nextDate - today) / (1000 * 60 * 60 * 24))`. Negative or zero values are flagged as overdue; positive values show days remaining.
- **Inventory Sorting** — equipment is sorted server-side by item name (alphabetical), then by size using a custom `sizeValue()` function that maps both numeric sizes (100–210 for uniforms) and categorical sizes (xs, s, m, l, xl, 2xl) onto a unified numeric scale, then by color (alphabetical).
- **Student Sorting** — overdue students are always shown first, then sorted by ascending `next_payment` date so the most urgently overdue appear at the top.
- **First-Match Removal** — when removing equipment, only the first matching row in the CSV is deleted, preserving duplicate entries of the same item that exist independently.


## Methodology

The tools used for this was notepad++ for coding and writing the csv files, node.js for running the server locally, and google chrome to run the frontend

## Testing and Evaluation of Results

Each feature was tested manually by: Adding entries and verifying they appeared correctly in the UI and in the CSV file, removing entries and confirming the correct row was deleted without affecting others, setting student payment dates to past, present, and future dates to verify the status badges and sorting behaved correctly, rebuilding the `.exe` with `pkg` and running it on a machine without Node.js to confirm offline functionality.

### Results
Present the outcomes of the project, including functionality and performance. Use screenshots or tables if necessary to illustrate testing results.

### Discussion
The final application meets all objectives laid out in the proposal. The scope expanded from inventory-only to a general management system, which was a direct result of interviewing coaches and it seemed that student payment tracking was equally if not more valuable than inventory management.

One notable technical challenge was packaging with `pkg`: the `__dirname` variable inside a bundled executable points to the internal bundle rather than the folder containing the `.exe`. This was resolved by using `process.pkg ? path.dirname(process.execPath) : __dirname` to correctly resolve file paths at runtime.

The decision to use plain CSV files rather than a database was intentional given the target user's constraints since CSV files are human-readable, easy to back up, and require no setup. For the scale of a single taekwondo gym's roster and inventory, performance is not a concern.

### Conclusion

The Taekwondo Manager successfully delivers a lightweight, offline-first management tool for taekwondo coaches.

## References

- [Express.js Documentation](https://expressjs.com/)
- [Node.js Documentation](https://nodejs.org/en/docs)
- [pkg by Vercel](https://github.com/vercel/pkg)
- [csv-parser npm package](https://www.npmjs.com/package/csv-parser)
- [MDN Web Docs — Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
- [MDN Web Docs — Date object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date)

## Project Deliverables

Check off each item as you complete it:

- [X] **Project Documentation** — this README or uploaded document following the format above
- [ ] **App Design** — Figma link submitted on Canvas
- [X] **Source Code** — all HTML, CSS, JS, and assets in `src/`
- [X] **Video Walkthrough** — max 5 minutes, link below
- [X] **Peer Grade** — individual submission on Canvas

## Video Walkthrough

Paste your video link here:
https://www.youtube.com/watch?v=1VoG43VAoPY

Your walkthrough should demonstrate your website's key features and functionality. Max 5 minutes. There will be no presentation — your video should be clear enough that any student taking this course can understand your project.

## How to Run

### Option A: run the executable file in releases
Download or clone this repository.
Navigate to the src/ folder.
Double-click taekwondo-app.exe.
The app will open automatically in your default browser at http://localhost:3000/index.html.

### Option B: Run from source (requires Node.js)

Install Node.js from https://nodejs.org
Open a terminal in the src/ folder.
Run: npm install express csv-parser body-parser cors
Run: node server.js
Open http://localhost:3000/index.html in your browser.

### Option C: Rebuild the executable
Install pkg globally: npm install -g pkg
From the src/ folder, run:
pkg server.js --targets node18-win-x64 --output taekwondo-app

## Project Structure

```
├── src/
│   ├── index.html           # Main HTML — tabbed interface
│   ├── pp_script.js         # Frontend JavaScript — all UI logic
│   ├── pp.css               # Stylesheet
│   ├── server.js            # Node.js/Express backend server
│   ├── equipments.csv       # Equipment inventory data
│   ├── students.csv         # Student roster and payment data
│   ├── taekwondo-app.exe    # Packaged Windows executable
│   └── *.png                # Equipment images (e.g. armor-red.png)
├── docs/
│   └── TaekwondoManager_Documentation.docx
└── README.md
```

## Submission Notes

- All source code must be committed and pushed before the deadline (**April 9, 2359**).
- Do **not** upload generated or binary files.
- Keep your repository organized — use folders as shown above.
- All team members should contribute commits.
