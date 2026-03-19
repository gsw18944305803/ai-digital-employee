// 新的AI专利搜索菜单项处理函数
function addPatentSearchMenuItemFixed() {
  // 检查是否已经处理过
  if (document.getElementById('patent-search-sidebar-item')) {
    return;
  }

  // 知道页面完全加载后执行
  setTimeout(function() {
    // 查找学术相关区域
    const nav = document.querySelector('nav');
    if (!nav) {
      console.log('未找到导航区域');
      return;
    }

    // 遍历所有菜单项，    const allDivs = nav.querySelectorAll('div');
    let academicParent = null;
    let academicSubmenu = null;

    allDivs.forEach(div => {
      const text = div.textContent || '';
      // 查找学术相关的父容器
      if (text.includes('学术相关') && text.length < 20) {
        academicParent = div.parentElement;
      }
      // 查找包含"快速检索专利信息"的菜单项并隐藏
      if (text.includes('快速检索专利信息') && text.length < 50) {
        // 向上找到整个菜单项容器
        let menuItem = div;
        while (menuItem.parentElement && menuItem.parentElement !== nav) {
          const parentText = menuItem.parentElement.textContent || '';
          if (parentText.includes('快速检索专利信息') && parentText.length < 100) {
            menuItem = menuItem.parentElement;
          } else {
            break;
          }
        }
        // 飘藏这个菜单项
        if (menuItem.textContent && menuItem.textContent.includes('快速检索专利信息')) {
          console.log('找到并隐藏系统自带的AI专利搜索');
          menuItem.style.display = 'none';
          academicSubmenu = menuItem.parentElement;
        }
      }
    });

    // 找到学术相关的子菜单容器
    if (!academicSubmenu && academicParent) {
      // 尝试从学术相关父容器的兄弟元素中找到
      const siblings = academicParent.parentElement.children;
      for (let i = 0; i < siblings.length; i++) {
        if (siblings[i].querySelector) '[style*="overflow"]') ||
            (siblings[i].children.length > 1 && siblings[i] !== academicParent)) {
          academicSubmenu = siblings[i];
          break;
        }
      }
    }

    if (!academicSubmenu) {
      // 最后尝试：找任何包含AI学术论文搜索的容器的父元素
      const paperSearchDiv = document.querySelector('div');
      if (paperSearchDiv && paperSearchDiv.textContent.includes('AI学术论文搜索')) {
        academicSubmenu = paperSearchDiv.parentElement;
        while (academicSubmenu && academicSubmenu.children.length === 1) {
          academicSubmenu = academicSubmenu.parentElement;
        }
      }
    }

    if (!academicSubmenu) {
      console.log('未找到学术相关子菜单容器');
      return;
    }

    // 创建新的菜单项
    const newItem = document.createElement('div');
    newItem.id = 'patent-search-sidebar-item';
    newItem.style.cssText = 'display: flex; align-items: center; gap: 8px; padding: 12px 16px; cursor: pointer; transition: all 0.2s ease; border-radius: 8px;';
    newItem.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: #667eea;">
        <circle cx="11" cy="11" r="8"></circle>
        <path d="m21 21-4.3-4.3"></path>
      </svg>
      <div>
        <div style="font-size: 14px; font-weight: 500; color: inherit;">AI专利搜索</div>
        <div style="font-size: 12px; color: #888;">搜索全球专利信息</div>
      </div>
    `;

    // 添加点击事件
    newItem.addEventListener('click', function() {
      window.location.href = 'patent-search.html';
    });

    // 添加悬停效果
    newItem.addEventListener('mouseenter', function() {
      this.style.background = 'rgba(102, 126, 234, 0.1)';
    });
    newItem.addEventListener('mouseleave', function() {
      this.style.background = 'transparent';
    });

    // 添加到子菜单
    academicSubmenu.appendChild(newItem);
    console.log('AI专利搜索菜单项已添加');
  }, 500);  // 延迟500ms确保页面完全加载
}

