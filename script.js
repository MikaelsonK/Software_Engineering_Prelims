document.addEventListener('DOMContentLoaded', function() {
    const generateBtn = document.getElementById('generateBtn');
    const userCountInput = document.getElementById('userCount');
    const nameFormatSelect = document.getElementById('nameFormat');
    const usersContainer = document.getElementById('usersContainer');
    const errorMessage = document.getElementById('errorMessage');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const usersTable = document.getElementById('usersTable');
    
    // Modal elements
    const userModal = new bootstrap.Modal(document.getElementById('userModal'));
    const editUserModal = new bootstrap.Modal(document.getElementById('editUserModal'));
    
    // Store users data
    let usersData = [];
    let currentUserIndex = -1;
    
    // Function to fetch users from the API
    async function fetchUsers(count) {
        if (count < 0 || count > 1000) {
            showError('Please enter a number between 0 and 1000');
            return;
        }
        
        if (count === 0) {
            usersData = []; 
            displayUsers(usersData); 
            hideError();
            return; 
        }
        
        // Show loading indicator
        loadingIndicator.classList.remove('d-none');
        usersContainer.innerHTML = '';
        usersTable.classList.add('d-none');
        hideError();
        
        try {
            const response = await fetch(`https://randomuser.me/api/?results=${count}`);
            
            if (!response.ok) {
                throw new Error(`API responded with status ${response.status}`);
            }
            
            const data = await response.json();
            usersData = data.results;
            displayUsers(usersData);
        } catch (err) {
            showError(`Failed to fetch users: ${err.message}. Please try again.`);
        } finally {
            loadingIndicator.classList.add('d-none');
        }
    }
    
    // Function to display users in a table
    function displayUsers(users) {
        usersContainer.innerHTML = '';
        
        if (users.length === 0) {
            usersContainer.innerHTML = '<tr><td colspan="4" class="text-center">No users to display. Try generating some users.</td></tr>';
            usersTable.classList.remove('d-none');
            return;
        }
        
        const nameFormat = nameFormatSelect.value;
        
        users.forEach((user, index) => {
            let displayName;
            if (nameFormat === 'first') {
                displayName = user.name.first;
            } else if (nameFormat === 'last') {
                displayName = user.name.last;
            } else {
                displayName = `${user.name.first} ${user.name.last}`;
            }
            
            const row = document.createElement('tr');
            row.setAttribute('data-index', index);
            row.innerHTML = `
                <td>${displayName}</td>
                <td>${user.gender.charAt(0).toUpperCase() + user.gender.slice(1)}</td>
                <td>${user.email}</td>
                <td>${user.location.country}</td>
            `;
            
            // Add double-click event to open modal
            row.addEventListener('dblclick', () => {
                openUserModal(index);
            });
            
            usersContainer.appendChild(row);
        });
        
        usersTable.classList.remove('d-none');
    }
    
    // Function to open user modal with details
    function openUserModal(index) {
        currentUserIndex = index;
        const user = usersData[index];
        
        // Set modal content
        document.getElementById('modalUserImage').src = user.picture.large;
        document.getElementById('modalUserName').textContent = `${user.name.title} ${user.name.first} ${user.name.last}`;
        document.getElementById('modalUserEmail').textContent = user.email;
        document.getElementById('modalUserPhone').textContent = user.phone;
        document.getElementById('modalUserCell').textContent = user.cell;
        document.getElementById('modalUserDob').textContent = new Date(user.dob.date).toLocaleDateString();
        document.getElementById('modalUserGender').textContent = user.gender.charAt(0).toUpperCase() + user.gender.slice(1);
        document.getElementById('modalUserAddress').textContent = 
            `${user.location.street.number} ${user.location.street.name}, ${user.location.city}, ${user.location.state}, ${user.location.country}, ${user.location.postcode}`;
        
        // Show modal
        userModal.show();
    }
    
    // Function to show error message
    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.classList.remove('d-none');
    }
    
    // Function to hide error message
    function hideError() {
        errorMessage.classList.add('d-none');
    }
    
    // Delete user function
    function deleteUser() {
        if (currentUserIndex !== -1) {
            usersData.splice(currentUserIndex, 1);
            displayUsers(usersData);
            userModal.hide();
            currentUserIndex = -1;
        }
    }
    
    // Open edit modal
    function openEditModal() {
        if (currentUserIndex !== -1) {
            const user = usersData[currentUserIndex];
            
            // Fill form with current data
            document.getElementById('editUserId').value = currentUserIndex;
            document.getElementById('editFirstName').value = user.name.first;
            document.getElementById('editLastName').value = user.name.last;
            document.getElementById('editEmail').value = user.email;
            document.getElementById('editPhone').value = user.phone;
            document.getElementById('editCell').value = user.cell;
            document.getElementById('editLocation').value = 
                `${user.location.street.number} ${user.location.street.name}, ${user.location.city}, ${user.location.state}, ${user.location.country}, ${user.location.postcode}`;
            
            // Hide the user modal and show edit modal
            userModal.hide();
            editUserModal.show();
        }
    }
    
    // Save edited user
    function saveUserChanges() {
        if (currentUserIndex !== -1) {
            const user = usersData[currentUserIndex];
            
            // Update user data
            user.name.first = document.getElementById('editFirstName').value;
            user.name.last = document.getElementById('editLastName').value;
            user.email = document.getElementById('editEmail').value;
            user.phone = document.getElementById('editPhone').value;
            user.cell = document.getElementById('editCell').value;
            
            // Update the display
            displayUsers(usersData);
            
            // Close the modal
            editUserModal.hide();
        }
    }
    
    // Event listeners
    generateBtn.addEventListener('click', function() {
        const count = parseInt(userCountInput.value);
        fetchUsers(count);
    });
    
    nameFormatSelect.addEventListener('change', function() {
        if (usersData.length > 0) {
            displayUsers(usersData);
        }
    }); 
    
    // Delete user button event
    document.getElementById('deleteUserBtn').addEventListener('click', deleteUser);
    
    // Edit user button event
    document.getElementById('editUserBtn').addEventListener('click', openEditModal);
    
    // Save changes button event
    document.getElementById('saveChangesBtn').addEventListener('click', saveUserChanges);
    
    // Initial load with empty container
    displayUsers([]);
});