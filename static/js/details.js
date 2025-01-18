document.addEventListener('DOMContentLoaded', () => {
  const pokemonId = document.querySelector('.pokemon-id').value;
  const pokemonNameElement = document.querySelector('#pokemon-name');
  const pokemonIdElement = document.querySelector('#pokemon-id');
  const pokemonImageElement = document.querySelector('#pokemon-image');
  const pokemonDescriptionElement = document.querySelector('#pokemon-description');
  const pokemonHeightElement = document.querySelector('#pokemon-height');
  const pokemonWeightElement = document.querySelector('#pokemon-weight');
  const pokemonCategoryElement = document.querySelector('#pokemon-category');
  const pokemonAbilitiesElement = document.querySelector('#pokemon-abilities');
  const pokemonGenderElement = document.querySelector('#pokemon-gender');
  const pokemonTypesElement = document.querySelector('#pokemon-types');
  const pokemonWeaknessesElement = document.querySelector('#pokemon-weaknesses');
  const pokemonStatsElements = {
    hp: document.querySelector('#stat-hp .bar'),
    attack: document.querySelector('#stat-attack .bar'),
    defense: document.querySelector('#stat-defense .bar'),
    specialAttack: document.querySelector('#stat-special-attack .bar'),
    specialDefense: document.querySelector('#stat-special-defense .bar'),
    speed: document.querySelector('#stat-speed .bar'),
  };

  const fetchPokemonDetails = async (pokemon) => {
    try {
      const APIResponse = await fetch(`/pokemon/details?pokemon=${pokemon}`);
      if (APIResponse.status === 200) {
        return await APIResponse.json();
      } else {
        console.error('Erro ao buscar detalhes do Pokémon:', APIResponse.statusText);
      }
    } catch (error) {
      console.error('Erro ao buscar detalhes do Pokémon:', error);
    }
    return null;
  };

  const renderPokemonDetails = async () => {
    const data = await fetchPokemonDetails(pokemonId);

    if (data) {
      // Preencher nome e ID
      pokemonNameElement.textContent = data.basic.name;
      pokemonIdElement.textContent = `Nº ${String(data.basic.id).padStart(3, '0')}`;

      // Preencher imagem diretamente da PokéAPI
      pokemonImageElement.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${data.basic.id}.png`;
      pokemonImageElement.alt = data.basic.name;

      // Preencher descrição
      pokemonDescriptionElement.textContent = data.description.behavior;

      // Preencher informações básicas
      pokemonHeightElement.textContent = `${data.basic.height / 10} m`;
      pokemonWeightElement.textContent = `${data.basic.weight / 10} kg`;
      pokemonCategoryElement.textContent = data.description.habitat || 'Desconhecida';
      pokemonAbilitiesElement.textContent = data.technical.abilities.join(', ');
      pokemonGenderElement.textContent = '♂ / ♀'; // Atualizar com base nos dados disponíveis

      // Preencher tipos
      pokemonTypesElement.textContent = data.basic.types.join(', ');

      // Preencher fraquezas (exemplo estático, ajustar conforme necessário)
      pokemonWeaknessesElement.textContent = data.technical.weaknesses
        ? data.technical.weaknesses.join(', ')
        : 'N/A';

      // Preencher estatísticas
      const stats = data.technical.stats || {};
      Object.entries(stats).forEach(([statName, statValue]) => {
        if (pokemonStatsElements[statName]) {
          pokemonStatsElements[statName].style.width = `${(statValue / 255) * 100}%`;
          pokemonStatsElements[statName].title = `${statValue}`;
        }
      });
    } else {
      const detailsContainer = document.querySelector('.details-container');
      detailsContainer.innerHTML = '<p>Detalhes não encontrados.</p>';
    }
  };

  renderPokemonDetails();
});
