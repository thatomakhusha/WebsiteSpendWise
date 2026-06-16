export function renderGoals(listEl, goals) {
    listEl.innerHTML = "";

    if (goals.length === 0) {
        listEl.innerHTML = `<p style="color:var(--color-text-secondary);font-size:0.875rem;padding:20px 0">No goals found.</p>`;
        return;
    }

    goals.forEach((gx) => {
        const percent = Math.min((gx.savedAmount / gx.targetAmount) * 100, 100).toFixed(0);
        const div = document.createElement("div");
        div.classList.add("goals-card");
        div.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
                <strong style="font-size:1rem">${gx.name}</strong>
                <span style="color:#1a7a3a;font-weight:600;font-size:0.875rem">${percent}%</span>
            </div>
            <div style="background:var(--color-border-hr);border-radius:4px;height:7px;margin-bottom:10px">
                <div style="width:${percent}%;background:#1a7a3a;height:7px;border-radius:4px"></div>
            </div>
            <div style="display:flex;justify-content:space-between;font-size:0.8rem;color:var(--color-text-secondary);margin-bottom:4px">
                <span>R${gx.savedAmount} saved</span>
                <span>Goal: R${gx.targetAmount}</span>
            </div>
            <div style="font-size:0.78rem;color:var(--color-text-secondary);margin-bottom:12px">
                Target date: ${gx.targetDate}
            </div>
            <div style="display:flex;gap:6px">
                <button onclick="editGoal('${gx.id}')" style="background:var(--color-hover-secondary);border:1px solid var(--color-border-hr);border-radius:6px;padding:4px 10px;cursor:pointer;font-size:0.78rem;color:var(--color-text-primary)">
                    <span class="material-symbols-rounded" style="font-size:13px;vertical-align:middle">edit</span> Edit
                </button>
                <button onclick="deleteGoal('${gx.id}')" style="background:#fdf0ee;border:1px solid #f5c6c0;border-radius:6px;padding:4px 10px;cursor:pointer;font-size:0.78rem;color:#c0392b">
                    <span class="material-symbols-rounded" style="font-size:13px;vertical-align:middle">delete</span> Delete
                </button>
            </div>
        `;
        listEl.appendChild(div);
    });

    const dashed = document.createElement("button");
    dashed.className = "dashed-add-card";
    dashed.onclick = () => document.getElementById("openGoalsFormBtn").click();
    dashed.innerHTML = `
        <span class="material-symbols-rounded" style="font-size:1.2rem">add</span>
        Add a new goal
    `;
    listEl.appendChild(dashed);
}