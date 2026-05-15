import { Pressable, Text, StyleSheet, type PressableProps, type ViewStyle, type TextStyle } from 'react-native';

export type ButtonProps = PressableProps & {
  title: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  disabled?: boolean;
};

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

const buttonStyles: Record<
  ButtonVariant,
  {
    backgroundColor: string;
    pressedBackgroundColor: string;
    textColor: string;
    borderColor: string;
  }
> = {
  primary: {
    backgroundColor: '#0d3b66',
    pressedBackgroundColor: '#0b2f55',
    textColor: '#ffffff',
    borderColor: 'transparent',
  },
  secondary: {
    backgroundColor: '#1e5089',
    pressedBackgroundColor: '#17436f',
    textColor: '#ffffff',
    borderColor: 'transparent',
  },
  ghost: {
    backgroundColor: 'transparent',
    pressedBackgroundColor: 'rgba(13, 59, 102, 0.14)',
    textColor: '#0d3b66',
    borderColor: '#0d3b66',
  },
};

export function Button({
  title,
  variant = 'primary',
  disabled = false,
  style,
  ...props
}: ButtonProps) {
  const variantStyles = buttonStyles[variant];

  return (
    <Pressable
      disabled={disabled}
      style={({ pressed }: { pressed: boolean }) => [
        styles.button,
        {
          backgroundColor: disabled
            ? '#c8d3e0'
            : pressed
            ? variantStyles.pressedBackgroundColor
            : variantStyles.backgroundColor,
          borderColor: variant === 'ghost' ? variantStyles.borderColor : 'transparent',
          opacity: disabled ? 0.75 : 1,
        } as ViewStyle,
        variant === 'ghost' && styles.ghost,
        pressed && styles.pressed,
        style,
      ]}
      {...props}
    >
      {({ pressed }: { pressed: boolean }) => (
        <Text
          style={[
            styles.title,
            { color: disabled ? '#7a8794' : variantStyles.textColor } as TextStyle,
            pressed && !disabled ? styles.titlePressed : undefined,
          ]}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    minWidth: 140,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  pressed: {
    transform: [{ scale: 0.98 }],
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
  titlePressed: {
    opacity: 0.92,
  },
});
