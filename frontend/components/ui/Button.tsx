// components/ui/Button.tsx
import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';

type ButtonVariant = 'primary' | 'success' | 'danger' | 'secondary';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
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
  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      minHeight: 50,
    };

    const variantStyles: Record<ButtonVariant, ViewStyle> = {
      primary: { backgroundColor: '#4CAF50' },
      success: { backgroundColor: '#2E7D32' },
      danger: { backgroundColor: '#FF3B30' },
      secondary: { 
        backgroundColor: 'transparent', 
        borderWidth: 2, 
        borderColor: '#4CAF50' 
      },
    };

    const disabledStyle: ViewStyle = disabled ? { 
      backgroundColor: '#CCCCCC',
      borderColor: '#CCCCCC'
    } : {};

    return { ...baseStyle, ...variantStyles[variant], ...disabledStyle, ...style };
  };

  const getTextStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      fontSize: 16,
      fontWeight: 'bold',
    };

    const variantTextStyles: Record<ButtonVariant, TextStyle> = {
      primary: { color: 'white' },
      success: { color: 'white' },
      danger: { color: 'white' },
      secondary: { color: '#4CAF50' },
    };

    const disabledTextStyle: TextStyle = disabled ? { color: '#666666' } : {};

    return { ...baseStyle, ...variantTextStyles[variant], ...disabledTextStyle, ...textStyle };
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator 
          color={variant === 'secondary' ? '#4CAF50' : 'white'} 
          size="small" 
        />
      ) : (
        <Text style={getTextStyle()}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

// Styles additionnels si besoin
const styles = StyleSheet.create({
  // Vous pouvez ajouter des styles spécifiques ici
});