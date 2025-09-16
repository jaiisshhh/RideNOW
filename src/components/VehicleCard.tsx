import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';

interface VehicleCardProps {
  name: string;
  price: string;
  image: any;
  onPress?: () => void;
}

export default function VehicleCard({ name, price, image, onPress }: VehicleCardProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        backgroundColor: '#fff',
        borderRadius: 16,
        marginBottom: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
      }}
    >
      <Image source={image} style={{ width: '100%', height: 180 }} resizeMode="cover" />
      <View style={{ padding: 12 }}>
        <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 6 }}>{name}</Text>
        <Text style={{ fontSize: 16, color: '#666' }}>{price}</Text>
      </View>
    </TouchableOpacity>
  );
}
