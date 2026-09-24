#  MGA 3D Calculator

Uma aplicação web minimalista e responsiva para cálculo rápido e preciso de custos e precificação de peças impressas em 3D. Desenvolvida para otimizar a gestão financeira da **MGA Holding**.

**[Acesse o site Aqui!](https://mgabrazil.github.io/mga-3d-calculator/)**
---

##  Sobre o Projeto

O **MGA 3D Calculator** foi criado para eliminar estimativas manuais na precificação de impressões 3D. A ferramenta considera o consumo real de filamento, o gasto energético da impressora, custos fixos extras e a mão de obra aplicada para sugerir um preço de venda com margem de lucro personalizada.

###  Funcionalidades

- **Cálculo de Filamento:** Custo proporcional ao peso gasto em gramas com base no valor do quilo ($R\$/kg$).
- **Consumo Energético:** Cálculo preciso em kWh com base na potência da impressora ($W$), tempo de impressão ($horas$ e $minutos$) e tarifa local.
- **Custos Adicionais:** Inclusão de insumos extras (embalagens, fita, adesivos) e valor fixo de mão de obra (fatiamento, pós-processamento).
- **Precificação Automática:** Definição dinâmica da margem de lucro (%) com cálculo instantâneo do valor de venda.
- **Estatísticas e Relatórios:** Exibição da distribuição percentual de custos e consumo total de energia.
- **Interface Minimalista:** Design limpo, sem distrações e totalmente responsivo para desktop e mobile.

---

##  Tecnologias Utilizadas

- **HTML5** — Estrutura semântica
- **CSS3** — Estilização minimalista e responsiva (sem frameworks externos)
- **JavaScript (ES6+)** — Lógica de cálculo reativa em tempo real

---

##  Estrutura do Projeto

```text
mga-3d-calculator/
├── index.html   # Estrutura principal da página
├── styles.css   # Estilização visual minimalista
└── app.js       # Lógica e cálculos em JavaScript
