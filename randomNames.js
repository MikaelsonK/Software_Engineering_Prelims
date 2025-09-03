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

//fetch randomuser api and get random users, check error
function fetchRandomUsers(num) {
  return fetch(`https://randomuser.me/api/?results=${num}`)
    .then(response => {
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }
      return response.json();
    })
    .then(data => {
      return data.results.map(user => {
        user.fullAddress = `${user.location.street.number} ${user.location.street.name}, ${user.location.city}, ${user.location.country}`;
        return user;
      });
    })
    .catch(error => {
      if (error instanceof SyntaxError) {
        throw new Error("Invalid JSON response from API.");
      }
      throw new Error("Network error: " + error.message);
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
const editBtn = document.getElementById("editBtn");
const saveBtn = document.getElementById("saveBtn");

//clears list 
function showUsers() {
  output.innerHTML = "";

  //creates header row
  const headerRow = document.createElement("div");
  headerRow.className = "header-row"; //style
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

    //shows the country part only
    let countryOnly = "";
    if (user.fullAddress) {
      const parts = user.fullAddress.split(",");
      countryOnly = parts[parts.length - 1].trim();
    } else if (user.location && user.location.country) {
      countryOnly = user.location.country;
    }

    //creates new row in user list
    const row = document.createElement("div");
    row.className = "user-row"; //style
    row.dataset.index = index;

    row.innerHTML = `
      <div class="user-pill">${displayName}</div>
      <div class="user-pill">${user.gender}</div>
      <div class="user-pill col-email">${user.email}</div>
      <div class="user-pill">${countryOnly}</div>
    `;
    
    //doubleclick function
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

  //ensure fields are readonly initially
  [modalName, modalAddress, modalEmail, modalPhone, modalCell, modalDob, modalGender].forEach(input => {
    input.setAttribute("readonly", true);
  });

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

//edit user
editBtn.addEventListener("click", () => {
  [modalName, modalAddress, modalEmail, modalPhone, modalCell, modalDob, modalGender].forEach(input => {
    input.removeAttribute("readonly");
  });
  modalName.focus();
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
