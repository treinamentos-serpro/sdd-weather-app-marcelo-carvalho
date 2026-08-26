# Weather App — Backlog de Tarefas

Este documento transforma o plano técnico em tarefas pequenas, dependentes e verificáveis. Cada tarefa abaixo foi revisada para ter critérios de aceite objetivos, testáveis e rastreáveis aos requisitos da spec.

## Entrega 1 — Contratos, funções puras e service

### T-01 — Definir contratos de domínio (`City`, `WeatherData` e `Unit`)
- Descrição curta: estabelecer o modelo compartilhado do app e alinhar o domínio com as exigências da spec.
- Critérios de aceite:
  - `src/types/weather.ts` expõe `City`, `CurrentWeather`, `ForecastDay`, `WeatherData` e `Unit` com os campos exigidos por FR-01 a FR-05 e AC-03/AC-04.
  - `City` inclui `timezone` e `admin1?`; `current` e `forecast` podem ser `null` para suportar AC-06.5 e EC-07.
  - Nenhuma unidade de exibição é armazenada no modelo; o domínio permanece em Celsius/km/h como determina o plano.
  - A estrutura aceita `current` e `daily` ausentes sem quebrar a tipagem nem a lógica do app.
- Dependências: Nenhuma.
- Arquivos prováveis: `src/types/weather.ts`
- Tipo: Data

### T-02 — Implementar funções puras de conversão e formatação
- Descrição curta: criar utilitários para conversão e apresentação de temperatura, data e códigos WMO.
- Critérios de aceite:
  - `src/lib/temperature.ts` converte Celsius para Fahrenheit e formata strings com sufixo em °C/°F; cobrir casos de 0 °C, negativos e arredondamento conforme AC-05.4.
  - `src/lib/format.ts` formata datas e horas em pt-BR e percentuais com `Intl`, atendendo AC-03.3 e AC-04.2.
  - `src/lib/weatherCodes.ts` retorna label + ícone para códigos WMO conhecidos e fallback para códigos desconhecidos, coberto por AC-03.2 e AC-04.3.
  - Os testes unitários para estas funções passam sem mock de DOM ou rede.
- Dependências: T-01
- Arquivos prováveis: `src/lib/temperature.ts`, `src/lib/format.ts`, `src/lib/weatherCodes.ts`, `tests/unit/temperature.test.ts`, `tests/unit/format.test.ts`, `tests/unit/weatherCodes.test.ts`
- Tipo: Data

### T-03 — Implementar `weatherService.searchCities` com validação e limite de resultados
- Descrição curta: encapsular o geocoding da Open-Meteo e mapear a resposta para `City[]`.
- Critérios de aceite:
  - `searchCities(query, signal?)` normaliza o termo, usa `AbortSignal` e retorna no máximo 5 `City` válidas conforme FR-01 e AC-01.2.
  - Itens sem `latitude`, `longitude` ou `timezone` são descartados antes de retornar a lista.
  - `results` ausente ou vazio devolve `[]`; a operação não dispara forecast e a UI entra em estado `empty`, coberto por AC-06.2 e EC-06.
  - O teste contempla termo com espaços extras e resposta com mais de 5 itens, validando AC-01.5 e EC-03.
- Dependências: T-01
- Arquivos prováveis: `src/services/weatherService.ts`, `tests/unit/weatherService.test.ts`
- Tipo: Data

### T-04 — Implementar `weatherService.fetchWeather` com mapeamento parcial e erros do serviço
- Descrição curta: buscar e normalizar `current` + `forecast`, tratando resposta parcial e falhas de API.
- Critérios de aceite:
  - `fetchWeather(city, signal?)` monta a URL com `latitude`, `longitude`, `timezone` e `forecast_days=5`, alinhando com FR-02, FR-03 e FR-04.
  - Blocos `current` ou `daily` ausentes produzem `null` em vez de quebrar a interface, conforme AC-06.5 e EC-07.
  - O serviço lança `WeatherError` com `kind` em `network`, `timeout`, `http` e `invalid-response`, atendendo EC-04, EC-05 e EC-07.
  - Casos com `daily` em arrays paralelos de tamanhos divergentes são tratados sem exceção e sem quebrar a renderização.
- Dependências: T-01, T-03
- Arquivos prováveis: `src/services/weatherService.ts`, `tests/unit/weatherService.test.ts`
- Tipo: Data

## Entrega 2 — Estado, busca e unidade

### T-05 — Implementar o reducer de `useWeather` para status e transições
- Descrição curta: modelar o estado principal do app, incluindo `idle`, `loading`, `success`, `empty` e `error`.
- Critérios de aceite:
  - O hook expõe `status`, `results`, `data`, `error` e `retry()` como definidos no contrato do plano.
  - Há uma única união discriminada para os estados (`status`) e não flags booleanas redundantes, coberto por FR-06 e §7.2.
  - `SEARCH_START` e `SELECT_START` limpam dados anteriores antes de iniciar a nova carga, atendendo AC-02.2 e EC-01.
  - O fluxo de transição tem cobertura explícita para `idle → loading → success/empty/error`.
- Dependências: T-01, T-04
- Arquivos prováveis: `src/hooks/useWeather.ts`
- Tipo: Data

### T-06 — Implementar `search(term)` e last-action-wins com cancelamento de request
- Descrição curta: tratar a busca por cidade e o cancelamento de requisições concorrentes.
- Critérios de aceite:
  - `search(term)` normaliza o valor com `trim` e redução de espaços internos, preservando acentos, e aborta a requisição anterior conforme AC-01.5 e EC-03.
  - A mudança para `loading` acontece no mesmo tick da ação do usuário sem debounce artificial.
  - Se duas buscas forem disparadas, a resposta mais antiga é descartada e o resultado da mais recente vence, respondendo AC-02.3 e EC-10.
  - Há teste que valida `search` de duas cidades em sequência e prevalência da segunda resposta.
- Dependências: T-03, T-05
- Arquivos prováveis: `src/hooks/useWeather.ts`, `tests/unit/useWeather.test.ts`
- Tipo: Data

### T-07 — Implementar `select(city)` para buscar clima e manter retry funcional
- Descrição curta: executar a seleção da cidade e recarregar os dados do clima atual + previsão.
- Critérios de aceite:
  - `select(city)` chama `fetchWeather(city)` e dispara `loading` sem manter dados antigos visíveis, atendendo AC-02.1 e AC-02.2.
  - O hook rejeita respostas fora do contrato e preserva a última ação para `retry()`, seguindo AC-06.4.
  - `retry()` reexecuta a última ação do usuário sem recarregar a página e sem perder o estado do form de busca.
  - Há teste cobrindo `retry()` após falha ou response parcial.
- Dependências: T-04, T-05, T-06
- Arquivos prováveis: `src/hooks/useWeather.ts`, `tests/unit/useWeather.test.ts`
- Tipo: Data

### T-08 — Implementar `useUnit` com persistência e fallback seguro
- Descrição curta: controlar a unidade ativa e salvar a preferência em `localStorage`.
- Critérios de aceite:
  - `useUnit` inicia em Celsius quando o storage está vazio e restaura `fahrenheit` quando existir valor salvo, atendendo AC-05.5 e AC-05.6.
  - `setUnit(unit)` persiste a escolha em `localStorage` e re-renderiza sem disparar requisições.
  - Quando o browser bloqueia `localStorage`, a app cai para Celsius em sessão sem quebrar; isso cobre o Assumption §7.
  - O teste valida fallback para valor inválido e para `localStorage` lançando exceção.
- Dependências: T-01, T-02
- Arquivos prováveis: `src/hooks/useUnit.ts`, `tests/unit/temperature.test.ts` ou `tests/unit/useUnit.test.ts`
- Tipo: Data

## Entrega 3 — UI base, busca e estados transversais

### T-09 — Montar layout principal da aplicação (`App`) e composição dos blocos
- Descrição curta: estruturar a tela principal com os componentes de busca, lista e clima.
- Critérios de aceite:
  - `App.tsx` compõe `SearchBar`, `SearchResults`, `CurrentWeather` e `ForecastList` em um único fluxo, alinhado ao fluxograma de §5.
  - A tela inicial, loading, empty, error e success têm rota de renderização explícita e nunca resultam em branco, atendendo NFR-05.
  - O tema dark glassmorphism é aplicado pelo `index.css` sem quebras de responsividade em mobile.
- Dependências: T-05, T-07, T-08
- Arquivos prováveis: `src/App.tsx`, `src/styles/index.css`
- Tipo: UI

### T-10 — Implementar `SearchBar` com validação e feedback acessível
- Descrição curta: permitir a entrada do termo e bloquear busca vazia.
- Critérios de aceite:
  - Submit com campo vazio ou só espaços não dispara request e mostra mensagem de erro, conforme AC-01.4 e EC-02.
  - O input aceita Enter e clique em botão e permanece acessível por teclado.
  - O componente usa label/role e mantém foco de forma compatível com NFR-03.
- Dependências: T-09
- Arquivos prováveis: `src/components/SearchBar.tsx`, `tests/unit/SearchBar.test.tsx`
- Tipo: UI

### T-11 — Implementar `SearchResults` com listagem e seleção por ação do usuário
- Descrição curta: exibir até 5 resultados com contexto geográfico e sem seleção automática.
- Critérios de aceite:
  - A lista renderiza no máximo 5 cidades e mantém a ordem retornada pela API, seguindo FR-01 e AC-01.2.
  - Cada item apresenta país e `admin1` quando houver, permitindo desambiguação conforme AC-01.3 e EC-08.
  - A seleção ocorre via clique/tecla do usuário e não por auto-seleção; nenhum item deve ser escolhido em background.
- Dependências: T-06, T-09, T-10
- Arquivos prováveis: `src/components/SearchResults.tsx`, `tests/unit/SearchBar.test.tsx` ou `tests/unit/SearchResults.test.tsx`
- Tipo: UI

### T-12 — Implementar estados reutilizáveis de loading, vazio e erro
- Descrição curta: criar componentes transversais para os estados de interface.
- Critérios de aceite:
  - `LoadingState`, `EmptyState` e `ErrorState` são reutilizáveis e não dependem de estado global.
  - `role="status"` e `role="alert"` estão presentes em regiões `aria-live`, conforme NFR-03 e AC-06.x.
  - `ErrorState` expõe ação de retry que chama a última ação executada, atendendo AC-06.3 e AC-06.4.
  - Os componentes mostram texto em pt-BR e não deixam a tela em branco.
- Dependências: T-09, T-10, T-11
- Arquivos prováveis: `src/components/states/LoadingState.tsx`, `src/components/states/EmptyState.tsx`, `src/components/states/ErrorState.tsx`
- Tipo: UI

## Entrega 4 — Clima atual, previsão e unidade na UI

### T-13 — Implementar o painel de clima atual
- Descrição curta: mostrar os dados climáticos atuais da cidade selecionada.
- Critérios de aceite:
  - `CurrentWeather` renderiza temperatura, sensação térmica, umidade, vento, horário e condição, cobrindo FR-03 e AC-03.1 a AC-03.4.
  - `weatherCode` é traduzido por `weatherCodes.ts` para texto + ícone e há fallback para código desconhecido.
  - Quando `current` vier `null`, o componente renderiza aviso explícito e não quebra a previsão do dia, conforme AC-06.5 e EC-07.
- Dependências: T-02, T-04, T-09, T-12
- Arquivos prováveis: `src/components/CurrentWeather.tsx`, `tests/unit/weatherCodes.test.ts`
- Tipo: UI

### T-14 — Implementar `ForecastList` e `ForecastCard` para 5 dias
- Descrição curta: renderizar o resumo da previsão diária com card por dia.
- Critérios de aceite:
  - A lista renderiza exatamente 5 cards quando a previsão completa estiver disponível, obedecendo FR-04 e AC-04.1.
  - Cada card mostra min, max, probabilidade de chuva e condição do dia de acordo com AC-04.3 e AC-04.5.
  - Datas são formatadas em pt-BR conforme `timezone` da cidade, sem deslocamento de fuso ou vazamento de índices da API.
  - Quando houver menos de 5 dias, a UI exibe os disponíveis e sinaliza a lacuna em vez de quebrar o layout.
- Dependências: T-02, T-04, T-09, T-12
- Arquivos prováveis: `src/components/ForecastList.tsx`, `src/components/ForecastCard.tsx`, `tests/unit/format.test.ts`
- Tipo: UI

### T-15 — Implementar `UnitToggle` e integrar conversão na renderização
- Descrição curta: permitir a troca de unidade conforme a preferência do usuário.
- Critérios de aceite:
  - O toggle expõe `aria-pressed`, `aria-label` e sincroniza com a unidade ativa, atendendo FR-05.
  - Todas as temperaturas exibidas usam `formatTemperature(valor, unit)`, nunca formatação manual em cada componente.
  - A troca de unidade não dispara request e mantém o valor em Celsius no estado, satisfazendo AC-05.3 e NFR-01.
  - O valor salvo sobrevive a reload no navegador, cobrindo AC-05.5 e AC-05.6.
- Dependências: T-02, T-08, T-13, T-14
- Arquivos prováveis: `src/components/UnitToggle.tsx`, `tests/unit/temperature.test.ts`, `tests/unit/App.test.tsx`
- Tipo: UI

## Entrega 5 — Testes, integração e garantia de qualidade

### T-16 — Testes unitários de conversão de unidade e service com `fetch` mockado
- Descrição curta: validar a lógica de conversão e o contrato do serviço com respostas mockadas da API.
- Critérios de aceite:
  - Há testes para conversão Celsius/Fahrenheit, arredondamento e sufixo em `temperature.test.ts`, cobrindo AC-05.4.
  - Há testes para `weatherService.searchCities` e `weatherService.fetchWeather` usando `fetch` mockado, cobrindo URL, filtro de cinco itens, respostas vazias, HTTP 500 e timeout.
  - Os testes confirmam que `results` ausente/vazio vira `[]` e que `current`/`daily` ausentes ficam `null`, conforme AC-06.2, AC-06.5 e EC-07.
  - O mock de `fetch` é usado apenas na camada de serviço; não há mock de UI ou do comportamento real do app.
- Dependências: T-02, T-03, T-04
- Arquivos prováveis: `tests/unit/temperature.test.ts`, `tests/unit/weatherService.test.ts`, `tests/setup.ts`
- Tipo: Test

### T-17 — Testes de componentes nos estados loading, erro e vazio
- Descrição curta: validar a interface observável nos principais estados de status do app.
- Critérios de aceite:
  - Há testes para `SearchBar`, `SearchResults`, `states/*`, `CurrentWeather` e `ForecastList` em loading, sucesso, erro e vazio.
  - Os componentes usam `role="status"` e `role="alert"`, com pressões de teclado/label acessíveis, cumprindo NFR-03.
  - Testes cobrem `retry` em erro, ausência de resultados e transição de UI sem tela em branco, alinhando com AC-06.1 a AC-06.4.
  - Nenhuma asserção depende de elementos mockados; os testes validam a renderização real do componente.
- Dependências: T-09, T-10, T-11, T-12, T-13, T-14
- Arquivos prováveis: `tests/unit/SearchBar.test.tsx`, `tests/unit/*.test.tsx`, `tests/setup.ts`
- Tipo: Test

### T-18 — Testes E2E do fluxo principal e viewport mobile
- Descrição curta: validar o comportamento end-to-end da aplicação em cenários críticos e responsivos.
- Critérios de aceite:
  - Fluxo feliz: buscar → selecionar → clima atual + previsão de 5 dias, cobrindo AC-03.x e AC-04.1.
  - Input vazio, cidade inexistente, falha de API e resposta parcial são cobertos em rotas interceptadas.
  - Troca C/F e viewport mobile (390×844) entram na suíte, atendendo AC-05.1/05.3 e NFR-04.
  - Os testes usam `page.route`/fixtures e não exigem rede real, mantendo execução determinística.
- Dependências: T-09, T-10, T-11, T-12, T-13, T-14, T-15, T-16, T-17
- Arquivos prováveis: `tests/e2e/weather.spec.ts`, `playwright.config.ts`
- Tipo: Test

### T-19 — Preparar o ambiente de E2E e configurar browser matrix
- Descrição curta: preparar fixtures e configuração do Playwright para validação end-to-end.
- Critérios de aceite:
  - `playwright.config.ts` inclui `chromium`, `firefox` e `webkit`, atendendo NFR-06.
  - Os endpoints são interceptados com fixtures determinísticas para fluxos normal, vazio, ambíguo, parcial e erro.
  - O cenário mobile (390×844) e teclado ficam prontos para execução reproduzível.
- Dependências: T-09, T-10, T-11, T-12, T-13, T-14, T-15
- Arquivos prováveis: `playwright.config.ts`, `tests/e2e/weather.spec.ts`
- Tipo: Infra

### T-20 — Cobrir erros de rede, timeout e payload inválido no service e hook
- Descrição curta: validar cenários críticos de falha e resposta parcial para robustez do fluxo.
- Critérios de aceite:
  - O service trata HTTP 4xx/5xx, `AbortError`/timeout e `TypeError` em `WeatherError` apropriado, cobrindo EC-04 e EC-05.
  - O hook mantém `status='error'` para falha total ou `status='success'` para resposta parcial, sem quebrar a interface.
  - Casos com `current` ou `daily` ausentes não disparam erro total; assim, `WeatherData.current`/`forecast` ficam `null` e o app segue com o bloco disponível.
  - Há testes próprios para todos esses cenários, sem mock de UI e sem regressão de comportamento.
- Dependências: T-04, T-06, T-07, T-12, T-16
- Arquivos prováveis: `src/services/weatherService.ts`, `src/hooks/useWeather.ts`, `tests/unit/weatherService.test.ts`, `tests/unit/useWeather.test.ts`
- Tipo: Infra

### T-21 — Validar qualidade final com lint, build e testes
- Descrição curta: rodar a verificação final antes de fechar a entrega do app.
- Critérios de aceite:
  - `pnpm lint` passa sem erro e sem warnings relevantes.
  - `pnpm build` gera artefato final estável e sem falhas de compilação.
  - `pnpm test` e `pnpm test:e2e` passam com cenários críticos verdes.
  - Qualquer regressão detectada é corrigida antes da conclusão da entrega.
- Dependências: T-16, T-17, T-18, T-19, T-20
- Arquivos prováveis: `package.json`, `vite.config.ts`, `playwright.config.ts`, `src/**`, `tests/**`
- Tipo: Infra

## Resumo de dependências

- Contratos e dados: T-01 → T-02 → T-03 → T-04
- Estado e busca: T-05 → T-06 → T-07 → T-08
- UI base: T-09 → T-10 → T-11 → T-12
- Clima e unidade: T-13 → T-14 → T-15
- Ordem de implementação final: T-16 → T-17 → T-18 → T-19 → T-20 → T-21

## Ordem de implementação recomendada

1. Tipos e contratos (`T-01`)
2. Funções puras e utilitários (`T-02`)
3. Serviços e mapeamento API (`T-03`, `T-04`)
4. Hooks e estado (`T-05`, `T-06`, `T-07`, `T-08`)
5. Componentes e integração da UI (`T-09` a `T-15`)
6. Testes unitários/componentes (`T-16`, `T-17`)
7. Testes E2E (`T-18`, `T-19`)
8. Hardening e validação final (`T-20`, `T-21`)

## Rastreabilidade resumida

| Requisito funcional | Tarefas que implementam | Observação |
| --- | --- | --- |
| FR-01 — Busca de localidade | T-03, T-06, T-10, T-11, T-18 | Cobertura completa: normalização, limite de 5 resultados, contexto geográfico e busca por ação do usuário. |
| FR-02 — Seleção e carregamento | T-05, T-06, T-07, T-09, T-18 | Cobertura completa: seleção de cidade, limpeza de dados, last-action-wins e carregamento do clima. |
| FR-03 — Clima atual | T-04, T-13, T-16, T-17, T-18 | Cobertura completa: dados atuais, texto/ícone, horário e blocos de dados disponíveis. |
| FR-04 — Previsão de 5 dias | T-04, T-14, T-16, T-17, T-18 | Cobertura completa: 5 dias, fuso da cidade, min/max, precipitação e condição do dia. |
| FR-05 — Alternância de unidade | T-02, T-08, T-15, T-16, T-17, T-18 | Cobertura completa: persistência, conversão e renderização consistente em Celsius/Fahrenheit. |
| FR-06 — Loading, vazio e erro | T-05, T-07, T-12, T-16, T-17, T-18, T-20 | Cobertura completa: estados de carregamento, vazio, erro, retry e resposta parcial. |

### Observações de rastreabilidade

- Todos os requisitos funcionais da spec possuem tarefa correspondente no backlog.
- O principal esforço de garantia de cobertura está concentrado em: T-16 (unitários de serviço/conversão), T-17 (componentes em estados críticos) e T-18/T-20 (E2E e hardening).
- Requisitos não funcionais que dependem de configuração de ambiente e validação de execução (por exemplo NFR-06 e NFR-04) são cobertos indiretamente pelas tarefas de Playwright e qualidade final: T-19, T-21.

> Nenhum requisito funcional ficou sem tarefa correspondente após a revisão. A única lacuna observada é de natureza operacional/validativa, não funcional: a execução real de browser matrix e validação de qualidade final dependem de T-19 e T-21.

## Estimativas e priorização

### Prioridade por tarefa

| Tarefa | Prioridade | Tamanho | Motivo |
| --- | --- | --- | --- |
| T-01 | P0 | S | Base do domínio; tudo depende do contrato. |
| T-02 | P0 | M | Funções puras e utilitários do app. |
| T-03 | P0 | M | Geocoding e limite de resultados essenciais para a busca. |
| T-04 | P0 | M | Busca do forecast e tratamento de resposta parcial. |
| T-05 | P0 | M | Estado central do app e transições de status. |
| T-06 | P0 | M | Lógica crítica de busca e last-action-wins. |
| T-07 | P0 | M | Seleção da cidade e retry funcional. |
| T-08 | P0 | S | Persistência e fallback de unidade. |
| T-09 | P0 | M | Estrutura base da interface. |
| T-10 | P0 | S | Busca com validação e usabilidade. |
| T-11 | P0 | M | Lista de resultados e seleção. |
| T-12 | P0 | M | Estados de carregamento/vazio/erro. |
| T-13 | P0 | M | Clima atual visível e funcional. |
| T-14 | P0 | M | Previsão de 5 dias visível e funcional. |
| T-15 | P0 | M | Toggle de unidade integrado à renderização. |
| T-16 | P1 | M | Cobertura testável da camada de dados e conversão. |
| T-17 | P1 | M | Testes de UI para estados e acessibilidade. |
| T-18 | P1 | G | E2E do fluxo principal e mobile. |
| T-19 | P1 | M | Infra de execução Playwright e browser matrix. |
| T-20 | P1 | M | Hardening de falhas e erros de integração. |
| T-21 | P2 | S | Validação final e gate de qualidade. |

### Sequência de entrega em fatias verticais

1. Fatia 1 — Fundamentos de dados e busca
   - T-01, T-02, T-03, T-05, T-06, T-10, T-11
   - Resultado visível: a aplicação consegue buscar e listar cidades relevantes.

2. Fatia 2 — Dados meteorológicos e fluxo principal
   - T-04, T-07, T-13, T-14, T-15
   - Resultado visível: o usuário seleciona uma cidade e vê clima atual + previsão com unidade funcional.

3. Fatia 3 — Experiência de uso e estados
   - T-09, T-12, T-08, T-10, T-11 (refinamento)
   - Resultado visível: feedback de carregamento, vazio e erro, além de persistência de unidade.

4. Fatia 4 — Testes e hardening
   - T-16, T-17, T-18, T-19, T-20, T-21
   - Resultado visível: confiabilidade, regressões cobertas e validação final da entrega.

### Recomendação de priorização

- P0: todas as tarefas que criam a funcionalidade mínima de valor para o usuário.
- P1: tarefas de garantia de qualidade e correção de edge cases.
- P2: validação final e gates de release.

> Essa priorização entrega valor visível cedo, sem bloquear a implementação na ausência de testes e hardening. O app atinge um MVP útil com a combinação das fatias 1 e 2, e as fatias 3 e 4 garantem confiabilidade do produto final.


| Requisito funcional | Tarefas que implementam | Observação |
| --- | --- | --- |
| FR-01 — Busca de localidade | T-03, T-06, T-10, T-11, T-18 | Cobertura completa: normalização, limite de 5 resultados, contexto geográfico e busca por ação do usuário. |
| FR-02 — Seleção e carregamento | T-05, T-06, T-07, T-09, T-18 | Cobertura completa: seleção de cidade, limpeza de dados, last-action-wins e carregamento do clima. |
| FR-03 — Clima atual | T-04, T-13, T-16, T-17, T-18 | Cobertura completa: dados atuais, texto/ícone, horário e blocos de dados disponíveis. |
| FR-04 — Previsão de 5 dias | T-04, T-14, T-16, T-17, T-18 | Cobertura completa: 5 dias, fuso da cidade, min/max, precipitação e condição do dia. |
| FR-05 — Alternância de unidade | T-02, T-08, T-15, T-16, T-17, T-18 | Cobertura completa: persistência, conversão e renderização consistente em Celsius/Fahrenheit. |
| FR-06 — Loading, vazio e erro | T-05, T-07, T-12, T-16, T-17, T-18, T-20 | Cobertura completa: estados de carregamento, vazio, erro, retry e resposta parcial. |

### Observações de rastreabilidade

- Todos os requisitos funcionais da spec possuem tarefa correspondente no backlog.
- O principal esforço de garantia de cobertura está concentrado em: T-16 (unitários de serviço/conversão), T-17 (componentes em estados críticos) e T-18/T-20 (E2E e hardening).
- Requisitos não funcionais que dependem de configuração de ambiente e validação de execução (por exemplo NFR-06 e NFR-04) são cobertos indiretamente pelas tarefas de Playwright e qualidade final: T-19, T-21.

> Nenhum requisito funcional ficou sem tarefa correspondente após a revisão. A única lacuna observada é de natureza operacional/validativa, não funcional: a execução real de browser matrix e validação de qualidade final dependem de T-19 e T-21.

- FR-01 e FR-02: T-03, T-06, T-07, T-11
- FR-03 e FR-04: T-04, T-13, T-14
- FR-05: T-02, T-08, T-15
- FR-06: T-05, T-12, T-16
- NFR-01 a NFR-08: T-02, T-08, T-09, T-12, T-17, T-21
- AC-01.x a AC-06.x, EC-01 a EC-11: distribuídos conforme os itens acima, com testes/e2e em T-16, T-18, T-19, T-20

> Observação: a revisão do backlog manteve a granularidade e reforçou critérios de aceite objetivo e rastreável, evitando itens que misturassem UI, dados e testes numa mesma tarefa sem verificabilidade clara.