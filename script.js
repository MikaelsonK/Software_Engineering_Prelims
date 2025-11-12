const userForm = document.getElementById('userForm'); // input number
const quantityInput = document.getElementById('quantityInput'); //number picker thing
const messageElement = document.getElementById('messageElement'); // error
const outputContainer = document.getElementById('outputContainer'); //table
const nameSelector = document.getElementById('nameSelector'); // first name last name

let userData = [];
let currentIndex = null; // for modal

function showMessage(text) { // error messages
    messageElement.textContent = text;
    messageElement.classList.toggle('d-none', !text);
}

function updateDisplay() { // user list table
    outputContainer.innerHTML = '';
    const selectedNameType = nameSelector.value; // first name last name
    userData.forEach((item, index) => {
        outputContainer.innerHTML += `
        <div class="row text-center user-row" data-index="${index}">
        <div class="col">${item.name[selectedNameType]}</div>
        <div class="col">${item.gender}</div>
        <div class="col">${item.email}</div>
        <div class="col">${item.location.country}</div>
        </div>`;
    });

    document.querySelectorAll('.user-row').forEach(row => { // modal double click
        row.addEventListener('dblclick', () => {
            currentIndex = row.getAttribute('data-index'); // kung ano nga index pra sa user
            openModal(userData[currentIndex], true); // open modal
        });
    });
}

function openModal(user, show = false) { // modal user info
    document.getElementById('modalPicture').src = user.picture.large;
    document.getElementById('modalName').textContent =
    `${user.name.title} ${user.name.first} ${user.name.last}`;
    document.getElementById('modalAddress').textContent =
    `${user.location.street.number} ${user.location.street.name}, ${user.location.city}, ${user.location.state}, ${user.location.country}, ${user.location.postcode}`;
    document.getElementById('modalEmail').textContent = user.email;
    document.getElementById('modalPhone').textContent = user.phone;
    document.getElementById('modalCell').textContent = user.cell;
    document.getElementById('modalDob').textContent = new Date(user.dob.date).toLocaleDateString();
    document.getElementById('modalGender').textContent = user.gender;

    if (show) {
        const modal = new bootstrap.Modal(document.getElementById('userModal'));
        modal.show();
    }
}

document.getElementById('deleteUser').addEventListener('click', () => { // delete user
    if (currentIndex !== null) {
        userData.splice(currentIndex, 1);
        updateDisplay();
        bootstrap.Modal.getInstance(document.getElementById('userModal')).hide();
    }
});

document.querySelectorAll('.edit-pill').forEach(btn => { // edit btn for each info
    btn.addEventListener('click', () => {
        if (currentIndex === null) return;
        const field = btn.getAttribute('data-field');
        const user = userData[currentIndex];

        let currentVal = "";
        if (field === "name") {
            currentVal = `${user.name.title} ${user.name.first} ${user.name.last}`;
        } else if (field === "address") {
            currentVal = `${user.location.street.number} ${user.location.street.name}, ${user.location.city}, ${user.location.state}, ${user.location.country}, ${user.location.postcode}`;
        } else if (field === "dob") {
            currentVal = new Date(user.dob.date).toISOString().split("T")[0]; // YYYY-MM-DD (ex"1993-07-20T09:44:18.674Z")
        } else {
            currentVal = user[field];
        }

        if (field === "name") { // name editing
            const newVal = prompt(`Edit ${field}:`, currentVal);
            if (!newVal) return;
            const parts = newVal.split(" ");
            user.name.title = parts[0] || user.name.title;

            if (parts.length > 2) {
                user.name.first = parts.slice(1, -1).join(" "); // for 2 word first names
                user.name.last = parts[parts.length - 1] || user.name.last;
            } else {
                user.name.first = parts[1] || user.name.first; // title + last name only
                user.name.last = parts[1] ? "" : user.name.last; // title only
            }
            
        } else if (field === "address") { // edit address, 1 by 1
            const newStreetNumber = prompt("Edit Street Number:", user.location.street.number);
            if (newStreetNumber) user.location.street.number = newStreetNumber;

            const newStreetName = prompt("Edit Street Name:", user.location.street.name);
            if (newStreetName) user.location.street.name = newStreetName;

            const newCity = prompt("Edit City:", user.location.city);
            if (newCity) user.location.city = newCity;

            const newState = prompt("Edit State:", user.location.state);
            if (newState) user.location.state = newState;

            const newCountry = prompt("Edit Country:", user.location.country);
            if (newCountry) user.location.country = newCountry;

            const newPostcode = prompt("Edit Postcode:", user.location.postcode);
            if (newPostcode) user.location.postcode = newPostcode;

        } else if (field === "dob") { // dob editing with check
            const newVal = prompt("Edit Date of Birth (YYYY-MM-DD):", currentVal);
            if (!newVal) return;

            const parsedDate = new Date(newVal);
            if (!isNaN(parsedDate.getTime())) {
                user.dob.date = parsedDate.toISOString(); // store valid date
            } else {
                alert("Invalid date. Please enter in YYYY-MM-DD format.");
            }
        } else { // other
            const newVal = prompt(`Edit ${field}:`, currentVal);
            if (!newVal) return;
            user[field] = newVal;
        }

        updateDisplay();
        openModal(user, false); // refresh modal content only, don't reopen
    });
});

async function fetchUsers() { // fetch from API
    const count = parseInt(quantityInput.value, 10);
    if (isNaN(count) || count < 1 || count > 1000) {
        showMessage("Enter a number between 1 and 1000.");
        return;
    }
    showMessage('');
    quantityInput.disabled = true;
    quantityInput.placeholder = "Loading...";
    try {
        const response = await fetch(`https://randomuser.me/api/?results=${count}`);
        const result = await response.json();
        userData = result.results;
        updateDisplay();
    } catch {
        showMessage("Failed to fetch users.");
    } finally {
        quantityInput.disabled = false;
        quantityInput.placeholder = "Enter number of random users";
    }
}

userForm.addEventListener('submit', function(e) { // send request
    e.preventDefault();
    fetchUsers();
});

nameSelector.addEventListener('change', updateDisplay); // name type change


const userModalEl = document.getElementById('userModal'); //modal fix
userModalEl.addEventListener('hidden.bs.modal', () => {
    document.body.classList.remove('modal-open');
    const backdrops = document.querySelectorAll('.modal-backdrop');
    backdrops.forEach(b => b.remove());
});