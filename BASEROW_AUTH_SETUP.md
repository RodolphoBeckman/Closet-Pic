# Estrutura da Tabela de Usuários no Baserow

Para configurar a autenticação no seu aplicativo, crie uma nova tabela no seu banco de dados Baserow com a seguinte estrutura.

**Nome da Tabela:** `Users`

## Campos da Tabela

| Nome do Campo | Tipo no Baserow | Formato/Opções                                             | Exemplo de Valor                      | Notas                                                                   |
| :------------ | :-------------- | :--------------------------------------------------------- | :------------------------------------ | :---------------------------------------------------------------------- |
| **id**        | `UUID`          | -                                                          | `123e4567-e89b-12d3-a456-426614174000` | **(Campo Primário)** Use o tipo UUID para garantir um ID único.         |
| **email**     | `Email`         | -                                                          | `usuario@exemplo.com`                 | O endereço de e-mail do usuário. Será usado para o login.               |
| **password**  | `Text`          | -                                                          | `senha_criptografada_aqui`            | Armazenará a senha do usuário após ser criptografada (hashed).          |
| **name**      | `Text`          | -                                                          | `Nome do Usuário`                     | O nome de exibição do usuário.                                          |
| **created_at**| `Date`          | Formato da Data: `Europe/Lisbon` <br> Formato da Hora: `24h` | `28/07/2024 10:00`                    | Habilite "Include time". Registrará quando a conta do usuário foi criada. |


## Instruções Importantes

1.  **Nomes dos Campos:** É **crucial** que os nomes dos campos na sua tabela Baserow sejam **exatamente** como listados acima (`id`, `email`, `password`, `name`, `created_at`). O código que implementaremos dependerá desses nomes.
2.  **Campo Primário:** Defina o campo **`id`** como o campo primário (`Primary Field`) da sua tabela e certifique-se de que o tipo dele seja `UUID`.
3.  **Campo de Data:** No campo `created_at`, certifique-se de habilitar a opção **"Include time"**.

Com esta tabela criada, seu banco de dados estará pronto para gerenciarmos os usuários do ClosetPic. O próximo passo será construir as telas de login e registro no aplicativo.