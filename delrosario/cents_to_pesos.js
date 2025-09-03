function convertCentsToPesos() {
    const cents = prompt("Enter number of cents:");
    
    const centsValue = parseInt(cents);
    
    if (isNaN(centsValue) || centsValue < 0) {
        console.log("Invalid input. Please enter a valid number of cents.");
        return;
    }
    
    const pesos = centsValue / 100;
    
    const formattedPesos = `₱${pesos.toFixed(2)}`;
    
    console.log(`You have ${formattedPesos} pesos.`);
}

convertCentsToPesos();