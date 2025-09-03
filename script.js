const numUsers = document.getElementById('numUsers')
const typeName = document.getElementById('nameSelector')
const errorAlert = document.getElementById('errorAlert')
const userContainer = document.getElementById('userContainer')
const modal = new bootstrap.Modal(document.getElementById('userModal'));

let userData = [];

numUsers.addEventListener('input', fetchUsers);
typeName.addEventListener('change', () => displayUsers(userData));

async function fetchUsers() {
    const count = Number(numUsers.value)
   
    if (!count || count <= 0 || count > 1000) {
        showError("Please enter a valid number of users between 0-1000")
        userData = null
        displayUsers(userData)
        return;
    }
    hideError();
    userContainer.innerHTML = '<div class="text-center mt-3">Finding users...';
    const timeoutId = setTimeout(() => {
        showError("Check on your Internet, the request took too long.");
    }, 20000);

    fetch(`https://randomuser.me/api/?results=${count}`)
        .then(response => {
            if (!response.ok) {
                clearTimeout(timeoutId);
                throw new Error(`API error: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log(data);
            clearTimeout(timeoutId);
            userData = data.results
            displayUsers(userData);
        })
        .catch(error=> {
            clearTimeout(timeoutId);
            showError(`Failed to fetch users: ${error.message}`);
            console.error(`Fetch error:`, error);
        })
}

function showError(message) {
    if (errorAlert) {
    errorAlert.textContent = message;
    errorAlert.classList.remove('d-none');
    errorAlert.classList.add('alert', 'alert-danger', 'mt-3');

    }
}

function hideError() {
    errorAlert.classList.add('d-none'); 
    errorAlert.classList.remove('alert', 'alert-danger', 'mt-3');
}

function displayUsers(users) {
    numUsers.value = users ? users.length : null;
    
    if (!users || users.length === 0){
        userContainer.innerHTML = '<div class="text-center"> No users found </div>';
        return;
    }
    const nameType = typeName.value || 'first';

    const usersHTML = users.map((user,i) => {
        let displayName;
        switch(nameType) {
            case 'first':
                displayName = user.name.first;
                break;
            case 'last':
                displayName = user.name.last;
                break;
            default:
                displayName = `${user.name.first}`;
        }
        
        return `
            <div class="user-row d-flex justify-content-between align-items-center bg-light shadow-sm rounded-pill p-3 mb-2" data-index="${i}">
                <div class="text-center" style="flex: 1">${displayName}</div>
                <div class="text-center" style="flex: 1">${user.gender}</div>
                <div class="text-center" style="flex: 1">${user.email}</div>
                <div class="text-center" style="flex: 1">${user.location.country}</div>
            </div>
        `;
    }).join('');
    userContainer.innerHTML = usersHTML;

    document.querySelectorAll('.user-row').forEach(row => {
        row.addEventListener('dblclick', () => openModal(row.dataset.index))
    });
}

function openModal(index) {
    const user = userData[index];
    document.getElementById('modalContent').innerHTML = `
    <div class="d-flex gap-3">
        <div class="flex-shrink-0">
            <img src="${user.picture.large}" class="rounded" alt="Photo">
        </div>
        <div class="flex-grow-1">
            <div class="mb-2">
                <span class="badge bg-secondary">${user.name.title} ${user.name.first} ${user.name.last}</span>
            </div>
            <div class="mb-2">
                <span class="badge bg-secondary flex-wrap">
                    Address: ${user.location.street.number} ${user.location.street.name}, ${user.location.city}, ${user.location.state}, ${user.location.country}, ${user.location.postcode}
                </span>
            </div>
            <div class="mb-2">
                <span class="badge bg-secondary">Email: ${user.email}</span>
            </div>
            <div class="mb-2">
                <span class="badge bg-secondary">Cell: ${user.cell}</span>
            </div>
            <div class="mb-2">
                <span class="badge bg-secondary">Gender: ${user.gender}</span>
            </div>
            <div class="mb-2">
                <span class="badge bg-secondary">DOB: ${new Date(user.dob.date).toLocaleDateString()}</span>
            </div>
        </div>
    </div>
    `
    document.getElementById('deleteUser').onclick = () => {
        userData.splice(index,1);
        displayUsers(userData);
        modal.hide()
    };  

    document.getElementById('editUser').onclick = () => {
         const newFirst = prompt("Enter new first name:", user.name.first);
        const newLast = prompt("Enter new last name:", user.name.last);
        const newEmail = prompt("Enter new email:", user.email);
        const newGender = prompt("Enter new gender:", user.gender);
        const newCountry = prompt("Enter new country:", user.location.country);

        
        if (newFirst) user.name.first = newFirst;
        if (newLast) user.name.last = newLast;
        if (newEmail) user.email = newEmail;
        if (newGender) user.gender = newGender;
        if (newCountry) user.location.country = newCountry;

        
        displayUsers(userData);
        modal.hide();
    };
    modal.show()
}




