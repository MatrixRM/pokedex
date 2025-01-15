const pokemonName = document.querySelector('.pokemon__name');
const pokemonNumber = document.querySelector('.pokemon__number');
const pokemonImage = document.querySelector('.pokemon__image');

const form = document.querySelector('.form');
const input = document.querySelector('.input__search');
const buttonPrev = document.querySelector('.btn-prev');
const buttonNext = document.querySelector('.btn-next');
const buttonDetails = document.querySelector('.btn-details');
const detailsContainer = document.querySelector('.details-container');

let searchPokemon = 1;

// Função para buscar dados básicos do Pokémon
const fetchPokemon = async (pokemon) => {
  const APIResponse = await fetch(`/pokemon?pokemon=${pokemon}`);

  if (APIResponse.status === 200) {
    const data = await APIResponse.json();
    return data;
  }
};

// Função para buscar detalhes do Pokémon
const fetchPokemonDetails = async (pokemon) => {
  const APIResponse = await fetch(`/pokemon/details?pokemon=${pokemon}`);

  if (APIResponse.status === 200) {
    const data = await APIResponse.json();
    return data;
  }
};

// Renderiza os dados básicos do Pokémon
const renderPokemon = async (pokemon) => {
  pokemonName.innerHTML = 'Loading...';
  pokemonNumber.innerHTML = '';

  const data = await fetchPokemon(pokemon);

  if (data) {
    pokemonImage.style.display = 'block';
    pokemonName.innerHTML = data.name;
    pokemonNumber.innerHTML = data.id;
    pokemonImage.src = data.sprite;
    input.value = '';
    searchPokemon = data.id;
  } else {
    pokemonImage.style.display = 'none';
    pokemonName.innerHTML = 'Not found :c';
    pokemonNumber.innerHTML = '';
  }
};

// Renderiza os detalhes do Pokémon
const renderPokemonDetails = async (pokemon) => {
  const data = await fetchPokemonDetails(pokemon);

  if (data) {
    detailsContainer.style.display = 'block';

    document.querySelector('.details-basic').innerHTML = `
      <h3>Basic Information</h3>
      <p>Name: ${data.basic.name}</p>
      <p>ID: ${data.basic.id}</p>
      <p>Regional: ${data.basic.regional ? 'Yes' : 'No'}</p>
      <p>Types: ${data.basic.types.join(', ')}</p>
      <p>Weight: ${data.basic.weight} kg</p>
      <p>Height: ${data.basic.height} m</p>
    `;

    document.querySelector('.details-description').innerHTML = `
      <h3>Description & Behavior</h3>
      <p>Habitat: ${data.description.habitat}</p>
      <p>Behavior: ${data.description.behavior}</p>
      <p>Curiosities: ${data.description.curiosities}</p>
    `;

    document.querySelector('.details-technical').innerHTML = `
      <h3>Technical Aspects</h3>
      <p>Abilities: ${data.technical.abilities.join(', ')}</p>
      <p>Evolutions: ${data.technical.evolutions}</p>
      <p>Rarity: ${data.technical.rarity}</p>
    `;

    document.querySelector('.details-location').innerHTML = `
      <h3>Location</h3>
      <p>Locations: ${data.location.locations}</p>
    `;
  } else {
    detailsContainer.style.display = 'none';
    alert('Details not found.');
  }
};

// Eventos
form.addEventListener('submit', (event) => {
  event.preventDefault();
  renderPokemon(input.value.toLowerCase());
});

buttonPrev.addEventListener('click', () => {
  if (searchPokemon > 1) {
    searchPokemon -= 1;
    renderPokemon(searchPokemon);
  }
});

buttonNext.addEventListener('click', () => {
  searchPokemon += 1;
  renderPokemon(searchPokemon);
});

buttonDetails.addEventListener('click', () => {
  renderPokemonDetails(searchPokemon);
});

// Renderiza o Pokémon inicial
renderPokemon(searchPokemon);
