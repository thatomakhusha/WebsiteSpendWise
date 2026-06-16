export function getTotals(transactions) {
    let income = 0;
    let expense = 0;

    for (const tx of transactions) {
        if (tx.type === "income") {
            income += tx.amount;
        } else {
            expense += tx.amount;
        }
    }

    return {
        income,
        expense,
        balance: income - expense
    };
}