import { StyleSheet, Text, View } from "react-native";

const WaveText = ({ waveNumber }: { waveNumber: number | string }) => {
  return (
    <View>
      <Text>Wave {waveNumber}</Text>
    </View>
  );
};

export default WaveText;

const styles = StyleSheet.create({});
