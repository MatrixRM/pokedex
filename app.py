from flask import Flask, render_template, jsonify, request
import requests
from flask_caching import Cache

app = Flask(__name__)
cache = Cache(app, config={'CACHE_TYPE': 'SimpleCache', 'CACHE_DEFAULT_TIMEOUT': 300})


@app.route('/')
def index():
    """Renderiza a página inicial."""
    return render_template('inicial.html')


@app.route('/pokemon', methods=['GET'])
def get_pokemon():
    """Busca dados básicos do Pokémon."""
    pokemon = request.args.get('pokemon', default=1, type=int)
    response = requests.get(f'https://pokeapi.co/api/v2/pokemon/{pokemon}')
    
    if response.status_code == 200:
        data = response.json()
        pokemon_data = {
            'name': data['name'].capitalize(),
            'id': data['id'],
            'sprite': data['sprites']['versions']['generation-v']['black-white']['animated']['front_default']
        }
        return jsonify(pokemon_data)
    else:
        return jsonify({'error': 'Pokémon não encontrado'}), 404


@app.route('/regions', methods=['GET'])
def get_regions():
    """Busca todas as regiões."""
    response = requests.get('https://pokeapi.co/api/v2/region/')
    if response.status_code == 200:
        data = response.json()
        regions = [{'name': region['name'].capitalize()} for region in data['results']]
        return jsonify(regions)
    return jsonify({'error': 'Falha ao buscar regiões'}), 500


@app.route('/region/<string:region_name>/pokemons', methods=['GET'])
def get_pokemons_by_region(region_name):
    """Busca os Pokémons de uma região específica."""
    # Mapeamento entre nomes exibidos e identificadores da PokéAPI
    region_map = {
        "kanto": "kanto",
        "johto": "original-johto",
        "hoenn": "hoenn",
        "sinnoh": "original-sinnoh",
        "unova": "21",
        "kalos": "kalos-central",  # Exemplo para região central de Kalos
        "alola": "23",
        "galar": "galar",
        "hisui": "hisui",
        "paldea": "paldea"
    }

    # Converter o nome da região para o identificador correto
    region_key = region_map.get(region_name.lower())

    if not region_key:
        return jsonify({'error': f'Região "{region_name}" não encontrada.'}), 404

    try:
        response = requests.get(f'https://pokeapi.co/api/v2/pokedex/{region_key}')
        response.raise_for_status()

        data = response.json()

        pokemons = [
            {
                'name': entry['pokemon_species']['name'].capitalize(),
                'id': int(entry['entry_number'])
            }
            for entry in data.get('pokemon_entries', [])
        ]

        return jsonify(pokemons)

    except requests.exceptions.RequestException as e:
        print(f"Erro ao buscar dados da PokéAPI: {e}")
        return jsonify({'error': 'Falha ao buscar dados da região'}), 500

    except KeyError as e:
        print(f"Erro na estrutura do JSON: {e}")
        return jsonify({'error': 'Erro no processamento dos dados'}), 500


@app.route('/pokemon/details', methods=['GET'])
def get_pokemon_details():
    """Busca detalhes completos do Pokémon."""
    pokemon = request.args.get('pokemon', default=1, type=int)
    response = requests.get(f'https://pokeapi.co/api/v2/pokemon/{pokemon}')
    species_response = requests.get(f'https://pokeapi.co/api/v2/pokemon-species/{pokemon}')

    if response.status_code == 200 and species_response.status_code == 200:
        data = response.json()
        species_data = species_response.json()

        # Traduções para português
        type_translations = {
            "normal": "Normal",
            "fire": "Fogo",
            "water": "Água",
            "electric": "Elétrico",
            "grass": "Grama",
            "ice": "Gelo",
            "fighting": "Lutador",
            "poison": "Veneno",
            "ground": "Terra",
            "flying": "Voador",
            "psychic": "Psíquico",
            "bug": "Inseto",
            "rock": "Pedra",
            "ghost": "Fantasma",
            "dragon": "Dragão",
            "dark": "Sombrio",
            "steel": "Aço",
            "fairy": "Fada",
        }

        details = {
            'basic': {
                'name': data['name'].capitalize(),
                'id': data['id'],
                'regional': 'Sim' if species_data['is_legendary'] or species_data['is_mythical'] else 'Não',
                'types': [type_translations.get(t['type']['name'], t['type']['name']) for t in data['types']],
                'weight': data['weight'] / 10,  # Converte para kg
                'height': data['height'] / 10,  # Converte para metros
            },
            'description': {
                'habitat': species_data['habitat']['name'].capitalize() if species_data['habitat'] else 'Desconhecido',
                'behavior': next(
                    (entry['flavor_text'] for entry in species_data['flavor_text_entries'] if entry['language']['name'] == 'pt-br'),
                    'Comportamento não disponível'
                ),
                'curiosities': 'Nenhuma curiosidade encontrada',
            },
            'technical': {
                'abilities': [a['ability']['name'].capitalize() for a in data['abilities']],
                'evolutions': 'Não implementado',
                'rarity': 'Lendário' if species_data['is_legendary'] else 'Comum',
            },
            'location': {
                'locations': 'Não disponível no momento'
            }
        }
        return jsonify(details)
    else:
        return jsonify({'error': 'Pokémon não encontrado'}), 404
    


# Carregar todos os Pokémon no cache
@cache.cached(timeout=3600)
def load_all_pokemons():
    pokemons = []
    response = requests.get('https://pokeapi.co/api/v2/pokemon?limit=1025')
    if response.status_code == 200:
        data = response.json()
        for index, pokemon in enumerate(data['results']):
            pokemons.append({
                'id': index + 1,
                'name': pokemon['name'].capitalize(),
                'sprite': f'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/{index + 1}.png',
            })
    return pokemons

# Endpoint de busca e filtro
@app.route('/search', methods=['GET'])
def search_pokemon():
    query = request.args.get('query', '').lower()
    region = request.args.get('region', '').lower()
    poke_type = request.args.get('type', '').lower()
    page = int(request.args.get('page', 1))
    per_page = 20
    start = (page - 1) * per_page
    end = start + per_page

    try:
        # Carregar todos os Pokémon do cache
        all_pokemons = load_all_pokemons()

        # Filtrar por nome ou ID
        if query:
            all_pokemons = [
                p for p in all_pokemons
                if query in p['name'].lower() or query == str(p['id'])
            ]

        # Filtrar por tipo
        if poke_type:
            type_response = requests.get(f'https://pokeapi.co/api/v2/type/{poke_type}')
            if type_response.status_code == 200:
                type_data = type_response.json()
                valid_ids = {int(p['pokemon']['url'].split('/')[-2]) for p in type_data['pokemon']}
                all_pokemons = [p for p in all_pokemons if p['id'] in valid_ids]

        # Filtrar por região (opcional)
        if region:
            region_response = requests.get(f'https://pokeapi.co/api/v2/pokedex/{region}')
            if region_response.status_code == 200:
                region_data = region_response.json()
                valid_ids = {entry['entry_number'] for entry in region_data['pokemon_entries']}
                all_pokemons = [p for p in all_pokemons if p['id'] in valid_ids]

        # Paginação
        paginated_results = all_pokemons[start:end]

        return jsonify({'results': paginated_results, 'total': len(all_pokemons)})

    except Exception as e:
        print(f"Erro no servidor: {e}")
        return jsonify({'error': 'Erro interno no servidor'}), 500










@app.route('/pokemon/details/<int:pokemon_id>')
def pokemon_details_page(pokemon_id):
    """Renderiza a página de detalhes do Pokémon."""
    return render_template('details.html', pokemon_id=pokemon_id)


@app.route('/pokedex')
def principal():
    """Renderiza a página principal de regiões."""
    return render_template('index.html')

@app.route('/regions/<string:region_name>')
def region_pokemons(region_name):
    return render_template('principal.html', region_name=region_name)

@app.errorhandler(404)
def page_not_found(error):
    """Renderiza a página de erro 404."""
    return render_template('error404.html'), 404


if __name__ == '__main__':
    app.run(debug=True)
