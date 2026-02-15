document.addEventListener("DOMContentLoaded", () => { // Ensures all HTML elements exist before JS tries to find them.
  const results = document.getElementById("results"); // where users will be inserted.
  const userModal = new bootstrap.Modal(document.getElementById("userModal")); // Bootstrap modal instance.
  const generateBtn = document.getElementById("generate");            //  |
  const countInput = document.getElementById("count");                // user controls
  const nameModeSelect = document.getElementById("nameMode");         //  |
  let selectedUserIndex = null; // keeps track of which row was double-clicked
  let users = []; // stores all generated users.

  function renderUsers(list) { // clears old rows | Creates a new row for each user | Depending on dropdown, shows first name or last name.
    results.innerHTML = "";
    users = list;

    const mode = nameModeSelect.value;

    users.forEach((u, i) => {
      const row = document.createElement("tr");
      const displayName = mode === "first" ? u.name.first : u.name.last; // "?" is a shortcut for if/else

      row.innerHTML = `
        <td>${displayName}</td>
        <td>${u.gender}</td>
        <td>${u.email}</td>
        <td>${u.location.country}</td>
      `;

      row.addEventListener("dblclick", () => { // opens detailed view with a double click
        selectedUserIndex = i;
        showUserDetails(u);
        userModal.show();
      });

      results.appendChild(row);
    });
  }

  function showUserDetails(u) {
  const initials = `${u.name.first[0] || ""}${u.name.last[0] || ""}`.toUpperCase(); // shows initials on the profile
  document.getElementById("userAvatar").textContent = initials;
  document.getElementById("userName").textContent = `${u.name.title} ${u.name.first} ${u.name.last}`;
  document.getElementById("userAddress").textContent =
    `${u.location.street.number} ${u.location.street.name}, ${u.location.city}, 
    ${u.location.state}, ${u.location.country}, ${u.location.postcode}`;
  document.getElementById("userEmail").textContent = u.email;
  document.getElementById("userPhone").textContent = u.phone;

  document.getElementById("userDob").textContent =
    u.dob.date ? new Date(u.dob.date).toLocaleDateString() : "";

  document.getElementById("userGender").textContent = u.gender;
}


  generateBtn.addEventListener("click", () => { 
    const count = Number(countInput.value); // reads input
    if (!Number.isInteger(count) || count < 0 || count > 1000) return; // checks if above 0 & below 1000

    if (count === 0) { // clears table if 0
      users = [];
      results.innerHTML = "";
      return;
    }

    fetch(`https://randomuser.me/api/?results=${count}&inc=name,gender,email,location,phone,dob&noinfo=true`) // gets details from api
      .then(res => res.json())
      .then(data => renderUsers(data.results)) // passes to renderUsers
      .catch(err => console.error(err));
  });

  nameModeSelect.addEventListener("change", () => { // re-renders table when dropdown is changed
    if (users.length > 0) renderUsers(users);
  });

  const editBtn = document.getElementById("editUser");
  const saveBtn = document.getElementById("saveUser");

  editBtn.addEventListener("click", () => { // Reads current values
    const fields = {
      userName: document.getElementById("userName").textContent,
      userAddress: document.getElementById("userAddress").textContent,
      userEmail: document.getElementById("userEmail").textContent,
      userPhone: document.getElementById("userPhone").textContent,
      userDob: document.getElementById("userDob").textContent,
      userGender: document.getElementById("userGender").textContent
    };

    document.getElementById("userName").innerHTML =
      `<input id="editName" type="text" class="form-control text-center" value="${fields.userName}">`;
    document.getElementById("userAddress").innerHTML =
      `<input id="editAddress" type="text" class="form-control" value="${fields.userAddress}">`;
    document.getElementById("userEmail").innerHTML =
      `<input id="editEmail" type="email" class="form-control" value="${fields.userEmail}">`;
    document.getElementById("userPhone").innerHTML =
      `<input id="editPhone" type="text" class="form-control" value="${fields.userPhone}">`;
    document.getElementById("userDob").innerHTML =
      `<input id="editDob" type="text" class="form-control" value="${fields.userDob}">`;
    document.getElementById("userGender").innerHTML =
      `<select id="editGender" class="form-select">
         <option ${fields.userGender === "male" ? "selected" : ""}>male</option>
         <option ${fields.userGender === "female" ? "selected" : ""}>female</option>
       </select>`;

    editBtn.classList.add("d-none");
    saveBtn.classList.remove("d-none");
  });

  saveBtn.addEventListener("click", () => { 
    if (selectedUserIndex === null) return;

    const updatedUser = users[selectedUserIndex];

    updatedUser.name.first = document.getElementById("editName").value.split(" ")[1] || updatedUser.name.first; 
    updatedUser.name.last = document.getElementById("editName").value.split(" ")[2] || updatedUser.name.last;
    //gets user's name, splits into array, if parts are missing falls back to previous inputted name 
    //(this checks for the names [first[1], last[2]] seperate from the title[0])
    updatedUser.email = document.getElementById("editEmail").value;
    updatedUser.phone = document.getElementById("editPhone").value;
    updatedUser.dob.date = document.getElementById("editDob").value;
    updatedUser.gender = document.getElementById("editGender").value;

    updatedUser.location.full = document.getElementById("editAddress").value;

    showUserDetails(updatedUser);

    const row = results.rows[selectedUserIndex]; // syncs table with new inserted data
    const mode = nameModeSelect.value;                                  //   |
    row.cells[0].textContent =                                          //   |
      mode === "first" ? updatedUser.name.first : updatedUser.name.last;//   |
    row.cells[1].textContent = updatedUser.gender;                      //   |
    row.cells[2].textContent = updatedUser.email;                       //   |
    row.cells[3].textContent = updatedUser.location.country;            //   |

    saveBtn.classList.add("d-none");            // witch the modal from “editing mode” back to “viewing mode”
    editBtn.classList.remove("d-none");         // |
  });

  document.getElementById("deleteUser").addEventListener("click", () => { // Removes the user from the array and the table and closes the modal.
    if (selectedUserIndex !== null) {
      users.splice(selectedUserIndex, 1);
      results.deleteRow(selectedUserIndex);
      userModal.hide();
    }
  });
});
