document.addEventListener("DOMContentLoaded", function () {
  const rowsBox = document.getElementById("rowsBox");
  const nameOption = document.getElementById("nameOpt");
  const errBox = document.getElementById("err");
  const numBox = document.getElementById("numBox");

  document.getElementById("getUsers").addEventListener("click", () => {
    fetch("modifications.json")
      .then(res => res.json())
      .then(data => {
        const count = parseInt(numBox.value) || 1;
        let users = [];
        for (let i = 0; i < count; i++) {
          users.push(data.results[0]);
        }
        showUsers(users);
      })
      .catch(() => {
        errBox.classList.remove("d-none");
        errBox.textContent = "Failed to load data.";
      });
  });

  function showUsers(users) {
    rowsBox.innerHTML = "";
    users.forEach(user => {
      const row = document.createElement("div");
      row.className = "row text-center mb-2";
      let displayName = nameOption.value === "first" ? user.name.first : user.name.last;

      row.innerHTML = `
        <div class="col">${displayName}</div>
        <div class="col">${user.gender}</div>
        <div class="col">${user.email}</div>
        <div class="col">${user.location.country}</div>
      `;

      row.addEventListener("dblclick", () => showUserModal(user));
      rowsBox.appendChild(row);
    });
  }

  function showUserModal(user) {
    document.getElementById("modalName").textContent = `${user.name.title} ${user.name.first} ${user.name.last}`;
    document.getElementById("modalPicture").src = user.picture.large;
    document.getElementById("modalAddress").textContent = `${user.location.street.number} ${user.location.street.name}, ${user.location.city}, ${user.location.state}, ${user.location.country}, ${user.location.postcode}`;
    document.getElementById("modalEmail").textContent = user.email;
    document.getElementById("modalPhone").textContent = user.phone;
    document.getElementById("modalCell").textContent = user.cell;
    document.getElementById("modalDob").textContent = new Date(user.dob.date).toLocaleDateString();
    document.getElementById("modalGender").textContent = user.gender;

    const modal = new bootstrap.Modal(document.getElementById("userModal"));
    modal.show();
  }
});
