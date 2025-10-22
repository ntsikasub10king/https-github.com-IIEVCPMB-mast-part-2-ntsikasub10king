import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Alert,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

interface MealItem {
  id: number;
  name: string;
  description: string;
  category: string;
  calories: string;
}

const Stack = createNativeStackNavigator();

function HomeScreen({ navigation, route }: any) {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [meals, setMeals] = useState<MealItem[]>([]);

  // Load saved meals on app start
  useEffect(() => {
    const loadMeals = async () => {
      try {
        const savedMeals = await AsyncStorage.getItem("meals");
        if (savedMeals) setMeals(JSON.parse(savedMeals));
      } catch (error) {
        console.log("Error loading meals:", error);
      }
    };
    loadMeals();
  }, []);

  // Save meals whenever they change
  useEffect(() => {
    AsyncStorage.setItem("meals", JSON.stringify(meals)).catch((error) =>
      console.log("Error saving meals:", error)
    );
  }, [meals]);

  // Handle new meal from AddMealScreen
  useEffect(() => {
    if (route.params?.newMeal) {
      setMeals((prev) => [...prev, route.params.newMeal]);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();
    }
  }, [route.params?.newMeal]);

  // Delete meal
  const deleteMeal = (id: number) => {
    Alert.alert("Confirm Delete", "Are you sure you want to delete this meal?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          setMeals((prev) => prev.filter((m) => m.id !== id));
        },
      },
    ]);
  };

  const totalCalories = meals.reduce(
    (sum, m) => sum + parseInt(m.calories || "0"),
    0
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>FitMeal Tracker</Text>
      <Text style={styles.subHeader}>Total Meals: {meals.length}</Text>
      <Text style={styles.subHeader}>Total Calories: {totalCalories} kcal</Text>

      <Button
        title="Add New Meal"
        onPress={() => navigation.navigate("AddMeal")}
        color="#E09966"
      />

      <Animated.View style={{ opacity: fadeAnim, flex: 1 }}>
        <FlatList
          data={meals}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{item.name}</Text>
              <Text>{item.description}</Text>
              <Text style={styles.categoryTag}>{item.category}</Text>
              <Text style={styles.calories}>
                Calories: {item.calories} kcal
              </Text>
              <TouchableOpacity onPress={() => deleteMeal(item.id)}>
                <Text style={styles.deleteText}> Delete</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      </Animated.View>
    </View>
  );
}

function AddMealScreen({ navigation }: any) {
  const [mealName, setMealName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Breakfast");
  const [calories, setCalories] = useState("");
  const categoryOptions = ["Breakfast", "Lunch", "Dinner", "Snack"];

  const handleAdd = () => {
    if (!mealName || !description || !calories) {
      alert("Please fill in all fields");
      return;
    }

    const newMeal: MealItem = {
      id: Date.now(),
      name: mealName,
      description,
      category,
      calories,
    };

    navigation.navigate("Home", { newMeal });
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Add a New Meal</Text>

      <TextInput
        style={styles.input}
        placeholder="Meal name"
        value={mealName}
        onChangeText={setMealName}
      />

      <TextInput
        style={styles.input}
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
      />

      <Text style={styles.label}>Select Category:</Text>
      <View style={styles.categoryContainer}>
        {categoryOptions.map((option) => (
          <TouchableOpacity
            key={option}
            style={[
              styles.categoryButton,
              category === option && styles.selectedCategory,
            ]}
            onPress={() => setCategory(option)}
          >
            <Text
              style={[
                styles.categoryText,
                category === option && styles.selectedText,
              ]}
            >
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TextInput
        style={styles.input}
        placeholder="Calories (e.g. 450)"
        keyboardType="numeric"
        value={calories}
        onChangeText={setCalories}
      />

      <Button title="Save Meal" onPress={handleAdd} color="#C76E00" />
      <View style={{ marginTop: 10 }}>
        <Button
          title="Back To Home"
          onPress={() => navigation.navigate("Home")}
          color="#888"
        />
      </View>
    </ScrollView>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="AddMeal"
          component={AddMealScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#F5DEB3",
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FFA500",
    marginBottom: 15,
    textAlign: "center",
  },
  subHeader: {
    fontSize: 16,
    marginVertical: 5,
    fontWeight: "600",
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginVertical: 5,
  },
  label: {
    marginTop: 10,
    fontWeight: "600",
  },
  categoryContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 10,
    flexWrap: "wrap",
  },
  categoryButton: {
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    margin: 4,
  },
  selectedCategory: {
    backgroundColor: "#FF4D00",
  },
  categoryText: {
    color: "#333",
  },
  selectedText: {
    color: "#fff",
    fontWeight: "bold",
  },
  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginVertical: 6,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#BE4103",
  },
  categoryTag: {
    marginTop: 5,
    fontStyle: "italic",
    color: "#888",
  },
  calories: {
    marginTop: 5,
    fontWeight: "bold",
    color: "#BE5103",
  },
  deleteText: {
    color: "red",
    marginTop: 8,
    fontWeight: "600",
  },
});
