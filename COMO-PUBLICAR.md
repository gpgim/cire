# Como publicar a CIRE em https://cire.app.br

A pasta `docs/` é o site completo. Não há servidor nem banco de dados.
Para testar no seu computador, abra `docs/index.html` no navegador.

A pasta já contém o arquivo `docs/CNAME` com o domínio `cire.app.br`. Não o apague.

## Parte 0: planilha de pesquisa (pode ser feita antes ou depois)

Siga `google-apps-script/COMO-CONFIGURAR-A-PLANILHA.md`. No fim, você vai colar uma URL
em `docs/static/js/config.js`. Enquanto esse arquivo estiver sem URL, o site funciona
normalmente, só não envia nada.

## Parte 1: GitHub

Organização no GitHub: **gpgim**. Repositório: **cire** (https://github.com/gpgim/cire).

1. Com uma conta pessoal do GitHub (com verificação em duas etapas ativa), clique em
   **+ > New organization**, escolha o plano **Free** e dê o nome da organização.
   Em **People > Invite member**, convide pelo menos mais um pesquisador como **Owner**.
   Depois, em **+ > New repository**, escolha a organização como dona, dê o nome
   `cire`, marque **Public** e crie sem README. No repositório vazio, clique em **uploading an existing file** (ou **Add file >
   Upload files**), arraste **tudo o que está dentro da pasta `CIRE-site`** (pastas
   `docs` e `google-apps-script`, `README.md`, `LICENSE` e este arquivo) e faça o
   commit em `main`.
2. Vá em **Settings > Pages**. Em *Source*, escolha **Deploy from a branch**,
   branch **main**, pasta **/docs** e clique em **Save**.
3. No campo *Custom domain*, confirme que aparece `cire.app.br`
   (se estiver vazio, digite e salve).

## Parte 2: Registro.br

1. Entre em registro.br, abra o domínio **cire.app.br** e vá na seção **DNS**.
2. Se o domínio ainda não usa o DNS do Registro.br, escolha
   **Utilizar os servidores DNS do Registro.br**.
3. Clique em **Configurar zona DNS** (ou **Editar zona**) e adicione:

   | Tipo  | Nome | Dados                   |
   |-------|------|-------------------------|
   | A     | (em branco) | 185.199.108.153  |
   | A     | (em branco) | 185.199.109.153  |
   | A     | (em branco) | 185.199.110.153  |
   | A     | (em branco) | 185.199.111.153  |
   | CNAME | www  | gpgim.github.io |

   Deixe o nome em branco nos registros A: isso significa o próprio `cire.app.br`.
   O endereço com www vai redirecionar sozinho para `cire.app.br`.
4. Salve. A propagação costuma levar de minutos a algumas horas.

## Parte 3: HTTPS e proteção

1. Volte em **Settings > Pages** no GitHub. Quando aparecer "DNS check successful",
   marque **Enforce HTTPS** (o certificado pode levar até 24 h para ficar pronto).
2. Recomendado: nas configurações **da organização > Pages > Add a domain**, adicione
   `cire.app.br` e crie no Registro.br o registro **TXT** que o GitHub indicar.
   Isso impede que outra conta use o seu domínio.

O repositório precisa ser **público** para usar o GitHub Pages no plano gratuito.

## Alternativa: Cloudflare Pages

Funciona, mas exige trocar os servidores DNS do cire.app.br no Registro.br para os
da Cloudflare (domínio sem www não aceita CNAME no DNS do Registro.br). Passos:
Workers & Pages > Create > Pages > Connect to Git, sem build command, output
directory `docs`; depois aba **Custom domains** > `cire.app.br`. Nesse caso, apague
o arquivo `docs/CNAME`, que só é usado pelo GitHub.

## Para manter

- Categorias, subcategorias, campos e textos de ajuda: `docs/static/js/dados.js`.
- Fórmulas e relatório em PDF: `docs/static/js/calculadora.js`.
- URL da planilha: `docs/static/js/config.js`.
- Qualquer alteração enviada ao GitHub é publicada automaticamente.
- O site não depende de nenhum serviço externo para funcionar (Bootstrap, ícones,
  gráficos e gerador de PDF estão em `docs/static/vendor`).

## Pendências

- Os termos foram atualizados para refletir a coleta opcional para pesquisa e o IFG
  como controlador dos dados (introdução, seções 2, 5, 6, 7.1 e 13). É uma proposta:
  precisa de revisão jurídica pelo IFG. Confirmar também o prazo de guarda de 5 anos
  (seção 5) e o foro (seção 12 cita a Comarca de Goiânia; com o IFG, autarquia federal,
  a competência tende a ser da Justiça Federal).
- Consultar o NIT do IFG sobre: licença de uso do código (hoje "todos os direitos
  reservados") e registro da nova versão em JavaScript como programa derivado.
- Consultar o Comitê de Ética em Pesquisa da instituição antes de usar os dados.
- O manual e o livro citam calcreg.com.br. Atualize para cire.app.br nas próximas
  versões ou redirecione o domínio antigo.
