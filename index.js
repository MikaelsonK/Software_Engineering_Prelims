const generateButton = document.getElementById('generateButton');
const tableBody = document.getElementById('userTable');
const nameOptionSelect = document.getElementById('nameOption');
const countInput = document.getElementById('userCount');

// Modal elements
const userImage = document.getElementById('userImage');
const modalName = document.getElementById('modalName');
const modalEmail = document.getElementById('modalEmail');
const modalGender = document.getElementById('modalGender');
const modalDob = document.getElementById('modalDob');
const modalPhone = document.getElementById('modalPhone');
const modalAddress = document.getElementById('modalAddress');
const deleteBtn = document.getElementById('deleteUser');
const editBtn = document.getElementById('editUser');
const userModal = new bootstrap.Modal(document.getElementById('userModal'));

// Global users array
let users = [];
let selectedIndex = null;

// Generate users
generateButton.addEventListener('click', async () => {
  const count = Number(countInput.value);
  const nameOption = nameOptionSelect.value;

  tableBody.innerHTML = '';
  if (isNaN(count) || count < 1 || count > 1000) {
    alert("Enter a valid number between 1 and 1000");
    return;
  }

  generateButton.textContent = "Loading...";
  generateButton.disabled = true;

  try {
    const response = await fetch(`https://randomuser.me/api/?results=${count}`);
    const data = await response.json();
    users = data.results;

    renderTable(nameOption);
  } catch (err) {
    alert("Error fetching users.");
    console.error(err);
  } finally {
    generateButton.textContent = "Generate";
    generateButton.disabled = false;
  }
});

// Render table function  refresh after edits
function renderTable(nameOption) {
  tableBody.innerHTML = '';
  if (users.length === 0) {
    tableBody.innerHTML = '<tr><td colspan="4">No users found</td></tr>';
    return;
  }

  users.forEach((user, index) => {
    const row = document.createElement('tr');
    const name =
      nameOption === 'first'
        ? `${user.name.first}`
        : `${user.name.last}`;

    row.innerHTML = `
      <td>${name}</td>
      <td>${user.gender}</td>
      <td>${user.email}</td>
      <td>${user.location.country}</td>
    `;

    row.addEventListener('dblclick', () => openModal(index));
    tableBody.appendChild(row);
  });
}

// React when switching between first/last name
nameOptionSelect.addEventListener('change', () => {
  renderTable(nameOptionSelect.value);
});

// Open modal
function openModal(index) {
  const user = users[index];
  selectedIndex = index;

  userImage.src = user.picture.large;
  modalName.textContent = `${user.name.title} ${user.name.first} ${user.name.last}`;
  modalEmail.textContent = user.email;
  modalGender.textContent = user.gender;
  modalDob.textContent = new Date(user.dob.date).toLocaleDateString();
  modalPhone.textContent = `${user.phone} / ${user.cell}`;
  modalAddress.textContent = `${user.location.street.number} ${user.location.street.name}, ${user.location.city}, ${user.location.state}, ${user.location.country}, ${user.location.postcode}`;

  userModal.show();
}

// Delete user
deleteBtn.addEventListener('click', () => {
  if (selectedIndex !== null) {
    users.splice(selectedIndex, 1);
    renderTable(nameOptionSelect.value);
    userModal.hide();
  }
});

// Edit user (edit all info with prompts)
editBtn.addEventListener('click', () => {
  if (selectedIndex !== null) {
    const user = users[selectedIndex];

    // Ask for each field
    const newFirst = prompt("Edit First Name:", user.name.first);
    const newLast = prompt("Edit Last Name:", user.name.last);
    const newEmail = prompt("Edit Email:", user.email);
    const newGender = prompt("Edit Gender:", user.gender);
    const newPhone = prompt("Edit Phone:", user.phone);
    const newCity = prompt("Edit City:", user.location.city);
    const newCountry = prompt("Edit Country:", user.location.country);

    // Update values if not empty
    if (newFirst) user.name.first = newFirst;
    if (newLast) user.name.last = newLast;
    if (newEmail) user.email = newEmail;
    if (newGender) user.gender = newGender;
    if (newPhone) user.phone = newPhone;
    if (newCity) user.location.city = newCity;
    if (newCountry) user.location.country = newCountry;

    // Refresh table and modal
    renderTable(nameOptionSelect.value);
    openModal(selectedIndex);
  }
});
  