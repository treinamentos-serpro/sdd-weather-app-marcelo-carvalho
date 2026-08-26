# Discovery — Weather App

## Contexto

A empresa solicitou o desenvolvimento de uma aplicação web para consulta de previsão do tempo com foco em experiência simples, rápida e acessível em dispositivos móveis. O produto deve permitir que usuários localizem cidades e visualizem informações climáticas relevantes, com foco na usabilidade e na conveniência de uso em qualquer contexto.

O cenário principal de uso envolve pessoas que desejam saber rapidamente as condições climáticas de uma localidade, tanto para planejamento diário quanto para decisões rápidas antes de sair de casa. A aplicação deve ser útil em uso móvel, mas também deve manter boa experiência em telas maiores.

A proposta indica um produto com baixa complexidade operacional: sem autenticação, sem persistência em servidor e com busca em tempo real de dados climáticos. Isso reduz esforço de infraestrutura e permite uma entrega ágil com foco em experiência do usuário e confiabilidade da informação.

## Requisitos Funcionais

1. Busca por cidades
   - O usuário deve conseguir pesquisar cidades por nome.
   - A aplicação deve retornar resultados relevantes para a consulta.

2. Visualização do clima atual
   - O sistema deve exibir as condições meteorológicas atuais da cidade selecionada.
   - As informações devem incluir, no mínimo, indicadores relevantes de clima, como temperatura e estado do tempo.

3. Visualização da previsão de 5 dias
   - O usuário deve poder consultar a previsão para os próximos 5 dias.
   - A previsão deve cobrir o período de hoje mais quatro dias seguintes.

4. Alternância entre unidades de temperatura
   - O usuário deve poder alternar entre Celsius e Fahrenheit.
   - A conversão deve refletir de forma consistente em toda a interface.

## Requisitos Não-Funcionais

1. Performance
   - A aplicação deve carregar e responder rapidamente às interações do usuário.
   - A busca e a renderização dos dados devem acontecer sem atrasos perceptíveis.

2. Usabilidade
   - A interface deve ser intuitiva, com labels claros e navegação simples.
   - O usuário deve compreender rapidamente como pesquisar e visualizar os dados.

3. Acessibilidade
   - O produto deve ser utilizável por pessoas com diferentes necessidades, incluindo leitura por tecnologia assistiva e navegação por teclado.
   - O contraste, a semântica e os elementos interativos devem seguir boas práticas de acessibilidade.

4. Responsividade
   - A interface deve se adaptar a diferentes tamanhos de tela, priorizando a experiência mobile.
   - Layouts e elementos não devem quebrar em telas pequenas.

5. Confiabilidade
   - A aplicação deve tratar corretamente erros de rede, cidades não encontradas e falhas na resposta da API.
   - O usuário deve receber feedback claro quando algo não funcionar como esperado.

6. Disponibilidade
   - O serviço deve manter um nível aceitável de disponibilidade, mesmo quando a API externa apresentar instabilidade momentânea.
   - A aplicação deve oferecer feedback funcional e evitar telas em branco em falhas transitórias.

7. Compatibilidade de navegadores
   - A interface deve funcionar em navegadores modernos com suporte adequado ao CSS e ao JavaScript.
   - A experiência deve ser consistente em diferentes ambientes de uso.

8. Segurança
   - A aplicação deve operar por HTTPS e seguir práticas básicas de proteção dos dados do usuário.
   - Não deve expor informações sensíveis sem necessidade, mesmo em um produto sem autenticação.

9. Resiliência e recuperação
   - Em caso de falha de rede ou resposta incompleta, a aplicação deve reagir de forma previsível e recuperar o estado sem quebrar a experiência.
   - A interface deve manter clareza sobre o que está carregando, falhando ou sem resultado.

10. Manutenibilidade
   - O código deve ser organizado e fácil de evoluir.
   - Separação de responsabilidades, testes e componentes reutilizáveis ajudam a sustentar o produto.

## Riscos

### Riscos de negócio

- Dependência de dados externos: a qualidade da experiência depende da disponibilidade e da precisão da API de clima.
- Expectativa de usuário em relação à precisão: o usuário pode interpretar pequenas variações de previsão como falhas do produto.
- Uso mobile como prioridade: se a interface for otimizada apenas para desktop, a experiência pode ser insatisfatória em smartphones.

### Riscos técnicos

- Falta de contexto geográfico: nomes de cidade podem ser ambíguos e exigir resolução por país, estado ou coordenadas.
- Limitações de API: a API pode não oferecer suporte para alguns cenários esperados pelos usuários.
- Tratamento de erros: sem validações e feedbacks adequados, o app pode parecer instável ou quebrado.

### Riscos de produto

- Escopo mal definido: a ausência de regras claras sobre o que é "previsão do tempo" e quais dados exibir pode gerar retrabalho.
- Ambiguidade em unidades e idioma: se Celsius/Fahrenheit e texto em pt-BR não forem decididos cedo, a implementação pode divergir da expectativa do usuário.
- Falta de priorização de casos críticos: por exemplo, busca vazia, cidade inexistente e falha de rede precisam ser cobertos desde o início.

## Perguntas em Aberto

1. Qual é a fonte exata de dados de clima e quais campos da resposta serão exibidos?
2. A busca deve aceitar apenas nomes de cidades ou também países, estados e localidades alternativas?
3. O produto precisa suportar geolocalização automática ou apenas busca manual?
4. Quais elementos da previsão são obrigatórios na tela principal: temperatura, ícone, umidade, vento, sensação térmica ou outros?
5. Como o sistema deve se comportar quando a cidade não for encontrada?
6. A aplicação deve mostrar dados em tempo real ou apenas uma previsão consolidada com atualização periódica?
7. Há exigência de suporte a acessibilidade mais profunda, como alto contraste, redução de movimento e leitura por screen readers?
8. A aplicação deve funcionar apenas em navegadores modernos ou também em dispositivos mais antigos?
9. A busca deve ser instantânea, ou pode haver uma etapa de envio e carregamento de resultados?
10. O produto precisa incluir histórico de buscas ou persistência de preferências do usuário?

## Suposições

- A aplicação será uma web app front-end, sem necessidade de backend próprio.
- A API de clima escolhida oferecerá dados suficientes para atender o caso de uso principal.
- Os usuários buscam informações rápidas e objetivas, sem necessidade de filtros complexos ou configurações avançadas.
- A priorização será mobile-first, mas o layout também deve funcionar em desktop.
- A interface será em português do Brasil, com unidade padrão em Celsius.
- O fluxo principal será: digitar cidade → visualizar clima atual → consultar previsão de 5 dias.
- A experiência deve ser robusta a falhas temporárias de rede, exibindo mensagens claras de erro.
- O projeto terá foco em ciclos curtos de entrega com validação contínua da experiência do usuário.

## Decisões

1. Fonte de dados: Open-Meteo
   - Justificativa: a API é gratuita, não exige chave de acesso e oferece dados de geocodificação e previsão adequados para a proposta de produto.
   - Resolve: define a fonte principal de clima e reduz a incerteza sobre disponibilidade e viabilidade técnica.

2. "5 dias" = hoje + 4 dias
   - Justificativa: a definição deixa o escopo temporal objetivo e evitá ambiguidades na interpretação da previsão.
   - Resolve: elimina dúvida sobre o período exato coberto pela previsão.

3. Unidade padrão: Celsius
   - Justificativa: Celsius é mais natural para usuários do Brasil e para a maioria do mercado nacional, além de ser a unidade padrão da maior parte das experiências de clima local.
   - Resolve: define a unidade inicial da interface e reduz a inconsistência entre a escolha do usuário e as informações exibidas.

4. Sem autenticação e sem persistência de servidor
   - Justificativa: o produto atende a um caso de uso simples e sem necessidade de dados pessoais ou armazenamento do lado do servidor, o que acelera a entrega e reduz a complexidade de infraestrutura.
   - Resolve: simplifica o modelo de produto e elimina a necessidade de desenho de login, sessão e persistência em backend.

5. Idioma da UI: pt-BR
   - Justificativa: a linguagem da interface deve acompanhar o público alvo e o contexto do projeto, oferecendo maior clareza e aderência ao uso nacional.
   - Resolve: remove ambiguidades de idioma e orienta a estrutura das labels, mensagens e textos de interação.

## Ambiguidades e Lacunas do Briefing

A seguir, a visão crítica de um Product Manager cético sobre o briefing original:

1. Definição de escopo de busca
   - Ambiguidade: o briefing diz apenas que o usuário deve poder "buscar cidades", mas não informa se a busca aceita apenas cidades, ou também estados, países, regiões e localidades com nomes repetidos.
   - Pergunta em aberto: a busca deve suportar apenas cidades ou também outras localidades geográficas?
   - Impacto: sem resposta, pode haver múltiplos resultados contraditórios, muita fricção para o usuário e problemas de interpretação da API.

2. Critérios de sucesso da funcionalidade de clima
   - Ambiguidade: o documento não detalha quais informações devem aparecer no clima atual e na previsão de 5 dias.
   - Pergunta em aberto: quais dados são obrigatórios na interface: temperatura, sensação térmica, umidade, velocidade do vento, ícone, etc.?
   - Impacto: o produto pode ser entregue com dados insuficientes para o usuário, ou com uma interface que parece incompleta.

3. Comportamento em caso de ausência de resultado
   - Ambiguidade: o briefing não define como a aplicação deve agir quando a cidade não for encontrada.
   - Pergunta em aberto: a interface deve sugerir buscas próximas, mostrar mensagem de erro clara ou indicar alternativas?
   - Impacto: sem regra, o usuário pode ficar perdido, e a experiência pode parecer quebrada ou pouco profissional.

4. Definição de atualização de dados
   - Ambiguidade: não fica claro se o sistema deve mostrar clima em tempo real, dados sincronizados em intervalos fixos ou uma previsão estática.
   - Pergunta em aberto: a aplicação deve consultar a API em tempo real a cada carregamento ou atualizar automaticamente no intervalo?
   - Impacto: decisões diferentes geram custo técnico, consumo de rede e expectativa de usuário divergentes.

5. Geolocalização e contexto do uso
   - Ambiguidade: o briefing menciona uso em dispositivos móveis, mas não diz se há suporte a localização automática.
   - Pergunta em aberto: a aplicação deve usar geolocalização para prever a cidade do usuário ou apenas buscar manualmente?
   - Impacto: sem essa definição, pode haver retrabalho na UX, nos testes e na arquitetura de integração.

6. Regras de conversão de unidades
   - Ambiguidade: o app deve alternar entre Celsius e Fahrenheit, mas não especifica se a alternância deve afetar apenas a temperatura principal ou todos os dados exibidos.
   - Pergunta em aberto: a conversão deve ser global na interface ou apenas aplicada a alguns elementos?
   - Impacto: a experiência pode ficar inconsistente e gerar confusão na leitura do clima.

7. Níveis de acessibilidade esperados
   - Ambiguidade: o briefing menciona uso em dispositivos móveis, mas não detalha requisitos de acessibilidade.
   - Pergunta em aberto: a aplicação precisa atender padrões mínimos de acessibilidade, como contraste, foco visível, navegação por teclado e leitura por screen reader?
   - Impacto: sem esse alinhamento, a interface pode ser tecnicamente funcional, porém não inclusiva e inadequada para alguns usuários.

8. Suporte a navegadores e dispositivos
   - Ambiguidade: não fica claro se o produto precisa funcionar apenas em navegadores modernos ou em uma gama maior de dispositivos.
   - Pergunta em aberto: há suporte obrigatório para iOS Safari, Android Chrome e desktop em navegadores recentes?
   - Impacto: sem definição, a equipe pode escolher suporte insuficiente, gerando regressões e insatisfação de usuários.

9. Persistência e histórico de uso
   - Ambiguidade: o briefing define ausência de persistência em servidor, mas não informa se o cliente pode guardar histórico local ou preferências do usuário.
   - Pergunta em aberto: a aplicação deve lembrar últimas cidades pesquisadas ou manter a unidade escolhida entre visitas?
   - Impacto: uma decisão errada pode afetar UX, testes de usabilidade e arquitetura do client-side.

10. Entendimento do público-alvo
   - Ambiguidade: o briefing sugere "usuários" em geral, mas não identifica perfis de uso ou contexto principal.
   - Pergunta em aberto: o produto prioriza viajantes, pessoas no cotidiano urbano, usuários que planejam atividades externas ou qualquer pessoa com necessidade de informação meteorológica rápida?
   - Impacto: sem perfil claro, a interface e as priorizações podem refletir prioridades incorretas e gerar retrabalho em design e desenvolvimento.

## Mapa de Riscos

| Risco | Probabilidade | Impacto | Estratégia de mitigação |
| --- | --- | --- | --- |
| Falta de disponibilidade da API externa | Média | Alto | Implementar tratamento de erro, fallback visual e mensagens adequadas para falhas de rede ou indisponibilidade. |
| Dados geográficos ambíguos (ex.: cidades com nomes repetidos) | Alta | Médio | Usar geocodificação com suporte a estado/país e exibir opções de resultado quando houver múltiplos matches. |
| Inconsistência de UI entre dispositivos | Média | Médio | Priorizar mobile-first, validar em navegadores e tamanhos de tela diferentes e manter design responsivo. |
| Latência alta na consulta de previsão | Média | Médio | Otimizar carregamento, reduzir chamadas redundantes e mostrar estados de loading claros. |
| Expectativa do usuário divergente da precisão dos dados | Média | Médio | Definir claramente quais informações são exibidas e comunicar que a previsão é orientativa, não precisa exata. |
| Falha de UX em cenários de erro | Alta | Alto | Garantir feedbacks explícitos para cidade não encontrada, falha de rede e carregamento indefinido. |
| Escopo mal definido para a funcionalidade | Média | Alto | Documentar decisões e critérios de aceite antes do desenvolvimento para evitar retrabalho. |

## Personas e Objetivos

### 1. Viajante em trânsito
- Objetivo principal: verificar rapidamente o clima do destino antes de sair de casa ou de embarque.
- Contexto de uso: mobile, em ambiente urbano, em momentos rápidos e com necessidade de decisão imediata.
- Métrica de sucesso: conseguir consultar a previsão em menos de 10 segundos e entender rapidamente se precisará de roupa leve, agasalho ou guarda-chuva.

### 2. Pessoa que organiza seu dia
- Objetivo principal: saber se o clima do dia será adequado para trabalho, lazer ou deslocamento.
- Contexto de uso: mobile e desktop, em momentos de rotina diária, com foco na praticidade e na clareza da informação.
- Métrica de sucesso: consultar clima atual e previsão do dia sem precisar navegar em menus complexos ou interpretar dados técnicos.

### 3. Usuário de planejamento de semana
- Objetivo principal: checar o panorama da semana e decidir sobre atividades externas, viagens ou compromissos.
- Contexto de uso: desktop em casa ou no trabalho, com foco em comparação visual e previsibilidade de tendências.
- Métrica de sucesso: visualizar a previsão de 5 dias com facilidade e comparar condições entre os próximos dias sem esforço.

## Auto-crítica do Discovery

Como arquiteto de soluções, o documento já conseguiu estruturar o problema e reduzir muitas incertezas, mas ainda existem pontos que precisam de atenção antes de avançar para a especificação funcional com segurança.

### O que ainda está vago

- O escopo exato da busca por cidade ainda permite interpretações diferentes, especialmente em casos de nomes repetidos ou localidades regionais.
- Não ficou definido o conjunto mínimo de campos meteorológicos obrigatórios para a tela principal, o que pode gerar discussões de UI e retrabalho de implementação.
- O comportamento esperado em falhas de rede e em cidades inexistentes é descrito, mas ainda pode ser mais preciso em termos de UX e mensagens.
- A comunicação da "precisão" do dado meteorológico não está explicitamente definida, o que pode gerar discordância entre expectativa do usuário e realidade da API.

### O que pode gerar retrabalho

- Definir a interface antes de fechar os dados mínimos da previsão pode levar a revisões de layout e de componentes.
- Ambiguidade sobre geolocalização e atualização automática pode impactar diretamente a arquitetura de integração com a API.
- Regras de conversão de unidade e de idioma podem exigir ajustes em vários componentes se não forem definidas antes da implementação.
- Falta de critérios claros sobre compatibilidade de navegadores e dispositivos pode provocar testes incompletos e correções posteriores.

### O que falta para começar a especificação com segurança

- Critérios de aceitação claros para cada funcionalidade principal.
- Lista de componentes e campos de dados esperados na tela de clima atual e na previsão de 5 dias.
- Definição explícita da experiência em estados vazios, erro e carregamento.
- Fluxo de pesquisa e seleção da cidade bem definido, com casos de sucesso e falha.
- Ajustes finais de UX para mobile-first e acessibilidade.

Em resumo, o projeto já está em um estado bom para seguir para a especificação, mas ainda precisa de algumas decisões de detalhe para reduzir risco de retrabalho e aumentar a previsibilidade da implementação.

## Resumo Executivo

1. O produto será uma aplicação web de clima focada em busca rápida de cidades, clima atual e previsão de 5 dias.
2. A experiência prioriza mobile, simplicidade e clareza, com unidade padrão em Celsius e interface em pt-BR.
3. A solução usará Open-Meteo como fonte de dados, sem autenticação e sem backend próprio.
4. Os principais riscos estão na dependência de API externa, ambiguidade de busca e falhas de UX em cenários de erro.
5. Com decisões bem definidas e foco em usabilidade, a aplicação pode ser entregue de forma ágil, acessível e alinhada às necessidades do usuário.

## Conclusão

O briefing deixa clara a intenção do produto, mas ainda há lacunas relevantes que exigem decisão antes do desenvolvimento em larga escala. A maior parte do risco está na ambiguidade da experiência do usuário, especialmente em busca, resposta da API, comportamento em erro e definição do que faz parte da previsão relevante. Resolver essas dúvidas cedo reduz retrabalho, melhora a consistência da interface e minimiza o risco de entregar uma solução funcional, mas pouco alinhada às expectativas de negócio.
