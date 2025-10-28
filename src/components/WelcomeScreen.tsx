import React, { useState, useRef } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  StatusBar,
  Animated,
  TouchableOpacity,
  Image,
  FlatList,
} from "react-native";
import { useRouter } from "expo-router";
import { ThemedText, ThemedView } from "@/components";
import { Button } from "@/components/Button";
import { useAppContext } from "@/contexts/AppContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

const welcomeData = [
  {
    id: 1,
    title: "Selamat Datang",
    subtitle: "di News Hub",
    description: "Dapatkan berita terkini dan menarik langsung di gadget Anda",
    icon: "📰",
  },
  {
    id: 2,
    title: "Baca Dimanapun",
    subtitle: "Tanpa Batas",
    description: "Akses berita favorit Anda kapan saja dan di mana saja",
    icon: "🌍",
  },
  {
    id: 3,
    title: "Personalisasi",
    subtitle: "Untuk Anda",
    description:
      "Simpan artikel dan dapatkan rekomendasi berita yang sesuai minat Anda",
    icon: "⭐",
  },
];

export default function WelcomeScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const router = useRouter();
  const { themeState } = useAppContext();
  const slidesRef = useRef<any>(null);

  const viewableItemsChanged = useRef(({ viewableItems }: any) => {
    setCurrentIndex(viewableItems[0]?.index || 0);
  }).current;

  const scrollTo = (index: number) => {
    if (slidesRef.current) {
      slidesRef.current.scrollToIndex({ index });
    }
  };

  const handleGetStarted = async () => {
    try {
      await AsyncStorage.setItem("@is_first_launch", "false");
      router.replace("/(tabs)/home");
    } catch (error) {
      console.error("Error saving first launch state:", error);
      router.replace("/(tabs)/home");
    }
  };

  const handleSkip = async () => {
    try {
      await AsyncStorage.setItem("@is_first_launch", "false");
      router.replace("/(tabs)/home");
    } catch (error) {
      console.error("Error saving first launch state:", error);
      router.replace("/(tabs)/home");
    }
  };

  const handleNext = () => {
    const isLastSlide = currentIndex === welcomeData.length - 1;
    if (isLastSlide) {
      handleGetStarted();
    } else {
      scrollTo(currentIndex + 1);
    }
  };

  const renderSlide = ({ item }: any) => {
    return (
      <ThemedView
        style={[
          styles.slide,
          { backgroundColor: themeState.colors.background },
        ]}
      >
        <View style={styles.iconContainer}>
          <View style={styles.iconWrapper}>
            <ThemedText style={styles.iconText}>{item.icon}</ThemedText>
          </View>
        </View>

        <View style={styles.textContainer}>
          <ThemedText variant='primary' style={styles.title}>
            {item.title}
          </ThemedText>
          <ThemedText variant='secondary' style={styles.subtitle}>
            {item.subtitle}
          </ThemedText>
          <ThemedText style={styles.description}>{item.description}</ThemedText>
        </View>
      </ThemedView>
    );
  };

  const renderPagination = () => {
    return (
      <View style={styles.paginationContainer}>
        {welcomeData.map((_, index) => {
          const inputRange = [
            (index - 1) * screenWidth,
            index * screenWidth,
            (index + 1) * screenWidth,
          ];

          const dotWidth = scrollX.interpolate({
            inputRange,
            outputRange: [8, 20, 8],
            extrapolate: "clamp",
          });

          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.4, 1, 0.4],
            extrapolate: "clamp",
          });

          return (
            <Animated.View
              key={index}
              style={[
                styles.dot,
                {
                  width: dotWidth,
                  opacity,
                  backgroundColor: themeState.colors.primary,
                },
              ]}
            />
          );
        })}
      </View>
    );
  };

  const isLastSlide = currentIndex === welcomeData.length - 1;

  return (
    <ThemedView
      style={[
        styles.container,
        { backgroundColor: themeState.colors.background },
      ]}
    >
      <StatusBar barStyle='dark-content' />

      {/* Skip Button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
          <ThemedText
            style={[styles.skipText, { color: themeState.colors.primary }]}
          >
            Lewati
          </ThemedText>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <FlatList
          ref={slidesRef}
          data={welcomeData}
          renderItem={renderSlide}
          horizontal
          showsHorizontalScrollIndicator={false}
          pagingEnabled
          bounces={false}
          keyExtractor={(item) => item.id.toString()}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: false }
          )}
          scrollEventThrottle={32}
          onViewableItemsChanged={viewableItemsChanged}
          viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
        />
      </View>

      {/* Pagination */}
      {renderPagination()}

      {/* Button */}
      <View style={styles.buttonContainer}>
        <Button
          title={isLastSlide ? "Mulai Sekarang" : "Lanjutkan"}
          onPress={handleNext}
          variant='primary'
          style={styles.button}
        />
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
  },
  header: {
    position: "absolute",
    top: 60,
    right: 20,
    zIndex: 1,
  },
  skipButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  skipText: {
    fontSize: 16,
    fontWeight: "600",
  },
  content: {
    flex: 1,
  },
  slide: {
    width: screenWidth,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  iconContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    maxHeight: screenHeight * 0.4,
  },
  iconWrapper: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "rgba(0, 122, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "rgba(0, 122, 255, 0.2)",
  },
  iconText: {
    fontSize: 60,
  },
  textContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    paddingBottom: 100,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 24,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 24,
    opacity: 0.8,
  },
  description: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 20,
    opacity: 0.7,
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    height: 40,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  buttonContainer: {
    paddingHorizontal: 40,
    paddingBottom: 40,
    paddingTop: 20,
  },
  button: {
    borderRadius: 25,
    minHeight: 50,
  },
});
