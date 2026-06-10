import { View, Platform, StyleSheet, Text } from 'react-native';
import Brotata from './game';

export default function HomeScreen() {
  return (
    <View>
      <Brotata />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    flexDirection: 'row',
  },
});
