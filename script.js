const TRIP_STORAGE_KEY = "transitgo.philippines-trips.v1";
const SEARCH_BASE_URL = "https://12go.asia/en";
const SUPPORT_WHATSAPP = "639632534989";

const places = [
  { name: "Manila", region: "Metro Manila", slug: "manila", lat: 14.5995, lon: 120.9842 },
  { name: "Cebu City", region: "Cebu", slug: "cebu", lat: 10.3157, lon: 123.8854 },
  { name: "Baguio", region: "Cordillera", slug: "baguio", lat: 16.4023, lon: 120.5960 },
  { name: "Boracay", region: "Aklan", slug: "boracay", lat: 11.9674, lon: 121.9248 },
  { name: "Caticlan", region: "Aklan", slug: "caticlan", lat: 11.9330, lon: 121.9530 },
  { name: "Iloilo", region: "Western Visayas", slug: "iloilo", lat: 10.7202, lon: 122.5621 },
  { name: "Bacolod", region: "Negros Occidental", slug: "bacolod", lat: 10.6765, lon: 122.9509 },
  { name: "Dumaguete", region: "Negros Oriental", slug: "dumaguete", lat: 9.3068, lon: 123.3054 },
  { name: "Tagbilaran", region: "Bohol", slug: "tagbilaran", lat: 9.6476, lon: 123.8554 },
  { name: "Ormoc", region: "Leyte", slug: "ormoc", lat: 11.0064, lon: 124.6075 },
  { name: "Tacloban", region: "Leyte", slug: "tacloban", lat: 11.2440, lon: 125.0030 },
  { name: "Puerto Princesa", region: "Palawan", slug: "puerto-princesa", lat: 9.7392, lon: 118.7353 },
  { name: "Coron", region: "Palawan", slug: "coron", lat: 11.9986, lon: 120.2043 },
  { name: "El Nido", region: "Palawan", slug: "el-nido", lat: 11.1950, lon: 119.4110 },
  { name: "Davao", region: "Davao Region", slug: "davao", lat: 7.1907, lon: 125.4553 },
  { name: "Cagayan de Oro", region: "Misamis Oriental", slug: "cagayan-de-oro", lat: 8.4542, lon: 124.6319 },
  { name: "Zamboanga", region: "Zamboanga Peninsula", slug: "zamboanga", lat: 6.9214, lon: 122.0790 },
  { name: "Siargao", region: "Surigao del Norte", slug: "siargao", lat: 9.7833, lon: 126.1600 },
  { name: "Butuan", region: "Agusan del Norte", slug: "butuan", lat: 8.9475, lon: 125.5406 },
  { name: "Batangas", region: "Calabarzon", slug: "batangas", lat: 13.7565, lon: 121.0583 },
  { name: "Calapan", region: "Oriental Mindoro", slug: "calapan", lat: 13.4110, lon: 121.1800 },
  { name: "Roxas City", region: "Capiz", slug: "roxas-city", lat: 11.5853, lon: 122.7511 },
  { name: "Masbate", region: "Bicol Region", slug: "masbate", lat: 12.3667, lon: 123.6167 },
  { name: "Legazpi", region: "Albay", slug: "legazpi", lat: 13.1391, lon: 123.7438 },
  { name: "Camiguin", region: "Northern Mindanao", slug: "camiguin", lat: 9.1732, lon: 124.7290 },
  { name: "Bantayan", region: "Cebu", slug: "bantayan", lat: 11.2000, lon: 123.7300 }
];

const form = document.getElementById("travel-form");
const originInput = document.getElementById("from-place");
const destinationInput = document.getElementById("to-place");
const dateInput = document.getElementById("travel-date");
const passengerInput = document.getElementById("passengers");
const vehicleInput = document.getElementById("vehicle-type");
const resultsList = document.getElementById("results-list");
const routeCount = document.getElementById("route-count");
const resultsTitle = document.getElementById("results-title");
const resultsEyebrow = document.getElementById("results-eyebrow");
const searchMessage = document.getElementById("search-message");
const vehicleField = document.getElementById("vehicle-field");
const savedList = document.getElementById("saved-list");
const hotelForm = document.getElementById("hotel-form");
const hotelDestinationInput = document.getElementById("hotel-destination");
const hotelMessage = document.getElementById("hotel-message");
const hotelResults = document.getElementById("hotel-results");
const hotelApiStatus = document.getElementById("hotel-api-status");

let travelType = "flight";

const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (character) => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;"
})[character]);

const getManilaDate = (date = new Date()) => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(date);
  const part = (type) => parts.find((item) => item.type === type).value;
  return `${part("year")}-${part("month")}-${part("day")}`;
};

const formatTripDate = (dateString) => {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Intl.DateTimeFormat("en-PH", {
    timeZone: "Asia/Manila",
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(Date.UTC(year, month - 1, day, 4)));
};

const setDefaultDate = () => {
  const today = new Date();
  document.getElementById("today-label").textContent = new Intl.DateTimeFormat("en-PH", {
    timeZone: "Asia/Manila",
    weekday: "short",
    month: "short",
    day: "numeric"
  }).format(today);
  document.getElementById("welcome-date").textContent = new Intl.DateTimeFormat("en-PH", {
    timeZone: "Asia/Manila",
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric"
  }).format(today).toUpperCase();
  dateInput.min = getManilaDate(today);
  dateInput.value = getManilaDate(today);
};

const populatePlaces = () => {
  const options = places.map((place) =>
    `<option value="${escapeHtml(place.slug)}">${escapeHtml(place.name)} · ${escapeHtml(place.region)}</option>`
  ).join("");
  originInput.innerHTML = options;
  destinationInput.innerHTML = options;
  hotelDestinationInput.innerHTML = options;
  originInput.value = "manila";
  destinationInput.value = "cebu";
  hotelDestinationInput.value = "cebu";
};

const getPlace = (slug) => places.find((place) => place.slug === slug);

const buildSearchUrl = (type, origin, destination, date, passengers) => {
  const url = new URL(`${SEARCH_BASE_URL}/${type}/${origin.slug}/${destination.slug}`);
  url.searchParams.set("date", date);
  url.searchParams.set("people", String(passengers));
  url.searchParams.set("adults", String(passengers));
  url.searchParams.set("vehclasses_tab", "all");
  return url.href;
};

const renderHotels = (hotels) => {
  if (!hotels.length) {
    hotelResults.innerHTML = '<div class="empty-state"><strong>No mapped stays found nearby</strong><p>OpenStreetMap coverage varies. Try another destination or search a booking provider.</p></div>';
    return;
  }

  hotelResults.innerHTML = hotels.map(({ element, name, category, address }) => {
    const mapLink = `https://www.openstreetmap.org/${encodeURIComponent(element.type)}/${encodeURIComponent(element.id)}`;
    return `<article class="hotel-card">
      <div class="hotel-card-top"><div class="hotel-icon" aria-hidden="true">⌂</div><span class="hotel-category">${escapeHtml(category)}</span></div>
      <h3>${escapeHtml(name)}</h3>
      <p class="hotel-address">${escapeHtml(address || "Address not provided in OpenStreetMap")}</p>
      <div class="hotel-details"><span>Rates and availability not provided</span></div>
      <a class="provider-button" href="${mapLink}" target="_blank" rel="noopener noreferrer">View on OpenStreetMap ↗</a>
    </article>`;
  }).join("");
};

const searchHotels = async () => {
  const destination = getPlace(hotelDestinationInput.value);
  if (!destination) {
    hotelMessage.textContent = "Choose a destination to search for hotels.";
    hotelMessage.classList.add("error");
    return;
  }
  hotelResults.replaceChildren();
  hotelApiStatus.textContent = "Searching OpenStreetMap";
  hotelMessage.classList.remove("error");
  hotelMessage.textContent = `Searching for mapped stays near ${destination.name}…`;
  const submitButton = hotelForm.querySelector('button[type="submit"]');
  submitButton.disabled = true;

  try {
    const query = `[out:json][timeout:25];(nwr(around:8000,${destination.lat},${destination.lon})["tourism"~"^(hotel|guest_house|hostel|motel|resort|apartment)$"];);out center 60;`;
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 30000);
    let response;
    try {
      response = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`, {
        signal: controller.signal,
        headers: { Accept: "application/json" }
      });
    } finally {
      window.clearTimeout(timeout);
    }
    if (!response.ok) {
      throw new Error(response.status === 429 || response.status >= 500
        ? "The free OpenStreetMap search service is busy or temporarily unavailable. Please wait a moment and try again."
        : `OpenStreetMap search failed (HTTP ${response.status}). Please try again later.`);
    }
    const data = await response.json();
    if (!Array.isArray(data.elements)) throw new Error("OpenStreetMap returned an unexpected response. Please try again later.");

    const categoryNames = {
      hotel: "Hotel",
      guest_house: "Guest house",
      hostel: "Hostel",
      motel: "Motel",
      resort: "Resort",
      apartment: "Apartment"
    };
    const hotels = data.elements
      .filter((element) => element.tags?.name || element.tags?.["name:en"])
      .map((element) => {
        const tags = element.tags;
        const street = [tags["addr:housenumber"], tags["addr:street"]].filter(Boolean).join(" ");
        const address = tags["addr:full"] || [street, tags["addr:suburb"], tags["addr:city"] || tags["addr:town"]].filter(Boolean).join(", ");
        const lat = element.lat ?? element.center?.lat;
        const lon = element.lon ?? element.center?.lon;
        const distance = lat == null || lon == null
          ? Number.POSITIVE_INFINITY
          : Math.hypot((lat - destination.lat) * 111, (lon - destination.lon) * 111 * Math.cos(destination.lat * Math.PI / 180));
        return {
          element,
          name: tags["name:en"] || tags.name,
          category: categoryNames[tags.tourism] || "Stay",
          address,
          distance
        };
      })
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 12);
    renderHotels(hotels);
    hotelApiStatus.textContent = `${hotels.length} mapped stays`;
    hotelMessage.textContent = hotels.length
      ? `${hotels.length} community-mapped stay${hotels.length === 1 ? "" : "s"} found within about 8 km of ${destination.name}. This is not a complete hotel directory, and rates or availability are not included.`
      : `No named stays were mapped within about 8 km of ${destination.name}. OpenStreetMap coverage varies by area.`;
  } catch (error) {
    console.error("OpenStreetMap hotel search failed.", error);
    hotelApiStatus.textContent = "Search unavailable";
    hotelMessage.textContent = error.name === "AbortError"
      ? "The search took too long. The free OpenStreetMap service may be busy; please wait and try again."
      : error.message || "Could not load mapped stays. Check your internet connection and try again.";
    hotelMessage.classList.add("error");
  } finally {
    submitButton.disabled = false;
  }
};

const readSavedTrips = () => {
  try {
    const saved = localStorage.getItem(TRIP_STORAGE_KEY);
    if (!saved) return [];
    const trips = JSON.parse(saved);
    if (!Array.isArray(trips)) throw new Error("Saved trips must be a list.");
    return trips;
  } catch (error) {
    console.error("Could not read saved itineraries.", error);
    searchMessage.textContent = "Saved trips could not be read from this browser. You can still search and book.";
    searchMessage.classList.add("error");
    return [];
  }
};

const writeSavedTrips = (trips) => {
  try {
    localStorage.setItem(TRIP_STORAGE_KEY, JSON.stringify(trips));
    return true;
  } catch (error) {
    console.error("Could not save itineraries in this browser.", error);
    searchMessage.textContent = "This browser could not save the trip. Check its storage settings and try again.";
    searchMessage.classList.add("error");
    return false;
  }
};

const setTravelType = (type) => {
  travelType = type;
  document.querySelectorAll("[data-travel-type]").forEach((button) => {
    const active = button.dataset.travelType === type;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  vehicleField.hidden = type !== "ferry";
  searchMessage.classList.remove("error");
};

const renderBookingOptions = (origin, destination, date, passengers) => {
  const isFlight = travelType === "flight";
  const routeName = `${origin.name} → ${destination.name}`;
  const dateLabel = formatTripDate(date);
  const flightUrl = buildSearchUrl("flights", origin, destination, date, passengers);
  const ferryUrl = buildSearchUrl("ferry", origin, destination, date, passengers);
  const providers = isFlight
    ? [{
        name: "12Go flight search",
        detail: "Compare available flights and fares for this route.",
        url: flightUrl,
        label: "Search flights"
      }, {
        name: "Philippine Airlines",
        detail: "Continue to the airline's official booking site.",
        url: "https://www.philippineairlines.com/ph/en/home.html",
        label: "Visit airline"
      }]
    : [{
        name: "12Go ferry search",
        detail: "Check passenger sailings and route availability.",
        url: ferryUrl,
        label: "Search ferries"
      }, {
        name: "2GO official booking",
        detail: "Enter your sailing and vehicle details with the operator.",
        url: "https://travel.2go.com.ph/",
        label: "Book with 2GO"
      }, {
        name: "FastCat official site",
        detail: "Check FastCat routes and vehicle booking options.",
        url: "https://fastcat.com.ph/",
        label: "Visit FastCat"
      }];

  resultsTitle.innerHTML = `${escapeHtml(origin.name)} <span>→</span> ${escapeHtml(destination.name)}`;
  resultsEyebrow.textContent = isFlight ? "FLIGHT BOOKING OPTIONS" : "RORO & FERRY BOOKING OPTIONS";
  routeCount.textContent = `${providers.length} booking links`;

  const vehicleName = vehicleInput.value === "none"
    ? "Passengers only"
    : vehicleInput.options[vehicleInput.selectedIndex].text;
  const vehicleNote = !isFlight && vehicleInput.value !== "none"
    ? `<p class="vehicle-note">Selected vehicle: ${escapeHtml(vehicleName)}. Vehicle space and route compatibility must be confirmed with the ferry operator.</p>`
    : "";

  resultsList.innerHTML = providers.map((provider, index) => {
    return `<article class="booking-option">
      <div class="provider-icon ${isFlight ? "plane-icon" : "ferry-icon"}" aria-hidden="true">${isFlight ? "✈" : "⛴"}</div>
      <div class="provider-info">
        <strong>${escapeHtml(provider.name)}</strong>
        <span>${escapeHtml(provider.detail)}</span>
        <small>${escapeHtml(dateLabel)} · ${passengers} traveler${passengers === 1 ? "" : "s"}${!isFlight && vehicleInput.value !== "none" ? ` · ${escapeHtml(vehicleName)}` : ""}</small>
      </div>
      <div class="booking-actions">
        <a class="provider-button" href="${escapeHtml(provider.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(provider.label)} <span aria-hidden="true">↗</span></a>
        <button class="save-button" type="button" data-save-trip="${index}">♡ Save trip</button>
      </div>
    </article>`;
  }).join("") + vehicleNote;

  searchMessage.classList.remove("error");
  searchMessage.textContent = isFlight
    ? "These are links to search providers, not live flight results. Current flights, fares, seats and payment are shown by the provider."
    : vehicleInput.value === "none"
      ? "This is a ferry search link, not a live sailing result. Check the operator for current routes, times, fares and passenger availability."
      : "This is not a live RoRo booking. Confirm route, vehicle capacity, dimensions, required documents and total fare directly with the operator.";

  document.querySelectorAll("[data-save-trip]").forEach((button) => {
    button.addEventListener("click", () => saveTrip({
      type: travelType,
      origin: origin.name,
      originSlug: origin.slug,
      destination: destination.name,
      destinationSlug: destination.slug,
      date,
      passengers,
      vehicle: !isFlight ? vehicleInput.value : "none",
      provider: providers[Number(button.dataset.saveTrip)].name
    }));
  });
};

const searchTrips = () => {
  const origin = getPlace(originInput.value);
  const destination = getPlace(destinationInput.value);
  if (!origin || !destination) {
    searchMessage.textContent = "Choose a destination from the list.";
    searchMessage.classList.add("error");
    return;
  }
  if (origin.slug === destination.slug) {
    searchMessage.textContent = "Choose two different destinations.";
    searchMessage.classList.add("error");
    return;
  }
  if (!dateInput.value || dateInput.value < dateInput.min) {
    searchMessage.textContent = "Choose a valid departure date.";
    searchMessage.classList.add("error");
    return;
  }
  renderBookingOptions(origin, destination, dateInput.value, Number(passengerInput.value));
};

const renderSavedTrips = () => {
  const trips = readSavedTrips();
  document.getElementById("saved-count").textContent = String(trips.length);
  document.getElementById("saved-nav-count").textContent = String(trips.length);
  if (!trips.length) {
    savedList.innerHTML = '<p class="saved-empty">Saved flights and ferries will appear here.</p>';
    return;
  }

  savedList.innerHTML = trips.map((trip) => `<article class="saved-item">
    <div><strong title="${escapeHtml(trip.origin)} → ${escapeHtml(trip.destination)}">${escapeHtml(trip.origin)} → ${escapeHtml(trip.destination)}</strong>
      <small>${escapeHtml(trip.type === "flight" ? "Flight" : "RoRo / ferry")} · ${escapeHtml(formatTripDate(trip.date))} · ${escapeHtml(trip.provider)}</small></div>
    <div class="saved-actions">
      <button class="reopen-trip" type="button" data-reopen-trip="${escapeHtml(trip.id)}">Find again</button>
      <button class="remove-trip" type="button" data-remove-trip="${escapeHtml(trip.id)}" aria-label="Remove saved trip">×</button>
    </div>
  </article>`).join("");
};

const saveTrip = (trip) => {
  const trips = readSavedTrips();
  const id = [trip.type, trip.originSlug, trip.destinationSlug, trip.date, trip.vehicle].join("|");
  if (trips.some((saved) => saved.id === id)) {
    searchMessage.textContent = "That itinerary is already in My trips.";
    return;
  }
  if (!writeSavedTrips([{ ...trip, id }, ...trips])) return;
  renderSavedTrips();
  searchMessage.textContent = "Trip saved to My trips on this device. No ticket has been purchased.";
};

form.addEventListener("submit", (event) => {
  event.preventDefault();
  searchTrips();
});

hotelForm.addEventListener("submit", (event) => {
  event.preventDefault();
  searchHotels();
});

document.querySelectorAll("[data-travel-type]").forEach((button) => {
  button.addEventListener("click", () => setTravelType(button.dataset.travelType));
});

document.getElementById("swap-stops").addEventListener("click", () => {
  const origin = originInput.value;
  originInput.value = destinationInput.value;
  destinationInput.value = origin;
});

savedList.addEventListener("click", (event) => {
  const removeButton = event.target.closest("[data-remove-trip]");
  if (removeButton) {
    const remaining = readSavedTrips().filter((trip) => trip.id !== removeButton.dataset.removeTrip);
    if (writeSavedTrips(remaining)) renderSavedTrips();
    return;
  }

  const reopenButton = event.target.closest("[data-reopen-trip]");
  if (!reopenButton) return;
  const trip = readSavedTrips().find((saved) => saved.id === reopenButton.dataset.reopenTrip);
  if (!trip) return;
  originInput.value = trip.originSlug;
  destinationInput.value = trip.destinationSlug;
  dateInput.value = trip.date;
  passengerInput.value = String(trip.passengers);
  vehicleInput.value = trip.vehicle;
  setTravelType(trip.type);
  searchTrips();
  document.getElementById("booking").scrollIntoView({ behavior: "smooth" });
});

const chatPanel = document.getElementById("chat-panel");
const chatToggle = document.getElementById("chat-toggle");
const chatInput = document.getElementById("chat-message");
const chatBody = document.getElementById("chat-body");

const setChatOpen = (open) => {
  chatPanel.hidden = !open;
  chatToggle.setAttribute("aria-expanded", String(open));
  if (open) chatInput.focus();
};

chatToggle.addEventListener("click", () => {
  setChatOpen(chatPanel.hidden);
});

document.getElementById("chat-close").addEventListener("click", () => {
  setChatOpen(false);
  chatToggle.focus();
});

document.querySelectorAll("[data-chat-question]").forEach((button) => {
  button.addEventListener("click", () => {
    const question = button.dataset.chatQuestion;
    if (question === "Where do I pay for my booking?") {
      const answer = document.createElement("div");
      answer.className = "chat-bubble support-bubble";
      answer.textContent = "Pay through the airline or ferry provider’s secure checkout after you choose a trip. TransitGo doesn’t collect payments or reserve tickets. If you’re unsure which link to use, send me your route and I’ll help.";
      chatBody.insertBefore(answer, chatBody.querySelector(".quick-questions"));
    }
    chatInput.value = question;
    chatInput.focus();
  });
});

document.getElementById("chat-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const message = chatInput.value.trim();
  if (!message) {
    chatInput.focus();
    return;
  }

  const currentOrigin = getPlace(originInput.value)?.name;
  const currentDestination = getPlace(destinationInput.value)?.name;
  const tripContext = currentOrigin && currentDestination
    ? `\n\nTrip I’m viewing: ${currentOrigin} to ${currentDestination} on ${dateInput.value}.`
    : "";
  const whatsappUrl = `https://wa.me/${SUPPORT_WHATSAPP}?text=${encodeURIComponent(`${message}${tripContext}`)}`;
  window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  chatInput.value = "";
  setChatOpen(false);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !chatPanel.hidden) {
    setChatOpen(false);
    chatToggle.focus();
  }
});

populatePlaces();
setDefaultDate();
renderSavedTrips();
renderBookingOptions(getPlace("manila"), getPlace("cebu"), dateInput.value, 1);
