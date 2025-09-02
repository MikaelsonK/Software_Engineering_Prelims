document.addEventListener('DOMContentLoaded', function () {
  const userCountInput = document.getElementById('userCount');
  const nameFormatSelect = document.getElementById('nameFormat');
  const generateBtn = document.getElementById('generateBtn');
  const usersBody = document.getElementById('usersBody');
  const errorMessage = document.getElementById('errorMessage');
  const headerBox = document.getElementById('headerBox');

  let usersData = [];
  let selectedUserIndex = null;

  const modalEl = document.getElementById('userModal');
  const modalInstance = bootstrap.Modal.getOrCreateInstance(modalEl);

  function removeBackdrops() {
    document.querySelectorAll('.modal-backdrop').forEach(b => b.remove());
  }

  function cleanupModal() {
    document.body.classList.remove('modal-open');
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
    removeBackdrops();
  }

  modalEl.addEventListener('hidden.bs.modal', cleanupModal);

  function validUserCount() {
    const count = parseInt(userCountInput.value);
    if (isNaN(count) || count < 0 || count > 1000) {
      showError('Please enter a number between 0 and 1000');
      return false;
    }
    return true;
  }

  function userRows(users, nameFormat) {
    if (!users || users.length === 0) {
      usersBody.innerHTML = '<tr><td colspan="4"><div class="loading">No users to display</div></td></tr>';
      return;
    }
    usersBody.innerHTML = '';
    users.forEach((user, index) => {
      const row = document.createElement('tr');
      const name = nameFormat === 'first' ? `${user.name.first}` : `${user.name.last}`;
      row.style.animationDelay = `${index * 0.05}s`;
      row.innerHTML = `
        <td><img src="${user.picture.thumbnail}" class="user-avatar" alt="User">${name}</td>
        <td>${user.gender}</td>
        <td>${user.email}</td>
        <td>${user.location.country}</td>
      `;
      row.addEventListener('dblclick', () => {
        selectedUserIndex = index;
        openUserModal(user);
      });
      usersBody.appendChild(row);
    });
  }

  async function fetchUsers(count) {
    try {
      usersBody.innerHTML = '<tr><td colspan="4"><div class="loading">Loading users...</div></td></tr>';
      generateBtn.disabled = true;
      const response = await fetch(`https://randomuser.me/api/?results=${count}`);
      if (!response.ok) throw new Error(`API responded with status ${response.status}`);
      const data = await response.json();
      usersData = data.results;
      userRows(usersData, nameFormatSelect.value);

      headerBox.classList.add('glow');
      setTimeout(() => headerBox.classList.remove('glow'), 800);
    } catch (error) {
      showError(`Failed to fetch users: ${error.message}`);
      usersBody.innerHTML = '<tr><td colspan="4"><div class="loading">Error loading users. Please try again.</div></td></tr>';
    } finally {
      generateBtn.disabled = false;
    }
  }

  generateBtn.addEventListener('click', function () {
    if (validUserCount()) {
      const count = parseInt(userCountInput.value);
      if (count === 0) {
        usersBody.innerHTML = '<tr><td colspan="4"><div class="loading">No users to display</div></td></tr>';
        return;
      }
      fetchUsers(count);
    }
  });

  nameFormatSelect.addEventListener('change', function () {
    if (usersData.length > 0) userRows(usersData, nameFormatSelect.value);
  });

  userCountInput.addEventListener('change', validUserCount);

  function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
    setTimeout(() => { errorMessage.style.display = 'none'; }, 5000);
  }

  function openUserModal(user) {
    if (!user) return;
    removeBackdrops();

    document.getElementById('modalPicture').src = user.picture.large;
    document.getElementById('modalName').textContent = `${user.name.first} ${user.name.last}`;
    document.getElementById('modalAddress').textContent =
      `${user.location.street.number} ${user.location.street.name}, ${user.location.city}, ${user.location.state}, ${user.location.country}, ${user.location.postcode}`;
    document.getElementById('modalEmail').textContent = user.email;
    document.getElementById('modalPhone').textContent = user.phone;
    document.getElementById('modalCell').textContent = user.cell;
    document.getElementById('modalDob').textContent = new Date(user.dob.date).toLocaleDateString('en-US');
    document.getElementById('modalGender').textContent = user.gender;

    document.getElementById("viewMode").style.display = "block";
    document.getElementById("editMode").style.display = "none";
    document.getElementById("editUserBtn").style.display = "inline-block";
    document.getElementById("saveUserBtn").style.display = "none";

    modalInstance.show();
  }

  document.getElementById('deleteUserBtn').addEventListener('click', () => {
    if (selectedUserIndex !== null && selectedUserIndex >= 0 && usersData[selectedUserIndex]) {
      usersData.splice(selectedUserIndex, 1);
      userRows(usersData, nameFormatSelect.value);
      modalInstance.hide();
    }
  });

  document.getElementById('editUserBtn').addEventListener('click', () => {
    if (selectedUserIndex !== null && usersData[selectedUserIndex]) {
      const user = usersData[selectedUserIndex];
      document.getElementById('editName').value = `${user.name.first} ${user.name.last}`;
      document.getElementById('editAddress').value =
        `${user.location.street.number} ${user.location.street.name}, ${user.location.city}, ${user.location.state}, ${user.location.country}, ${user.location.postcode}`;
      document.getElementById('editEmail').value = user.email;
      document.getElementById('editPhone').value = user.phone;
      document.getElementById('editCell').value = user.cell;
      document.getElementById('editDob').value = user.dob.date.split('T')[0];
      document.getElementById('editGender').value = user.gender;

      document.getElementById("viewMode").style.display = "none";
      document.getElementById("editMode").style.display = "block";
      document.getElementById("editUserBtn").style.display = "none";
      document.getElementById("saveUserBtn").style.display = "inline-block";
    }
  });

  document.getElementById('saveUserBtn').addEventListener('click', () => {
    if (selectedUserIndex !== null && usersData[selectedUserIndex]) {
      const user = usersData[selectedUserIndex];
      const fullName = document.getElementById('editName').value.split(" ");
      user.name.first = fullName[0] || user.name.first;
      user.name.last = fullName.slice(1).join(" ") || user.name.last;

      user.location.street.number = 0;
      user.location.street.name = document.getElementById('editAddress').value;
      user.email = document.getElementById('editEmail').value;
      user.phone = document.getElementById('editPhone').value;
      user.cell = document.getElementById('editCell').value;
      user.dob.date = document.getElementById('editDob').value;
      user.gender = document.getElementById('editGender').value;

      userRows(usersData, nameFormatSelect.value);
      openUserModal(user);
    }
  });
});
