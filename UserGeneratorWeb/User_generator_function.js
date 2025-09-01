function generateUsers() {

  // Get the number of users from the input box

  var count = document.getElementById("userCount").value;

  // Get the selected name type (first or last)
  
  var nameType = document.getElementById("nameType").value;

  // Get the table header and body elements

  var nameHeader = document.getElementById("nameHeader");
  var tableBody = document.getElementById("userTableBody");

  // Check if the number is valid

  if (count < 1 || count > 1000) {
    alert("Please enter a number between 1 and 1000.");
    return;
  }

  // Change the header text based on name type

  if (nameType === "first") {
    nameHeader.textContent = "First Name";
  } else {
    nameHeader.textContent = "Last Name";
  }

  // Clear the table before adding new rows

  tableBody.innerHTML = "";

  // Get random users from the API

  fetch("https://randomuser.me/api/?results=" + count)
    .then(function(response) {
      return response.json();
    })
    .then(function(data) {
      
      // Loop through each user and add a row to the table

      for (var i = 0; i < data.results.length; i++) {
        var user = data.results[i];

        var name;
        if (nameType === "first") {
          name = user.name.first;
        } else {
          name = user.name.last;
        }

        var row = "<tr>" +
                    "<td>" + name + "</td>" +
                    "<td>" + user.gender + "</td>" +
                    "<td>" + user.email + "</td>" +
                    "<td>" + user.location.country + "</td>" +
                  "</tr>";

        tableBody.innerHTML += row;
      }
    })
    .catch(function(error) {
      alert("Something went wrong. Please check your internet connection.");
      console.log(error);
    });
}