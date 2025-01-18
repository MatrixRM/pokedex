document.getElementById('search-form').addEventListener('submit', async (event) => {
    event.preventDefault();
  
    const formData = new FormData(event.target);
    const params = new URLSearchParams(formData);
  
    const resultsContainer = document.querySelector('.results-grid');
    resultsContainer.innerHTML = '<p>Carregando resultados...</p>';
  
    try {
      const response = await fetch(`/search?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Erro ao buscar dados.');
      }
  
      const results = await response.json();
      resultsContainer.innerHTML = '';
  
      if (results.length === 0) {
        resultsContainer.innerHTML = '<p>Nenhum Pokémon encontrado.</p>';
        return;
      }
  
      results.forEach((pokemon) => {
        const card = document.createElement('div');
        card.classList.add('pokemon-card');
        card.innerHTML = `
          <img src="${pokemon.sprite}" alt="${pokemon.name}">
          <p><strong>${pokemon.name}</strong></p>
          <p>ID: #${String(pokemon.id).padStart(3, '0')}</p>
          <p>Tipo(s): ${pokemon.types.join(', ')}</p>
        `;
        resultsContainer.appendChild(card);
      });
    } catch (error) {
      console.error(error);
      resultsContainer.innerHTML = '<p>Erro ao carregar resultados. Tente novamente.</p>';
    }
  });
  