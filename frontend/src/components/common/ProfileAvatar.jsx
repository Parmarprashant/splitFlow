import React from 'react';
import {
  TouchableOpacity,
  Image,
  View,
  StyleSheet,
} from 'react-native';
import { Camera } from 'lucide-react-native';
import { useProfile } from '../../context/ProfileContext';
import { Colors } from '../../constants';

export const ProfileAvatar = ({
  size = 38,
  onPress,
  showCameraBadge = false,
  style,
}) => {
  const { profile } = useProfile();
  const borderRadius = size / 2;

  const content = (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius,
        },
        style,
      ]}
    >
      {profile.photoUri ? (
        <Image
          source={{ uri: profile.photoUri }}
          style={{ width: size, height: size, borderRadius }}
          resizeMode="cover"
        />
      ) : (
        <Image
          source={require('../../../assets/images/default_avatar.png')}
          style={{ width: size, height: size, borderRadius }}
          resizeMode="cover"
        />
      )}

      {showCameraBadge && (
        <View style={styles.cameraBadge}>
          <Camera size={14} color={Colors.white} strokeWidth={2.5} />
        </View>
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onPress}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#EDE4F7',
    borderWidth: 1.5,
    borderColor: '#DFCEF3',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 2,
    right: 4,
    backgroundColor: Colors.primary,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
});
