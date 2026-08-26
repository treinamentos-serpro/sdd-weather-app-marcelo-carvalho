# Weather App — Product Specification

## 1. Overview

- Produto: aplicação web para consulta de clima com foco em velocidade, clareza e uso mobile.
- Objetivo principal: permitir que qualquer pessoa pesquise uma cidade e visualize clima atual e previsão de 5 dias de forma simples.
- Público-alvo prioritário:
  - Viajante em trânsito.
  - Pessoa que organiza o dia.
  - Usuário que planeja a semana.
- Contexto de uso:
  - Mobile-first, com suporte consistente em desktop.
  - Uso rápido, sem autenticação e sem backend próprio.
- Fonte de dados definida: Open-Meteo (geocoding + forecast).
- Idioma da interface: pt-BR.
- Unidade padrão inicial: Celsius.

## 2. Functional Requirements

### FR-01 — Busca de localidade

- O sistema deve permitir que o usuário pesquise localidade por texto.
- A busca deve ser executada por ação explícita do usuário (tecla Enter ou clique no botão de busca).
- A busca deve retornar até 5 resultados ordenados por relevância da API de geocoding.
- Em caso de nomes ambíguos, o sistema deve apresentar contexto suficiente para diferenciar resultados (ex.: país e/ou estado).
- O termo de busca deve ser normalizado antes da consulta com as regras:
  - Remover espaços no início e no fim (trim).
  - Substituir múltiplos espaços internos por espaço único.
  - Preservar acentos e caracteres alfabéticos do termo original.

### FR-02 — Seleção de localidade e carregamento de dados

- Após selecionar uma localidade, o sistema deve carregar os dados meteorológicos correspondentes.
- A seleção de uma nova localidade deve substituir os dados anteriormente exibidos.
- Em cenários de múltiplas requisições concorrentes, o sistema deve garantir consistência de "última ação do usuário prevalece" (last action wins).

### FR-03 — Exibição do clima atual

- O sistema deve exibir as condições atuais da localidade selecionada.
- A visualização de clima atual deve incluir obrigatoriamente:
  - Nome da localidade selecionada com contexto geográfico (estado e/ou país).
  - Temperatura atual.
  - Sensação térmica.
  - Umidade relativa do ar.
  - Velocidade do vento.
  - Estado do tempo representado de forma textual e visual (ícone).
  - Horário de referência da medição retornado pela API.

### FR-04 — Exibição da previsão de 5 dias

- O sistema deve exibir previsão para 5 dias no total.
- O período de 5 dias deve ser: hoje + 4 dias subsequentes.
- A definição de "hoje" e dos dias subsequentes deve usar o fuso horário da localidade selecionada, conforme dados da API.
- Cada dia da previsão deve apresentar obrigatoriamente:
  - Referência do dia (nome do dia da semana e data).
  - Temperatura mínima e temperatura máxima.
  - Estado do tempo representado de forma textual e visual (ícone).
  - Probabilidade de precipitação.

### FR-05 — Alternância de unidade de temperatura

- O usuário deve poder alternar entre Celsius e Fahrenheit.
- A unidade selecionada deve ser aplicada de forma consistente em todos os pontos da interface que exibem temperatura.
- A exibição de temperatura deve usar arredondamento para inteiro mais próximo e sufixo explícito de unidade (°C ou °F).
- A unidade escolhida deve ser persistida localmente no navegador e restaurada ao reabrir a aplicação.
- Quando não houver preferência salva, a unidade inicial deve ser Celsius.

### FR-06 — Estados de carregamento, vazio e erro

- O sistema deve informar visualmente quando está carregando dados.
- O sistema deve informar claramente quando não houver resultados para a busca.
- O sistema deve informar claramente quando houver falha de rede, timeout ou resposta inválida da API.
- Em estado de erro, o sistema deve permitir uma ação explícita de nova tentativa (retry), direta ou por nova busca.
- Em caso de resposta parcial, o sistema deve exibir os dados disponíveis e sinalizar de forma explícita os dados indisponíveis.
- A atualização dos dados deve ocorrer somente por ação do usuário (nova busca, nova seleção ou retry), sem polling automático.

## 3. User Stories

### US-01

Como Viajante em trânsito, quero pesquisar uma cidade de destino, para decidir rapidamente roupa e itens de viagem antes de sair.

- Conecta com: FR-01.

### US-02

Como Pessoa que organiza seu dia, quero selecionar uma localidade e carregar seus dados meteorológicos, para consultar informações corretas do lugar certo sem confusão.

- Conecta com: FR-02.

### US-03

Como Pessoa que organiza seu dia, quero visualizar o clima atual da cidade selecionada, para tomar decisões rápidas sobre deslocamento e rotina.

- Conecta com: FR-03.

### US-04

Como Usuário de planejamento de semana, quero visualizar a previsão de hoje mais quatro dias, para antecipar atividades externas e compromissos da semana.

- Conecta com: FR-04.

### US-05

Como Usuário de planejamento de semana, quero alternar entre Celsius e Fahrenheit em toda a interface, para interpretar temperaturas no formato que conheço.

- Conecta com: FR-05.

### US-06

Como Viajante em trânsito, quero receber feedback claro de carregamento, vazio e erro durante a consulta, para entender o estado da aplicação e conseguir tentar novamente sem recarregar a página.

- Conecta com: FR-06.

## 4. Acceptance Criteria

### AC para FR-01 (Busca de localidade)

1. AC-01.1
  - Given o usuário preenche um termo de busca não vazio.
  - When aciona Enter ou clique no botão de busca.
  - Then o sistema envia uma requisição de geocoding com o termo normalizado.
2. AC-01.2
  - Given a API retorna uma lista de resultados de geocoding.
  - When a lista é exibida.
  - Then o sistema mostra no máximo 5 resultados selecionáveis.
3. AC-01.3
  - Given existem múltiplas localidades com o mesmo nome no retorno.
  - When a lista de resultados é exibida.
  - Then cada item apresenta contexto geográfico para desambiguação (país e/ou estado).
4. AC-01.4
  - Given o campo de busca está vazio ou contém apenas espaços.
  - When o usuário tenta executar a pesquisa.
  - Then o sistema não envia requisição de busca e exibe feedback de preenchimento obrigatório.
5. AC-01.5
  - Given o usuário informa "  Sao   Paulo  " no campo de busca.
  - When executa a pesquisa.
  - Then a consulta é enviada como "Sao Paulo" (sem espaços excedentes).

### AC para FR-02 (Seleção e carregamento)

1. AC-02.1
  - Given uma lista de localidades foi apresentada.
  - When o usuário seleciona uma localidade.
  - Then o sistema inicia imediatamente o carregamento dos dados meteorológicos dessa localidade.
2. AC-02.2
  - Given já existe uma localidade com dados exibidos na tela.
  - When o usuário seleciona outra localidade.
  - Then o sistema substitui os dados anteriores pelos dados da nova localidade.
3. AC-02.3
  - Given duas requisições de clima foram disparadas em sequência para localidades diferentes.
  - When a resposta da primeira requisição chega depois da segunda.
  - Then a interface mantém apenas os dados da segunda localidade selecionada.

### AC para FR-03 (Clima atual)

1. AC-03.1
  - Given os dados da localidade foram carregados com sucesso.
  - When o painel de clima atual é renderizado.
  - Then a temperatura atual é exibida com valor numérico e unidade explícita.
2. AC-03.2
  - Given os dados da localidade foram carregados com sucesso.
  - When o painel de clima atual é renderizado.
  - Then o estado do tempo é exibido de forma compreensível (texto e/ou ícone).
3. AC-03.3
  - Given os dados da localidade foram carregados com sucesso.
  - When o painel de clima atual é renderizado.
  - Then o horário de referência da medição é exibido em formato legível.
4. AC-03.4
  - Given os dados da localidade foram carregados com sucesso.
  - When o painel de clima atual é renderizado.
  - Then são exibidos sensação térmica, umidade relativa e velocidade do vento, cada um com sua unidade.

### AC para FR-04 (Previsão de 5 dias)

1. AC-04.1
  - Given os dados de previsão foram carregados com sucesso.
  - When a seção de previsão é exibida.
  - Then o sistema mostra exatamente 5 dias, cobrindo hoje e os próximos 4 dias.
2. AC-04.2
  - Given a previsão de 5 dias está visível.
  - When o usuário observa qualquer item diário.
  - Then cada item mostra referência temporal (data e/ou nome do dia) e temperaturas representativas com unidade coerente.
3. AC-04.3
  - Given a previsão de 5 dias está visível.
  - When o usuário observa qualquer item diário.
  - Then cada item exibe o estado do tempo de forma compreensível.
4. AC-04.4
  - Given a localidade selecionada possui timezone definido pela API.
  - When o sistema calcula os dias da previsão.
  - Then o recorte de "hoje + 4" respeita o fuso horário da localidade.
5. AC-04.5
  - Given a previsão de 5 dias está visível.
  - When o usuário observa qualquer item diário.
  - Then o item exibe temperatura mínima, temperatura máxima e probabilidade de precipitação em percentual.

### AC para FR-05 (Alternância de unidade)

1. AC-05.1
  - Given a interface está com unidade ativa em Celsius.
  - When o usuário altera para Fahrenheit.
  - Then todas as temperaturas exibidas na tela passam a usar Fahrenheit.
2. AC-05.2
  - Given a interface está com unidade ativa em Fahrenheit.
  - When o usuário altera para Celsius.
  - Then todas as temperaturas exibidas na tela passam a usar Celsius.
3. AC-05.3
  - Given o usuário conclui uma troca de unidade.
  - When a interface finaliza a atualização.
  - Then nenhuma região da tela mantém unidade diferente da unidade ativa.
4. AC-05.4
  - Given qualquer temperatura exibida na interface.
  - When o valor é apresentado ao usuário.
  - Then o valor é mostrado como inteiro arredondado e com sufixo de unidade (°C ou °F).
5. AC-05.5
  - Given o usuário selecionou Fahrenheit em uma sessão anterior.
  - When a aplicação é aberta novamente no mesmo navegador.
  - Then a interface inicia com Fahrenheit como unidade ativa.
6. AC-05.6
  - Given não existe preferência de unidade salva no navegador.
  - When a aplicação é aberta.
  - Then a interface inicia com Celsius como unidade ativa.

### AC para FR-06 (Loading, vazio e erro)

1. AC-06.1
  - Given uma requisição de busca ou clima foi iniciada.
  - When a resposta ainda não foi recebida.
  - Then o sistema exibe estado de carregamento visível.
2. AC-06.2
  - Given a busca foi processada sem resultados válidos.
  - When o sistema conclui o processamento da resposta.
  - Then o sistema exibe estado vazio com mensagem clara para o usuário.
3. AC-06.3
  - Given ocorre falha de rede, timeout ou erro de resposta da API.
  - When a operação é encerrada com falha.
  - Then o sistema exibe estado de erro com mensagem compreensível.
4. AC-06.4
  - Given a interface está em estado de erro.
  - When o usuário aciona retry ou realiza nova busca.
  - Then o sistema executa nova tentativa sem exigir recarregamento manual da página.
5. AC-06.5
  - Given a API retorna dados parciais para clima atual ou previsão.
  - When a resposta é processada.
  - Then o sistema exibe os blocos disponíveis e sinaliza explicitamente os blocos indisponíveis.
6. AC-06.6
  - Given dados de uma localidade já foram carregados com sucesso.
  - When o usuário permanece na tela sem interagir.
  - Then o sistema não dispara novas requisições automáticas de atualização.

## 5. Non-Functional Requirements

### NFR-01 — Performance

- O estado de loading deve ser exibido em até 200 ms após o início de qualquer requisição de dados.
- Em rede móvel estável (perfil equivalente a 4G), o tempo entre ação de busca e exibição da lista de resultados deve ser p95 <= 2 s.
- A troca de unidade (C/F) deve atualizar os valores visíveis em até 100 ms após a interação do usuário.

### NFR-02 — Usabilidade

- A interface deve ser intuitiva, com rótulos claros e fluxo direto de busca e consulta.
- O usuário deve compreender rapidamente como iniciar a busca e interpretar os resultados.

### NFR-03 — Acessibilidade

- O produto deve atender ao nível WCAG 2.1 AA para telas e fluxos do escopo inicial.
- Componentes interativos devem ser totalmente navegáveis por teclado, com foco visível.
- Elementos textuais essenciais devem ter contraste mínimo de 4.5:1.
- Informações essenciais (loading, erro, resultado) devem ser anunciadas de forma compatível com tecnologias assistivas.

### NFR-04 — Responsividade

- O layout deve priorizar mobile-first e manter legibilidade em telas pequenas.
- A experiência deve permanecer funcional e consistente em desktop.

### NFR-05 — Confiabilidade e Resiliência

- O sistema deve tratar falhas de API e rede sem apresentar tela em branco.
- O fluxo deve manter estados previsíveis em sucesso, vazio e erro.

### NFR-06 — Compatibilidade

- A aplicação deve funcionar de forma consistente nas duas versões estáveis mais recentes de Chrome, Edge e Firefox.
- Em Safari (macOS e iOS), a aplicação deve funcionar na versão estável atual e na versão imediatamente anterior.

### NFR-07 — Segurança básica

- O uso deve ocorrer em HTTPS.
- O produto não deve coletar nem expor dados sensíveis desnecessários.

### NFR-08 — Manutenibilidade

- O produto deve permitir evolução incremental com baixo risco de regressão, sustentado por organização clara de responsabilidades e testes automatizados.

## 6. Edge Cases

1. Cidade inexistente
   - Cenário: usuário pesquisa uma cidade que não existe na base de geocoding.
   - Comportamento esperado:
     - Exibir estado vazio com mensagem clara de "cidade não encontrada".
     - Não exibir dados meteorológicos de uma cidade anterior como se fossem do novo termo pesquisado.
     - Permitir nova tentativa imediata de busca.

2. Input vazio
   - Cenário: usuário tenta pesquisar com campo vazio ou apenas espaços.
   - Comportamento esperado:
     - Bloquear a submissão da busca.
     - Exibir feedback de validação solicitando preenchimento.
     - Não disparar chamada de API.

3. Caracteres especiais
   - Cenário: usuário informa busca com acentos, cedilha, hífen, apóstrofo ou símbolos comuns de localidade.
   - Comportamento esperado:
    - Aplicar normalização definida em FR-01 (trim e remoção de espaços excedentes), sem quebrar a interface.
     - Processar a consulta sem erro de execução no cliente.
     - Se não houver correspondência após processamento, exibir estado vazio claro.

4. Falha de API
   - Cenário: API responde com erro HTTP (4xx/5xx) ou erro de rede.
   - Comportamento esperado:
     - Exibir estado de erro com mensagem compreensível.
     - Não apresentar tela em branco.
     - Oferecer ação de retry e permitir nova busca manual.

5. Timeout
   - Cenário: requisição excede o tempo limite definido para resposta.
   - Comportamento esperado:
     - Encerrar estado de loading e transicionar para estado de erro.
     - Exibir mensagem indicando indisponibilidade temporária/tempo esgotado.
     - Permitir nova tentativa sem recarregar a página.

6. Geocoding sem resultados
   - Cenário: API de geocoding retorna sucesso técnico, porém lista vazia.
   - Comportamento esperado:
     - Exibir estado vazio específico para ausência de resultados.
     - Não tentar chamar forecast sem coordenadas válidas.
     - Manter o campo de busca editável para ajuste do termo.

7. Resposta parcial
   - Cenário: API retorna apenas parte dos dados necessários (ex.: sem clima atual ou sem dias suficientes de previsão).
   - Comportamento esperado:
     - Exibir os blocos com dados disponíveis e sinalizar claramente blocos indisponíveis.
     - Não quebrar renderização por campos ausentes.
     - Exibir mensagem de dados incompletos quando faltar informação essencial para FR-03 ou FR-04.

8. Cidade ambígua (mesmo nome em países/estados diferentes)
   - Cenário: busca retorna múltiplas cidades com o mesmo nome.
   - Comportamento esperado:
     - Exibir lista com contexto geográfico para cada opção.
     - Não selecionar automaticamente uma opção ambígua sem ação do usuário.

9. Alternância de unidade durante carregamento
   - Cenário: usuário troca C/F enquanto há consulta em andamento.
   - Comportamento esperado:
     - Preservar unidade escolhida ao finalizar carregamento.
     - Evitar mistura de unidades em blocos diferentes da tela.

10. Múltiplas buscas em sequência rápida
   - Cenário: usuário executa várias buscas em curto intervalo.
   - Comportamento esperado:
     - Garantir que o resultado final exibido corresponda ao termo mais recente.
     - Evitar sobrescrita por respostas atrasadas de buscas anteriores.

11. Mudança de orientação/tamanho de tela
   - Cenário: usuário muda orientação ou redimensiona a janela durante uso.
   - Comportamento esperado:
     - Manter legibilidade e usabilidade sem quebra de layout.
     - Preservar estado atual da consulta (busca, resultado, erro ou loading).

## 7. Assumptions

- O produto será uma SPA front-end sem backend próprio.
- Open-Meteo fornecerá dados necessários para geocodificação e previsão.
- A UI será em pt-BR e iniciará em Celsius quando não houver preferência salva.
- O fluxo primário é: buscar localidade -> selecionar -> visualizar clima atual e previsão de 5 dias.
- Não haverá autenticação nem persistência em servidor; a única persistência é a preferência de unidade no armazenamento local do navegador.
- Quando o armazenamento local estiver indisponível, a aplicação deve funcionar normalmente usando Celsius como padrão da sessão.
- O escopo inicial não inclui funcionalidades avançadas (ex.: alertas climáticos, mapas, histórico persistente).

## 8. Risks

- Dependência de API externa:
  - Risco: indisponibilidade ou latência alta degradar a experiência.
  - Mitigação: estados de erro claros, retry e tratamento resiliente de falhas.
- Ambiguidade geográfica:
  - Risco: seleção incorreta por nomes repetidos de cidades.
  - Mitigação: exibir contexto geográfico nos resultados de busca.
- Divergência de expectativa sobre precisão da previsão:
  - Risco: percepção de erro do produto por variações naturais da meteorologia.
  - Mitigação: comunicação clara de que se trata de previsão orientativa.
- Inconsistência mobile:
  - Risco: UX ruim em telas pequenas.
  - Mitigação: validação contínua mobile-first e critérios de responsividade.
- Cobertura incompleta de cenários de erro:
  - Risco: sensação de instabilidade e perda de confiança.
  - Mitigação: critérios explícitos para loading, vazio, erro e recuperação.

## 9. Out of Scope

- Autenticação, contas de usuário e perfis.
- Persistência de dados em servidor.
- Notificações push e alertas meteorológicos.
- Mapas climáticos, radar e camadas geoespaciais.
- Suporte offline completo.
- Integrações com calendários ou sistemas de terceiros.
- Funcionalidades de social sharing.
- Internacionalização além de pt-BR no escopo inicial.
- Geolocalização automática do usuário.
- Atualização automática periódica (polling) dos dados meteorológicos.
- Histórico de buscas e favoritos.
- Previsão por hora e previsão além de 5 dias.

## 10. Decisions

1. Campos obrigatórios do clima atual: localidade, temperatura, sensação térmica, umidade, vento, estado do tempo e horário de referência.
2. Campos obrigatórios da previsão diária: dia/data, mínima, máxima, estado do tempo e probabilidade de precipitação.
3. Geolocalização automática não faz parte do MVP; a entrada é sempre por busca manual.
4. A preferência de unidade (C/F) é persistida no armazenamento local do navegador, com Celsius como padrão inicial.
5. Não haverá atualização automática periódica; os dados são atualizados apenas por ação do usuário.

## 11. Open Questions

- Nenhuma pendência aberta. Todas as questões anteriores foram convertidas em decisões ou movidas para Out of Scope.

## 12. Traceability Matrix

| User Story | Requisito Funcional | Acceptance Criteria Relacionados | NFRs Relevantes |
| --- | --- | --- | --- |
| US-01 | FR-01 | AC-01.1, AC-01.2, AC-01.3, AC-01.4, AC-01.5 | NFR-01, NFR-02, NFR-04, NFR-05 |
| US-02 | FR-02 | AC-02.1, AC-02.2, AC-02.3 | NFR-01, NFR-02, NFR-05 |
| US-03 | FR-03 | AC-03.1, AC-03.2, AC-03.3, AC-03.4 | NFR-02, NFR-03, NFR-05 |
| US-04 | FR-04 | AC-04.1, AC-04.2, AC-04.3, AC-04.4, AC-04.5 | NFR-01, NFR-02, NFR-04, NFR-05 |
| US-05 | FR-05 | AC-05.1, AC-05.2, AC-05.3, AC-05.4, AC-05.5, AC-05.6 | NFR-01, NFR-02, NFR-05 |
| US-06 | FR-06 | AC-06.1, AC-06.2, AC-06.3, AC-06.4, AC-06.5, AC-06.6 | NFR-01, NFR-02, NFR-03, NFR-05, NFR-06 |