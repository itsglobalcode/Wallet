import { useInterstitialAd, TestIds } from 'react-native-google-mobile-ads';
import { useEffect } from 'react';
import { View, Button } from 'react-native';

export default function App({ navigation }: { navigation: any }) {
  const { isLoaded, isClosed, load, show } = useInterstitialAd(TestIds.INTERSTITIAL);

  useEffect(() => {
    // Start loading the interstitial straight away
    load();
  }, [load]);

  useEffect(() => {
    if (isClosed) {
      // Action after the ad is closed
      navigation.navigate('NextScreen');
    }
  }, [isClosed, navigation]);

  return (
    <View>
      <Button
        title="Navigate to next screen"
        onPress={() => {
          if (isLoaded) {
            show();
          } else {
            // No advert ready to show yet
            navigation.navigate('NextScreen');
          }
        }}
      />
    </View>
  );
}