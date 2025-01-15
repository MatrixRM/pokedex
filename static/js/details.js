document.addEventListener('DOMContentLoaded', () => {
  const pokemonId = document.querySelector('.pokemon-id').value;
  const detailsContainer = document.querySelector('.details-container');

  const fetchPokemonDetails = async (pokemon) => {
    const APIResponse = await fetch(`/pokemon/details?pokemon=${pokemon}`);
    if (APIResponse.status === 200) {
      return await APIResponse.json();
    }
    return null;
  };

  const renderPokemonDetails = async () => {
    const data = await fetchPokemonDetails(pokemonId);
    if (data) {
      document.querySelector('.details-basic').innerHTML = `
        <h3>Informações básicas</h3>
        <p>Nome: ${data.basic.name}</p>
        <p>ID: ${data.basic.id}</p>
        <p>Regional: ${data.basic.regional ? 'Sim' : 'Não'}</p>
        <p>Tipo: ${data.basic.types.join(', ')}</p>
        <p>Peso: ${data.basic.weight / 10} kg</p>
        <p>Altura: ${data.basic.height / 10} m</p>
      `;

      document.querySelector('.details-description').innerHTML = `
        <h3>Descrição e comportamento</h3>
        <p>Habitat: ${data.description.habitat}</p>
        <p>Comportamento: ${data.description.behavior}</p>
        <p>Curiosidades: ${data.description.curiosities}</p>
      `;

      document.querySelector('.details-technical').innerHTML = `
        <h3>Aspectos técnicos</h3>
        <p>Habilidades: ${data.technical.abilities.join(', ')}</p>
        <p>Evoluções: ${data.technical.evolutions}</p>
        <p>Raridade: ${data.technical.rarity}</p>
      `;

      document.querySelector('.details-location').innerHTML = `
        <h3>Localização</h3>
        <p>Locais: ${data.location.locations}</p>
      `;
    } else {
      detailsContainer.innerHTML = '<p>Detalhes não encontrados.</p>';
    }
  };

  renderPokemonDetails();
});
