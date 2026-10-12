
import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Button,
} from "react-native";
import MapView, {
  Marker,
  Polyline,
  PROVIDER_GOOGLE,
} from "react-native-maps";
import * as Location from "expo-location";

const ZOOM_LEVEL = 15;
const ANIMATION_DURATION = 2000;

const INITIAL_REGION = {
  latitude: 50.4501,
  longitude: 30.5234,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

export default function App() {
  const mapRef = useRef(null);

  const [userLocation, setUserLocation] = useState(null);
  const [marker, setMarker] = useState(null);
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const getUserLocation = async () => {
      try {
        const { status } =
          await Location.requestForegroundPermissionsAsync();

        if (status !== "granted") {
          if (isMounted) {
            setError("Permission to access location was denied");
          }
          return;
        }

        const location = await Location.getCurrentPositionAsync({});

        if (!isMounted) {
          return;
        }

        const coordinates = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        };

        setUserLocation(coordinates);
        setError("");

        mapRef.current?.animateCamera(
          {
            center: coordinates,
            zoom: ZOOM_LEVEL,
          },
          { duration: ANIMATION_DURATION }
        );
      } catch (e) {
        if (isMounted) {
          setError("Permission to access location was denied");
        }
      }
    };

    getUserLocation();

    return () => {
      isMounted = false;
    };
  }, []);

  const addMarker = async () => {
    try {
      const results = await Location.geocodeAsync(address.trim());

      if (!results || results.length === 0) {
        setError("Address not found");
        return;
      }

      const coordinates = {
        latitude: results[0].latitude,
        longitude: results[0].longitude,
      };

      setMarker(coordinates);
      setError("");

      mapRef.current?.animateCamera(
        {
          center: coordinates,
          zoom: ZOOM_LEVEL,
        },
        { duration: ANIMATION_DURATION }
      );
    } catch (e) {
      setError("Address not found");
    }
  };

  const centerMarker = () => {
    if (!marker) {
      return;
    }

    mapRef.current?.animateCamera(
      {
        center: marker,
        zoom: ZOOM_LEVEL,
      },
      { duration: ANIMATION_DURATION }
    );
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={INITIAL_REGION}
        showsUserLocation={Boolean(userLocation)}
        showsMyLocationButton
      >
        {marker && <Marker coordinate={marker} />}

        {userLocation && marker && (
          <Polyline
            coordinates={[userLocation, marker]}
            strokeColor="#007AFF"
            strokeWidth={3}
          />
        )}
      </MapView>

      {error !== "" && (
        <Text style={styles.error}>{error}</Text>
      )}

      <TextInput
        style={styles.input}
        placeholder="Enter the address"
        value={address}
        onChangeText={setAddress}
      />

      <View style={styles.buttonContainer}>
        <Button title="Add marker" onPress={addMarker} />

        {marker && (
          <Button
            title="Center the marker"
            onPress={centerMarker}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-end",
  },
  map: {
    flex: 1,
    width: "100%",
  },
  input: {
    width: "100%",
    height: 40,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    alignItems: "center",
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  error: {
    color: "red",
    textAlign: "center",
    marginBottom: 10,
  },
});
