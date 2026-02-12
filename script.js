const countInput = document.getElementById("userCount");
const nameTypeSelect = document.getElementById("nameType");
const userBody = document.getElementById("userBody");
const errorEl = document.getElementById("error");
const countdownEl = document.getElementById("countdown");
const modal = new bootstrap.Modal(document.getElementById("userModal"));

const modalFirstName = document.getElementById("modal-fname");
const modalLastName = document.getElementById("modal-lname");
const modalAddress = document.getElementById("modal-address");
const modalEmail = document.getElementById("modal-email");
const modalPhone = document.getElementById("modal-phone");
const modalCell = document.getElementById("modal-cell");
const modalDob = document.getElementById("modal-dob");
const modalGender = document.getElementById("modal-gender");
const modalPicture = document.getElementById("modal-picture");

const deleteBtn = document.getElementById("deleteBtn");
const saveBtn = document.getElementById("saveBtn");

let users = [];
let debounceTimer, countdownTimer;
let currentUserIndex = null;

// Countdown with 3s debounce
countInput.addEventListener("input", () => {
  clearTimeout(debounceTimer);
  clearInterval(countdownTimer);
  countdownEl.textContent = "";

  let seconds = 2;
  countdownEl.textContent = seconds;

  countdownTimer = setInterval(() => {
    seconds--;
    if (seconds > 0) {
      countdownEl.textContent = seconds;
    } else {
      clearInterval(countdownTimer);
      countdownEl.textContent = "Generated";
    }
  }, 1000);

  debounceTimer = setTimeout(fetchUsers, 2000);
});

nameTypeSelect.addEventListener("change", renderUsers);

function fetchUsers() {
  const count = Math.round(Number(countInput.value));

  if (isNaN(count) || count < 0 || count > 1000) {
    errorEl.textContent = "Please enter a valid number between 0 and 1000.";
    userBody.innerHTML = "";
    countdownEl.textContent = "";
    return;
  }

  errorEl.textContent = "";
  userBody.innerHTML = "";

  if (count === 0) {
    return; // Keep header visible
  }

  fetch(`https://randomuser.me/api/?results=${count}`)
    .then(response => {
      if (!response.ok) {
        throw new Error("API returned an error.");
      }
      return response.json();
    })
    .then(data => {
      users = data.results;
      renderUsers();
    })
    .catch(err => {
      errorEl.textContent = "Error fetching users: " + err.message;
      users = [];
      countdownEl.textContent = "";
    });
}

function renderUsers() {
  userBody.innerHTML = "";
  if (users.length === 0) return;

  users.forEach((user, index) => {
    const tr = document.createElement("tr");

    const numTd = document.createElement("td");
    numTd.textContent = index + 1;
    tr.appendChild(numTd);

    const nameTd = document.createElement("td");
    nameTd.textContent = nameTypeSelect.value === "first" ? user.name.first : user.name.last;
    tr.appendChild(nameTd);

    const genderTd = document.createElement("td");
    genderTd.textContent = user.gender.charAt(0).toUpperCase() + user.gender.slice(1);
    tr.appendChild(genderTd);

    const emailTd = document.createElement("td");
    emailTd.textContent = user.email;
    tr.appendChild(emailTd);

    const countryTd = document.createElement("td");
    countryTd.textContent = user.location.country;
    tr.appendChild(countryTd);

    tr.addEventListener("dblclick", () => openModal(index));
    userBody.appendChild(tr);
  });
}

function openModal(index) {
  currentUserIndex = index;
  const user = users[index];

  modalFirstName.value = user.name.first;
  modalLastName.value = user.name.last;
  modalAddress.value = `${user.location.street.number}, ${user.location.street.name}, ${user.location.city}, ${user.location.state}, ${user.location.country}`;
  modalEmail.value = user.email;
  modalPhone.value = user.phone;
  modalCell.value = user.cell;
  modalDob.value = new Date(user.dob.date).toLocaleDateString();
  modalGender.value = user.gender.charAt(0).toUpperCase() + user.gender.slice(1);
  modalPicture.src = user.picture.large;

  modal.show();
}

deleteBtn.addEventListener("click", () => {
  if (currentUserIndex !== null) {
    users.splice(currentUserIndex, 1);
    renderUsers();
    modal.hide();
  }
});

saveBtn.addEventListener("click", () => {
  if (currentUserIndex !== null) {
    const user = users[currentUserIndex];
    user.name.first = modalFirstName.value;
    user.name.last = modalLastName.value;
    user.location.street.number = modalAddress.value.split(", ")[0];
    user.location.street.name = modalAddress.value.split(", ")[1];
    user.location.city = modalAddress.value.split(", ")[2];
    user.location.state = modalAddress.value.split(", ")[3];
    user.location.country = modalAddress.value.split(", ")[4];
    user.email = modalEmail.value;
    user.phone = modalPhone.value;
    user.cell = modalCell.value 
    user.dob.date = new Date(modalDob.value).toISOString();
    user.gender = modalGender.value.toLowerCase();

    renderUsers();
    modal.hide();
  }
});