let usersData = [];
let currentUserIndex = -1;

document.getElementById('generateBtn').addEventListener('click', async () => {
  const count = Number(document.getElementById('userCount').value);
  const nameOption = document.getElementById('nameOption').value;
  const tableBody = document.getElementById('userTable');
  tableBody.innerHTML = '';

  if (!count || count < 0 || count > 1000) {
    alert("Please enter a number between 0 and 1000");
    return;
  }

  try {
    const response = await fetch(`https://randomuser.me/api/?results=${count}`);
    if (!response.ok) throw new Error("API request failed");

    const data = await response.json();
    usersData = data.results;

    data.results.forEach((user, index) => {
      const row = document.createElement('tr');
      const name = nameOption === 'first' ? user.name.first : user.name.last;
      
      row.setAttribute('data-index', index);
      
      row.addEventListener('dblclick', () => {
        openUserModal(index);
      });

      row.innerHTML = `
        <td>${name}</td>
        <td>${user.gender}</td>
        <td>${user.email}</td>
        <td>${user.location.country}</td>
      `;

      tableBody.appendChild(row);
    });
  } catch (error) {
    alert("Unable to load users. Please try again later.");
    console.error(error);
  }
});

function openUserModal(index) {
  currentUserIndex = index;
  const user = usersData[index];
  
  document.getElementById('modalUserImage').src = user.picture.large;
  document.getElementById('modalUserName').textContent = `${user.name.first} ${user.name.last}`;
  document.getElementById('modalUserGender').textContent = `Gender: ${user.gender}`;
  document.getElementById('modalUserFullName').textContent = `${user.name.title} ${user.name.first} ${user.name.last}`;
  
  const dobDate = new Date(user.dob.date);
  const formattedDob = `${dobDate.getDate()}/${dobDate.getMonth() + 1}/${dobDate.getFullYear()} (${user.dob.age} years)`;
  document.getElementById('modalUserDob').textContent = formattedDob;
  
  document.getElementById('modalUserEmail').textContent = user.email;
  document.getElementById('modalUserPhone').textContent = user.phone;
  document.getElementById('modalUserCell').textContent = user.cell;
  document.getElementById('modalUserStreet').textContent = `${user.location.street.number} ${user.location.street.name}`;
  document.getElementById('modalUserCity').textContent = user.location.city;
  document.getElementById('modalUserState').textContent = user.location.state;
  document.getElementById('modalUserCountry').textContent = user.location.country;
  document.getElementById('modalUserPostcode').textContent = user.location.postcode;
  
  const userModal = new bootstrap.Modal(document.getElementById('userModal'));
  userModal.show();
}

document.getElementById('deleteUserBtn').addEventListener('click', () => {
  if (currentUserIndex !== -1) {
    const tableRow = document.querySelector(`tr[data-index="${currentUserIndex}"]`);
    if (tableRow) {
      tableRow.remove();
    }
    
    usersData.splice(currentUserIndex, 1);
    
    const rows = document.querySelectorAll('#userTable tr');
    rows.forEach((row, index) => {
      row.setAttribute('data-index', index);
    });
    
    const userModal = bootstrap.Modal.getInstance(document.getElementById('userModal'));
    userModal.hide();
  }
});

document.getElementById('editUserBtn').addEventListener('click', () => {
  if (currentUserIndex !== -1) {
    const user = usersData[currentUserIndex];
    
    document.getElementById('editFirstName').value = user.name.first;
    document.getElementById('editLastName').value = user.name.last;
    document.getElementById('editEmail').value = user.email;
    document.getElementById('editPhone').value = user.phone;
    document.getElementById('editCity').value = user.location.city;
    document.getElementById('editCountry').value = user.location.country;
    
    const userModal = bootstrap.Modal.getInstance(document.getElementById('userModal'));
    userModal.hide();
    
    const editModal = new bootstrap.Modal(document.getElementById('editUserModal'));
    editModal.show();
  }
});

document.getElementById('saveUserBtn').addEventListener('click', () => {
  if (currentUserIndex !== -1) {
    const user = usersData[currentUserIndex];
    
    user.name.first = document.getElementById('editFirstName').value;
    user.name.last = document.getElementById('editLastName').value;
    user.email = document.getElementById('editEmail').value;
    user.phone = document.getElementById('editPhone').value;
    user.location.city = document.getElementById('editCity').value;
    user.location.country = document.getElementById('editCountry').value;
    
    const nameOption = document.getElementById('nameOption').value;
    const name = nameOption === 'first' ? user.name.first : user.name.last;
    
    const tableRow = document.querySelector(`tr[data-index="${currentUserIndex}"]`);
    if (tableRow) {
      tableRow.innerHTML = `
        <td>${name}</td>
        <td>${user.gender}</td>
        <td>${user.email}</td>
        <td>${user.location.country}</td>
      `;
      
      tableRow.setAttribute('data-index', currentUserIndex);
      tableRow.addEventListener('dblclick', () => {
        openUserModal(currentUserIndex);
      });
    }
    
    const editModal = bootstrap.Modal.getInstance(document.getElementById('editUserModal'));
    editModal.hide();
  }
});