import React, {useState} from "react";
import { Button, Text, View } from "react-native";

function BotaoContaUm(){
  const [n1, setN1] = useState(0);

  function incrementar(){
    setN1(n1 + 1);
  }

  function resetar(){
    setN1(0);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.texto}>Contagem é: {n1}</Text>
      <Button
        title="Contar"
        onPress={incrementar}
      />
      <View style={styles.botaoResetar}>
        <Button
          title="Resetar"
          onPress={resetar}
        />
      </View>
    </View>
  );
}

export default BotaoContaUm;
