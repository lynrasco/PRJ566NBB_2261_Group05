import { View, Text, TextInput, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Button } from "@/components/ui/button";

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginTop: 5,
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

/*
function LoginButton() {
    const router = useRouter();
    return (
        <Pressable style={styles.button} onPress={() => router.push("/dashboard")}>
            <Text style={styles.boldText}>Log In</Text>
        </Pressable>
    );
}
*/

export default function Login() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

    const validateForm = () => {
        const nextErrors: { email?: string; password?: string } = {};
        if (!email.trim()) {
            nextErrors.email = "Email is required.";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            nextErrors.email = "Enter a valid email address.";
        }

        if (!password.trim()) {
            nextErrors.password = "Password is required.";
        }
        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const handleLogin = () => {
        if (validateForm()) {
            router.push("/dashboard");
        }
    };

    return (
        <LinearGradient colors={["#024883", "#001B33"]} style={styles.container}>
            <Text style={styles.title}>FlipValue</Text>

            <TextInput placeholder="Email" placeholderTextColor="#D9D9D9" style={[styles.emailInput, styles.baseText]} value={email} onChangeText={setEmail} />
            <View style={styles.errorBox}>
                <Text style={styles.errorText}>
                    {errors.email ? errors.email : " "}
                </Text>
            </View>
            <TextInput placeholder="Password" placeholderTextColor="#D9D9D9" style={[styles.passwordInput, styles.baseText]} value={password} onChangeText={setPassword} />
            <View style={styles.errorBox}>
                <Text style={styles.errorText}>
                    {errors.password ? errors.password : " "}
                </Text>
            </View>

            <Button title="Log In" onPress={handleLogin} variant="primary" />

            <Pressable onPress={() => router.push("/register")}>
            <Text style={[styles.signUp, styles.baseText]}>Dont have an account?{" "}
              <Text style={[styles.signUpLink, styles.boldText]}>Sign Up</Text>
            </Text>
            </Pressable>
        </LinearGradient>
    );
}