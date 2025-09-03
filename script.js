const numberOfRandomUsers = document.querySelector('#number-of-users');
const button = document.querySelector('#button');
const nameOption = document.querySelector('#name-option');
const testnumber = document.querySelector('#testnumber');
const tableBody = document.querySelector('#table-body');
const userPicture = document.querySelector('#user-picture');
const userName = document.querySelector('#user-name');
const userAddress = document.querySelector('#user-address');
const userEmail = document.querySelector('#user-email');
const userPhoneNumber = document.querySelector('#user-pnumber');
const userTelephoneNumber = document.querySelector('#user-tnumber');
const userBirthdate = document.querySelector('#user-birthdate');
const userGender = document.querySelector('#user-gender');
const confirmDelete = document.querySelector('#confirm');
const cancelDelete = document.querySelector('#cancel');
const editUser = document.querySelector('#edit-user');
const deleteUser = document.querySelector('#delete-user');
const confirmEdit = document.querySelector('#confirm-edit');
const cancelEdit = document.querySelector('#cancel-edit');

const nameTitle = document.querySelector('#name-title');
const nameFirst = document.querySelector('#name-first');
const nameLast = document.querySelector('#name-last');

const AddressStreetNumber = document.querySelector('#address-street-number');
const AddressStreetName = document.querySelector('#address-street-name');
const AddressCity = document.querySelector('#address-city');
const AddressState = document.querySelector('#address-state');
const AddressCountry = document.querySelector('#address-country');
const AddressPostcode = document.querySelector('#address-postcode');

const modal = new bootstrap.Modal(document.querySelector('#user-modal'));
const deleteModal = new bootstrap.Modal(document.querySelector('#confirm-delete'));

let userData;
let specificRow;
let userModal;
let tempIndex;

const addRow = (name, gender, emailAddress, country) => {
    let newRow = document.createElement("tr");
    let nameCell = document.createElement("td");
    nameCell.textContent = name;
    let genderCell = document.createElement("td");
    genderCell.textContent = gender;
    let emailAddressCell = document.createElement("td");
    emailAddressCell.textContent = emailAddress;
    let countryCell = document.createElement("td");
    countryCell.textContent = country;

    newRow.appendChild(nameCell);
    newRow.appendChild(genderCell);
    newRow.appendChild(emailAddressCell);
    newRow.appendChild(countryCell);

    tableBody.append(newRow);

    newRow.classList.add("table-bordered");

};

const selectedNameOption = (nameOption) => {
    if (nameOption == "first-name") {
        return "first";
    } else {
        return "last";
    }
};

const disableFields = () => {
    nameTitle.contentEditable = 'false';
    nameFirst.contentEditable = 'false';
    nameLast.contentEditable = 'false';
    AddressStreetNumber.contentEditable = 'false';
    AddressStreetName.contentEditable = 'false';
    AddressCity.contentEditable = 'false';
    AddressState.contentEditable = 'false';
    AddressCountry.contentEditable = 'false';
    AddressPostcode.contentEditable = 'false';
    userEmail.contentEditable = 'false';
    userPhoneNumber.contentEditable = 'false';
    userTelephoneNumber.contentEditable = 'false';
    userBirthdate.contentEditable = 'false';
    userGender.contentEditable = 'false';
};

const enableFields = () => {
    nameTitle.contentEditable = 'true';
    nameFirst.contentEditable = 'true';
    nameLast.contentEditable = 'true';
    AddressStreetNumber.contentEditable = 'true';
    AddressStreetName.contentEditable = 'true';
    AddressCity.contentEditable = 'true';
    AddressState.contentEditable = 'true';
    AddressCountry.contentEditable = 'true';
    AddressPostcode.contentEditable = 'true';
    userEmail.contentEditable = 'true';
    userPhoneNumber.contentEditable = 'true';
    userTelephoneNumber.contentEditable = 'true';
    userBirthdate.contentEditable = 'true';
    userGender.contentEditable = 'true';
};

const displayInformation = (data) => {
    userPicture.src = data.picture.large;
    nameTitle.textContent = data.name['title'];
    nameFirst.textContent = data.name['first'];
    nameLast.textContent = data.name['last'];
    AddressStreetNumber.textContent = data.location.street.number;
    AddressStreetName.textContent = data.location.street.name;
    AddressCity.textContent = data.location.city;
    AddressState.textContent = data.location.state;
    AddressCountry.textContent = data.location.country;
    AddressPostcode.textContent = data.location.postcode;
    userEmail.textContent = data.email;
    userPhoneNumber.textContent = data.cell;
    userTelephoneNumber.textContent = data.phone;
    userBirthdate.textContent = data.dob.date.slice(0, 10);
    userGender.textContent = data.gender.split("")[0].toUpperCase() + data.gender.split("").slice(1).join("");
};

const showEditButtons = () => {
    cancelEdit.classList.remove("d-none");
    confirmEdit.classList.remove("d-none");
    deleteUser.classList.add("d-none");
    editUser.classList.add("d-none");
}

const hideEditButtons = () => {
    cancelEdit.classList.add("d-none");
    confirmEdit.classList.add("d-none");
    deleteUser.classList.remove("d-none");
    editUser.classList.remove("d-none");
}

button.addEventListener("click", () => {
    tableBody.innerHTML = '';
    const slashSymbol = "/";
    testnumber.textContent = `${numberOfRandomUsers.value} user${slashSymbol}s generated`;
    const userNumber = numberOfRandomUsers.value;
    const nameOptionValue = nameOption.value;
    console.log(userNumber);
    console.log(nameOption.value);

    try {
    if (userNumber > 1000 || userNumber < 0 || !(/^\d+$/.test(userNumber))) {
        testnumber.textContent = `no user${slashSymbol}s generated`;
        throw new Error("Invalid Input");
    } else {
        fetch(`https://randomuser.me/api/?results=${userNumber}`)
    .then(response => {
        if (!response.ok) {
            throw new Error("Network Error");
        }
        return response.json();
    }).then(data => {
        userData = data.results;
        console.log(userData);
        return userData;
    }).then(data => {
    for (let i = 0; i < userNumber; i++) {
        let currentUser = data[i];
        let selectedName = selectedNameOption(nameOptionValue);
        addRow(currentUser.name[selectedName], currentUser.gender.split("")[0].toUpperCase() + currentUser.gender.split("").slice(1).join(""), currentUser.email, currentUser.location.country);
    }}).catch(error => {
        alert(error);
    })
    } } catch (err) {
        alert(err);
    } 
}); 

nameOption.addEventListener("change", (event) => {
    console.log(userData);
    const nameOptionValue = event.target.value;
    const userNumber = userData.length;
    tableBody.innerHTML = '';
    for (let i = 0; i < userNumber; i++) {
        let currentUser = userData[i];
        let selectedName = selectedNameOption(nameOptionValue);
        addRow(currentUser.name[selectedName], currentUser.gender.split("")[0].toUpperCase() + currentUser.gender.split("").slice(1).join(""), currentUser.email, currentUser.location.country);
}});

numberOfRandomUsers.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        event.preventDefault();
        button.click();
    }
});

tableBody.addEventListener("dblclick", () => {
    specificRow = event.target.closest("tr");
    console.log(specificRow.rowIndex);
    console.log(userData[specificRow.rowIndex - 1]);
    tempIndex = specificRow.rowIndex - 1;
    userModal = userData[specificRow.rowIndex - 1];
    displayInformation(userModal);
    disableFields();
    hideEditButtons();
    modal.show();
});

confirmDelete.addEventListener("click", () => {
    userData.splice(tempIndex, 1);
    tableBody.rows[tempIndex].remove();
    console.log(userData);
    deleteModal.hide();
    console.log("user deleted");
});

cancelDelete.addEventListener("click", () => {
    deleteModal.hide();
    modal.show();
});

editUser.addEventListener("click", () => {
    console.log(specificRow.rowIndex);
    console.log(tempIndex);
    enableFields();
    showEditButtons();
});

confirmEdit.addEventListener("click", () => {
    userData[tempIndex].name['title'] = nameTitle.textContent;
    userData[tempIndex].name['first'] = nameFirst.textContent;
    userData[tempIndex].name['last'] = nameLast.textContent;
    userData[tempIndex].location.street.number = AddressStreetNumber.textContent;
    userData[tempIndex].location.street.name = AddressStreetName.textContent;
    userData[tempIndex].location.city = AddressCity.textContent;
    userData[tempIndex].location.state = AddressState.textContent;
    userData[tempIndex].location.country = AddressCountry.textContent;
    userData[tempIndex].location.postcode = AddressPostcode.textContent;
    userData[tempIndex].email = userEmail.textContent;
    userData[tempIndex].cell = userPhoneNumber.textContent;
    userData[tempIndex].phone = userTelephoneNumber.textContent;
    userData[tempIndex].dob.date = userBirthdate.textContent;
    userData[tempIndex].gender = userGender.textContent;
    console.log(tempIndex);
    tableBody.innerHTML = '';
    const userNumber = userData.length;
    const nameOptionValue = nameOption.value;
    for (let i = 0; i < userNumber; i++) {
        let currentUser = userData[i];
        let selectedName = selectedNameOption(nameOptionValue);
        addRow(currentUser.name[selectedName], currentUser.gender.split("")[0].toUpperCase() + currentUser.gender.split("").slice(1).join(""), currentUser.email, currentUser.location.country);
    disableFields();
    hideEditButtons();
};});

cancelEdit.addEventListener("click", () => {
    disableFields();
    hideEditButtons();
    displayInformation(userModal);
});