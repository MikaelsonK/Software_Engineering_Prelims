function centsToPesos() {
    const cents = prompt("Enter a number of cents: ");

    const pesos = (cents * 0.01).toFixed(2)

    alert(`You have ₱${pesos} pesos.`);

};

centsToPesos()