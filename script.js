// Fetching the list of parties and rendering it
const partyList = document.getElementById('party-list');
const partyForm = document.getElementById('party-form');

// Updated API URL
const apiUrl = 'https://fsa-crud-2aa9294fe819.herokuapp.com/api/2408-FTB-MT-WEB-PT/events';

// Fetch the party data from the API
async function fetchParties() {
  try {
    const response = await fetch(apiUrl);
    const data = await response.json(); // Fetch full response object
    console.log(data);  // Log the response to inspect the structure
    renderParties(data.data); // Access the 'data' array within the response
  } catch (error) {
    console.error('Error fetching parties:', error);
  }
}

// Function to render parties to the DOM
function renderParties(events) {

  // Clear current party list to avoid duplicate rendering
  partyList.innerHTML = '';

    events.forEach(event => {
        const date = new Date(event.date).toLocaleDateString(); // Format the ISO date
        const time = new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); // Extract and format the time
        
        const li = document.createElement('li');
        li.innerHTML = `
          <h3>${event.name}</h3>
          <p>Date: ${date}</p>
          <p>Time: ${time}</p> 
          <p>Location: ${event.location}</p>
          <p>Description: ${event.description}</p>
          <button data-id="${event.id}">Delete</button>
        `;
    partyList.appendChild(li);
  });

  // Add delete button functionality
  const deleteButtons = document.querySelectorAll('button[data-id]');
  deleteButtons.forEach(button => {
    button.addEventListener('click', deleteParty);
  });
}

// Function to add a new party via form submission
partyForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const name = document.getElementById('name').value;
  const date = document.getElementById('date').value;
  const time = document.getElementById('time').value;
  const location = document.getElementById('location').value;
  const description = document.getElementById('description').value;

  // Combine date and time into a single ISO 8601 string
  const dateTime = new Date(`${date}T${time}`).toISOString();

  const newEvent = {
    name,
    date: dateTime, 
    location,
    description
  };

  console.log("Event to be added:", newEvent);

  try {
    // POST request to add the new party to the API
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newEvent)
    });
    
    const result = await response.json(); // Parse the response
    console.log('Response from the API:', result); // Log the API response
    
    if (response.ok) {
        console.log("Event added successfully!");
      fetchParties(); // Refresh the party list after adding
      partyForm.reset(); // Clear form after submission
    } else {
      console.error('Error adding party:', result.message || response.statusText);
    }
  } catch (error) {
    console.error('Error adding party:', error);
  }
});

// Function to delete a party
async function deleteParty(e) {
  const partyId = e.target.getAttribute('data-id');

  try {
    // DELETE request to remove the party from the API
    const response = await fetch(`${apiUrl}/${partyId}`, {
      method: 'DELETE'
    });

    if (response.ok) {
      fetchParties(); // Refresh the party list after deletion
    } else {
      console.error('Error deleting party:', response.statusText);
    }
  } catch (error) {
    console.error('Error deleting party:', error);
  }
}

// Initial fetch to load the parties when the page loads
fetchParties();