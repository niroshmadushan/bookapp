// view_bookings.js
document.addEventListener('DOMContentLoaded', () => {
    // Define DOM elements
    const bookingsTableBody = document.querySelector('#bookingsTable tbody');
    const bookingModal = document.getElementById('bookingModal');
    const bookingDetails = document.getElementById('bookingDetails');
    const searchTermInput = document.getElementById('searchTerm');
    const statusFilterInput = document.getElementById('statusFilter');
    const searchBtn = document.getElementById('searchBtn');
    const printPdfBtn = document.getElementById('printPdfBtn');
    const closeModalBtn = document.querySelector('.close');
    
    // Variables for storing booking and payment data
    let bookings = [];
    let payments = [];
    let selectedBooking = null;

    // Fetch booking and payment data from the PHP backend
    async function fetchBookings() {
        try {
            const response = await fetch('get_all_booking_payment_details.php');
            const data = await response.json();
            bookings = data.bookingData;
            payments = data.paymentData;
            displayBookings(bookings); // Display bookings in the table
        } catch (error) {
            console.error('Error fetching bookings:', error);
        }
    }

    // Display bookings in the table
    function displayBookings(bookings) {
        bookingsTableBody.innerHTML = ''; // Clear existing rows
        bookings.forEach(booking => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${booking.bookingId}</td>
                <td>${booking.guestName}</td>
                <td>${booking.idPassport}</td>
                <td>${booking.checkInDate}</td>
                <td>${booking.checkOutDate}</td>
                <td>${booking.roomType}</td>
                <td>${booking.numGuests}</td>
                <td>${getBookingPaymentStatus(booking.bookingId)}</td>
            `;
            // Add click event listener to open the modal
            row.addEventListener('click', () => openModal(booking));
            bookingsTableBody.appendChild(row);
        });
    }

    // Get payment status for a booking
    function getBookingPaymentStatus(bookingId) {
        const payment = payments.find(p => p.bookingId === bookingId);
        return payment ? payment.paymentStatus : 'Unknown';
    }

    // Open the modal with booking and payment details in a two-column layout
    function openModal(booking) {
        selectedBooking = booking;
        const payment = payments.find(p => p.bookingId === booking.bookingId);
        bookingModal.style.display = 'block';

        // Set the modal content
        bookingDetails.innerHTML = `
            <h3>Booking Details</h3>
            <div class="modal-content-columns">
                ${createModalRow('Booking ID:', booking.bookingId)}
                ${createModalRow('Guest Name:', booking.guestName)}
                ${createModalRow('NIC/Passport ID:', booking.idPassport)}
                ${createModalRow('Email:', booking.guestEmail)}
                ${createModalRow('Phone Number:', booking.guestPhone)}
                ${createModalRow('Address:', booking.address)}
                ${createModalRow('Check-In Date:', booking.checkInDate)}
                ${createModalRow('Check-Out Date:', booking.checkOutDate)}
                ${createModalRow('Room Type:', booking.roomType)}
                ${createModalRow('Number of Rooms:', booking.numRooms)}
                ${createModalRow('Number of Guests:', booking.numGuests)}
                ${createModalRow('Special Requests:', booking.specialRequests)}
                ${createModalRow('Arrival Time:', booking.arrivalTime)}
                ${createModalRow('Departure Time:', booking.departureTime)}
                ${createModalRow('Arrival Meal:', booking.arrivalMeal)}
                ${createModalRow('Departure Meal:', booking.departureMeal)}
            </div>
            <h3>Payment Details</h3>
            <div class="modal-content-columns">
                ${createModalRow('Payment ID:', payment ? payment.paymentId : 'N/A')}
                ${createModalRow('Payment Method:', payment ? payment.paymentMethod : 'N/A')}
                ${createModalRow('Amount Paid:', payment ? payment.amountPaid : 'N/A')}
                ${createModalRow('Balance Due:', payment ? payment.balanceDue : 'N/A')}
                ${createModalRow('Payment Date:', payment ? payment.paymentDate : 'N/A')}
                ${createModalRow('Payment Status:', payment ? payment.paymentStatus : 'N/A')}
                ${createModalRow('Payment Reference:', payment ? payment.reference : 'N/A')}
            </div>
        `;
    }

    // Helper function to create a modal row with label and value
    function createModalRow(label, value) {
        return `
            <div class="modal-row">
                <div class="modal-label">${label}</div>
                <div class="modal-value">${value}</div>
            </div>
        `;
    }

    // Close the modal
    closeModalBtn.onclick = function() {
        bookingModal.style.display = 'none';
    };

    // Close modal when clicking outside of it
    window.onclick = function(event) {
        if (event.target == bookingModal) {
            bookingModal.style.display = 'none';
        }
    };

    // Search and filter bookings
    searchBtn.onclick = function() {
        const searchTerm = searchTermInput.value.toLowerCase();
        const statusFilter = statusFilterInput.value;
        const filteredBookings = bookings.filter(booking => {
            const matchesSearchTerm = 
                booking.bookingId.toString().includes(searchTerm) ||
                booking.guestName.toLowerCase().includes(searchTerm) ||
                booking.idPassport.includes(searchTerm);

            const paymentStatus = getBookingPaymentStatus(booking.bookingId);
            const matchesStatusFilter = statusFilter ? paymentStatus === statusFilter : true;

            return matchesSearchTerm && matchesStatusFilter;
        });
        displayBookings(filteredBookings);
    };

    // Generate and print the booking details using the browser's print functionality
    printPdfBtn.onclick = function() {
        if (!selectedBooking) return;

        // Find the payment details for the selected booking
        const payment = payments.find(p => p.bookingId === selectedBooking.bookingId);

        // Create the printable content
        const printableContent = `
            <h3>Booking Details</h3>
            <p><strong>Booking ID:</strong> ${selectedBooking.bookingId}</p>
            <p><strong>Guest Name:</strong> ${selectedBooking.guestName}</p>
            <p><strong>NIC/Passport ID:</strong> ${selectedBooking.idPassport}</p>
            <p><strong>Email:</strong> ${selectedBooking.guestEmail}</p>
            <p><strong>Phone Number:</strong> ${selectedBooking.guestPhone}</p>
            <p><strong>Address:</strong> ${selectedBooking.address}</p>
            <p><strong>Check-In Date:</strong> ${selectedBooking.checkInDate}</p>
            <p><strong>Check-Out Date:</strong> ${selectedBooking.checkOutDate}</p>
            <p><strong>Room Type:</strong> ${selectedBooking.roomType}</p>
            <p><strong>Number of Rooms:</strong> ${selectedBooking.numRooms}</p>
            <p><strong>Number of Guests:</strong> ${selectedBooking.numGuests}</p>
            <p><strong>Special Requests:</strong> ${selectedBooking.specialRequests}</p>
            <p><strong>Arrival Time:</strong> ${selectedBooking.arrivalTime}</p>
            <p><strong>Departure Time:</strong> ${selectedBooking.departureTime}</p>
            <p><strong>Arrival Meal:</strong> ${selectedBooking.arrivalMeal}</p>
            <p><strong>Departure Meal:</strong> ${selectedBooking.departureMeal}</p>
            
            <h3>Payment Details</h3>
            <p><strong>Payment ID:</strong> ${payment ? payment.paymentId : 'N/A'}</p>
            <p><strong>Payment Method:</strong> ${payment ? payment.paymentMethod : 'N/A'}</p>
            <p><strong>Amount Paid (Rs.):</strong> ${payment ? payment.amountPaid : 'N/A'}</p>
            <p><strong>Balance Due (Rs.) :</strong> ${payment ? payment.balanceDue : 'N/A'}</p>
            <p><strong>Payment Date:</strong> ${payment ? payment.paymentDate : 'N/A'}</p>
            <p><strong>Payment Status:</strong> ${payment ? payment.paymentStatus : 'N/A'}</p>
            <p><strong>Payment Reference:</strong> ${payment ? payment.reference : 'N/A'}</p>
        `;

        // Insert the content into the printable area
        document.getElementById('printableContent').innerHTML = printableContent;

        // Show the printable area
        document.getElementById('printableArea').style.display = 'block';

        // Open the print dialog
        window.print();

        // Hide the printable area again after printing
        document.getElementById('printableArea').style.display = 'none';
    };

    // Initial data fetch
    fetchBookings();
});
