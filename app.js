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
    dehaze: {
      index: '02 / LOCAL IMAGE PROCESSING',
      heading: '先减轻雾感，\n再找回照片层次。',
      text: '去雾界面运行在应用内的本地 WebView，处理流程在页面端完成，不需要云端修图 API。此处展示处理链路示意，不伪造前后效果图，也不把旧界面当成新版截图。',
      facts: [['处理方式', '本地 WebView 图像处理'], ['外部依赖', '无需云端 API'], ['展示状态', '流程示意，非新界面截图']],
      title: '去雾处理',
      process: { badge: '本地处理 · 无需 API', title: '去雾处理流程', steps: [['01', '选择照片', '导入旅行原图'], ['02', '调整雾感', '按需设置处理强度'], ['03', '预览结果', '检查效果后保存']] }
    },
    enhance: {
      index: '03 / BACKEND INFERENCE',
      heading: '细节放大，\n需要推理服务接力。',
      text: '工程里的 4× 图像增强页面会把图片提交到已配置的后端 /enhance 接口，再接收增强结果。要现场看到真实结果，必须有可访问的兼容服务；网页里的流程卡只做说明，不会上传照片或调用 API。',
      facts: [['处理方式', '4× 超分辨率增强'], ['接口路径', 'POST /enhance'], ['运行条件', '可访问的推理后端']],
      title: 'AI 图像增强',
      process: { badge: '需要配置后端 API', title: 'AI 清晰化处理流程', steps: [['01', '选择照片', '在增强页面导入图片'], ['02', '提交推理', '发送到后端 /enhance'], ['03', '接收结果', '返回 4× 增强图像']] }
    },
    edit: {
      image: '手动修图页面.png', width: 1280, height: 2832, alt: '枢游记手动修图界面', index: '04 / MANUAL EDIT',
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
    const zoom = $('#repairZoom');
    const process = $('#repairProcess');
    zoom.hidden = !data.image;
    process.hidden = Boolean(data.image);
    if (data.image) {
      zoom.setAttribute('aria-label', `放大查看${data.title}界面`);
    } else {
      process.innerHTML = `<div class="process-heading"><span>${data.process.badge}</span><strong>${data.process.title}</strong><small>功能链路示意 · 并非实时调用</small></div><div class="process-flow">${data.process.steps.map(([number, title, detail]) => `<div class="process-step"><span>${number}</span><strong>${title}</strong><small>${detail}</small></div>`).join('<i aria-hidden="true">→</i>')}</div><p class="process-disclaimer">${key === 'enhance' ? '展示时不会发送照片；真实增强需要在应用中配置并连通推理服务。' : '展示真实处理入口的工作步骤，不代表此页面正在运行图像算法。'}</p>`;
    }
    window.setTimeout(() => {
      if (ticket !== repairSwap) return;
      if (!data.image) {
        image.classList.remove('is-changing');
        return;
      }
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
    culture: { image: '文化知识获取_智能体.png', width: 1280, height: 2832, alt: '新版枢游记知识页，展示新手引导与功能介绍', label: '文化知识 / 本地资料与智能追问', title: '从景区资料开始，再继续追问', description: '当前截图展示新版知识入口与新手引导；知识内容由本地资料库提供，智能体模式可调用云端模型继续对话。右侧标明两种路径的运行条件，网页本身不会请求模型 API。', source: 'Local Knowledge Base · Cloud AI Agent', zoom: '新版知识入口与新手引导' },
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

  const devices = {
    phone: {
      image: '手机端主页.png', width: 1280, height: 2832,
      alt: '枢游记新版手机端主页，展示照片上传与文化知识入口',
      description: '新版手机端首页完整运行截图：上传照片、进入文化知识和底部常用导航都在同一张图中。',
      title: '新版手机端主页截图'
    },
    tablet: {
      image: '平板端模拟器截图_20261026.jpeg', width: 3120, height: 2080,
      alt: 'MatePad Pro 13 模拟器中的枢游记新版修复页，完整显示上传照片与文化知识入口',
      description: 'MatePad Pro 13 模拟器当前画面，展示新版修复入口、照片上传区与文化知识入口。截图保留屏幕完整画面和原始比例。',
      title: 'MatePad Pro 13 模拟器·新版修复页'
    }
  };
  let currentDevice = devices.phone;
  function setDevice(device) {
    const key = devices[device] ? device : 'phone';
    currentDevice = devices[key];
    const isTablet = key === 'tablet';
    $$('[data-device]').forEach(button => button.setAttribute('aria-selected', String(button.dataset.device === key)));
    const image = $('#deviceImage');
    image.classList.add('is-changing');
    image.src = assetUrl(`assets/${currentDevice.image}`);
    image.width = currentDevice.width;
    image.height = currentDevice.height;
    image.alt = currentDevice.alt;
    $('#deviceScreen').classList.toggle('tablet-view', isTablet);
    $('#deviceScreen').classList.toggle('phone-view', !isTablet);
    $('#deviceScreen').setAttribute('aria-label', `${isTablet ? '平板端' : '手机端'}完整运行截图`);
    $('#deviceLabel').textContent = isTablet ? '平板端 · MatePad Pro 13 模拟器截图' : '新版手机端 · 当前运行截图';
    $('#deviceDescription').textContent = currentDevice.description;
    $('#deviceZoom').hidden = false;
    image.addEventListener('load', () => image.classList.remove('is-changing'), { once: true });
  }
  $$('[data-device]').forEach(button => button.addEventListener('click', () => setDevice(button.dataset.device)));
  $$('[data-scroll-to-ai]').forEach(button => button.addEventListener('click', () => {
    window.location.hash = 'intelligence';
    $('#intelligence').scrollIntoView({ behavior: scrollBehavior, block: 'start' });
  }));

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
    if (!data?.image) return;
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
