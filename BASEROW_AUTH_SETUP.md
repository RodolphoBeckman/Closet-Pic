# Estrutura da Tabela de Usuários no Baserow

Para configurar a autenticação no seu aplicativo, crie uma nova tabela no seu banco de dados Baserow com a seguinte estrutura.

**Nome da Tabela:** `Users`

## Campos da Tabela

| Nome do Campo | Tipo no Baserow | Formato/Opções                                             | Exemplo de Valor                      | Notas                                                                   |
| :------------ | :-------------- | :--------------------------------------------------------- | :------------------------------------ | :---------------------------------------------------------------------- |
| **EU IA**     | `Text`          | -                                                          | `user_1722196800000`                  | **(Campo Primário)** Identificador único para o usuário.                |
| **email**     | `Email`         | -                                                          | `usuario@exemplo.com`                 | O endereço de e-mail do usuário. Será usado para o login.               |
| **password**  | `Text`          | -                                                          | `senha_criptografada_aqui`            | Armazenará a senha do usuário após ser criptografada (hashed).          |
| **name**      | `Text`          | -                                                          | `Nome do Usuário`                     | O nome de exibição do usuário.                                          |
| **created_at**| `Date`          | Formato da Data: `Europe/Lisbon` <br> Formato da Hora: `24h` | `28/07/2024 10:00`                    | Habilite "Include time". Registrará quando a conta do usuário foi criada. |


## Instruções Importantes

1.  **Nomes dos Campos:** É **crucial** que os nomes dos campos na sua tabela Baserow sejam **exatamente** como listados acima (`EU IA`, `email`, `password`, `name`, `created_at`). O código que implementaremos dependerá desses nomes.
2.  **Campo Primário:** Defina o campo **`EU IA`** como o campo primário (`Primary Field`) da sua tabela.
3.  **Campo de Data:** No campo `created_at`, certifique-se de habilitar a opção **"Include time"**.

Com esta tabela criada, seu banco de dados estará pronto para gerenciarmos os usuários do ClosetPic. O próximo passo será construir as telas de login e registro no aplicativo.
