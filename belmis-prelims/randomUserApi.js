const userTableBody = document.getElementById('userTableBody');
const generateBtn = document.getElementById('generateBtn');
const userCountInput = document.getElementById('userCount');
const nameSelect = document.getElementById('nameSelect');

// Bootstrap modal
const modal = $('#userModal');
const modalPicture = document.getElementById('modalPicture');
const modalName = document.getElementById('modalName');
const modalAddress = document.getElementById('modalAddress');
const modalEmail = document.getElementById('modalEmail');

// Action buttons
const editUserBtn = document.getElementById('editUser');
const deleteUserBtn = document.getElementById('deleteUser');

// Edit form
const editForm = document.getElementById('editForm');
const editName = document.getElementById('editName');
const editAddress = document.getElementById('editAddress');
const editEmail = document.getElementById('editEmail');
const saveEditBtn = document.getElementById('saveEdit');
const cancelEditBtn = document.getElementById('cancelEdit');

let currentUsers = [];
let selectedUserIndex = null;

// Fetch multiple users
async function getUsers(count) {
  try {
    const response = await fetch(`https://randomuser.me/api/?results=${count}`);
    if (!response.ok) throw new Error("Failed to fetch users");

    const data = await response.json();
    currentUsers = data.results;
    setUsersInfo(currentUsers);
  } catch (error) {
    console.error(error);
    alert("Error fetching users. Check your internet connection.");
  }
}

function capitalizeFirstLetter(value) {
  if (!value && value !== "") return "";
  value = String(value).trim();
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

// Display users in table
function setUsersInfo(users) {
  userTableBody.innerHTML = "";

  users.forEach((user, index) => {
    const row = document.createElement("tr");

    let nameDisplay = (nameSelect.value === "first") ? user.name.first : user.name.last;

    let genderDisplay = capitalizeFirstLetter(user.gender);

    row.innerHTML = `
      <td>${nameDisplay}</td>
      <td>${user.gender}</td>
      <td><a href="mailto:${user.email}">${user.email}</a></td>
      <td>${user.location.country}</td>
    `;

    // Double click → open modal
    row.addEventListener("dblclick", () => {
      selectedUserIndex = index;
      openModal(user);
    });

    userTableBody.appendChild(row);
  });
}

function openModal(user) {
  modalPicture.src = user.picture.large;
  modalName.textContent = `${user.name.first} ${user.name.last}`;
  modalAddress.textContent = `${user.location.street.number} ${user.location.street.name}, ${user.location.city}, ${user.location.country}`;
  modalEmail.textContent = user.email;
  editForm.style.display = "none";
  modal.modal('show'); // bootstrap open
}

// Generate
generateBtn.addEventListener("click", () => {
  const count = parseInt(userCountInput.value) || 0;

  if (count <= 0) {
    alert("⚠️ Please enter at least 1 user.");
    return;
  }

  getUsers(count);
});

// Name select change
nameSelect.addEventListener("change", () => {
  if (currentUsers.length > 0) setUsersInfo(currentUsers);
});

/* DELETE */
deleteUserBtn.addEventListener("click", () => {
  if (selectedUserIndex !== null) {
    currentUsers.splice(selectedUserIndex, 1);
    setUsersInfo(currentUsers);
    modal.modal('hide');
  }
});

/* EDIT */
editUserBtn.addEventListener("click", () => {
  if (selectedUserIndex !== null) {
    const user = currentUsers[selectedUserIndex];
    editName.value = `${user.name.first} ${user.name.last}`;
    editAddress.value = `${user.location.street.number} ${user.location.street.name}, ${user.location.city}, ${user.location.country}`;
    editEmail.value = user.email;
    editForm.style.display = "block";
  }
});

saveEditBtn.addEventListener("click", () => {
  if (selectedUserIndex !== null) {
    const user = currentUsers[selectedUserIndex];

    const [firstName, ...lastNameParts] = editName.value.trim().split(" ");
    user.name.first = firstName || user.name.first;
    user.name.last = lastNameParts.join(" ") || user.name.last;

    user.email = editEmail.value || user.email;
    user.location.street.name = editAddress.value || user.location.street.name;

    setUsersInfo(currentUsers);
    openModal(user);
    editForm.style.display = "none";
  }
});

cancelEditBtn.addEventListener("click", () => {
  editForm.style.display = "none";
});
