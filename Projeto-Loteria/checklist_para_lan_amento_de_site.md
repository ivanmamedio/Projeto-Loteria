# Checklist Completo para Lançamento de Sites e Sistemas Web (Com Foco em IA)

Este documento reúne todas as boas práticas de **conformidade legal (LGPD/CDC)**, **acessibilidade (WCAG)**, **segurança**, **infraestrutura** e **transparência** para o lançamento seguro e eficiente de aplicações web.

---

## 1. Mapeamento do Vídeo: Checklist Inicial

Abaixo estão os pontos diretamente citados pelo criador no vídeo, organizados por categoria:

### 📄 Documentação Legal e Conformidade
- [ ] **Política de Privacidade:** Adicionar e disponibilizar no site.
- [ ] **Termos de Uso:** Incluir as regras do serviço.
- [ ] **Política de Reembolso:** Definir regras para devoluções.
- [ ] **Dados Legais:** Adicionar informações oficiais da empresa (ex: CNPJ e endereço).
- [ ] **Leis Brasileiras Aplicáveis:** Revisar a conformidade geral com a legislação nacional.

### 🔒 Consentimento e Gestão de Dados (LGPD)
- [ ] **Consentimento de Cookies:** Configurar aviso e permissões de rastreamento.
- [ ] **Formulários conforme LGPD:** Revisar a captação de dados em formulários.
- [ ] **Minimização de Dados:** Coletar apenas o estritamente necessário.
- [ ] **Solicitação de Exclusão:** Permitir que o usuário solicite a exclusão de seus dados.
- [ ] **Revisão do Google Analytics:** Ajustar o rastreamento do Analytics às normas de privacidade.
- [ ] **Scripts e Terceiros:** Verificar scripts de rastreamento e integrações externas.

### ♿ Acessibilidade e Usabilidade
- [ ] **Auditoria de Acessibilidade:** Fazer uma varredura geral de acessibilidade.
- [ ] **Textos Alternativos (Alt Text):** Adicionar descrições para imagens.
- [ ] **Contraste de Cores:** Corrigir problemas de visualização e contraste.
- [ ] **Navegação pelo Teclado:** Garantir que o site seja operável sem mouse.
- [ ] **Botões Claros:** Tornar os botões fáceis de entender.

### 🛡️ Credibilidade e Direitos
- [ ] **Depoimentos:** Remover depoimentos ou avaliações falsas.
- [ ] **Promessas de Venda:** Remover promessas de resultados sem comprovação.
- [ ] **Direitos Autorais:** Verificar a licença de uso das imagens utilizadas.

---

## 2. Complementos e Boas Práticas Adicionais

Abaixo estão as adições essenciais que não foram citadas no vídeo, garantindo proteção jurídica, técnica e operacional avançada:

### 🛠️ Segurança da Informação (Cybersecurity)
- [ ] **Certificado SSL/HTTPS:** Garantir criptografia ativa em todo o site.
- [ ] **Firewall e Proteção DDoS:** Configurar serviços de proteção (ex: Cloudflare) e WAF.
- [ ] **Cabeçalhos de Segurança (HTTP Headers):** Ajustar `CSP`, `X-Frame-Options` e `HSTS`.
- [ ] **Rate Limiting em APIs:** Proteger chamadas de API e IA contra requisições abusivas.

### 📜 Transparência Jurídica Avançada
- [ ] **Aviso/Disclaimer de IA:** Informar que o conteúdo ou resposta gerada por IA pode conter imprecisões, limitando a responsabilidade do sistema.
- [ ] **Canais e Encarregado LGPD (DPO):** Exibir canal de contato para dúvidas sobre dados e indicar o responsável pelo tratamento.
- [ ] **Proteção de Menores (ECA/LGPD):** Implementar verificações de idade ou consentimento parental caso haja coleta de dados de menores.
- [ ] **Registro de Marca (INPI):** Proteger a marca e a identidade visual contra plágio.

### ⚡ Infraestrutura e SEO Técnica
- [ ] **Rotina de Backups:** Automatizar cópias periódicas do banco de dados e arquivos.
- [ ] **Página de Erro / Manutenção:** Ter páginas amigáveis para erros 404 e momentos de indisponibilidade.
- [ ] **Performance (Core Web Vitals):** Otimizar o tempo de carregamento de páginas e imagens.
- [ ] **SEO Técnico (`robots.txt` / `sitemap.xml`):** Configurar arquivos de indexação para motores de busca.