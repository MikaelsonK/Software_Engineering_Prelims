let users = [];
let selectedIndex = null; 
let modal = null;          

async function fetchUsers() {
  const count = +document.getElementById("userCount").value;
  const errorMsg = document.getElementById("errorMsg");
  const userList = document.getElementById("userList");

  errorMsg.textContent = "";
  document.getElementById("header").style.display = "none";
  userList.innerHTML = "";

  if (!count || count < 1 || count > 1000) {
    errorMsg.textContent = "Enter a number between 1 and 1000.";
    return;
  }

  try {
    const res = await fetch(`https://randomuser.me/api/?results=${count}`);
    const data = await res.json();
    users = data.results;
    renderUsers();
  } catch {
    errorMsg.textContent = "Could not fetch users. Check internet connection.";
  }
}

function renderUsers() {
  const nameType = document.getElementById("nameType").value;
  const userList = document.getElementById("userList");

  userList.innerHTML = users.map((user, index) => `
    <div class="row text-center mb-2 border rounded p-2" 
         ondblclick="showModal(${index})" style="cursor:pointer;">
      <div class="col">${user.name[nameType]}</div>
      <div class="col">${user.gender}</div>
      <div class="col">${user.email}</div>
      <div class="col">${user.location.country}</div>
    </div>
  `).join("");

  if (users.length) document.getElementById("header").style.display = "flex";
}

function showModal(index) {
  selectedIndex = index;
  const user = users[index];

  document.getElementById("modalFullName").textContent =
    `${user.name.title} ${user.name.first} ${user.name.last}`;
  document.getElementById("modalAddress").textContent =
    `${user.location.street.number} ${user.location.street.name}, ${user.location.city}, ${user.location.state}, ${user.location.country}, ${user.location.postcode}`;
  document.getElementById("modalEmail").textContent = user.email;
  document.getElementById("modalPhone").textContent = user.cell;
  document.getElementById("modalTelephone").textContent = user.phone;
  document.getElementById("modalDOB").textContent =
    new Date(user.dob.date).toLocaleDateString();
  document.getElementById("modalGender").textContent = user.gender;
  document.getElementById("modalPicture").src = user.picture.large;

  if (!modal) {
    modal = new bootstrap.Modal(document.getElementById("userModal"));
  }
  modal.show();
}



document.getElementById("deleteBtn").addEventListener("click", () => {
  if (selectedIndex !== null) {
    users.splice(selectedIndex, 1); 
    renderUsers();                  
    modal.hide();                   
  }
});


document.getElementById("editBtn").addEventListener("click", () => {
  if (selectedIndex !== null) {
    let user = users[selectedIndex];

    const newFirst = prompt("Edit First Name:", user.name.first);
    const newLast = prompt("Edit Last Name:", user.name.last);
    const newEmail = prompt("Edit Email:", user.email);

    if (newFirst) user.name.first = newFirst;
    if (newLast) user.name.last = newLast;
    if (newEmail) user.email = newEmail;

    renderUsers();   
    showModal(selectedIndex); 
  }
});
