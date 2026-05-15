import { View, Text, TextInput, StyleSheet, Button, Pressable } from 'react-native';
import { useRouter } from 'expo-router';

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
        marginTop: 15,
        color: "#fff",
    },
    emailInput: {
        width: 274,
        height: 49,
        backgroundColor: "#597790",
        borderRadius: 8,
        paddingHorizontal: 10,
        marginTop: 15,
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
    }
})

function SignupButton() {
    const router = useRouter();
    return (
        <Pressable style={styles.button} onPress={() => router.push("/login")}>
                <Text style={styles.textBold}>Sign Up</Text>
        </Pressable>
    );
}

export default function Register() {
    const router = useRouter();

    return (
        <View style={styles.container}>
            <Text style={styles.title}>FlipValue</Text>

            <TextInput style={[styles.nameInput, styles.baseText]} placeholder="Name" placeholderTextColor="#D9D9D9" />
            <TextInput style={[styles.emailInput, styles.baseText]} placeholder="Email" placeholderTextColor="#D9D9D9" />
            <TextInput style={[styles.passwordInput, styles.baseText]} placeholder="Password" placeholderTextColor="#D9D9D9" />
            <TextInput style={[styles.confirmPasswordInput, styles.baseText]} placeholder="Confirm Password" placeholderTextColor="#D9D9D9" />

            <SignupButton />

            <Pressable onPress={() => router.push("/login")}>
                <Text style={[styles.login, styles.baseText]}>Already have an account?{" "}
                    <Text style={[styles.loginLink, styles.textBold]}>Log In</Text>
                </Text>
            </Pressable>
        </View>
    );
}