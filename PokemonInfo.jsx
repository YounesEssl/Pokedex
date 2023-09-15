import React, { useState, useEffect } from 'react';
import { View, Text, Image, ScrollView, StyleSheet, TextInput, TouchableOpacity, Alert, FlatList } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

const PokemonInfo = ({ navigation }) => {
  const [pokemonData, setPokemonData] = useState([]);
  const [searchValue, setSearchValue] = useState('');
  const [sortType, setSortType] = useState(''); // '' | 'name' | 'type'
  const pokemonNumbers = Array.from({ length: 151 }, (_, i) => i + 1);

  useEffect(() => {
    async function fetchPokemonData() {
      try {
        const dataPromises = pokemonNumbers.map(async (number) => {
          const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${number}`);
          const data = await response.json();

          // Récupérer les informations d'espèce pour le nom et le texte descriptif
          const speciesResponse = await fetch(data.species.url);
          const speciesData = await speciesResponse.json();

          // Trouver le nom en français
          const frenchNameEntry = speciesData.names.find(entry => entry.language.name === 'fr');
          if (frenchNameEntry) {
            data.name = frenchNameEntry.name; // Remplacer le nom par le nom en français
          }

          // Trouver le texte descriptif en français pour la dernière version du jeu
          const frenchFlavorTextEntry = speciesData.flavor_text_entries.find(entry => entry.language.name === 'fr');
          if (frenchFlavorTextEntry) {
            data.flavor_text = frenchFlavorTextEntry.flavor_text; // Ajouter le texte descriptif en français
          }

          // Récupérer les données d'évolution
          const evolutionResponse = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${number}`);
          const evolutionData = await evolutionResponse.json();
          const evolutionChainResponse = await fetch(evolutionData.evolution_chain.url);
          const evolutionChainData = await evolutionChainResponse.json();

          const evolutions = extractEvolutions(evolutionChainData.chain);
          data.evolutions = evolutions;

          return data;
        });

        const pokemonInfo = await Promise.all(dataPromises);
        setPokemonData(pokemonInfo);
      } catch (error) {
        console.error("Une erreur s'est produite lors de la récupération des données des Pokémon.", error);
      }
    }

    fetchPokemonData();
  }, []);  

  const getTypeColor = (type) => {
    const colors = {
      fire: '#FFA07A',
      water: '#1E90FF',
      grass: '#98FB98',
      // ... Ajoutez d'autres types et couleurs ici
    };
    return colors[type] || '#E0E0E0'; // Gris par défaut si le type n'est pas trouvé
  };

  const handleFilterPress = () => {
    Alert.alert(
      "Filtrer par",
      "Choisissez une option de tri",
      [
        { text: "Nom (A-Z)", onPress: () => setSortType('name') },
        { text: "Type", onPress: () => setSortType('type') },
        { text: "Numéro", onPress: () => setSortType('number') }, // Ajouté
        { text: "Annuler", style: "cancel" }
      ]
    );
  };

  const handlePokemonPress = (pokemon) => {
    navigation.navigate('PokemonDetails', { pokemon });
  };

  let filteredPokemon = pokemonData.filter(pokemon => {
    // Supprimer les espaces avant et après la chaîne de recherche
    const trimmedSearchValue = searchValue.trim();
    // Supprimer les espaces avant et après le nom du Pokémon
    const trimmedPokemonName = pokemon.name.trim();
    // Utiliser includes pour rechercher la chaîne de recherche dans le nom du Pokémon
    return trimmedPokemonName.includes(trimmedSearchValue.toLowerCase());
  });

  if (sortType === 'name') {
    filteredPokemon = filteredPokemon.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sortType === 'type') {
    filteredPokemon = filteredPokemon.sort((a, b) => a.types[0].type.name.localeCompare(b.types[0].type.name));
  } else if (sortType === 'number') {
    filteredPokemon = filteredPokemon.sort((a, b) => a.id - b.id); // Ajouté
  }

  // Fonction pour extraire les évolutions de la chaîne d'évolution
  function extractEvolutions(chain) {
    const evolutions = [];

    function traverseChain(evoData) {
      if (evoData.species) {
        evolutions.push(evoData.species);
      }

      if (evoData.evolves_to && evoData.evolves_to.length > 0) {
        evoData.evolves_to.forEach((nextEvo) => {
          traverseChain(nextEvo);
        });
      }
    }

    traverseChain(chain);
    return evolutions;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Pokédex</Text>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchBar}
          placeholder="Rechercher un Pokémon..."
          value={searchValue}
          onChangeText={setSearchValue}
        />
        <TouchableOpacity style={styles.filterButton} onPress={handleFilterPress}>
          <FontAwesome name="filter" size={24} color="black" />
        </TouchableOpacity>
      </View>
      <View style={styles.pokemonList}>
        {filteredPokemon.map((pokemon, index) => (
          <TouchableOpacity key={index} onPress={() => handlePokemonPress(pokemon)}>
            <View style={[styles.pokemonCard, { backgroundColor: getTypeColor(pokemon.types[0].type.name) }]}>
              <Image
                source={{ uri: pokemon.sprites.front_default }}
                style={styles.pokemonImage}
              />
              <Text style={styles.pokemonName}>{pokemon.name}</Text>
              <Text style={styles.pokemonNumber}>#{pokemon.id}</Text>
              <FlatList
                data={pokemon.evolutions}
                keyExtractor={(item) => item.name}
                horizontal
                renderItem={({ item }) => (
                  <Image
                    source={{ uri: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${item.url.split('/')[6]}.png` }}
                    style={{ width: 50, height: 50, margin: 2 }}
                  />
                )}
              />
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginTop: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    margin: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    width: '90%',
    alignItems: 'center',
    marginBottom: 20,
  },
  searchBar: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
  },
  filterButton: {
    marginLeft: 10,
  },
  pokemonList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  pokemonCard: {
    margin: 10,
    width: '340px', // Ajusté pour avoir deux cartes par ligne
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pokemonImage: {
    width: 100,
    height: 100,
  },
  pokemonName: {
    marginTop: 10,
    textAlign: 'center',
  },
  pokemonNumber: {
    marginTop: 5,
    fontSize: 16,
    color: '#888',
  },
});

export default PokemonInfo;
