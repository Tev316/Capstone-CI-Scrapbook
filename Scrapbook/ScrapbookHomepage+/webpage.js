const sidebar = document.getElementById('sidebar');
const mapContainer = document.getElementById('mapContainer');
const toggleButton = document.getElementById('toggleButton');
const newScrapBtn = document.getElementById('newScrapBtn');
const newScrapForm = document.getElementById('newScrapForm');
const saveScrapBtn = document.getElementById('saveScrapBtn');
const cancelScrapBtn = document.getElementById('cancelScrapBtn');
const aboutInput = document.getElementById('aboutInput');
const logoutBtn = document.getElementById('logoutBtn'); // Added logout button

let map, userLocation;
const apiKey = '$2a$10$j5TrtQoRjTYMHiQIBrLUee6ikS5LyIIMDXEXy0OHaHE2RaP7//oN6';
const binId = '6731852de41b4d34e4520d33';
const markersArray = [];
let editingMarker = null;

let isSidebarOpen = false;

function updateToggleButtonPosition() {
    const sidebarWidth = isSidebarOpen ? '66.67%' : '33.33%';
    const buttonLeftPosition = `calc(${sidebarWidth} - 20px)`;
    toggleButton.style.left = buttonLeftPosition;
}

toggleButton.addEventListener('click', () => {
    if (isSidebarOpen) {
        sidebar.style.width = '33.33%';
        mapContainer.style.width = '66.67%';
        toggleButton.textContent = '>';
    } else {
        sidebar.style.width = '66.67%';
        mapContainer.style.width = '33.33%';
        toggleButton.textContent = '<';
    }

    isSidebarOpen = !isSidebarOpen;
    updateToggleButtonPosition();
});

// Show New Scrap Form
newScrapBtn.addEventListener('click', () => {
    newScrapForm.style.display = 'block';
    aboutInput.focus();
});

// Hide New Scrap Form
cancelScrapBtn.addEventListener('click', () => {
    newScrapForm.style.display = 'none';
    aboutInput.value = '';
});

// Initialize Map and Load Entries
function initMap() {
    navigator.geolocation?.getCurrentPosition(position => {
        userLocation = { lat: position.coords.latitude, lng: position.coords.longitude };
        map = new google.maps.Map(document.getElementById('map'), { center: userLocation, zoom: 15 });
        loadEntries();

        saveScrapBtn.onclick = saveEntry;
    }, () => alert("Geolocation failed or is not supported."));
}

async function loadEntries() {
    try {
        const username = sessionStorage.getItem('username');
        if (!username) {
            alert('You are not logged in!');
            window.location.href = 'index.html';
            return;
        }

        const response = await fetch(`https://api.jsonbin.io/v3/b/${binId}/latest`, {
            headers: { 'X-Master-Key': apiKey }
        });
        const { record } = await response.json();
        const user = record.users.find(u => u.username === username);
        if (user) {
            user.scrapbookEntries.forEach((entry, index) => {
                const location = entry.location.split(',').map(coord => parseFloat(coord.trim()));
                addMarker({ lat: location[0], lng: location[1] }, entry.about, index);
            });
        }
    } catch (error) {
        console.error('Error loading scrapbook entries:', error);
    }
}

function addMarker(location, description, index) {
    const marker = new google.maps.Marker({ position: location, map: map, title: description });
    const infoWindow = new google.maps.InfoWindow({
        content: `
            <div class="info-window-content">
                <h3>${description}</h3>
                <button class="edit-btn" onclick="editEntry(${index})">Edit</button>
                <button class="delete-btn" onclick="deleteEntry(${index})">Delete</button>
            </div>`
    });

    marker.addListener('click', () => infoWindow.open(map, marker));
    markersArray.push(marker);
    return marker;
}

async function saveEntry() {
    const username = sessionStorage.getItem('username');
    const description = aboutInput.value;

    if (!description.trim()) {
        alert('Please enter a description for the scrap!');
        return;
    }

    try {
        const response = await fetch(`https://api.jsonbin.io/v3/b/${binId}`, {
            headers: { 'X-Master-Key': apiKey }
        });
        const { record } = await response.json();
        const user = record.users.find(u => u.username === username);

        if (user) {
            user.scrapbookEntries.push({ location: `${userLocation.lat}, ${userLocation.lng}`, about: description });

            const updateResponse = await fetch(`https://api.jsonbin.io/v3/b/${binId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Master-Key': apiKey
                },
                body: JSON.stringify(record)
            });

            if (updateResponse.ok) {
                alert("Entry saved!");
                loadEntries();
                newScrapForm.style.display = 'none';
                aboutInput.value = '';
            } else {
                console.error('Failed to save entry');
            }
        }
    } catch (error) {
        console.error('Error saving entry:', error);
    }
}

async function editEntry(index) {
    const username = sessionStorage.getItem('username');
    const response = await fetch(`https://api.jsonbin.io/v3/b/${binId}`, {
        headers: { 'X-Master-Key': apiKey }
    });
    const { record } = await response.json();
    const user = record.users.find(u => u.username === username);

    if (user) {
        const entry = user.scrapbookEntries[index];
        aboutInput.value = entry.about;
        newScrapForm.style.display = 'block';

        saveScrapBtn.onclick = async () => {
            entry.about = aboutInput.value;
            await saveEntries(record);
        };
    }
}

async function deleteEntry(index) {
    const username = sessionStorage.getItem('username');
    const response = await fetch(`https://api.jsonbin.io/v3/b/${binId}`, {
        headers: { 'X-Master-Key': apiKey }
    });
    const { record } = await response.json();
    const user = record.users.find(u => u.username === username);

    if (user) {
        user.scrapbookEntries.splice(index, 1);
        await saveEntries(record);
    }
}

async function saveEntries(record) {
    try {
        const updateResponse = await fetch(`https://api.jsonbin.io/v3/b/${binId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': apiKey
            },
            body: JSON.stringify(record)
        });

        if (updateResponse.ok) {
            alert("Changes saved!");
            loadEntries();
            newScrapForm.style.display = 'none';
            aboutInput.value = '';
        } else {
            console.error('Failed to save changes');
        }
    } catch (error) {
        console.error('Error saving changes:', error);
    }
}

// Logout Functionality
logoutBtn.addEventListener('click', () => {
    sessionStorage.clear();
    window.location.href = 'index.html';
});

//Friends List
const friendsListToggle = document.getElementById('friends-list-toggle');
const friendsListContainer = document.getElementById('friends-list-container');
const addFriendButton = document.getElementById('add-friend-button');
const friendUsernameInput = document.getElementById('friend-username-input');
const friendsDropdownList = document.getElementById('friends-dropdown-list');

// Toggle Friends List visibility
friendsListToggle.addEventListener('click', () => {
    friendsListContainer.classList.toggle('hidden');
});

// Add a friend to the dropdown list
addFriendButton.addEventListener('click', () => {
    const username = friendUsernameInput.value.trim();
    if (username) {
        const newFriendOption = document.createElement('option');
        newFriendOption.textContent = username;
        newFriendOption.value = username;
        friendsDropdownList.appendChild(newFriendOption);
        friendUsernameInput.value = ''; // Clear the input field
    } else {
        alert('Please enter a username!');
    }
});
