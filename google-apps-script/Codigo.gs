/**
 * CIRE: recebe os cálculos enviados pelo site cire.app.br e grava nesta planilha.
 *
 * Abas criadas automaticamente:
 *   Calculos: uma linha por cálculo (totais).
 *   Itens:    uma linha por custo informado, com todas as variáveis.
 *
 * Se a mesma pessoa gerar o relatório mais de uma vez, as linhas antigas daquele
 * "codigo" são substituídas pela versão mais recente (coluna "envio" mostra quantas vezes).
 *
 * Instalação: veja COMO-CONFIGURAR-A-PLANILHA.md.
 */

const ABA_CALCULOS = "Calculos";
const ABA_ITENS = "Itens";

const CAMPOS = [
  "valor", "n_funcionarios", "n_interacoes", "horas", "custo_hora", "custo_curso",
  "investimento", "taxa_mensal", "meses", "custo_mensal", "dias", "receita_dia"
];

const CAB_CALCULOS = [
  "recebido_em", "codigo", "envio", "gerado_em", "versao", "setor", "norma",
  "qtd_itens", "total_conformidade", "total_financeiro", "total_geral"
];

const CAB_ITENS = [
  "recebido_em", "codigo", "envio", "ordem", "setor", "norma", "categoria",
  "subcategoria", "modelo", "descricao", "valor_calculado"
].concat(CAMPOS.map(function (c) { return "campo_" + c; }));

const LIMITE_ITENS = 200;

function doGet() {
  return ContentService.createTextOutput("CIRE: recebendo dados.");
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);
    const d = JSON.parse(e.postData.contents);
    validar(d);

    const planilha = SpreadsheetApp.getActiveSpreadsheet();
    const abaCalc = obterAba(planilha, ABA_CALCULOS, CAB_CALCULOS);
    const abaItens = obterAba(planilha, ABA_ITENS, CAB_ITENS);

    removerCodigo(abaCalc, d.codigo);
    removerCodigo(abaItens, d.codigo);

    const agora = new Date();
    const setor = texto(d.setor, 200);
    const norma = texto(d.norma, 200);

    abaCalc.appendRow([
      agora, d.codigo, inteiro(d.envio), texto(d.gerado_em, 40), texto(d.versao, 10), setor, norma,
      d.itens.length, numero(d.total_conformidade), numero(d.total_financeiro), numero(d.total_geral)
    ]);

    const linhas = d.itens.map(function (it, i) {
      const campos = it.campos || {};
      return [
        agora, d.codigo, inteiro(d.envio), i + 1, setor, norma,
        texto(it.categoria, 100), texto(it.subcategoria, 100), texto(it.modelo, 30),
        texto(it.descricao, 1000), numero(it.valor)
      ].concat(CAMPOS.map(function (c) { return campos[c] === undefined ? "" : numero(campos[c]); }));
    });
    if (linhas.length) {
      abaItens.getRange(abaItens.getLastRow() + 1, 1, linhas.length, CAB_ITENS.length).setValues(linhas);
    }
    return resposta({ ok: true });
  } catch (err) {
    return resposta({ ok: false, erro: String(err && err.message || err) });
  } finally {
    lock.releaseLock();
  }
}

function validar(d) {
  if (!d || typeof d !== "object") throw new Error("payload inválido");
  if (!/^cire-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}$/.test(String(d.codigo))) throw new Error("codigo inválido");
  if (!Array.isArray(d.itens) || d.itens.length === 0 || d.itens.length > LIMITE_ITENS) throw new Error("itens inválidos");
  if (!d.setor || !d.norma) throw new Error("setor ou norma ausente");
}

function obterAba(planilha, nome, cabecalho) {
  let aba = planilha.getSheetByName(nome);
  if (!aba) {
    aba = planilha.insertSheet(nome);
    aba.getRange(1, 1, 1, cabecalho.length).setValues([cabecalho]).setFontWeight("bold");
    aba.setFrozenRows(1);
  }
  return aba;
}

function removerCodigo(aba, codigo) {
  const ultima = aba.getLastRow();
  if (ultima < 2) return;
  const valores = aba.getRange(2, 2, ultima - 1, 1).getValues();
  for (let i = valores.length - 1; i >= 0; i--) {
    if (valores[i][0] === codigo) aba.deleteRow(i + 2);
  }
}

// Evita que um texto digitado vire fórmula na planilha (ex.: "=IMPORTXML(...)").
function texto(v, max) {
  let s = String(v == null ? "" : v).slice(0, max);
  if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
  return s;
}

function numero(v) {
  const n = Number(v);
  if (!isFinite(n) || n < 0 || n > 1e13) return "";
  return n;
}

function inteiro(v) {
  const n = parseInt(v, 10);
  return isFinite(n) && n > 0 && n < 10000 ? n : 1;
}

function resposta(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

/** Rode esta função uma vez pelo editor para testar a gravação sem usar o site. */
function testeManual() {
  const exemplo = {
    postData: {
      contents: JSON.stringify({
        versao: "2.0", codigo: "cire-0000-0000-0000", envio: 1, gerado_em: new Date().toISOString(),
        setor: "Construção", norma: "Teste", total_conformidade: 1200, total_financeiro: 300, total_geral: 1500,
        itens: [
          { categoria: "Custos de Conformidade", subcategoria: "Cumprimento legal", modelo: "trabalho",
            descricao: "Teste", campos: { n_funcionarios: 2, n_interacoes: 3, horas: 4, custo_hora: 50 }, valor: 1200 },
          { categoria: "Custos Financeiros Diretos", subcategoria: "Taxas", modelo: "valor",
            descricao: "Teste", campos: { valor: 300 }, valor: 300 }
        ]
      })
    }
  };
  Logger.log(doPost(exemplo).getContent());
}
