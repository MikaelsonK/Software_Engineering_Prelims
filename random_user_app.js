document.addEventListener('DOMContentLoaded', function () {
  const userCountInput = document.getElementById('userCount');
  const nameTypeSelect = document.getElementById('nameTypeHeader');
  const generateBtn = document.getElementById('generateBtn');
  const userList = document.getElementById('userList');
  const errorAlert = document.getElementById('errorAlert');
  const loading = document.getElementById('loading');

  let allUsers = []; // basket
  let currentlySelectedUserIndex = -1;

  const userModal = new bootstrap.Modal(document.getElementById('userModal'));
  const editUserModal = new bootstrap.Modal(document.getElementById('editUserModal'));

  // Prevent form from submitting
    document.getElementById('editUserForm').addEventListener('submit', function (e) {
      e.preventDefault();
    });

  // Event listeners
  generateBtn.addEventListener('click', fetchUsers);
  nameTypeSelect.addEventListener('change', () => displayUsers(allUsers));
  document.getElementById('modalDeleteBtn').addEventListener('click', removeUser);
  document.getElementById('modalEditBtn').addEventListener('click', showEditForm);
  document.getElementById('saveChangesBtn').addEventListener('click', updateUserInfo);

  // Fetch users from API
  async function fetchUsers() {
    const numberOfUsers = parseInt(userCountInput.value);
    if (isNaN(numberOfUsers) || numberOfUsers < 1 || numberOfUsers > 1000) {
      showMessage('Please enter a number between 1 and 1000', true);
      return;
    }

    showLoadingState(true);
    hideErrorMessage();
    userList.innerHTML = '';

    try {
      const response = await fetch(`https://randomuser.me/api/?results=${numberOfUsers}`);
      if (!response.ok) throw new Error('API error');

      const userData = await response.json();
      allUsers = userData.results;
      displayUsers(allUsers);
    } catch (error) {
      showMessage("Couldn't get users right now. Please try again.", true);
    } finally {
      showLoadingState(false);
    }
  }

  // Display users
  function displayUsers(users) {
    userList.innerHTML = '';
    const nameDisplayStyle = nameTypeSelect.value;

    users.forEach((user, index) => {
      const displayName = nameDisplayStyle === 'first' ? user.name.first : user.name.last;

      const userRow = document.createElement('div');
      userRow.className = 'user-row d-flex align-items-center';
      userRow.setAttribute('data-index', index);

      // Double-click to open edit modal
      userRow.addEventListener('dblclick', () => {
        currentlySelectedUserIndex = index;
        showEditForm();
      });

      // Optional: single-click opens details modal
      userRow.addEventListener('click', () => {
        currentlySelectedUserIndex = index;
        showUserDetails(index);
      });

      userRow.innerHTML = `
        <div class="user-col name" style="flex:2; text-align:left; padding-left:5px;">${displayName}</div>
      
        <div class="user-col email" style="flex:3; text-align:center; padding-left:5px;">${user.email}</div>
        <div class="user-col country" style="flex:2; text-align:right; padding-right:5px;">${user.location.country}</div>
      `;

      userList.appendChild(userRow);
    });
  }

  // Show user details modal
  function showUserDetails(index) {
    const user = allUsers[index];
    document.getElementById('modalUserImage').src = user.picture.large;
    document.getElementById('modalUserFullName').textContent = `${user.name.title} ${user.name.first} ${user.name.last}`;
    document.getElementById('modalUserEmail').textContent = user.email;
    document.getElementById('modalUserPhone').textContent = user.phone || '';
    document.getElementById('modalUserCell').textContent = user.cell || '';
    document.getElementById('modalUserDob').textContent = new Date(user.dob.date).toLocaleDateString();
    document.getElementById('modalUserGender').textContent = capitalizeFirstLetter(user.gender);

    const addr = user.location;
    document.getElementById('modalUserAddress').textContent =
      `${addr.street.number} ${addr.street.name}, ${addr.city}, ${addr.state}, ${addr.country}, ${addr.postcode}`;

    userModal.show();
  }

  // Open edit modal
  function showEditForm() {
    if (currentlySelectedUserIndex === -1) return;
    const user = allUsers[currentlySelectedUserIndex];

    document.getElementById('editUserIndex').value = currentlySelectedUserIndex;
    document.getElementById('editFirstName').value = user.name.first;
    document.getElementById('editLastName').value = user.name.last;
    document.getElementById('editEmail').value = user.email;
    document.getElementById('editPhone').value = user.phone || '';
    document.getElementById('editCell').value = user.cell || '';
    document.getElementById('editDob').value = new Date(user.dob.date).toISOString().split('T')[0];
    document.querySelector(`input[name="editGender"][value="${user.gender}"]`).checked = true;

    const streetParts = `${user.location.street.number} ${user.location.street.name}`.split(' ');
    document.getElementById('editStreet').value = streetParts.join(' ');
    document.getElementById('editCity').value = user.location.city;
    document.getElementById('editState').value = user.location.state;
    document.getElementById('editCountry').value = user.location.country;
    document.getElementById('editPostcode').value = user.location.postcode;

    userModal.hide(); // hide details modal if open
    editUserModal.show();
  }

  // Delete user
  function removeUser() {
    if (currentlySelectedUserIndex !== -1) {
      allUsers.splice(currentlySelectedUserIndex, 1);
      displayUsers(allUsers);
      userModal.hide();
      currentlySelectedUserIndex = -1;
    }
  }

  // Save edited user info
  function updateUserInfo() {
    const index = parseInt(document.getElementById('editUserIndex').value);
    if (isNaN(index)) return;

    const firstName = document.getElementById('editFirstName').value;
    const lastName = document.getElementById('editLastName').value;
    const email = document.getElementById('editEmail').value;
    const phone = document.getElementById('editPhone').value;
    const cell = document.getElementById('editCell').value;
    const dob = document.getElementById('editDob').value;
    const gender = document.querySelector('input[name="editGender"]:checked').value;

    const street = document.getElementById('editStreet').value;
    const city = document.getElementById('editCity').value;
    const state = document.getElementById('editState').value;
    const country = document.getElementById('editCountry').value;
    const postcode = document.getElementById('editPostcode').value;

    const streetParts = street.trim().split(' ');
    allUsers[index].name.first = firstName;
    allUsers[index].name.last = lastName;
    allUsers[index].email = email;
    allUsers[index].phone = phone;
    allUsers[index].cell = cell;
    allUsers[index].dob.date = new Date(dob).toISOString();
    allUsers[index].gender = gender;
    allUsers[index].location.street = { number: streetParts[0], name: streetParts.slice(1).join(' ') };
    allUsers[index].location.city = city;
    allUsers[index].location.state = state;
    allUsers[index].location.country = country;
    allUsers[index].location.postcode = postcode;

    displayUsers(allUsers);
    editUserModal.hide();
    showMessage('User updated successfully!', false);
  }

  // Helpers
  function showMessage(message, isError = false) {
    errorAlert.textContent = message;
    errorAlert.style.display = 'block';
    errorAlert.className = isError ? 'alert alert-danger mt-3' : 'alert alert-success mt-3';
    setTimeout(() => { errorAlert.style.display = 'none'; }, 3000);
  }

  function hideErrorMessage() {
    errorAlert.style.display = 'none';
  }

  function showLoadingState(show) {
    loading.style.display = show ? 'block' : 'none';
    generateBtn.disabled = show;
  }

  function capitalizeFirstLetter(text) {
    return text ? text.charAt(0).toUpperCase() + text.slice(1) : '';
  }
});
   