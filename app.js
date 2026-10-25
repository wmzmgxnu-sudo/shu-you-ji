(() => {
  'use strict';

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const assetUrl = path => `${path}${path.includes('?') ? '&' : '?'}v=20261025-journey-v8`;
  const productImage = name => assetUrl(`assets/${name}`);
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

  const journeyChapters = $$('.journey-chapter');
  const journeyLinks = $$('[data-journey-link]');
  let journeyFrame = null;
  function syncJourneyLinks() {
    journeyFrame = null;
    const section = $('#journey').getBoundingClientRect();
    if (section.bottom <= 0 || section.top >= window.innerHeight) return;
    const focusLine = window.innerHeight * .55;
    const current = journeyChapters.reduce((closest, chapter) => {
      const bounds = chapter.getBoundingClientRect();
      const distance = Math.abs((bounds.top + bounds.bottom) / 2 - focusLine);
      return distance < closest.distance ? { chapter, distance } : closest;
    }, { chapter: journeyChapters[0], distance: Infinity }).chapter;
    journeyLinks.forEach(link => {
      const selected = link.dataset.journeyLink === current.dataset.scene;
      link.classList.toggle('is-current', selected);
      if (selected) link.setAttribute('aria-current', 'step');
      else link.removeAttribute('aria-current');
    });
  }
  window.addEventListener('scroll', () => {
    if (journeyFrame === null) journeyFrame = window.requestAnimationFrame(syncJourneyLinks);
    scheduleNavSync();
  }, { passive: true });
  window.addEventListener('resize', syncJourneyLinks, { passive: true });
  syncJourneyLinks();

  const repairs = {
    entry: {
      image: '手机端主页.png', width: 1280, height: 2832, alt: '枢游记当前原生修复首页，提供照片上传、去雾与增强入口', index: '01 / CURRENT APP',
      heading: '从新版修复首页，\n进入需要的工具。',
      text: '这张截图来自当前应用的原生首页，展示照片上传入口与去雾、增强、上色能力。它不冒充旧版嵌入页面的操作截图。',
      facts: [['当前画面', '新版原生修复首页'], ['功能入口', '上传照片后选择修复工具'], ['图片显示', '完整原图比例，可点击放大']],
      title: '新版修复首页'
    },
    edit: {
      image: '手动修图页面.png', width: 1280, height: 2832, alt: '枢游记手动修图界面', index: '03 / MANUAL EDIT',
      heading: '自动之外，\n也保留人的判断。',
      text: '手动编辑为用户提供自主调节空间。自动处理负责起点，而画面的最终表达仍由使用者决定。',
      facts: [['处理方式', '手动参数与可视化调整'], ['交互特点', '边看边调、即时反馈'], ['使用场景', '需要个人审美判断的照片']],
      title: '手动修图'
    }
  };
  let activeRepair = 'entry';
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
      image.width = data.width;
      image.height = data.height;
      image.src = productImage(data.image);
      image.alt = data.alt;
      image.decode().catch(() => {}).finally(() => {
        if (ticket === repairSwap) image.classList.remove('is-changing');
      });
    }, motionOK ? 140 : 0);
  }
  $$('[data-repair]').forEach(button => button.addEventListener('click', () => setRepair(button.dataset.repair)));

  const aiCases = {
    culture: { image: '文化知识获取_智能体.png', width: 1280, height: 2832, alt: '新版枢游记知识页，展示新手引导与功能介绍', label: '知识页 / 新手引导入口', title: '先了解工具，再继续探索目的地', description: '新版知识页提供核心功能介绍与可重新打开的新手引导入口。本图呈现知识页当前状态；目的地问答由智能体模式承载，可围绕景点继续深入提问。', source: 'Knowledge Page · User Guide · Agent Mode', zoom: '新版知识页与新手引导' },
    photo: { image: '智能客服_新版对话.png', width: 1280, height: 2832, alt: '新版枢游记智能客服对话界面与旅行计划快捷入口', label: '智能助手 / 对话与快捷入口', title: '从一段对话开始，找到合适的旅行工具', description: '这是从当前应用重新截取的智能客服对话界面，展示欢迎说明和旅行计划快捷入口。截图不展示图片识别结果；图片上传入口在修复首页。', source: 'Assistant Chat · Plan Shortcut', zoom: '新版智能客服对话界面' },
    command: { image: '旅行计划.png', width: 1280, height: 2832, alt: '新版枢游记旅行计划列表与计划详情', label: '旅行计划 / 行程管理', title: '把旅行安排放进一张可继续编辑的计划里', description: '当前应用的旅行计划页展示行程状态、日期、备忘和编辑入口。智能客服提供计划模板快捷入口；计划详情以这张新版界面为准。', source: 'TravelPlan · Notes · Expense Entry', zoom: '新版旅行计划页面' },
    writing: { image: '旅行记忆.png', width: 1280, height: 2832, alt: '新版枢游记旅行记忆首页，展示新建记忆与照片地图入口', label: '旅行记忆 / 新建入口', title: '先把地点、照片和故事收进同一段记忆', description: '新版旅行记忆页展示新建记忆、照片地图和照片成卡入口。本图用于说明记忆的记录入口，不再使用旧版续写截图代替当前界面。', source: 'Travel Memory · Photo Map', zoom: '新版旅行记忆页面' }
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
    $('#aiZoom').setAttribute('aria-label', `放大查看${data.zoom}`);
    $('#aiZoom').classList.toggle('is-landscape', data.width > data.height);
    window.setTimeout(() => {
      if (ticket !== aiSwap) return;
      image.width = data.width;
      image.height = data.height;
      image.src = productImage(data.image);
      image.alt = data.alt;
      image.decode().catch(() => {}).finally(() => {
        if (ticket === aiSwap) image.classList.remove('is-changing');
      });
    }, motionOK ? 140 : 0);
  }
  $$('[data-ai]').forEach(button => button.addEventListener('click', () => setAi(button.dataset.ai)));

  const currentDevice = {
    image: '手机端主页.png', width: 1280, height: 2832,
    alt: '枢游记新版手机端主页，展示照片上传与文化知识入口',
    description: '新版手机端首页完整截图：上传照片、进入文化知识和底部常用导航都在同一张实机画面中。',
    title: '新版手机端主页'
  };

  // Native dialog preserves keyboard focus and gives a full-size, uncropped source image.
  const lightbox = $('#lightbox');
  function showLightbox(src, title, description, alt, width = 480, height = 1017) {
    const lightboxImage = $('#lightboxImage');
    lightboxImage.width = width > 0 ? width : 480;
    lightboxImage.height = height > 0 ? height : 1017;
    lightboxImage.src = assetUrl(src);
    lightboxImage.alt = alt || title;
    $('#lightboxTitle').textContent = title;
    $('#lightboxDescription').textContent = description || '';
    lightbox.showModal();
    document.body.classList.add('dialog-open');
  }
  $('#repairZoom').addEventListener('click', () => {
    const data = repairs[activeRepair];
    showLightbox(`assets/${data.image}`, data.title, data.text, data.alt, data.width, data.height);
  });
  $('#aiZoom').addEventListener('click', () => {
    const data = aiCases[activeAi];
    showLightbox(`assets/${data.image}`, data.zoom, data.description, data.alt, data.width, data.height);
  });
  $('#deviceZoom').addEventListener('click', () => {
    const data = currentDevice;
    showLightbox(`assets/${data.image}`, data.title, data.description, data.alt, data.width, data.height);
  });
  $$('[data-lightbox]').forEach(button => button.addEventListener('click', () => {
    const [src, title, description] = button.dataset.lightbox.split('|');
    const image = $('img', button);
    showLightbox(src, title, description, image.alt, image.naturalWidth, image.naturalHeight);
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
    let currentHash = currentSection?.id && currentSection.id !== 'top' ? `#${currentSection.id}` : '';
    if (currentSection?.id === 'journey') {
      const currentChapter = journeyChapters.find(chapter => {
        const bounds = chapter.getBoundingClientRect();
        return bounds.top <= activationLine && bounds.bottom > activationLine;
      });
      if (currentChapter) currentHash = `#${currentChapter.id}`;
    }
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
