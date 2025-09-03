function generateUsers() {
  const count = document.getElementById("userCount").value;
  const nameType = document.getElementById("nameType").value;
  const nameHeader = document.getElementById("nameHeader");
  const tableBody = document.getElementById("userTableBody");

  if (count < 1 || count > 1000) {
    alert("Please enter a number between 1 and 1000.");
    return;
  }

  nameHeader.textContent = nameType === "first" ? "First Name" : "Last Name";
  tableBody.innerHTML = "";

  fetch("https://randomuser.me/api/?results=" + count)
    .then(response => response.json())
    .then(data => {
      data.results.forEach(user => {
        const name = nameType === "first" ? user.name.first : user.name.last;

        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${name}</td>
          <td>${user.gender}</td>
          <td>${user.email}</td>
          <td>${user.location.country}</td>
        `;

        // Show modal on double-click
        row.addEventListener("dblclick", () => {
          const initials = `${user.name.first[0].toUpperCase()}${user.name.last[0].toUpperCase()}`;
          const fullName = `${user.name.title} ${user.name.first} ${user.name.last}`;
          const address = `${user.location.street.number} ${user.location.street.name}, ${user.location.city}, ${user.location.state}, ${user.location.country}, ${user.location.postcode}`;

          const modalContent = document.getElementById("modalContent");
        modalContent.innerHTML = `
            <div style="font-size: 48px; font-weight: bold; background: #ccc; width: 80px; height: 80px; border-radius: 50%; margin: auto; display: flex; align-items: center; justify-content: center;">
                ${initials}
            </div>
            <div class="mt-3 text-start px-4">
            <label><strong>Full Name:</strong></label>
            <input type="text" id="editName" class="form-control mb-2" value="${fullName}">
    
            <label><strong>Address:</strong></label>
            <input type="text" id="editAddress" class="form-control mb-2" value="${address}">
    
            <label><strong>Email:</strong></label>
            <input type="email" id="editEmail" class="form-control mb-2" value="${user.email}">
        </div>
    `;



          // Delete 

          document.getElementById("deleteUserBtn").onclick = () => {
            row.remove();
            bootstrap.Modal.getInstance(document.getElementById("userModal")).hide();
          };

          // Edit 

          document.getElementById("editUserBtn").onclick = () => {
            const updatedName = document.getElementById("editName").value;
            const updatedAddress = document.getElementById("editAddress").value;
            const updatedEmail = document.getElementById("editEmail").value;

            // Update the table row cells
            row.cells[0].textContent = updatedName.split(" ")[1] || updatedName; // Show first or last name
            row.cells[2].textContent = updatedEmail;

            

            bootstrap.Modal.getInstance(document.getElementById("userModal")).hide();
           };


          const modal = new bootstrap.Modal(document.getElementById("userModal"));
          modal.show();
        });

        tableBody.appendChild(row);
      });
    })
    .catch(error => {
      alert("Something went wrong. Please check your internet connection.");
      console.error(error);
    });
}