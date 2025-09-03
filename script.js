"use strict";
let currentUsers = [];
let currentNameDisplay = 'first';
let currentEditingIndex = -1;
document.addEventListener('DOMContentLoaded', () => {
    const userCountInput = document.getElementById('userCount');
    const nameDisplaySelect = document.getElementById('nameDisplay');
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            generateUsers();
        }
    };
    const handleNameDisplayChange = () => {
        currentNameDisplay = nameDisplaySelect.value;
        if (currentUsers.length > 0) {
            displayUsers(currentUsers);
        }
    };
    userCountInput.addEventListener('keypress', handleKeyPress);
    nameDisplaySelect.addEventListener('change', handleNameDisplayChange);
    setupModalEvents();
    generateUsers();
});
const fetchUsers = async (count) => {
    const response = await fetch(`https://randomuser.me/api/?results=${count}`);
    if (!response.ok) {
        throw new Error(`API request failed with status: ${response.status}`);
    }
    const data = await response.json();
    return data.results;
};
async function generateUsers() {
    const userCountInput = document.getElementById('userCount');
    const userCount = parseInt(userCountInput.value) || 1;
    const isValidCount = (count) => count >= 1 && count <= 1000;
    if (!isValidCount(userCount)) {
        showError('Please enter a number between 1 and 1000');
        return;
    }
    showLoading();
    hideError();
    try {
        currentUsers = await fetchUsers(userCount);
        displayUsers(currentUsers);
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        showError(`Failed to fetch user data: ${errorMessage}. Please check your internet connection and try again.`);
    }
    finally {
        hideLoading();
    }
}
const createCell = (content, dataLabel) => {
    const cell = document.createElement('div');
    cell.className = 'result-cell';
    cell.textContent = content;
    if (dataLabel) {
        cell.setAttribute('data-label', dataLabel);
    }
    return cell;
};
const getDisplayName = (user) => {
    const nameMapper = {
        first: () => capitalizeFirst(user.name.first),
        last: () => capitalizeFirst(user.name.last)
    };
    return nameMapper[currentNameDisplay]();
};
function displayUsers(users) {
    const usersData = document.getElementById('usersData');
    usersData.innerHTML = '';
    users.forEach((user, index) => {
        const userRow = document.createElement('div');
        userRow.className = 'user-row';
        userRow.style.display = 'contents';
        const nameCell = createCell(getDisplayName(user), 'Name');
        const genderCell = createCell(capitalizeFirst(user.gender), 'Gender');
        const emailCell = createCell(user.email, 'Email');
        const countryCell = createCell(user.location.country, 'Country');
        [nameCell, genderCell, emailCell, countryCell].forEach(cell => {
            cell.addEventListener('dblclick', () => openUserModal(index));
            userRow.appendChild(cell);
        });
        usersData.appendChild(userRow);
    });
}
const showLoading = () => {
    const loadingState = document.getElementById('loadingState');
    loadingState.style.display = 'block';
};
const hideLoading = () => {
    const loadingState = document.getElementById('loadingState');
    loadingState.style.display = 'none';
};
const showError = (message) => {
    const errorDiv = document.getElementById('errorMessage');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
};
const hideError = () => {
    const errorDiv = document.getElementById('errorMessage');
    errorDiv.style.display = 'none';
};
const capitalizeFirst = (str) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
function openUserModal(index) {
    const user = currentUsers[index];
    currentEditingIndex = index;
    const modal = document.getElementById('userModal');
    const modalPicture = document.getElementById('modalPicture');
    const modalName = document.getElementById('modalName');
    const modalAddress = document.getElementById('modalAddress');
    const modalEmail = document.getElementById('modalEmail');
    modalPicture.src = user.picture.large;
    modalName.textContent = `${capitalizeFirst(user.name.first)} ${capitalizeFirst(user.name.last)}`;
    modalAddress.textContent = `${user.location.street.number} ${user.location.street.name}, ${user.location.city}, ${user.location.state}, ${user.location.country}, ${user.location.postcode}`;
    modalEmail.textContent = user.email;
    modal.style.display = 'block';
}
function closeModal() {
    const userModal = document.getElementById('userModal');
    const editModal = document.getElementById('editModal');
    userModal.style.display = 'none';
    editModal.style.display = 'none';
}
function openEditModal() {
    const user = currentUsers[currentEditingIndex];
    const editModal = document.getElementById('editModal');
    const editFirstName = document.getElementById('editFirstName');
    const editLastName = document.getElementById('editLastName');
    const editEmail = document.getElementById('editEmail');
    const editPhone = document.getElementById('editPhone');
    const editCell = document.getElementById('editCell');
    const editGender = document.getElementById('editGender');
    editFirstName.value = user.name.first;
    editLastName.value = user.name.last;
    editEmail.value = user.email;
    editPhone.value = user.phone;
    editCell.value = user.cell;
    editGender.value = user.gender;
    closeModal();
    editModal.style.display = 'block';
}
function saveUser() {
    const editFirstName = document.getElementById('editFirstName');
    const editLastName = document.getElementById('editLastName');
    const editEmail = document.getElementById('editEmail');
    const editPhone = document.getElementById('editPhone');
    const editCell = document.getElementById('editCell');
    const editGender = document.getElementById('editGender');
    if (!editFirstName.value.trim() || !editLastName.value.trim() || !editEmail.value.trim()) {
        alert('Please fill in all required fields (First Name, Last Name, Email)');
        return;
    }
    if (!editEmail.value.includes('@') || !editEmail.value.includes('.')) {
        alert('Please enter a valid email address');
        return;
    }
    currentUsers[currentEditingIndex].name.first = editFirstName.value.trim();
    currentUsers[currentEditingIndex].name.last = editLastName.value.trim();
    currentUsers[currentEditingIndex].email = editEmail.value.trim();
    currentUsers[currentEditingIndex].phone = editPhone.value.trim();
    currentUsers[currentEditingIndex].cell = editCell.value.trim();
    currentUsers[currentEditingIndex].gender = editGender.value;
    closeModal();
    displayUsers(currentUsers);
}
function deleteUser() {
    if (confirm('Are you sure you want to delete this user?')) {
        currentUsers.splice(currentEditingIndex, 1);
        closeModal();
        displayUsers(currentUsers);
    }
}
function setupModalEvents() {
    document.addEventListener('click', (event) => {
        const target = event.target;
        if (target.classList.contains('close') || target.classList.contains('close-edit')) {
            closeModal();
        }
        else if (target.id === 'editBtn') {
            openEditModal();
        }
        else if (target.id === 'deleteBtn') {
            deleteUser();
        }
        else if (target.id === 'saveBtn') {
            saveUser();
        }
        else if (target.id === 'cancelBtn') {
            closeModal();
        }
    });
    window.addEventListener('click', (event) => {
        const userModal = document.getElementById('userModal');
        const editModal = document.getElementById('editModal');
        if (event.target === userModal || event.target === editModal) {
            closeModal();
        }
    });
}
