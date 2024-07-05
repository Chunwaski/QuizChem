const user = document.getElementById('username');
let validUsernames = [];

// Fetch and process the User.xlsx file
fetch('User.xlsx')
    .then(response => response.arrayBuffer())
    .then(data => {
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { header: 1 });

        // Assuming usernames are in the first column
        validUsernames = sheet.map(row => row[0]);
    })
    .catch(err => {
        console.error('Error loading User.xlsx:', err);
    });

function verifyUser(event) {
    event.preventDefault();

    const username = user.value.trim();

    if (username === "") {
        alert("Username cannot be empty");
    } else if (validUsernames.includes(username)) {
        window.location.assign("home.html");
    } else {
        alert("Invalid username");
    }
}
