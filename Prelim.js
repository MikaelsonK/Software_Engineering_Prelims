(function() {
  const form = document.getElementById('controls');
  const countInput = document.getElementById('count');
  const nameMode = document.getElementById('nameMode');
  const results = document.getElementById('results');
  let users = [];
  let currentIndex = null;

  const modalEl = document.getElementById('userModal');
  const bsModal = new bootstrap.Modal(modalEl);
  const modalPicture = document.getElementById('modalPicture');
  const modalName = document.getElementById('modalName');
  const modalAddress = document.getElementById('modalAddress');
  const modalEmail = document.getElementById('modalEmail');
  const modalPhone = document.getElementById('modalPhone');
  const modalCell = document.getElementById('modalCell');
  const modalDob = document.getElementById('modalDob');
  const modalGender = document.getElementById('modalGender');
  const deleteBtn = document.getElementById('deleteUser');
  const saveBtn = document.getElementById('saveUser');

 

  function populate() {
    results.innerHTML = '';
    users.forEach((u, i) => {
      const name = u && u.name ? (nameMode.value === 'first' ? u.name.first : u.name.last) : '';

      const tr = document.createElement('tr');

      const tdName = document.createElement('td');
      tdName.textContent = name;
      tr.appendChild(tdName);

      const tdGender = document.createElement('td');
      tdGender.textContent = u.gender || '';
      tr.appendChild(tdGender);

      const tdEmail = document.createElement('td');
      tdEmail.textContent = u.email || '';
      tr.appendChild(tdEmail);

      const tdCountry = document.createElement('td');
      tdCountry.textContent = u.location?.country || '';
      tr.appendChild(tdCountry);

      tr.addEventListener('dblclick', () => openModal(i));
      results.appendChild(tr);
    });
  }


  function openModal(i) {
    currentIndex = i;
    const u = users[i];
    modalPicture.src = u.picture?.large || '';
    modalName.value = `${u.name?.first || ''}${u.name?.last ? ' ' + u.name.last : ''}`.trim();
    modalAddress.value = `${u.location?.street?.number ? u.location.street.number + ' ' : ''}${u.location?.street?.name || ''}`.trim();
    modalEmail.value = u.email || '';
    modalPhone.value = u.phone || '';
    modalCell.value = u.cell || '';
    modalDob.value = u.dob?.date ? new Date(u.dob.date).toLocaleDateString() : '';
    modalGender.value = u.gender || '';
    bsModal.show();
  }


  deleteBtn.addEventListener('click', () => {
    if (currentIndex === null) return;
    users.splice(currentIndex, 1);
    currentIndex = null;
    populate();
    bsModal.hide();
  });

  
  saveBtn.addEventListener('click', () => {
    if (currentIndex === null) return;
    const u = users[currentIndex];

    const nameInput = (modalName.value || '').trim();
    if (!u.name) u.name = { first: '', last: '' };
    if (nameInput === '') {
      u.name.first = '';
      u.name.last = '';
    } else {
      const parts = nameInput.split(/\s+/);
      if (parts.length === 1) {
        u.name.first = parts[0];
        u.name.last = '';
      } else {
        u.name.first = parts.shift();
        u.name.last = parts.join(' ');
      }
    }

    const addr = (modalAddress.value || '').trim();
    if (!u.location) u.location = {};
    if (!u.location.street) u.location.street = { number: 0, name: '' };
    u.location.street.name = addr;

    u.email = modalEmail.value || '';
    u.phone = modalPhone.value || '';
    u.cell = modalCell.value || '';
    u.gender = modalGender.value || '';

    const dobInput = (modalDob.value || '').trim();
    if (dobInput) {
      const pd = new Date(dobInput);
      if (!isNaN(pd)) {
        u.dob = u.dob || {};
        u.dob.date = pd.toISOString();
      }
    }

    populate();
    bsModal.hide();
  });

  form.addEventListener('submit', e => {
    e.preventDefault();
    const count = Number(countInput.value);
    if (!Number.isInteger(count) || count < 0 || count > 1000) return;
    if (count === 0) { users = []; results.innerHTML = ''; return; }

    fetch(`https://randomuser.me/api/?results=${count}&inc=name,gender,email,location,picture,phone,cell,dob&noinfo=true`)
      .then(response => response.json())
      .then(data => {
        users = data.results || [];
        populate();
      })
      .catch(err => console.log(err));
  });

  nameMode.addEventListener('change', () => {
    if (users.length) populate();
  });
})();
