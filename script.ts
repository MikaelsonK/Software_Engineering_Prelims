interface UserName {
    title: string;
    first: string;
    last: string;
}

interface UserLocation {
    street: {
        number: number;
        name: string;
    };
    city: string;
    state: string;
    country: string;
    postcode: number | string;
    coordinates: {
        latitude: string;
        longitude: string;
    };
    timezone: {
        offset: string;
        description: string;
    };
}

interface RandomUser {
    gender: string;
    name: UserName;
    location: UserLocation;
    email: string;
    login: {
        uuid: string;
        username: string;
        password: string;
        salt: string;
        md5: string;
        sha1: string;
        sha256: string;
    };
    dob: {
        date: string;
        age: number;
    };
    registered: {
        date: string;
        age: number;
    };
    phone: string;
    cell: string;
    id: {
        name: string;
        value: string;
    };
    picture: {
        large: string;
        medium: string;
        thumbnail: string;
    };
    nat: string;
}

interface ApiResponse {
    results: RandomUser[];
    info: {
        seed: string;
        results: number;
        page: number;
        version: string;
    };
}

type NameDisplayType = 'first' | 'last';

let currentUsers: RandomUser[] = [];
let currentNameDisplay: NameDisplayType = 'first';
let currentEditingIndex: number = -1;

document.addEventListener('DOMContentLoaded', () => {
    const userCountInput = document.getElementById('userCount') as HTMLInputElement;
    const nameDisplaySelect = document.getElementById('nameDisplay') as HTMLSelectElement;
    
    const handleKeyPress = (e: KeyboardEvent): void => {
        if (e.key === 'Enter') {
            generateUsers();
        }
    };
    
    const handleNameDisplayChange = (): void => {
        currentNameDisplay = nameDisplaySelect.value as NameDisplayType;
        if (currentUsers.length > 0) {
            displayUsers(currentUsers);
        }
    };
    
    userCountInput.addEventListener('keypress', handleKeyPress);
    nameDisplaySelect.addEventListener('change', handleNameDisplayChange);
    
    setupModalEvents();
    generateUsers();
});

const fetchUsers = async (count: number): Promise<RandomUser[]> => {
    const response: Response = await fetch(`https://randomuser.me/api/?results=${count}`);
    
    if (!response.ok) {
        throw new Error(`API request failed with status: ${response.status}`);
    }

    const data: ApiResponse = await response.json();
    return data.results;
};

async function generateUsers(): Promise<void> {
    const userCountInput = document.getElementById('userCount') as HTMLInputElement;
    const userCount: number = parseInt(userCountInput.value) || 1;
    
    const isValidCount = (count: number): boolean => count >= 1 && count <= 1000;
    
    if (!isValidCount(userCount)) {
        showError('Please enter a number between 1 and 1000');
        return;
    }

    showLoading();
    hideError();

    try {
        currentUsers = await fetchUsers(userCount);
        displayUsers(currentUsers);
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        showError(`Failed to fetch user data: ${errorMessage}. Please check your internet connection and try again.`);
    } finally {
        hideLoading();
    }
}

const createCell = (content: string, dataLabel?: string): HTMLDivElement => {
    const cell = document.createElement('div');
    cell.className = 'result-cell';
    cell.textContent = content;
    if (dataLabel) {
        cell.setAttribute('data-label', dataLabel);
    }
    return cell;
};

const getDisplayName = (user: RandomUser): string => {
    const nameMapper = {
        first: () => capitalizeFirst(user.name.first),
        last: () => capitalizeFirst(user.name.last)
    };
    
    return nameMapper[currentNameDisplay]();
};

function displayUsers(users: RandomUser[]): void {
    const usersData = document.getElementById('usersData') as HTMLDivElement;
    usersData.innerHTML = '';

    users.forEach((user: RandomUser, index: number) => {
        const userRow = document.createElement('div');
        userRow.className = 'user-row';
        userRow.style.display = 'contents';
        
        const nameCell = createCell(getDisplayName(user), 'Name');
        const genderCell = createCell(capitalizeFirst(user.gender), 'Gender');
        const emailCell = createCell(user.email, 'Email');
        const countryCell = createCell(user.location.country, 'Country');
        
        [nameCell, genderCell, emailCell, countryCell].forEach(cell => {
            cell.addEventListener('dblclick', () => openUserModal(index));
            userRow.appendChild(cell);
        });
        
        usersData.appendChild(userRow);
    });
}

const showLoading = (): void => {
    const loadingState = document.getElementById('loadingState') as HTMLDivElement;
    loadingState.style.display = 'block';
};

const hideLoading = (): void => {
    const loadingState = document.getElementById('loadingState') as HTMLDivElement;
    loadingState.style.display = 'none';
};

const showError = (message: string): void => {
    const errorDiv = document.getElementById('errorMessage') as HTMLDivElement;
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
};

const hideError = (): void => {
    const errorDiv = document.getElementById('errorMessage') as HTMLDivElement;
    errorDiv.style.display = 'none';
};

const capitalizeFirst = (str: string): string => 
    str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

function openUserModal(index: number): void {
    const user = currentUsers[index];
    currentEditingIndex = index;
    
    const modal = document.getElementById('userModal') as HTMLDivElement;
    const modalPicture = document.getElementById('modalPicture') as HTMLImageElement;
    const modalName = document.getElementById('modalName') as HTMLDivElement;
    const modalAddress = document.getElementById('modalAddress') as HTMLSpanElement;
    const modalEmail = document.getElementById('modalEmail') as HTMLSpanElement;
    
    modalPicture.src = user.picture.large;
    modalName.textContent = `${capitalizeFirst(user.name.first)} ${capitalizeFirst(user.name.last)}`;
    modalAddress.textContent = `${user.location.street.number} ${user.location.street.name}, ${user.location.city}, ${user.location.state}, ${user.location.country}, ${user.location.postcode}`;
    modalEmail.textContent = user.email;
    
    modal.style.display = 'block';
}

function closeModal(): void {
    const userModal = document.getElementById('userModal') as HTMLDivElement;
    const editModal = document.getElementById('editModal') as HTMLDivElement;
    userModal.style.display = 'none';
    editModal.style.display = 'none';
}

function openEditModal(): void {
    const user = currentUsers[currentEditingIndex];
    
    const editModal = document.getElementById('editModal') as HTMLDivElement;
    const editFirstName = document.getElementById('editFirstName') as HTMLInputElement;
    const editLastName = document.getElementById('editLastName') as HTMLInputElement;
    const editEmail = document.getElementById('editEmail') as HTMLInputElement;
    const editPhone = document.getElementById('editPhone') as HTMLInputElement;
    const editCell = document.getElementById('editCell') as HTMLInputElement;
    const editGender = document.getElementById('editGender') as HTMLSelectElement;
    
    editFirstName.value = user.name.first;
    editLastName.value = user.name.last;
    editEmail.value = user.email;
    editPhone.value = user.phone;
    editCell.value = user.cell;
    editGender.value = user.gender;
    
    closeModal();
    editModal.style.display = 'block';
}

function saveUser(): void {
    const editFirstName = document.getElementById('editFirstName') as HTMLInputElement;
    const editLastName = document.getElementById('editLastName') as HTMLInputElement;
    const editEmail = document.getElementById('editEmail') as HTMLInputElement;
    const editPhone = document.getElementById('editPhone') as HTMLInputElement;
    const editCell = document.getElementById('editCell') as HTMLInputElement;
    const editGender = document.getElementById('editGender') as HTMLSelectElement;
    
    if (!editFirstName.value.trim() || !editLastName.value.trim() || !editEmail.value.trim()) {
        alert('Please fill in all required fields (First Name, Last Name, Email)');
        return;
    }
    
    if (!editEmail.value.includes('@') || !editEmail.value.includes('.')) {
        alert('Please enter a valid email address');
        return;
    }
    
    currentUsers[currentEditingIndex].name.first = editFirstName.value.trim();
    currentUsers[currentEditingIndex].name.last = editLastName.value.trim();
    currentUsers[currentEditingIndex].email = editEmail.value.trim();
    currentUsers[currentEditingIndex].phone = editPhone.value.trim();
    currentUsers[currentEditingIndex].cell = editCell.value.trim();
    currentUsers[currentEditingIndex].gender = editGender.value;
    
    closeModal();
    displayUsers(currentUsers);
}

function deleteUser(): void {
    if (confirm('Are you sure you want to delete this user?')) {
        currentUsers.splice(currentEditingIndex, 1);
        closeModal();
        displayUsers(currentUsers);
    }
}

function setupModalEvents(): void {
    document.addEventListener('click', (event: MouseEvent) => {
        const target = event.target as HTMLElement;
        
        if (target.classList.contains('close') || target.classList.contains('close-edit')) {
            closeModal();
        } else if (target.id === 'editBtn') {
            openEditModal();
        } else if (target.id === 'deleteBtn') {
            deleteUser();
        } else if (target.id === 'saveBtn') {
            saveUser();
        } else if (target.id === 'cancelBtn') {
            closeModal();
        }
    });
    
    window.addEventListener('click', (event: MouseEvent) => {
        const userModal = document.getElementById('userModal') as HTMLDivElement;
        const editModal = document.getElementById('editModal') as HTMLDivElement;
        
        if (event.target === userModal || event.target === editModal) {
            closeModal();
        }
    });
}
