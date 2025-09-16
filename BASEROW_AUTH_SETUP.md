
# Estrutura da Tabela de Utilizadores no Baserow

Para configurar o banco de dados no Baserow para a autenticação, crie uma **nova tabela** chamada `Users` com a seguinte estrutura.

**Nome da Tabela:** `Users`

**Importante:** Esta deve ser uma tabela separada da sua tabela `ClosetPic`.

## Campos da Tabela `Users`

| Nome do Campo | Tipo no Baserow | Formato/Opções | Exemplo de Valor | Notas |
| :--- | :--- | :--- | :--- | :--- |
| **Name** | `Text` | - | `John Doe` | **(Campo Primário)** Nome do utilizador. |
| **Email** | `Email` | - | `john.doe@example.com` | Email único para login. |
| **Password**| `Text` | - | `[hash_da_password]` | A aplicação irá armazenar a password encriptada aqui. |
| **Active** | `Boolean` | `Checkbox` | `Checked` | Indica se a conta está ativa. |

## Instruções Importantes

1.  **Criar a Tabela:** Crie uma nova tabela na sua base de dados Baserow e nomeie-a **exatamente** `Users`.
2.  **Nomes dos Campos:** É **crucial** que os nomes dos campos na sua tabela sejam **exatamente** como listados acima (`Name`, `Email`, `Password`, `Active`). O código está configurado para usar estes nomes.
3.  **Campo Primário:** Defina o campo **`Name`** como o campo primário (`Primary Field`).
4.  **Variáveis de Ambiente:** Após criar a tabela, obtenha o seu ID e adicione-o ao seu ficheiro `.env` ou às configurações de ambiente da sua hospedagem:

    ```
    ID_DA_TABELA_USERS_BASEROW=xxxx
    ```
    
    Não se esqueça também de definir a chave secreta para a sessão:

    ```
    SESSION_SECRET="a_sua_chave_secreta_muito_longa_e_segura_aqui"
    ```
    Pode gerar uma chave segura usando um gerador de passwords online, por exemplo.

Com esta estrutura e as variáveis de ambiente configuradas, a autenticação de utilizadores estará pronta para funcionar.
