# Estrutura da Tabela no Baserow

Para configurar seu banco de dados no Baserow e integrá-lo com o ClosetPic, crie uma tabela com a seguinte estrutura.

**Nome da Tabela:** `ClosetPic`

## Campos da Tabela

| Nome do Campo   | Tipo no Baserow  | Formato/Opções                                             | Exemplo de Valor                | Notas                                    |
| :-------------- | :--------------- | :--------------------------------------------------------- | :------------------------------ | :--------------------------------------- |
| **id**          | `Text`           | -                                                          | `2024-07-26T18:10:00-image.png` | **(Campo Primário)** Identificador único. |
| **src**         | `File`           | -                                                          | `[arquivo_da_imagem.jpg]`       | Campo para o upload do arquivo.          |
| **alt**         | `Text`           | -                                                          | `image.png`                     | Nome do arquivo da imagem.               |
| **referencia**  | `Text`           | -                                                          | `04199-A`                       | Referência da peça.                      |
| **marca**       | `Text`           | -                                                          | `Nike`                          | Marca da peça.                           |
| **dataRegistrada**| `Date`           | Formato da Data: `Europe/Lisbon` <br> Formato da Hora: `24h` | `26/07/2024 18:10`              | Habilite "Include time".                 |
| **dia**         | `Number`         | `Decimal places: 0`                                        | `26`                            | Dia do upload.                           |
| **mes**         | `Text`           | -                                                          | `julho`                         | Mês do upload (por extenso).             |
| **ano**         | `Number`         | `Decimal places: 0`                                        | `2024`                          | Ano do upload.                           |
| **category**    | `Text`           | -                                                          | `default`                       | Categoria da imagem (pode ser fixo).     |
| **hint**        | `Text`           | -                                                          | `verao24`                       | Palavra-chave opcional.                  |


## Instruções Importantes

1.  **Campo Primário:** Defina o campo **`id`** como o campo primário (`Primary Field`) da sua tabela.
2.  **Campo de Data:** No campo `dataRegistrada`, certifique-se de habilitar a opção **"Include time"** e configurar os formatos de data e hora como especificado acima para garantir a compatibilidade.

Com esta estrutura, o aplicativo estará pronto para se conectar ao seu banco de dados no Baserow.
