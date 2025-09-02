//get elements from html
const numInput = document.getElementById("numInput");
const loadGif = document.getElementById("loadGif");
const message = document.getElementById("message");
const output = document.getElementById("output");

//store the users from the api
let users = [];
//track which user we editing rn
let selectedUserIndex = null;
//track if we show first or last name
let nameMode = "first";

//function to call randomuser api and get random users
async function fetchRandomUsers(num) {
  let response;
  try {
    response = await fetch(`https://randomuser.me/api/?results=${num}`);
  } catch (error) {
    throw new Error("You have no internet, try again: " + error.message);
  }

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  let data;
  try {
    data = await response.json();
  } catch (error) {
    throw new Error("Invalid JSON response from API.");
  }

  if (!data.results || data.results.length === 0) {
    throw new Error("No users returned from API");
  }

  //create full address for each user
  return data.results.map(user => {
    user.fullAddress = `${user.location.street.number} ${user.location.street.name}, ${user.location.city}, ${user.location.country}`;
    return user;
  });
}

//bootstrap modal setup
const userModal = new bootstrap.Modal(document.getElementById("userModal"));
const modalImage = document.getElementById("modalImage");
const modalName = document.getElementById("modalName");
const modalAddress = document.getElementById("modalAddress");
const modalEmail = document.getElementById("modalEmail");
const modalPhone = document.getElementById("modalPhone"); // phone 
const modalCell = document.getElementById("modalCell");   // telephone
const modalDob = document.getElementById("modalDob");
const modalGender = document.getElementById("modalGender");

//buttons inside the modal
const deleteBtn = document.getElementById("deleteBtn");
const saveBtn = document.getElementById("saveBtn");

//show users in the page 
function showUsers() {
  output.innerHTML = "";

  //header row
  const headerRow = document.createElement("div");
  headerRow.className = "header-row";
  headerRow.innerHTML = `
    <select id="nameMode" class="form-select header-pill border-0 text-center" style="width:auto;">
      <option value="first" ${nameMode === "first" ? "selected" : ""}>First Name</option>
      <option value="last" ${nameMode === "last" ? "selected" : ""}>Last Name</option>
    </select>
    <div class="header-pill">Gender</div>
    <div class="header-pill col-email">Email</div>
    <div class="header-pill">Country</div>
  `;
  output.appendChild(headerRow);

  //each user row
  users.forEach((user, index) => {
    const displayName = nameMode === "first" ? user.name.first : user.name.last;

    let countryOnly = "";
    if (user.fullAddress) {
      const parts = user.fullAddress.split(",");
      countryOnly = parts[parts.length - 1].trim();
    } else if (user.location && user.location.country) {
      countryOnly = user.location.country;
    }

    const row = document.createElement("div");
    row.className = "user-row";
    row.dataset.index = index;

    row.innerHTML = `
      <div class="user-pill">${displayName}</div>
      <div class="user-pill">${user.gender}</div>
      <div class="user-pill col-email">${user.email}</div>
      <div class="user-pill">${countryOnly}</div>
    `;

    row.addEventListener("dblclick", function () {
      openUserModal(index);
    });

    output.appendChild(row);
  });

  //dropdown listener
  const nameModeSelect = document.getElementById("nameMode");
  if (!nameModeSelect.dataset.listener) {
    nameModeSelect.addEventListener("change", e => {
      nameMode = e.target.value;
      showUsers();
    });
    nameModeSelect.dataset.listener = "true";
  }
}

//open modal to edit user
function openUserModal(index) {
  selectedUserIndex = index;
  const user = users[index];

  modalImage.src = user.picture.large;
  modalName.value = `${user.name.title} ${user.name.first} ${user.name.last}`;
  modalAddress.value = user.fullAddress || "";
  modalEmail.value = user.email;
  modalPhone.value = user.phone || "";
  modalCell.value = user.cell || "";
  modalDob.value = new Date(user.dob.date).toISOString().split("T")[0];
  modalGender.value = user.gender;

  userModal.show();
}

//delete user
deleteBtn.addEventListener("click", function () {
  if (selectedUserIndex !== null) {
    users.splice(selectedUserIndex, 1);
    showUsers();
    userModal.hide();
  }
});

//save user changes
saveBtn.addEventListener("click", function () {
  if (selectedUserIndex !== null) {
    const user = users[selectedUserIndex];

    const parts = modalName.value.split(" ");
    user.name.title = parts[0] || user.name.title;
    user.name.first = parts[1] || user.name.first;
    user.name.last = parts[2] || user.name.last;

    user.fullAddress = modalAddress.value;
    user.email = modalEmail.value;
    user.phone = modalPhone.value;
    user.cell = modalCell.value;
    user.dob.date = new Date(modalDob.value).toISOString();
    user.gender = modalGender.value;

    showUsers();
    userModal.hide();
  }
});

//load users when pressing enter
numInput.addEventListener("keyup", async e => {
  if (e.key === "Enter") {
    const num = parseInt(numInput.value);

    if (isNaN(num) || num < 1 || num > 1000) {
      message.textContent = "Please enter a number between 1 and 1000.";
      return;
    }

    message.textContent = "";
    loadGif.style.display = "block";

    try {
      users = await fetchRandomUsers(num);
      showUsers();
    } catch (error) {
      message.textContent = "Failed to load random users: " + error.message;
    }

    loadGif.style.display = "none";
  }
});

//show empty header at start
showUsers();
