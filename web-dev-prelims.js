let usersData = [];
let currentEditIndex = -1;

function showError(message) {
    document.getElementById("errorModalBody").innerText = message;
    const modal = new bootstrap.Modal(document.getElementById("errorModal"));
    modal.show();
}

function fetchUsers() {
    const count = parseInt(document.getElementById("randomUserNumber").value);

    if (isNaN(count) || count < 1 || count > 1000) {
        showError("Please enter a valid number from 1 to 1000.");
        return;
    }
    const url = `https://randomuser.me/api/?results=${count}&inc=name,gender,location,email,phone,cell,dob,picture`;

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error("Failed to fetch users. Please try again.");
            }
            return response.json();
        })
        .then(data => {
            usersData = data.results;
            displayUsers();
        })
        .catch(error => {
            showError(error.message);
        });
}

function displayUsers() {
    const nameSelect = document.getElementById("name").value;
    let html = "";

    usersData.forEach((user, index) => {
        let displayName = nameSelect === 'first-name' ? user.name.first : user.name.last;

        html += `
            <tr data-index="${index}">
                <td>${displayName}</td>
                <td>${user.gender}</td>
                <td>${user.email}</td>
                <td>${user.location.country}</td>
            </tr>
        `;
    });
    const tbody = document.querySelector("#user-list tbody");
    tbody.innerHTML = html;

    tbody.querySelectorAll("tr").forEach(row => {
        row.addEventListener("click", () => {
            const index = row.getAttribute("data-index");
            showUser(index);
        });
    });
}

function showUser(index) {
    const user = usersData[index];
    currentEditIndex = index;

    // display original user info
    document.getElementById("userImage").src = user.picture.large;
    document.getElementById("userFullName").innerText = `${user.name.title} ${user.name.first} ${user.name.last}`;
    document.getElementById("userEmail").innerText = `${user.email}`;
    document.getElementById("userTelephone").innerText = `${user.phone}`;
    document.getElementById("userCellphone").innerText = `${user.cell}`;
    document.getElementById("userGender").innerText = `${user.gender}`;
    document.getElementById("userDOB").innerText = new Date(user.dob.date).toLocaleDateString();
    document.getElementById("userAddress").innerText = `${user.location.street.number} ${user.location.street.name}, ${user.location.city}, ${user.location.state}, ${user.location.country}, ${user.location.postcode}`;
    
    // set buttons to edit and delete
    document.getElementById("editUserBtn").innerText = "Edit";
    document.getElementById("editUserBtn").onclick = () => enableEditMode();

    document.getElementById("deleteUserBtn").innerText = "Delete";
    document.getElementById("deleteUserBtn").onclick = () => showDeleteConfirmModal();

    const userModal = new bootstrap.Modal(document.getElementById("userModal"));
    userModal.show();
}

function enableEditMode() {
    document.getElementById("userFullName").contentEditable = "true";
    document.getElementById("userEmail").contentEditable = "true";
    document.getElementById("userTelephone").contentEditable = "true";
    document.getElementById("userCellphone").contentEditable = "true";
    document.getElementById("userGender").contentEditable = "true";
    document.getElementById("userDOB").contentEditable = "true";
    document.getElementById("userAddress").contentEditable = "true";

    document.getElementById("editUserBtn").innerText = "Save";
    document.getElementById("editUserBtn").onclick = () => saveEdits();

    document.getElementById("deleteUserBtn").innerText = "Cancel";
    document.getElementById("deleteUserBtn").onclick = () => cancelEdit();
}

function saveEdits() {
    const user = usersData[currentEditIndex];

    const fullName = document.getElementById("userFullName").innerText.split(" ");
    user.name.title = fullName.shift();
    user.name.last = fullName.pop();
    user.name.first = fullName.join(" ");

    user.email = document.getElementById("userEmail").innerText;
    user.phone = document.getElementById("userTelephone").innerText;
    user.cell = document.getElementById("userCellphone").innerText;
    user.gender = document.getElementById("userGender").innerText;
    user.dob.date = new Date(document.getElementById("userDOB").innerText);
    const addressParts = document.getElementById("userAddress").innerText.split(", ");
    user.location.street.name = addressParts[0].split(" ").slice(1).join(" ");
    user.location.street.number = addressParts[0].split(" ")[0];
    user.location.city = addressParts[1];
    user.location.state = addressParts[2];
    user.location.country = addressParts[3];
    user.location.postcode = addressParts[4];

    displayUsers();
    disableEditMode();
    const userModal = bootstrap.Modal.getInstance(document.getElementById("userModal"));
    userModal.hide();
}

function cancelEdit() {
    showUser(currentEditIndex);
}

function disableEditMode() {
    document.getElementById("userFullName").contentEditable = "false";
    document.getElementById("userEmail").contentEditable = "false";
    document.getElementById("userTelephone").contentEditable = "false";
    document.getElementById("userCellphone").contentEditable = "false";
    document.getElementById("userGender").contentEditable = "false";
    document.getElementById("userDOB").contentEditable = "false";
    document.getElementById("userAddress").contentEditable = "false";
}

function showDeleteConfirmModal() {
    const confirmModal = new bootstrap.Modal(document.getElementById("deleteConfirmModal"));
    document.getElementById("confirmDeleteBtn").onclick = () => deleteUser();
    confirmModal.show();
}

function deleteUser() {
    usersData.splice(currentEditIndex, 1);
    displayUsers();

    const userModal = bootstrap.Modal.getInstance(document.getElementById("userModal"));
    userModal.hide();
    const confirmModal = bootstrap.Modal.getInstance(document.getElementById("deleteConfirmModal"));
    confirmModal.hide();
}

document.getElementById("randomUserNumber").addEventListener("change", fetchUsers);
document.getElementById("name").addEventListener("change", displayUsers);