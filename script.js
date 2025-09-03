let users = [];
let selectedUserIndex = null;

function getUsers() {
    const count = parseInt(document.getElementById('userCount').value, 10);
    const errorEl = document.getElementById('error');
    const tableBody = document.getElementById('userTable');

    errorEl.textContent = '';
    tableBody.innerHTML = '';

    if (isNaN(count) || count < 0 || count > 1000) {
        errorEl.textContent = 'Please enter a valid number between 0 and 1000.';
        return;
    }

    fetch("https://randomuser.me/api/?results=" + count + "&inc=name,gender,email,location,phone,cell,dob,picture&noinfo")
        .then(res => res.json())
        .then(data => {
            users = data.results;
            showUsers();
        })
        .catch(() => {
            errorEl.textContent = 'Failed to fetch users. Please try again later.';
        });
  }
function showUsers() {
            const tableBody = document.getElementById("userTable");
            const nameType = document.getElementById("nameSelect").value;

            tableBody.innerHTML = users.map((user, index) => `
        <tr ondblclick="openUserModal(${index})">
            <td>${user.name[nameType]}</td>
            <td>${user.gender}</td>
            <td>${user.email}</td>
            <td>${user.location.country}</td>
        </tr>
    `).join("");
}

function openUserModal(index) {
    selectedUserIndex = index;
    const user = users[index];

    document.getElementById('modalImg').src = user.picture.large;
    document.getElementById('modalName').textContent = `${user.name.title} ${user.name.first} ${user.name.last}`;
    document.getElementById('modalEmail').textContent = user.email;
    document.getElementById('modalPhone').textContent = user.phone;
    document.getElementById('modalCell').textContent = user.cell;
    document.getElementById('modalDOB').textContent = new Date(user.dob.date).toLocaleDateString();
    document.getElementById('modalGender').textContent = user.gender;
    document.getElementById('modalAddress').textContent = `${user.location.street.number} ${user.location.street.name}, ${user.location.city}, ${user.location.country}`;

    const modal = new bootstrap.Modal(document.getElementById('userModal'));
    modal.show();
}

document.getElementById('deleteBtn').addEventListener('click', function () {
    if (selectedUserIndex !== null) {
        users.splice(selectedUserIndex, 1);
        showUsers();
        const modal = bootstrap.Modal.getInstance(document.getElementById('userModal'));
        modal.hide();
    }
});

document.getElementById('editBtn').addEventListener('click', function () {
    if (selectedUserIndex !== null) {
        const newEmail = prompt('Enter new email:', users[selectedUserIndex].email);
        if (newEmail && newEmail.trim() !== '') {
            users[selectedUserIndex].email = newEmail.trim();
            showUsers();
        }
    }
}); 
