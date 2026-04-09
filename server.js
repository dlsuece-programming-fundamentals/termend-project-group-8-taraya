const express = require("express");
const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
const PORT = 3000;

// When running as a pkg executable, __dirname points inside the bundle.
// process.execDir is the folder where the .exe lives — where the static files are.
const BASE_DIR = process.pkg ? path.dirname(process.execPath) : __dirname;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(BASE_DIR));

const CSV_FILE = path.join(BASE_DIR, "equipments.csv");

// Custom size order
const sizeOrder = ["xs","s","m","l","xl","2xl"];
function sizeValue(size){
    if(!size || size.trim() === "") return -1;
    size = size.toLowerCase().trim();
    if(sizeOrder.includes(size)) return sizeOrder.indexOf(size);
    if(!isNaN(size)) return parseInt(size);
    return 999;
}

// ── GET sorted equipments ──────────────────────────────────────
app.get("/equipments", (req, res) => {
    const results = [];
    fs.createReadStream(CSV_FILE)
        .pipe(csv())
        .on("data", (data) => results.push(data))
        .on("end", () => {
            results.sort((a, b) => {
                if(a.item !== b.item) return a.item.localeCompare(b.item);
                if(sizeValue(a.size) !== sizeValue(b.size)) return sizeValue(a.size) - sizeValue(b.size);
                return a.color.localeCompare(b.color);
            });
            res.json(results);
        });
});

// ── ADD new equipment ──────────────────────────────────────────
app.post("/add-equipment", (req, res) => {
    const { item, size, color } = req.body;
    const newLine = `\n${item},${size},${color}`;
    fs.appendFile(CSV_FILE, newLine, (err) => {
        if(err){
            res.status(500).send("Error saving data");
        } else {
            res.send("Item added successfully");
        }
    });
});

// ── REMOVE one equipment (first matching row) ──────────────────
app.delete("/remove-equipment", (req, res) => {
    const { item, size, color } = req.body;

    fs.readFile(CSV_FILE, "utf8", (err, fileData) => {
        if(err) return res.status(500).send("Error reading file");

        const lines = fileData.split("\n");
        const header = lines[0];
        const rows = lines.slice(1);

        // Find the FIRST row that matches all three fields
        let removed = false;
        const updatedRows = rows.filter(line => {
            if(removed) return true; // keep everything after the first match
            const parts = line.split(",");
            // parts: [item, size, color]  — size may be blank
            const rowItem  = (parts[0] || "").trim();
            const rowSize  = (parts[1] || "").trim();
            const rowColor = (parts[2] || "").trim();

            const isMatch =
                rowItem  === item.trim() &&
                rowSize  === (size  || "").trim() &&
                rowColor === color.trim();

            if(isMatch){
                removed = true;
                return false; // drop this line
            }
            return true;
        });

        if(!removed){
            return res.status(404).send("Item not found in inventory");
        }

        const newContent = [header, ...updatedRows].join("\n");
        fs.writeFile(CSV_FILE, newContent, "utf8", (writeErr) => {
            if(writeErr) return res.status(500).send("Error writing file");
            res.send("Item removed successfully");
        });
    });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);

    const url = `http://localhost:${PORT}/project_proposal.html`;
    const { exec } = require("child_process");

    // Small delay to ensure server is fully ready before opening browser
    // Windows: start requires a dummy title ("") before the URL
    setTimeout(() => {
        const cmd = process.platform === "win32"  ? `start "" "${url}"`
                  : process.platform === "darwin" ? `open "${url}"`
                  : `xdg-open "${url}"`;

        exec(cmd, (err) => {
            if(err) console.error("Failed to open browser:", err);
        });
    }, 500);
});