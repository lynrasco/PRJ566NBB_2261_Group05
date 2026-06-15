import { View, Text, StyleSheet } from "react-native";
import { useEffect } from "react";
import { useRouter } from "expo-router";
import { LinearGradient } from 'expo-linear-gradient';

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/login");
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return (
     <LinearGradient colors={["#024883", "#001B33"]} style={styles.container}>
      <Text style={styles.title}>FlipValue</Text>
      <Text style={styles.subtitle}>Helping you flip the value of {'\n'}
        unwanted items.</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#024883",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontFamily: "Audiowide",
    fontWeight: 400,
    fontSize: 64,
    color: "#fff"
  },
  subtitle: {
    fontFamily: "AzeretMono_400Regular",
    color: "#D9D9D9",
    marginTop: 10,
    textAlign: "center",
  },
});