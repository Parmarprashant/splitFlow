import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Colors } from '../../constants';
import { Mail, Lock, Eye, EyeOff, User } from 'lucide-react-native';

export const InputField = ({
  label,
  icon,
  isPassword = false,
  style,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View
        style={[
          styles.inputContainer,
          isFocused && styles.inputFocused,
        ]}
      >
        {icon === 'user' && (
          <View style={styles.iconContainer}>
            <User size={20} color={Colors.primary} strokeWidth={2} />
          </View>
        )}
        {icon === 'mail' && (
          <View style={styles.iconContainer}>
            <Mail size={20} color={Colors.primary} strokeWidth={2} />
          </View>
        )}
        {icon === 'lock' && (
          <View style={styles.iconContainer}>
            <Lock size={20} color={Colors.primary} strokeWidth={2} />
          </View>
        )}

        <TextInput
          style={[styles.input, style]}
          placeholderTextColor={Colors.placeholder}
          secureTextEntry={isPassword && !showPassword}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          autoCapitalize="none"
          {...props}
        />

        {isPassword && (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeButton}
          >
            {showPassword ? (
              <EyeOff size={20} color="#1E1E2D" strokeWidth={1.8} />
            ) : (
              <Eye size={20} color="#1E1E2D" strokeWidth={1.8} />
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderWidth: 1.2,
    borderColor: '#DFCEF3',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
  },
  inputFocused: {
    borderColor: Colors.primary,
    backgroundColor: '#FAF5FF',
  },
  iconContainer: {
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 15,
    color: '#111827',
  },
  eyeButton: {
    padding: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
