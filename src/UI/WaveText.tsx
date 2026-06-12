import { StyleSheet, Text, View } from "react-native";
import React from "react";

const WaveText = ({ waveNumber }: { waveNumber: number | string }) => {
  return (
    <View>
      <Text>Wave {waveNumber}</Text>
    </View>
  );
};

export default WaveText;

const styles = StyleSheet.create({});
