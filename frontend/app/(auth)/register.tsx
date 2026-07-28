import { View, Text, TextInput, StyleSheet, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/use-translation";
import { register } from "@/services/api";

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
  nameInput: {
    width: 274,
    height: 49,
    backgroundColor: "#597790",
    borderRadius: 8,
    paddingHorizontal: 10,
    marginTop: 10,
    color: "#fff",
  },
  emailInput: {
    width: 274,
    height: 49,
    backgroundColor: "#597790",
    borderRadius: 8,
    paddingHorizontal: 10,
    marginTop: 10,
    color: "#fff",
  },
  passwordInput: {
    width: 274,
    height: 49,
    backgroundColor: "#597790",
    borderRadius: 8,
    paddingHorizontal: 10,
    marginTop: 10,
    color: "#fff",
  },
  confirmPasswordInput: {
    width: 274,
    height: 49,
    backgroundColor: "#597790",
    borderRadius: 8,
    paddingHorizontal: 10,
    marginTop: 10,
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
  login: {
    textAlign: "center",
    color: "#fff",
  },
  loginLink: {
    textDecorationLine: "underline",
    color: "#fff",
  },
  baseText: {
    fontFamily: "AzeretMono_400Regular",
  },
  textBold: {
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
});

export default function Register() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  const { t } = useTranslation();
  const [submitError, setSubmitError] = useState("");

  const validateForm = () => {
    const nextErrors: {
      name?: string;
      email?: string;
      password?: string;
      confirmPassword?: string;
    } = {};
    if (!name.trim()) nextErrors.name = t("nameRequired");
    if (!email.trim()) nextErrors.email = t("emailRequired");
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      nextErrors.email = t("invalidEmail");
    }

    if (!password.trim()) {
      nextErrors.password = t("passwordRequired");
    }

    if (!confirmPassword.trim()) {
      nextErrors.confirmPassword = t("confirmPasswordRequired");
    } else if (password !== confirmPassword) {
      nextErrors.confirmPassword = t("passwordsNotMatch");
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async () => {
    setSubmitError("");
    if (validateForm()) {
      router.replace("/login");
    }

    try {
      const result = await register(name, email, password);
      if (result?.success) {
        router.push("/login");
      } else {
        setSubmitError(
          result?.message || "Registration failed. Please try again.",
        );
      }
    } catch (error: any) {
      setSubmitError(
        error?.message || "Registration failed. Please try again.",
      );
    }
  };

  return (
    <LinearGradient colors={["#024883", "#001B33"]} style={styles.container}>
      <Text style={styles.title}>FlipValue</Text>

      <TextInput
        style={[styles.nameInput, styles.baseText]}
        placeholder={t("name")}
        placeholderTextColor="#D9D9D9"
        value={name}
        onChangeText={setName}
      />
      <View style={styles.errorBox}>
        <Text style={styles.errorText}>{errors.name ? errors.name : " "}</Text>
      </View>
      <TextInput
        style={[styles.emailInput, styles.baseText]}
        placeholder={t("email")}
        placeholderTextColor="#D9D9D9"
        value={email}
        onChangeText={setEmail}
      />
      <View style={styles.errorBox}>
        <Text style={styles.errorText}>
          {errors.email ? errors.email : " "}
        </Text>
      </View>
      <TextInput
        style={[styles.passwordInput, styles.baseText]}
        placeholder={t("password")}
        placeholderTextColor="#D9D9D9"
        value={password}
        onChangeText={setPassword}
      />
      <View style={styles.errorBox}>
        <Text style={styles.errorText}>
          {errors.password ? errors.password : " "}
        </Text>
      </View>
      <TextInput
        style={[styles.confirmPasswordInput, styles.baseText]}
        placeholder={t("confirmPassword")}
        placeholderTextColor="#D9D9D9"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />
      <View style={styles.errorBox}>
        <Text style={styles.errorText}>
          {errors.confirmPassword ? errors.confirmPassword : " "}
        </Text>
      </View>
      <Button title={t("signUp")} variant="primary" onPress={handleSubmit} />

      <Pressable onPress={() => router.push("/login")}>
        <Text style={[styles.login, styles.baseText]}>
          {t("alreadyAccount")}{" "}
          <Text style={[styles.loginLink, styles.textBold]}>{t("login")}</Text>
        </Text>
      </Pressable>
    </LinearGradient>
  );
}
