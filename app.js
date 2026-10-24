(() => {
  'use strict';

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const motionOK = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const scrollBehavior = motionOK ? 'smooth' : 'auto';

  const menu = $('#menuToggle');
  const nav = $('#primaryNav');
  const closeMenu = () => {
    nav.classList.remove('is-open');
    menu.setAttribute('aria-expanded', 'false');
    menu.setAttribute('aria-label', '打开菜单');
  };
  menu.addEventListener('click', () => {
    const opened = nav.classList.toggle('is-open');
    menu.setAttribute('aria-expanded', String(opened));
    menu.setAttribute('aria-label', opened ? '关闭菜单' : '打开菜单');
  });
  $$('#primaryNav a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeMenu();
  });

  const scenes = {
    before: { kicker: '01 / 出发前', title: '先把未知变成计划', image: '旅行计划.png', alt: '枢游记旅行计划界面', count: '01 / 04' },
    during: { kicker: '02 / 旅行中', title: '把注意力留给现场', image: '去雾.png', alt: '枢游记去雾结果界面', count: '02 / 04' },
    after: { kicker: '03 / 回家后', title: '让照片重新讲述故事', image: '旅行记忆.png', alt: '枢游记旅行记忆界面', count: '03 / 04' },
    continuity: { kicker: '04 / 下一次打开', title: '让一段旅程持续生长', image: '服务卡片.png', alt: '枢游记服务卡片界面', count: '04 / 04' }
  };
  let activeScene = 'before';
  let sceneSwap = 0;
  const stageImage = $('#stageImage');
  const journeyChapters = $$('.journey-chapter');
  const journeyTabs = $$('[data-jump]');
  function syncJourneyState() {
    journeyChapters.forEach(chapter => {
      const selected = chapter.dataset.scene === activeScene;
      chapter.hidden = !selected;
      chapter.classList.toggle('is-active', selected);
    });
    journeyTabs.forEach(button => {
      const selected = button.dataset.jump === activeScene;
      button.classList.toggle('is-active', selected);
      button.setAttribute('aria-selected', String(selected));
      button.tabIndex = selected ? 0 : -1;
    });
  }
  syncJourneyState();
  function setScene(key) {
    if (!scenes[key] || key === activeScene) return;
    activeScene = key;
    const data = scenes[key];
    const ticket = ++sceneSwap;
    syncJourneyState();
    stageImage.classList.add('is-changing');
    $('#stageKicker').textContent = data.kicker;
    $('#stageTitle').textContent = data.title;
    $('#stageCount').textContent = data.count;
    window.setTimeout(() => {
      if (ticket !== sceneSwap) return;
      stageImage.src = `assets/${data.image}`;
      stageImage.alt = data.alt;
      if (!motionOK) stageImage.classList.remove('is-changing');
      else stageImage.decode().catch(() => {}).finally(() => {
        if (ticket === sceneSwap) stageImage.classList.remove('is-changing');
      });
    }, motionOK ? 180 : 0);
  }
  journeyTabs.forEach((button, index) => {
    button.addEventListener('click', () => setScene(button.dataset.jump));
    button.addEventListener('keydown', event => {
      let nextIndex = index;
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') nextIndex = (index + 1) % journeyTabs.length;
      else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') nextIndex = (index - 1 + journeyTabs.length) % journeyTabs.length;
      else if (event.key === 'Home') nextIndex = 0;
      else if (event.key === 'End') nextIndex = journeyTabs.length - 1;
      else return;
      event.preventDefault();
      journeyTabs[nextIndex].focus();
      setScene(journeyTabs[nextIndex].dataset.jump);
    });
  });

  const repairs = {
    dehaze: {
      image: '去雾.png', alt: '枢游记图像去雾原图与结果对照界面', index: '01 / DEHAZE',
      heading: '让雾气退后，\n让画面走近。',
      text: '基于暗通道先验的去雾处理放在 WebView 工作流中，提供参数调节与修复前后查看。用户可以先使用默认值，再根据照片情况微调。',
      facts: [['处理方式', '暗通道先验与图像增强'], ['交互特点', '默认参数、手动调节、前后查看'], ['使用场景', '山景、远景与雾天旅行照片']],
      title: '图像去雾'
    },
    upscale: {
      image: '图像清晰化.png', alt: '枢游记图像清晰化界面', index: '02 / UPSCALE',
      heading: '细节丢了，\n试着找回来。',
      text: '清晰化提供 4 倍超分辨率处理入口。Real-ESRGAN 推理依赖本地 Python 服务，因此展示时需说明模型服务的运行环境。',
      facts: [['处理方式', 'Real-ESRGAN 4× 超分辨率'], ['交互特点', '上传、等待、结果查看'], ['运行条件', '需连接本地 Python 推理服务']],
      title: '图像清晰化'
    },
    edit: {
      image: '手动修图页面.png', alt: '枢游记手动修图界面', index: '03 / MANUAL EDIT',
      heading: '自动之外，\n也保留人的判断。',
      text: '手动编辑为用户提供自主调节空间。自动处理负责起点，而画面的最终表达仍由使用者决定。',
      facts: [['处理方式', '手动参数与可视化调整'], ['交互特点', '边看边调、即时反馈'], ['使用场景', '需要个人审美判断的照片']],
      title: '手动修图'
    }
  };
  let activeRepair = 'dehaze';
  let repairSwap = 0;
  function setRepair(key) {
    const data = repairs[key];
    if (!data) return;
    activeRepair = key;
    const ticket = ++repairSwap;
    const image = $('#repairImage');
    image.classList.add('is-changing');
    $$('[data-repair]').forEach(button => button.setAttribute('aria-selected', String(button.dataset.repair === key)));
    $('#repairIndex').textContent = data.index;
    $('#repairHeading').innerHTML = data.heading.replace('\n', '<br>');
    $('#repairText').textContent = data.text;
    $('#repairFacts').replaceChildren(...data.facts.map(([term, value]) => {
      const row = document.createElement('div');
      const dt = document.createElement('dt');
      const dd = document.createElement('dd');
      dt.textContent = term;
      dd.textContent = value;
      row.append(dt, dd);
      return row;
    }));
    $('#repairZoom').setAttribute('aria-label', `放大查看${data.title}界面`);
    window.setTimeout(() => {
      if (ticket !== repairSwap) return;
      image.src = `assets/${data.image}`;
      image.alt = data.alt;
      image.decode().catch(() => {}).finally(() => {
        if (ticket === repairSwap) image.classList.remove('is-changing');
      });
    }, motionOK ? 140 : 0);
  }
  $$('[data-repair]').forEach(button => button.addEventListener('click', () => setRepair(button.dataset.repair)));

  const aiCases = {
    culture: { image: '文化知识获取_智能体.png', alt: '枢游记文化知识智能体界面', label: '文化探索 / 智能体模式', title: '从“这是什么”到“它为什么值得看”', description: '本地知识库提供结构化的目的地信息，智能体允许用户围绕同一处景点继续提问。内容从“查到”走向“理解”。', source: 'KnowledgeBase · KgService · AiService', zoom: '文化知识智能体' },
    photo: { image: '智能客服发送图片.png', alt: '枢游记智能客服发送图片界面', label: '图片理解 / 两阶段处理', title: '从画面出发，给问题一个有依据的入口', description: '先用视觉服务分析图片，再把识别结果与提问组织给语言服务。这个过程让“看图提问”具备明确的数据流。', source: 'VisionService → AiService', zoom: '图片提问' },
    command: { image: '智能客服_指令模式.png', alt: '枢游记智能客服指令模式界面', label: '自然语言 / 指令模式', title: '把一句话拆成可执行的旅行意图', description: '指令模式解析用户的旅行表达，并将结果映射到计划等应用能力。解析逻辑已有自动化测试，仍应以实际演示范围为准。', source: 'AiCommandParser · TravelPlan', zoom: '智能指令模式' },
    writing: { image: '续写2.png', alt: '枢游记旅行记忆续写界面', label: '旅行日记 / 续写辅助', title: '当记忆有画面，文字也可以接着走', description: '在日记里选中已有文字后，智能续写提供表达建议。它是辅助创作，不替代用户真实的旅行感受。', source: 'MemoryEditor · AiService', zoom: '日记续写' }
  };
  let activeAi = 'culture';
  let aiSwap = 0;
  function setAi(key) {
    const data = aiCases[key];
    if (!data) return;
    activeAi = key;
    const ticket = ++aiSwap;
    const image = $('#aiImage');
    image.classList.add('is-changing');
    $$('[data-ai]').forEach(button => button.setAttribute('aria-selected', String(button.dataset.ai === key)));
    $('#aiLabel').textContent = data.label;
    $('#aiTitle').textContent = data.title;
    $('#aiDescription').textContent = data.description;
    $('#aiSource').textContent = data.source;
    $('#aiZoom').setAttribute('aria-label', `放大查看${data.zoom}界面`);
    window.setTimeout(() => {
      if (ticket !== aiSwap) return;
      image.src = `assets/${data.image}`;
      image.alt = data.alt;
      image.decode().catch(() => {}).finally(() => {
        if (ticket === aiSwap) image.classList.remove('is-changing');
      });
    }, motionOK ? 140 : 0);
  }
  $$('[data-ai]').forEach(button => button.addEventListener('click', () => setAi(button.dataset.ai)));

  const deviceData = {
    phone: { image: '手机端主页.png', alt: '枢游记手机端主页', description: '手机端以底部导航保持常用入口易触达，围绕修复与知识能力组织当前页面。', title: '手机端主页' },
    tablet: { image: '平板端主页.png', alt: '枢游记平板端主页', description: '平板端利用横向空间呈现侧边导航与多列内容；它不是把手机画面简单拉宽。', title: '平板端主页' }
  };
  let activeDevice = 'phone';
  let deviceSwap = 0;
  function setDevice(key) {
    const data = deviceData[key];
    if (!data) return;
    activeDevice = key;
    const ticket = ++deviceSwap;
    const image = $('#deviceImage');
    const screen = $('#deviceScreen');
    image.classList.add('is-changing');
    $$('[data-device]').forEach(button => button.setAttribute('aria-selected', String(button.dataset.device === key)));
    $('#deviceDescription').textContent = data.description;
    window.setTimeout(() => {
      if (ticket !== deviceSwap) return;
      image.src = `assets/${data.image}`;
      image.alt = data.alt;
      screen.classList.toggle('phone-view', key === 'phone');
      screen.classList.toggle('tablet-view', key === 'tablet');
      image.decode().catch(() => {}).finally(() => {
        if (ticket === deviceSwap) image.classList.remove('is-changing');
      });
    }, motionOK ? 140 : 0);
  }
  $$('[data-device]').forEach(button => button.addEventListener('click', () => setDevice(button.dataset.device)));

  // Native dialog preserves keyboard focus and gives a full-size, uncropped source image.
  const lightbox = $('#lightbox');
  function showLightbox(src, title, description, alt) {
    $('#lightboxImage').src = src;
    $('#lightboxImage').alt = alt || title;
    $('#lightboxTitle').textContent = title;
    $('#lightboxDescription').textContent = description || '';
    lightbox.showModal();
    document.body.classList.add('dialog-open');
  }
  $('#repairZoom').addEventListener('click', () => {
    const data = repairs[activeRepair];
    showLightbox(`assets/${data.image}`, data.title, data.text, data.alt);
  });
  $('#aiZoom').addEventListener('click', () => {
    const data = aiCases[activeAi];
    showLightbox(`assets/${data.image}`, data.zoom, data.description, data.alt);
  });
  $('#deviceZoom').addEventListener('click', () => {
    const data = deviceData[activeDevice];
    showLightbox(`assets/${data.image}`, data.title, data.description, data.alt);
  });
  $$('[data-lightbox]').forEach(button => button.addEventListener('click', () => {
    const [src, title, description] = button.dataset.lightbox.split('|');
    showLightbox(src, title, description, $('img', button).alt);
  }));
  $('#lightboxClose').addEventListener('click', () => lightbox.close());
  lightbox.addEventListener('click', event => { if (event.target === lightbox) lightbox.close(); });
  lightbox.addEventListener('close', () => document.body.classList.remove('dialog-open'));

  const presenter = $('#presenter');
  const openPresenter = () => {
    presenter.showModal();
    document.body.classList.add('dialog-open');
  };
  $('#presenterOpen').addEventListener('click', openPresenter);
  $('#presenterOpenBottom').addEventListener('click', openPresenter);
  $('#presenterClose').addEventListener('click', () => presenter.close());
  presenter.addEventListener('click', event => { if (event.target === presenter) presenter.close(); });
  presenter.addEventListener('close', () => document.body.classList.remove('dialog-open'));
  $$('[data-present]').forEach(button => button.addEventListener('click', () => {
    const target = $(`#${button.dataset.present}`);
    presenter.close();
    target?.scrollIntoView({ behavior: scrollBehavior, block: 'start' });
  }));
  let seconds = 0;
  let timerId = null;
  const renderTime = () => {
    const minutes = Math.floor(seconds / 60);
    $('#timerDisplay').textContent = `${String(minutes).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
  };
  $('#timerToggle').addEventListener('click', () => {
    if (timerId) {
      window.clearInterval(timerId);
      timerId = null;
    } else {
      timerId = window.setInterval(() => { seconds += 1; renderTime(); }, 1000);
    }
    $('#timerToggle').textContent = timerId ? '暂停计时' : '继续计时';
  });
  $('#timerReset').addEventListener('click', () => {
    window.clearInterval(timerId);
    timerId = null;
    seconds = 0;
    renderTime();
    $('#timerToggle').textContent = '开始计时';
  });

  const navLinks = $$('#primaryNav a');
  const navSections = ['top', 'problem', 'journey', 'repair', 'intelligence', 'memory', 'devices', 'proof']
    .map(id => $(`#${id}`)).filter(Boolean);
  let navFrame = null;
  let navObserver = null;
  function syncCurrentNav() {
    navFrame = null;
    const headerHeight = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header')) || 0;
    const activationLine = headerHeight + 72;
    let currentSection = navSections[0];
    navSections.forEach(section => {
      if (section.getBoundingClientRect().top <= activationLine) currentSection = section;
    });
    const selected = navLinks.find(link => link.hash === `#${currentSection?.id}`);
    navLinks.forEach(link => link.classList.toggle('is-current', link === selected));
    const currentHash = currentSection?.id && currentSection.id !== 'top' ? `#${currentSection.id}` : '';
    if (window.location.hash !== currentHash) {
      window.history.replaceState(window.history.state, '', `${window.location.pathname}${window.location.search}${currentHash}`);
    }
  }
  function scheduleNavSync() {
    if (navFrame === null) navFrame = window.requestAnimationFrame(syncCurrentNav);
  }
  function observeNavSections() {
    navObserver?.disconnect();
    const headerHeight = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header')) || 0;
    const topInset = Math.round(headerHeight + 72);
    const bottomInset = Math.max(0, window.innerHeight - topInset - 96);
    navObserver = new IntersectionObserver(scheduleNavSync, {
      rootMargin: `-${topInset}px 0px -${bottomInset}px 0px`,
      threshold: 0
    });
    navSections.forEach(section => navObserver.observe(section));
    scheduleNavSync();
  }
  observeNavSections();
  window.addEventListener('resize', observeNavSections, { passive: true });
  window.addEventListener('hashchange', scheduleNavSync);

  // Arrow keys move between tabs without a pointer.
  $$('[role="tablist"]').forEach(group => {
    group.addEventListener('keydown', event => {
      if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) return;
      const tabs = $$('[role="tab"]', group);
      const current = tabs.indexOf(document.activeElement);
      if (current < 0) return;
      event.preventDefault();
      let next = current;
      if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = tabs.length - 1;
      else next = (current + (event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1 : -1) + tabs.length) % tabs.length;
      tabs[next].focus();
      tabs[next].click();
    });
  });
})();
