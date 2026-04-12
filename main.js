// API KEY
const API_KEY = "e8976c93";

// elements
const searchInput = document.getElementById("search-input");
const searchBtn = document.getElementById("search-btn");
const resultsContainer = document.getElementById("results-container");
const watchlistContainer = document.getElementById("watchlist-container");


//search function
function search() {
    const query = searchInput.value.trim();

    if(query !== "") {
        searchMovies(query);
    }
}

// search button
searchBtn.addEventListener("click", search);

//input listener (using enter key to search)
searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        search();
        }
});


// fetching movies
async function searchMovies(query) {
    try {
        const response = await fetch(`https://www.omdbapi.com/?s=${query}&apikey=${API_KEY}`);
        const data = await response.json();

        displayMovies(data.Search);

    } catch (error) {
        console.error("Error fetching data:", error);
        resultsContainer.innerHTML = "<p>Something went wrong. Please try again.</p>";
    }
}

// displaying movie results
function displayMovies(movies) {
    resultsContainer.innerHTML = "";

    if (!movies) {
        resultsContainer.innerHTML = "<p>No such movie found. Try different title</p>";
        return;
    }

    movies.forEach((movie) => {
        const movieCard = document.createElement("div");
        movieCard.classList.add("movie-card");

        movieCard.innerHTML = `
            <img src="${movie.Poster}" alt="poster" />
            <h3>${movie.Title}</h3>
            <p>${movie.Year}</p>
        `;

        const addBtn = document.createElement("button");
        addBtn.textContent = "Add to Watchlist";

        addBtn.addEventListener( "click", () => {
            addToWatchlist(movie);

            addBtn.textContent = "Added";
            addBtn.disabled = true;
        });

        movieCard.appendChild(addBtn);
        resultsContainer.appendChild(movieCard);
    });
}

// POSTing to watchlist
async function addToWatchlist(movie) {
    await fetch("http://localhost:3000/watchlist", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            title: movie.Title,
            year: movie.Year,
            poster: movie.Poster,
            rating: ""
        })
    });

    loadWatchlist(); 
}

// loading watchlist (GET)
async function loadWatchlist() {
    try {
        const response = await fetch("http://localhost:3000/watchlist");
        const movies = await response.json();

        console.log("Watchlist data:", movies);
    
        displayWatchlist(movies);

    } catch (error) {
        console.error("Error loading watchlist:", error);
    }
    
}

//displaying watchlist
function displayWatchlist(movies) {
    watchlistContainer.innerHTML = "";

    movies.forEach ((movie) => {
        const card = document.createElement("div");
        card.classList.add("movie-card");

        card.innerHTML = `
            <img src="${movie.poster}"/>
            <h3>${movie.title}</h3>
            <p>${movie.year}</p>
        `;

        const ratingInput = document.createElement("input");
        ratingInput.type = "number";
        ratingInput.placeholder = "Rate (1-10)";
        ratingInput.value = movie.rating || "" ;

        ratingInput.addEventListener("change", () => {
            updateRating(movie.id, ratingInput.value);
        });

        //removing from watchlist
        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Delete";

        deleteBtn.addEventListener("click", () => {
            deleteMovie(movie.id);
        });

        card.appendChild(ratingInput);
        card.appendChild(deleteBtn);

        watchlistContainer.appendChild(card);
    });
}

//delete button function
async function deleteMovie(id) {
    await fetch(`http://localhost:3000/watchlist/${id}` , {
        method: "DELETE"
    });

    loadWatchlist();
}

//ratings update (PATCH)
async function updateRating(id, rating) {
    await fetch(`http://localhost:3000/watchlist/${id}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ rating: rating })
    });
}


loadWatchlist();