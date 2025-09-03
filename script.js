const generateBtn = document.getElementById("generateBtn");
const userCountInput = document.getElementById("userCount");
const userTable = document.getElementById("userTable");
const nameTypeSelect = document.getElementById("nameType");

// for modal references
const modal = new bootstrap.Modal(document.getElementById("userModal"));
const modalImg = document.getElementById("modalImg");
const modalName = document.getElementById("modalName");
const modalAddress = document.getElementById("modalAddress");
const modalEmail = document.getElementById("modalEmail");
const modalPhone = document.getElementById("modalPhone");
const modalCell = document.getElementById("modalCell");
const modalDob = document.getElementById("modalDob");
const modalGender = document.getElementById("modalGender");

const deleteBtn = document.getElementById("deleteBtn");
const editBtn = document.getElementById("editBtn");
const saveBtn = document.getElementById("saveBtn");

let currentUsers = [];
let selectedUserIndex = null;

// fetch users
function fetchUsers(count) {
  return fetch("https://randomuser.me/api/?results=" + count)
    .then(response => {
      if (!response.ok) throw new Error("API request failed with status " + response.status);
      return response.json();
    })
    .then(data => data.results);
}

// display users
function displayUsers(users) {
  userTable.innerHTML = "";
  const nameType = nameTypeSelect.value;

  users.forEach((user, index) => {
    const row = document.createElement("tr");

    const nameColumn = document.createElement("td");
    nameColumn.textContent = nameType === "first" ? user.name.first : user.name.last;

    const genderColumn = document.createElement("td");
    genderColumn.textContent = user.gender;

    const emailColumn = document.createElement("td");
    emailColumn.textContent = user.email;

    const countryCoulumn = document.createElement("td");
    countryCoulumn.textContent = user.location.country;

    row.appendChild(nameColumn);
    row.appendChild(genderColumn);
    row.appendChild(emailColumn);
    row.appendChild(countryCoulumn);

    // double click to open modal
    row.addEventListener("dblclick", () => openUserModal(user, index));

    userTable.appendChild(row);
  });
}

// open modal
function openUserModal(user, index) {
  selectedUserIndex = index;
  modalImg.src = user.picture.large;
  modalName.value = `${user.name.title} ${user.name.first} ${user.name.last}`;
  modalAddress.value = `${user.location.street.number} ${user.location.street.name}, ${user.location.city}, ${user.location.state}, ${user.location.country}, ${user.location.postcode}`;
  modalEmail.value = user.email;
  modalPhone.value = user.phone;
  modalCell.value = user.cell;
  modalDob.value = new Date(user.dob.date).toLocaleDateString();
  modalGender.value = user.gender;

  // reset buttons
  toggleEditMode(false);
  modal.show();
}

// toggle between view/edit mode
function toggleEditMode(editMode) {
  [modalName, modalAddress, modalEmail, modalPhone, modalCell, modalDob, modalGender].forEach(input => {
    input.readOnly = !editMode;
  });

  editBtn.classList.toggle("d-none", editMode);
  saveBtn.classList.toggle("d-none", !editMode);
}

// delete user
deleteBtn.addEventListener("click", () => {
  if (selectedUserIndex !== null) {
    currentUsers.splice(selectedUserIndex, 1);
    displayUsers(currentUsers);
    modal.hide();
  }
});

// enable edit mode
editBtn.addEventListener("click", () => toggleEditMode(true));

// pang save edits
saveBtn.addEventListener("click", () => {
  if (selectedUserIndex !== null) {
    let user = currentUsers[selectedUserIndex];

    // update user object
    user.name.first = modalName.value.split(" ")[1] || user.name.first;
    user.name.last = modalName.value.split(" ")[2] || user.name.last;
    user.email = modalEmail.value;
    user.phone = modalPhone.value;
    user.cell = modalCell.value;
    user.gender = modalGender.value;
    user.dob.date = new Date(modalDob.value).toISOString();

    displayUsers(currentUsers);
    openUserModal(user, selectedUserIndex); 
  }
});

// check if validate input
function validateInput(count) {
  if (isNaN(count) || count < 0 || count > 1000) {
    alert("Please enter a number between 0 and 1000.");
    return false;
  }
  return true;
}

// handle generate
function GenerateClick() {
  const count = parseInt(userCountInput.value);
  if (!validateInput(count)) return;

  fetchUsers(count)
    .then(users => {
      currentUsers = users;
      displayUsers(currentUsers);
    })
    .catch(error => alert("Error: " + error));
}

// handle name type change
function nameTypeChange() {
  if (currentUsers.length > 0) displayUsers(currentUsers);
}

generateBtn.addEventListener("click", GenerateClick);
nameTypeSelect.addEventListener("change", nameTypeChange);
