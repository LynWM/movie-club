// API KEY
const API_KEY = "e8976c93";

// elements
const searchInput = document.getElementById("search-input");
const searchBtn = document.getElementById("search-btn");
const resultsContainer = document.getElementById("results-container");
const watchlistContainer = document.getElementById("watchlist-container");
const clearBtn = document.getElementById("clear-btn");


// search functionality
function search() {
    const query = searchInput.value.trim();
    if (query !== "") {
        searchMovies(query);
    }
}

//search button + search()
searchBtn.addEventListener("click", search);

// search using enter button
searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        search();
    }
});

//clear input button
searchInput.addEventListener("input", () => {
    if (searchInput.value.trim() !== "") {
        clearBtn.style.display = "block";
    } else {
        clearBtn.style.display = "none";
    }
})

clearBtn.addEventListener("click", () => {
    searchInput.value = "";
    resultsContainer.innerHTML = "";
    clearBtn.style.display = "none";
})

// fetch movies
async function searchMovies(query) {
    resultsContainer.innerHTML = "<p>Loading...</p>";

    try {
        const response = await fetch(`https://www.omdbapi.com/?s=${query}&apikey=${API_KEY}`);
        const data = await response.json();

        displayMovies(data.Search);

    } catch (error) {
        console.error("Error fetching data:", error);
        resultsContainer.innerHTML = "<p>Something went wrong.</p>";
    }
}

// display results
function displayMovies(movies) {
    resultsContainer.innerHTML = "";

    if (!movies) {
        resultsContainer.innerHTML = "<p>No movies found.</p>";
        return;
    }

    movies.forEach((movie) => {
        const poster = movie.Poster !== "N/A"
            ? movie.Poster
            : "assets/placeholder.png";

        const movieCard = document.createElement("div");
        movieCard.classList.add("movie-card");

        movieCard.innerHTML = `
            <img src="${poster}" />
            <h3>${movie.Title}</h3>
            <p>${movie.Year}</p>
        `;

        const addBtn = document.createElement("button");
        addBtn.textContent = "Add to Watchlist";

        addBtn.addEventListener("click", () => {
            addToWatchlist(movie);
            addBtn.textContent = "Added";
            addBtn.disabled = true;
        });

        movieCard.appendChild(addBtn);
        resultsContainer.appendChild(movieCard);
    });
}

// adding movie to watchlist
async function addToWatchlist(movie) {
    const result = await fetch("http://localhost:3000/watchlist");
    const existing = await result.json();

    const alreadyExists = existing.some(item => item.imdbID === movie.imdbID);

    if (alreadyExists) {
        alert("This movie is already in your watchlist");
        return;
    }

    await fetch("http://localhost:3000/watchlist", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            imdbID: movie.imdbID,
            title: movie.Title,
            year: movie.Year,
            poster: movie.Poster,
            rating: "",
            comment: ""
        })
    });

    loadWatchlist();
}

// load watchlist
async function loadWatchlist() {
    try {
        const response = await fetch("http://localhost:3000/watchlist");
        const movies = await response.json();

        displayWatchlist(movies);

    } catch (error) {
        console.error("Error loading watchlist:", error);
    }
}

// display watchlist
function displayWatchlist(movies) {
    watchlistContainer.innerHTML = "";

    if (movies.length === 0) {
        watchlistContainer.innerHTML = "<p>Your watchlist is empty</p>";
        return;
    }

    movies.forEach((movie) => {
        const card = document.createElement("div");
        card.classList.add("movie-card");

        renderViewMode(card, movie);

        watchlistContainer.appendChild(card);
    });
}

// rendering watchlist
function renderViewMode(card, movie) {
    card.innerHTML = `
        <img src="${movie.poster}" />
        <h3>${movie.title}</h3>
        <p>${movie.year}</p>
    `;

    const ratingDisplay = document.createElement("p");

    if (movie.rating) {
        ratingDisplay.textContent = `${movie.rating}/10 ${movie.comment ? "— " + movie.comment : ""}`;
    } else {
        ratingDisplay.textContent = "No rating yet";
    }

    const actions = document.createElement("div");
    actions.classList.add("actions");

    const editBtn = document.createElement("button");
    editBtn.innerHTML = '<i class="fa-solid fa-pen"></i>';

    editBtn.addEventListener("click", () => {
        renderEditMode(card, movie);
    });

    const deleteBtn = document.createElement("button");
    deleteBtn.innerHTML = '<i class="fa-solid fa-trash-can"></i>';

    deleteBtn.addEventListener("click", () => {
        deleteMovie(movie.id);
    });

    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);

    card.appendChild(ratingDisplay);
    card.appendChild(actions);
}

// editing watchlist
function renderEditMode(card, movie) {
    card.innerHTML = `
        <img src="${movie.poster}" />
        <h3>${movie.title}</h3>
        <p>${movie.year}</p>
    `;

    const ratingInput = document.createElement("input");
    ratingInput.type = "number";
    ratingInput.placeholder = "Rating (1-10)";
    ratingInput.value = movie.rating || "";

    const commentInput = document.createElement("input");
    commentInput.type = "text";
    commentInput.placeholder = "Comment...";
    commentInput.value = movie.comment || "";

    const actions = document.createElement("div");
    actions.classList.add("actions");

    const saveBtn = document.createElement("button");
    saveBtn.textContent = 'Save';

    saveBtn.addEventListener("click", async () => {
        await updateMovie(movie.id, ratingInput.value, commentInput.value);
        loadWatchlist();
    });

    const cancelBtn = document.createElement("button");
    cancelBtn.textContent = 'Cancel';

    cancelBtn.addEventListener("click", () => {
        renderViewMode(card, movie);
    });

    actions.appendChild(saveBtn);
    actions.appendChild(cancelBtn);

    card.appendChild(ratingInput);
    card.appendChild(commentInput);
    card.appendChild(actions);
}

// deleting from watchlist
async function deleteMovie(id) {
    await fetch(`http://localhost:3000/watchlist/${id}`, {
        method: "DELETE"
    });

    loadWatchlist();
}

// updating watchlist
async function updateMovie(id, rating, comment) {
    await fetch(`http://localhost:3000/watchlist/${id}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            rating: rating,
            comment: comment
        })
    });
}

// initial load
loadWatchlist();