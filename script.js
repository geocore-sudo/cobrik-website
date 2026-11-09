/**
 * COBRIK — SOCIEDADE UNIPESSOAL, LIMITADA
 * Master Interactive Logic & Animations · Versão 3.0
 * Slideshow 4s · Submissão de Formulário sem Sair do Site · Responsivo
 */

(() => {
  'use strict';

  /* ─────────────────────────────────────────────
     1. UTILITÁRIOS E PREFERÊNCIA DE MOVIMENTO
  ───────────────────────────────────────────── */
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

  const rafThrottle = (fn) => {
    let ticking = false;
    return (...args) => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        fn(...args);
        ticking = false;
      });
    };
  };

  /* ─────────────────────────────────────────────
     2. PRELOADER
  ───────────────────────────────────────────── */
  const initPreloader = () => {
    const preloader = $('#preloader');
    if (!preloader) return;

    window.addEventListener('load', () => {
      setTimeout(() => {
        preloader.classList.add('preloader--hidden');
        setTimeout(() => {
          if (preloader.parentNode) preloader.parentNode.removeChild(preloader);
        }, 700);
      }, 350);
    });

    // Fallback de segurança caso demore
    setTimeout(() => {
      if (preloader && !preloader.classList.contains('preloader--hidden')) {
        preloader.classList.add('preloader--hidden');
      }
    }, 2500);
  };

  /* ─────────────────────────────────────────────
     3. HEADER DYNAMICS, LOGO CLICK & MENU MOBILE
  ───────────────────────────────────────────── */
  const initHeader = () => {
    const header = $('.header');
    const toggle = $('#menu-toggle');
    const nav = $('#nav-principal');
    const brandLink = $('#brand-logo-link');

    // Clicar no logo volta ao topo com suavidade
    if (brandLink) {
      brandLink.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({
          top: 0,
          behavior: prefersReducedMotion.matches ? 'auto' : 'smooth'
        });
      });
    }

    if (!header) return;

    // Header ao fazer scroll (ocultar / mostrar na direcção)
    let lastScroll = 0;
    const SCROLL_THRESHOLD = 70;

    const onScroll = rafThrottle(() => {
      if (header.classList.contains('menu-open')) return;
      const currentScroll = window.scrollY;
      if (currentScroll > SCROLL_THRESHOLD) {
        header.classList.add('header--scrolled');
      } else {
        header.classList.remove('header--scrolled');
      }

      if (currentScroll > 420 && currentScroll > lastScroll + 10) {
        header.classList.add('header--hidden');
      } else if (currentScroll < lastScroll - 10) {
        header.classList.remove('header--hidden');
      }

      lastScroll = currentScroll;
    });

    window.addEventListener('scroll', onScroll, { passive: true });

    // Menu Drawer Mobile
    if (toggle && nav) {
      const toggleMenu = () => {
        const isOpen = header.classList.toggle('menu-open');
        nav.classList.toggle('open', isOpen);
        toggle.setAttribute('aria-expanded', String(isOpen));
        document.body.classList.toggle('menu-open', isOpen);
        document.body.classList.toggle('no-scroll', isOpen);
      };

      toggle.addEventListener('click', toggleMenu);

      $$('.nav-link, .nav-mobile-cta a', nav).forEach((link) => {
        link.addEventListener('click', () => {
          if (header.classList.contains('menu-open')) {
            toggleMenu();
          }
        });
      });

      // Fechar menu mobile ao premir tecla Escape
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && header.classList.contains('menu-open')) {
          toggleMenu();
        }
      });

      // Se redimensionar acima de 768px, fecha o menu
      window.addEventListener('resize', () => {
        if (window.innerWidth > 768 && header.classList.contains('menu-open')) {
          toggleMenu();
        }
      });
    }

    // Actualizar link activo na navegação ao fazer scroll
    const sections = $$('section[id]');
    const navLinks = $$('.nav-link');

    const updateActiveNav = rafThrottle(() => {
      const scrollY = window.scrollY + 100;
      sections.forEach((sec) => {
        const top = sec.offsetTop;
        const height = sec.offsetHeight;
        const id = sec.getAttribute('id');
        if (scrollY >= top && scrollY < top + height) {
          navLinks.forEach((link) => {
            link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
          });
        }
      });
    });

    window.addEventListener('scroll', updateActiveNav, { passive: true });
  };

  /* ─────────────────────────────────────────────
     4. HERO SLIDESHOW A CADA 4 SEGUNDOS
  ───────────────────────────────────────────── */
  const initHeroSlideshow = () => {
    const slides = $$('.hero-slide');
    const dots = $$('.indicator-dot');
    if (!slides.length) return;

    let currentIndex = 0;
    let timer = null;
    const INTERVAL_MS = 4000; // Exactamente 4 segundos conforme solicitado

    const goToSlide = (index) => {
      slides[currentIndex].classList.remove('active');
      if (dots[currentIndex]) dots[currentIndex].classList.remove('active');

      currentIndex = (index + slides.length) % slides.length;

      slides[currentIndex].classList.add('active');
      if (dots[currentIndex]) dots[currentIndex].classList.add('active');
    };

    const nextSlide = () => {
      goToSlide(currentIndex + 1);
    };

    const startTimer = () => {
      stopTimer();
      timer = setInterval(nextSlide, INTERVAL_MS);
    };

    const stopTimer = () => {
      if (timer) clearInterval(timer);
    };

    // Cliques nos indicadores
    dots.forEach((dot, idx) => {
      dot.addEventListener('click', () => {
        goToSlide(idx);
        startTimer();
      });
    });

    // Pausar ao passar o rato (em ecrãs com cursor)
    const heroSection = $('#hero-slider-section');
    if (heroSection) {
      heroSection.addEventListener('mouseenter', stopTimer);
      heroSection.addEventListener('mouseleave', startTimer);
    }

    // Iniciar temporizador
    startTimer();
  };

  /* ─────────────────────────────────────────────
     5. ABAS INTERATIVAS (QUEM SOMOS & GOVERNAÇÃO)
  ───────────────────────────────────────────── */
  const initCompanyTabs = () => {
    const tabButtons = $$('.tab-btn[data-tab]');
    const tabPanes = $$('.tab-pane');
    if (!tabButtons.length || !tabPanes.length) return;

    tabButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const targetId = `tab-${btn.dataset.tab}`;

        tabButtons.forEach((b) => {
          b.classList.remove('active');
          b.setAttribute('aria-selected', 'false');
        });
        tabPanes.forEach((pane) => {
          pane.classList.remove('active');
        });

        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');
        const activePane = $(`#${targetId}`);
        if (activePane) {
          activePane.classList.add('active');
        }
      });
    });
  };

  /* ─────────────────────────────────────────────
     6. FILTRO DE SERVIÇOS TÉCNICOS
  ───────────────────────────────────────────── */
  const initServiceFilter = () => {
    const filterButtons = $$('.service-filter-btn[data-service-filter]');
    const serviceCards = $$('.service-card[data-service-cat]');
    if (!filterButtons.length || !serviceCards.length) return;

    filterButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        filterButtons.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');

        const filter = btn.dataset.serviceFilter;
        serviceCards.forEach((card) => {
          if (filter === 'all' || card.dataset.serviceCat === filter) {
            card.style.display = 'flex';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  };

  /* ─────────────────────────────────────────────
     7. FILTRO DE CAPACIDADES DE ENGENHARIA & MODAL (ESTILO METTA)
  ───────────────────────────────────────────── */
  const projectDatabase = {
    'edificacao-raiz': {
      image: 'images/project-building.jpg',
      pt: {
        title: 'Construção Civil & Edificação de Raiz',
        category: 'HABITAÇÃO MULTIFAMILIAR & RESIDENCIAL',
        location: 'Maputo & Território Nacional',
        area: '500 m² a 15.000 m²',
        status: 'Capacidade Operacional Activa',
        scope: 'Fundações, Estrutura & Turnkey',
        desc: 'Execução integral de edifícios multifamiliares, residências contemporâneas e condomínios fechados a partir de projectos de arquitectura e estabilidade. Domínio de fundações profundas e directas, superestruturas em betão armado segundo os Eurocódigos e regulamentos moçambicanos (REBAP), alvenarias nobres e coordenação global de especialidades.'
      },
      en: {
        title: 'Civil Construction & Ground-Up Building',
        category: 'MULTI-FAMILY & RESIDENTIAL HOUSING',
        location: 'Maputo & Nationwide',
        area: '500 m² to 15,000 m²',
        status: 'Active Operational Capacity',
        scope: 'Foundations, Structure & Turnkey',
        desc: 'Full execution of multi-family residential buildings, contemporary residences, and gated communities from architectural and structural designs. Mastery of deep and shallow foundations, reinforced concrete superstructures compliant with Eurocodes and REBAP regulations, high-grade masonry, and complete turnkey coordination.'
      }
    },
    'estruturas-corporativas': {
      image: 'images/project-commercial.jpg',
      pt: {
        title: 'Edifícios Comerciais & Sedes Corporativas',
        category: 'SEGMENTO CORPORATIVO & COMERCIAL',
        location: 'Maputo · Centros Empresariais',
        area: 'Pisos Múltiplos & Grandes Vãos',
        status: 'Capacidade Operacional Activa',
        scope: 'Estruturas Mistas, Acabamentos & Redes Técnicas',
        desc: 'Construção e adaptação de edifícios de escritórios, sedes empresariais e centros de serviços com elevados padrões de eficiência energética. Execução de lajes fungiformes, controlo acústico, fachadas com corte térmico e coordenação rigorosa de instalações de AVAC, dados e protecção contra incêndio.'
      },
      en: {
        title: 'Commercial Buildings & Corporate Headquarters',
        category: 'CORPORATE & COMMERCIAL SECTOR',
        location: 'Maputo · Business Districts',
        area: 'Multi-Storey & Wide Spans',
        status: 'Active Operational Capacity',
        scope: 'Composite Structures, Finishes & MEP Networks',
        desc: 'Construction and fit-out of office buildings, corporate headquarters, and commercial centers with high energy-efficiency standards. Execution of flat waffle slabs, acoustic insulation, thermal-break facades, and rigorous coordination of HVAC, data, and fire safety systems.'
      }
    },
    'reabilitacao-retrofit': {
      image: 'images/ACABAMENTO.jpg',
      pt: {
        title: 'Reabilitação Estrutural & Retrofit',
        category: 'REABILITAÇÃO & RESTAURO TÉCNICO',
        location: 'Moçambique',
        area: 'Intervenções à Medida',
        status: 'Capacidade Operacional Activa',
        scope: 'Reforço Estrutural, Diagnóstico & Patologias',
        desc: 'Intervenção técnica em estruturas degradadas por corrosão de armaduras, fissuração ou recalques diferenciais. Aplicação de argamassas tixotrópicas de alta resistência, encamisamento de elementos em betão armado, perfis metálicos estruturais e compósitos de fibra de carbono para prolongamento da vida útil dos imóveis.'
      },
      en: {
        title: 'Structural Rehabilitation & Technical Retrofit',
        category: 'TECHNICAL REHABILITATION & RESTORATION',
        location: 'Mozambique',
        area: 'Tailored Interventions',
        status: 'Active Operational Capacity',
        scope: 'Structural Strengthening, Diagnostics & Pathology',
        desc: 'Technical intervention on structures affected by rebar corrosion, cracking, or differential settlement. Application of high-strength thixotropic mortars, reinforced concrete jacketing, structural steel profiles, and carbon-fiber composites to extend building service life.'
      }
    },
    'infraestruturas-pesadas': {
      image: 'images/project-infra.jpg',
      pt: {
        title: 'Infraestruturas Viárias & Obras de Arte',
        category: 'INFRAESTRUTURAS & OBRAS PÚBLICAS',
        location: 'Província de Maputo & Vias Principais',
        area: 'Obras Viárias e Hidráulicas',
        status: 'Capacidade Operacional Activa',
        scope: 'Betão Estrutural, Contenções & Drenagem',
        desc: 'Engenharia de infraestruturas pesadas com foco em muros de suporte de terras em betão armado e gabiões, passagens hidráulicas, valas de escoamento e pavimentações estruturadas. Logística de estaleiro com maquinaria própria e controlo laboratorial sistemático de inertes e solos.'
      },
      en: {
        title: 'Road Infrastructure & Civil Engineering Works',
        category: 'INFRASTRUCTURE & PUBLIC WORKS',
        location: 'Maputo Province & Main Corridors',
        area: 'Road & Hydraulic Works',
        status: 'Active Operational Capacity',
        scope: 'Structural Concrete, Retaining Walls & Drainage',
        desc: 'Heavy infrastructure engineering focused on reinforced concrete and gabion retaining walls, culverts, stormwater drainage channels, and structured paving. In-house heavy machinery logistics and systematic laboratory testing of aggregates and soils.'
      }
    },
    'fiscalizacao-auditoria': {
      image: 'images/about-team.jpg',
      pt: {
        title: 'Fiscalização Técnica & Gestão de Empreitadas',
        category: 'DIRECÇÃO TÉCNICA INDEPENDENTE',
        location: 'Todo o País',
        area: 'Supervisão Integral de Obra',
        status: 'Serviço Permanente',
        scope: 'Auditoria de Rigor, Prazos & Normas HSE',
        desc: 'Serviços de fiscalização e assessoria técnica ao dono da obra. Verificação sistemática de cadernos de encargos, ensaios laboratoriais de compressão de betão e tracção de aços, validação de autos de medição e implementação intransigente de procedimentos de Higiene e Segurança no Trabalho (HSE).'
      },
      en: {
        title: 'Technical Supervision & Contract Management',
        category: 'INDEPENDENT TECHNICAL DIRECTION',
        location: 'Nationwide',
        area: 'Full On-Site Supervision',
        status: 'Permanent Service',
        scope: 'Quality Auditing, Schedules & HSE Standards',
        desc: 'Independent technical supervision and owner’s engineering representation. Systematic verification of tender specifications, laboratory concrete compression and steel tensile tests, validation of measurement certificates, and strict enforcement of Health, Safety, and Environment (HSE) protocols.'
      }
    },
    'orcamentacao-planeamento': {
      image: 'images/gallery-structure.jpg',
      pt: {
        title: 'Orçamentação Analítica & Engenharia de Custos',
        category: 'CONSULTORIA & PLANEAMENTO',
        location: 'Sede Maputo',
        area: 'Projectos Executivos & Concursos',
        status: 'Serviço Permanente',
        scope: 'Mapas de Quantidades & Cronogramas Gantt',
        desc: 'Elaboração detalhada de mapas de quantidades de trabalho, análise de preços compostos e orçamentos executivos sem imprevistos. Optimização do fluxo de compras técnicas, gestão de risco contratual e garantia de transparência económica entre clientes, fornecedores e direcção de obra.'
      },
      en: {
        title: 'Analytical Cost Estimation & Project Planning',
        category: 'CONSULTING & PLANNING',
        location: 'Maputo Headquarters',
        area: 'Executive Designs & Tenders',
        status: 'Permanent Service',
        scope: 'Bills of Quantities & Gantt Schedules',
        desc: 'Detailed preparation of bills of quantities (BOQ), unit price breakdowns, and contingency-free executive budgets. Optimization of technical procurement workflows, contractual risk management, and full financial transparency between clients, suppliers, and site management.'
      }
    }
  };

  const initProjects = () => {
    // Filtro
    const filterButtons = $$('.portfolio-filter-btn[data-filter]');
    const projectCards = $$('.project-card[data-category]');

    filterButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        filterButtons.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');

        const filter = btn.dataset.filter;
        projectCards.forEach((card) => {
          if (filter === 'all' || card.dataset.category === filter) {
            card.classList.remove('project-card--hidden');
          } else {
            card.classList.add('project-card--hidden');
          }
        });
      });
    });

    // Lightbox Modal
    const modals = $$('.project-modal');
    const closeBtns = $$('.modal-close-btn');
    if (!modals.length) return;

    const openProjectModal = (projectId) => {
      const entry = projectDatabase[projectId];
      if (!entry) return;

      const lang = localStorage.getItem('cobrik_lang') || 'pt';
      const data = entry[lang] || entry.pt;

      $$('#modal-img').forEach((el) => { el.src = entry.image; });
      $$('#modal-title').forEach((el) => { el.textContent = data.title; });
      $$('#modal-category').forEach((el) => { el.textContent = data.category; });
      $$('#modal-location').forEach((el) => { el.textContent = data.location; });
      $$('#modal-desc').forEach((el) => { el.textContent = data.desc; });
      $$('#modal-area').forEach((el) => { el.textContent = data.area; });
      $$('#modal-status').forEach((el) => { el.textContent = data.status; });
      $$('#modal-scope').forEach((el) => { el.textContent = data.scope; });

      modals.forEach((m) => {
        m.classList.add('active');
        m.setAttribute('aria-hidden', 'false');
      });
      document.body.classList.add('no-scroll');
    };

    const closeProjectModal = () => {
      modals.forEach((m) => {
        m.classList.remove('active');
        m.setAttribute('aria-hidden', 'true');
      });
      document.body.classList.remove('no-scroll');
    };

    projectCards.forEach((card) => {
      card.addEventListener('click', () => {
        const id = card.dataset.projectId;
        if (id) openProjectModal(id);
      });
    });

    closeBtns.forEach((btn) => btn.addEventListener('click', closeProjectModal));

    modals.forEach((m) => {
      m.addEventListener('click', (e) => {
        if (e.target === m || e.target.classList.contains('project-modal-backdrop')) {
          closeProjectModal();
        }
      });
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeProjectModal();
      }
    });
  };

  /* ─────────────────────────────────────────────
     8. FILTRO DA GALERIA DE ESTALEIRO
  ───────────────────────────────────────────── */
  const initGalleryFilter = () => {
    const filterButtons = $$('[data-gallery-filter]');
    const galleryCards = $$('[data-gallery-cat]');
    if (!filterButtons.length || !galleryCards.length) return;

    filterButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        filterButtons.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');

        const filter = btn.dataset.galleryFilter;
        galleryCards.forEach((card) => {
          if (filter === 'all' || card.dataset.galleryCat === filter) {
            card.classList.remove('gallery-card--hidden');
          } else {
            card.classList.add('gallery-card--hidden');
          }
        });
      });
    });
  };

  /* ─────────────────────────────────────────────
     9. CONTADORES ANIMADOS EM DM MONO
  ───────────────────────────────────────────── */
  const initCounters = () => {
    const counters = $$('[data-counter]');
    if (!counters.length) return;

    const animateValue = (el) => {
      const target = parseFloat(el.dataset.counter) || 0;
      const suffix = el.dataset.suffix || '';
      const format = el.dataset.format;
      const duration = 2200;
      const startTime = performance.now();

      const update = (now) => {
        const progress = Math.min((now - startTime) / duration, 1);
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const current = target * easeOut;

        if (format === 'currency') {
          el.textContent = Math.round(current).toLocaleString('pt-MZ') + ' MT';
        } else {
          el.textContent = Math.round(current) + suffix;
        }

        if (progress < 1) {
          requestAnimationFrame(update);
        }
      };

      requestAnimationFrame(update);
    };

    if (prefersReducedMotion.matches) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateValue(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.25 }
    );

    counters.forEach((el) => observer.observe(el));
  };

  /* ─────────────────────────────────────────────
     10. ANIMAÇÕES DE REVELAÇÃO NO SCROLL
  ───────────────────────────────────────────── */
  const initReveals = () => {
    if (prefersReducedMotion.matches) {
      $$('.reveal').forEach((el) => el.classList.add('in-view'));
      $$('.hero-reveal').forEach((el) => el.classList.add('hero-reveal--visible'));
      return;
    }

    // Hero reveals
    setTimeout(() => {
      $$('.hero-reveal').forEach((el, index) => {
        el.style.setProperty('--reveal-delay', `${index * 140}ms`);
        el.classList.add('hero-reveal--visible');
      });
    }, 150);

    // Section reveals
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -30px 0px' }
    );

    $$('.reveal').forEach((el) => observer.observe(el));
  };

  /* ─────────────────────────────────────────────
     11. FORMULÁRIO COM ENVIO DIRECTO SEM SAIR DO SITE (GERAL@COBRIK.CO.MZ)
  ───────────────────────────────────────────── */
  const initContactForm = () => {
    const form = $('#contact-form');
    const submitBtn = $('#btn-submit-form');
    const alertBox = $('#form-status-alert');
    const servicePills = $$('.service-pill');
    const serviceInput = $('#form-service');
    if (!form || !submitBtn) return;

    // Selector Interativo de Especialidade (Substitui o Select Comum)
    if (servicePills.length && serviceInput) {
      servicePills.forEach((pill) => {
        pill.addEventListener('click', () => {
          servicePills.forEach((p) => {
            p.classList.remove('active');
            p.setAttribute('aria-checked', 'false');
          });
          pill.classList.add('active');
          pill.setAttribute('aria-checked', 'true');
          serviceInput.value = pill.dataset.value || pill.textContent.trim();
        });
      });
    }

    const showAlert = (htmlContent, type = 'success') => {
      if (!alertBox) return;
      alertBox.innerHTML = htmlContent;
      alertBox.className = `form-status-alert visible ${type}`;
      alertBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    };

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const lang = localStorage.getItem('cobrik_lang') || 'pt';
      const isEn = lang === 'en';

      const data = new FormData(form);
      const name = (data.get('name') || '').trim();
      const phone = (data.get('phone') || '').trim();
      const email = (data.get('email') || '').trim();
      const service = (data.get('service') || (isEn ? 'Ground-Up Construction' : 'Construção Civil de Raiz')).trim();
      const location = (data.get('location') || '').trim();
      const message = (data.get('message') || '').trim();

      // Validação: apenas Nome, Telefone e Mensagem são obrigatórios (Localização é opcional)
      if (!name || !phone || !message) {
        showAlert(
          isEn
            ? '⚠️ Please fill in the required fields marked with (*): Full Name, Phone Number, and Project Description.'
            : '⚠️ Por favor preencha os campos obrigatórios assinalados com (*): Nome, Contacto Telefónico e Descrição do Projecto.',
          'error'
        );
        return;
      }

      // Estado de Carregamento (Spinner)
      submitBtn.classList.add('loading');
      submitBtn.disabled = true;

      // Email oficial de destino para recepção de propostas
      const targetEmail = 'contact@cobrik.co.mz';

      // Mensagem estruturada e formal pré-definida
      const subject = isEn
        ? `[COBRIK Engineering] Proposal Request — ${name} (${service})`
        : `[COBRIK Engenharia] Pedido de Proposta — ${name} (${service})`;
      
      const body = isEn
        ? `==================================================
CONSULTATION AND TECHNICAL PROPOSAL REQUEST
COBRIK — SOCIEDADE UNIPESSOAL, LIMITADA
==================================================

1. CONTACT INFORMATION:
• Name / Entity: ${name}
• Phone Number: ${phone}
• Professional Email: ${email || 'Not provided'}

2. PROJECT DETAILS:
• Desired Specialty: ${service}
• Expected Site Location: ${location || 'To arrange / To define'}

3. PROJECT DESCRIPTION / REQUIREMENTS:
${message}

--------------------------------------------------
Submitted via the official COBRIK website (cobrik.co.mz)
Date: ${new Date().toLocaleDateString('en-GB')}
==================================================`
        : `==================================================
SOLICITAÇÃO DE CONSULTA E PROPOSTA TÉCNICA
COBRIK — SOCIEDADE UNIPESSOAL, LIMITADA
==================================================

1. DADOS DE CONTACTO:
• Nome / Entidade: ${name}
• Contacto Telefónico: ${phone}
• Email Profissional: ${email || 'Não informado'}

2. DETALHES DO PROJECTO:
• Especialidade Pretendida: ${service}
• Localização Prevista da Obra: ${location || 'A combinar / A definir'}

3. DESCRIÇÃO DO PROJECTO / NECESSIDADES:
${message}

--------------------------------------------------
Submetido através do formulário oficial da COBRIK (cobrik.co.mz)
Data: ${new Date().toLocaleDateString('pt-PT')}
==================================================`;

      const mailtoUrl = `mailto:${targetEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

      // Breve pausa para transição suave de UI
      setTimeout(() => {
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;

        // Abre o cliente de email do utilizador com todos os campos pré-preenchidos
        window.location.href = mailtoUrl;

        // Exibe mensagem de confirmação elegante na página
        showAlert(
          isEn
            ? `<strong>✓ Opening your email client...</strong><br>` +
              `Your inquiry for <em>"${service}"</em> has been structured and addressed to <strong>${targetEmail}</strong>.<br>` +
              `If your email window does not open automatically, click here: <a href="${mailtoUrl}" style="color: var(--brick); font-weight: 600; text-decoration: underline;">Open and Send Email Now</a>.`
            : `<strong>✓ A abrir o seu email...</strong><br>` +
              `A sua mensagem para a especialidade <em>"${service}"</em> foi estruturada e encaminhada para <strong>${targetEmail}</strong>.<br>` +
              `Se a janela do seu email não abrir automaticamente, clique em: <a href="${mailtoUrl}" style="color: var(--brick); font-weight: 600; text-decoration: underline;">Abrir e Enviar Email Agora</a>.`,
          'success'
        );

        // Limpa o formulário e repõe a primeira pill activa
        form.reset();
        if (servicePills.length && serviceInput) {
          servicePills.forEach((p, idx) => {
            p.classList.toggle('active', idx === 0);
            p.setAttribute('aria-checked', idx === 0 ? 'true' : 'false');
          });
          serviceInput.value = servicePills[0].dataset.value || 'Construção Civil de Raiz';
        }
      }, 350);
    });
  };

  /* ─────────────────────────────────────────────
     12. BOTÃO FLUTUANTE DE CONTACTO RÁPIDO
  ───────────────────────────────────────────── */
  const initFloatingContact = () => {
    const btn = $('#floating-contact-btn');
    if (!btn) return;

    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const target = $('#contactos');
      if (target) {
        const offset = 70;
        const targetPos = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({
          top: targetPos,
          behavior: prefersReducedMotion.matches ? 'auto' : 'smooth'
        });

        // Foca o primeiro campo do formulário após scroll
        setTimeout(() => {
          const input = $('#form-name');
          if (input) input.focus();
        }, 600);
      }
    });
  };

  /* ─────────────────────────────────────────────
     13. SELETOR DE IDIOMA (PT / EN) COM TRADUÇÕES 100% COMPLETAS
  ───────────────────────────────────────────── */
  const TRANSLATIONS = {
    pt: {
      skip_link: "Saltar para o conteúdo principal",
      nav_inicio: "Início",
      nav_sobre: "Sobre Nós",
      nav_servicos: "Serviços",
      nav_projectos: "Projectos",
      nav_estaleiro: "Estaleiro",
      nav_metodologia: "Metodologia",
      nav_contactos: "Contactos",
      nav_cta: "Contacte-nos",
      hero_title: 'A PRECISÃO DA <span class="highlight-line">ENGENHARIA,</span><br>A SOLIDEZ DA <em>CONSTRUÇÃO.</em>',
      hero_lead: "Transformamos visões em marcos arquitectónicos e infraestruturas com rigor técnico, acompanhamento contínuo e o equilíbrio perfeito entre o betão e a nobreza do tijolo.",
      hero_btn_servicos: 'EXPLORAR SERVIÇOS <span class="btn-arrow" aria-hidden="true">→</span>',
      hero_btn_contactos: "CONTACTE-NOS",
      hero_stat_1: "Capital Social Integral",
      hero_stat_2: "Áreas de Actuação Técnica",
      hero_stat_3: "Rigor & Fiscalização",
      hero_stat_4: "Sede & Base Operacional",
      about_kicker: "QUEM SOMOS & GOVERNAÇÃO",
      about_title: '<span class="highlight-line-title">MAIS DO QUE</span><br>UMA CONSTRUTORA.<br><em>SOLIDEZ E PRECISÃO</em><br>EM CADA ETAPA.',
      about_lead: 'A <strong>COBRIK – Sociedade Unipessoal, Limitada</strong> actua no sector da engenharia civil e construção em Moçambique, combinando a precisão matemática do cálculo com a nobreza e autenticidade dos materiais fundamentais.',
      about_desc: 'Começamos por compreender o terreno, as condições geotécnicas e os objectivos de cada cliente. A partir daí, planeamos, coordenamos os intervenientes e fiscalizamos cada fase dos trabalhos contratados com transparência e responsabilidade técnica.',
      tab_visao: "01. Visão & Rigor",
      tab_legal: "02. Governação & Dados Legais",
      tab_hse: "03. Segurança no Trabalho (HSE)",
      tab_visao_p: "Acreditamos que a durabilidade e sustentabilidade das obras nascem do cálculo rigoroso e do domínio dos materiais. Cumprimos escrupulosamente os cadernos de encargos, assegurando acompanhamento técnico ao cliente do primeiro ensaio à recepção definitiva.",
      tab_legal_p: "Sociedade comercial por quotas constituída ao abrigo da legislação da República de Moçambique, com total conformidade fiscal e transparência institucional:",
      legal_lbl_1: "Denominação",
      legal_lbl_2: "Gerente Geral",
      legal_lbl_3: "Capital Social",
      legal_val_3: "3.000.000,00 MT (100% Subscrito)",
      legal_lbl_4: "Sede Estatutária",
      tab_hse_p: "Prática rigorosa da política de <strong>Zero Acidentes</strong>. Equipas com Equipamento de Protecção Individual (EPI) completo, procedimentos de segurança em altura e controlo laboratorial de provetes de betão e armaduras de aço.",
      about_badge: "ESTALEIRO TÉCNICO · MAPUTO",
      fact_lbl_1: "SEDE E OPERAÇÃO",
      fact_val_1: "Maputo, Moçambique",
      fact_lbl_2: "REGIME JURÍDICO",
      fact_val_2: "Código Comercial MZ",
      fact_lbl_3: "CAPITAL REALIZADO",
      fact_lbl_4: "RESPONSABILIDADE",
      fact_val_4: "100% Verificada",
      services_kicker: "ÁREAS DE ACTUAÇÃO & ENGENHARIA",
      services_title: 'DO CÁLCULO ESTRUTURAL<br>À <em>CHAVE NA MÃO.</em>',
      services_desc: "Serviços estruturados que acompanham todas as fases de uma obra civil, com rigor analítico, medições transparentes e presença técnica contínua.",
      filter_all: "Todas as Especialidades (5)",
      filter_construcao: "Construção Civil",
      filter_reabilitacao: "Reabilitação",
      filter_fiscalizacao: "Fiscalização",
      filter_imobiliario: "Empreendimentos",
      filter_equipamentos: "Equipamentos",
      scard_cta: "Solicitar Proposta ↗",
      scard_1_num: "01 // ESTRUTURAS",
      scard_1_title: "Construção Civil & Obras Públicas",
      scard_1_desc: "Execução de edifícios residenciais, corporativos e infraestruturas viárias. Fundações profundas, lajes maciças em betão armado e alvenaria estrutural de alta precisão.",
      scard_1_li1: "Projectos de estabilidade & betão armado",
      scard_1_li2: "Obras públicas e infraestruturas urbanas",
      scard_1_li3: "Controlo e ensaios laboratoriais de compressão",
      scard_2_num: "02 // RESTAURO",
      scard_2_title: "Reabilitação, Restauro & Conservação",
      scard_2_desc: "Recuperação de imóveis e reforço estrutural de elementos degradados. Substituição de redes técnicas, modernização de interiores e impermeabilizações de coberturas.",
      scard_2_li1: "Diagnóstico de patologias e estabilidade",
      scard_2_li2: "Reforço estrutural em betão e aço",
      scard_2_li3: "Remodelação integral de espaços comerciais",
      scard_3_num: "03 // COORDENAÇÃO",
      scard_3_title: "Gestão, Fiscalização & Consultoria",
      scard_3_desc: "Controlo rigoroso da execução no estaleiro em defesa do dono da obra. Monitorização de cronogramas físico-financeiros, medições de auto e garantia de qualidade.",
      scard_3_li1: "Fiscalização técnica residente em estaleiro",
      scard_3_li2: "Controlo orçamental e relatórios de progresso",
      scard_3_li3: "Garantia de conformidade com o projecto",
      scard_4_num: "04 // DESENVOLVIMENTO",
      scard_4_title: "Empreendimentos Imobiliários",
      scard_4_desc: "Promoção, desenvolvimento e gestão de empreendimentos residenciais e comerciais em Maputo. Da viabilidade técnica e financeira ao licenciamento camarário.",
      scard_4_li1: "Estudos de viabilidade económica e técnica",
      scard_4_li2: "Licenciamento no Conselho Municipal de Maputo",
      scard_4_li3: "Coordenação global de empreendimentos",
      scard_5_num: "05 // LOGÍSTICA",
      scard_5_title: "Materiais & Aluguer de Equipamentos",
      scard_5_desc: "Comércio e distribuição de materiais cerâmicos e inertes certificados. Aluguer de maquinaria pesada, gruas torre, andaimes tubulares e betoneiras industriais.",
      scard_5_li1: "Aluguer de máquinas com operador qualificado",
      scard_5_li2: "Tijolos cerâmicos e materiais de alta resistência",
      scard_5_li3: "Montagem e certificação de andaimes em obra",
      projects_kicker: "CAPACIDADE TÉCNICA & ÂMBITOS DE INTERVENÇÃO",
      projects_title: 'ENGENHARIA E CONSTRUÇÃO,<br><em>DA FUNDAÇÃO AO ACABAMENTO.</em>',
      projects_desc: "Actuamos no mercado moçambicano com rigor normativo (REBAP/Eurocódigos), segurança integral (HSE) e metodologias avançadas de gestão e orçamentação analítica. Clique em qualquer área técnica para consultar as especificações completas.",
      pfilter_all: "Todos os Âmbitos (6)",
      pfilter_edificacao: "Edificação & Habitação",
      pfilter_corporativo: "Comercial & Corporativo",
      pfilter_infraestrutura: "Infraestruturas",
      pfilter_gestao: "Fiscalização & Consultoria",
      pcard_link: "Ver Especificações ↗",
      pcard_1_tag: "01 / Edificação de Raiz",
      pcard_1_loc: "Maputo & Território Nacional",
      pcard_1_year: "Habitação & Edifícios",
      pcard_1_title: "Construção Civil & Edificação de Raiz",
      pcard_1_desc: "Execução integral de edifícios multifamiliares, residências contemporâneas e condomínios fechados. Domínio de fundações profundas e directas, estruturas em betão armado segundo o REBAP e coordenação turnkey.",
      pcard_1_scope: "Normas: REBAP / Eurocódigos",
      pcard_2_tag: "02 / Corporativo",
      pcard_2_loc: "Centros Empresariais",
      pcard_2_year: "Comercial & Sedes",
      pcard_2_title: "Edifícios Comerciais & Sedes Corporativas",
      pcard_2_desc: "Construção de escritórios, sedes empresariais e superfícies comerciais com grandes vãos livres, lajes fungiformes, fachadas de eficiência bioclimática e coordenação rigorosa de AVAC, dados e segurança.",
      pcard_2_scope: "Estruturas Mistas & Turnkey",
      pcard_3_tag: "03 / Retrofit & Restauro",
      pcard_3_loc: "Intervenção Especializada",
      pcard_3_year: "Patologias & Reforço",
      pcard_3_title: "Reabilitação Estrutural & Retrofit Técnico",
      pcard_3_desc: "Diagnóstico e reparação de patologias do betão, corrosão de armaduras e fissuração. Aplicação de argamassas tixotrópicas de alta resistência, encamisamento de pilares e reforço com vigas metálicas.",
      pcard_3_scope: "Ensaios Não-Destrutivos & Reforço",
      pcard_4_tag: "04 / Infraestruturas",
      pcard_4_loc: "Vias & Plataformas",
      pcard_4_year: "Obras de Arte",
      pcard_4_title: "Infraestruturas Viárias & Obras de Arte",
      pcard_4_desc: "Engenharia de infraestruturas pesadas com foco em muros de suporte em betão armado e gabiões, passagens hidráulicas, valas de drenagem pluvial e pavimentações estruturadas com maquinaria própria.",
      pcard_4_scope: "Controlo Laboratorial Sistemático",
      pcard_5_tag: "05 / Fiscalização Técnica",
      pcard_5_loc: "Direcção Técnica Independente",
      pcard_5_year: "Supervisão Total",
      pcard_5_title: "Fiscalização Técnica & Gestão de Empreitadas",
      pcard_5_desc: "Supervisão técnica independente para donos de obra. Verificação minuciosa de cadernos de encargos, ensaios de compressão de betão a 28 dias, validação de autos e implementação das directrizes de HSE.",
      pcard_5_scope: "Auditoria Técnica & Normas HSE",
      pcard_6_tag: "06 / Engenharia de Custos",
      pcard_6_loc: "Consultoria & Concursos",
      pcard_6_year: "Gantt & Custos",
      pcard_6_title: "Orçamentação Analítica & Planeamento",
      pcard_6_desc: "Mapas de quantidades rigorosos, composição de preços unitários e cronogramas físico-financeiros em Gantt. Planeamento de compras técnicas e gestão de desvios para assegurar orçamentos transparentes.",
      pcard_6_scope: "Mapas de Quantidades & Gantt",
      gallery_kicker: "REGISTO DE ESTALEIRO & RIGOR CONSTRUTIVO",
      gallery_title: 'A PERFEIÇÃO TÉCNICA VIVE<br>NO <em>DETALHE INVISÍVEL.</em>',
      gallery_desc: "Registo fotográfico da execução no terreno. Da precisão das armaduras de aço e cofragens aos acabamentos cerâmicos mais exigentes.",
      gfilter_all: "Todos os Registos (7)",
      gfilter_estrutura: "Estruturas & Betão",
      gfilter_acabamento: "Alvenarias & Acabamentos",
      gfilter_obra: "Equipas & Maquinaria",
      gfilter_infra: "Infraestruturas",
      gal_1_title: "ESTRUTURA // COFRAGEM E ARMADURAS DE PILARES",
      gal_1_sub: "01 / BETÃO ARMADO",
      gal_2_title: "EDIFICAÇÃO // SUPERESTRUTURA EM ALTURA",
      gal_2_sub: "02 / LAJES & PILARES",
      gal_3_title: "ESTRUTURA METÁLICA // GRANDES VÃOS",
      gal_3_sub: "03 / ESTRUTURA",
      gal_4_title: "INFRAESTRUTURAS // OBRAS DE ARTE & VIAS",
      gal_4_sub: "04 / INFRA",
      gal_5_title: "EQUIPAMENTO // LOGÍSTICA & MAQUINARIA",
      gal_5_sub: "05 / ESTALEIRO",
      gal_6_title: "ACABAMENTOS // ALVENARIA TÉCNICA",
      gal_6_sub: "06 / DETALHE",
      gal_7_title: "SEGURANÇA & RIGOR // EQUIPA EM OPERAÇÃO",
      gal_7_sub: "07 / HSE EM CAMPO",
      method_kicker: "COMO TRABALHAMOS · METODOLOGIA DE 4 FASES",
      method_title: 'CLAREZA ABSOLUTA EM CADA<br><em>ETAPA DO PROCESSO.</em>',
      method_desc: "Sem improvisos. O nosso método assegura que cada decisão de engenharia seja fundamentada em estudos técnicos validados e controlo rigoroso de estaleiro.",
      mstep_1_title: "Diagnóstico & Levantamento",
      mstep_1_desc: "Analisamos a geotecnia do solo, topografia do terreno e enquadramento regulamentar no Município de Maputo para definir as premissas de cálculo.",
      mstep_2_title: "Engenharia & Planeamento",
      mstep_2_desc: "Elaboração dos projectos de estabilidade, redes e especialidades. Orçamentação analítica detalhada com cronograma físico-financeiro (Curva S).",
      mstep_3_title: "Execução com Fiscalização",
      mstep_3_desc: "Implementação dos trabalhos com engenheiros e encarregados residentes. Controlo minucioso de qualidade, segurança no trabalho e ensaios de betão.",
      mstep_4_title: "Ensaios Finais & Entrega",
      mstep_4_desc: 'Verificação exaustiva de todas as instalações, telas finais ("as-built"), licença de utilização e acompanhamento no período de garantia da obra.',
      cred_quote: '"A nossa engenharia assenta num princípio inegociável: construir com a precisão dos números e a nobreza dos materiais fundamentais."',
      contact_kicker: "CONSULTORIA TÉCNICA & CONTACTO DIRECTO",
      contact_title: 'VAMOS DAR INÍCIO À SUA<br><em>PRÓXIMA CONSTRUÇÃO.</em>',
      contact_lead: "Partilhe os detalhes do seu projecto ou terreno. A nossa direcção de engenharia elabora uma análise técnica preliminar e proposta orçamental ajustada.",
      contact_lbl_hq: "SEDE ESTATUTÁRIA",
      contact_val_hq: "Avenida Nkwame Nkrumah, n.º 525<br>Prédio Antúrio, 3.º Andar, Flat 24<br>Cidade de Maputo — Moçambique",
      contact_map_btn: "Abrir no Google Maps ↗",
      contact_lbl_email: "EMAIL OFICIAL",
      contact_lbl_phone: "TELEFONE DE CONTACTO",
      contact_lbl_cap: "CAPITAL SOCIAL & REGISTO",
      contact_val_cap: "3.000.000,00 MT · Sociedade Unipessoal, Lda.",
      form_heading: "Pedido de Consulta & Proposta",
      form_desc: 'Preencha os campos abaixo. A sua solicitação será preparada directamente para <strong>contact@cobrik.co.mz</strong>.',
      lbl_name: "Nome Completo *",
      lbl_phone: "Contacto Telefónico *",
      lbl_email: 'Email Profissional <span class="optional-tag">(Opcional)</span>',
      lbl_location: 'Localização Prevista da Obra <span class="optional-tag">(Opcional)</span>',
      lbl_service: 'Especialidade Pretendida <span class="optional-tag">(Opcional)</span>',
      lbl_message: "Breve Descrição do Projecto *",
      opt_default: "Selecione uma especialidade",
      opt_1: "Construção de Raiz",
      opt_2: "Reabilitação & Restauro",
      opt_3: "Fiscalização Técnica",
      opt_4: "Empreendimentos",
      opt_5: "Aluguer de Equipamentos",
      opt_6: "Consulta Geral",
      btn_enviar: "Enviar Mensagem Directa",
      form_placeholder_name: "Ex: Engenheiro Silva",
      form_placeholder_phone: "+258 87 545 8750",
      form_placeholder_email: "seuemail@empresa.co.mz",
      form_placeholder_location: "Ex: Maputo, Matola ou a combinar...",
      form_placeholder_message: "Indique a área aproximada, fase do projecto ou principais necessidades...",
      modal_lbl_area: "ÁREA DE CONSTRUÇÃO",
      modal_lbl_status: "ESTADO",
      modal_lbl_scope: "ÂMBITO TÉCNICO",
      modal_key_scale: "Capacidade / Escala:",
      modal_key_scope: "Âmbito de Actuação:",
      modal_btn_cta: "Solicitar Consulta Técnica ↗",
      footer_bio: "Sociedade comercial de direito moçambicano vocacionada para a execução de empreitadas de engenharia civil, obras públicas, restauro estrutural e fiscalização técnica de elevado rigor.",
      footer_heading_nav: "Navegação",
      footer_heading_serv: "Especialidades",
      footer_heading_contact: "Contacto & Sede",
      fserv_1: "Construção Civil & Raiz",
      fserv_2: "Reabilitação Estrutural",
      fserv_3: "Fiscalização Técnica",
      fserv_4: "Empreendimentos",
      fserv_5: "Aluguer de Equipamento",
      footer_address: "Av. Nkwame Nkrumah 525<br>Prédio Antúrio, Flat 24<br>Cidade de Maputo · Moçambique",
      footer_cap: "Capital Social: 3.000.000,00 MT",
      footer_motto: "Construímos com a solidez do tijolo e o rigor do cálculo.",
      footer_rights: "Todos os direitos reservados.",
      footer_topo: "Voltar ao Topo ↑"
    },
    en: {
      skip_link: "Skip to main content",
      nav_inicio: "Home",
      nav_sobre: "About Us",
      nav_servicos: "Services",
      nav_projectos: "Projects",
      nav_estaleiro: "Site Works",
      nav_metodologia: "Methodology",
      nav_contactos: "Contact",
      nav_cta: "Contact Us",
      hero_title: 'ENGINEERING <span class="highlight-line">PRECISION,</span><br>CONSTRUCTION <em>SOLIDITY.</em>',
      hero_lead: "We turn visions into architectural landmarks and infrastructure through technical rigor, continuous supervision, and the perfect balance between concrete and masonry excellence.",
      hero_btn_servicos: 'EXPLORE SERVICES <span class="btn-arrow" aria-hidden="true">→</span>',
      hero_btn_contactos: "CONTACT US",
      hero_stat_1: "Subscribed Share Capital",
      hero_stat_2: "Technical Specializations",
      hero_stat_3: "Rigor & Supervision",
      hero_stat_4: "Headquarters & Operations",
      about_kicker: "ABOUT US & GOVERNANCE",
      about_title: '<span class="highlight-line-title">MORE THAN</span><br>A CONTRACTOR.<br><em>SOLIDITY AND PRECISION</em><br>IN EVERY PHASE.',
      about_lead: '<strong>COBRIK – Sociedade Unipessoal, Limitada</strong> operates across civil engineering and construction in Mozambique, combining the mathematical precision of structural calculations with the nobility of core materials.',
      about_desc: 'We start by evaluating the ground, geotechnical conditions, and each client’s objectives. From there, we plan, coordinate stakeholders, and supervise every project stage with transparency and technical accountability.',
      tab_visao: "01. Vision & Rigor",
      tab_legal: "02. Governance & Legal Info",
      tab_hse: "03. Health, Safety & HSE",
      tab_visao_p: "We believe the durability and sustainability of civil works arise from rigorous calculation and mastery of materials. We strictly comply with technical specifications, ensuring continuous engineering oversight from initial soil testing to final handover.",
      tab_legal_p: "Private limited liability company incorporated under the laws of the Republic of Mozambique, operating with full tax compliance and institutional transparency:",
      legal_lbl_1: "Company Name",
      legal_lbl_2: "General Manager",
      legal_lbl_3: "Share Capital",
      legal_val_3: "3,000,000.00 MT (100% Subscribed)",
      legal_lbl_4: "Registered Office",
      tab_hse_p: "Strict enforcement of a <strong>Zero Accidents</strong> policy. Field teams equipped with full Personal Protective Equipment (PPE), working-at-height safety protocols, and laboratory testing of concrete cubes and steel reinforcement.",
      about_badge: "TECHNICAL YARD · MAPUTO",
      fact_lbl_1: "HQ & OPERATIONS",
      fact_val_1: "Maputo, Mozambique",
      fact_lbl_2: "LEGAL FRAMEWORK",
      fact_val_2: "MZ Commercial Code",
      fact_lbl_3: "PAID-IN CAPITAL",
      fact_lbl_4: "ACCOUNTABILITY",
      fact_val_4: "100% Verified",
      services_kicker: "AREAS OF EXPERTISE & ENGINEERING",
      services_title: 'FROM STRUCTURAL DESIGN<br>TO <em>TURNKEY DELIVERY.</em>',
      services_desc: "Structured services covering all phases of civil construction, with analytical rigor, transparent measurements, and continuous on-site engineering presence.",
      filter_all: "All Specialties (5)",
      filter_construcao: "Civil Construction",
      filter_reabilitacao: "Rehabilitation",
      filter_fiscalizacao: "Supervision",
      filter_imobiliario: "Developments",
      filter_equipamentos: "Equipment",
      scard_cta: "Request Proposal ↗",
      scard_1_num: "01 // STRUCTURES",
      scard_1_title: "Civil Construction & Public Works",
      scard_1_desc: "Execution of residential, corporate, and road infrastructure projects. Deep foundations, solid reinforced concrete slabs, and high-precision structural masonry.",
      scard_1_li1: "Structural stability & reinforced concrete designs",
      scard_1_li2: "Public works and urban infrastructure",
      scard_1_li3: "Laboratory quality control & compression testing",
      scard_2_num: "02 // RESTORATION",
      scard_2_title: "Rehabilitation, Restoration & Conservation",
      scard_2_desc: "Building recovery and structural strengthening of degraded elements. Replacement of MEP networks, interior modernization, and roof waterproofing.",
      scard_2_li1: "Structural pathology and stability diagnostics",
      scard_2_li2: "Concrete and steel structural reinforcement",
      scard_2_li3: "Full remodeling of commercial spaces",
      scard_3_num: "03 // COORDINATION",
      scard_3_title: "Project Management, Supervision & Consulting",
      scard_3_desc: "Rigorous on-site execution control representing the project owner. Physical-financial schedule tracking, measurement certifications, and quality assurance.",
      scard_3_li1: "Resident technical supervision on site",
      scard_3_li2: "Budget control and progress reporting",
      scard_3_li3: "Strict compliance with executive designs",
      scard_4_num: "04 // DEVELOPMENT",
      scard_4_title: "Real Estate Developments",
      scard_4_desc: "Promotion, development, and management of residential and commercial properties in Maputo. From technical and financial feasibility to municipal licensing.",
      scard_4_li1: "Economic and technical feasibility studies",
      scard_4_li2: "Maputo Municipal Council licensing",
      scard_4_li3: "End-to-end development coordination",
      scard_5_num: "05 // LOGISTICS",
      scard_5_title: "Building Materials & Equipment Rental",
      scard_5_desc: "Supply and distribution of certified ceramic materials and aggregates. Rental of heavy machinery, tower cranes, tubular scaffolding, and industrial concrete mixers.",
      scard_5_li1: "Heavy machinery rental with certified operators",
      scard_5_li2: "High-strength ceramic bricks and aggregates",
      scard_5_li3: "On-site scaffolding assembly and certification",
      projects_kicker: "TECHNICAL CAPACITY & SCOPE",
      projects_title: 'ENGINEERING AND CONSTRUCTION,<br><em>FROM FOUNDATION TO FINISH.</em>',
      projects_desc: "Operating in Mozambique under strict technical standards (REBAP/Eurocodes), comprehensive HSE protocols, and analytical cost estimation. Click any technical area to explore detailed specifications.",
      pfilter_all: "All Areas (6)",
      pfilter_edificacao: "Building & Housing",
      pfilter_corporativo: "Commercial & Corporate",
      pfilter_infraestrutura: "Infrastructure",
      pfilter_gestao: "Supervision & Consulting",
      pcard_link: "View Specifications ↗",
      pcard_1_tag: "01 / Ground-Up Building",
      pcard_1_loc: "Maputo & Nationwide",
      pcard_1_year: "Housing & Buildings",
      pcard_1_title: "Civil Construction & Ground-Up Building",
      pcard_1_desc: "Full execution of multi-family buildings, contemporary residences, and gated communities. Deep and shallow foundations, reinforced concrete structures compliant with REBAP, and turnkey coordination.",
      pcard_1_scope: "Standards: REBAP / Eurocodes",
      pcard_2_tag: "02 / Corporate",
      pcard_2_loc: "Business Districts",
      pcard_2_year: "Commercial & HQ",
      pcard_2_title: "Commercial Buildings & Corporate Headquarters",
      pcard_2_desc: "Construction of offices, corporate headquarters, and commercial spaces featuring wide spans, waffle slabs, bioclimatic facades, and rigorous HVAC, data, and security integration.",
      pcard_2_scope: "Composite Structures & Turnkey",
      pcard_3_tag: "03 / Retrofit & Restoration",
      pcard_3_loc: "Specialized Intervention",
      pcard_3_year: "Pathology & Strengthening",
      pcard_3_title: "Structural Rehabilitation & Technical Retrofit",
      pcard_3_desc: "Diagnostics and repair of concrete pathologies, rebar corrosion, and cracking. Application of high-strength thixotropic mortars, column jacketing, and steel beam reinforcement.",
      pcard_3_scope: "Non-Destructive Testing & Strengthening",
      pcard_4_tag: "04 / Infrastructure",
      pcard_4_loc: "Roads & Platforms",
      pcard_4_year: "Civil Engineering Works",
      pcard_4_title: "Road Infrastructure & Civil Engineering Works",
      pcard_4_desc: "Heavy infrastructure engineering focused on reinforced concrete and gabion retaining walls, hydraulic culverts, stormwater drainage channels, and structured paving with in-house machinery.",
      pcard_4_scope: "Systematic Laboratory Control",
      pcard_5_tag: "05 / Technical Supervision",
      pcard_5_loc: "Independent Technical Direction",
      pcard_5_year: "Full Supervision",
      pcard_5_title: "Technical Supervision & Contract Management",
      pcard_5_desc: "Independent technical supervision for project owners. Thorough verification of specifications, 28-day concrete compression testing, measurement validation, and HSE implementation.",
      pcard_5_scope: "Technical Auditing & HSE Standards",
      pcard_6_tag: "06 / Cost Engineering",
      pcard_6_loc: "Consulting & Tenders",
      pcard_6_year: "Gantt & Costing",
      pcard_6_title: "Analytical Cost Estimation & Planning",
      pcard_6_desc: "Rigorous bills of quantities, unit price breakdowns, and physical-financial Gantt schedules. Technical procurement planning and variance control for transparent budgeting.",
      pcard_6_scope: "Bills of Quantities & Gantt",
      gallery_kicker: "SITE LOG & CONSTRUCTION RIGOR",
      gallery_title: 'TECHNICAL PERFECTION LIVES<br>IN THE <em>INVISIBLE DETAIL.</em>',
      gallery_desc: "On-site photographic record. From the precision of rebar frameworks and formwork to demanding ceramic finishes.",
      gfilter_all: "All Records (7)",
      gfilter_estrutura: "Structures & Concrete",
      gfilter_acabamento: "Masonry & Finishes",
      gfilter_obra: "Teams & Machinery",
      gfilter_infra: "Infrastructure",
      gal_1_title: "STRUCTURE // COLUMN FORMWORK & REBAR",
      gal_1_sub: "01 / REINFORCED CONCRETE",
      gal_2_title: "BUILDING // HIGH-RISE SUPERSTRUCTURE",
      gal_2_sub: "02 / SLABS & COLUMNS",
      gal_3_title: "STEEL STRUCTURE // WIDE SPANS",
      gal_3_sub: "03 / STRUCTURE",
      gal_4_title: "INFRASTRUCTURE // CIVIL WORKS & ROADS",
      gal_4_sub: "04 / INFRA",
      gal_5_title: "EQUIPMENT // SITE LOGISTICS & MACHINERY",
      gal_5_sub: "05 / SITE YARD",
      gal_6_title: "FINISHES // TECHNICAL MASONRY",
      gal_6_sub: "06 / DETAIL",
      gal_7_title: "SAFETY & RIGOR // FIELD OPERATIONS TEAM",
      gal_7_sub: "07 / FIELD HSE",
      method_kicker: "HOW WE WORK · 4-PHASE METHODOLOGY",
      method_title: 'ABSOLUTE CLARITY IN EVERY<br><em>STAGE OF THE PROCESS.</em>',
      method_desc: "No improvisation. Our methodology ensures every engineering decision is grounded in validated technical assessments and disciplined site controls.",
      mstep_1_title: "Diagnostics & Surveying",
      mstep_1_desc: "We analyze soil geotechnics, site topography, and regulatory frameworks in the Municipality of Maputo to establish accurate structural calculation premises.",
      mstep_2_title: "Engineering & Planning",
      mstep_2_desc: "Preparation of structural stability, MEP, and specialty designs. Detailed analytical cost estimation with a physical-financial schedule (S-Curve).",
      mstep_3_title: "Supervised Execution",
      mstep_3_desc: "On-site implementation led by resident engineers and foremen. Meticulous quality control, occupational safety enforcement, and concrete testing.",
      mstep_4_title: "Final Testing & Handover",
      mstep_4_desc: 'Comprehensive inspection of all installations, "as-built" drawings, occupancy permits, and dedicated support throughout the warranty period.',
      cred_quote: '"Our engineering is built on an unnegotiable principle: to build with the precision of numbers and the nobility of essential materials."',
      contact_kicker: "TECHNICAL CONSULTING & DIRECT CONTACT",
      contact_title: "LET'S DISCUSS<br><em>NEXT CONSTRUCTION.</em>",
      contact_lead: "Share your project or site specifications. Our engineering leadership prepares a preliminary technical review and customized cost proposal.",
      contact_lbl_hq: "REGISTERED HEADQUARTERS",
      contact_val_hq: "Avenida Nkwame Nkrumah, No. 525<br>Antúrio Building, 3rd Floor, Flat 24<br>Maputo City — Mozambique",
      contact_map_btn: "Open in Google Maps ↗",
      contact_lbl_email: "OFFICIAL EMAIL",
      contact_lbl_phone: "CONTACT PHONE",
      contact_lbl_cap: "SHARE CAPITAL & REGISTRATION",
      contact_val_cap: "3,000,000.00 MT · Sole Proprietorship Ltd.",
      form_heading: "Consultation & Proposal Request",
      form_desc: 'Fill in the fields below. Your inquiry will be prepared directly for <strong>contact@cobrik.co.mz</strong>.',
      lbl_name: "Full Name *",
      lbl_phone: "Phone Number *",
      lbl_email: 'Professional Email <span class="optional-tag">(Optional)</span>',
      lbl_location: 'Expected Site Location <span class="optional-tag">(Optional)</span>',
      lbl_service: 'Desired Specialty <span class="optional-tag">(Optional)</span>',
      lbl_message: "Brief Project Description *",
      opt_default: "Select a specialty",
      opt_1: "Ground-Up Construction",
      opt_2: "Rehabilitation & Restoration",
      opt_3: "Technical Supervision",
      opt_4: "Real Estate Developments",
      opt_5: "Equipment Rental",
      opt_6: "General Inquiry",
      btn_enviar: "Send Direct Inquiry",
      form_placeholder_name: "E.g.: Eng. John Smith",
      form_placeholder_phone: "+258 87 545 8750",
      form_placeholder_email: "youremail@company.com",
      form_placeholder_location: "E.g.: Maputo, Matola or to arrange...",
      form_placeholder_message: "State approximate area, project stage or primary requirements...",
      modal_lbl_area: "CONSTRUCTION AREA",
      modal_lbl_status: "STATUS",
      modal_lbl_scope: "TECHNICAL SCOPE",
      modal_key_scale: "Capacity / Scale:",
      modal_key_scope: "Scope of Work:",
      modal_btn_cta: "Request Technical Consultation ↗",
      footer_bio: "Mozambican commercial enterprise specialized in civil engineering contracting, public works, structural restoration, and high-standard technical supervision.",
      footer_heading_nav: "Navigation",
      footer_heading_serv: "Specialties",
      footer_heading_contact: "Contact & Headquarters",
      fserv_1: "Civil & Ground-Up Construction",
      fserv_2: "Structural Rehabilitation",
      fserv_3: "Technical Supervision",
      fserv_4: "Real Estate Developments",
      fserv_5: "Equipment Rental",
      footer_address: "Av. Nkwame Nkrumah 525<br>Antúrio Building, Flat 24<br>Maputo City · Mozambique",
      footer_cap: "Share Capital: 3,000,000.00 MT",
      footer_motto: "Building with the solidity of brick and the rigor of calculation.",
      footer_rights: "All rights reserved.",
      footer_topo: "Back to Top ↑"
    }
  };

  const initLanguageSelector = () => {
    const langSelector = $('#lang-selector');
    const langBtn = $('#lang-menu-btn');
    const currentLabel = $('#lang-current-label');
    const langOptions = $$('.lang-option');
    const mobileLangBtns = $$('.nav-mobile-lang-btn');

    let currentLang = localStorage.getItem('cobrik_lang') || 'pt';

    const setLanguage = (lang) => {
      currentLang = lang;
      localStorage.setItem('cobrik_lang', lang);
      document.documentElement.lang = lang === 'en' ? 'en' : 'pt-MZ';

      if (currentLabel) {
        currentLabel.textContent = lang.toUpperCase();
      }

      langOptions.forEach((opt) => {
        const isActive = opt.dataset.lang === lang;
        opt.classList.toggle('active', isActive);
        opt.setAttribute('aria-selected', isActive ? 'true' : 'false');
      });

      mobileLangBtns.forEach((btn) => {
        btn.classList.toggle('active', btn.dataset.lang === lang);
      });

      // Atualiza textos marcados com data-i18n
      const dict = TRANSLATIONS[lang] || TRANSLATIONS.pt;
      $$('[data-i18n]').forEach((el) => {
        const key = el.dataset.i18n;
        if (dict[key] !== undefined) {
          el.innerHTML = dict[key];
        }
      });

      // Atualiza placeholders de formulários
      $$('[data-i18n-placeholder]').forEach((el) => {
        const key = el.dataset.i18nPlaceholder;
        if (dict[key] !== undefined) {
          el.placeholder = dict[key];
        }
      });
    };

    if (langBtn && langSelector) {
      langBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = langSelector.classList.toggle('open');
        langBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      });

      document.addEventListener('click', (e) => {
        if (!langSelector.contains(e.target)) {
          langSelector.classList.remove('open');
          langBtn.setAttribute('aria-expanded', 'false');
        }
      });

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && langSelector.classList.contains('open')) {
          langSelector.classList.remove('open');
          langBtn.setAttribute('aria-expanded', 'false');
          langBtn.focus();
        }
      });
    }

    langOptions.forEach((opt) => {
      opt.addEventListener('click', () => {
        const lang = opt.dataset.lang;
        if (lang) {
          setLanguage(lang);
          if (langSelector) {
            langSelector.classList.remove('open');
            if (langBtn) langBtn.setAttribute('aria-expanded', 'false');
          }
        }
      });
    });

    mobileLangBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const lang = btn.dataset.lang;
        if (lang) {
          setLanguage(lang);
        }
      });
    });

    // Aplica o idioma inicial
    setLanguage(currentLang);
  };

  /* ─────────────────────────────────────────────
     14. ANO DINÂMICO & ARRANQUE
  ───────────────────────────────────────────── */
  const initYear = () => {
    const yr = $('#current-year');
    if (yr) yr.textContent = new Date().getFullYear();
  };

  const boot = () => {
    initPreloader();
    initLanguageSelector();
    initYear();
    initHeader();
    initHeroSlideshow();
    initCompanyTabs();
    initServiceFilter();
    initProjects();
    initGalleryFilter();
    initContactForm();
    initFloatingContact();
    initCounters();
    initReveals();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
