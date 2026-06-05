// This hook checks for necessary permissions on app load and prompts the user if they are not granted. 
// It returns a boolean indicating whether permissions have been validated, which can be used to conditionally render the rest of the app.

import { useState, useEffect } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';
import Logger from '../components/Logger';

export default function usePermissions() {
  const [permissionsValidated, setPermissionsValidated] = useState(false);
  const { Log } = Logger('Permissions');

  const checkPermissions = async () => {
    Log("Checking location permissions", '');

    if (Platform.OS == 'android') {
      const locationPermission = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'Stripe Terminal needs access to your location',
          buttonPositive: 'Accept',
        }
      );

      Log("Location permissions checked", locationPermission);
      setPermissionsValidated(locationPermission === PermissionsAndroid.RESULTS.GRANTED);

    }
    else {
      // For iOS, we assume permissions are granted via the OS
      Log("Location permissions checked", "iOS");
      setPermissionsValidated(true);
    }
  };

  useEffect(() => {
    checkPermissions();
  }, []);

  return { permissionsValidated };
}
