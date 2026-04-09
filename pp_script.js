// ══════════════════════════════════════════════
//  TAB SWITCHING
// ══════════════════════════════════════════════
function switchTab(tab) {
    document.getElementById("tab-inventory").style.display = tab === "inventory" ? "" : "none";
    document.getElementById("tab-students").style.display  = tab === "students"  ? "" : "none";
    document.querySelectorAll(".tab-btn").forEach((btn, i) => {
        btn.classList.toggle("active", (i === 0 && tab === "inventory") || (i === 1 && tab === "students"));
    });
}

// ══════════════════════════════════════════════
//  INVENTORY
// ══════════════════════════════════════════════
let inventoryData = [];
const inventoryDiv = document.getElementById("inventory");
const statsDiv     = document.getElementById("stats");

const equipmentOptions = {
    armor: {
        sizes:  ["xs","s","m","l","xl","2xl"],
        colors: ["red","blue"]
    },
    headgear: {
        sizes:  ["xs","s","m","l","xl"],
        colors: ["red","blue"]
    },
    uniform: {
        sizes:  ["100","110","120","130","140","150","160","170","180","190","200","210"],
        colors: ["top","bottom"]
    },
    pad: {
        sizes:  [""],
        colors: ["red","blue","white"]
    },
    "arm guards": {
        sizes:  [""],
        colors: ["red","blue","black"]
    }
};

function loadInventory() {
    fetch("/equipments")
        .then(res => res.json())
        .then(data => {
            inventoryData = data;
            displayStats(data);
            displayInventory(data);
        });
}

function displayStats(data) {
    const counts = {};
    data.forEach(item => {
        if(!counts[item.item]) counts[item.item] = 0;
        counts[item.item]++;
    });
    let html = "<h2>Inventory Summary</h2>";
    for(let item in counts) html += `<p>${item}: ${counts[item]}</p>`;
    statsDiv.innerHTML = html;
}

function displayInventory(data) {
    inventoryDiv.innerHTML = "";
    data.forEach(equipment => {
        const card = document.createElement("div");
        card.className = "card";
        const imgName = equipment.color
            ? `${equipment.item}-${equipment.color}.png`
            : `${equipment.item}.png`;
        card.innerHTML = `
            <img src="${imgName}" onerror="this.src='${equipment.item}.png'">
            <h3>${equipment.item}</h3>
            <p>Size: ${equipment.size || "N/A"}</p>
            <p>Color: ${equipment.color}</p>
            <button class="remove-btn" onclick="removeEquipment('${equipment.item}', '${equipment.size}', '${equipment.color}', this)">Remove</button>
        `;
        inventoryDiv.appendChild(card);
    });
}

function filterInventory() {
    const item  = document.getElementById("item").value;
    const size  = document.getElementById("size").value;
    const color = document.getElementById("color").value;
    const filtered = inventoryData.filter(e =>
        (!item  || e.item  === item)  &&
        (!size  || e.size  === size)  &&
        (!color || e.color === color)
    );
    displayInventory(filtered);
}

function updateDropdowns() {
    const item          = document.getElementById("item").value;
    const sizeDropdown  = document.getElementById("size");
    const colorDropdown = document.getElementById("color");
    sizeDropdown.innerHTML  = "";
    colorDropdown.innerHTML = "";
    if(!item) {
        sizeDropdown.disabled  = true;
        colorDropdown.disabled = true;
        return;
    }
    sizeDropdown.disabled  = false;
    colorDropdown.disabled = false;
    equipmentOptions[item].sizes.forEach(size => {
        const o = document.createElement("option");
        o.value = size; o.text = size || "N/A";
        sizeDropdown.appendChild(o);
    });
    equipmentOptions[item].colors.forEach(color => {
        const o = document.createElement("option");
        o.value = color; o.text = color;
        colorDropdown.appendChild(o);
    });
}

function addEquipment() {
    const item  = document.getElementById("item").value;
    const size  = document.getElementById("size").value;
    const color = document.getElementById("color").value;
    if(!item) { alert("Please select an item."); return; }
    fetch("/add-equipment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ item, size, color })
    })
    .then(res => { if(!res.ok) throw new Error("Server error"); return res.text(); })
    .then(() => loadInventory())
    .catch(err => alert("Failed to add equipment: " + err.message));
}

function removeEquipment(item, size, color, btnEl) {
    if(!confirm(`Remove one "${item}" (size: ${size || "N/A"}, color: ${color})?`)) return;
    fetch("/remove-equipment", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ item, size, color })
    })
    .then(res => { if(!res.ok) return res.text().then(t => { throw new Error(t); }); return res.text(); })
    .then(() => loadInventory())
    .catch(err => alert("Failed to remove equipment: " + err.message));
}

// ══════════════════════════════════════════════
//  STUDENTS
// ══════════════════════════════════════════════
let studentData = [];
const studentListDiv  = document.getElementById("student-list");
const studentStatsDiv = document.getElementById("student-stats");

function loadStudents() {
    fetch("/students")
        .then(res => res.json())
        .then(data => {
            studentData = data;
            displayStudentStats(data);
            displayStudents(data);
        });
}

function displayStudentStats(data) {
    const today  = new Date(); today.setHours(0,0,0,0);
    const due    = data.filter(s => new Date(s.next_payment) <= today).length;
    const notDue = data.length - due;
    studentStatsDiv.innerHTML = `
        <h2>Student Summary</h2>
        <p>Total Students: ${data.length}</p>
        <p class="due-label">Payment Due: ${due}</p>
        <p class="ok-label">Payment OK: ${notDue}</p>
    `;
}

function displayStudents(data) {
    studentListDiv.innerHTML = "";
    if(data.length === 0) {
        studentListDiv.innerHTML = "<p>No students found.</p>";
        return;
    }

    // Sort: overdue/due first, then by soonest next payment
    const today = new Date(); today.setHours(0,0,0,0);
    const sorted = [...data].sort((a, b) => {
        const aDate = new Date(a.next_payment);
        const bDate = new Date(b.next_payment);
        const aDue  = aDate <= today;
        const bDue  = bDate <= today;
        if(aDue !== bDue) return aDue ? -1 : 1;
        return aDate - bDate;
    });

    sorted.forEach(student => {
        const nextDate = new Date(student.next_payment);
        nextDate.setHours(0,0,0,0);
        const isDue    = nextDate <= today;
        const diffDays = Math.round((nextDate - today) / (1000 * 60 * 60 * 24));

        let statusText, statusClass;
        if(isDue) {
            const overdue = Math.abs(diffDays);
            statusText  = overdue === 0 ? "Due today" : `Overdue by ${overdue} day${overdue !== 1 ? "s" : ""}`;
            statusClass = "status-due";
        } else {
            statusText  = `Due in ${diffDays} day${diffDays !== 1 ? "s" : ""}`;
            statusClass = "status-ok";
        }

        const row = document.createElement("div");
        row.className = `student-card ${isDue ? "student-due" : "student-ok"}`;
        row.innerHTML = `
            <div class="student-info">
                <strong>${student.name}</strong>
                <span>Age: ${student.age}</span>
                <span class="s-date-started-label">Started: ${student.date_started}</span>
                <span class="s-next-payment-label">Next Payment: ${student.next_payment}</span>
                <div class="edit-fields" style="display:none; margin-top:8px;">
                    <label>Date Started:
                        <input type="date" class="s-edit-start" value="${student.date_started}">
                    </label>
                    <label>Next Payment:
                        <input type="date" class="s-edit-next" value="${student.next_payment}">
                    </label>
                </div>
            </div>
            <div class="student-right">
                <span class="status-badge ${statusClass}">${statusText}</span>
                <button class="edit-btn" onclick="toggleEdit(this, '${student.name}')">Edit</button>
                <button class="remove-btn" onclick="removeStudent('${student.name}')">Remove</button>
            </div>
        `;
        studentListDiv.appendChild(row);
    });
}

function addStudent() {
    const name  = document.getElementById("s-name").value.trim();
    const age   = document.getElementById("s-age").value.trim();
    const start = document.getElementById("s-start").value;
    const next  = document.getElementById("s-next").value;

    if(!name || !age || !start || !next) {
        alert("Please fill in all fields.");
        return;
    }

    fetch("/add-student", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, age, date_started: start, next_payment: next })
    })
    .then(res => { if(!res.ok) throw new Error("Server error"); return res.text(); })
    .then(() => {
        document.getElementById("s-name").value  = "";
        document.getElementById("s-age").value   = "";
        document.getElementById("s-start").value = "";
        document.getElementById("s-next").value  = "";
        loadStudents();
    })
    .catch(err => alert("Failed to add student: " + err.message));
}

function toggleEdit(btn, name) {
    const card       = btn.closest(".student-card");
    const editFields = card.querySelector(".edit-fields");
    const isEditing  = editFields.style.display !== "none";

    if(isEditing) {
        // ── SAVE ──
        const newStart = card.querySelector(".s-edit-start").value;
        const newNext  = card.querySelector(".s-edit-next").value;
        if(!newStart || !newNext) { alert("Please fill in both dates."); return; }

        fetch("/update-student", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, date_started: newStart, next_payment: newNext })
        })
        .then(res => { if(!res.ok) return res.text().then(t => { throw new Error(t); }); return res.text(); })
        .then(() => loadStudents())
        .catch(err => alert("Failed to update student: " + err.message));
    } else {
        // ── OPEN EDIT MODE ──
        editFields.style.display = "";
        btn.textContent = "Save";
        btn.classList.add("save-btn");
    }
}

function removeStudent(name) {
    if(!confirm(`Remove student "${name}"?`)) return;
    fetch("/remove-student", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name })
    })
    .then(res => { if(!res.ok) return res.text().then(t => { throw new Error(t); }); return res.text(); })
    .then(() => loadStudents())
    .catch(err => alert("Failed to remove student: " + err.message));
}

// ── Init ───────────────────────────────────────
loadInventory();
loadStudents();