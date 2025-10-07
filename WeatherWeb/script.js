const API_KEY = "717b64c259b63d6656a8032709d0a797"; 
const API_CURRENT_URL = "https://api.openweathermap.org/data/2.5/weather";
const API_FORECAST_URL = "https://api.openweathermap.org/data/2.5/forecast";

const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const weatherDisplay = document.getElementById('weather-display');
const forecastDisplay = document.getElementById('forecast-display');
const forecastCardsList = document.getElementById('forecast-cards-list');
const errorCard = document.getElementById('error-message-card');
const errorText = document.getElementById('error-message-text');

const countryNames = {
    "ID": "Indonesia", "US": "Amerika Serikat", "GB": "Britania Raya",
    "AU": "Australia", "IT": "Italia", "FR": "Prancis", "DE": "Jerman",
    "JP": "Jepang", "CN": "Tiongkok", "SG": "Singapura", "MY": "Malaysia",
    "TH": "Thailand", "VN": "Vietnam", "PH": "Filipina", "KR": "Korea Selatan"
};

function getCountryFullName(code) {
    return countryNames[code] || code;
}

function showError(message) {
    weatherDisplay.classList.add('hidden');
    forecastDisplay.classList.add('hidden');
    errorText.textContent = message;
    errorCard.classList.remove('hidden');
}

function showContent() {
    errorCard.classList.add('hidden');
    weatherDisplay.classList.remove('hidden');
    forecastDisplay.classList.remove('hidden');
}

async function checkWeather(city) {
    if (!city) {
        showError("Mohon masukkan nama kota.");
        return;
    }

    weatherDisplay.innerHTML = `<p class="initial-message">Mencari ${city}...</p>`;
    showContent(); 

    const currentUrl = `${API_CURRENT_URL}?q=${city}&appid=${API_KEY}&units=metric&lang=id`;
    const forecastUrl = `${API_FORECAST_URL}?q=${city}&appid=${API_KEY}&units=metric&lang=id`;

    try {
        const [currentResponse, forecastResponse] = await Promise.all([
            fetch(currentUrl),
            fetch(forecastUrl)
        ]);
        
        const currentData = await currentResponse.json();
        const forecastData = await forecastResponse.json();
        
        if (currentData.cod === '404' || currentData.cod === 404) {
            showError(`Maaf, kota "${city}" tidak ditemukan. Coba periksa ejaan Anda.`);
            return;
        }

        if (!currentResponse.ok || !forecastResponse.ok) {
            throw new Error(`Kesalahan API: ${currentData.message || 'Gagal memuat salah satu data'}`);
        }

        displayCurrentWeather(currentData);
        displayForecast(forecastData);

    } catch (error) {
        console.error("Terjadi kesalahan:", error);
        showError("Terjadi masalah saat mengambil data cuaca. Periksa koneksi internet atau API Key Anda.");
    }
}

function displayCurrentWeather(data) {
    const temp = Math.round(data.main.temp);
    const description = data.weather[0].description;
    const humidity = data.main.humidity;
    const windSpeed = data.wind.speed;
    const iconCode = data.weather[0].icon;
    const countryCode = data.sys.country; 
    
    const countryFullName = getCountryFullName(countryCode);
    const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
    
    showContent(); 

    weatherDisplay.innerHTML = `
        <img src="${iconUrl}" class="weather-icon" alt="${description}">
        <div class="city-name">${data.name}</div>
        <div class="country-name">${countryFullName}</div>
        <div class="temperature">${temp}°C</div>
        <div class="description">${description}</div>
        
        <div class="details">
            <div class="col">
                <span>${humidity}%</span>
                <p>Kelembaban</p>
            </div>
            <div class="col">
                <span>${windSpeed} m/s</span>
                <p>Angin</p>
            </div>
        </div>
    `;
}

function displayForecast(data) {
    forecastCardsList.innerHTML = '';
    
    const forecasts = data.list;
    const today = new Date().toDateString();

    const uniqueDays = {};

    forecasts.forEach(item => {
        const date = new Date(item.dt * 1000);
        const dateKey = date.toDateString();
        const timeHour = date.getHours();

        if (dateKey !== today && (!uniqueDays[dateKey] || (timeHour >= 12 && timeHour <= 14))) {
            uniqueDays[dateKey] = item;
        }
    });

    const dailyForecasts = Object.values(uniqueDays).slice(0, 5);

    dailyForecasts.forEach(item => {
        const date = new Date(item.dt * 1000);
        const dayName = date.toLocaleDateString('id-ID', { weekday: 'short' });
        const temp = Math.round(item.main.temp);
        const iconCode = item.weather[0].icon;
        const iconUrl = `https://openweathermap.org/img/wn/${iconCode}.png`;

        const cardHTML = `
            <div class="forecast-card">
                <div class="date">${dayName}</div>
                <img src="${iconUrl}" alt="${item.weather[0].description}">
                <div class="temp">${temp}°C</div>
            </div>
        `;
        forecastCardsList.innerHTML += cardHTML;
    });
}

searchBtn.addEventListener('click', () => {
    checkWeather(cityInput.value.trim());
});

cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchBtn.click();
    }
});

checkWeather("Bandung");
