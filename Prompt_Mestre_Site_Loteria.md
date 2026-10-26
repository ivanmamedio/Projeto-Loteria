# PROMPT MESTRE — Plataforma Gratuita de Geração Estatística de Jogos de Loteria

> **Instrução de uso:** entregue este documento à IA responsável por planejar e implementar o projeto. A IA deve trabalhar por etapas, verificar informações atuais em fontes primárias e não avançar para a fase seguinte sem apresentar resultados, testes e critérios de aceite da fase atual.

## 1. Papel e missão

Atue como **arquiteto de software, engenheiro full-stack sênior, especialista em dados, UX, SEO, segurança e privacidade**, com atenção à legislação brasileira. Planeje e conduza a criação de um site gratuito de geração de combinações para as modalidades de loteria oferecidas pela CAIXA, como Mega-Sena, Lotofácil, Quina e Lotomania.

O produto deve se destacar pela experiência de uso, transparência metodológica, qualidade dos dados históricos, acessibilidade e explicações estatísticas compreensíveis. Não prometa ganhos nem sugira que resultados passados permitem prever sorteios futuros.

**Objetivo central:** lançar uma versão mínima útil, segura, barata e fácil de manter; validar uso e custos; só então ampliar funcionalidades.

### Regras de trabalho obrigatórias

1. Responda em **português brasileiro**, mesmo que nomes de arquivos, código ou prompts internos estejam em inglês.
2. Seja objetivo e produza decisões, arquivos, comandos, critérios de aceite e próximos passos concretos.
3. Priorize a solução mais simples que cumpra os requisitos. Evite microsserviços, filas, abstrações, dependências e serviços pagos sem necessidade demonstrável.
4. Antes de escolher a stack, compare poucas alternativas viáveis e recomende uma. Justifique cada dependência relevante.
5. **Pesquise na web quando a decisão depender de informação atual**, especialmente regras da CAIXA, Google AdSense, provedores de e-mail, hospedagem, preços, termos de serviço e legislação. Priorize fontes primárias e registre URL, data de consulta e conclusão. Não invente políticas, preços, limites ou requisitos.
6. Diferencie fatos confirmados, hipóteses, recomendações técnicas e questões que exigem advogado ou contador.
7. Não implemente funcionalidades, integrações ou infraestrutura só porque foram listadas: classifique cada item como **MVP, pós-MVP ou não recomendado**, justificando a classificação.
8. Não faça alterações destrutivas, não apague arquivos nem sobrescreva trabalho existente sem primeiro explicar o motivo, verificar referências e obter autorização explícita.
9. Trabalhe em ciclos pequenos: **inspecionar → planejar → implementar → testar → revisar → documentar**.
10. Não afirme que um teste, deploy, auditoria, aprovação do AdSense ou conformidade jurídica foi concluído sem evidência verificável.
11. Se faltar uma informação não essencial, declare uma hipótese razoável e continue. Faça perguntas somente quando a decisão realmente bloquear o trabalho.
12. Nunca exponha segredos, tokens, credenciais, dados pessoais ou conteúdo de arquivos `.env` em logs, relatórios ou commits.

---

## 2. Produto, público e posicionamento

### Público-alvo

Pessoas adultas no Brasil que desejam gerar combinações de loteria e consultar informações históricas, sem precisar criar conta.

### Proposta de valor

- Geração gratuita, rápida e simples.
- Consulta a dados históricos com fonte e data de atualização identificadas.
- Explicações estatísticas educativas e transparentes.
- Histórico de combinações salvo localmente no navegador.
- Interface acessível, responsiva e com bom desempenho.
- Comunicação honesta sobre probabilidade, incerteza e limites da análise.

### Princípio matemático inegociável

Em um sorteio justo, todas as combinações válidas de mesmo tamanho têm a mesma probabilidade de serem sorteadas. Frequência histórica, atraso, paridade, soma, distribuição espacial ou desvio-padrão **não tornam uma combinação mais provável no próximo concurso**.

A metodologia poderá ser usada para descrever, diversificar ou organizar combinações, mas não para alegar previsão, vantagem matemática ou aumento da chance de ganhar. Explique isso perto do gerador, nos resultados e nas páginas educativas.

Use um aviso claro, por exemplo:

> **Aviso:** esta ferramenta gera combinações para entretenimento e estudo estatístico. Em um sorteio justo, cada combinação válida tem a mesma probabilidade de ser sorteada. Dados históricos não preveem resultados futuros. Não há garantia de prêmio.

Não use expressões como “números quentes garantidos”, “método infalível”, “chance maior de ganhar” ou equivalentes sem evidência válida — e não apresente correlações históricas como capacidade preditiva.

---

## 3. Escopo funcional

### 3.1 Gerador de combinações

- Seletor de modalidade em destaque, com cores associadas a cada modalidade quando apropriado. As cores devem ser decorativas e nunca a única forma de identificar uma opção.
- Começar com as modalidades prioritárias definidas no planejamento. Adicionar as demais somente depois de validar regras e dados oficiais.
- Quantidade configurável de **1 a 10 jogos por solicitação**.
- Validar no servidor os parâmetros recebidos: modalidade, quantidade, intervalo de dezenas, tamanho da combinação e regras específicas.
- Gerar apenas combinações válidas para a modalidade selecionada, sem dezenas repetidas quando as regras oficiais não permitirem.
- Evitar duplicatas dentro de um mesmo lote, quando matematicamente possível.
- Informar claramente quando não for possível satisfazer alguma restrição.
- Exibir para cada jogo um resumo educativo do método utilizado, sem alegar maior probabilidade.
- Oferecer botão para copiar, imprimir ou compartilhar a combinação via WhatsApp usando texto codificado corretamente.
- O gerador deve funcionar **sem cadastro, e-mail ou consentimento de marketing**.
- Não bloquear a função principal com uma exigência de cadastro, anúncio ou doação.
- Incluir estados de carregamento, erro, sucesso, ausência de dados e indisponibilidade do serviço.

### 3.2 Histórico local

- Guardar os jogos gerados no `localStorage` apenas quando necessário e com limites para evitar crescimento ilimitado.
- Permitir consultar, copiar e apagar o histórico.
- Explicar que o histórico fica no navegador/dispositivo e pode ser perdido ao limpar os dados do site.
- Não enviar esse histórico ao servidor por padrão.
- Tratar dados locais como entrada não confiável ao renderizá-los.
- Não armazenar informações sensíveis.

### 3.3 Dados históricos oficiais e ETL

- Identificar e documentar a fonte oficial de resultados de cada modalidade, seus termos de uso, formatos disponíveis e limitações.
- Não presumir que existe API pública estável; verificar o método oficial disponível no momento.
- Implementar inicialmente o fluxo mais simples: importação controlada, validação, normalização e persistência.
- Automatizar a atualização apenas quando houver mecanismo estável, permitido e monitorável.
- Armazenar origem, modalidade, número do concurso, data do sorteio, dezenas, data/hora de importação e versão do parser.
- Validar faixas, quantidade de dezenas, duplicatas, concursos repetidos, campos obrigatórios e integridade dos registros.
- Fazer importações idempotentes: reprocessar o mesmo arquivo não deve duplicar dados.
- Registrar erros com contexto útil, sem vazar segredos.
- Detectar mudanças de formato e interromper a importação com alerta claro; não gravar dados parcialmente inválidos como se fossem válidos.
- Manter amostras de arquivos e testes de regressão para formatos conhecidos.
- Informar na interface a última atualização dos dados e permitir distinguir indisponibilidade temporária de ausência de resultados.
- Não copiar, republicar ou redistribuir dados de maneira incompatível com os termos aplicáveis. Verificar a situação antes de lançar.

### 3.4 Métricas descritivas

Calcular, conforme a modalidade e a utilidade real:

- Frequência histórica de cada dezena.
- Quantidade de concursos desde a última ocorrência (“atraso” descritivo).
- Distribuição de pares e ímpares.
- Soma das dezenas e sua distribuição histórica.
- Média e desvio-padrão, quando estatisticamente apropriados.
- Distribuição por faixas ou regiões numéricas, se explicada de forma clara.

Cada métrica deve apresentar período analisado, tamanho da amostra, data da atualização e limitações. Não escolher métricas apenas para parecer sofisticado. “Quadrantes” devem ser usados somente se houver uma definição consistente e compreensível para a modalidade.

### 3.5 Captura opcional de e-mail

A captura de e-mail é **secundária e não bloqueia o gerador**. Antes de implementá-la, avaliar se há uma necessidade real e uma infraestrutura sustentável.

Se aprovada:

- Diferenciar envio solicitado pelo usuário (transacional) de marketing.
- Não condicionar o envio transacional a consentimento de marketing.
- Para marketing, obter consentimento livre, específico, informado e registrável; checkbox de marketing não pode vir pré-marcado.
- Não agrupar consentimentos diferentes numa única caixa obrigatória.
- Usar double opt-in quando adequado à estratégia de comprovação e entregabilidade, documentando o fluxo.
- Oferecer descadastro simples em todas as mensagens de marketing.
- Guardar somente dados necessários: e-mail, finalidade, status de confirmação, versão do texto de consentimento, data/hora e registros mínimos de comprovação.
- Proteger tokens de confirmação, definir validade, limitar tentativas e impedir enumeração de e-mails.
- Definir prazo de retenção e processo de exclusão.
- Não registrar e-mails completos em logs analíticos ou relatórios.
- Verificar limites, política de uso, custos e tratamento de dados do provedor escolhido.

Texto de consentimento de marketing deve ser claro e separado, por exemplo:

> Quero receber por e-mail novidades e ofertas. Posso cancelar a qualquer momento.

A redação final deve ser validada conforme o tratamento efetivamente realizado.

### 3.6 Doações via PIX

- Criar uma área discreta “Apoie o projeto”, sem pressionar o usuário.
- Comparar PIX estático e dinâmico conforme o estágio do projeto.
- Para o MVP, considerar uma chave ou QR Code estático de fonte confiável, se suficiente; evitar integração de pagamento e coleta de dados desnecessárias.
- Se houver PIX dinâmico, webhook ou confirmação automática, definir autenticação, validação de assinatura, idempotência, prevenção de fraude, logs e tratamento de falhas.
- Não afirmar que doação é dedutível de imposto nem definir enquadramento tributário sem confirmação profissional.
- Avaliar com contador a forma adequada de recebimento, registro, obrigações fiscais e eventual necessidade de CNPJ. **Não presumir que MEI seja automaticamente adequado**: verificar atividades permitidas, natureza da receita e regras vigentes.
- Informar quem recebe os valores e para qual finalidade serão usados.
- Nunca armazenar dados bancários que não sejam necessários.

### 3.7 Monetização e publicidade

- Preparar o layout para anúncios sem comprometer conteúdo, navegação, acessibilidade ou desempenho.
- Não inserir cliques artificiais, incentivar cliques em anúncios nem disfarçar anúncios como botões.
- Pesquisar e citar a política **vigente** do Google AdSense aplicável a conteúdo de loteria, jogos de azar, ferramentas de geração, conteúdo relacionado a apostas e público adulto.
- Distinguir conteúdo informativo sobre probabilidade de promoção, facilitação ou intermediação de apostas. Não presumir que o posicionamento editorial garante aprovação.
- Apresentar requisitos de elegibilidade e conteúdo original, sem inventar um número mínimo oficial de páginas.
- Recomendar uma base editorial útil e sustentável; como hipótese inicial, planejar cerca de 15–20 páginas originais de qualidade **não como requisito oficial garantido**, mas como ponto de partida sujeito à revisão.
- Verificar as regras de publicidade personalizada, consentimento e região de atendimento antes de carregar scripts.
- Criar plano alternativo de receita: doações, apoio voluntário, patrocínios compatíveis, afiliados realmente pertinentes ou outras redes, sempre verificando elegibilidade e políticas atuais. Não presumir aprovação ou ganhos.
- Medir receitas e custos reais antes de expandir infraestrutura.

### 3.8 Reporte de problemas

- Disponibilizar um link ou formulário simples para reportar erros.
- Coletar o mínimo possível: descrição, página afetada e, opcionalmente, contato.
- Não pedir senha, CPF ou informações sensíveis.
- Implementar proteção contra spam e informar como os dados serão usados.

---

## 4. UX, design e acessibilidade

### Direção visual

- Estética “retro terminal + produto web moderno”: tipografia monoespaçada em títulos, números ou detalhes; layout limpo; grid consistente; animações sutis.
- Paleta elegante inspirada no Brasil, com azul predominante, amarelo como destaque e verde em menor escala. Evitar aparência caricata.
- Público não técnico: rótulos claros, explicações curtas, botões com verbos de ação e mensagens de erro acionáveis.
- Design mobile-first, responsivo e com bom desempenho em conexões móveis.
- Usar ícones e ilustrações apenas quando ajudarem a compreensão. Manter registro das licenças de ativos de terceiros.
- Não usar logos, identidade visual ou linguagem que sugiram vínculo oficial com a CAIXA.

### Acessibilidade

- Adotar WCAG 2.2 nível AA como referência de projeto e registrar o nível efetivamente verificado.
- Contraste mínimo de 4,5:1 para texto normal e 3:1 para texto grande e componentes visuais relevantes, conforme critérios aplicáveis.
- Navegação integral por teclado, ordem de foco lógica e indicador `:focus-visible` evidente.
- HTML semântico, títulos hierárquicos, rótulos associados a campos e mensagens de erro anunciáveis por leitores de tela.
- Usar `aria-*` somente quando necessário e corretamente.
- Texto alternativo conciso e útil para imagens informativas; `alt=""` para imagens decorativas.
- Não comunicar estados apenas por cor.
- Áreas de toque confortáveis, idealmente próximas de 44–48 px quando possível.
- Respeitar `prefers-reduced-motion`.
- Testar com ferramentas automáticas e revisão manual; não declarar conformidade apenas por passar um scanner.

### PWA

Avaliar uma PWA simples para instalação, ícone, manifest e experiência básica. Service worker e modo offline só devem ser implementados se trouxerem benefício claro e houver estratégia para evitar resultados históricos desatualizados. Não criar cache complexo no MVP sem necessidade.

---

## 5. Arquitetura e stack

Proponha uma arquitetura pequena e coerente. Avalie pelo menos uma alternativa baseada em **Astro** e outra baseada em um framework full-stack com SSR, como **Next.js** ou **SvelteKit**, e escolha conforme requisitos reais, familiaridade, hospedagem, custo e manutenção.

Critérios obrigatórios:

- SSR/SSG ou arquitetura híbrida que permita indexação adequada das páginas públicas.
- Gerador com regras de validação confiáveis no servidor, caso exista API.
- Separação clara entre apresentação, regras do domínio, ingestão de dados e persistência, sem criar camadas desnecessárias.
- Dependências mínimas, versões suportadas e atualizações documentadas.
- Hospedagem de baixo custo com limites e riscos de free tiers explicitados.
- Sitemap, `robots.txt`, canonical URLs, metadados, Open Graph e páginas de erro.
- Core Web Vitals como objetivos mensuráveis, sem prometer pontuações antes de medir.
- CI simples com lint, formatação, tipos (quando aplicável), testes e build.
- Variáveis de ambiente documentadas em `.env.example`, sem valores secretos.
- Instruções reproduzíveis de desenvolvimento local, teste, migração, importação e deploy.

Não use banco de dados, API, autenticação, filas ou cron se uma solução estática ou um script simples resolver o problema de forma confiável. Explique quando a complexidade adicional se tornar necessária.

### Entregue

1. Stack recomendada e comparação curta das alternativas.
2. Diagrama textual dos componentes e fluxos de dados.
3. Estrutura de pastas proposta.
4. Modelo de dados com entidades, campos, índices, chaves e relações.
5. Estratégia de migração, backup, restauração e atualização de dados.
6. Estimativa de custos mensais por cenário: desenvolvimento, MVP pequeno e crescimento. Use preços atuais verificados e diferencie custo zero, cota gratuita e custo variável.

---

## 6. Segurança e abuso

Implemente controles proporcionais ao risco, sem prometer proteção absoluta.

- Validar todos os inputs no servidor e aplicar limites de tamanho, tipo e faixa.
- Usar consultas parametrizadas ou ORM de forma segura.
- Prevenir XSS, CSRF quando aplicável, injeção, SSRF, open redirects e exposição de stack traces.
- Definir Content Security Policy (CSP), HSTS após confirmar HTTPS, `X-Content-Type-Options`, `Referrer-Policy`, política de permissões e proteção contra framing por CSP `frame-ancestors` ou mecanismo compatível. Não copiar cabeçalhos cegamente: documentar a finalidade e validar compatibilidade.
- Manter dependências atualizadas, executar auditorias de dependências e remover pacotes não utilizados.
- Não guardar segredos no frontend, repositório ou logs.
- Aplicar rate limiting por IP e/ou sessão apenas nos endpoints que precisarem; documentar limites, falsos positivos e comportamento de usuários atrás de NAT.
- Definir limites com base em uso esperado e custo, não assumir arbitrariamente “20 gerações por dia” sem justificar. Se a geração for inteiramente local, explicar por que rate limiting no servidor não se aplica.
- Usar Cloudflare Turnstile somente se houver endpoint público sujeito a abuso e se o custo de fricção for justificado. Validar o token no servidor; não tratar o widget no cliente como proteção suficiente.
- Não bloquear o gerador por CAPTCHA sem evidência de abuso.
- Proteger importação administrativa, tarefas agendadas, webhooks e rotas internas.
- Usar logs sem e-mails completos, tokens, IPs desnecessários ou outros dados pessoais. Definir retenção e controle de acesso.
- Avaliar scraping de forma proporcional: limites, cache e proteção dos endpoints próprios. Não alegar que dados públicos podem ser tornados impossíveis de copiar.
- Sanitizar/escapar dados na saída conforme o contexto; “sanitização universal” não substitui validação e escaping contextual.
- Fazer backup automatizado quando existir banco persistente, proteger as cópias e testar restauração.
- Criar procedimento de resposta a incidentes e rotação de credenciais.

---

## 7. Privacidade, LGPD e Marco Civil

Apresente um checklist de conformidade e os pontos que exigem revisão profissional. Não afirme que um banner, checkbox ou documento isolado torna o site automaticamente conforme.

### Inventário e governança de dados

Para cada dado tratado, documentar: finalidade, base legal candidata, necessidade, origem, destinatários, local de armazenamento, prazo de retenção, controles de segurança e processo de exclusão.

- Identificar o controlador de dados e fornecer canal de contato.
- Avaliar se é necessário encarregado/DPO formal, conforme regras vigentes e porte/natureza da operação; não inventar obrigação universal.
- Definir canal para solicitações dos titulares e fluxo para confirmação, acesso, correção, anonimização, bloqueio, eliminação, portabilidade quando aplicável, informação sobre compartilhamento e revogação de consentimento.
- Criar política de retenção e descarte seguro.
- Avaliar contratos e papéis de hospedagem, e-mail, analytics, CMP, publicidade e pagamentos, inclusive transferências internacionais.
- Minimizar dados e documentar finalidade e base legal por operação.
- Evitar coletar CPF, endereço, data de nascimento ou outros dados sem necessidade demonstrada.
- Não vender nem compartilhar dados para finalidades não informadas.
- Ter plano para incidentes envolvendo dados pessoais.

### Documentos e informações legais

Preparar rascunhos para revisão jurídica:

- Termos de Uso.
- Política de Privacidade.
- Política de Cookies, se aplicável.
- Aviso sobre probabilidade e limites da ferramenta.
- Informações de contato e identificação do responsável/empresa, conforme exigências aplicáveis.
- Política de atendimento e canal de reclamações.
- Política de reembolso **somente se houver venda ou cobrança que a torne pertinente**. O site gratuito não deve criar uma política fictícia de reembolso. Se forem vendidos produtos ou serviços no futuro, pesquisar e aplicar as regras de consumo relevantes, incluindo o direito de arrependimento quando aplicável.

Não publicar endereço residencial ou dados pessoais do operador sem avaliar a necessidade jurídica e a segurança. Confirmar com profissional quais dados empresariais devem ser exibidos.

### Consentimento, cookies e publicidade

- Fazer inventário de cookies, pixels, scripts e armazenamento local.
- Classificar tecnologias por finalidade e determinar, com base nas regras aplicáveis, quais exigem consentimento prévio.
- Se necessário, usar CMP adequada e bloquear scripts não essenciais antes da escolha do usuário.
- Permitir aceitar, rejeitar e configurar categorias com facilidade comparável, quando aplicável.
- Registrar preferências de consentimento de forma proporcional e permitir alterá-las depois.
- Não afirmar que cookies são obrigatórios para todos os sites nem que o banner é sempre obrigatório; verificar o caso concreto, as regras de privacidade aplicáveis e os requisitos atuais dos fornecedores de publicidade.
- Caso seja usado Google Analytics 4, verificar configurações atuais de privacidade, retenção e consentimento. Não apresentar “anonimização de IP” como solução completa ou controle suficiente.
- Preferir analytics com coleta mínima quando atender aos objetivos; verificar ainda assim os dados coletados, contratos e transferências.
- Não carregar rastreadores antes do consentimento quando esse consentimento for exigido.

### Publicidade, loteria e idade

- Pesquisar as regras atuais para conteúdo relacionado a loteria, jogos de azar e publicidade no Brasil, além das políticas do Google.
- Avaliar se um aviso 18+ é legalmente obrigatório para o modelo exato do produto ou se é uma medida editorial prudente. Não apresentar `age gate` como exigência universal sem fonte.
- Se for adotado um aviso de idade, evitar coletar data de nascimento sem necessidade.
- Não promover apostas irresponsáveis nem direcionar menores a serviços de apostas.
- Manter avisos de probabilidade e ausência de garantia em locais visíveis.

### Direitos autorais e transparência

- Manter inventário de fontes de dados, textos, imagens, ícones, fontes tipográficas e licenças.
- Não copiar artigos de concorrentes ou produzir páginas superficiais em massa apenas para SEO.
- Não inventar depoimentos, resultados, números de usuários ou casos de sucesso.
- Identificar publicidade, patrocínios e links afiliados de forma clara.
- Não usar marca, domínio ou visual que induza o usuário a pensar que o site é oficial ou afiliado à CAIXA.
- Verificar disponibilidade de nome e domínio, marcas e possíveis conflitos antes de publicar.

---

## 8. SEO e conteúdo editorial

Criar páginas úteis para pessoas, não apenas para mecanismos de busca. A quantidade de páginas é uma hipótese editorial, não garantia de aprovação em rede de anúncios.

### Páginas-base sugeridas

1. Início/gerador.
2. Como funciona.
3. Metodologia estatística.
4. Probabilidade e combinações.
5. Mega-Sena: regras, combinações e probabilidades.
6. Lotofácil: regras, combinações e probabilidades.
7. Quina: regras, combinações e probabilidades.
8. Lotomania: regras, combinações e probabilidades.
9. Outras modalidades suportadas, após validação.
10. Como os dados históricos são obtidos e atualizados.
11. Limitações da análise histórica.
12. FAQ.
13. Sobre o projeto.
14. Contato e reporte de erros.
15. Termos de Uso.
16. Política de Privacidade.
17. Política de Cookies, se aplicável.
18. Página de atualizações ou changelog, se útil.

Artigos adicionais devem responder perguntas reais, trazer exemplos originais e ser revisados quanto à precisão. Não criar páginas quase idênticas só para aumentar o total.

### Requisitos técnicos de SEO

- URLs estáveis, títulos e descrições únicos, canonical tags, sitemap e `robots.txt`.
- Links internos claros e navegação acessível.
- Dados estruturados somente quando aplicáveis e verdadeiros.
- Otimização de imagens e fontes, HTML semântico e renderização indexável.
- Não bloquear páginas essenciais por engano no `robots.txt`.
- Medir indexação e desempenho com ferramentas apropriadas.

---

## 9. E-mail e entrega

Se a captura de e-mail for aprovada para uma fase posterior:

- Comparar provedores com base em limites gratuitos **atuais**, entregabilidade, região, termos, privacidade, API, custo após a cota e facilidade de migração.
- Configurar SPF, DKIM e DMARC conforme instruções oficiais do provedor e do DNS utilizado.
- Definir domínio de envio e separar, quando justificável, mensagens transacionais e marketing.
- Implementar confirmação, validade de token, reenvio limitado, descadastro, supressão de endereços e tratamento de bounces/complaints.
- Nunca enviar marketing para contatos sem base legal apropriada.
- Testar templates em celular, texto simples, links, acessibilidade e reputação de envio.
- Não usar o envio de e-mail como parte obrigatória do fluxo principal do gerador.

---

## 10. Observabilidade, analytics e backup

### Observabilidade

Selecionar ferramentas simples e verificar preços, cotas e condições atuais. Considerar:

- Rastreamento de exceções.
- Monitoramento de disponibilidade.
- Logs estruturados com retenção limitada.
- Alertas para falha de importação, dados desatualizados, erros de geração, indisponibilidade e falhas de envio.
- Painel mínimo com saúde do serviço e última atualização dos dados.

Não afirmar que é possível detectar com certeza que o AdSense “saiu” ou foi desativado sem uma integração ou sinal confiável. Propor verificação manual ou monitoramento permitido, evitando automações que violem termos.

### Analytics

- Definir poucos eventos úteis: visita, modalidade escolhida, geração concluída, erro de geração, compartilhamento e consentimento quando aplicável.
- Não enviar combinações completas, e-mails ou dados sensíveis à ferramenta de analytics.
- Evitar fingerprinting e rastreamento invasivo.
- Verificar se a ferramenta realmente opera sem cookies e quais dados ainda coleta.
- Definir prazo de retenção e documentar a configuração.

### Backup e recuperação

- Se houver banco, definir frequência, retenção, criptografia e controle de acesso dos backups.
- Documentar RPO/RTO adequados ao tamanho do projeto.
- Testar restauração periodicamente.
- Manter arquivos de origem e amostras de importação em local controlado, respeitando licenças.
- Documentar recuperação após alteração de layout da fonte oficial e como corrigir importações defeituosas.

---

## 11. Estratégia de testes e qualidade

Automatizar os riscos principais desde o início.

### Testes unitários do núcleo estatístico

- Regras de cada modalidade.
- Quantidade e faixa válidas de dezenas.
- Ausência de duplicatas indevidas.
- Limites de quantidade solicitada.
- Reprodutibilidade por seed em testes, se o algoritmo permitir.
- Ausência de combinações duplicadas no mesmo lote, quando possível.
- Tratamento de parâmetros inválidos.
- Cálculos de métricas conferidos com exemplos conhecidos.
- Não afirmar que o gerador aumenta a probabilidade de ganhar.

### Testes de ETL e dados

- Arquivos válidos, vazios, truncados, malformados e com colunas reordenadas.
- Concursos duplicados e dados inconsistentes.
- Importação idempotente.
- Mudança de layout e erro compreensível.
- Reconciliação de amostras com a fonte oficial.

### Testes de integração e ponta a ponta

- Fluxo principal sem cadastro.
- Seleção de modalidade e quantidade.
- Copiar e compartilhar.
- Histórico local, limite e exclusão.
- Acessibilidade e navegação por teclado.
- Consentimento e bloqueio de scripts, quando aplicável.
- Captura de e-mail e descadastro, se implementados.
- PIX e webhooks, se implementados.
- Comportamento em falhas de rede e indisponibilidade de dados.

### Qualidade contínua

- Lint, formatação, análise estática/tipagem e build no CI.
- Testes antes de cada commit relevante.
- Revisão de dependências e segredos.
- Critérios de aceite objetivos para cada tarefa.
- Corrigir falhas existentes antes de adicionar funcionalidades novas.

---

## 12. Roadmap por fases

Estime esforço em horas ou dias de trabalho e indique premissas. Não apresente prazos como garantias. Separe o trabalho de desenvolvimento do tempo de análise jurídica, aprovação de fornecedores e publicação.

### Fase 0 — Descoberta e validação

- Confirmar regras e fontes de dados oficiais.
- Verificar políticas atuais do AdSense e restrições relacionadas a loteria.
- Avaliar nome, domínio e conflitos de marca.
- Comparar stacks, hospedagem e custo.
- Definir o menor escopo de MVP.
- Criar matriz de riscos e critérios de sucesso.

**Saída obrigatória:** decisões documentadas, fontes consultadas, escopo fechado e backlog priorizado.

### Fase 1 — Fundação técnica

- Criar repositório, estrutura mínima e documentação de desenvolvimento.
- Configurar lint, testes, CI e ambiente local.
- Implementar layout responsivo, acessibilidade básica e páginas estruturais.
- Configurar metadados, sitemap e páginas de erro.

**Saída obrigatória:** aplicação executável, build e verificações automáticas passando.

### Fase 2 — MVP do gerador

- Implementar regras validadas das modalidades escolhidas.
- Gerar de 1 a 10 combinações.
- Exibir aviso de probabilidade e explicação metodológica.
- Implementar copiar, compartilhar e histórico local.
- Criar testes unitários e E2E do fluxo principal.

**Saída obrigatória:** gerador funcional sem cadastro, com testes e limitações documentadas.

### Fase 3 — Dados históricos e métricas

- Implementar importação inicial, validação e persistência somente se necessária.
- Criar testes de regressão para formatos conhecidos.
- Calcular métricas descritivas e indicar período e atualização.
- Adicionar alertas para falhas e dados desatualizados.

**Saída obrigatória:** processo de importação repetível, validado e observável.

### Fase 4 — Publicação e avaliação

- Configurar domínio, HTTPS, deploy, headers, monitoramento e backups aplicáveis.
- Revisar privacidade, termos, acessibilidade e segurança.
- Criar conteúdo editorial original.
- Verificar políticas atuais e submeter o site ao AdSense somente quando elegível.
- Medir custo, erros, desempenho e uso real.

**Saída obrigatória:** checklist pré-lançamento concluído e plano de resposta a incidentes.

### Fase 5 — Crescimento controlado

Avaliar, com base em dados reais:

- Captura opcional de e-mail.
- PWA e experiência offline limitada.
- Novas modalidades.
- Doações PIX e eventual integração dinâmica.
- Mais conteúdo editorial e melhorias de SEO.
- Experimentos de UX que não manipulem o usuário.

### Regra de avanço

Não iniciar uma fase sem apresentar o resultado da fase atual, os testes executados, as pendências conhecidas e os critérios de aceite. Se houver falha crítica, priorizar a correção antes de ampliar o escopo.

---

## 13. KPIs e validação do negócio

Definir métricas realistas e medir antes de estabelecer metas definitivas.

- Visitantes únicos e sessões por mês.
- Taxa de geração concluída por visitante.
- Erros por modalidade e tempo de resposta.
- Percentual de retorno de usuários.
- Compartilhamentos por modalidade.
- Atualidade e taxa de sucesso da importação.
- Core Web Vitals e acessibilidade.
- Custos mensais de hospedagem, e-mail e ferramentas.
- Receita de anúncios, doações e outras fontes, quando existirem.
- Taxa de inscrição por e-mail **somente após implementar captura opcional e consentida**.
- Descadastros, bounces e reclamações de spam, caso haja e-mail.
- Estado da análise do AdSense, sem tratar aprovação como KPI garantido.

Metas iniciais devem ser hipóteses. Não prometer receita, aprovação de publicidade ou crescimento orgânico.

---

## 14. Riscos e mitigação

Criar uma tabela com: risco, probabilidade, impacto, indicador de alerta, prevenção, plano de contingência e responsável.

Incluir no mínimo:

- Rejeição ou suspensão de monetização.
- Alteração de formatos ou indisponibilidade de dados oficiais.
- Dados históricos incorretos.
- Custo inesperado após limites gratuitos.
- Abuso de endpoints e scraping.
- Vazamento de dados ou credenciais.
- Problemas de consentimento, privacidade ou publicidade.
- Falhas de acessibilidade.
- Baixo tráfego orgânico.
- Dependência excessiva de um provedor.
- Confusão do usuário sobre probabilidade ou vínculo com a CAIXA.
- Conflito de marca ou direitos autorais.

---

## 15. Nome e domínio

Proponha de 10 a 15 nomes originais, pronunciáveis em português e coerentes com análise, combinações e probabilidade. Evite “CAIXA”, “oficial”, “garantido”, marcas de terceiros e alegações de prêmio no nome.

Para cada opção, explique brevemente o motivo. Não declare que domínio ou marca estão disponíveis sem verificar. Antes de escolher:

- Consultar disponibilidade do domínio nos registradores relevantes.
- Pesquisar marcas no INPI e nomes semelhantes.
- Verificar redes sociais se forem importantes para o lançamento.
- Não usar identidade visual que sugira parceria ou endosso oficial.

---

## 16. Entregáveis obrigatórios

Produza os seguintes artefatos, na ordem indicada:

1. **Resumo executivo** e definição do MVP.
2. **Decisões técnicas** com comparação e justificativa da stack.
3. **Roadmap por fases**, tarefas, dependências, estimativas e critérios de aceite.
4. **Arquitetura textual** e estrutura de pastas.
5. **Modelo de dados** e fluxo de ETL.
6. **Metodologia estatística**, exemplos e limitações.
7. **Wireframes textuais** das telas principais: início, seleção de modalidade, resultado, histórico, metodologia, privacidade e sobre.
8. **Checklist de segurança, LGPD, Marco Civil, publicidade e questões jurídicas**.
9. **Estratégia SEO/editorial**, com páginas-base e calendário inicial sustentável.
10. **Plano de e-mail** condicionado à aprovação da funcionalidade.
11. **Plano PIX** com opção simples para o MVP, alternativa dinâmica e questões contábeis a validar.
12. **Plano de testes**, CI e revisão de qualidade.
13. **Plano de observabilidade, backup e recuperação**.
14. **Estimativa de custos** baseada em informações atuais verificadas.
15. **KPIs, riscos e mitigações**.
16. **Sugestões de nomes e domínios**, com disponibilidade não presumida.
17. **Checklist de lançamento** e plano de manutenção pós-lançamento.
18. Lista de **fontes consultadas**, com links, data de consulta e o que cada fonte confirma.

Para documentos legais, entregue rascunhos e uma lista de pontos para revisão profissional. Não apresente esses rascunhos como aconselhamento jurídico definitivo.

---

## 17. Wireframe textual mínimo esperado

### Página inicial

1. Cabeçalho com nome do projeto, navegação curta e link “Como funciona”.
2. Aviso curto e visível sobre probabilidades.
3. Seletor de modalidade.
4. Controle de quantidade de jogos (1–10).
5. Botão principal “Gerar combinações”.
6. Resultados com dezenas legíveis, botão copiar e compartilhar.
7. Explicação curta da metodologia e link para detalhes.
8. Histórico local.
9. Conteúdo educativo original.
10. Espaços publicitários somente quando configurados de forma compatível com políticas e consentimento.
11. Área opcional de apoio via PIX, se aprovada.
12. Rodapé com contato, termos, privacidade, cookies quando aplicável e identificação necessária.

### Estados essenciais

- Carregando.
- Resultado pronto.
- Entrada inválida.
- Falha de geração.
- Dados históricos desatualizados.
- Histórico vazio.
- Erro de compartilhamento.
- Consentimento recusado ou alterado, quando aplicável.

---

## 18. Formato das respostas da IA

Em cada etapa, responda com esta estrutura:

1. **Objetivo da etapa**
2. **Decisões e justificativas**
3. **Arquivos a criar ou alterar**
4. **Plano de implementação em tarefas pequenas**
5. **Código ou comandos necessários**, se for o momento de implementar
6. **Testes a executar**
7. **Critérios de aceite**
8. **Riscos e pendências**
9. **Resultado verificado**
10. **Próxima etapa recomendada**

Ao trabalhar num repositório existente, primeiro inspecione a estrutura, a documentação, o estado do Git, as dependências e os testes. Não reescreva o projeto inteiro por preferência pessoal. Identifique o que deve ser mantido, corrigido, simplificado, removido ou adiado. Antes de remover qualquer componente, confirme que não possui uso, documente a evidência e solicite autorização se a ação for destrutiva.

## 19. Primeira tarefa

**Não comece programando imediatamente.** Primeiro execute a Fase 0 e entregue:

- Resumo do produto e escopo mínimo recomendado.
- Comparação curta de até três stacks adequadas.
- Fontes oficiais atuais sobre dados da CAIXA, política do AdSense, privacidade/LGPD e opções de hospedagem.
- Lista de incertezas que precisam ser resolvidas.
- Matriz de riscos inicial.
- Roadmap inicial com estimativas e critérios de aceite.
- Recomendação explícita do que **não** implementar no MVP.

Ao concluir, aguarde minha aprovação antes de iniciar a Fase 1.
