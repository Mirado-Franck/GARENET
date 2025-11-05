// components/ui/Button.tsx
import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  StyleProp,
} from 'react-native';
import { theme } from '../../constants/theme';

type ButtonVariant = 'primary' | 'success' | 'danger' | 'secondary';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export default function Button({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
  textStyle,
}: ButtonProps) {
  const getButtonStyle = (): StyleProp<ViewStyle> => {
    const baseStyle: ViewStyle = {
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.xl,
      borderRadius: theme.borderRadius.md,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      minHeight: 50,
    };

    const variantStyles: Record<ButtonVariant, ViewStyle> = {
      primary: { backgroundColor: theme.colors.primary[500] },
      success: { backgroundColor: theme.colors.semantic.success },
      danger: { backgroundColor: theme.colors.semantic.error },
      secondary: { 
        backgroundColor: 'transparent', 
        borderWidth: 2, 
        borderColor: theme.colors.primary[500],
      },
    };

    const disabledStyle: ViewStyle = disabled ? { 
      backgroundColor: theme.colors.neutral[300],
      borderColor: theme.colors.neutral[300],
    } : {};

    return [
      baseStyle,
      variantStyles[variant],
      disabled && disabledStyle,
      style,
    ];
  };

  const getTextStyle = (): StyleProp<TextStyle> => {
    const baseStyle: TextStyle = {
      fontSize: theme.typography.sizes.body,
      fontWeight: theme.typography.weights.semibold, // ✅ MAINTENANT CORRECT
    };

    const variantTextStyles: Record<ButtonVariant, TextStyle> = {
      primary: { color: theme.colors.text.inverse },
      success: { color: theme.colors.text.inverse },
      danger: { color: theme.colors.text.inverse },
      secondary: { color: theme.colors.primary[500] },
    };

    const disabledTextStyle: TextStyle = disabled ? { 
      color: theme.colors.neutral[600],
    } : {};

    return [
      baseStyle,
      variantTextStyles[variant],
      disabled && disabledTextStyle,
      textStyle,
    ];
  };

  const getActivityIndicatorColor = (): string => {
    if (disabled) {
      return theme.colors.neutral[600];
    }
    return variant === 'secondary' 
      ? theme.colors.primary[500]
      : theme.colors.text.inverse;
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator 
          color={getActivityIndicatorColor()} 
          size="small" 
        />
      ) : (
        <Text style={getTextStyle()}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

// StyleSheet pour les styles constants (optionnel)
const styles = StyleSheet.create({
  // Vous pouvez ajouter des styles spécifiques ici si besoin
});