

// grab stuff from the HTML page
const userCountInput = document.getElementById('userCount');
const nameTypeSelect = document.getElementById('nameType');
const generateBtn = document.getElementById('generateBtn');
const userList = document.getElementById('userList');
const errorAlert = document.getElementById('errorAlert');
const loading = document.getElementById('loading');

// gonna store the users here
let currentUsers = [];

// when you click generate, go get users
generateBtn.addEventListener('click', fetchUsers);

// when you change the name type (first/last), update the list
nameTypeSelect.addEventListener('change', updateNameDisplay);

// function to get users from the API
async function fetchUsers() {
  const count = parseInt(userCountInput.value); // how many users to get

  // if number is bad, show an error and stop
  if (isNaN(count) || count < 1 || count > 1000) {
    showError("Enter a number between 1 and 1000");
    return;
  }

  // show the loading spinner
  showLoading();
  // hide any previous error
  hideError();
  // clear out the list
  userList.innerHTML = '';

  try {
    // call the API
    const res = await fetch(`https://randomuser.me/api/?results=${count}`);
    if (!res.ok) throw new Error('Network response was not ok');

    // get the data and save it
    const data = await res.json();
    currentUsers = data.results;

    // show the users on screen
    displayUsers(currentUsers);
  } catch (error) {
    // something broke, show the error
    showError("Failed to fetch users. Try again.");
  } finally {
    // either way, hide the spinner
    hideLoading();
  }
}

// show the users on the page
function displayUsers(users) {
  userList.innerHTML = ''; // clear list first
  const nameType = nameTypeSelect.value; // get selected name style

  users.forEach(user => {
    // pick which name to show
    const displayName = nameType === 'first' ? user.name.first : user.name.last;

    // make a row for each user
    const row = document.createElement('div');
    row.className = 'row user-row text-center align-items-center';

    // slap in the user's info
    row.innerHTML = `
      <div class="col-md-3">${displayName}</div>
      <div class="col-md-2">${capitalize(user.gender)}</div>
      <div class="col-md-4 text-truncate" title="${user.email}">${user.email}</div>
      <div class="col-md-3">${user.location.country}</div>
    `;

    // add to the page
    userList.appendChild(row);
  });
}

// refresh name display when select changes
function updateNameDisplay() {
  if (currentUsers.length) displayUsers(currentUsers);
}

// show error message
function showError(msg) {
  errorAlert.textContent = msg;
  errorAlert.style.display = 'block';
}

// hide error
function hideError() {
  errorAlert.style.display = 'none';
}

// show spinner and disable button
function showLoading() {
  loading.style.display = 'block';
  generateBtn.disabled = true;
}

// hide spinner and enable button
function hideLoading() {
  loading.style.display = 'none';
  generateBtn.disabled = false;
}

// makes first letter big (like a proper human)
function capitalize(text) {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1);
}

// load some users right away (so page not empty)
fetchUsers();
