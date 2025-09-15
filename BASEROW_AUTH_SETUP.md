# Estrutura da Tabela de Usuários no Baserow

Para configurar a autenticação no seu aplicativo, crie uma nova tabela no seu banco de dados Baserow com a seguinte estrutura.

**Nome da Tabela:** `Users`

## Campos da Tabela

| Nome do Campo | Tipo no Baserow | Formato/Opções                                             | Exemplo de Valor                      | Notas                                                                   |
| :------------ | :-------------- | :--------------------------------------------------------- | :------------------------------------ | :---------------------------------------------------------------------- |
| **EU IA**     | `Text`          | -                                                          | `user_1722196800000`                  | **(Campo Primário)** Identificador único para o usuário.                |
| **EMAIL**     | `Email`         | -                                                          | `usuario@exemplo.com`                 | O endereço de e-mail do usuário. Será usado para o login.               |
| **PASSWORD**  | `Text`          | -                                                          | `senha_criptografada_aqui`            | Armazenará a senha do usuário após ser criptografada (hashed).          |
| **NAME**      | `Text`          | -                                                          | `Nome do Usuário`                     | O nome de exibição do usuário.                                          |
| **CREATED_AT**| `Date`          | Formato da Data: `ISO 8601` <br> Formato da Hora: `24h`     | `2024-07-28T18:10:00.000Z`            | Habilite "Include time". Registrará quando a conta do usuário foi criada. |


## Instruções Importantes

1.  **Nomes dos Campos:** É **crucial** que os nomes dos campos na sua tabela Baserow sejam **exatamente** como listados acima (`EU IA`, `EMAIL`, `PASSWORD`, `NAME`, `CREATED_AT`), em maiúsculas.
2.  **Campo Primário:** Defina o campo **`EU IA`** como o campo primário (`Primary Field`) da sua tabela.
3.  **Campo de Data:** No campo `CREATED_AT`, certifique-se de habilitar a opção **"Include time"** e definir o formato da data para **`ISO 8601`**. Este é o formato padrão que o código envia e garante a máxima compatibilidade.

Com esta tabela criada, seu banco de dados estará pronto para gerenciarmos os usuários do ClosetPic.
