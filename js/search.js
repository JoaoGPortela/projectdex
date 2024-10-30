const MAX_POKEMON = 649;
const listWrapper = document.querySelector(".list-wrapper");
const searchInput = document.querySelector("#search-input");
const numberFilter = document.querySelector("#number");
const nameFilter = document.querySelector("#name");
const notFoundMessage = document.querySelector("#not-found-message");

let allPokemons = [];

fetch(`https://pokeapi.co/api/v2/pokemon?limit=${MAX_POKEMON}`)
    .then(response => response.json())
    .then(data => {
        allPokemons = data.results;
        displayPokemons(allPokemons);
    })
    .catch(() => notFoundMessage.style.display = "block");

async function fetchPokemonDataBeforeRedirect(id) {
    try {
        await Promise.all([
            fetch(`https://pokeapi.co/api/v2/pokemon/${id}`).then(res => res.json()),
            fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`).then(res => res.json())
        ]);
        return true;
    } catch {
        console.error("Erro ao buscar dados do Pokémon");
        return false;
    }
}

function displayPokemons(pokemon) {
    listWrapper.innerHTML = "";
    pokemon.forEach(pokemon => {
        const pokemonID = pokemon.url.split("/")[6];
        const listItem = document.createElement("div");
        listItem.className = "list-item";
        listItem.innerHTML = `
            <div class="number-wrap"><p class="caption-fonts">#${pokemonID}</p></div>
            <div class="img-wrap"><img src="https://raw.githubusercontent.com/pokeapi/sprites/master/sprites/pokemon/other/dream-world/${pokemonID}.svg" alt="${pokemon.name}" /></div>
            <div class="name-wrap"><p class="body3-fonts">${pokemon.name}</p></div>
        `;
        listItem.addEventListener("click", async () => {
            if (await fetchPokemonDataBeforeRedirect(pokemonID)) {
                window.location.href = `./detail.html?id=${pokemonID}`;
            }
        });
        listWrapper.appendChild(listItem);
    });
}

searchInput.addEventListener("keyup", handleSearch);

function handleSearch() {
    const searchTerm = searchInput.value.toLowerCase();
    
    if (searchTerm === "") {
        displayPokemons(allPokemons);
        notFoundMessage.style.display = "none";
        return;
    }

    const filteredPokemons = numberFilter.checked 
        ? allPokemons.filter(pokemon => pokemon.url.split("/")[6] === searchTerm)
        : allPokemons.filter(pokemon => pokemon.name.toLowerCase().startsWith(searchTerm));

    displayPokemons(filteredPokemons);
    notFoundMessage.style.display = filteredPokemons.length === 0 ? "block" : "none";
}

document.querySelector(".search-close-icon").addEventListener("click", clearSearch);

function clearSearch() {
    searchInput.value = "";
    displayPokemons(allPokemons);
    notFoundMessage.style.display = "none";
}
