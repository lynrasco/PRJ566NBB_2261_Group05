import { View, Text, TextInput, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Button } from '@/components/ui/button';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
        backgroundColor: "#024883"
    },
    title: {
        fontFamily: "Audiowide",
        fontSize: 64,
        color: "#fff"
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
        color: "#fff"
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
    confirmPasswordInput: {
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
    }
})

/*
function SignupButton() {
    const router = useRouter();
    return (
        <Pressable style={styles.button} onPress={() => router.push("/login")}>
                <Text style={styles.textBold}>Sign Up</Text>
        </Pressable>
    );
}
*/

export default function Register() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string; confirmPassword?: string; }>({});

    const validateForm = () => {
        const nextErrors: { name?: string; email?: string;  password?: string; confirmPassword?: string } = {};
        if (!name.trim()) nextErrors.name = 'Name is required.';
        if (!email.trim()) nextErrors.email = 'Email is required.';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            nextErrors.email = 'Enter a valid email address.';
        }

        if (!password.trim()) {
            nextErrors.password = "Password is required.";
        }

        if (!confirmPassword.trim()) {
            nextErrors.confirmPassword = "Please confirm your password.";
        } else if (password !== confirmPassword) {
            nextErrors.confirmPassword = "Passwords do not match.";
        }
        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };
   
    const handleSubmit = () => {
        if (validateForm()) {
            router.push('/login');
        }
    };

    return (
        <LinearGradient colors={["#024883", "#001B33"]} style={styles.container}>
            <Text style={styles.title}>FlipValue</Text>

            <TextInput style={[styles.nameInput, styles.baseText]} placeholder="Name" placeholderTextColor="#D9D9D9" value={name} onChangeText={setName} />
            <View style={styles.errorBox}>
                <Text style={styles.errorText}>
                    {errors.name ? errors.name : " "}
                </Text>
            </View>
            <TextInput style={[styles.emailInput, styles.baseText]} placeholder="Email" placeholderTextColor="#D9D9D9" value={email} onChangeText={setEmail} />
            <View style={styles.errorBox}>
                <Text style={styles.errorText}>
                    {errors.email ? errors.email : " "}
                </Text>
            </View>
            <TextInput style={[styles.passwordInput, styles.baseText]} placeholder="Password" placeholderTextColor="#D9D9D9" value={password} onChangeText={setPassword} />
            <View style={styles.errorBox}>
                <Text style={styles.errorText}>
                    {errors.password ? errors.password : " "}
                </Text>
            </View>
            <TextInput style={[styles.confirmPasswordInput, styles.baseText]} placeholder="Confirm Password" placeholderTextColor="#D9D9D9" value={confirmPassword} onChangeText={setConfirmPassword}/>
            <View style={styles.errorBox}>
                <Text style={styles.errorText}>
                    {errors.confirmPassword ? errors.confirmPassword : " "}
                </Text>
            </View>
            <Button title="Sign Up" variant="primary" onPress={handleSubmit} />

            <Pressable onPress={() => router.push("/login")}>
                <Text style={[styles.login, styles.baseText]}>Already have an account?{" "}
                    <Text style={[styles.loginLink, styles.textBold]}>Log In</Text>
                </Text>
            </Pressable>
        </LinearGradient>
    );
}