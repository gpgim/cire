# CIRE: Calculadora de Impacto Regulatório para Empreendedores

Ferramenta gratuita para empreendedores estimarem os custos de conformidade e os custos
financeiros diretos de uma nova norma, lei ou projeto de lei.

**Acesse:** https://cire.app.br

Desenvolvida pelo **GP-GIM: Grupo de Pesquisa em Gestão, Inovação e Mercados**.

**Registro:** programa de computador registrado no INPI, processo nº **BR512025006716-0**.
Titular: Instituto Federal de Educação, Ciência e Tecnologia de Goiás (IFG).
Autores: Adriano de Carvalho Paranaiba e Caio Felipe Brito Paranaiba.
A metodologia está descrita no Capítulo 4 do livro *Regulação para Empreendedores*,
disponível para download no site.

## Como funciona

O site é estático (HTML, CSS e JavaScript), publicado pelo GitHub Pages a partir da
pasta `docs/`. Os cálculos e o relatório em PDF são feitos no navegador do usuário.
Se o usuário autorizar, os valores são enviados de forma anônima para uma planilha
do Google usada em pesquisa (veja `google-apps-script/`).

## Estrutura

| Caminho | Conteúdo |
|---|---|
| `docs/index.html` | Calculadora |
| `docs/static/js/dados.js` | Categorias, subcategorias, campos e textos de ajuda |
| `docs/static/js/calculadora.js` | Fórmulas, resumo, relatório em PDF e envio à pesquisa |
| `docs/static/js/config.js` | URL da planilha de pesquisa |
| `docs/static/vendor/` | Bibliotecas (Bootstrap, Font Awesome, Chart.js, jsPDF) |
| `google-apps-script/` | Script que grava os envios na planilha e instruções |
| `COMO-PUBLICAR.md` | Publicação no GitHub Pages e configuração do domínio |

## Testar localmente

Abra `docs/index.html` no navegador. Para o logo aparecer no PDF, sirva a pasta
por HTTP, por exemplo: `python3 -m http.server --directory docs`.

## Direitos

Todos os direitos reservados ao IFG. Veja `LICENSE`.
