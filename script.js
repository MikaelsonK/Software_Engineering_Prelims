const $id = (id) => document.getElementById(id);

const amountInput = $id('amount_input');
const sortBySelect = $id('sort_by');
const bodyContainer = $id('body');

const apiUrl = 'https://randomuser.me/api/';
const maxUsers = 1000;
const minUsers = 0;
const timeout = 3000; // 3 seconds


let currentUsers;  //  store fetched users for name switching functionality and deleting a user

// Main event listeners
amountInput.addEventListener('keypress', async (event) => {
    if (event.key === 'Enter') {
        event.preventDefault();
        await generateUsers();
    }
});
sortBySelect.addEventListener('change', (event) => {
    if (currentUsers.length > 0) {
        event.preventDefault();
        renderUsers(currentUsers, sortBySelect.value);
    }
});

// Main function 
async function generateUsers() {
    const count = Number(amountInput.value.trim());
    const nameDisplay = sortBySelect.value;

    if (!validateInput(count)) return;

    if (count === 0) {
        clearUserRows();
        // Show no users message
        const noUserDiv = document.createElement('div');
        noUserDiv.className = 'alert alert-info text-center';
        noUserDiv.innerText = 'No users to generate.';
        bodyContainer.parentElement.insertBefore(noUserDiv, bodyContainer);
        setTimeout(() => {
            noUserDiv.remove();
        }, timeout)
        return;
    }

    clearUserRows();

    try {
        const users = await fetchRandomUsers(count);
        displayNewUsers(users, nameDisplay);
    } 
    catch (error) {
        showError(error.message);
    }
}

// delete a user from row at the click of the delete user button
function deleteUserFromList(list, user){
    const index = list.findIndex(u => u.name.title + " " + u.name.first + " " + u.name.last === user);
    if (index !== -1) {
        list.splice(index, 1);
        renderUsers(list, sortBySelect.value);
    }
}

// Fetch random users from API with error handling
async function fetchRandomUsers(count) {
    try {
        const response = await fetch(`${apiUrl}?results=${count}`);
        const data = await response.json();

        if (!data.results || !Array.isArray(data.results)) {
            throw new Error('Invalid API response.');
        }

        return data.results;
    } 
    catch (error) {
        if (error.message === 'Failed to fetch') {
            throw new Error('Network error: Please check your internet connection.');
        } 
        else {
            throw error;
        }
    }
}
// Display users
function renderUsers(users, nameDisplay) {
    clearUserRows();  // Remove existing rows


    users.forEach(user => {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'row mb-2';
        
        function prefill(){
            // Pre-fill edit modal fields
            $id('editTitle').value = user.name.title;
            $id('editFirstName').value = user.name.first;
            $id('editLastName').value = user.name.last;
            $id('editAddress').value = `${user.location.street.number} ${user.location.street.name}, ${user.location.city}, ${user.location.state}, ${user.location.country}, ${user.location.postcode}`;
            $id('editCountry').value = user.location.country;
            $id('editEmail').value = user.email;
            $id('editPhone').value = user.phone;
            $id('editTelephone').value = user.cell;
            $id('editDob').value = user.dob.date;
            $id('editGender').value = user.gender;
            
        }

        // add modal toggling to each row
        const separateModal = new bootstrap.Modal($id('userDescriptionModal'));
        // modal to edit user information
        const editUserModal = new bootstrap.Modal($id("editUserDescModal"));

        // Open modal on double-click, complete with user information and edit functionality
        rowDiv.addEventListener('dblclick', (event) => {
            event.preventDefault();
            
            // Populate display modal
            $id('initials').textContent = user.name.first.charAt(0) + user.name.last.charAt(0);
            $id('modalName').textContent = user.name.title + " " + user.name.first + " " + user.name.last;
            $id('modalAddress').textContent = user.location.fullAddress || (
                user.location.street.number + " " + user.location.street.name + ", " +
                user.location.city + ", " + user.location.state + ", " +
                user.location.country + ", " + user.location.postcode
            );
            $id('modalEmail').textContent = user.email;
            $id('modalPhone').textContent = user.phone;
            $id('modalTelephone').textContent = user.cell;
            $id('modalDob').textContent = user.dob.date;
            $id('modalGender').textContent = capitalizeFirstLetter(user.gender);
            
            // Buttons for the description modal

            const deleteUserButton = $id('deleteUser');
            deleteUserButton.addEventListener('click', (event) => {
                    event.preventDefault();
                    deleteUserFromList(currentUsers, $id('modalName').textContent);
                    separateModal.hide();
                })
            
            
            const modifyUserButton = $id('modifyUser');
            modifyUserButton.onclick = () => { // new button functionality to minimize code
                separateModal.hide();
                prefill();
                editUserModal.show();
            }

            // Buttons for the edit modal
            const cancelButton = $id('cancel');
            cancelButton.onclick = () => {

                $id('editTitle').value = null;
                $id('editFirstName').value = null;
                $id('editLastName').value = null;
                $id('editAddress').value = null;
                $id('editEmail').value = null;
                $id('editPhone').value = null;
                $id('editTelephone').value = null;
                $id('editDob').value = null;
                $id('editGender').value = null;
        
                
                editUserModal.hide();
                separateModal.show();
            }

            // save changes, leave as is for no new data
            const saveButton = $id('save');
            saveButton.onclick = () => {
                if ($id('editTitle').value) user.name.title = $id('editTitle').value;
                if ($id('editFirstName').value) user.name.first = $id('editFirstName').value;
                if ($id('editLastName').value) user.name.last = $id('editLastName').value;
                if ($id('editAddress').value) user.location.fullAddress = $id('editAddress').value;
                if ($id('editCountry').value) user.location.country = $id('editCountry').value;
                if ($id('editEmail').value) user.email = $id('editEmail').value;
                if ($id('editPhone').value) user.phone = $id('editPhone').value;
                if ($id('editTelephone').value) user.cell = $id('editTelephone').value;
                if ($id('editDob').value) user.dob.date = $id('editDob').value;
                if ($id('editGender').value) user.gender = $id('editGender').value;

                renderUsers(currentUsers, sortBySelect.value);
                editUserModal.hide();
            };
            
            separateModal.show();
        });

        const nameCol = document.createElement('div');
        nameCol.className = 'col-md-3 text-center';
        const displayName = (nameDisplay === 'first_name') ? user.name.first : user.name.last;
        nameCol.textContent = displayName;
    
        const genderCol = document.createElement('div');
        genderCol.className = 'col-md-3 text-center';
        genderCol.textContent = capitalizeFirstLetter(user.gender);

        const emailCol = document.createElement('div');
        emailCol.className = 'col-md-3 text-center text-truncate';
        emailCol.textContent = user.email;

        const countryCol = document.createElement('div');
        countryCol.className = 'col-md-3 text-center';
        countryCol.textContent = user.location.country;


        rowDiv.appendChild(nameCol);
        rowDiv.appendChild(genderCol);
        rowDiv.appendChild(emailCol);
        rowDiv.appendChild(countryCol);

        bodyContainer.appendChild(rowDiv);
    });
}
function displayNewUsers(users, nameDisplay) {
    currentUsers = users;  // assign and store users for name sorting
    renderUsers(currentUsers, nameDisplay);
}

// Show error alert as a div element for three seconds
function showError(message) {
    clearUserRows();

    const errorDiv = document.createElement('div');
    errorDiv.className = 'alert alert-danger text-center';
    errorDiv.innerText = message;
    bodyContainer.parentElement.insertBefore(errorDiv, bodyContainer);
    setTimeout(() => {
            errorDiv.remove();
        }, timeout)
    return
}
// Validate user input amount
function validateInput(amount) {
    if (isNaN(amount) || amount === '') {
        showError('Please enter a valid number.');
        return false;
    }
    if (amount <= minUsers || amount >= maxUsers) {
        showError(`Please enter a number between ${minUsers} and ${maxUsers}.`);
        return false;
    }
    return true;
}

// Helper function for gender
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Clear previous user results rows except the header row
function clearUserRows() {
    // Remove all rows after the header row
    while (bodyContainer.children.length > 1) {
        bodyContainer.removeChild(bodyContainer.lastChild);
    }
}

