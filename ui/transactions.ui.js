export function renderTransactions(listEl, transactions) {
    listEl.innerHTML = "";

    if (transactions.length === 0) {
        listEl.innerHTML = `<p style="color:var(--color-text-secondary);font-size:0.875rem;padding:20px 0">No transactions found.</p>`;
        return;
    }

    const table = document.createElement("table");
    table.className = "transactions-table";
    table.style.width = "100%";

    table.innerHTML = `
        <thead>
            <tr>
                <th style="width:48px"></th>
                <th>Description</th>
                <th>Category</th>
                <th>Type</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody id="txBody"></tbody>
    `;

    const tbody = table.querySelector("#txBody");

    transactions.forEach(tx => {
        const isIncome = tx.type === "income";
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>
                <div style="width:34px;height:34px;border-radius:50%;background:${isIncome ? '#e8f5ec' : '#fdf0ee'};display:flex;align-items:center;justify-content:center;">
                    <span class="material-symbols-rounded" style="font-size:16px;color:${isIncome ? '#1a7a3a' : '#c0392b'}">
                        ${isIncome ? 'arrow_downward' : 'arrow_upward'}
                    </span>
                </div>
            </td>
            <td style="font-weight:500">${tx.description}</td>
            <td><span style="background:var(--color-hover-secondary);padding:3px 10px;border-radius:20px;font-size:0.75rem;color:var(--color-text-primary)">${tx.category}</span></td>
            <td style="font-size:0.82rem;color:${isIncome ? '#1a7a3a' : '#c0392b'};font-weight:500">${isIncome ? 'Income' : 'Expense'}</td>
            <td style="font-size:0.82rem;color:var(--color-text-secondary)">${tx.date}</td>
            <td style="font-weight:600;color:${isIncome ? '#1a7a3a' : '#c0392b'}">${isIncome ? '+' : '-'}R${tx.amount}</td>
            <td>
                <button onclick="editTransaction('${tx.id}')" style="background:var(--color-hover-secondary);border:1px solid var(--color-border-hr);border-radius:6px;padding:4px 8px;cursor:pointer;margin-right:4px">
                    <span class="material-symbols-rounded" style="font-size:14px;vertical-align:middle">edit</span>
                </button>
                <button onclick="deleteTransaction('${tx.id}')" style="background:#fdf0ee;border:1px solid #f5c6c0;border-radius:6px;padding:4px 8px;cursor:pointer;color:#c0392b">
                    <span class="material-symbols-rounded" style="font-size:14px;vertical-align:middle">delete</span>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });

    const wrapper = document.createElement("div");
    wrapper.className = "table-card";
    wrapper.appendChild(table);
    listEl.appendChild(wrapper);
}