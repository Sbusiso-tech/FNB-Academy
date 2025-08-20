// Global variables
let allContacts = [];

// Fetch contacts from server
function fetchContacts() {
    document.getElementById('loading').style.display = 'flex';
    document.getElementById('table').style.display = 'none';
    document.getElementById('noContacts').style.display = 'none';

    fetch(rootPath + "controller/get-contacts/")
        .then(function(response) {
            return response.json();
        })
        .then(function(data) {
            allContacts = data;
            displayOutput(data);
            updateStats(data);
            document.getElementById('loading').style.display = 'none';
        })
        .catch(function(error) {
            console.error('Error fetching contacts:', error);
            document.getElementById('loading').style.display = 'none';
            document.getElementById('noContacts').style.display = 'block';
        });
}

// Display contacts in table
function displayOutput(data) {
    if (!data || data.length === 0) {
        document.getElementById('table').style.display = 'none';
        document.getElementById('noContacts').style.display = 'block';
        return;
    }

    let output = `
        <table class="contacts-table">
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Phone</th>
                    <th>Email</th>
                    <th>Category</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>`;

    data.forEach(contact => {
        output += `
            <tr onclick="editContact(${contact.id})">
                <td>
                    <div class="contact-name">
                        <img src="${rootPath}controller/uploads/${contact.avatar || 'default-avatar.png'}" 
                             alt="${contact.firstname}" 
                             class="contact-avatar">
                        ${contact.firstname} ${contact.lastname}
                    </div>
                </td>
                <td>${contact.mobile || 'N/A'}</td>
                <td>${contact.email || 'N/A'}</td>
                <td>
                    <span class="category-badge ${contact.category || 'personal'}">
                        ${contact.category || 'Personal'}
                    </span>
                </td>
                <td class="contact-actions">
                    <i class="fas fa-star favorite-btn ${contact.favorite ? 'active' : ''}" 
                       onclick="toggleFavorite(event, ${contact.id})"></i>
                </td>
            </tr>`;
    });

    output += `</tbody></table>`;
    document.getElementById("table").innerHTML = output;
    document.getElementById("table").style.display = 'block';
}

// Edit contact
function editContact(id) {
    window.open('edit-contact.html?id=' + id, '_self');
}

// Toggle favorite status
function toggleFavorite(event, id) {
    event.stopPropagation();
    const contact = allContacts.find(c => c.id === id);
    if (!contact) return;

    const isFavorite = !contact.favorite;
    const icon = event.target;
    
    fetch(rootPath + "controller/update-favorite/", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, favorite: isFavorite })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            contact.favorite = isFavorite;
            icon.classList.toggle('active', isFavorite);
            updateStats(allContacts);
        }
    })
    .catch(error => console.error('Error:', error));
}

// Search contacts
function searchContacts() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    if (!searchTerm) {
        displayOutput(allContacts);
        return;
    }

    const filtered = allContacts.filter(contact => 
        contact.firstname.toLowerCase().includes(searchTerm) ||
        contact.lastname.toLowerCase().includes(searchTerm) ||
        (contact.email && contact.email.toLowerCase().includes(searchTerm)) ||
        (contact.phone && contact.phone.includes(searchTerm))
    );
    
    displayOutput(filtered);
}

// Filter contacts
function filterContacts() {
    const filterValue = document.getElementById('filterSelect').value;
    let filtered = allContacts;

    switch(filterValue) {
        case 'favorites':
            filtered = allContacts.filter(c => c.favorite);
            break;
        case 'work':
            filtered = allContacts.filter(c => c.category === 'work');
            break;
        case 'personal':
            filtered = allContacts.filter(c => !c.category || c.category === 'personal');
            break;
    }

    displayOutput(filtered);
}

// Update statistics
function updateStats(contacts) {
    document.getElementById('totalContacts').textContent = contacts.length;
    document.getElementById('favoriteContacts').textContent = 
        contacts.filter(c => c.favorite).length;
}

// Initialize the app when page loads
window.onload = function() {
    fetchContacts();
};