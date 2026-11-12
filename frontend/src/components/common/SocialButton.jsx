import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Image,
  View,
} from 'react-native';

export const SocialButton = ({ type, onPress }) => {
  const isGoogle = type === 'google';

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={styles.container}
    >
      <View style={styles.content}>
        {isGoogle ? (
          <Image
            source={require('../../../assets/images/google_icon.png')}
            style={styles.icon}
            resizeMode="contain"
          />
        ) : (
          <Image
            source={require('../../../assets/images/apple_icon.png')}
            style={styles.icon}
            resizeMode="contain"
          />
        )}
        <Text style={styles.text}>{isGoogle ? 'Google' : 'Apple'}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: 50,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F0EAF8',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    width: 22,
    height: 22,
    marginRight: 10,
  },
  text: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
});
