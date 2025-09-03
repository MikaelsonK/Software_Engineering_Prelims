// shortcut to get element by id
const $id = (id) => document.getElementById(id);

// main elements
const amountInput = $id('amount_input');
const sortBySelect = $id('sort_by');
const bodyContainer = $id('body');

// API details
const apiUrl = 'https://randomuser.me/api/';
const maxUsers = 1000;
const minUsers = 0;
const timeout = 3000;

// where we store all users
let currentUsers = [];
// track which user is selected
let selectedUserIndex = null;

// press enter in input = generate users
amountInput.addEventListener('keypress', async (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    await generateUsers();
  }
});

// when sorting changes, show users again
sortBySelect.addEventListener('change', () => {
  if (currentUsers.length > 0) renderUsers(currentUsers, sortBySelect.value);
});

// generate user list
async function generateUsers() {
  const count = Number(amountInput.value.trim());
  const nameDisplay = sortBySelect.value;

  if (!validateInput(count)) return;

  if (count === 0) {
    clearUserRows();
    showTempMessage('No users to generate.', 'info');
    return;
  }

  clearUserRows();

  try {
    const users = await fetchRandomUsers(count);
    displayNewUsers(users, nameDisplay);
  } catch (error) {
    showTempMessage(error.message, 'danger');
  }
}

// get random users from API
async function fetchRandomUsers(count) {
  try {
    const response = await fetch(`${apiUrl}?results=${count}`);
    if (!response.ok) throw new Error('Failed to fetch data from API.');
    const data = await response.json();
    if (!data.results || !Array.isArray(data.results)) throw new Error('Invalid API response.');
    return data.results;
  } catch (error) {
    if (error.message === 'Failed to fetch') {
      throw new Error('Network error: Please check your internet connection.');
    }
    throw error;
  }
}

// show users in rows
function renderUsers(users, nameDisplay) {
  clearUserRows();

  users.forEach((user, index) => {
    const rowDiv = document.createElement('div');
    rowDiv.className = 'row mb-2 user-row';
    rowDiv.style.cursor = 'pointer';

    // pick first or last name
    const nameCol = document.createElement('div');
    nameCol.className = 'col-md-3 text-center';
    nameCol.textContent = (nameDisplay === 'first_name') ? user.name.first : user.name.last;

    const genderCol = document.createElement('div');
    genderCol.className = 'col-md-3 text-center';
    genderCol.textContent = capitalizeFirst(user.gender);

    const emailCol = document.createElement('div');
    emailCol.className = 'col-md-3 text-center text-truncate';
    emailCol.textContent = user.email;

    const countryCol = document.createElement('div');
    countryCol.className = 'col-md-3 text-center';
    countryCol.textContent = user.location.country;

    rowDiv.append(nameCol, genderCol, emailCol, countryCol);

    // double click opens modal
    rowDiv.addEventListener('dblclick', () => openUserModal(index));

    bodyContainer.appendChild(rowDiv);
  });
}

// keep users and show them
function displayNewUsers(users, nameDisplay) {
  currentUsers = users;
  renderUsers(currentUsers, nameDisplay);
}

// small alert box for info/errors
function showTempMessage(message, type) {
  clearUserRows();
  const msgDiv = document.createElement('div');
  msgDiv.className = `alert alert-${type} text-center`;
  msgDiv.innerText = message;
  bodyContainer.parentElement.insertBefore(msgDiv, bodyContainer);
  setTimeout(() => msgDiv.remove(), timeout);
}

// check if input is okay
function validateInput(amount) {
  if (Number.isNaN(amount) || amount === '') {
    showTempMessage('Please enter a valid number.', 'danger');
    return false;
  }
  if (amount < minUsers || amount > maxUsers) {
    showTempMessage(`Please enter a number between ${minUsers} and ${maxUsers}.`, 'danger');
    return false;
  }
  return true;
}

// capitalize first letter
function capitalizeFirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// remove all user rows
function clearUserRows() {
  while (bodyContainer.children.length > 1) {
    bodyContainer.removeChild(bodyContainer.lastChild);
  }
}

// modal elements
const userModal = new bootstrap.Modal($id('userModal'));
const userPicture = $id('user-picture');
const userFullname = $id('user-fullname');
const userEmail = $id('user-email');
const userPhone = $id('user-phone');
const userCell = $id('user-cell');
const userDob = $id('user-dob');
const userGender = $id('user-gender');
const userAddress = $id('user-address');
const deleteBtn = $id('deleteUserBtn');
const editBtn = $id('editUserBtn');

// open modal and show user info
function openUserModal(index) {
  selectedUserIndex = index;
  const user = currentUsers[index];

  userPicture.src = user.picture.large;
  userFullname.textContent = `${capitalizeFirst(user.name.title)} ${capitalizeFirst(user.name.first)} ${capitalizeFirst(user.name.last)}`;
  userEmail.textContent = user.email;
  userPhone.textContent = user.phone;
  userCell.textContent = user.cell;
  userDob.textContent = new Date(user.dob.date).toLocaleDateString();
  userGender.textContent = capitalizeFirst(user.gender);
  userAddress.textContent = `${user.location.street.number} ${user.location.street.name}, ${user.location.city}, ${user.location.state}, ${user.location.country}, ${user.location.postcode}`;

  userModal.show();
}

// delete user
deleteBtn.addEventListener('click', () => {
  if (selectedUserIndex !== null) {
    currentUsers.splice(selectedUserIndex, 1);
    renderUsers(currentUsers, sortBySelect.value);
    userModal.hide();
  }
});

// edit user
editBtn.addEventListener('click', () => {
  if (selectedUserIndex !== null) {
    const user = currentUsers[selectedUserIndex];

    // Edit name
    const newFirstName = prompt('Edit First Name:', user.name.first);
    const newLastName = prompt('Edit Last Name:', user.name.last);
    if (newFirstName) user.name.first = newFirstName;
    if (newLastName) user.name.last = newLastName;

    // Edit email
    const newEmail = prompt('Edit Email:', user.email);
    if (newEmail) user.email = newEmail;

    // Edit phone
    const newPhone = prompt('Edit Phone:', user.phone);
    if (newPhone) user.phone = newPhone;

    // Edit cell
    const newCell = prompt('Edit Cell:', user.cell);
    if (newCell) user.cell = newCell;

    // Edit DOB
    const newDob = prompt('Edit Date of Birth (YYYY-MM-DD):', user.dob.date.slice(0,10));
    if (newDob) user.dob.date = newDob;

    // Edit gender
    const newGender = prompt('Edit Gender:', user.gender);
    if (newGender) user.gender = newGender;

    // Edit address
    const newStreetNumber = prompt('Edit Street Number:', user.location.street.number);
    const newStreetName = prompt('Edit Street Name:', user.location.street.name);
    const newCity = prompt('Edit City:', user.location.city);
    const newState = prompt('Edit State:', user.location.state);
    const newCountry = prompt('Edit Country:', user.location.country);
    const newPostcode = prompt('Edit Postcode:', user.location.postcode);

    if (newStreetNumber) user.location.street.number = newStreetNumber;
    if (newStreetName) user.location.street.name = newStreetName;
    if (newCity) user.location.city = newCity;
    if (newState) user.location.state = newState;
    if (newCountry) user.location.country = newCountry;
    if (newPostcode) user.location.postcode = newPostcode;

    renderUsers(currentUsers, sortBySelect.value);
    openUserModal(selectedUserIndex);
  }
});
