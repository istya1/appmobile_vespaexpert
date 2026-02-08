import { View, Text, TouchableOpacity, Linking, StyleSheet } from 'react-native';

const ContactScreen = () => {
  const openWhatsApp = () => {
    const phone = '6281234567890'; // pakai format internasional
    const message = 'Halo Admin Vespa Expert, saya mau bertanya 🙏';

    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    Linking.openURL(url);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hubungi Kami</Text>

      <TouchableOpacity style={styles.waButton} onPress={openWhatsApp}>
        <Text style={styles.waText}>Hubungi via WhatsApp</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ContactScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 20,
  },
  waButton: {
    backgroundColor: '#25D366',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  waText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

