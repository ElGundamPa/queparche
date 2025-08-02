import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Alert,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as Haptics from "expo-haptics";
import { Shuffle, MapPin, Calendar, Star, Crown } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";

import CategoryButton from "@/components/CategoryButton";
import PlanCard from "@/components/PlanCard";
import SearchBar from "@/components/SearchBar";
import EventCard from "@/components/EventCard";
import Colors from "@/constants/colors";
import { categories } from "@/mocks/categories";
import { useFilteredPlans, usePlansStore, useTopPlans } from "@/hooks/use-plans-store";
import { useUserStore } from "@/hooks/use-user-store";

const { width } = Dimensions.get("window");

export default function HomeScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const { selectedCategory, setSelectedCategory, getRandomPlan, events } = usePlansStore();
  const { user } = useUserStore();
  const topPlans = useTopPlans();
  const filteredPlans = useFilteredPlans(searchQuery);

  const handleCategoryPress = (categoryName: string) => {
    Haptics.selectionAsync();
    setSelectedCategory(selectedCategory === categoryName ? null : categoryName);
  };

  const handleRandomPlan = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const randomPlan = getRandomPlan();
    
    if (randomPlan) {
      router.push(`/plan/${randomPlan.id}`);
    } else {
      Alert.alert(
        "No hay planes disponibles",
        "No hay planes que coincidan con tus criterios. ¡Intenta cambiar tu filtro de categoría o crea un nuevo plan!"
      );
    }
  };

  const todayEvents = events.filter(event => {
    const today = new Date().toDateString();
    const eventDate = new Date(event.startDate).toDateString();
    return today === eventDate;
  });

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Premium */}
        <LinearGradient
          colors={['rgba(0, 212, 170, 0.1)', 'transparent']}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.greeting}>Hola {user?.name?.split(' ')[0] || 'Parcero'} 👋</Text>
              <Text style={styles.title}>¿Qué parche hay hoy?</Text>
              <Text style={styles.subtitle}>Encuentra tu parche ideal en Medellín</Text>
            </View>
            <View style={styles.userStats}>
              <View style={styles.statItem}>
                <Star size={16} color={Colors.light.premium} />
                <Text style={styles.statText}>{user?.points || 0}</Text>
              </View>
              {user?.isPremium && (
                <Crown size={20} color={Colors.light.premium} />
              )}
            </View>
          </View>
        </LinearGradient>

        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Buscar planes, lugares, eventos..."
        />

        {/* Eventos de Hoy */}
        {todayEvents.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Calendar size={20} color={Colors.light.primary} />
              <Text style={styles.sectionTitle}>Eventos de hoy</Text>
            </View>
            <FlatList
              data={todayEvents.slice(0, 3)}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => <EventCard event={item} />}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.eventsContainer}
            />
          </>
        )}

        {/* Top 5 del día */}
        <View style={styles.sectionHeader}>
          <Star size={20} color={Colors.light.premium} />
          <Text style={styles.sectionTitle}>Top 5 del día</Text>
        </View>
        <FlatList
          data={topPlans}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <PlanCard plan={item} />}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.topPlansContainer}
          testID="top-plans-list"
        />

        {/* Explorar por categoría */}
        <Text style={styles.sectionTitle}>Explorar por categoría</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
        >
          {categories.map((category) => (
            <CategoryButton
              key={category.id}
              category={category}
              selected={selectedCategory === category.name}
              onPress={() => handleCategoryPress(category.name)}
            />
          ))}
        </ScrollView>

        {/* Planes filtrados */}
        {filteredPlans.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>
              {searchQuery
                ? "Resultados"
                : selectedCategory
                ? `Planes de ${selectedCategory}`
                : "Todos los planes"}
            </Text>
            <View style={styles.filteredPlansContainer}>
              {filteredPlans.slice(0, 6).map((plan) => (
                <PlanCard key={plan.id} plan={plan} horizontal={false} />
              ))}
            </View>
          </>
        )}

        {/* Espaciado para el botón flotante */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Botón Random mejorado */}
      <TouchableOpacity
        style={styles.randomButton}
        onPress={handleRandomPlan}
        testID="random-plan-button"
      >
        <LinearGradient
          colors={[Colors.light.primary, '#00B894']}
          style={styles.randomButtonGradient}
        >
          <Shuffle size={20} color={Colors.light.black} />
          <Text style={styles.randomButtonText}>Parche Random</Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* Botón de ubicación */}
      <TouchableOpacity
        style={styles.locationButton}
        onPress={() => router.push('/map')}
      >
        <MapPin size={20} color={Colors.light.primary} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 120,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  greeting: {
    fontSize: 16,
    color: Colors.light.darkGray,
    marginBottom: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: Colors.light.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.light.darkGray,
  },
  userStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.light.card,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.text,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 24,
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.light.text,
  },
  eventsContainer: {
    paddingHorizontal: 20,
  },
  topPlansContainer: {
    paddingHorizontal: 20,
  },
  categoriesContainer: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  filteredPlansContainer: {
    paddingHorizontal: 20,
  },
  bottomSpacing: {
    height: 20,
  },
  randomButton: {
    position: "absolute",
    bottom: 80,
    left: 20,
    right: 80,
    borderRadius: 25,
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  randomButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 25,
  },
  randomButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.light.black,
    marginLeft: 8,
  },
  locationButton: {
    position: "absolute",
    bottom: 80,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.light.card,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
});