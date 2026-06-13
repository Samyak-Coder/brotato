import {View, Text, StyleSheet, TouchableOpacity} from 'react-native'
import { router } from 'expo-router'
import { useEffect } from 'react';
import * as ScreenOrientation from "expo-screen-orientation";
import { PIConfetti } from 'react-native-fast-confetti';


export default function App(){

    useEffect(() => {
    const setOrientation = async () => {
      await ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.LANDSCAPE,
      );
    };
    setOrientation();
    return () => {
      void ScreenOrientation.unlockAsync();
    };
  }, []);

    return(
        <View style={styles.container} >
            <TouchableOpacity
                style={styles.button}
                onPress={()=>router.push('/game')}
            >
                <Text style={{fontWeight: 500, fontSize: 18}}>Start Bruhtata</Text>
            </TouchableOpacity>
        </View>
    )

}

const styles = StyleSheet.create({
    container:{
        flex: 1,
        backgroundColor: 'black',
        justifyContent: 'center',
        alignItems: 'center'
    },
    button:{
        padding: 20,
        backgroundColor: 'white',
        borderRadius: 15 
    }
})