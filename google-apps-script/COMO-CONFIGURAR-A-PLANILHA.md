# Como ligar a calculadora a uma planilha do Google

Faça isso uma única vez, de preferência com a conta Google do grupo de pesquisa
(e não uma conta pessoal), porque os dados ficarão no Drive dessa conta.

## 1. Criar a planilha e colar o script

1. Em drive.google.com, crie uma planilha nova. Sugestão de nome: **CIRE – dados de pesquisa**.
2. Na planilha, abra **Extensões > Apps Script**.
3. Apague o conteúdo que aparece no editor, cole todo o conteúdo do arquivo `Codigo.gs`
   desta pasta e clique no ícone de disquete (**Salvar**).

## 2. Testar a gravação

1. No editor, na lista de funções do topo, escolha **testeManual** e clique em **Executar**.
2. O Google vai pedir autorização. Clique em **Revisar permissões**, escolha a conta e,
   na tela "O Google não verificou este app", clique em **Avançado > Acessar (não seguro)**.
   Esse aviso é normal para scripts próprios: o script só tem acesso a esta planilha.
3. Volte à planilha: devem ter surgido as abas **Calculos** e **Itens** com uma linha de teste.
   Apague essas linhas de teste (deixe só o cabeçalho).

## 3. Publicar como App da Web

1. No editor, clique em **Implantar > Nova implantação**.
2. Na engrenagem ao lado de "Selecione o tipo", escolha **App da Web**.
3. Preencha:
   - Descrição: `CIRE`
   - Executar como: **Eu**
   - Quem pode acessar: **Qualquer pessoa**
4. Clique em **Implantar** e copie a **URL do app da Web** (termina em `/exec`).
5. Teste abrindo essa URL no navegador: deve aparecer "CIRE: recebendo dados."

"Qualquer pessoa" significa que qualquer um pode *enviar* um cálculo, como em qualquer
formulário público. Ninguém consegue *ler* a planilha por essa URL.

## 4. Colar a URL no site

1. Abra `docs/static/js/config.js` (no GitHub: abra o arquivo e clique no lápis).
2. Cole a URL entre as aspas de `endpointPesquisa`:

   ```js
   endpointPesquisa: "https://script.google.com/macros/s/XXXXXXXX/exec",
   ```

3. Faça o commit. Em um ou dois minutos o site publicado passa a enviar os dados.

Para conferir: faça um cálculo em cire.app.br marcando a autorização de pesquisa,
clique em **Gerar Relatório** e veja a linha nova na planilha.

## Como os dados chegam

- Aba **Calculos**: uma linha por cálculo, com setor, norma e totais.
- Aba **Itens**: uma linha por custo, com todas as variáveis em colunas `campo_...`.
  As duas abas se ligam pela coluna `codigo`.
- Se a pessoa gerar o relatório de novo depois de mudar algo, as linhas daquele código
  são substituídas pela versão mais recente. A coluna `envio` mostra quantas vezes ela gerou.
- Textos que começam com `=`, `+`, `-` ou `@` recebem um apóstrofo na frente, para não
  virarem fórmulas.

## Cuidados

- **Não compartilhe a planilha publicamente.** Dê acesso só aos pesquisadores.
- **Se alterar o script depois**, use **Implantar > Gerenciar implantações > lápis >
  Versão: Nova versão > Implantar**. Assim a URL continua a mesma. Uma "Nova implantação"
  gera outra URL, e seria preciso trocá-la no `config.js`.
- **Pedido de exclusão:** a pessoa informa o código do cálculo (está no PDF). Basta
  apagar as linhas com esse código nas duas abas.
- **Limpeza antes da análise:** como em qualquer formulário público, podem chegar envios
  de teste ou sem sentido. Vale filtrar valores extremos antes de analisar.
