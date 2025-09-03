const userCountInput = document.getElementById('userCount');
const nameTypeSelector = document.getElementById('nameTypeSelector');
const usersList = document.getElementById('usersList');
const errorMessage = document.getElementById('errorMessage');

const userModal = new bootstrap.Modal(document.getElementById('userModal'));
const modalUserName = document.getElementById('modalUserName');
const modalUserAddress = document.getElementById('modalUserAddress');
const modalUserEmail = document.getElementById('modalUserEmail');
const modalUserImage = document.getElementById('modalUserImage');
const modalUserPhone = document.getElementById('modalUserPhone');

const editUserName = document.getElementById('editUserName');
const editUserAddress = document.getElementById('editUserAddress');
const editUserEmail = document.getElementById('editUserEmail');
const editUserPhone = document.getElementById('editUserPhone');

const editButton = document.getElementById('editButton');
const deleteButton = document.getElementById('deleteButton');
const saveButton = document.getElementById('saveButton');
const cancelButton = document.getElementById('cancelButton');

document.addEventListener('DOMContentLoaded', function() {
    let currentUsers = [];
    let nameType = 'first';
    let currentUserIndex = -1;
    
    nameTypeSelector.addEventListener('change', function() {
        nameType = this.value;
        showUsers(currentUsers);
    });

    userCountInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            const value = parseInt(userCountInput.value);
            
            if (isNaN(value) || value < 0 || value > 1000) {
                showError('Please enter a number between 0 and 1000');
                return;
            }
            
            getUsers();
        }
    });

    editButton.addEventListener('click', function() {
        enableEditMode();
    });

    deleteButton.addEventListener('click', function() {
        deleteUser(currentUserIndex);
        userModal.hide();
    });

    saveButton.addEventListener('click', function() {
        saveUserChanges(currentUserIndex);
        userModal.hide();
    });

    cancelButton.addEventListener('click', function() {
        disableEditMode();
        showUserDetails(currentUsers[currentUserIndex]);
    });

    function getUsers() {
        const count = parseInt(userCountInput.value);

        if (isNaN(count) || count < 0 || count > 1000) {
            showError('Please enter a number between 0 and 1000');
            return;
        }

        if (count === 0) {
            usersList.innerHTML = '';
            currentUsers = [];
            hideError();
            return;
        }
            
        fetch(`https://randomuser.me/api/?results=${count}`)
            .then(response => response.json())
            .then(data => {
                currentUsers = data.results;
                showUsers(currentUsers);
                hideError();
            })
            .catch(error => {
                showError('Failed to fetch users. Please try again.');
                console.log('Error fetching users:', error);
            });
    }

    function showUsers(users) {
        usersList.innerHTML = '';

        for (let i = 0; i < users.length; i++) {
            const user = users[i];
            const name = nameType === 'first' ? user.name.first : user.name.last;

            const userDiv = document.createElement('div');
            userDiv.className = 'user-row';
            userDiv.setAttribute('index-data', i);

            userDiv.innerHTML = `
                <div>${name}</div>
                <div>${user.gender.slice(0,1).toUpperCase() + user.gender.slice(1).toLowerCase()}</div>
                <div>${user.email}</div>
                <div>${user.location.country}</div>
            `;

            userDiv.addEventListener('click', function() {
                currentUserIndex = parseInt(this.getAttribute('index-data'));
                showUserDetails(user);
                userModal.show();
            });
            usersList.appendChild(userDiv);
        }
    }
    
    function showUserDetails(user) {
        const address = user.editedAddress || 
            (user.location.street.number + ' ' + 
            user.location.street.name + ', ' + 
            user.location.city + ', ' + 
            user.location.state + ' ' + 
            user.location.postcode + ', ' + 
            user.location.country);

        modalUserName.textContent = user.name.title + ' ' + user.name.first + ' ' + user.name.last;
        modalUserAddress.textContent = address;
        modalUserEmail.textContent = user.email;
        modalUserPhone.textContent = user.phone;
        modalUserImage.src = user.picture.large;

        editUserName.value = user.name.title + ' ' + user.name.first + ' ' + user.name.last;
        editUserAddress.value = address;
        editUserEmail.value = user.email;
        editUserPhone.value = user.phone;

        disableEditMode();
    }

    function enableEditMode() {
        const viewMode = document.querySelector('.view-mode');
        const editMode = document.querySelector('.edit-mode');
        
        if (viewMode) viewMode.style.display = 'none';
        if (editMode) editMode.style.display = 'block';
        if (editButton) editButton.style.display = 'none';
        if (deleteButton) deleteButton.style.display = 'none';
        if (saveButton) saveButton.style.display = 'block';
        if (cancelButton) cancelButton.style.display = 'block';
    }

    function disableEditMode() {
        const viewMode = document.querySelector('.view-mode');
        const editMode = document.querySelector('.edit-mode');
        
        if (viewMode) viewMode.style.display = 'block';
        if (editMode) editMode.style.display = 'none';
        if (editButton) editButton.style.display = 'block';
        if (deleteButton) deleteButton.style.display = 'block';
        if (saveButton) saveButton.style.display = 'none';
        if (cancelButton) cancelButton.style.display = 'none';
    }

    function deleteUser(index) {
        if (index < 0 || index >= currentUsers.length) {
            return;
        };
    
        currentUsers.splice(index, 1);
        showUsers(currentUsers);
    }

    function saveUserChanges(index) {
        if (index < 0 || index >= currentUsers.length) {
            return;
        };
        
        const user = currentUsers[index];
    
        const editedName = editUserName.value.split(' ');
        if (editedName.length >= 3) {
            user.name.title = editedName[0];
            user.name.first = editedName[1];
            user.name.last = editedName.slice(2).join(' ');
        } else if (editedName.length === 2) {
            user.name.first = editedName[0];
            user.name.last = editedName[1];
        } else if (editedName.length === 1) {
            user.name.first = editedName[0];
            user.name.last = ''; 
        }
        
        user.email = editUserEmail.value;
        user.phone = editUserPhone.value;
        user.editedAddress = editUserAddress.value;

        showUsers(currentUsers);
    }

    function showError(message) {
        if (errorMessage) {
            errorMessage.textContent = message;
            errorMessage.classList.remove('d-none');
        }
    }

    function hideError() {
        if (errorMessage) {
            errorMessage.classList.add('d-none');
        }
    }

    try {
        getUsers();
    } catch (error) {
        console.error('Initialization error:', error);
    }
});