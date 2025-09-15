# Estrutura da Tabela de Usuários no Baserow

Para configurar a autenticação no seu aplicativo, crie uma nova tabela no seu banco de dados Baserow com a seguinte estrutura.

**Nome da Tabela:** `Users`

## Campos da Tabela

| Nome do Campo | Tipo no Baserow    | Formato/Opções | Exemplo de Valor                      | Notas                                                                   |
| :------------ | :----------------- | :------------- | :------------------------------------ | :---------------------------------------------------------------------- |
| **EU IA**     | `Text`             | -              | `user_1722196800000`                  | **(Campo Primário)** Identificador único para o usuário.                |
| **EMAIL**     | `Email`            | -              | `usuario@exemplo.com`                 | O endereço de e-mail do usuário. Será usado para o login.               |
| **PASSWORD**  | `Text`             | -              | `senha_criptografada_aqui`            | Armazenará a senha do usuário após ser criptografada (hashed).          |
| **NAME**      | `Text`             | -              | `Nome do Usuário`                     | O nome de exibição do usuário.                                          |
| **CREATED_AT**| `Text`             | -              | `2024-07-28T18:10:00.000Z`            | Armazenará a data e hora de criação do usuário no formato ISO 8601.     |


## Instruções Importantes

1.  **Nomes dos Campos:** É **crucial** que os nomes dos campos na sua tabela Baserow sejam **exatamente** como listados acima (`EU IA`, `EMAIL`, `PASSWORD`, `NAME`, `CREATED_AT`), em maiúsculas.
2.  **Campo Primário:** Defina o campo **`EU IA`** como o campo primário (`Primary Field`) da sua tabela.
3.  **Campo de Data de Criação:** Use o tipo **`Text`** (Single line text) para o campo `CREATED_AT`. Isso garante compatibilidade máxima ao salvar a data enviada pelo servidor.

Com esta tabela criada, seu banco de dados estará pronto para gerenciarmos os usuários do ClosetPic.
