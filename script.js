let usersData = [];
let currentUserIndex = null;

async function fetchUsers() {
  const count = document.getElementById("userCount").value;
  const errorDiv = document.getElementById("error");
  errorDiv.textContent = "";
  usersData = [];

  if (!count || count < 1 || count > 1000) {
    errorDiv.textContent = "Please enter a number between 1 and 1000.";
    return;
  }

  try {
    const res = await fetch(`https://randomuser.me/api/?results=${count}`);
    if (!res.ok) throw new Error("Failed to fetch data from API");

    const data = await res.json();
    usersData = data.results;
    renderUsers();
  } catch (err) {
    errorDiv.textContent = "Error fetching users: " + err.message;
  }
}

function renderUsers() {
  const usersDiv = document.getElementById("users");
  const nameType = document.getElementById("nameType").value;

  if (usersData.length === 0) {
    usersDiv.innerHTML = "";
    return;
  }

  let nameRandom = "";
  let genderRandom = "";
  let emailRandom = "";
  let countryRandom = "";

  usersData.forEach((user, index) => {
    const name = nameType === "first" ? user.name.first : user.name.last;
    nameRandom += `<p ondblclick="openModal(${index})">${name}</p>`;
    genderRandom += `<p ondblclick="openModal(${index})">${user.gender}</p>`;
    emailRandom += `<p ondblclick="openModal(${index})">${user.email}</p>`;
    countryRandom += `<p ondblclick="openModal(${index})">${user.location.country}</p>`;
  });

  usersDiv.innerHTML = `
    <div>${nameRandom}</div>
    <div>${genderRandom}</div>
    <div>${emailRandom}</div>
    <div>${countryRandom}</div>
  `;
}

function openModal(index) {
  currentUserIndex = index;
  const user = usersData[index];

  document.getElementById("modalPicture").src = user.picture.large;

  document.getElementById("modalFields").innerHTML = `
    <div class="bubble-field" contenteditable="false" id="modalName">${user.name.title} ${user.name.first} ${user.name.last}</div>
    <div class="bubble-field" contenteditable="false" id="modalAddress">${user.location.street.number} ${user.location.street.name}, ${user.location.city}, ${user.location.state}, ${user.location.country}, ${user.location.postcode}</div>
    <div class="bubble-field" contenteditable="false" id="modalEmail">${user.email}</div>
    <div class="bubble-field" contenteditable="false" id="modalPhone">${user.phone}</div>
    <div class="bubble-field" contenteditable="false" id="modalCell">${user.cell}</div>
    <div class="bubble-field" contenteditable="false" id="modalDOB">${new Date(user.dob.date).toLocaleDateString()}</div>
    <div class="bubble-field" contenteditable="false" id="modalGender">${user.gender}</div>
  `;

  new bootstrap.Modal(document.getElementById("userModal")).show();
}

document.getElementById("deleteUser").addEventListener("click", () => {
  if (currentUserIndex !== null) {
    usersData.splice(currentUserIndex, 1);
    renderUsers();
    bootstrap.Modal.getInstance(document.getElementById("userModal")).hide();
  }
});

document.getElementById("editUser").addEventListener("click", () => {
  document.querySelectorAll("#modalFields .bubble-field").forEach(el => el.contentEditable = "true");
  document.getElementById("saveUser").classList.remove("d-none");
  document.getElementById("editUser").classList.add("d-none");
});

document.getElementById("saveUser").addEventListener("click", () => {
  const updatedUser = usersData[currentUserIndex];

  updatedUser.name.first = document.getElementById("modalName").innerText.split(" ")[1];
  updatedUser.name.last = document.getElementById("modalName").innerText.split(" ")[2];
  updatedUser.email = document.getElementById("modalEmail").innerText;
  updatedUser.phone = document.getElementById("modalPhone").innerText;
  updatedUser.cell = document.getElementById("modalCell").innerText;
  updatedUser.gender = document.getElementById("modalGender").innerText;

  renderUsers();

  document.querySelectorAll("#modalFields .bubble-field").forEach(el => el.contentEditable = "false");
  document.getElementById("saveUser").classList.add("d-none");
  document.getElementById("editUser").classList.remove("d-none");
});

document.getElementById("userCount").addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    fetchUsers();
  }
});