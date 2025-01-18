const resultsGrid = document.querySelector('.pokemons-grid');
const form = document.getElementById('search-form');
const input = document.getElementById('search-bar');
const regionFilter = document.getElementById('region-filter');
const typeFilter = document.getElementById('type-filter');
const paginationContainer = document.querySelector('.pagination');

let currentPage = 1;

// Função para buscar Pokémons
const fetchPokemons = async (query = '', region = '', type = '', page = 1) => {
  const params = new URLSearchParams({ query, region, type, page });
  try {
    const response = await fetch(`/search?${params.toString()}`);
    if (response.ok) {
      return await response.json();
    } else {
      console.error('Erro ao buscar Pokémons:', response.statusText);
    }
  } catch (error) {
    console.error('Erro ao buscar Pokémons:', error);
  }
  return { results: [], total: 0 };
};

// Renderiza os resultados
const renderPokemons = async (query = '', region = '', type = '', page = 1) => {
  resultsGrid.innerHTML = '<p>Carregando...</p>';
  const { results, total } = await fetchPokemons(query, region, type, page);

  if (results.length > 0) {
    resultsGrid.innerHTML = '';
    results.forEach((pokemon) => {
      const card = document.createElement('div');
      card.classList.add('pokemon-card');
      card.innerHTML = `
        <a href="/pokemon/details/${pokemon.id}">
          <img src="${pokemon.sprite}" alt="${pokemon.name}">
          <p><strong>ID:</strong> ${pokemon.id}</p>
          <p>${pokemon.name}</p>
        </a>
      `;
      resultsGrid.appendChild(card);
    });
    renderPagination(total, page);
  } else {
    resultsGrid.innerHTML = '<p>Nenhum Pokémon encontrado. Tente outros filtros.</p>';
  }
};

// Renderiza a paginação
const renderPagination = (total, page) => {
  const totalPages = Math.ceil(total / 20);
  paginationContainer.innerHTML = '';
  for (let i = 1; i <= totalPages; i++) {
    const button = document.createElement('button');
    button.textContent = i;
    button.disabled = i === page;
    button.addEventListener('click', () => {
      currentPage = i;
      renderPokemons(input.value, regionFilter.value, typeFilter.value, i);
    });
    paginationContainer.appendChild(button);
  }
};

// Evento do formulário
form.addEventListener('submit', (e) => {
  e.preventDefault();
  currentPage = 1;
  renderPokemons(input.value, regionFilter.value, typeFilter.value, currentPage);
});

// Carrega os resultados iniciais
renderPokemons();
