import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import PokemonInfo from './PokemonInfo';
import PokemonDetails from './PokemonDetails'; // Assurez-vous d'avoir ce fichier dans le même répertoire

const Stack = createStackNavigator();

export default function App() {

  function fetchKantoPokemon() {
    fetch('https://pokeapi.co/api/v2/pokemon?limit=151')
      .then(response => response.json())
      .then(allpokemon => console.log(allpokemon))
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="PokemonList">
        <Stack.Screen 
          name="PokemonList" 
          component={PokemonInfo} 
          options={{ title: 'Pokédex' }} 
        />
        <Stack.Screen 
          name="PokemonDetails" 
          component={PokemonDetails} 
          options={{ title: 'Détails du Pokémon' }} 
        />
      </Stack.Navigator>
      <StatusBar style="auto" />
    </NavigationContainer>
  );
}

