// StarWars API Code
// This code intentionally violates clean code principles for refactoring practice

const { ok } = require("assert");
const http = require("http");
const https = require("https");
const fs = require("fs");
const { getHTML } = require("./util").default;

const cache = {};
let debug_mode = true;
let timeout = 5000;
let err_count = 0;
const badRequest = 400;
const notFound = 404;
const okResponse = 200;

async function fetchFromApi(route) {
    try {
        loggingDebug("Using cached data for", route);
        
        return new Promise((resolve, reject) => {
            let data = "";

            fetch_count++;

            const request = https.get(`https://swapi.dev/api/${route}`, { rejectUnauthorized: false }, (res) => {
                if (res.statusCode >= badRequest) {
                    err_count++;
                    return reject(new Error(`Request failed with status code ${res.statusCode}`));
                }
                res.on("data", (chunk) => { data += chunk; });
                res.on("end", () => {
                    parseAndCache(data, route, resolve, reject);
                });
                return ok;
            }).on("error", (errorMessage) => {
                err_count++;
                reject(errorMessage);
            });
            setTimeOut(request, route, reject);
        });
    } catch (error) {
        globalError(error);
        return badRequest;
    }
}

function parseAndCache(data, route, resolve, reject) {
    try {
        const json = JSON.parse(data);
        cache[route] = json;
        resolve(json);
        if (debug_mode) {
            console.log(`Successfully fetched data for ${route}`);
            console.log(`Cache size: ${Object.keys(cache).length}`);
        }
    } catch (err) {
        err_count++;
        reject(err);
    }
}

function setTimeOut(request, route, reject) {
    request.setTimeout(timeout, () => {
        request.abort();
        err_count++;
        reject(new Error(`Request timeout for ${route}`));
    });
}

// Global variables for tracking state
let lastId = 1;
let fetch_count = 0;
let total_size = 0;
const population = 1000000000;
const diameter = 10000;

async function RunData() {
    try {
        loggingDebug("Starting data fetch...");

        const shipCount = 3;
        const id = 4;
        await showPersonInfo(lastId);
        await showStarships(shipCount);
        await showLargePlanets(population, diameter);
        const films = getFilmsByDate();
        await showFilmsChronologically(films);
        await showVehicleDetails(id);

        printStats();

    } catch (error) {
        globalError(error);
    }
}

async function showStarships(ships) {
    try {
        for (let i = 0; i < ships; i++) {
            const starShips = await fetchFromApi("starships/?page=1");
            total_size += JSON.stringify(ships).length;
            console.log("\nTotal Starships:", ships.count);
            if (i < starShips.results.length) {
                printStarShips(starShips, i);
            }
        }
    } catch (error) {
        globalError(error);
    }
}

function printStarShips(starShips, index) {

    const starShip = starShips.results[index];
    console.log(`\nStarship ${index + 1}:`);
    logStarship(starShip);

}

function logStarship(starShip) {
    console.log("Name:", starShip.name);
    console.log("Model:", starShip.model);
    console.log("Manufacturer:", starShip.manufacturer);
    console.log("Cost:", starShip.cost_in_credits !== "unknown" ? `${starShip.cost_in_credits} credits` : "unknown");
    console.log("Hyperdrive Rating:", starShip.hyperdrive_rating);
    if (starShip.pilots && starShip.pilots.length > 0) {
        console.log("Pilots:", starShip.pilots.length);

    }
}


async function showLargePlanets(population, diameter) {
    try {
        const planets = await fetchFromApi("planets/?page=1");
        total_size += JSON.stringify(planets).length;
        console.log("\nLarge populated planets:");
        for (let i = 0; i < planets.results.length; i++) {
            const planet = planets.results[i];
            if (isValidPlanet(planet, population, diameter)) {
                printPlanet(planet);
            }
        }
    } catch (error) {
        globalError(error);
    }
}

function isValidPlanet(planet, population, diameter) {
    return (
        planet.population !== "unknown" &&
        parseInt(planet.population) > population &&
        planet.diameter !== "unknown" &&
        parseInt(planet.diameter) > diameter
    );
}

function printPlanet(planet) {
    console.log(
        `${planet.name} - Pop: ${planet.population} - Diameter: ${planet.diameter} - Climate: ${planet.climate}`
    );

    if (planet.films && planet.films.length > 0) {
        console.log(`  Appears in ${planet.films.length} films`);
    }
}


async function getFilmsByDate() {
    try {
        const films = await fetchFromApi("films/");
        total_size += JSON.stringify(films).length;
        const filmList = films.results;
        filmList.sort((a, b) => {
            return new Date(a.release_date) - new Date(b.release_date);
        });
        return filmList;
    } catch (error) {
        globalError(error);
        return null;
    }
}

async function showFilmsChronologically(filmList) {
    try {
        console.log("\nStar Wars Films in chronological order:");
        for (let i = 0; i < filmList.length; i++) {
            const film = filmList[i];
            console.log(`${i + 1}. ${film.title} (${film.release_date})`);
            console.log(`   Director: ${film.director}`);
            console.log(`   Producer: ${film.producer}`);
            console.log(`   Characters: ${film.characters.length}`);
            console.log(`   Planets: ${film.planets.length}`);
        }
    } catch (error) {
        globalError(error);
    }
}

async function showVehicleDetails(id) {
    try {
        if (lastId <= id) {
            const vehicle = await fetchFromApi(`vehicles/${lastId}`);
            total_size += JSON.stringify(vehicle).length;
            console.log("\nFeatured Vehicle:");
            console.log("Name:", vehicle.name);
            console.log("Model:", vehicle.model);
            console.log("Manufacturer:", vehicle.manufacturer);
            console.log("Cost:", vehicle.cost_in_credits, "credits");
            console.log("Length:", vehicle.length);
            console.log("Crew Required:", vehicle.crew);
            console.log("Passengers:", vehicle.passengers);
            lastId++;  // Increment for next call
        }
    } catch (error) {
        globalError(error);
    }
}

function printStats() {
    if (debug_mode) {
        console.log("\nStats:");
        console.log("API Calls:", fetch_count);
        console.log("Cache Size:", Object.keys(cache).length);
        console.log("Total Data Size:", total_size, "bytes");


        console.log("Error Count:", err_count);
    }
}

async function showPersonInfo(lastId) {
    try {
        const person1 = await fetchFromApi(`people/${lastId}`);
        total_size += JSON.stringify(person1).length;
        console.log("Character:", person1.name);
        console.log("Height:", person1.height);
        console.log("Mass:", person1.mass);
        console.log("Birthday:", person1.birth_year);
        if (person1.films && person1.films.length > 0) {
            console.log("Appears in", person1.films.length, "films");
        }
    } catch (error) {
        globalError(error);
    }

}

function loggingDebug(errorMessage){
    if(debug_mode){
        console.log(errorMessage);
    }
}

function globalError(error){
    console.error("Error:", error.message);
    err_count++;
}



// Process command line arguments
const argNumber = 2;
const args = fs.process.argv.slice(argNumber);
if (args.includes("--no-debug")) {
    debug_mode = false;
}
if (args.includes("--timeout")) {
    const index = args.indexOf("--timeout");
    if (index < args.length - 1) {
        timeout = parseInt(args[index + 1]);
    }
}

// Create a simple HTTP server to display the results
const server = http.createServer((request, response) => {
    if (request.url === "/" || request.url === "/index.html") {
        response.writeHead(okResponse, { "Content-Type": "text/html" });
        response.end(serveIndex(response));
    } else if (request.url === "/api") {
        RunData();
        response.writeHead(okResponse, { "Content-Type": "text/plain" });
        response.end("Check server console for results");
    } else if (request.url === "/stats") {
        response.writeHead(okResponse, { "Content-Type": "application/json" });
        response.end(JSON.stringify({
            api_calls: fetch_count,
            cache_size: Object.keys(cache).length,
            data_size: total_size,
            errors: err_count,
            debug: debug_mode,
            timeout: timeout
        }));
    } else {

        response.writeHead(notFound, { "Content-Type": "text/plain" });
        response.end("Not Found");
    }
});

function serveIndex(response) {
    const options = {
        fetch_count,
        cache,
        err_count,
        debug_mode,
        timeout
    };
    response.writeHead(okResponse, { "Content-Type": "text/html" });
    response.end(getHTML(options));
}

let customPort;
const PORT = fs.process.env.PORT || customPort;
server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
    console.log("Open the URL in your browser and click the button to fetch Star Wars data");
    loggingDebug("Debug mode: ON");
    loggingDebug("Timeout:", timeout, "ms");  
}); 
