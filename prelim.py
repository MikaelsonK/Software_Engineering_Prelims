def convert_cents_to_pesos():
    print("Welcome to the Cents to Pesos Converter!")
    while True:
        try:
            cents_input = input("Enter number of cents (or 'q' to exit): ")
            
            if cents_input.lower() == 'q':
                print("Goodbye!")
                break

            cents = int(cents_input)
            if cents < 0:
                print("Please enter a valid positive number of cents.")
                continue

            # Convert 
            pesos = cents / 100
            
            # Format 
            print("You have ₱" + str(pesos)+ " pesos")
            
        except ValueError:
            print("Please enter a valid number.\n")

# Runner
#testing comment for git
if __name__ == "__main__":
    convert_cents_to_pesos()