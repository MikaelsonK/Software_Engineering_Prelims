document.addEventListener('DOMContentLoaded', function () {
  // Inputs
  const userCountInput = document.getElementById('userCount');
  const nameFormatSelect = document.getElementById('nameFormat');
  const generateBtn = document.getElementById('generateBtn');
  const usersBody = document.getElementById('usersBody');
  const errorMessage = document.getElementById('errorMessage');
  const headerBox = document.getElementById('headerBox');
  const modalEl = document.getElementById('userModal');
  const modalInstance = bootstrap.Modal.getOrCreateInstance(modalEl); 
  
  let usersData = []; //users from the API
  let selectedUserIndex = null; //interact for edit and delete


  function removeBackdrops() { // cant load the user // returns node
    document.querySelectorAll('.modal-backdrop').forEach(b => b.remove()); //indivelem
  } 

  function cleanupModal() { //cant click the generate
    document.body.classList.remove('modal-open');
    document.body.style.overflow = ''; //restores normal flow
    document.body.style.paddingRight = ''; //remove padding
    removeBackdrops();
  }

  // modalEl.addEventListener('hidden.bs.modal', cleanupModal);

  //This function determines the correct range of user input
  function validUserCount() { //error
    const count = parseInt(userCountInput.value);
    if (isNaN(count) || count < 1 || count > 1000) {
      showError('Please enter a number between 1 and 1000');
      return false;
    }
    return true;
  }
  
  function userRows(users, nameFormat) { 
    if (!users || users.length === 0) { 
      usersBody.innerHTML = '<tr><td colspan="4"><div class="loading">No users to display</div></td></tr>';
      return;
    }

    usersBody.innerHTML = ''; //empties the row

    users.forEach((user, index) => { //postion of users
      //row 
      const row = document.createElement('tr');
      const name = nameFormat === 'first' ? `${user.name.first}` : `${user.name.last}`;
      // row.style.animationDelay = `${index * 0.05}s`;
      
      row.innerHTML = `
        <td><img src="${user.picture.thumbnail}" class="user-avatar" alt="User">${name.charAt(0).toUpperCase() + name.slice(1)}</td>
        <td>${user.gender.charAt(0).toUpperCase() + user.gender.slice(1)}</td>
        <td>${user.email}</td>
        <td>${user.location.country.charAt(0).toUpperCase() + user.location.country.slice(1)}</td>
      `;

      row.addEventListener('dblclick', () => {
        selectedUserIndex = index;
        openUserModal(user);
      });
      usersBody.appendChild(row); //complete
    }); 

  }

  async function fetchUsers(count) { //prevent UI to freeze
    //loading message
    try {
      usersBody.innerHTML = '<tr><td colspan="4"><div class="loading">Loading users...</div></td></tr>';
      generateBtn.disabled = true;

      const response = await fetch(`https://randomuser.me/api/?results=${count}`); 
      if (!response.ok) throw new Error(`API responded with status ${response.status}`); //api fail
      
      const data = await response.json(); //converts from raw // await pause // process API
      usersData = data.results;
      userRows(usersData, nameFormatSelect.value);

      headerBox.classList.add('glow'); //header
      setTimeout(() => headerBox.classList.remove('glow'), 800);
    } 
    
    catch (error) { //handle errors
      showError(`Failed to fetch users: ${error.message}`);
      usersBody.innerHTML = '<tr><td colspan="4"><div class="loading">Error loading users</div></td></tr>';
    } finally { //always run
      generateBtn.disabled = false;
    }
  }

  generateBtn.addEventListener('click', function () { //generate
    if (validUserCount()) {
      const count = parseInt(userCountInput.value);
      if (count === 0) {
        usersBody.innerHTML = '<tr><td colspan="4"><div class="loading">No users to display</div></td></tr>';
        return;
      }
      fetchUsers(count);
    }
  });

  nameFormatSelect.addEventListener('change', function () { //first and last name toggle
    if (usersData.length > 0) userRows(usersData, nameFormatSelect.value);
  });

  userCountInput.addEventListener('change', validUserCount);

  function showError(message) { //error handling
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
    setTimeout(() => { errorMessage.style.display = 'none'; }, 5000);
  }

  function openUserModal(user) {
    if (!user) return; //no user data
    removeBackdrops(); //cleanup

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

    modalInstance.show(); //show modal popup
  }

  document.getElementById('deleteUserBtn').addEventListener('click', () => {
    if (selectedUserIndex !== null && selectedUserIndex >= 0 && usersData[selectedUserIndex]) { //user is selected
      usersData.splice(selectedUserIndex, 1); //array in users
      userRows(usersData, nameFormatSelect.value);
      modalInstance.hide(); //popup
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
      document.getElementById('editDob').value = user.dob.date.split('T')[0]; //ISO FORMAT
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
