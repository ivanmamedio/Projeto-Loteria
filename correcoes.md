# AUDITORIA E CORREÇÕES DO PROJETO JOGO NA HORA

## 1. PAPEL E OBJETIVO

Atue como engenheiro de software sênior, especialista em desenvolvimento frontend, JavaScript, segurança de aplicações web, estatística, acessibilidade, desempenho e qualidade de código.

Projeto: Jogo na Hora.

Site publicado:
https://ivanmamedio.github.io/Projeto-Loteria/

Repositório público:
https://github.com/ivanmamedio/Projeto_loteria

Antes de executar qualquer alteração, verifique qual é o repositório realmente utilizado no projeto e qual branch publica o site. Se a URL do repositório estiver incorreta ou inacessível, não presuma que encontrou o código correto.

O objetivo é auditar o projeto existente, identificar problemas reais, implementar correções justificadas e validar os resultados.

NÃO reconstrua o projeto do zero.
NÃO substitua funcionalidades existentes sem necessidade.
NÃO adicione dependências sem justificativa.
NÃO crie funcionalidades apenas para tornar o projeto aparentemente mais completo.

## 2. REGRAS DE EXECUÇÃO

Siga esta ordem:

FASE 1 — Inspecionar o repositório.
FASE 2 — Documentar os problemas encontrados.
FASE 3 — Definir as correções prioritárias.
FASE 4 — Implementar as correções.
FASE 5 — Executar testes.
FASE 6 — Revisar as alterações e produzir um relatório final.

Antes de editar arquivos:

1. Examine a estrutura do repositório.
2. Leia o README e a documentação existente.
3. Examine os arquivos de configuração, dependências e workflows.
4. Identifique a tecnologia e a arquitetura realmente utilizadas.
5. Identifique como o GitHub Pages publica o site.
6. Examine os arquivos HTML, CSS, JavaScript e os dados históricos.
7. Localize as funções responsáveis pela geração de jogos, estatísticas, histórico e exportação.
8. Verifique se existem testes automatizados.
9. Verifique o estado do Git e preserve as alterações preexistentes do desenvolvedor.
10. Identifique funcionalidades incompletas, duplicadas ou abandonadas.

Não sobrescreva arquivos com alterações locais não relacionadas à tarefa.

Não faça commit, push, publicação ou alteração de configurações remotas sem autorização explícita.

## 3. AUDITORIA FUNCIONAL

Verifique todas as funcionalidades existentes no site.

### 3.1. Gerador de jogos

Teste:

- Seleção da modalidade.
- Quantidade de jogos solicitada.
- Seleção manual de dezenas.
- Seleção automática de dezenas.
- Estratégias disponíveis.
- Janela de concursos utilizada na análise.
- Filtros de equilíbrio.
- Diversificação de combinações.
- Filtro de padrões de calendário.
- Botão para limpar a seleção.
- Botão para marcar dezenas.
- Validação de entradas.
- Mensagens de erro e sucesso.
- Prevenção de combinações inválidas ou duplicadas quando isso fizer parte das regras selecionadas.

Verifique se os jogos respeitam as regras oficiais de cada modalidade implementada.

Não presuma que todas as modalidades têm as mesmas regras.

Valide os limites de dezenas, a quantidade de números escolhidos e as regras específicas de cada jogo com base em fontes oficiais.

Não altere regras de modalidades sem documentação que justifique a mudança.

### 3.2. Histórico local

Verifique:

- Salvamento dos jogos.
- Recuperação dos jogos após recarregar a página.
- Identificação da modalidade e da data de geração.
- Integridade dos dados armazenados.
- Tratamento de dados inválidos ou corrompidos.
- Limpeza do histórico.
- Cópia para a área de transferência.
- Compartilhamento.
- Exportação CSV.
- Exportação para outros formatos já implementados.
- Comportamento quando o navegador não oferece determinado recurso.
- Limites de armazenamento e possíveis falhas.

Não apague o histórico automaticamente.

Se os dados locais estiverem inválidos, apresente uma mensagem compreensível e trate o problema sem provocar falhas em toda a aplicação.

Não envie os jogos armazenados localmente para servidores externos sem necessidade e sem informar claramente o usuário.

### 3.3. Interface e navegação

Teste todas as páginas e links existentes, incluindo:

- Início.
- Como funciona.
- Estatísticas.
- Dados.
- Sobre.
- Privacidade.
- Termos.
- Contribua.

Verifique também os caminhos utilizados no GitHub Pages.

Como o site é publicado em um subdiretório do domínio, links absolutos incorretos podem direcionar o usuário para páginas inexistentes.

Corrija problemas de navegação, carregamento, rotas e links quebrados sem criar uma nova arquitetura de roteamento desnecessariamente complexa.

## 4. AUDITORIA ESTATÍSTICA E DOS DADOS

Esta é uma das partes mais importantes do projeto.

O site apresenta estratégias E0–E4 e fórmulas F1–F13. Identifique suas implementações reais e compare o código com a documentação.

Não invente fórmulas para preencher lacunas.

### 4.1. Integridade dos dados

Verifique:

- Origem dos arquivos históricos.
- Integridade dos arquivos CSV.
- Codificação dos arquivos.
- Separadores e cabeçalhos.
- Formatação de datas.
- Valores ausentes.
- Concursos duplicados.
- Dezenas repetidas no mesmo concurso.
- Valores fora dos limites permitidos.
- Concursos fora de ordem.
- Quantidade de dezenas por modalidade.
- Divergências entre arquivos e estatísticas apresentadas.

Se os dados forem obtidos de arquivos oficiais da CAIXA, documente a origem e a data de atualização.

Não declare que os dados são oficiais ou estão atualizados se isso não puder ser verificado.

### 4.2. Cálculos estatísticos

Revise cada fórmula F1–F13 e cada estratégia E0–E4 existente.

Para cada uma, documente:

- Objetivo.
- Fórmula matemática.
- Entradas.
- Saídas.
- Regras de tratamento de dados.
- Casos extremos.
- Testes necessários.

Compare a implementação com a definição documentada.

Crie testes unitários para os cálculos e utilize conjuntos pequenos de dados com resultados esperados conhecidos.

Verifique se a contagem de concursos analisados representa os registros realmente utilizados no cálculo.

Não confunda quantidade de modalidades, quantidade de concursos, quantidade de dezenas e quantidade de jogos gerados.

### 4.3. Probabilidade e transparência

O site deve explicar que, em um sorteio justo, todas as combinações válidas de uma mesma modalidade e com a mesma quantidade de dezenas têm a mesma probabilidade de serem sorteadas.

Frequências históricas, números atrasados, padrões de calendário, somas e distribuição entre pares e ímpares não permitem prever com segurança o próximo resultado.

As estratégias podem organizar ou diversificar jogos, mas não devem ser apresentadas como mecanismos comprovados de aumento da probabilidade de acerto.

Se alguma função utilizar critérios heurísticos, documente suas limitações.

Não utilize inteligência artificial ou modelos preditivos apenas para aparentar sofisticação.

## 5. AUDITORIA DE SEGURANÇA

Realize uma análise defensiva do código e das configurações.

### 5.1. Informações sensíveis

Procure:

- Tokens de API.
- Senhas.
- Chaves privadas.
- Credenciais de serviços.
- Endereços de e-mail pessoais expostos sem necessidade.
- Dados pessoais em arquivos públicos.
- Informações sensíveis em comentários, logs ou documentação.
- Dados de teste que possam ser confundidos com dados reais.

A chave PIX de contribuição não deve ser classificada automaticamente como uma senha ou credencial. Avalie sua exposição e confirme se o usuário pretende publicá-la.

Não remova a chave PIX automaticamente: informe os riscos e preserve a funcionalidade, salvo se houver uma razão concreta para alterá-la.

Se encontrar uma credencial verdadeira exposta, informe a gravidade e recomende sua revogação ou rotação.

### 5.2. Segurança frontend

Verifique:

- Uso de `innerHTML` e outros mecanismos de inserção de conteúdo.
- Possíveis vulnerabilidades de XSS.
- Tratamento de dados importados.
- Validação de entradas.
- Uso inseguro de URLs.
- Dependências externas.
- Scripts de terceiros.
- Políticas de segurança aplicáveis à hospedagem estática.
- Exposição desnecessária de informações.
- Uso de `eval` ou mecanismos equivalentes.

Não considere a validação no frontend suficiente para proteger serviços externos.

Não implemente backend, autenticação ou banco de dados se o projeto não precisar deles.

### 5.3. Dependências

Examine as dependências existentes e identifique vulnerabilidades conhecidas.

Utilize ferramentas compatíveis com o gerenciador de pacotes existente.

Não atualize indiscriminadamente todas as dependências.

Evite alterações que possam quebrar a compatibilidade ou aumentar significativamente o tamanho do projeto.

Se não houver ferramentas ou condições para verificar uma vulnerabilidade, registre essa limitação em vez de afirmar que tudo está seguro.

## 6. AUDITORIA DOS FORMULÁRIOS E DO CONTEÚDO

Verifique os depoimentos exibidos na página inicial.

Se não houver evidências de que são reais e autorizados, recomende removê-los ou substituí-los por demonstrações verificáveis das funcionalidades.

Não invente usuários, avaliações, números de utilização ou resultados.

Examine o formulário de recebimento da planilha por e-mail.

Se não houver integração funcional, corrija a promessa de envio ou recomende remover o formulário.

Se houver coleta de e-mails, verifique:

- Finalidade da coleta.
- Consentimento.
- Transparência sobre o uso dos dados.
- Política de privacidade.
- Segurança da integração.
- Mecanismo de cancelamento.
- Eventual compartilhamento com terceiros.

Não crie serviços pagos nem infraestrutura adicional sem necessidade.

Examine os textos comerciais e informativos para evitar promessas de ganhos, previsões garantidas ou alegações estatísticas sem fundamento.

## 7. INTERFACE E EXPERIÊNCIA DO USUÁRIO

Melhore o visual existente sem reconstruir o site desnecessariamente.

Referência estética: interfaces modernas, minimalistas e bem acabadas, com inspiração nos princípios de simplicidade visual da Apple.

Não copie layouts, marcas ou componentes proprietários de outros sites.

### Diretrizes visuais

- Fundo predominantemente claro.
- Paleta de cores discreta e consistente.
- Contraste suficiente entre texto e fundo.
- Tipografia legível.
- Botões visualmente bem resolvidos.
- Espaçamento consistente.
- Hierarquia visual clara.
- Formulários fáceis de compreender.
- Cards utilizados somente quando melhorarem a organização.
- Ícones consistentes.
- Feedback visual para ações.
- Estados de carregamento, sucesso e erro.
- Aparência consistente em todas as páginas.

### Acessibilidade

O site também precisa ser confortável para pessoas mais velhas e usuários com baixa visão.

Priorize:

- Texto principal de tamanho confortável, preferencialmente próximo de 18 px.
- Contraste adequado, seguindo WCAG 2.2 nível AA quando aplicável.
- Botões e áreas clicáveis amplos.
- Labels claros nos campos.
- Foco visível na navegação por teclado.
- Uso correto de títulos e landmarks HTML.
- Mensagens de erro compreensíveis.
- Não depender apenas das cores para comunicar estados.
- Respeitar a preferência por movimento reduzido.
- Evitar textos pequenos, fontes excessivamente finas e animações desnecessárias.
- Evitar informações importantes escondidas em menus difíceis de encontrar.

Não sacrifique a legibilidade em favor da aparência.

### Responsividade

Teste o layout em:

- Celulares estreitos.
- Celulares comuns.
- Tablets.
- Notebooks.
- Monitores grandes.

Corrija rolagem horizontal indevida, elementos sobrepostos, botões cortados e campos difíceis de utilizar.

## 8. DESEMPENHO E SIMPLICIDADE

O projeto deve continuar leve, fácil de hospedar e simples de manter.

Examine:

- Tamanho dos arquivos.
- Repetição de código.
- Cálculos desnecessários.
- Manipulação excessiva do DOM.
- Carregamento de recursos externos.
- Imagens pesadas.
- Scripts bloqueantes.
- Processamento de arquivos históricos.
- Possíveis gargalos na geração de jogos.

Não introduza frameworks, bibliotecas ou serviços externos quando JavaScript e CSS já resolverem o problema adequadamente.

Não transforme uma aplicação estática simples em uma arquitetura complexa sem justificativa técnica.

Prefira funções pequenas, nomes claros, responsabilidades bem definidas e documentação objetiva.

## 9. SEO E CONFIABILIDADE

Revise:

- Título de cada página.
- Meta description.
- Hierarquia dos títulos.
- Links internos.
- URLs canônicas, quando aplicáveis.
- Open Graph.
- Favicon.
- Sitemap e robots.txt, se apropriados.
- Página de erro ou tratamento de rotas inexistentes.
- Textos alternativos das imagens.
- Conteúdo duplicado.
- Links quebrados.

Não invente resultados de loteria, estatísticas, depoimentos ou informações institucionais para melhorar o posicionamento.

Deixe clara a independência do projeto e a ausência de vínculo oficial com a CAIXA.

## 10. TESTES OBRIGATÓRIOS

Crie ou amplie testes utilizando ferramentas compatíveis com a estrutura atual.

Priorize testes para:

1. Validação de entradas.
2. Regras de cada modalidade.
3. Geração de combinações válidas.
4. Seleção manual e automática.
5. Tratamento de entradas inválidas.
6. Cálculos estatísticos.
7. Leitura e validação de CSV.
8. Dados ausentes e duplicados.
9. Persistência do histórico.
10. Exportação dos jogos.
11. Funções de compartilhamento.
12. Navegação entre páginas.
13. Funcionamento dos formulários.
14. Tratamento de erros.
15. Ausência de regressões nas funcionalidades existentes.

Utilize dados de teste conhecidos e resultados esperados explícitos.

Se houver testes automatizados, execute-os antes e depois das alterações.

Não declare testes aprovados sem executá-los.

Se algum teste não puder ser executado, informe o motivo.

## 11. DOCUMENTAÇÃO

Atualize somente a documentação que realmente precisar de correção.

Explique:

- Como executar o projeto localmente.
- Como executar os testes.
- Como atualizar os dados históricos.
- Como verificar as estatísticas.
- Como publicar o site no GitHub Pages.
- Quais limitações permanecem.
- Como as estratégias e fórmulas funcionam.

A documentação matemática deve corresponder ao código real.

Não crie vários arquivos redundantes.

## 12. ORDEM DE IMPLEMENTAÇÃO

Organize as correções nesta ordem:

PRIORIDADE P0 — Segurança, exposição de dados e erros que comprometem a integridade dos resultados.

PRIORIDADE P1 — Erros funcionais, cálculos incorretos, regras de loteria e falhas na geração de jogos.

PRIORIDADE P2 — Acessibilidade, legibilidade, navegação e experiência do usuário.

PRIORIDADE P3 — Desempenho, SEO, organização do código e documentação.

PRIORIDADE P4 — Melhorias opcionais que tragam benefícios mensuráveis.

Implemente apenas correções justificadas por evidências.

Não adicione funcionalidades novas antes de corrigir problemas importantes já existentes.

## 13. CRITÉRIOS DE ACEITAÇÃO

O trabalho será considerado concluído quando:

- As funcionalidades principais estiverem testadas.
- Os jogos respeitarem as regras de suas modalidades.
- Os cálculos estatísticos forem verificados.
- Os indicadores corresponderem aos dados reais.
- Os formulários apresentarem comportamento consistente com suas promessas.
- Os problemas de segurança identificados tiverem sido corrigidos ou documentados.
- O site estiver legível e utilizável em diferentes tamanhos de tela.
- Os controles puderem ser utilizados por teclado.
- Não houver regressões conhecidas nas funcionalidades preservadas.
- Os testes executados e seus resultados estiverem documentados.
- As alterações forem compatíveis com a publicação atual no GitHub Pages.

## 14. RELATÓRIO FINAL OBRIGATÓRIO

Ao terminar, apresente:

### A. Problemas encontrados
Para cada problema, informe:
- Arquivo ou página afetada.
- Evidência.
- Gravidade.
- Consequência.
- Correção aplicada.

### B. Arquivos alterados
Liste os arquivos modificados e justifique cada alteração.

### C. Testes
Informe quais testes foram executados, quais passaram, quais falharam e quais não puderam ser executados.

### D. Segurança
Informe os riscos identificados, as correções aplicadas e as limitações da auditoria.

### E. Funcionalidades preservadas
Confirme o que continuou funcionando após as mudanças.

### F. Pendências
Liste os problemas que dependem de decisão do desenvolvedor, serviço externo ou verificação manual.

### G. Próximos passos
Apresente somente as próximas ações realmente necessárias.

Não afirme que o site está completamente seguro apenas porque os testes passaram.

Não afirme que a publicação foi concluída se não tiver publicado e verificado a versão efetivamente disponibilizada.

## INSTRUÇÃO FINAL

Comece pela auditoria do código existente e pela identificação dos problemas comprovados.

Não faça uma reformulação estética completa antes de entender a estrutura atual.

Preserve o que funciona, elimine o que for comprovadamente desnecessário e corrija primeiro o que compromete a confiabilidade.

A meta é um site bonito, acessível, seguro, transparente, estatisticamente correto, rápido e fácil de manter, com o mínimo de complexidade técnica necessária.
