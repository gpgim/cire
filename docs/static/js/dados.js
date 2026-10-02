// Dados da CIRE, conforme o Capítulo 4 do livro "Regulação para Empreendedores" (manual).
// Para incluir ou alterar um custo, edite este arquivo. Não é preciso mexer em calculadora.js.

window.CIRE_SETORES = [
  "Administração Pública, Defesa e Seguridade Social",
  "Agricultura, Pecuária, Produção Florestal, Pesca e Aquicultura",
  "Água, Esgoto, Atividades de Gestão de Resíduos e Descontaminação",
  "Alojamento e Alimentação",
  "Artes, Cultura, Esporte e Recreação",
  "Atividades Administrativas e Serviços Complementares",
  "Atividades Financeiras, de Seguros e Serviços Relacionados",
  "Atividades Imobiliárias",
  "Atividades Profissionais, Científicas e Técnicas",
  "Comércio; Reparação de Veículos Automotores e Motocicletas",
  "Construção",
  "Educação",
  "Eletricidade e Gás",
  "Indústrias de Transformação",
  "Indústrias Extrativas",
  "Informação e Comunicação",
  "Organismos Internacionais e Outras Instituições Extraterritoriais",
  "Saúde Humana e Serviços Sociais",
  "Serviços Domésticos",
  "Transporte, Armazenagem e Correio",
  "Outras Atividades de Serviços"
];

// Campos de entrada. "moeda" mostra o valor em R$ na memória de cálculo.
window.CIRE_CAMPOS = {
  valor:          { rotulo: "Valor (R$)", moeda: true },
  n_funcionarios: { rotulo: "Nº de funcionários", ajuda: "Quantas pessoas da equipe participam" },
  n_interacoes:   { rotulo: "Nº de interações", ajuda: "Quantas vezes a atividade ocorre (visitas, relatórios, renovações...)" },
  horas:          { rotulo: "Horas dedicadas", ajuda: "Por funcionário, em cada interação" },
  custo_hora:     { rotulo: "Custo da hora por funcionário (R$)", moeda: true, ajuda: "Salário + encargos, dividido pelas horas trabalhadas" },
  custo_curso:    { rotulo: "Custo do curso ou instrutor (R$)", moeda: true, opcional: true, ajuda: "Opcional. Deixe em branco se não houver" },
  investimento:   { rotulo: "Capital investido (R$)", moeda: true },
  taxa_mensal:    { rotulo: "Rendimento de referência (% ao mês)", ajuda: "Ex.: rendimento de uma aplicação financeira ou retorno esperado" },
  meses:          { rotulo: "Tempo de espera (meses)" },
  custo_mensal:   { rotulo: "Custo médio mensal por funcionário (R$)", moeda: true, ajuda: "Salário + encargos" },
  dias:           { rotulo: "Tempo de atraso (dias)" },
  receita_dia:    { rotulo: "Receita estimada por dia (R$)", moeda: true }
};

// Modelos de cálculo. A lógica de cada um está em calculadora.js (função calcular).
window.CIRE_MODELOS = {
  valor:        ["valor"],
  trabalho:     ["n_funcionarios", "n_interacoes", "horas", "custo_hora"],
  treinamento:  ["n_funcionarios", "horas", "custo_hora", "custo_curso"],
  investimento: ["investimento", "taxa_mensal", "meses"],
  ociosa:       ["n_funcionarios", "custo_mensal", "meses"],
  receita:      ["dias", "receita_dia"]
};

window.CIRE_CATEGORIAS = [
  {
    id: "conformidade",
    nome: "Custos de Conformidade",
    subcategorias: [
      { id: "atraso_investimento", nome: "Atrasos: custo do investimento", modelo: "investimento",
        definicao: "Custo de oportunidade do dinheiro já investido que fica parado, sem gerar retorno, enquanto a operação espera uma licença ou alvará.",
        exemplo: "Você investiu R$ 500.000 em uma fábrica e esperou seis meses pela licença de operação. O quanto esse capital deixou de render é o custo." },
      { id: "atraso_trabalhista", nome: "Atrasos: custos trabalhistas", modelo: "ociosa",
        definicao: "Salários e encargos de funcionários já contratados que não podem trabalhar porque a licença ainda não saiu.",
        exemplo: "Você contratou 5 pessoas para a nova loja e o alvará demorou 1 mês. Os salários desse mês são o custo." },
      { id: "atraso_receita", nome: "Atrasos: perda de receita", modelo: "receita",
        definicao: "Faturamento que a empresa deixa de ter a cada dia em que permanece fechada por atrasos burocráticos.",
        exemplo: "O restaurante faturaria R$ 2.000 por dia e o alvará atrasou 15 dias: perda de R$ 30.000." },
      { id: "compras", nome: "Compras", modelo: "valor",
        definicao: "Gasto na aquisição de produtos, equipamentos ou serviços de terceiros para cumprir uma exigência da norma.",
        exemplo: "Filtros de ar exigidos por uma lei ambiental, ou uma consultoria para adequação à LGPD." },
      { id: "cumprimento_legal", nome: "Cumprimento legal", modelo: "trabalho",
        definicao: "Tempo que a equipe dedica a atender fiscalizações, auditorias ou inspeções do órgão regulador.",
        exemplo: "Um fiscal passa um dia na empresa e o gerente e dois engenheiros acompanham a visita." },
      { id: "despesas_capital", nome: "Despesas de capital decorrentes da norma", modelo: "valor",
        definicao: "Investimentos em infraestrutura ou mudanças estruturais exigidos pela regulamentação.",
        exemplo: "Uma norma de acessibilidade exige rampas e elevador no prédio comercial." },
      { id: "notificacao", nome: "Notificação", modelo: "trabalho",
        definicao: "Tempo gasto para comunicar formalmente eventos específicos a uma autoridade, conforme exigido pela lei.",
        exemplo: "Preparar e enviar a notificação de um vazamento de dados à ANPD, como exige a LGPD." },
      { id: "permissao", nome: "Permissão", modelo: "trabalho",
        definicao: "Trabalho interno para preparar, solicitar e renovar licenças e alvarás. A taxa da licença em si é um custo financeiro direto.",
        exemplo: "O tempo do assistente administrativo preenchendo formulários e indo à prefeitura renovar o alvará." },
      { id: "processual", nome: "Processual", modelo: "trabalho",
        definicao: "Tempo para criar e operar novos processos internos exigidos pela regulamentação, sem relatórios externos.",
        exemplo: "Uma regra sanitária exige rastreabilidade de todos os lotes de alimentos produzidos." },
      { id: "publicacao", nome: "Publicação e documentação", modelo: "trabalho",
        definicao: "Tempo para criar documentos, relatórios ou manuais que precisam ser disponibilizados a terceiros.",
        exemplo: "Elaborar e publicar um Relatório de Impacto Ambiental (RIMA) para um novo empreendimento." },
      { id: "registros", nome: "Registros", modelo: "trabalho",
        definicao: "Tempo contínuo para manter e arquivar documentos e registros pelo período que a lei exige.",
        exemplo: "Uma clínica precisa manter prontuários de pacientes arquivados por 20 anos." },
      { id: "treinamento", nome: "Treinamento/capacitação", modelo: "treinamento",
        definicao: "Custo de treinar funcionários para entender e cumprir as novas regras, incluindo as horas fora da produção.",
        exemplo: "Um curso obrigatório de segurança do trabalho, mais as horas da equipe em treinamento." },
      { id: "outros_conformidade", nome: "Outros (conformidade)", modelo: "valor",
        definicao: "Qualquer outro custo interno gerado pela necessidade de cumprir a regulamentação.",
        exemplo: "Um seguro que se tornou obrigatório, ou reuniões internas para discutir a nova norma." }
    ]
  },
  {
    id: "financeiro",
    nome: "Custos Financeiros Diretos",
    subcategorias: [
      { id: "impostos", nome: "Impostos", modelo: "valor",
        definicao: "Valores cobrados sobre produtos, serviços ou lucro que surgem ou aumentam por causa da nova regulamentação.",
        exemplo: "Um novo imposto sobre bebidas açucaradas, para uma fábrica de refrigerantes. Se o imposto já existia, informe só o aumento." },
      { id: "taxas", nome: "Taxas", modelo: "valor",
        definicao: "Valores pagos por um serviço específico prestado pelo governo, como emissão de documento ou fiscalização obrigatória.",
        exemplo: "Uma norma aumenta a frequência das vistorias da vigilância sanitária e, com isso, o total de taxas." },
      { id: "emolumentos", nome: "Emolumentos", modelo: "valor",
        definicao: "Valores cobrados por cartórios ou órgãos públicos para registrar, formalizar ou emitir certidões.",
        exemplo: "A norma passa a exigir registro em cartório de todos os contratos de aluguel de equipamentos." },
      { id: "outorgas", nome: "Outorgas", modelo: "valor",
        definicao: "Pagamento por permissões ou concessões para explorar um bem público ou prestar um serviço.",
        exemplo: "Direito de uso de uma frequência de rádio, ou de exploração de minério em uma área." },
      { id: "tarifas", nome: "Tarifas", modelo: "valor",
        definicao: "Aumento no preço de serviços públicos (água, energia, pedágio) causado pela regulamentação.",
        exemplo: "Uma regra ambiental encarece o tratamento de água e a conta da empresa sobe." },
      { id: "outros_financeiro", nome: "Outros custos diretos", modelo: "valor",
        definicao: "Qualquer outro valor que sai diretamente do caixa para cumprir a regulamentação.",
        exemplo: "Contribuições obrigatórias a fundos setoriais, selos ou lacres de controle, multas no período de adaptação." }
    ]
  }
];
