const fetchBtn = document.getElementById("fetchBtn");
const userCountInput = document.getElementById("userCount");
const userTableBody = document.querySelector("#userTable tbody");
const nameTypeSelect = document.getElementById("nameType");
const errorMsg = document.getElementById("errorMsg");

let usersData = [];

function fetchUsers(count) {
  return new Promise(function (resolve, reject) {
    fetch("https://randomuser.me/api/?results=" + count)
      .then(function (res) {
        if (!res.ok) {
          reject("Error fetching data");
        }
        return res.json();
      })
      .then(function (data) {
        resolve(data.results);
      })
      .catch(function () {
        reject("Network error");
      });
  });
}

let modal = document.getElementById("userModal");
let closeModal = document.getElementById("closeModal");
let modalImg = document.getElementById("modalImg");
let modalName = document.getElementById("modalName");
let modalAddress = document.getElementById("modalAddress");
let modalEmail = document.getElementById("modalEmail");
let modalPhone = document.getElementById("modalPhone");
let modalDob = document.getElementById("modalDob");
let modalGender = document.getElementById("modalGender");
let deleteBtn = document.getElementById("deleteUser");
let saveBtn = document.getElementById("saveUser");

let currentUserIndex = null;

function displayUsers() {
  userTableBody.innerHTML = ""; 
  const nameType = nameTypeSelect.value;

  usersData.forEach((user, index) => {
    let row = document.createElement("tr");
    row.setAttribute("data-index", index);

  let nameCell = document.createElement("td");
  nameCell.textContent = nameType === "first" ? user.name.first : user.name.last;

  let genderCell = document.createElement("td");
  genderCell.textContent = user.gender;

  let emailCell = document.createElement("td");
  emailCell.textContent = user.email;

  let countryCell = document.createElement("td");
  countryCell.textContent = user.location.country;

  row.appendChild(nameCell);
  row.appendChild(genderCell);
  row.appendChild(emailCell);
  row.appendChild(countryCell);

  
  row.ondblclick = () => {
    currentUserIndex = index;
    openModal(user);
  };

  userTableBody.appendChild(row);
});
}


function openModal(user) {
  modalImg.src = user.picture.large;
  modalName.value = `${user.name.title} ${user.name.first} ${user.name.last}`;
  modalAddress.value = user.fullAddress || `${user.location.street.number} ${user.location.street.name}, ${user.location.city}, ${user.location.state}, ${user.location.country}`;
  modalEmail.value = user.email;
  modalPhone.value = user.phone;
  modalDob.value = new Date(user.dob.date).toISOString().split("T")[0];
  modalGender.value = user.gender.toLowerCase();
  modal.style.display = "flex";
}


closeModal.onclick = () => modal.style.display = "none";

deleteBtn.onclick = () => {
if (currentUserIndex !== null) {
  usersData.splice(currentUserIndex, 1);
  displayUsers();
  modal.style.display = "none";
}
};

saveBtn.onclick = () => {
  if (currentUserIndex  !== null) {
    let user = usersData[currentUserIndex];

    let nameParts = modalName.value.trim().split(" ");
    user.name.title = nameParts[0] || "";
    user.name.first = nameParts[1] || "";
    user.name.last = nameParts.slice(2).join(" ") || "";

    user.fullAddress = modalAddress.value;
    user.email = modalEmail.value;
    user.phone = modalPhone.value;
    user.dob.date = new Date(modalDob.value).toISOString();
    user.gender = modalGender.value;

    displayUsers();
    modal.style.display = "none";
  }
};

fetchBtn.addEventListener("click", () => {
  const count = parseInt(userCountInput.value);

  if (isNaN(count) || count < 1 || count > 1000) {
    errorMsg.textContent = "Please enter a number from 1 to 1000";
    return;
  }

  errorMsg.textContent = "Loading...";

  fetchUsers(count)
    .then(users => {
      usersData = users;
      displayUsers();
      errorMsg.textContent = "";
    })
    .catch(err => {
      errorMsg.textContent = err;
    });
});

nameTypeSelect.addEventListener("change", function () {
  displayUsers();
});

