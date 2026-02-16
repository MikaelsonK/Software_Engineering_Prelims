let users = [];
let showFirstName = true;
let currentUserIndex = null;
let originalUserSnapshot = null;

const modalEl = document.getElementById("userModal");
const bsModal = () => bootstrap.Modal.getOrCreateInstance(modalEl);

document.getElementById("generateBtn").addEventListener("click", fetchUsers);

// Reset modal state after close
modalEl.addEventListener("hidden.bs.modal", () => {
  toggleEditMode(false);
  currentUserIndex = null;
  originalUserSnapshot = null;
});

// Fetch users
function fetchUsers() {
  const countStr = document.getElementById("userCount").value;
  const count = parseInt(countStr, 10);
  const errorDiv = document.getElementById("error");
  const table = document.getElementById("userTable");

  errorDiv.textContent = "";
  table.innerHTML = "";

  if (isNaN(count) || count <= 0 || count > 1000) {
    errorDiv.textContent = "Please enter a number between 0 and 1000.";
    return;
  }

  fetch(`https://randomuser.me/api/?results=${count}`)
    .then(res => res.ok ? res.json() : Promise.reject(new Error("Network response was not ok")))
    .then(data => (users = data.results, renderTable()))
    .catch(err => errorDiv.textContent = `Error fetching users: ${err.message}`);
}

// Render table
function renderTable() {
  const table = document.getElementById("userTable");
  table.innerHTML = "";

  const headerRow = document.createElement("tr");
  const nameHeader = document.createElement("th");
  const select = document.createElement("select");

  select.className = "form-select form-select-sm";
  select.style.width = "auto";
  select.add(new Option("First Name", "first"));
  select.add(new Option("Last Name", "last"));
  select.value = showFirstName ? "first" : "last";
  select.onchange = () => (showFirstName = select.value === "first", renderTable());

  nameHeader.appendChild(select);
  headerRow.appendChild(nameHeader);

  ["Email Address", "Country"].forEach(text => {
    const th = document.createElement("th");
    th.textContent = text;
    headerRow.appendChild(th);
  });

  table.appendChild(headerRow);

  users.forEach((user, index) => {
    const row = document.createElement("tr");
    row.style.cursor = "pointer";

    const nameCell = document.createElement("td");
    nameCell.textContent = showFirstName ? user.name.first : user.name.last;
    row.appendChild(nameCell);

    ["email", "location.country"].forEach(key => {
      const td = document.createElement("td");
      td.textContent = key.includes(".") ? user.location.country : user[key];
      row.appendChild(td);
    });

    row.ondblclick = () => openUserModal(index);
    table.appendChild(row);
  });
}

// Fill modal with user data
function openUserModal(index) {
  if (!users[index]) return;

  currentUserIndex = index;
  originalUserSnapshot = users[index];

  const user = users[index];
  document.getElementById("modalPicture").src = user.picture.large || "";
  document.getElementById("modalName").textContent = `${user.name.title} ${user.name.first} ${user.name.last}`;
  document.getElementById("modalAddress").textContent =
    `${user.location.street.number} ${user.location.street.name}, ${user.location.city}, ${user.location.state}, ${user.location.country}, ${user.location.postcode || ""}`;
  document.getElementById("modalEmail").textContent = user.email;
  document.getElementById("modalPhone").textContent = `Phone: ${user.phone} • Cell: ${user.cell}`;
  document.getElementById("modalDob").textContent = new Date(user.dob.date).toLocaleDateString();
  // document.getElementById("modalGender").textContent = user.gender;

  toggleEditMode(false);
  bsModal().show();
}

// Delete user
document.getElementById("deleteUser").addEventListener("click", () => {
  if (currentUserIndex === null) return;
  confirm("Are you sure you want to delete this user?") && (
    users.splice(currentUserIndex, 1),
    renderTable(),
    bsModal().hide(),
    currentUserIndex = null,
    originalUserSnapshot = null
  );
});

// Save user 
function saveUser(reopen = true) {
  return new Promise((resolve, reject) => {
    if (currentUserIndex === null) return reject("no-user");

    const user = users[currentUserIndex];
    try {
      user.name.first = document.getElementById("editFirst").value.trim();
      user.name.last = document.getElementById("editLast").value.trim();
      // user.gender = document.getElementById("editGender").value;
      user.email = document.getElementById("editEmail").value.trim();
      user.location.street.name = document.getElementById("editAddress").value.trim();
      user.location.country = document.getElementById("editCountry").value.trim();

      renderTable();
      if (reopen) openUserModal(currentUserIndex);

      originalUserSnapshot = user;

      resolve(user);
    } catch (err) {
      reject(err);
    }
  });
}

// Edit user
function editUserPromise(user) {
  return new Promise((resolve, reject) => {
    document.getElementById("editFirst").value = user.name.first || "";
    document.getElementById("editLast").value = user.name.last || "";
    // document.getElementById("editGender").value = user.gender || "male";
    document.getElementById("editEmail").value = user.email || "";
    document.getElementById("editAddress").value =
      `${user.location.street.number} ${user.location.street.name}, ${user.location.city}, ${user.location.state}` || "";
    document.getElementById("editCountry").value = user.location.country || "";

    toggleEditMode(true);

    const handleSave = async e => {
      e.preventDefault();
      try {
        const updatedUser = await saveUser();
        cleanup();
        resolve(updatedUser);
      } catch (err) {
        cleanup();
        reject(err);
      }
    };

    const handleCancel = () => (cleanup(), reject("cancel"));
    const handleClose = () => (cleanup(), reject("close"));

    const cleanup = () => {
      document.getElementById("editForm").removeEventListener("submit", handleSave);
      document.getElementById("cancelEdit").removeEventListener("click", handleCancel);
      modalEl.removeEventListener("hidden.bs.modal", handleClose);
      toggleEditMode(false);
    };

    document.getElementById("editForm").addEventListener("submit", handleSave);
    document.getElementById("cancelEdit").addEventListener("click", handleCancel);
    modalEl.addEventListener("hidden.bs.modal", handleClose);
  });
}

// Hook Edit Button
document.getElementById("editUser").addEventListener("click", async () => {
  if (currentUserIndex === null) return;
  try {
    await editUserPromise(users[currentUserIndex]);
    renderTable();
    openUserModal(currentUserIndex);
  } catch (err) {
    console.log("Edit dismissed:", err);
  }
});

// Helpers
function toggleEditMode(editing) {
  document.getElementById("editMode").style.display = editing ? "block" : "none";
  document.getElementById("viewMode").style.display = editing ? "none" : "block";
}