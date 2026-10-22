# Print3D Pro Hub 🚀
### Sistema Profissional para Gerenciamento de Impressões 3D, Calculadora de Filamentos & Simulador de Vendas em Plataformas

O **Print3D Pro Hub** é um sistema completo desenvolvido em **Nuxt 3** e **Vue 3** criado especificamente para negócios de impressão 3D, makers e vendedores de marketplaces (Mercado Livre, Shopee, Elo7, Amazon BR e Venda Direta).

---

## 🌟 Principais Funcionalidades

### 1. 🧵 Gestão e Estoque de Filamentos
- Cadastro completo de filamentos com **Marca, Material (PLA, PETG, ABS, TPU, PLA Silk, etc.), Cor visual com seletor RGB, Peso do carretel, Preço pago e Frete rateado**.
- **Cálculo automático de custo por grama (R$/g)** em tempo real.
- **Rastreador de estoque de carretel**: barra de progresso visual mostrando gramas restantes e alerta de filamento baixo.
- Pré-carregado com marcas e materiais populares no Brasil (Voolt3D, PrintaLot, 3D Fila, Creality, eSun).

### 2. 🖨️ Impressoras 3D & Custos Operacionais
- Gestão de impressoras com **potência de consumo (Watts), valor de aquisição e vida útil em horas**.
- Cálculo automático de **depreciação por hora de máquina (R$/h)** e custo de **manutenção periódica (bicos/nozzles, correias, lubrificação)**.
- Configuração do **custo da energia elétrica (R$/kWh)** baseado na sua tarifa local.
- Valor da **sua hora técnica** para fatiamento, remoção de suportes, lixamento e acabamento.
- Margem de falha / descarte de segurança (peças descoladas ou testes de calibração).

### 3. 🖩 Calculadora de Custo de Impressão (Print Job)
- Seleção de impressora e **suporte a múltiplos filamentos (Multimaterial / AMS)** para peças multicoloridas.
- Entradas de **tempo de máquina (horas e minutos)** e **tempo manual (minutos)**.
- Insumos extras (embalagem, caixa, parafusos, ímãs, cola).
- **Detalhamento do Custo Base de Fabricação**:
  - Custo exato do filamento
  - Consumo elétrico em reais
  - Depreciação da máquina
  - Desgaste de bico e manutenção
  - Mão de obra técnica
  - Embalagem e ferragens
  - Margem de risco e perda
- **Preço de Venda Direta Sugerido** com margem de lucro alvo (Markup).

### 4. 🏷️ Simulador Inteligente de Vendas em Marketplaces
- **Fórmula Reversa de Markup**: Calcula exatamente quanto você deve anunciar em cada plataforma para que, após descontadas todas as taxas, sobre o seu lucro líquido exato desejado.
- Pré-configurado com as taxas atuais do mercado brasileiro:
  - **Mercado Livre Clássico** (13.5% + taxa fixa de R$ 6,75 < R$ 79,00 + frete coparticipado > R$ 79,00)
  - **Mercado Livre Premium** (18.5% com 12x sem juros + taxa fixa + frete coparticipado)
  - **Shopee Padrão** (14% + R$ 4,00 por item)
  - **Shopee Programa Frete Grátis** (20% com teto de comissão + R$ 4,00 por item)
  - **Elo7** (18% comissão para peças de artesanato e colecionáveis)
  - **Amazon Brasil** (15% + taxa por pedido)
  - **Venda Direta / PIX / Balcão** (0% taxas)
  - **Loja Própria / Cartão de Crédito** (taxas de gateway e antifraude)
- **Simulação Interativa**: Permite digitar qualquer preço arbitrário para cada canal e ver na hora o lucro no bolso, a margem real e a viabilidade da venda (Ideal / Moderado / Prejuízo).
- Tabela comparativa lado a lado com ordenação por lucratividade.

### 5. 📋 Orçamentos Salvos & Gerador de Propostas
- Armazenamento de orçamentos com histórico e datas.
- Recarregamento com 1 clique de volta para a calculadora.
- **Gerador de Proposta Comercial Limpa**: Card profissional sem expor custos internos, pronto para **Imprimir em PDF** ou **Copiar texto formatado para o WhatsApp do cliente**.

### 6. 🔐 Autenticação Firebase & Sincronização em Nuvem Multi-Usuário
- **Isolamento Total por Usuário**: Cada usuário que faz login tem seus filamentos, impressoras, orçamentos e taxas salvos de forma estritamente separada no **Cloud Firestore** sob o caminho `users/{userId}`.
- **Login Seguro**: Suporte a **E-mail & Senha** e **Login com Google** via Firebase Authentication.
- **Configuração Fácil e Sem Complicação**: Permite colar as credenciais do Firebase diretamente pela interface no modal de configuração (ou via variáveis de ambiente no `.env`).
- **Modo Local / Convidado**: Se o Firebase não estiver configurado ou o usuário preferir usar offline, o sistema continua funcionando 100% com persistência no `localStorage`.
- **Auto-Sync**: Qualquer alteração em carretéis, taxas ou orçamentos é sincronizada automaticamente com a nuvem quando logado.

---

## 🛠️ Como Executar o Projeto

No terminal do projeto (`e:\Projetos\gerencimento3d-project`):

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev

# Ou compilar versão de produção
npm run build
npm run preview
```

Acesse: **`http://localhost:3000`** no seu navegador.
