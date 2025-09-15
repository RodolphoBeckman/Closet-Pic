# Estrutura da Tabela no Baserow

Para configurar seu banco de dados no Baserow e integrá-lo com o ClosetPic, crie uma tabela com a seguinte estrutura.

**Nome da Tabela:** `ClosetPic` (ou o nome que preferir)

## Campos da Tabela

| Nome do Campo     | Tipo no Baserow  | Formato/Opções                                             | Exemplo de Valor                | Notas                                    |
| :---------------- | :--------------- | :--------------------------------------------------------- | :------------------------------ | :--------------------------------------- |
| **EU IA**         | `Text`           | -                                                          | `1721958600000`                 | **(Campo Primário)** Identificador único. |
| **SRC**           | `File`           | -                                                          | `[arquivo_da_imagem.jpg]`       | Campo para o upload do arquivo.          |
| **ALT**           | `Text`           | -                                                          | `image.png`                     | Nome do arquivo da imagem.               |
| **REFERÊNCIA**    | `Text`           | -                                                          | `04199-A`                       | Referência da peça.                      |
| **MARCA**         | `Text`           | -                                                          | `Nike`                          | Marca da peça.                           |
| **DATA REGISTRADA**| `Date`           | Formato da Data: `Europe/Lisbon` <br> Formato da Hora: `24h` | `26/07/2024 18:10`              | Habilite "Include time".                 |
| **DIA**           | `Number`         | `Decimal places: 0`                                        | `26`                            | Dia do upload.                           |
| **MES**           | `Text`           | -                                                          | `julho`                         | Mês do upload (por extenso).             |
| **ANO**           | `Number`         | `Decimal places: 0`                                        | `2024`                          | Ano do upload.                           |
| **category**      | `Text`           | -                                                          | `default`                       | Categoria da imagem (pode ser fixo).     |
| **hint**          | `Text`           | -                                                          | `verao24`                       | Palavra-chave opcional.                  |


## Instruções Importantes

1.  **Nomes dos Campos:** É **crucial** que os nomes dos campos na sua tabela Baserow sejam **exatamente** como listados acima (ex: `EU IA`, `DATA REGISTRADA`). O código agora está configurado para usar esses nomes exatos.
2.  **Campo Primário:** Defina o campo **`EU IA`** como o campo primário (`Primary Field`) da sua tabela.
3.  **Campo de Data:** No campo `DATA REGISTRADA`, certifique-se de habilitar a opção **"Include time"** e configurar os formatos de data e hora como especificado.

Com esta estrutura, o aplicativo estará pronto para se conectar ao seu banco de dados no Baserow.
