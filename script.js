const apiUrl = 'https://fsa-crud-2aa9294fe819.herokuapp.com/api/2408-FTB-MT-WEB-PT';
const partyList = document.getElementById('party-list');
const partyForm = document.getElementById('party-form');

// Fetch the party data from the API and render it
async function fetchParties() {
  try {
    const response = await fetch(`${apiUrl}/events`);
    const data = await response.json(); // Fetch full response object
    renderParties(data.data); // Access the 'data' array within the response
  } catch (error) {
    console.error('Error fetching parties:', error);
  }
}

// Function to render parties, RSVP form, and guest list for each event
function renderParties(events) {
  partyList.innerHTML = ''; // Clear current party list to avoid duplicate rendering

  events.forEach(event => {
    const li = document.createElement('li');
    const date = new Date(event.date).toLocaleDateString(); // Format the ISO date
    const time = new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); // Extract and format the time

    li.innerHTML = `
      <h3>${event.name}</h3>
      <p>Date: ${date}</p>
      <p>Time: ${time}</p> 
      <p>Location: ${event.location}</p>
      <p>Description: ${event.description}</p>
      <button data-id="${event.id}">Delete</button>

      <h4>RSVP to this event</h4>
      <form id="rsvp-form-${event.id}" class="rsvp-form">
        <input type="text" id="guest-name-${event.id}" placeholder="Your Name" required>
        <input type="email" id="guest-email-${event.id}" placeholder="Your Email" required>
        <input type="tel" id="guest-phone-${event.id}" placeholder="Your Phone Number" required>
        <button type="submit">Submit RSVP</button>
      </form>
    `;

    // Append the party details, RSVP form, and guest list to the list
    partyList.appendChild(li);

    // Fetch and display guests for this event
    // fetchGuests(event.id);

    // Attach event listener for RSVP form submission
    document.getElementById(`rsvp-form-${event.id}`).addEventListener('submit', (e) => {
      e.preventDefault();
      let guestName = document.getElementById(`guest-name-${event.id}`).value;
      let guestEmail = document.getElementById(`guest-email-${event.id}`).value;
      let guestPhone = document.getElementById(`guest-phone-${event.id}`).value;

      addGuestAndRSVP(event.id, guestName, guestEmail, guestPhone);
      document.getElementById(`guest-name-${event.id}`).value = '';
      document.getElementById(`guest-email-${event.id}`).value = '';
      document.getElementById(`guest-phone-${event.id}`).value = '';
    });

    // Attach event listener for deleting a party
    document.querySelector(`button[data-id="${event.id}"]`).addEventListener('click', () => {
      deleteParty(event.id);
    });
  });
}

// Function to post guest info and then RSVP
async function addGuestAndRSVP(eventId, guestName, guestEmail, guestPhone) {
  const newGuest = {
    name: guestName,
    email: guestEmail,
    phone: guestPhone
  };

  try {
    // POST request to create the guest
    const response = await fetch(`${apiUrl}/guests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newGuest),
    });

    if (!response.ok) {
      console.error('Error adding guest:', response.statusText);
      return;
    }

    // Extract guestId from response
    const guestData = await response.json();
    console.log(guestData);
    const guestId = guestData.data.id; // Make sure we are getting the guestId from 'id'

    // Now, make a POST request to RSVP
    addRSVP(eventId, guestId);
  } catch (error) {
    console.error('Error adding guest and RSVP:', error);
  }
}

// Function to add an RSVP for a specific event
async function addRSVP(eventId, guestId) {
  const newRSVP = {
    eventId,  // Ensure this is correct
    guestId   // Ensure this is correct
  };

  console.log("Submitting RSVP with data:", newRSVP);  // Log what you're sending

  try {
    const response = await fetch(`${apiUrl}/rsvps`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newRSVP),  // Send RSVP data
    });

    if (response.ok) {
      console.log('RSVP added successfully!');
    }
  
       // fetchGuests(eventId);  // Refresh the guest list after RSVP
    
  } catch (error) {
    console.error('Error adding RSVP:', error);
  }
}

// Function to delete a party
async function deleteParty(eventId) {
  try {
    const response = await fetch(`${apiUrl}/events/${eventId}`, {
      method: 'DELETE',
    });

    if (response.ok) {
      console.log('Party deleted successfully!');
      fetchParties();
    } 
  } catch (error) {
    console.error(`Error deleting party:`, error);
  }
}

// Function to add a new party via form submission
partyForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('name').value;
  const date = document.getElementById('date').value;
  const time = document.getElementById('time').value;
  const location = document.getElementById('location').value;
  const description = document.getElementById('description').value;

  const dateTime = new Date(`${date}T${time}`).toISOString();

  const newEvent = {
    name,
    date: dateTime,
    location,
    description,
  };

  console.log("Event to be added:", newEvent);

  try {
    const response = await fetch(`${apiUrl}/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newEvent),
    });

    const result = await response.json();
    console.log('Response from the API:', result);

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

fetchParties();
