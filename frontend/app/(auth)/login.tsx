import { View, Text, TextInput, StyleSheet, Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/use-translation";
import { useProfile } from '@/context/profile-context';
import { loginUser } from "@/services/api";

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
        color: "#fff"
    },
    emailInput: {
        width: 274,
        height: 49,
        backgroundColor: "#597790",
        borderRadius: 8,
        paddingHorizontal:10,
        marginTop: 15,
        color: "#fff",
    },
    passwordInput: {
        width: 274,
        height: 49,
        backgroundColor: "#597790",
        borderRadius: 8,
        paddingHorizontal: 10,
        marginTop: 10,
        color: "#fff"
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
    }
})

export default function Login() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
    const { t } = useTranslation();
    const { updateProfile } = useProfile();

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
  if (!validateForm()) return;

  try {
    const response = await loginUser(email, password);

    /*
    updateProfile({
      username: response.user.user.email.split("@")[0],
      name: response.user.user.name,
      email: response.user.user.email,
      phone: "",
      avatarId: "avatar-1",
    });
    */
     const user = response.user.user;

updateProfile({
  username: `${user.name.split(" ")[0].toLowerCase()}${user.id.slice(-4)}`,
  name: user.name,
  email: user.email,
  phone: "",
  avatarId: "avatar-1",
});

    router.replace("/dashboard");
  } catch (err: any) {
    Alert.alert(
      "Login Failed",
      err?.response?.data?.message || "Invalid email or password."
    );
  }
};

    return (
        <LinearGradient colors={["#024883", "#001B33"]} style={styles.container}>
            <Text style={styles.title}>FlipValue</Text>

            <TextInput placeholder={t("emailPlaceholder")} placeholderTextColor="#D9D9D9" style={[styles.emailInput, styles.baseText]} value={email} onChangeText={setEmail} />
            <View style={styles.errorBox}>
                <Text style={styles.errorText}>
                    {errors.email ? errors.email : " "}
                </Text>
            </View>
            <TextInput placeholder={t("passwordPlaceholder")} placeholderTextColor="#D9D9D9" style={[styles.passwordInput, styles.baseText]} value={password} onChangeText={setPassword} />
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