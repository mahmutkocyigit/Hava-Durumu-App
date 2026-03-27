const PROXY_URL = "https://weather-backend-xi5v.onrender.com";

const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const loader = document.getElementById("loader");
const errorCard = document.getElementById("errorCard");
const weatherCard = document.getElementById("weatherCard");

const cityNameEl = document.getElementById("cityName");
const countryEl = document.getElementById("countryCode");
const currentDateEl = document.getElementById("currentDate");
const weatherIconEl = document.getElementById("weatherIcon");
const tempValueEl = document.getElementById("tempValue");
const feelsLikeEl = document.getElementById("feelsLike");
const weatherDescEl = document.getElementById("weatherDesc");
const humidityEl = document.getElementById("humidity");
const windSpeedEl = document.getElementById("windSpeed");
const pressureEl = document.getElementById("pressure");
const visibilityEl = document.getElementById("visibility");
const sunriseEl = document.getElementById("sunrise");
const sunsetEl = document.getElementById("sunset");
const forecastListEl = document.getElementById("forecastList");

const errorTitleEl = document.getElementById("errorTitle");
const errorMsgEl = document.getElementById("errorMsg");

function formatTime(unixTimestamp, timezoneOffset) {
    const localMs = (unixTimestamp + timezoneOffset) * 1000;
    const date = new Date(localMs);
    const hours = String(date.getUTCHours()).padStart(2, "0");
    const minutes = String(date.getUTCMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
}

function getFormattedDate() {
    return new Date().toLocaleDateString("tr-TR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    });
}

function showSection(section) {
    loader.classList.remove("active");
    errorCard.classList.remove("active");
    weatherCard.classList.remove("active");
    if (section === "loader") loader.classList.add("active");
    if (section === "error") errorCard.classList.add("active");
    if (section === "weather") weatherCard.classList.add("active");
}

function applyWeatherBackground(weatherMain) {
    document.body.className = document.body.className
        .split(" ")
        .filter(cls => !cls.startsWith("weather-"))
        .join(" ");
    const cls = "weather-" + weatherMain.toLowerCase();
    document.body.classList.add(cls);
}

function createParticles(count = 15) {
    const container = document.getElementById("bgParticles");
    container.innerHTML = "";
    for (let i = 0; i < count; i++) {
        const particle = document.createElement("div");
        particle.classList.add("particle");
        const size = Math.random() * 100 + 20;
        particle.style.width = size + "px";
        particle.style.height = size + "px";
        particle.style.left = Math.random() * 100 + "%";
        particle.style.top = Math.random() * 100 + 100 + "%";
        particle.style.animationDuration = (Math.random() * 12 + 8) + "s";
        particle.style.animationDelay = -Math.random() * 20 + "s";
        container.appendChild(particle);
    }
}

async function fetchWeather(city) {
    const trimmedCity = city.trim();
    if (!trimmedCity) return;

    showSection("loader");

    const currentUrl = `${PROXY_URL}/weather?city=${encodeURIComponent(trimmedCity)}`;
    const forecastUrl = `${PROXY_URL}/forecast?city=${encodeURIComponent(trimmedCity)}`;

    try {
        const [currentRes, forecastRes] = await Promise.all([
            fetch(currentUrl),
            fetch(forecastUrl)
        ]);

        if (!currentRes.ok || !forecastRes.ok) {
            throw new Error("CITY_NOT_FOUND");
        }

        const currentData = await currentRes.json();
        const forecastData = await forecastRes.json();

        updateWeatherCard(currentData);
        updateForecastCard(forecastData);
        applyWeatherBackground(currentData.weather[0].main);
        showSection("weather");

    } catch (error) {
        showSection("error");
        handleError(error);
    }
}

function updateWeatherCard(data) {
    cityNameEl.textContent = data.name;
    countryEl.textContent = data.sys.country;
    currentDateEl.textContent = getFormattedDate();

    const iconCode = data.weather[0].icon;
    weatherIconEl.src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
    weatherIconEl.alt = data.weather[0].description;

    tempValueEl.textContent = Math.round(data.main.temp);
    feelsLikeEl.textContent = Math.round(data.main.feels_like);
    weatherDescEl.textContent = data.weather[0].description;

    humidityEl.textContent = data.main.humidity + "%";
    pressureEl.textContent = data.main.pressure + " hPa";

    const windKmh = (data.wind.speed * 3.6).toFixed(1);
    windSpeedEl.textContent = windKmh + " km/s";

    if (data.visibility !== undefined) {
        visibilityEl.textContent = (data.visibility / 1000).toFixed(1) + " km";
    } else {
        visibilityEl.textContent = "N/A";
    }

    const tz = data.timezone;
    sunriseEl.textContent = formatTime(data.sys.sunrise, tz);
    sunsetEl.textContent = formatTime(data.sys.sunset, tz);
}

function updateForecastCard(data) {
    forecastListEl.innerHTML = "";
    
    const dailyData = data.list.filter(item => item.dt_txt.includes("12:00:00"));

    dailyData.forEach(item => {
        const date = new Date(item.dt * 1000);
        const dayName = date.toLocaleDateString("tr-TR", { weekday: "short" });
        const icon = item.weather[0].icon;
        const temp = Math.round(item.main.temp);

        const forecastItem = document.createElement("div");
        forecastItem.classList.add("forecast-item");
        forecastItem.innerHTML = `
            <span class="forecast-day">${dayName}</span>
            <img src="https://openweathermap.org/img/wn/${icon}.png" alt="icon">
            <span class="forecast-temp">${temp}°C</span>
        `;
        forecastListEl.appendChild(forecastItem);
    });
}

function handleError(error) {
    if (error.message === "CITY_NOT_FOUND") {
        errorTitleEl.textContent = "Şehir Bulunamadı";
        errorMsgEl.textContent = "Girdiğiniz şehir bulunamadı. Lütfen tekrar deneyin.";
        applyWeatherBackground("default");
    } else {
        errorTitleEl.textContent = "Hata Oluştu";
        errorMsgEl.textContent = "Veriler alınırken bir sorun çıktı.";
    }
}

searchBtn.addEventListener("click", () => fetchWeather(cityInput.value));
cityInput.addEventListener("keydown", (e) => { if (e.key === "Enter") fetchWeather(cityInput.value); });

createParticles(15);
fetchWeather("Istanbul");