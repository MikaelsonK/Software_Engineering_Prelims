document.addEventListener("DOMContentLoaded", function () {
  // UI elements
  const generateBtn = document.getElementById("generateBtn");
  const userCountInput = document.getElementById("userCount");
  const userRows = document.getElementById("userRows");
  const nameFormatSelect = document.getElementById("nameFormat");
  const userModal = new bootstrap.Modal(document.getElementById("userModal"));
  
  // Modal elements
  const userPic = document.getElementById("userPic");
  const userFullName = document.getElementById("userFullName");
  const userEmail = document.getElementById("userEmail");
  const userPhone = document.getElementById("userPhone");
  const userDob = document.getElementById("userDob");
  const userGender = document.getElementById("userGender");
  const userAddress = document.getElementById("userAddress");
  
  // Action buttons
  const editUserBtn = document.getElementById("editUserBtn");
  const deleteUserBtn = document.getElementById("deleteUserBtn");
  const saveUserBtn = document.getElementById("saveUserBtn");
  
  // Form elements
  const editForm = document.getElementById("userEditForm");
  
  let currentUsers = [];
  let selectedUserIndex = null;

  // Fetch users with explicit Promise
  function fetchUsers(count) {
    return new Promise((resolve, reject) => {
      fetch(`https://randomuser.me/api/?results=${count}`)
        .then(response => {
          if (!response.ok) {
            reject(new Error(`API Error: ${response.status}`));
          }
          return response.json();
        })
        .then(data => resolve(data.results || []))
        .catch(error => reject(error));
    });
  }

    // Generate users
    function generateUsers() {
      return new Promise((resolve, reject) => {
        const count = parseInt(userCountInput.value, 10);

        if (isNaN(count) || count < 1 || count > 1000) {
          reject(new Error("⚠️ Please enter a number between 1 and 1000."));
          return;
        }

        userRows.innerHTML = `<tr><td colspan="4" class="text-muted">Loading...</td></tr>`;

        fetchUsers(count)
          .then(users => {
            currentUsers = users;
            renderUsers(currentUsers);
            resolve("✅ Users loaded successfully!");
          })
          .catch(error => {
            console.error("Error:", error);
            userRows.innerHTML = `<tr><td colspan="4" class="text-danger">Error loading users</td></tr>`;
            reject(new Error("⚠️ Could not load users. Please check your internet connection and try again."));
          });
      })
      .catch(msg => {
        alert(msg); 
      });
    }


  // Render users
  function renderUsers(users) {
    userRows.innerHTML = "";

    if (users.length === 0) {
      userRows.innerHTML = `<tr><td colspan="4" class="text-danger fw-bold">No users found.</td></tr>`;
      return;
    }

    const format = nameFormatSelect.value;

    users.forEach((user, index) => {
      const row = document.createElement("tr");

      const nameCell = document.createElement("td");
      nameCell.textContent = format === "first" ? user.name.first : user.name.last;

      const genderCell = document.createElement("td");
      genderCell.textContent = user.gender;

      const emailCell = document.createElement("td");
      emailCell.textContent = user.email;

      const countryCell = document.createElement("td");
      countryCell.textContent = user.location.country;

      row.appendChild(nameCell);
      row.appendChild(genderCell);
      row.appendChild(emailCell);
      row.appendChild(countryCell);

      row.addEventListener("dblclick", () => {
        selectedUserIndex = index;
        showUserModal(user);
      });

      userRows.appendChild(row);
    });
  }

  // Show modal with user info
  function showUserModal(user) {
    userPic.src = user.picture.large;
    userFullName.textContent = `${user.name.title} ${user.name.first} ${user.name.last}`;
    userEmail.textContent = "📧 Email: " + user.email;
    userPhone.textContent = "📱 Phone: " + user.phone;
    userDob.textContent = "🎂 Date: " + new Date(user.dob.date).toLocaleDateString();
    userGender.textContent = "⚧ Gender: " + user.gender;
    userAddress.textContent = "🏠 Address: " +
      `${user.location.street.number} ${user.location.street.name}, ${user.location.city}, ${user.location.state}, ${user.location.country}`;
    userModal.show();
  }

  // Delete user
  deleteUserBtn.addEventListener("click", () => {
    if (selectedUserIndex !== null) {
      currentUsers.splice(selectedUserIndex, 1);
      renderUsers(currentUsers);
      userModal.hide();
    }
  });

  // Edit user
  editUserBtn.addEventListener("click", () => {
  return new Promise((resolve, reject) => {
    if (selectedUserIndex === null) {
      reject(new Error("No user selected"));
      return;
    }

    const user = currentUsers[selectedUserIndex];

    // Switch to edit mode
    document.getElementById("userDisplay").classList.add("d-none");
    editForm.classList.remove("d-none");
    editUserBtn.classList.add("d-none");
    saveUserBtn.classList.remove("d-none");

    // Prefill form
    document.getElementById("editFirstName").value = user.name.first;
    document.getElementById("editLastName").value = user.name.last;
    document.getElementById("editEmail").value = user.email;
    document.getElementById("editPhone").value = user.phone;
    document.getElementById("editGender").value = user.gender;
    document.getElementById("editDob").value = user.dob.date.split("T")[0];
    document.getElementById("editStreet").value = `${user.location.street.number} ${user.location.street.name}`;
    document.getElementById("editCity").value = user.location.city;
    document.getElementById("editState").value = user.location.state;
    document.getElementById("editCountry").value = user.location.country;

    resolve("Edit mode ready");
  });
});

  // Save user with validation
    saveUserBtn.addEventListener("click", () => {
      return new Promise((resolve, reject) => {
        if (selectedUserIndex === null) {
          reject("⚠️ No user selected.");
          return;
        }

        const user = currentUsers[selectedUserIndex];

        const firstName = document.getElementById("editFirstName").value.trim();
        const lastName = document.getElementById("editLastName").value.trim();
        const email = document.getElementById("editEmail").value.trim();
        const phone = document.getElementById("editPhone").value.trim();
        const gender = document.getElementById("editGender").value;
        const dob = document.getElementById("editDob").value;
        const streetInput = document.getElementById("editStreet").value.trim();
        const city = document.getElementById("editCity").value.trim();
        const state = document.getElementById("editState").value.trim();
        const country = document.getElementById("editCountry").value.trim();

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        // Validation checks
        if (!firstName || !lastName) {
          reject(new Error ("⚠️ First name and last name are required."));
          return;
        }

        if (firstName === lastName) {
          reject(new Error ("⚠️ First name and last name must be different."));
          return;
        }

        if (!isNaN(firstName) || !isNaN(lastName)) {
          reject(new Error ("⚠️ Name must not be a number."));
          return;
        }

        if (!email) {
          reject(new Error ("⚠️ Email is required."));
          return;
        }

        if (!emailPattern.test(email)) {
          reject(new Error ("⚠️ Invalid email format."));
          return;
        }

        if (!phone) {
          reject(new Error ("⚠️ Phone number is required."));
          return;
        }

        if (phone.replace(/\D/g, "").length < 5) {
          reject(new Error ("⚠️ Please enter a valid phone number."));
          return;
        }

        if (!dob) {
          reject(new Error ("⚠️ Date of birth is required."));
          return;
        }

        if (!country) {
          reject(new Error ("⚠️ Country is required."));
          return;
        }


        // Update user object
        user.name.first = firstName;
        user.name.last = lastName;
        user.email = email;
        user.phone = phone;
        user.gender = gender;
        user.dob.date = new Date(dob).toISOString();

        const streetParts = streetInput.split(" ");
        user.location.street.number = parseInt(streetParts.shift()) || 0;
        user.location.street.name = streetParts.join(" ");
        user.location.city = city;
        user.location.state = state;
        user.location.country = country;

        // Refresh and return to view mode
        renderUsers(currentUsers);
        showUserModal(user);

        document.getElementById("userDisplay").classList.remove("d-none");
        editForm.classList.add("d-none");
        editUserBtn.classList.remove("d-none");
        saveUserBtn.classList.add("d-none");

        resolve("✅ User saved successfully!");
      })
      .then((msg) => {
        alert(msg);
      })
      .catch((err) => {
        alert(err);
      });
    });

  // Event listeners
  generateBtn.addEventListener("click", generateUsers);
  nameFormatSelect.addEventListener("change", generateUsers);
});