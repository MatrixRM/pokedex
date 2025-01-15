const regionsContainer = document.querySelector('.regions-container');
const regionsGrid = document.querySelector('.regions-grid');
const pokemonsContainer = document.querySelector('.pokemons-container');
const pokemonsGrid = document.querySelector('.pokemons-grid');
const regionTitle = document.querySelector('.pokemons-container .title');

// Função para buscar regiões
const fetchRegions = async () => {
  try {
    const response = await fetch('/regions');
    if (response.ok) {
      return await response.json();
    } else {
      console.error('Erro ao buscar regiões:', response.statusText);
    }
  } catch (error) {
    console.error('Erro ao buscar regiões:', error);
  }
  return [];
};

// Função para buscar Pokémons por região
const fetchPokemonsByRegion = async (regionName) => {
  try {
    const response = await fetch(`/region/${regionName}/pokemons`);
    if (response.ok) {
      return await response.json();
    } else {
      console.error('Erro ao buscar Pokémons:', response.statusText);
    }
  } catch (error) {
    console.error('Erro ao buscar Pokémons:', error);
  }
  return [];
};

// Renderiza os cards das regiões
const renderRegions = async () => {
  const regions = await fetchRegions();
  if (regions.length === 0) {
    regionsGrid.innerHTML = '<p>Não foi possível carregar as regiões. Tente novamente mais tarde.</p>';
    return;
  }

  regionsGrid.innerHTML = '';
  regions.forEach((region) => {
    const regionCard = document.createElement('div');
    regionCard.classList.add('region-card');
    regionCard.innerHTML = `
      <img src="/static/img/regioes/${region.name.toLowerCase()}.png" alt="${region.name}" class="region-icon">
      <p class="region-name">${region.name}</p>
    `;
    regionCard.onclick = () => renderPokemons(region.name);
    regionsGrid.appendChild(regionCard);
  });
};

// Renderiza os Pokémons de uma região
const renderPokemons = async (regionName) => {
  regionsContainer.style.display = 'none';
  pokemonsContainer.style.display = 'block';

  regionTitle.textContent = `Região: ${regionName.charAt(0).toUpperCase() + regionName.slice(1)}`;

  const pokemons = await fetchPokemonsByRegion(regionName);
  if (pokemons.length === 0) {
    pokemonsGrid.innerHTML = '<p>Nenhum Pokémon encontrado nesta região.</p>';
    return;
  }

  pokemonsGrid.innerHTML = '';
  pokemons.forEach((pokemon) => {
    const pokemonCard = document.createElement('div');
    pokemonCard.classList.add('pokemon-card');
    pokemonCard.innerHTML = `
      <a href="/pokemon/details/${pokemon.id}" class="pokemon-link">
        <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png" alt="${pokemon.name}" class="pokemon-image">
        <p class="pokemon-name">${pokemon.name}</p>
        <p class="pokemon-id">#${String(pokemon.id).padStart(3, '0')}</p>
      </a>
    `;
    pokemonsGrid.appendChild(pokemonCard);
  });
};

// Voltar para a lista de regiões
const showRegions = () => {
  regionsContainer.style.display = 'block';
  pokemonsContainer.style.display = 'none';
};

// Inicializa a página
renderRegions();
