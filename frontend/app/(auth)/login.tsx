import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/use-translation";
import { useProfile } from "@/context/profile-context";
import { login } from "@/services/api";
import { Ionicons } from "@expo/vector-icons";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#024883",
  },
  title: {
    fontFamily: "Audiowide",
    fontSize: 64,
    color: "#fff",
  },
  emailInput: {
    width: 274,
    height: 49,
    backgroundColor: "#597790",
    borderRadius: 8,
    paddingHorizontal: 10,
    marginTop: 15,
    color: "#fff",
  },
  button: {
    width: 274,
    height: 49,
    borderRadius: 8,
    marginTop: 20,
    backgroundColor: "#E1ECF7",
    justifyContent: "center",
    alignItems: "center",
  },
  signUp: {
    textAlign: "center",
    color: "#fff",
  },
  signUpLink: {
    textDecorationLine: "underline",
    color: "#fff",
  },
  baseText: {
    fontFamily: "AzeretMono_400Regular",
  },
  boldText: {
    fontFamily: "AzeretMono_700Bold",
  },
  errorBox: {
    height: 15,
    justifyContent: "center",
    marginTop: 2,
    marginBottom: 2,
  },
  errorText: {
    color: "red",
    fontSize: 12,
  },
  passwordInput: {
    width: 274,
    height: 49,
    backgroundColor: "#597790",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingRight: 45,
    marginTop: 10,
    color: "#fff",
  },
  passwordContainer: {
    width: 274,
    justifyContent: "center",
  },
});

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {},
  );
  const { t } = useTranslation();
  const { updateProfile } = useProfile();
  const [showPassword, setShowPassword] = useState(false);

  const validateForm = () => {
    const nextErrors: { email?: string; password?: string } = {};
    if (!email.trim()) {
      //nextErrors.email = "Email is required.";
      nextErrors.email = t("emailRequired");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      //nextErrors.email = "Enter a valid email address.";
      nextErrors.email = t("invalidEmail");
    }

    if (!password.trim()) {
      //nextErrors.password = "Password is required.";
      nextErrors.password = t("passwordRequired");
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  /*
    const handleLogin = () => {
        if (validateForm()) {
            //router.push('/dashboard')
            router.replace("/dashboard");
        }
    };
    */
  const handleLogin = async () => {
    const nextErrors: { EmailPwd?: string } = {};

    try {
      if (validateForm()) {
        //router.push('/dashboard')

        const result = await login(email, password);
        if (result?.success) {
          //router.replace("/dashboard");
          const user = result.user?.user || result.user;
          console.log("LOGIN USER:", user);

          updateProfile({
            userId: user.id,
            name: user.name,
            //username: `${user.name.split(" ")[0].toLowerCase()}${user.id.slice(-4)}`,
            username: user.userName,
            email: user.email,
            phone: "",
            avatarId: "avatar-1",
          });
          router.replace("/dashboard");
        } else {
          setErrors(result?.message || "Login failed. Please try again.");
        }
      }
    } catch (err: any) {
      Alert.alert(
        "Login Failed",
        err?.response?.data?.message || "Invalid email or password.",
      );
    }
  };

  return (
    <LinearGradient colors={["#024883", "#001B33"]} style={styles.container}>
      <Text style={styles.title}>FlipValue</Text>

      <TextInput
        placeholder={t("emailPlaceholder")}
        placeholderTextColor="#D9D9D9"
        style={[styles.emailInput, styles.baseText]}
        value={email}
        onChangeText={setEmail}
      />
      <View style={styles.errorBox}>
        <Text style={styles.errorText}>
          {errors.email ? errors.email : " "}
        </Text>
      </View>
      <View style={styles.passwordContainer}>
        <TextInput
          placeholder={t("passwordPlaceholder")}
          placeholderTextColor="#D9D9D9"
          style={[styles.passwordInput, styles.baseText]}
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
        />

        <Pressable
          onPress={() => setShowPassword(!showPassword)}
          style={{
            position: "absolute",
            right: 12,
            top: 23,
          }}
        >
          <Ionicons
            name={showPassword ? "eye-off" : "eye"}
            size={22}
            color="#D9D9D9"
          />
        </Pressable>
      </View>

      <View style={styles.errorBox}>
        <Text style={styles.errorText}>
          {errors.password ? errors.password : " "}
        </Text>
      </View>

      <Button title={t("login")} onPress={handleLogin} variant="primary" />

      <Pressable onPress={() => router.push("/register")}>
        <Text style={[styles.signUp, styles.baseText]}>
          {t("noAccount")}{" "}
          <Text style={[styles.signUpLink, styles.boldText]}>
            {t("signUp")}
          </Text>
        </Text>
      </Pressable>
    </LinearGradient>
  );
}
