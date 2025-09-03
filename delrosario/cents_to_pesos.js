const cents = prompt("Enter number of cents:");

const centsValue = parseInt(cents);

if (isNaN(centsValue) || centsValue < 0) {
    console.log("Invalid input. Please enter a valid number of cents.");
} else {
    const pesos = centsValue / 100;
    
    const formattedPesos = `₱${pesos.toFixed(2)}`;
    alert(`You have ${formattedPesos} pesos.`);
}