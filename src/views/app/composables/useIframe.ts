import { ref } from 'vue'
import { message } from 'ant-design-vue'

// 定义 iframe 窗口类型
interface IframeWindow extends Window {
  __editModeDestroy?: () => void
}

interface ElementInfo {
  tagName: string
  id: string
  className: string
  textContent: string
  selector: string
  pagePath: string
  currentUrl: string
  routePath: string
  rect: {
    top: number
    left: number
    width: number
    height: number
  }
}

export function useIframe() {
  const selectedElementInfo = ref<string>('')

  const getEditModeScript = () => {
    return `
(function() {
  let isEditMode = true;
  let currentHoverElement = null;
  let currentSelectedElement = null;

  function injectStyles() {
    if (document.getElementById('edit-mode-styles')) return;
    const style = document.createElement('style');
    style.id = 'edit-mode-styles';
    style.textContent = '.edit-hover { outline: 2px dashed #1890ff !important; outline-offset: 2px !important; cursor: crosshair !important; transition: outline 0.2s ease !important; position: relative !important; } .edit-hover::before { content: "" !important; position: absolute !important; top: -4px !important; left: -4px !important; right: -4px !important; bottom: -4px !important; background: rgba(24, 144, 255, 0.02) !important; pointer-events: none !important; z-index: -1 !important; } .edit-selected { outline: 3px solid #52c41a !important; outline-offset: 2px !important; cursor: default !important; position: relative !important; } .edit-selected::before { content: "" !important; position: absolute !important; top: -4px !important; left: -4px !important; right: -4px !important; bottom: -4px !important; background: rgba(82, 196, 26, 0.03) !important; pointer-events: none !important; z-index: -1 !important; }';
    document.head.appendChild(style);
  }

  function generateSelector(element) {
    const path = [];
    let current = element;
    while (current && current !== document.body) {
      let selector = current.tagName.toLowerCase();
      if (current.id) {
        selector += '#' + current.id;
        path.unshift(selector);
        break;
      }
      if (current.className) {
        const classes = current.className.split(' ').filter(function(c) { return c && !c.startsWith('edit-'); });
        if (classes.length > 0) {
          selector += '.' + classes.join('.');
        }
      }
      const siblings = Array.from(current.parentElement ? current.parentElement.children : []);
      const index = siblings.indexOf(current) + 1;
      selector += ':nth-child(' + index + ')';
      path.unshift(selector);
      current = current.parentElement;
    }
    return path.join(' > ');
  }

  function getElementInfo(element) {
    const rect = element.getBoundingClientRect();
    let pagePath = window.location.search + window.location.hash;
    if (!pagePath) {
      pagePath = '';
    }

    // 获取完整的当前页面URL
    const currentUrl = window.location.href;
    
    // 解析hash中的路由信息
    const hash = window.location.hash;
    let routePath = '';
    if (hash) {
      // 移除#符号并获取路由路径
      routePath = hash.substring(1);
      // 如果有查询参数，移除它们
      const queryIndex = routePath.indexOf('?');
      if (queryIndex !== -1) {
        routePath = routePath.substring(0, queryIndex);
      }
    }

    return {
      tagName: element.tagName,
      id: element.id,
      className: element.className,
      textContent: element.textContent ? element.textContent.trim().substring(0, 100) : '',
      selector: generateSelector(element),
      pagePath: pagePath,
      currentUrl: currentUrl,
      routePath: routePath,
      rect: {
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height
      }
    };
  }

  function clearHoverEffect() {
    if (currentHoverElement) {
      currentHoverElement.classList.remove('edit-hover');
      currentHoverElement = null;
    }
  }

  function clearSelectedEffect() {
    const selected = document.querySelectorAll('.edit-selected');
    selected.forEach(function(el) { el.classList.remove('edit-selected'); });
    currentSelectedElement = null;
  }

  let eventListenersAdded = false;

  function addEventListeners() {
    if (eventListenersAdded) return;

    const mouseoverHandler = function(event) {
      if (!isEditMode) return;
      const target = event.target;
      if (target === currentHoverElement || target === currentSelectedElement) return;
      if (target === document.body || target === document.documentElement) return;
      if (target.tagName === 'SCRIPT' || target.tagName === 'STYLE') return;

      clearHoverEffect();
      target.classList.add('edit-hover');
      currentHoverElement = target;
    };

    const mouseoutHandler = function(event) {
      if (!isEditMode) return;
      const target = event.target;
      if (!event.relatedTarget || !target.contains(event.relatedTarget)) {
        clearHoverEffect();
      }
    };

    const clickHandler = function(event) {
      if (!isEditMode) return;
      event.preventDefault();
      event.stopPropagation();

      const target = event.target;
      if (target === document.body || target === document.documentElement) return;
      if (target.tagName === 'SCRIPT' || target.tagName === 'STYLE') return;

      clearSelectedEffect();
      clearHoverEffect();

      target.classList.add('edit-selected');
      currentSelectedElement = target;

      const elementInfo = getElementInfo(target);
      try {
        window.parent.postMessage({
          type: 'ELEMENT_SELECTED',
          data: { elementInfo: elementInfo }
        }, '*');
      } catch (e) {
        // 静默处理发送失败
      }
    };

    document.body.addEventListener('mouseover', mouseoverHandler, true);
    document.body.addEventListener('mouseout', mouseoutHandler, true);
    document.body.addEventListener('click', clickHandler, true);
    eventListenersAdded = true;
  }

  function setupEventListeners() {
    addEventListeners();
  }

  window.addEventListener('message', function(event) {
    const data = event.data;
    switch (data.type) {
      case 'TOGGLE_EDIT_MODE':
        isEditMode = data.editMode;
        if (isEditMode) {
          injectStyles();
          setupEventListeners();
          showEditTip();
        } else {
          clearHoverEffect();
          clearSelectedEffect();
        }
        break;
      case 'CLEAR_SELECTION':
        clearSelectedEffect();
        break;
      case 'CLEAR_ALL_EFFECTS':
        isEditMode = false;
        clearHoverEffect();
        clearSelectedEffect();
        const tip = document.getElementById('edit-tip');
        if (tip) tip.remove();
        break;
    }
  });

  function showEditTip() {
    if (document.getElementById('edit-tip')) return;
    const tip = document.createElement('div');
    tip.id = 'edit-tip';
    tip.innerHTML = '🎯 编辑模式已开启<br/>悬浮查看元素，点击选中元素';
    tip.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #1890ff; color: white; padding: 12px 16px; border-radius: 6px; font-size: 14px; z-index: 9999; box-shadow: 0 4px 12px rgba(0,0,0,0.15);';
    
    const style = document.createElement('style');
    style.textContent = '@keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }';
    document.head.appendChild(style);
    document.body.appendChild(tip);
    
    setTimeout(function() {
      if (tip.parentNode) {
        tip.style.animation = 'fadeIn 0.3s ease reverse';
        setTimeout(function() { tip.remove(); }, 300);
      }
    }, 3000);
  }

  injectStyles();
  setupEventListeners();
  showEditTip();
})();
`
  }

  // 注入编辑脚本到 iframe
  const injectEditScriptToIframe = () => {
    const iframe = document.querySelector('iframe') as HTMLIFrameElement
    if (!iframe) {
      message.error('未找到 iframe')
      return
    }

    try {
      // 等待 iframe 加载完成
      iframe.onload = function () {
        const iframeDoc =
          iframe.contentDocument || (iframe.contentWindow ? iframe.contentWindow.document : null)
        if (iframeDoc) {
          const script = iframeDoc.createElement('script')
          script.textContent = getEditModeScript()
          iframeDoc.head.appendChild(script)
          message.success('已进入编辑模式')
        }
      }

      // 如果 iframe 已经加载，立即注入
      if (iframe.contentDocument && iframe.contentDocument.readyState === 'complete') {
        const iframeDoc = iframe.contentDocument
        const script = iframeDoc.createElement('script')
        script.textContent = getEditModeScript()
        iframeDoc.head.appendChild(script)
        message.success('已进入编辑模式')
      }
    } catch (error) {
      console.error('注入脚本失败:', error)
      message.error('注入脚本失败')
    }
  }

  // 从 iframe 移除编辑脚本
  const removeEditScriptFromIframe = () => {
    const iframe = document.querySelector('iframe') as HTMLIFrameElement
    if (!iframe) return

    try {
      const iframeWindow = iframe.contentWindow as IframeWindow
      if (iframeWindow && iframeWindow.__editModeDestroy) {
        iframeWindow.__editModeDestroy()
        message.info('已退出编辑模式')
      }
    } catch (error) {
      console.error('移除脚本失败:', error)
    }
  }

  // 处理 iframe 消息
  const handleIframeMessage = (event: MessageEvent) => {
    if (event.data.type === 'ELEMENT_SELECTED') {
      const elementInfo = event.data.data.elementInfo as ElementInfo
      console.log('路由', elementInfo.pagePath, elementInfo.routePath)
      const routeInfo = '路由: ' + (elementInfo.routePath || '未知')

      const infoStr =
        `${routeInfo}\n` +
        `${elementInfo.tagName}` +
        `${elementInfo.id ? '#' + elementInfo.id : ''}` +
        `${elementInfo.className ? '.' + elementInfo.className.replace(/\s+/g, '.') : ''}\n` +
        `${elementInfo.textContent ? '文本: ' + elementInfo.textContent.substring(0, 50) : ''}\n` +
        `${elementInfo.selector ? '选择器: ' + elementInfo.selector : ''}`
      selectedElementInfo.value = infoStr
    }
  }

  // 切换编辑模式
  const toggleEditMode = (enabled: boolean) => {
    const iframe = document.querySelector('iframe') as HTMLIFrameElement
    if (!iframe || !iframe.contentWindow) return

    iframe.contentWindow.postMessage(
      {
        type: 'TOGGLE_EDIT_MODE',
        editMode: enabled,
      },
      '*',
    )
  }

  // 清除选中状态
  const clearSelection = () => {
    const iframe = document.querySelector('iframe') as HTMLIFrameElement
    if (!iframe || !iframe.contentWindow) return

    iframe.contentWindow.postMessage(
      {
        type: 'CLEAR_SELECTION',
      },
      '*',
    )
  }

  // 清除所有效果
  const clearAllEffects = () => {
    const iframe = document.querySelector('iframe') as HTMLIFrameElement
    if (!iframe || !iframe.contentWindow) return

    iframe.contentWindow.postMessage(
      {
        type: 'CLEAR_ALL_EFFECTS',
      },
      '*',
    )
  }

  // 添加消息监听器
  const addMessageListener = () => {
    window.addEventListener('message', handleIframeMessage)
  }

  // 移除消息监听器
  const removeMessageListener = () => {
    window.removeEventListener('message', handleIframeMessage)
  }

  return {
    selectedElementInfo,
    injectEditScriptToIframe,
    removeEditScriptFromIframe,
    toggleEditMode,
    clearSelection,
    clearAllEffects,
    addMessageListener,
    removeMessageListener,
  }
}
