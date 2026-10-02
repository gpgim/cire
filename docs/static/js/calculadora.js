// CIRE 2.0: a lógica roda no navegador.
// Os dados ficam salvos neste navegador até o usuário clicar em "Limpar Dados".
// Só são enviados à pesquisa se o usuário marcar a autorização e clicar em "Gerar Relatório".
(function () {
  "use strict";

  const CFG = window.CIRE_CONFIG || {};
  const CAMPOS = window.CIRE_CAMPOS;
  const MODELOS = window.CIRE_MODELOS;
  const CATEGORIAS = window.CIRE_CATEGORIAS;
  const CHAVE = "cire:v2";

  const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
  const num = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 });
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => document.querySelectorAll(s);

  function el(tag, attrs, texto) {
    const e = document.createElement(tag);
    if (attrs) for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
    if (texto !== undefined) e.textContent = texto;
    return e;
  }

  function novoCodigo() {
    const a = new Uint8Array(6);
    (window.crypto || window.msCrypto).getRandomValues(a);
    const hex = Array.from(a, (b) => b.toString(16).padStart(2, "0")).join("");
    return "cire-" + hex.slice(0, 4) + "-" + hex.slice(4, 8) + "-" + hex.slice(8, 12);
  }

  // Aceita "1.234,56", "1234,56", "1234.56" e "1.500" (milhar).
  function lerNumero(txt) {
    if (txt == null) return NaN;
    let s = String(txt).replace(/R\$|%|\s/g, "");
    if (s === "") return NaN;
    if (s.includes(",")) s = s.replace(/\./g, "").replace(",", ".");
    else if (/^\d{1,3}(\.\d{3})+$/.test(s)) s = s.replace(/\./g, "");
    if (!/^-?\d*\.?\d+$/.test(s)) return NaN;
    return parseFloat(s);
  }

  function acharSub(id) {
    for (const c of CATEGORIAS) for (const s of c.subcategorias) if (s.id === id) return { cat: c, sub: s };
    return null;
  }

  // ---------- estado ----------
  const vazio = () => ({ codigo: novoCodigo(), setor: "", norma: "", pesquisa: false, itens: [], envios: 0 });
  let estado = vazio();

  function carregar() {
    try {
      const s = JSON.parse(localStorage.getItem(CHAVE));
      if (s && s.codigo && Array.isArray(s.itens)) estado = Object.assign(vazio(), s);
    } catch (e) { /* sem armazenamento disponível: segue sem salvar */ }
  }
  function salvar() {
    try { localStorage.setItem(CHAVE, JSON.stringify(estado)); } catch (e) { /* ignora */ }
  }

  // ---------- cálculo ----------
  function calcular(modelo, v) {
    const g = (k) => (Number.isFinite(v[k]) ? v[k] : 0);
    switch (modelo) {
      case "valor": return g("valor");
      case "trabalho": return g("n_funcionarios") * g("n_interacoes") * g("horas") * g("custo_hora");
      case "treinamento": return g("n_funcionarios") * g("horas") * g("custo_hora") + g("custo_curso");
      case "investimento": return g("investimento") * (g("taxa_mensal") / 100) * g("meses");
      case "ociosa": return g("n_funcionarios") * g("custo_mensal") * g("meses");
      case "receita": return g("dias") * g("receita_dia");
      default: return 0;
    }
  }

  function memoria(modelo, v) {
    const r = (k) => brl.format(v[k] || 0), n = (k) => num.format(v[k] || 0);
    switch (modelo) {
      case "valor": return "Valor informado";
      case "trabalho": return `${n("n_funcionarios")} func. × ${n("n_interacoes")} interações × ${n("horas")} h × ${r("custo_hora")}/h`;
      case "treinamento": {
        const base = `${n("n_funcionarios")} func. × ${n("horas")} h × ${r("custo_hora")}/h`;
        return v.custo_curso ? `${base} + curso ${r("custo_curso")}` : base;
      }
      case "investimento": return `${r("investimento")} × ${n("taxa_mensal")}% ao mês × ${n("meses")} meses`;
      case "ociosa": return `${n("n_funcionarios")} func. × ${r("custo_mensal")}/mês × ${n("meses")} meses`;
      case "receita": return `${n("dias")} dias × ${r("receita_dia")}/dia`;
      default: return "";
    }
  }

  // ---------- tela 1 ----------
  const selSetor = $("#setor");
  window.CIRE_SETORES.forEach((s) => selSetor.appendChild(el("option", { value: s }, s)));

  function mostrarTela(id) {
    $$(".tela").forEach((t) => (t.hidden = t.id !== id));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function preencherProjeto() {
    $$(".txt-setor").forEach((e) => (e.textContent = estado.setor));
    $$(".txt-norma").forEach((e) => (e.textContent = estado.norma));
    $$(".txt-codigo").forEach((e) => (e.textContent = estado.codigo));
    $$(".txt-pesquisa").forEach((e) => (e.textContent = estado.pesquisa ? "autorizada (dados anônimos)" : "não autorizada"));
  }

  $("#form-inicio").addEventListener("submit", (ev) => {
    ev.preventDefault();
    const f = ev.target;
    if (!f.checkValidity()) { f.classList.add("was-validated"); f.querySelector(":invalid")?.focus(); return; }
    estado.setor = selSetor.value;
    estado.norma = $("#norma").value.trim().slice(0, 200);
    estado.pesquisa = $("#pesquisa").checked;
    salvar();
    preencherProjeto();
    renderResumo();
    mostrarTela("tela-calc");
  });

  $("#btn-alterar").addEventListener("click", () => {
    selSetor.value = estado.setor;
    $("#norma").value = estado.norma;
    $("#aceite").checked = true;
    $("#pesquisa").checked = estado.pesquisa;
    $("#btn-iniciar").innerHTML = '<i class="fas fa-check" aria-hidden="true"></i> Salvar e voltar à calculadora';
    mostrarTela("tela-inicio");
  });

  // ---------- tela 2: formulário de custo ----------
  const selCat = $("#categoria"), selSub = $("#subcategoria"), taDef = $("#definicao");
  const boxCampos = $("#campos"), saida = $("#resultado");
  CATEGORIAS.forEach((c) => selCat.appendChild(el("option", { value: c.id }, c.nome)));

  selCat.addEventListener("change", () => {
    const cat = CATEGORIAS.find((c) => c.id === selCat.value);
    selSub.replaceChildren(el("option", { value: "", disabled: "", selected: "" }, "Selecione a subcategoria"));
    cat.subcategorias.forEach((s) => selSub.appendChild(el("option", { value: s.id }, s.nome)));
    selSub.disabled = false;
    limparSub();
  });

  selSub.addEventListener("change", () => {
    const { sub } = acharSub(selSub.value);
    taDef.value = sub.definicao;
    const ex = $("#exemplo");
    ex.textContent = "Exemplo: " + sub.exemplo;
    ex.hidden = false;
    montarCampos(sub.modelo);
  });

  function limparSub() {
    taDef.value = "";
    $("#exemplo").hidden = true;
    boxCampos.replaceChildren();
    $("#sem-campos").hidden = false;
    atualizarResultado();
  }

  function montarCampos(modelo) {
    boxCampos.replaceChildren();
    $("#sem-campos").hidden = true;
    const chaves = MODELOS[modelo];
    chaves.forEach((k) => {
      const c = CAMPOS[k];
      const col = el("div", { class: chaves.length === 1 ? "col-12" : "col-sm-6" });
      const id = "campo_" + k;
      col.appendChild(el("label", { for: id, class: "form-label" }, c.rotulo));
      const inp = el("input", { type: "text", inputmode: "decimal", id, "data-campo": k, class: "form-control", placeholder: c.moeda ? "0,00" : "0", autocomplete: "off" });
      if (!c.opcional) inp.setAttribute("required", "");
      if (c.ajuda) inp.setAttribute("aria-describedby", id + "_ajuda");
      inp.addEventListener("input", () => { inp.setCustomValidity(""); atualizarResultado(); });
      col.appendChild(inp);
      if (c.ajuda) col.appendChild(el("div", { id: id + "_ajuda", class: "form-text" }, c.ajuda));
      col.appendChild(el("div", { class: "invalid-feedback" }, "Informe um número maior ou igual a zero."));
      boxCampos.appendChild(col);
    });
    atualizarResultado();
  }

  function lerCampos() {
    const v = {};
    let ok = true;
    boxCampos.querySelectorAll("input[data-campo]").forEach((inp) => {
      const k = inp.dataset.campo, opcional = CAMPOS[k].opcional;
      const n = lerNumero(inp.value);
      if (inp.value.trim() === "" && opcional) { v[k] = 0; inp.setCustomValidity(""); return; }
      if (!Number.isFinite(n) || n < 0 || n > 1e13) { ok = false; inp.setCustomValidity("inválido"); }
      else { inp.setCustomValidity(""); v[k] = n; }
    });
    return { v, ok };
  }

  function atualizarResultado() {
    const sel = acharSub(selSub.value);
    if (!sel) { saida.textContent = brl.format(0); return; }
    const { v } = lerCampos();
    saida.textContent = brl.format(calcular(sel.sub.modelo, v));
  }

  function mensagem(texto, tipo) {
    const m = $("#mensagem");
    m.className = "alert py-2 small alert-" + (tipo || "info");
    m.textContent = texto;
    m.hidden = false;
    clearTimeout(mensagem._t);
    mensagem._t = setTimeout(() => (m.hidden = true), 9000);
  }

  $("#form-custo").addEventListener("submit", (ev) => {
    ev.preventDefault();
    const f = ev.target;
    const sel = acharSub(selSub.value);
    if (!selCat.value || !sel) { f.classList.add("was-validated"); mensagem("Escolha a categoria e a subcategoria do custo.", "warning"); return; }
    const { v, ok } = lerCampos();
    if (!ok || !f.checkValidity()) {
      f.classList.add("was-validated");
      f.querySelector(":invalid")?.focus();
      mensagem("Preencha os campos com números maiores ou iguais a zero. Use vírgula para os centavos, como em 1.250,50.", "warning");
      return;
    }
    const valor = calcular(sel.sub.modelo, v);
    estado.itens.push({
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      categoria: sel.cat.id,
      subcategoria: sel.sub.id,
      nome: sel.sub.nome,
      descricao: (taDef.value.trim() || sel.sub.definicao).slice(0, 1000),
      modelo: sel.sub.modelo,
      campos: v,
      valor,
      memoria: memoria(sel.sub.modelo, v),
      adicionado_em: new Date().toISOString()
    });
    salvar();
    renderResumo();
    f.reset();
    f.classList.remove("was-validated");
    selSub.disabled = true;
    limparSub();
    mensagem(`"${sel.sub.nome}" adicionado ao resumo (${brl.format(valor)}).`, "success");
    selCat.focus();
  });

  // ---------- resumo ----------
  function totais() {
    const porCat = {};
    CATEGORIAS.forEach((c) => (porCat[c.id] = 0));
    estado.itens.forEach((i) => (porCat[i.categoria] = (porCat[i.categoria] || 0) + i.valor));
    const geral = Object.values(porCat).reduce((a, b) => a + b, 0);
    return { porCat, geral };
  }

  function renderResumo() {
    const temItens = estado.itens.length > 0;
    $("#resumo-vazio").hidden = temItens;
    $("#resumo").hidden = !temItens;
    const box = $("#resumo-grupos");
    box.replaceChildren();
    const t = totais();
    CATEGORIAS.forEach((c) => {
      const itens = estado.itens.filter((i) => i.categoria === c.id);
      if (!itens.length) return;
      const g = el("section", { class: "resumo-grupo mb-3" });
      g.appendChild(el("p", { class: "resumo-rotulo mb-2" }, c.nome));
      itens.forEach((i) => {
        const d = el("div", { class: "resumo-item" });
        const topo = el("div", { class: "d-flex justify-content-between align-items-start gap-2" });
        const txt = el("div");
        txt.appendChild(el("strong", {}, i.nome));
        txt.appendChild(el("div", {}, brl.format(i.valor)));
        topo.appendChild(txt);
        const rm = el("button", { type: "button", class: "btn btn-sm btn-link text-danger p-0", "aria-label": "Remover " + i.nome, title: "Remover" });
        rm.innerHTML = '<i class="fas fa-xmark" aria-hidden="true"></i>';
        rm.addEventListener("click", () => {
          estado.itens = estado.itens.filter((x) => x.id !== i.id);
          salvar(); renderResumo();
          mensagem(`"${i.nome}" removido do resumo.`, "info");
        });
        topo.appendChild(rm);
        d.appendChild(topo);
        d.appendChild(el("div", { class: "text-muted memoria" }, i.memoria));
        d.appendChild(el("div", { class: "text-muted memoria" }, "Adicionado em: " + new Date(i.adicionado_em).toLocaleString("pt-BR")));
        g.appendChild(d);
      });
      g.appendChild(el("p", { class: "subtotal mb-0" }, `Total ${c.nome}: ${brl.format(t.porCat[c.id])}`));
      box.appendChild(g);
    });
    $("#total-geral").textContent = brl.format(t.geral);
  }

  // ---------- limpar ----------
  $("#btn-limpar").addEventListener("click", () => {
    if (!window.confirm("Apagar todos os custos e os dados deste cálculo? Esta ação não pode ser desfeita.")) return;
    try { localStorage.removeItem(CHAVE); } catch (e) { /* ignora */ }
    estado = vazio();
    $$("form").forEach((f) => { f.reset(); f.classList.remove("was-validated"); });
    selSub.disabled = true;
    limparSub();
    $("#btn-iniciar").innerHTML = '<i class="fas fa-arrow-right" aria-hidden="true"></i> Iniciar Cálculo';
    renderResumo();
    mostrarTela("tela-inicio");
  });

  // ---------- envio para a pesquisa ----------
  function enviarPesquisa() {
    if (!estado.pesquisa || !CFG.endpointPesquisa) return Promise.resolve(false);
    if ($("#site_empresa").value) return Promise.resolve(false); // robô
    estado.envios += 1;
    salvar();
    const t = totais();
    const payload = {
      versao: CFG.versao || "2.0",
      codigo: estado.codigo,
      envio: estado.envios,
      gerado_em: new Date().toISOString(),
      setor: estado.setor,
      norma: estado.norma,
      total_conformidade: t.porCat.conformidade || 0,
      total_financeiro: t.porCat.financeiro || 0,
      total_geral: t.geral,
      itens: estado.itens.map((i, n) => ({
        ordem: n + 1,
        categoria: CATEGORIAS.find((c) => c.id === i.categoria).nome,
        subcategoria: i.nome,
        descricao: i.descricao,
        modelo: i.modelo,
        campos: i.campos,
        valor: i.valor
      }))
    };
    // text/plain evita a verificação prévia (CORS) do navegador; o Apps Script lê o JSON normalmente.
    return fetch(CFG.endpointPesquisa, {
      method: "POST",
      mode: "no-cors",
      keepalive: true,
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload)
    }).then(() => true).catch(() => false);
  }

  // ---------- relatório em PDF ----------
  function imagemDataURL(img) {
    try {
      const c = document.createElement("canvas");
      c.width = img.naturalWidth; c.height = img.naturalHeight;
      c.getContext("2d").drawImage(img, 0, 0);
      return c.toDataURL("image/jpeg", 0.9);
    } catch (e) { return null; } // ex.: arquivo aberto direto do disco
  }

  const CORES = ["#007bff", "#FF6F61", "#88B04B", "#6B5B95", "#EFC050", "#45B8AC", "#DD4124", "#5B5EA6", "#009B77", "#B565A7",
    "#955251", "#92A8D1", "#9B2335", "#55B4B0", "#E15D44", "#2E4A62", "#C3447A", "#FFA500", "#A0785A", "#7FCDCD"];

  function graficoDataURL() {
    if (typeof Chart === "undefined" || estado.itens.length < 2) return null;
    const cv = $("#grafico-pdf");
    cv.hidden = false;
    const ch = new Chart(cv, {
      type: "pie",
      data: {
        labels: estado.itens.map((i) => i.nome),
        datasets: [{ data: estado.itens.map((i) => i.valor), backgroundColor: estado.itens.map((_, n) => CORES[n % CORES.length]) }]
      },
      options: {
        animation: false, responsive: false, devicePixelRatio: 2,
        plugins: { legend: { position: "right", labels: { font: { size: 16 }, boxWidth: 18 } } }
      }
    });
    const url = cv.toDataURL("image/png");
    ch.destroy();
    cv.hidden = true;
    return url;
  }

  function gerarPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const W = doc.internal.pageSize.getWidth();
    const M = 15;
    const azul = [0, 123, 255];
    const t = totais();
    const agora = new Date();

    const logo = imagemDataURL(document.querySelector(".logo-inicio"));
    let y = M;
    if (logo) doc.addImage(logo, "JPEG", M, y, 22, 22);
    const x0 = logo ? M + 27 : M;
    doc.setTextColor(...azul).setFont("helvetica", "bold").setFontSize(18).text("CIRE", x0, y + 8);
    doc.setFontSize(11).text("Calculadora de Impacto Regulatório para Empreendedores", x0, y + 14);
    doc.setTextColor(90).setFont("helvetica", "normal").setFontSize(9).text("Relatório de custos regulatórios", x0, y + 19);
    y += 30;

    doc.setTextColor(0).setFontSize(10);
    const info = [
      ["Regulação/Norma:", estado.norma],
      ["Área de atuação:", estado.setor],
      ["Data do relatório:", agora.toLocaleDateString("pt-BR") + " às " + agora.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })],
      ["Código do cálculo:", estado.codigo]
    ];
    info.forEach(([k, v]) => {
      doc.setFont("helvetica", "bold").text(k, M, y);
      const linhas = doc.splitTextToSize(v, W - M * 2 - 38);
      doc.setFont("helvetica", "normal").text(linhas, M + 38, y);
      y += 5.5 * linhas.length;
    });
    y += 3;

    CATEGORIAS.forEach((c) => {
      const itens = estado.itens.filter((i) => i.categoria === c.id);
      if (!itens.length) return;
      doc.autoTable({
        startY: y,
        margin: { left: M, right: M, bottom: 20 },
        head: [[{ content: c.nome, colSpan: 4, styles: { halign: "left", fillColor: azul, fontSize: 11 } }],
               ["Tipo de custo", "Descrição", "Memória de cálculo", "Valor"]],
        body: itens.map((i) => [i.nome, i.descricao, i.memoria, brl.format(i.valor)]),
        foot: [[{ content: "Total " + c.nome, colSpan: 3, styles: { halign: "right" } }, brl.format(t.porCat[c.id])]],
        styles: { fontSize: 8.5, cellPadding: 2, valign: "top", overflow: "linebreak" },
        headStyles: { fillColor: [230, 240, 255], textColor: 20 },
        footStyles: { fillColor: [242, 242, 242], textColor: 20, fontStyle: "bold" },
        columnStyles: { 0: { cellWidth: 42, fontStyle: "bold" }, 2: { cellWidth: 46 }, 3: { cellWidth: 28, halign: "right" } },
        didParseCell: (d) => { if (d.section === "head" && d.column.index === 3 && d.row.index === 1) d.cell.styles.halign = "right"; },
        showFoot: "lastPage"
      });
      y = doc.lastAutoTable.finalY + 6;
    });

    if (y > 265) { doc.addPage(); y = M; }
    doc.setFillColor(255, 193, 7).rect(M, y, W - M * 2, 11, "F");
    doc.setFont("helvetica", "bold").setFontSize(12).setTextColor(0)
      .text("TOTAL GERAL", M + 3, y + 7.4)
      .text(brl.format(t.geral), W - M - 3, y + 7.4, { align: "right" });
    y += 18;

    const graf = graficoDataURL();
    if (graf) {
      const w = 140, h = w * (560 / 900);
      if (y + h + 6 > 278) { doc.addPage(); y = M; }
      doc.setFontSize(11).text("Participação de cada custo no total", M, y);
      doc.addImage(graf, "PNG", (W - w) / 2, y + 3, w, h);
      y += h + 8;
    }

    if (y > 262) { doc.addPage(); y = M; }
    doc.setFont("helvetica", "normal").setFontSize(8).setTextColor(90);
    doc.text(doc.splitTextToSize("Os valores são estimativas calculadas a partir das informações fornecidas pelo usuário. A metodologia está descrita no livro \"Regulação para Empreendedores\", disponível em cire.app.br.", W - M * 2), M, y);

    const paginas = doc.getNumberOfPages();
    for (let p = 1; p <= paginas; p++) {
      doc.setPage(p);
      doc.setFontSize(7.5).setTextColor(120);
      doc.text("CIRE · cire.app.br · Criado por GP-GIM", M, 286);
      doc.text("Programa registrado no INPI: BR512025006716-0 · Titular: IFG", M, 290);
      doc.text(`Código ${estado.codigo} · Página ${p} de ${paginas}`, W - M, 290, { align: "right" });
    }

    const slug = estado.norma.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "calculo";
    doc.save(`CIRE-relatorio-${slug}-${agora.toISOString().slice(0, 10)}.pdf`);
  }

  $("#btn-relatorio").addEventListener("click", async () => {
    if (!estado.itens.length) { mensagem("Adicione pelo menos um custo antes de gerar o relatório.", "warning"); return; }
    if (!window.jspdf || !window.jspdf.jsPDF) { mensagem("Não foi possível carregar o gerador de PDF. Recarregue a página e tente de novo.", "danger"); return; }
    const btn = $("#btn-relatorio");
    btn.disabled = true;
    try {
      gerarPDF();
      const enviado = await enviarPesquisa();
      mensagem(enviado
        ? "Relatório gerado. Os valores foram enviados de forma anônima para a pesquisa do GP-GIM. Obrigado!"
        : "Relatório gerado. Seus dados continuam salvos neste navegador até você clicar em Limpar Dados.", "success");
    } catch (e) {
      console.error(e);
      mensagem("Não foi possível gerar o relatório. Tente novamente.", "danger");
    } finally {
      btn.disabled = false;
    }
  });

  // ---------- início ----------
  carregar();
  preencherProjeto();
  renderResumo();
  if (estado.setor && estado.norma) mostrarTela("tela-calc");
})();
