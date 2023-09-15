import React, { useState, useEffect } from "react";
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity } from "react-native";

const PokemonDetails = ({ route }) => {
  const [pokemonDetails, setPokemonDetails] = useState(null);
  const [isShiny, setIsShiny] = useState(false); // Ajouté pour suivre le mode shiny
  const { pokemon } = route.params;

  useEffect(() => {
    async function fetchPokemonDetails() {
      try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon.id}`);
        const data = await response.json();

        // Récupérer le nom en français
        const speciesResponse = await fetch(data.species.url);
        const speciesData = await speciesResponse.json();
        const frenchNameEntry = speciesData.names.find(entry => entry.language.name === "fr");
        if (frenchNameEntry) {
          data.name = frenchNameEntry.name;
        }

        // Récupérer les noms français des statistiques
        const statsPromises = data.stats.map(async (stat) => {
          const statResponse = await fetch(stat.stat.url);
          const statData = await statResponse.json();
          const frenchStatName = statData.names.find(entry => entry.language.name === "fr");
          return {
            ...stat,
            stat: {
              ...stat.stat,
              name: frenchStatName ? frenchStatName.name : stat.stat.name,
            },
          };
        });

        data.stats = await Promise.all(statsPromises);

        setPokemonDetails(data);
      } catch (error) {
        console.error("Une erreur s'est produite lors de la récupération des détails du Pokémon.", error);
      }
    }

    fetchPokemonDetails();
  }, [pokemon]);

  const handleLongPress = () => {
    setIsShiny(!isShiny); // bascule entre les modes shiny et normal
  };

  if (!pokemonDetails) {
    return <Text>Loading...</Text>;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity onLongPress={handleLongPress}>
        <Image
          source={{ uri: isShiny ? pokemonDetails.sprites.front_shiny : pokemonDetails.sprites.front_default }}
          style={styles.image}
        />
      </TouchableOpacity>
      <Text style={styles.name}>{pokemonDetails.name}</Text>
      <Text style={styles.description}>
        Taille: {pokemonDetails.height / 10} m | Poids: {pokemonDetails.weight / 10} kg
      </Text>
      <Text style={styles.statsTitle}>Statistiques:</Text>
      {pokemonDetails.stats.map((stat, index) => (
        <Text key={index}>
          {stat.stat.name}: {stat.base_stat}
        </Text>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    padding: 20,
  },
  image: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  description: {
    textAlign: "center",
    marginBottom: 20,
  },
  statsTitle: {
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
  },
});

export default PokemonDetails;
