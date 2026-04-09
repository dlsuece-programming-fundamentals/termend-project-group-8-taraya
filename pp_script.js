let inventoryData = [];
const inventoryDiv = document.getElementById("inventory");
const statsDiv = document.getElementById("stats");
const equipmentOptions = {
    armor: {
        sizes: ["xs","s","m","l","xl","2xl"],
        colors: ["red","blue"]
    },
    headgear: {
        sizes: ["xs","s","m","l","xl"],
        colors: ["red","blue"]
    },
    uniform: {
        sizes: ["100","110","120","130","140","150","160","170","180","190","200","210"],
        colors: ["top","bottom"]
    },
    pad: {
        sizes: [""],
        colors: ["red","blue","black"]
    },
    "arm guards": {
        sizes: [""],
        colors: ["red","blue","black"]
    }
};

function loadInventory(){
    fetch("/equipments")
        .then(res => res.json())
        .then(data => {
            inventoryData = data;
            displayStats(data);
            displayInventory(data);
        });
}

function displayStats(data){
    const counts = {};
    data.forEach(item => {
        if(!counts[item.item]) counts[item.item] = 0;
        counts[item.item]++;
    });
    let html = "<h2>Inventory Summary</h2>";
    for(let item in counts){
        html += `<p>${item}: ${counts[item]}</p>`;
    }
    statsDiv.innerHTML = html;
}

function displayInventory(data){
    inventoryDiv.innerHTML = "";
    data.forEach((equipment, index) => {
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

function filterInventory(){
    const item = document.getElementById("item").value;
    const size = document.getElementById("size").value;
    const color = document.getElementById("color").value;
    const filtered = inventoryData.filter(e => {
        return (!item || e.item === item)
            && (!size || e.size === size)
            && (!color || e.color === color);
    });
    displayInventory(filtered);
}

function updateDropdowns(){
    const item = document.getElementById("item").value;
    const sizeDropdown = document.getElementById("size");
    const colorDropdown = document.getElementById("color");
    sizeDropdown.innerHTML = "";
    colorDropdown.innerHTML = "";
    if(!item){
        sizeDropdown.disabled = true;
        colorDropdown.disabled = true;
        return;
    }
    const sizes = equipmentOptions[item].sizes;
    const colors = equipmentOptions[item].colors;
    sizeDropdown.disabled = false;
    colorDropdown.disabled = false;
    sizes.forEach(size => {
        const option = document.createElement("option");
        option.value = size;
        option.text = size || "N/A";
        sizeDropdown.appendChild(option);
    });
    colors.forEach(color => {
        const option = document.createElement("option");
        option.value = color;
        option.text = color;
        colorDropdown.appendChild(option);
    });
}

// ── ADD EQUIPMENT ──────────────────────────────────────────────
function addEquipment(){
    const item  = document.getElementById("item").value;
    const size  = document.getElementById("size").value;
    const color = document.getElementById("color").value;

    if(!item){
        alert("Please select an item.");
        return;
    }

    fetch("/add-equipment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ item, size, color })
    })
    .then(res => {
        if(!res.ok) throw new Error("Server error");
        return res.text();
    })
    .then(() => {
        loadInventory(); // refresh the display
    })
    .catch(err => alert("Failed to add equipment: " + err.message));
}

// ── REMOVE EQUIPMENT ───────────────────────────────────────────
function removeEquipment(item, size, color, btnEl){
    if(!confirm(`Remove one "${item}" (size: ${size || "N/A"}, color: ${color})?`)) return;

    fetch("/remove-equipment", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ item, size, color })
    })
    .then(res => {
        if(!res.ok) return res.text().then(t => { throw new Error(t); });
        return res.text();
    })
    .then(() => {
        loadInventory(); // refresh the display
    })
    .catch(err => alert("Failed to remove equipment: " + err.message));
}

loadInventory();