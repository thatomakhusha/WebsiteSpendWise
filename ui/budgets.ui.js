const categoryIcons = {
    Food: { icon: "restaurant", color: "#e8f5ec", iconColor: "#1a7a3a" },
    Transport: { icon: "directions_car", color: "#fff8e6", iconColor: "#e09a2a" },
    Rent: { icon: "home", color: "#e8f0fe", iconColor: "#1a56db" },
    Entertainment: { icon: "movie", color: "#fdf0ee", iconColor: "#c0392b" },
    Utilities: { icon: "bolt", color: "#e8f0fe", iconColor: "#1a56db" },
    Education: { icon: "school", color: "#f0e8fe", iconColor: "#7c3aed" },
    Shopping: { icon: "shopping_bag", color: "#fff8e6", iconColor: "#e09a2a" },
    Health: { icon: "favorite", color: "#fdf0ee", iconColor: "#c0392b" },
    Savings: { icon: "savings", color: "#e8f5ec", iconColor: "#1a7a3a" },
};

export function renderBudgets(listEl, budgets, spending = {}) {
    listEl.innerHTML = "";

    if (budgets.length === 0) {
        listEl.innerHTML = `<p style="color:var(--color-text-secondary);font-size:0.875rem;padding:20px 0">No budgets found for this month.</p>`;
        return;
    }

    budgets.forEach((bx) => {
        const spent = spending[bx.category] || 0;
        const percent = Math.min((spent / bx.limit) * 100, 100).toFixed(0);
        const remaining = bx.limit - spent;
        const isOver = spent > bx.limit;
        const isWarn = !isOver && spent / bx.limit > 0.8;
        const barColor = isOver ? "#c0392b" : isWarn ? "#e09a2a" : "#1a7a3a";
        const remainColor = isOver ? "#c0392b" : "#1a7a3a";
        const remainText = isOver
            ? `R${Math.abs(remaining)} over budget`
            : isWarn
            ? `R${remaining} remaining — almost over!`
            : `R${remaining} remaining`;

        const icon = categoryIcons[bx.category] || { icon: "wallet", color: "#e8f5ec", iconColor: "#1a7a3a" };

        const div = document.createElement("div");
        div.classList.add("budgets-card");
        div.innerHTML = `
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:4px">
                <div style="width:36px;height:36px;border-radius:10px;background:${icon.color};display:flex;align-items:center;justify-content:center;flex-shrink:0">
                    <span class="material-symbols-rounded" style="font-size:18px;color:${icon.iconColor}">${icon.icon}</span>
                </div>
                <div>
                    <strong style="font-size:1rem">${bx.category}</strong>
                    <div style="font-size:0.75rem;color:var(--color-text-secondary)">${bx.month}</div>
                </div>
            </div>
            <div style="background:var(--color-border-hr);border-radius:4px;height:7px;margin-bottom:8px">
                <div style="width:${percent}%;background:${barColor};height:7px;border-radius:4px;transition:width 0.3s"></div>
            </div>
            <div style="display:flex;justify-content:space-between;font-size:0.8rem;color:var(--color-text-secondary);margin-bottom:4px">
                <span>R${spent} spent</span>
                <span style="color:var(--color-text-primary);font-weight:500">R${bx.limit} limit</span>
            </div>
            <div style="font-size:0.78rem;color:${remainColor};font-weight:500;margin-bottom:10px">${remainText}</div>
            <div style="display:flex;gap:6px">
                <button onclick="editBudget('${bx.id}')" style="background:var(--color-hover-secondary);border:1px solid var(--color-border-hr);border-radius:6px;padding:4px 10px;cursor:pointer;font-size:0.78rem;color:var(--color-text-primary)">
                    <span class="material-symbols-rounded" style="font-size:13px;vertical-align:middle">edit</span> Edit
                </button>
                <button onclick="deleteBudget('${bx.id}')" style="background:#fdf0ee;border:1px solid #f5c6c0;border-radius:6px;padding:4px 10px;cursor:pointer;font-size:0.78rem;color:#c0392b">
                    <span class="material-symbols-rounded" style="font-size:13px;vertical-align:middle">delete</span> Delete
                </button>
            </div>
        `;
        listEl.appendChild(div);
    });

    const dashed = document.createElement("button");
    dashed.className = "dashed-add-card";
    dashed.onclick = () => document.getElementById("openBudgetsFormBtn").click();
    dashed.innerHTML = `
        <span class="material-symbols-rounded" style="font-size:1.2rem">add</span>
        Add another budget category
    `;
    listEl.appendChild(dashed);
}