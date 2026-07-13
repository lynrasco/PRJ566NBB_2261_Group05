import { CameraView, type CameraType, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAppTheme } from '@/context/theme-context';

export default function CameraScreen() {
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('back');
  const [isTakingPhoto, setIsTakingPhoto] = useState(false);
  const { resolvedTheme } = useAppTheme();
  const isDark = resolvedTheme === 'dark';

  async function askForCameraPermission() {
    await requestPermission();
  }

  async function takePhoto() {
    if (!cameraRef.current || isTakingPhoto) {
      return;
    }

    setIsTakingPhoto(true);

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.9,
        skipProcessing: false,
      });

      if (photo?.uri) {
        router.push({
          pathname: '/item-condition',
          params: { imageUri: photo.uri },
        });
      }
    } finally {
      setIsTakingPhoto(false);
    }
  }

  if (!permission) {
    return <View style={[styles.container, isDark && styles.containerDark]}></View>;
  }

  if (!permission.granted) {
    return (
      <View style={[styles.permissionContainer, isDark && styles.containerDark,]}>
        <Text style={styles.brand}>FlipValue</Text>
        <Text style={[styles.permissionTitle, isDark && styles.textDark,]}>Camera access needed</Text>
        <Text style={[styles.permissionText, isDark && styles.mutedTextDark,]}>
          Allow camera access to capture an item photo for resale pricing.
        </Text>
        <Pressable
          accessibilityRole="button"
          disabled={!permission.canAskAgain}
          onPress={askForCameraPermission}
          style={({ pressed }) => [
            styles.permissionButton,
            pressed && styles.permissionButtonPressed,
            !permission.canAskAgain && styles.permissionButtonDisabled,
          ]}
        >
          <Text style={styles.permissionButtonText}>Allow Camera</Text>
        </Pressable>
        {!permission.canAskAgain && (
          <Text style={styles.permissionHelpText}>
            Camera access is blocked. Open your browser site settings and allow camera access for
            localhost, then refresh this page.
          </Text>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, isDark && styles.headerDark,]}>
        <TouchableOpacity
          accessibilityLabel="Close camera"
          onPress={() => router.back()}
          style={[styles.closeButton, isDark && styles.closeButtonDark,]}
        >
          <Text style={[styles.closeIcon, isDark && styles.textDark,]}>x</Text>
        </TouchableOpacity>
        <Text style={[styles.brand, isDark && styles.textDark, ]}>FlipValue</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={[styles.captureArea, isDark && styles.captureAreaDark,]}>
        <CameraView ref={cameraRef} style={styles.camera} facing={facing} />

        <View pointerEvents="none" style={[styles.frame, isDark && styles.frameDark,]}>
          <View style={[styles.corner, isDark && styles.cornerDark, styles.topLeft,]} />
          <View style={[styles.corner, isDark && styles.cornerDark, styles.topRight,]} />
          <View style={[styles.corner, isDark && styles.cornerDark, styles.bottomLeft,]} />
          <View style={[styles.corner, isDark && styles.cornerDark, styles.bottomRight,]} />
        </View>
      </View>

      <View style={[styles.footer, isDark && styles.footerDark,]}>
        <TouchableOpacity
          accessibilityLabel="Flip camera"
          onPress={() => setFacing((current) => (current === 'back' ? 'front' : 'back'))}
          style={styles.flipButton}
        >
          <Text style={[styles.flipIcon, isDark && styles.textDark,]}>↺</Text>
        </TouchableOpacity>
        <TouchableOpacity
          accessibilityLabel="Capture image"
          disabled={isTakingPhoto}
          onPress={takePhoto}
          style={[styles.captureButton, isDark && styles.captureButtonDark, isTakingPhoto && styles.captureButtonDisabled,]}
        >
          <View style={[styles.captureLens, isDark && styles.captureLensDark,]} />
        </TouchableOpacity>
        <View style={[styles.aiBadge, isDark && styles.aiBadgeDark,]} >
          <Text style={styles.aiBadgeText}>AI</Text>
        </View>
      </View>
    </View>
  );
}

const cornerBase = {
  position: 'absolute' as const,
  width: 70,
  height: 70,
  borderColor: '#202020',
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  permissionContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    backgroundColor: '#ffffff',
  },
  permissionTitle: {
    marginTop: 36,
    fontFamily: 'AzeretMono_700Bold',
    fontSize: 18,
    color: '#111111',
  },
  permissionText: {
    marginTop: 12,
    maxWidth: 280,
    textAlign: 'center',
    fontFamily: 'AzeretMono_400Regular',
    fontSize: 12,
    lineHeight: 18,
    color: '#444444',
  },
  permissionButton: {
    marginTop: 24,
    borderRadius: 8,
    backgroundColor: '#111111',
    paddingHorizontal: 22,
    paddingVertical: 13,
  },
  permissionButtonPressed: {
    opacity: 0.78,
  },
  permissionButtonDisabled: {
    backgroundColor: '#777777',
  },
  permissionButtonText: {
    fontFamily: 'AzeretMono_700Bold',
    fontSize: 12,
    color: '#ffffff',
  },
  permissionHelpText: {
    marginTop: 18,
    maxWidth: 300,
    textAlign: 'center',
    fontFamily: 'AzeretMono_400Regular',
    fontSize: 11,
    lineHeight: 16,
    color: '#6a1f1f',
  },
  header: {
    height: 145,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: 38,
    backgroundColor: '#ffffff',
  },
  closeButton: {
    width: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#111111',
    borderRadius: 7,
  },
  closeIcon: {
    fontFamily: 'AzeretMono_700Bold',
    fontSize: 16,
    lineHeight: 18,
    color: '#111111',
  },
  brand: {
    fontFamily: 'Audiowide_400Regular',
    fontSize: 21,
    color: '#050505',
  },
  headerSpacer: {
    width: 26,
  },
  captureArea: {
    flex: 1,
    backgroundColor: '#eeeeee',
  },
  camera: {
    width: '100%',
    height: '100%',
  },
  frame: {
    ...StyleSheet.absoluteFillObject,
    marginHorizontal: 28,
    marginVertical: 84,
  },
  corner: {
    ...cornerBase,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderTopLeftRadius: 26,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 1,
    borderRightWidth: 1,
    borderTopRightRadius: 26,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 1,
    borderLeftWidth: 1,
    borderBottomLeftRadius: 26,
  },
  bottomRight: {
    right: 0,
    bottom: 0,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderBottomRightRadius: 26,
  },
  footer: {
    minHeight: 105,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 38,
    paddingHorizontal: 28,
    paddingBottom: 20,
    backgroundColor: '#ffffff',
  },
  flipButton: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flipIcon: {
    fontSize: 26,
    color: '#202020',
  },
  captureButton: {
    width: 43,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#202020',
    borderRadius: 5,
  },
  captureButtonDisabled: {
    opacity: 0.45,
  },
  captureLens: {
    width: 17,
    height: 17,
    borderWidth: 2,
    borderColor: '#202020',
    borderRadius: 9,
  },
  aiBadge: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    backgroundColor: '#eeeeee',
  },
  aiBadgeText: {
    fontFamily: 'AzeretMono_700Bold',
    fontSize: 10,
    color: '#b79324',
  },
  containerDark: {
    backgroundColor: '#08111f',
  },
  headerDark: {
    backgroundColor: '#08111f',
  },
  footerDark: {
    backgroundColor: '#08111f',
  },
  captureAreaDark: {
    backgroundColor: '#121c2b',
  },
  textDark: {
    color: '#ffffff',
  },
  mutedTextDark: {
    color: '#b8c4d1',
  },
  closeButtonDark: {
    borderColor: '#ffffff',
  },
  cornerDark: {
    borderColor: '#ffffff',
  },
  captureButtonDark: {
    borderColor: '#ffffff',
  },
  captureLensDark: {
    borderColor: '#ffffff',
  },
  aiBadgeDark: {
    backgroundColor: '#1d2d44',
  },
  frameDark: {
    borderColor: '#ffffff',
  },
});
