// API
const apiKey = 'b0382669c9328837aaf0f69d';
const apiURL = `https://v6.exchangerate-api.com/v6/${apiKey}/latest/`;

// Function to fetch exchange rates from API
async function fetchExchangeRates(baseCurrency) {
    try {
        const response = await fetch(`${apiURL}${baseCurrency}`);
        if (!response.ok) {
            throw new Error('Failed to fetch exchange rates.');
        }
        const data = await response.json();
        return data.conversion_rates;
    } catch (error) {
        console.error('Error fetching exchange rates:', error);
        return null;
    }
}

// Populate currency dropdowns with API-supported currencies
async function populateCurrencyDropdowns() {
    const defaultBase = 'USD'; // Default base currency to fetch
    const conversionRates = await fetchExchangeRates(defaultBase);

    if (conversionRates) {
        const currencies = Object.keys(conversionRates);
        const fromDropdown = document.getElementById('fromCurrency');
        const toDropdown = document.getElementById('toCurrency');
        const currencyToAddDropdown = document.getElementById('currencyToAdd');

        currencies.forEach(currency => {
            let option1 = document.createElement('option');
            let option2 = document.createElement('option');
            option1.value = currency;
            option1.text = currency;
            option2.value = currency;
            option2.text = currency;
            fromDropdown.appendChild(option1);
            toDropdown.appendChild(option2);

            // Exclude USD from the "Add to Watchlist" dropdown
            if (currency !== 'USD') {
                let option3 = document.createElement('option');
                option3.value = currency;
                option3.text = currency;
                currencyToAddDropdown.appendChild(option3);
            }
        });

        fromDropdown.selectedIndex = 0;
        toDropdown.selectedIndex = 1;
    }
}


// Watchlist functionality
const watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];

function addToWatchlist(currency) {
    if (!watchlist.includes(currency)) {
        watchlist.push(currency);
        localStorage.setItem('watchlist', JSON.stringify(watchlist));
        displayWatchlist();
    }
}

function displayWatchlist() {
    const container = document.getElementById('watchlist');
    container.innerHTML = ''; // Clear previous content
    const baseCurrency = 'USD';

    fetchExchangeRates(baseCurrency).then(conversionRates => {
        if (conversionRates) {
            watchlist.forEach(currency => {
                const rate = conversionRates[currency];
                const item = document.createElement('div');
                item.className = 'watchlist-item';
                item.innerHTML = `
                    <p>
                        ${currency}: ${rate.toFixed(2)} <span class="live-dot"></span> 
                        <span class="live-rate-text"><i>live rate</i></span>
                    </p>
                    <button class="remove-btn" onclick="removeFromWatchlist('${currency}')">Remove</button>
                `;
                container.appendChild(item);
            });
        }
    });
}

// Event listener for the "Add to Watchlist" button
document.getElementById('addToWatchlistBtn').addEventListener('click', () => {
    const currencyToAdd = document.getElementById('currencyToAdd').value;
    if (currencyToAdd) {
        addToWatchlist(currencyToAdd);
    }
});

// Fetch and display watchlist on page load
displayWatchlist();

// Attach event listener to the button
document.getElementById('convertBtn').addEventListener('click', convertCurrency);

// Initialize dropdowns with API data
populateCurrencyDropdowns();

// Fetch and calculate exchange rate dynamically
async function convertCurrency() {
    const amount = document.getElementById('amount').value;
    const fromCurrency = document.getElementById('fromCurrency').value;
    const toCurrency = document.getElementById('toCurrency').value;
    const resultDiv = document.getElementById('result');

    if (!amount || isNaN(amount)) {
        resultDiv.textContent = 'Please enter a valid amount.';
        return;
    }

    if (fromCurrency === toCurrency) {
        resultDiv.textContent = 'Please select different currencies for conversion.';
        return;
    }

    const conversionRates = await fetchExchangeRates(fromCurrency);

    if (conversionRates && conversionRates[toCurrency]) {
        const rate = conversionRates[toCurrency];
        const result = (amount * rate).toFixed(2);
        resultDiv.textContent = `${amount} ${fromCurrency} = ${result} ${toCurrency}`;
    } else {
        resultDiv.textContent = 'Failed to get conversion rate.';
    }
}

// Remove currency from watchlist 
function removeFromWatchlist(currency) {
    const index = watchlist.indexOf(currency);
    if (index !== -1) {
        watchlist.splice(index, 1);
        localStorage.setItem('watchlist', JSON.stringify(watchlist));
        displayWatchlist();
    }
}