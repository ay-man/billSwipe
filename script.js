'use strict';

// Variable declarations
var congressContainer = document.querySelector('.congress');
var allCards = document.querySelectorAll('.congress--card');
var nope = document.getElementById('nope');
var love = document.getElementById('love');

// Backend server URL
const backendURL = 'http://192.168.50.111:8000/search';

function sendQueryToBackend(query) {
    const fullURL = `${backendURL}?query=${encodeURIComponent(query)}`;
    fetch(fullURL)
        .then(response => {
            console.log(response); // Log the raw response
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.text(); // First get the response as text
        })
        .then(text => {
            try {
                const data = JSON.parse(text); // Try to parse it as JSON
                displayResponse(data);
            } catch (error) {
                console.error("Parsing error:", error, "Response:", text);
            }
        })
        .catch(error => {
            console.error('Network error:', error);
        });
}

// Function to dynamically create and display cards based on the response data
function displayResponse(data) {
    const cardsContainer = document.querySelector('.congress--cards');
    cardsContainer.innerHTML = ''; // Clear existing cards

    data.forEach(bill => {
        // Create the card element
        const card = document.createElement('div');
        card.className = 'congress--card';

        // Add image to the card
        const image = document.createElement('img');
        image.src = "https://picsum.photos/600/300"; // Replace with actual image if available
        card.appendChild(image);

        // Add sponsor name to the card
        const sponsorName = document.createElement('h3');
        sponsorName.className = 'sponsor-name';
        sponsorName.textContent = bill.sponsor_name || 'Unknown Sponsor';
        card.appendChild(sponsorName);

        // Add bill ID to the card
        const billId = document.createElement('p');
        billId.className = 'bill-id';
        billId.textContent = bill.bill_id || 'No Bill ID';
        card.appendChild(billId);

        // Add title to the card
        const title = document.createElement('p');
        title.className = 'title';
        title.textContent = bill.title || 'No Title Available';
        card.appendChild(title);

        // Append the new card to the container
        cardsContainer.appendChild(card);

        // Initialize Hammer.js on the new card
        let hammertime = new Hammer(card);

        hammertime.on('pan', function (event) {
            card.classList.add('moving');
            if (event.deltaX === 0) return;
            if (event.center.x === 0 && event.center.y === 0) return;

            congressContainer.classList.toggle('congress_love', event.deltaX > 0);
            congressContainer.classList.toggle('congress_nope', event.deltaX < 0);

            var xMulti = event.deltaX * 0.03;
            var yMulti = event.deltaY / 80;
            var rotate = xMulti * yMulti;

            card.style.transform = 'translate(' + event.deltaX + 'px, ' + event.deltaY + 'px) rotate(' + rotate + 'deg)';
        });

        hammertime.on('panend', function (event) {
            card.classList.remove('moving');
            congressContainer.classList.remove('congress_love');
            congressContainer.classList.remove('congress_nope');

            var moveOutWidth = document.body.clientWidth;
            var keep = Math.abs(event.deltaX) < 80 || Math.abs(event.velocityX) < 0.5;

            card.classList.toggle('removed', !keep);

            if (keep) {
                card.style.transform = '';
            } else {
                var endX = Math.max(Math.abs(event.velocityX) * moveOutWidth, moveOutWidth);
                var toX = event.deltaX > 0 ? endX : -endX;
                var endY = Math.abs(event.velocityY) * moveOutWidth;
                var toY = event.deltaY > 0 ? endY : -endY;
                var xMulti = event.deltaX * 0.03;
                var yMulti = event.deltaY / 80;
                var rotate = xMulti * yMulti;

                card.style.transform = 'translate(' + toX + 'px, ' + (toY + event.deltaY) + 'px) rotate(' + rotate + 'deg)';
            }
        });
    });
}


// Event listener for form submission
document.getElementById('queryForm').addEventListener('submit', function (event) {
    event.preventDefault();
    const userQuery = document.getElementById('userQuery').value;
    sendQueryToBackend(userQuery);
});

// Initialization and interaction logic for cards (using Hammer.js)
allCards.forEach(function (el) {
    var hammertime = new Hammer(el);

    hammertime.on('pan', function (event) {
        el.classList.add('moving');
    });

    hammertime.on('pan', function (event) {
        if (event.deltaX === 0) return;
        if (event.center.x === 0 && event.center.y === 0) return;

        congressContainer.classList.toggle('congress_love', event.deltaX > 0);
        congressContainer.classList.toggle('congress_nope', event.deltaX < 0);

        var xMulti = event.deltaX * 0.03;
        var yMulti = event.deltaY / 80;
        var rotate = xMulti * yMulti;

        event.target.style.transform = 'translate(' + event.deltaX + 'px, ' + event.deltaY + 'px) rotate(' + rotate + 'deg)';
    });

    hammertime.on('panend', function (event) {
        el.classList.remove('moving');
        congressContainer.classList.remove('congress_love');
        congressContainer.classList.remove('congress_nope');

        var moveOutWidth = document.body.clientWidth;
        var keep = Math.abs(event.deltaX) < 80 || Math.abs(event.velocityX) < 0.5;

        event.target.classList.toggle('removed', !keep);

        if (keep) {
            event.target.style.transform = '';
        } else {
            var endX = Math.max(Math.abs(event.velocityX) * moveOutWidth, moveOutWidth);
            var toX = event.deltaX > 0 ? endX : -endX;
            var endY = Math.abs(event.velocityY) * moveOutWidth;
            var toY = event.deltaY > 0 ? endY : -endY;
            var xMulti = event.deltaX * 0.03;
            var yMulti = event.deltaY / 80;
            var rotate = xMulti * yMulti;

            event.target.style.transform = 'translate(' + toX + 'px, ' + (toY + event.deltaY) + 'px) rotate(' + rotate + 'deg)';
            initCards();
        }
    });
});

// Function to initialize cards
function initCards() {
    var newCards = document.querySelectorAll('.congress--card:not(.removed)');

    newCards.forEach(function (card, index) {
        card.style.zIndex = allCards.length - index;
        card.style.transform = 'scale(' + (20 - index) / 20 + ') translateY(-' + 30 * index + 'px)';
        card.style.opacity = (10 - index) / 10;
    });

    congressContainer.classList.add('loaded');
}

// Button listeners for like/dislike
function createButtonListener(love) {
    return function (event) {
        var cards = document.querySelectorAll('.congress--card:not(.removed)');
        var moveOutWidth = document.body.clientWidth * 1.5;

        if (!cards.length) return false;

        var card = cards[0];

        card.classList.add('removed');

        if (love) {
            card.style.transform = 'translate(' + moveOutWidth + 'px, -100px) rotate(-30deg)';
        } else {
            card.style.transform = 'translate(-' + moveOutWidth + 'px, -100px) rotate(30deg)';
        }

        initCards();

        event.preventDefault();
    };
}

var nopeListener = createButtonListener(false);
var loveListener = createButtonListener(true);

nope.addEventListener('click', nopeListener);
love.addEventListener('click', loveListener);

// Call initCards to initialize cards at script load
initCards();

