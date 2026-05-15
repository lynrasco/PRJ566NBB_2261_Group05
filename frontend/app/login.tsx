import { View, Text, TextInput, StyleSheet, Button, Pressable } from 'react-native';
import { useRouter } from 'expo-router';

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
    }
})

function LoginButton() {
    return (
        <Pressable style={styles.button}>
            <Text style={styles.boldText}>Log In</Text>
        </Pressable>
    );
}

export default function Login() {
    const router = useRouter();

    return (
        <View style={styles.container}>
            <Text style={styles.title}>FlipValue</Text>

            <TextInput placeholder="Email" placeholderTextColor="#D9D9D9" style={[styles.emailInput, styles.baseText]} />
            <TextInput placeholder="Password" placeholderTextColor="#D9D9D9" style={[styles.passwordInput, styles.baseText]} />
            <LoginButton />
            <Pressable onPress={() => router.push("/register")}>
            <Text style={[styles.signUp, styles.baseText]}>Dont have an account?{" "}
              <Text style={[styles.signUpLink, styles.boldText]}>Sign Up</Text>
            </Text>
            </Pressable>
        </View>
    );
}