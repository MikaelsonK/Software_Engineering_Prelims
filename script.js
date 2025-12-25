let currentData = [];
let currentEditingIndex = -1;
let originalUserData = {};

function fetchUsers() {
    const count = document.getElementById('userCount').value;
    const userRows = document.getElementById('userRows');
    
    if (!count || count < 1 || count > 1000) return;

    userRows.innerHTML = `
        <div class="loading-text">Loading users...</div>
    `;

    fetch(`https://randomuser.me/api/?results=${count}`)
        .then(response => response.json())
        .then(data => {
            currentData = data.results;
            displayUsers();
        })
        .catch(error => {
            userRows.innerHTML = `
                <div class="error-text">
                    Error loading users. Please try again.
                </div>
            `;
        });
}

function displayUsers() {
    const nameSelect = document.getElementById('nameSelect').value;
    const userRows = document.getElementById('userRows');
    
    if (currentData.length === 0) {
        userRows.innerHTML = '';
        return;
    }
    
    userRows.innerHTML = currentData.map((user, index) => {
        const name = nameSelect === 'first' ? user.name.first : user.name.last;
        const gender = user.gender.charAt(0).toUpperCase() + user.gender.slice(1);
        return `
            <div class="row user-data-row" data-user-index="${index}" ondblclick="openUserModal(${index})">
                <div class="col-3">
                    <div class="user-row text-center">${name}</div>
                </div>
                <div class="col-3">
                    <div class="user-row text-center">${gender}</div>
                </div>
                <div class="col-3">
                    <div class="user-row text-center">
                        <span style="word-break: break-all;">${user.email}</span>
                    </div>
                </div>
                <div class="col-3">
                    <div class="user-row text-center">${user.location.country}</div>
                </div>
            </div>
        `;
    }).join('');
}

function openUserModal(index) {
    currentEditingIndex = index;
    const user = currentData[index];
    
    originalUserData = JSON.parse(JSON.stringify(user));
    document.getElementById('userPhoto').src = user.picture.large;
    document.getElementById('userTitle').value = user.name.title;
    document.getElementById('userFirstName').value = user.name.first;
    document.getElementById('userLastName').value = user.name.last;
    document.getElementById('userEmail').value = user.email;
    document.getElementById('userGender').value = user.gender;
    document.getElementById('userPhone').value = user.phone;
    document.getElementById('userCell').value = user.cell;
    document.getElementById('userDob').value = user.dob.date.split('T')[0];
    
    const address = `${user.location.street.number} ${user.location.street.name}\n${user.location.city}, ${user.location.state} ${user.location.postcode}\n${user.location.country}`;
    document.getElementById('userAddress').value = address;
    
    new bootstrap.Modal(document.getElementById('userModal')).show();
}

function toggleEditMode() {
    const formElements = document.querySelectorAll('#userForm input, #userForm select, #userForm textarea');
    const editBtn = document.getElementById('editBtn');
    const saveBtn = document.getElementById('saveBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    
    formElements.forEach(element => {
        if (element.id !== 'userPhoto') {
            element.removeAttribute('readonly');
            element.removeAttribute('disabled');
        }
    });
    
    editBtn.classList.add('d-none');
    saveBtn.classList.remove('d-none');
    cancelBtn.classList.remove('d-none');
}

function saveUser() {
    const user = currentData[currentEditingIndex];
    
    user.name.title = document.getElementById('userTitle').value;
    user.name.first = document.getElementById('userFirstName').value;
    user.name.last = document.getElementById('userLastName').value;
    user.email = document.getElementById('userEmail').value;
    user.gender = document.getElementById('userGender').value;
    user.phone = document.getElementById('userPhone').value;
    user.cell = document.getElementById('userCell').value;
    user.dob.date = document.getElementById('userDob').value + 'T00:00:00.000Z';
    
    const addressLines = document.getElementById('userAddress').value.split('\n');
    if (addressLines.length >= 2) {
        const streetParts = addressLines[0].split(' ');
        user.location.street.number = streetParts[0] || '';
        user.location.street.name = streetParts.slice(1).join(' ') || '';
        
        const cityStateParts = addressLines[1].split(', ');
        if (cityStateParts.length >= 2) {
            user.location.city = cityStateParts[0] || '';
            const statePostcode = cityStateParts[1].split(' ');
            user.location.state = statePostcode[0] || '';
            user.location.postcode = statePostcode.slice(1).join(' ') || '';
        }
        
        if (addressLines[2]) {
            user.location.country = addressLines[2];
        }
    }
    displayUsers();
    cancelEdit();
    bootstrap.Modal.getInstance(document.getElementById('userModal')).hide();
}

function cancelEdit() {
    const formElements = document.querySelectorAll('#userForm input, #userForm select, #userForm textarea');
    const editBtn = document.getElementById('editBtn');
    const saveBtn = document.getElementById('saveBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    
    if (currentEditingIndex >= 0) {
        const user = originalUserData;
        document.getElementById('userTitle').value = user.name.title;
        document.getElementById('userFirstName').value = user.name.first;
        document.getElementById('userLastName').value = user.name.last;
        document.getElementById('userEmail').value = user.email;
        document.getElementById('userGender').value = user.gender;
        document.getElementById('userPhone').value = user.phone;
        document.getElementById('userCell').value = user.cell;
        document.getElementById('userDob').value = user.dob.date.split('T')[0];
        
        const address = `${user.location.street.number} ${user.location.street.name}\n${user.location.city}, ${user.location.state} ${user.location.postcode}\n${user.location.country}`;
        document.getElementById('userAddress').value = address;
    }
    
    formElements.forEach(element => {
        element.setAttribute('readonly', true);
        if (element.tagName === 'SELECT') {
            element.setAttribute('disabled', true);
        }
    });
    
    editBtn.classList.remove('d-none');
    saveBtn.classList.add('d-none');
    cancelBtn.classList.add('d-none');
}

function deleteUser() {
    if (currentEditingIndex >= 0) {
        currentData.splice(currentEditingIndex, 1);
        displayUsers();
        bootstrap.Modal.getInstance(document.getElementById('userModal')).hide();
        currentEditingIndex = -1;
    }
}

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('userCount').addEventListener('input', function() {
        const value = parseInt(this.value);
        if (value > 1000) {
            this.value = 1000;
        } else if (value < 0) {
            this.value = '';
        }
        fetchUsers();
    });

    document.getElementById('nameSelect').addEventListener('change', displayUsers);

    // Reset form when modal is closed
    document.getElementById('userModal').addEventListener('hidden.bs.modal', function() {
        cancelEdit();
        currentEditingIndex = -1;
    });

    // Initialize
    fetchUsers();
});