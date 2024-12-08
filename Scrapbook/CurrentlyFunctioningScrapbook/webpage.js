const sidebar = document.getElementById('sidebar');
const mapContainer = document.getElementById('mapContainer');
const toggleButton = document.getElementById('toggleButton');
const newScrapBtn = document.getElementById('newScrapBtn');
const newScrapForm = document.getElementById('newScrapForm');
const saveScrapBtn = document.getElementById('saveScrapBtn');
const cancelScrapBtn = document.getElementById('cancelScrapBtn');
const scrapText = document.getElementById('scrapText');

let isSidebarOpen = false;

function updateToggleButtonPosition() {
    const sidebarWidth = isSidebarOpen ? '66.67%' : '33.33%'; // Sidebar size
    const buttonLeftPosition = `calc(${sidebarWidth} - 20px)`; // Button position
    toggleButton.style.left = buttonLeftPosition;
}

toggleButton.addEventListener('click', () => {
    if (isSidebarOpen) {
        sidebar.style.width = '33.33%'; // Shrink Menu
        mapContainer.style.width = '66.67%'; // Open map
        toggleButton.textContent = '>';
    } else {
        sidebar.style.width = '66.67%';
        mapContainer.style.width = '33.33%';
        toggleButton.textContent = '<';
    }

    isSidebarOpen = !isSidebarOpen;
    updateToggleButtonPosition();
});

// Show New Scrap
newScrapBtn.addEventListener('click', () => {
    newScrapForm.style.display = 'block'; // Show the form
    scrapText.focus();  
});

// Hide New Scrap
cancelScrapBtn.addEventListener('click', () => {
    newScrapForm.style.display = 'none'; // Hide the form
    scrapText.value = ''; // Clear text 
});

// Saving scrap placeholder
saveScrapBtn.addEventListener('click', () => {
    const scrapContent = scrapText.value;
    if (scrapContent.trim()) {
        
        console.log('Saving scrap:', scrapContent);
        
        // Hide the form after saving
        newScrapForm.style.display = 'none';
        scrapText.value = ''; // Clear text 
    } else {
        alert('Please enter some text for the scrap!');
    }
});

const friendsListContainer = document.getElementById('friendsListContainer');
const friendsListBtn = document.getElementById('friendsListBtn');
const friendUsername = document.getElementById('friendUsername');
const followBtn = document.getElementById('followBtn');
const friendsDropdown = document.getElementById('friendsDropdown');

// Load existing friends from localStorage 
const loadFriends = () => {
    const friends = JSON.parse(localStorage.getItem('friends')) || [];
    friends.forEach(friend => addFriendToDropdown(friend));
};

// Save  friend to localStorage & update the dropdown
const saveFriend = (friend) => {
    const friends = JSON.parse(localStorage.getItem('friends')) || [];
    friends.push(friend);
    localStorage.setItem('friends', JSON.stringify(friends));
    addFriendToDropdown(friend);
};

// Add  friend to  dropdown 
const addFriendToDropdown = (friend) => {
    const option = document.createElement('option');
    option.textContent = friend;
    option.value = friend;
    friendsDropdown.appendChild(option);
};

// Toggle visibility of the friends list container
friendsListBtn.addEventListener('click', () => {
    friendsListContainer.style.display =
        friendsListContainer.style.display === 'none' ? 'block' : 'none';
});

// Handle adding a friend
followBtn.addEventListener('click', () => {
    const username = friendUsername.value.trim();
    if (username) {
        saveFriend(username);
        friendUsername.value = ''; // Clear input field
    } else {
        alert('Please enter a username!');
    }
});

// Initialize the friends list on page load
document.addEventListener('DOMContentLoaded', loadFriends);
