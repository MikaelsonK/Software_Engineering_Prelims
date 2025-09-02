let currentUserData = []
let currentUser = null
let currentUserIndex = null
document.querySelector('#myForm').addEventListener('submit', (event) => {
    event.preventDefault()
    
    const amountInput = document.querySelector('#amount')
    const count = Number(amountInput.value)

    if (count <= 0 || count > 1000) {
        alert("Please Enter a Number Between 0 to 1000")
        return
    }
    
    const submitBtn = document.querySelector('#myForm [type="submit"]')
    const originalBtnText = submitBtn.value
    submitBtn.value = 'Loading...'
    submitBtn.disabled = true;

    const userResults = document.querySelector('#userResults')
    userResults.innerHTML = ''

    fetch(`https://randomuser.me/api/?results=${count}`)
        .then((response) => response.json())
        .then((data) => {
            currentUserData = data.results
            displayUsers(currentUserData)

        })
        .catch((error) => {
            alert("Something went wrong", error)
        })
        .finally(() => {
            submitBtn.value = originalBtnText
            submitBtn.disabled = false
        });
});

function displayUsers(users){
    const nameFormat = document.querySelector('#name').value
    let output = ''
    const userResults = document.querySelector('#userResults')

    for (const [index, user] of users.entries()){
        let displayedName = ''
        if (nameFormat === 'fname'){
            displayedName = user.name.first
        }
        else{
                displayedName = user.name.last
        }

        output += `<div class="row text-center user-row" data-index='${index}' style='cursor:pointer'">
        <div class="col">${displayedName}</div>
        <div class="col">${user.gender}</div>
        <div class="col">${user.location.country}</div>
        <div class="col">${user.email}</div>
        </div>`;

    }
    userResults.innerHTML = output;

    const userRows = document.querySelectorAll('.user-row')
    for(const row of userRows){
        row.addEventListener('click',function(){
            const userIndex = this.getAttribute('data-index')
            currentUserIndex = userIndex
            currentUser = currentUserData[userIndex]
            const modal = new bootstrap.Modal(document.getElementById('myModal'))
            showUserModal(currentUser)
        })
    }   
}

function showUserModal(user){
    document.getElementById('imgModal').src = user.picture.large
    document.getElementById('nameModal').textContent = `${user.name.title} ${user.name.first} ${user.name.last}`
    document.getElementById('addressModal').textContent = 
    `${user.location.street.number} ${user.location.street.name}, ${user.location.city}, ${user.location.state}, ${user.location.country}`
    document.getElementById('emailModal').textContent = user.email
    document.getElementById('phoneModal').textContent = user.cell
    document.getElementById('telephoneModal').textContent = user.phone
    document.getElementById('dobModal').textContent = new Date(user.dob.date).toLocaleDateString()
    document.getElementById('genderModal').textContent = user.gender

    document.getElementById('editButton').textContent = 'Edit'

    const modal = new bootstrap.Modal(document.getElementById('myModal'))
    modal.show()
    }
document.querySelector('#name').addEventListener('change', () => {
    if (currentUserData.length > 0) {
        displayUsers(currentUserData);
    }})

document.getElementById('editButton').addEventListener('click', function() {
    const isEditing = this.textContent === 'Edit'
    if(isEditing){
        this.textContent = 'Save'
        makeFieldsEditable()
    } else{
        this.textContent = 'Edit'
        saveChanges()
        makeFieldsReadOnly()
    }
    
})

function makeFieldsEditable(){
    const fields = ['name', 'email', 'phone', 'telephone', 'address', 'gender']
    for(const field of fields){
        const currentValue = document.getElementById(`${field}Modal`).textContent
        document.getElementById(`${field}Modal`).innerHTML = 
        `<input type="text" class="form-control" value="${currentValue}" id="edit${field}">`
    }
}

function makeFieldsReadOnly(){
    const fields = ['name', 'email', 'phone', 'telephone', 'address', 'gender']
    for(const field of fields){
        const newValue = document.getElementById(`edit${field}`).value
        document.getElementById(`${field}Modal`).textContent = newValue
}}

function saveChanges(){
    if(currentUser && currentUserIndex !== null){
        const nameInput = document.getElementById('editname')
        if (nameInput){
            const fullName = nameInput.value.split(' ')
            if (fullName.length >= 2){
                currentUser.name.title = fullName[0]
                currentUser.name.first = fullName[1]
                currentUser.name.last = fullName.slice(2).join(' ')
            }
        }   

        const addressInput = document.getElementById('editaddress')
        if(addressInput){
            const addressParts = addressInput.value.split(',').map(part => part.trim())

            if(addressParts.length >= 4){
                const streetParts = addressParts[0].split(' ')
                if(streetParts.length > 1){
                    currentUser.location.street.number = streetParts[0]
                    currentUser.location.street.name = streetParts.slice(1).join(' ')
                } else{
                    currentUser.location.street.number = ''
                    currentUser.location.street.name = addressParts[0]
                }
                currentUser.location.city = addressParts[1]
                currentUser.location.state = addressParts[2]
                currentUser.location.country = addressParts[3]
            }
        }

        currentUser.email = document.getElementById('editemail').value
        currentUser.cell = document.getElementById('editphone').value
        currentUser.phone = document.getElementById('editphone').value
        currentUser.gender = document.getElementById('editgender').value

        displayUsers(currentUserData)
        showUserModal(currentUser)
        alert("Changes Saved")
        removeModalBackdrop()
    }
}

function deleteUser(userIndex){
    currentUserData.splice(userIndex, 1)
    displayUsers(currentUserData)
    currentUserIndex = null
    currentUser = null
    alert("Successfully deleted the user")
    removeModalBackdrop()
}

function removeModalBackdrop(){
    const backdrops = document.querySelectorAll('.modal-backdrop')
    backdrops.forEach(backdrop =>{
        backdrop.parentNode.removeChild(backdrop)
    })
    document.body.classList.remove('modal-open')
    document.body.style.overflow = ''
}

document.getElementById('deleteButton').addEventListener('click',function() {
    if (currentUserIndex !== null){
        if(confirm('Are you sure you want to delete this user')){
            deleteUser(currentUserIndex)

            const modal = bootstrap.Modal.getInstance(document.getElementById('myModal'))
            modal.hide()
        }

    }
})

