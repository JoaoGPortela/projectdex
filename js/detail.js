let currentPokemonId = null;

document.addEventListener("DOMContentLoaded", () => {
    const MAX_POKEMONS = 649;
    const pokemonID = new URLSearchParams(window.location.search).get("id");
    const id = parseInt(pokemonID, 10);

    if (id < 1 || id > MAX_POKEMONS) {
        return (window.location.href = "./index.html");
    }

    currentPokemonId = id;
    loadPokemon(id);
});

async function loadPokemon(id) {
    try {
        const [pokemon, pokemonSpecies] = await Promise.all([
            fetch(`https://pokeapi.co/api/v2/pokemon/${id}`).then(res => res.json()),
            fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`).then(res => res.json())
        ]);

        if (currentPokemonId === id) {
            displayPokemonDetails(pokemon);
            updatePokemonDescription(pokemonSpecies);
            setupNavigation(id);
            window.history.pushState({}, "", `./detail.html?id=${id}`);
        }

        return true;
    } catch (error) {
        console.error("An error occurred while fetching Pokemon data:", error);
        return false;
    }
}

function updatePokemonDescription(pokemonSpecies) {
    const flavorText = getEnglishFlavorText(pokemonSpecies);
    document.querySelector(".body3-fonts.pokemon-description").textContent = flavorText;
}

function setupNavigation(id) {
    const [leftArrow, rightArrow] = ["#leftArrow", "#rightArrow"].map(sel => document.querySelector(sel));
    
    leftArrow.removeEventListener("click", navigatePokemon);
    rightArrow.removeEventListener("click", navigatePokemon);

    const debouncedNavigatePokemon = debounce(navigatePokemon, 300); // 300 ms delay

    if (id > 1) {
        leftArrow.addEventListener("click", () => debouncedNavigatePokemon(id - 1));
    }

    if (id < 649) {
        rightArrow.addEventListener("click", () => debouncedNavigatePokemon(id + 1));
    }
}

function debounce(func, delay) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), delay);
    };
}

async function navigatePokemon(id) {
    currentPokemonId = id;
    await loadPokemon(id);
}

const typeColors = {
    normal: "#A8A878",
    fire: "#F08030",
    water: "#6890F0",
    electric: "#F8D030",
    grass: "#78C850",
    ice: "#98D8D8",
    fighting: "#C03028",
    poison: "#A040A0",
    ground: "#E0C068",
    flying: "#A890F0",
    psychic: "#F85888",
    bug: "#A8B820",
    rock: "#B8A038",
    ghost: "#705898",
    dragon: "#7038F8",
    dark: "#705848",
    steel: "#B8B8D0",
    fairy: "#EE99AC",
};

function setTypeBackgroundColor(pokemon) {
    const types = pokemon.types;
    const colors = types.map(type => typeColors[type.type.name]);

    if (colors.includes(undefined)) {
        console.warn(`Color not defined for types: ${types.map(type => type.type.name).join(", ")}`);
        return;
    }

    const color = types.length === 2 
        ? `linear-gradient(45deg, ${colors[0]}, ${colors[1]})` 
        : colors[0];

    const detailMainElement = document.querySelector(".detail-main");
    setElementStyles([detailMainElement], "background", color);
    setElementStyles([detailMainElement], "borderColor", color);
    setElementStyles(document.querySelectorAll(".power-wrapper > p"), "background", color);
    setElementStyles(document.querySelectorAll(".stats-wrap .progress-bar"), "color", color);
}

function setElementStyles(elements, cssProperty, value) {
    elements.forEach(element => {
        element.style[cssProperty] = value;
    });
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

function createAndAppendElement(parent, tag, options = {}) {
    const element = document.createElement(tag);
    Object.assign(element, options);
    parent.appendChild(element);
    return element;
}

function displayPokemonDetails(pokemon) {
    const { name, id, types, weight, height, abilities, stats } = pokemon;
    const capitalizePokemonName = capitalizeFirstLetter(name);

    document.title = capitalizePokemonName;
    const detailMainElement = document.querySelector(".detail-main");
    detailMainElement.classList.add(name.toLowerCase());

    document.querySelector(".name-wrap .name").textContent = capitalizePokemonName;
    document.querySelector(".pokemon-id-wrap .body2-fonts").textContent = `#${String(id).padStart(3, "0")}`;

    const imageElement = document.querySelector(".detail-img-wrapper img");
    imageElement.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/dream-world/${id}.svg`;
    imageElement.alt = name;

    const typeWrapper = document.querySelector(".power-wrapper");
    typeWrapper.innerHTML = "";
    types.forEach(({ type }) => {
        createAndAppendElement(typeWrapper, "p", {
            className: `body3-fonts type ${type.name}`,
            textContent: type.name,
        });
    });

    document.querySelector(".pokemon-detail-wrap .pokemon-detail p.body3-fonts.weight").textContent = `${weight / 10}kg`;
    document.querySelector(".pokemon-detail-wrap .pokemon-detail p.body3-fonts.height").textContent = `${height / 10}m`;

    const abilitiesWrapper = document.querySelector(".pokemon-detail-wrap .pokemon-detail.move");
    abilitiesWrapper.innerHTML = "";
    abilities.forEach(({ ability }) => {
        createAndAppendElement(abilitiesWrapper, "p", {
            className: "body3-fonts",
            textContent: ability.name,
        });
    });

    const statsWrapper = document.querySelector(".stats-wrapper");
    statsWrapper.innerHTML = "";

    const statNameMapping = {
        hp: "HP",
        attack: "ATK",
        defense: "DEF",
        "special-attack": "SATK",
        "special-defense": "SDEF",
        speed: "SPD",
    };

    stats.forEach(({ stat, base_stat }) => {
        const statDiv = document.createElement("div");
        statDiv.className = "stats-wrap";
        statsWrapper.appendChild(statDiv);

        createAndAppendElement(statDiv, "p", {
            className: "body3-fonts stats",
            textContent: statNameMapping[stat.name],
        });

        createAndAppendElement(statDiv, "p", {
            className: "body3-fonts",
            textContent: String(base_stat).padStart(3, "0"),
        });

        createAndAppendElement(statDiv, "progress", {
            className: "progress-bar",
            value: base_stat,
            max: 255,
        });
    });

    setTypeBackgroundColor(pokemon);
}

function getEnglishFlavorText(pokemonSpecies) {
    const entry = pokemonSpecies.flavor_text_entries.find(entry => entry.language.name === "en");
    return entry ? entry.flavor_text.replace(/\f/g, "") : "";
}
