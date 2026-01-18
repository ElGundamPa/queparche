import React from "react";
import { View, StyleSheet } from "react-native";

import HeaderDropdown from "@/components/HeaderDropdown";

export default function HomeHeaderActions() {
  return (
    <View style={styles.container}>
      <HeaderDropdown />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: 'center',
    marginTop: 50,
  },
});
