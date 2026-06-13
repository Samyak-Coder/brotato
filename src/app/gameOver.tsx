import {View, Text, StyleSheet, TouchableOpacity} from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { useEffect, useRef } from 'react';
import * as ScreenOrientation from "expo-screen-orientation";
import {ConfettiMethods, PIConfetti, PIConfettiMethods} from "react-native-fast-confetti";

export default function GameOver(){

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

  const {lost} = useLocalSearchParams()
  const isLost = (lost === "false") ? false : true

    return(
        <View style={styles.container} >
            
            <PIConfetti autoplay >
            <PIConfetti.Origin blastPosition="center" count={200}>
            <PIConfetti.Flake size={12} />
            </PIConfetti.Origin>
            </PIConfetti>
            
            <TouchableOpacity
                style={styles.button}
                onPress={()=>router.push('/game')}
            >
                <Text style={{fontWeight: 500, fontSize: 16}}>play again</Text>
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