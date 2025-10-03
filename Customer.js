import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { css } from './styles';
import { faker } from '@faker-js/faker';
import { Dropdown } from 'react-native-element-dropdown';
import { api } from './api';

export default function Customer(props) {
  const [customers, setCustomers] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const getCustomers = async () => {
    setIsProcessing(true);
    try {
      const data = await api.getCustomers();
      data.push({ id: null, name: 'Add random customer' });
      setCustomers(data);
    }
    catch (error) {
      console.log('Error getting customers', error);
    } 
    setIsProcessing(false);
  };

  const createCustomer = async () => {
    props.setCustomer({});
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const email = firstName.toLowerCase() + '.' + lastName.toLowerCase() + '@example.com';
    const payload = {
      'name': firstName + ' ' + lastName,
      'email': email
    };
    const customer = await api.createCustomer(payload);
    return customer;
  };

  const handleDropDownChange = async (item) => {
    if (item.id !== null) {
      props.setCustomer(item);
    } else {
      await createCustomer();
      await getCustomers();
    }
  };

  useEffect(() => {
    getCustomers();
  }, []);

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Dropdown
        data={customers}
        labelField="name"
        valueField="id"
        placeholder={isProcessing ? "...Fetching customers" : "Select customer"}
        onChange={handleDropDownChange}
        style={css.dropdown}
      />
      {/* <Text>{props.customer?.name || 'Guest'}</Text> */}
    </View>
  );
}
