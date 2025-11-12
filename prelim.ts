import readline from 'readline';

function convertCentsToPesos(): void {

    const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
    });

    readline.question('Enter number of cents: ', (centsInput: string) => {
        // Convert input to number
        const cents = parseInt(centsInput, 10);
        
        // Validate input
        if (isNaN(cents) || cents < 0) {
            console.log('Please enter a valid positive number of cents.');
            readline.close();
            return;
        }
        
        // Convert cents to pesos
        const pesos = cents / 100;
        
        // Format the output to 2 decimal places
        console.log(`You have ₱${pesos.toFixed(2)} pesos.`);
        
        readline.close();
    });
}

// Run the program
convertCentsToPesos();