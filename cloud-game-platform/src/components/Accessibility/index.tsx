import { useState, useEffect } from 'react';
import { Button, Switch, Dropdown, Tooltip } from 'antd';
import { 
  EyeOutlined, 
  FontSizeOutlined, 
  BgColorsOutlined, 
  HighlightOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined
} from '@ant-design/icons';
import './index.css';

const Accessibility: React.FC = () => {
  // 初始化状态 - 从localStorage加载设置
  const initializeSettings = () => {
    const savedHighContrast = localStorage.getItem('highContrast') === 'true';
    const savedLargeText = localStorage.getItem('largeText') === 'true';
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    return { savedHighContrast, savedLargeText, savedDarkMode };
  };

  // 初始化状态
  const { savedHighContrast, savedLargeText, savedDarkMode } = initializeSettings();
  
  const [highContrast, setHighContrast] = useState(savedHighContrast);
  const [largeText, setLargeText] = useState(savedLargeText);
  const [darkMode, setDarkMode] = useState(savedDarkMode);
  const [fullscreen, setFullscreen] = useState(false);

  // 应用无障碍设置
  const applySettings = (highContrast: boolean, largeText: boolean, darkMode: boolean) => {
    const root = document.documentElement;
    
    // 高对比度模式
    if (highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
    
    // 大字体模式
    if (largeText) {
      root.classList.add('large-text');
    } else {
      root.classList.remove('large-text');
    }
    
    // 深色模式
    if (darkMode) {
      root.setAttribute('data-theme', 'dark');
    } else {
      root.setAttribute('data-theme', 'light');
    }
    
    // 保存到本地存储
    localStorage.setItem('highContrast', highContrast.toString());
    localStorage.setItem('largeText', largeText.toString());
    localStorage.setItem('darkMode', darkMode.toString());
  };

  // 初始化应用设置
  useEffect(() => {
    applySettings(highContrast, largeText, darkMode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 切换高对比度模式
  const toggleHighContrast = () => {
    const newValue = !highContrast;
    setHighContrast(newValue);
    applySettings(newValue, largeText, darkMode);
  };

  // 切换大字体模式
  const toggleLargeText = () => {
    const newValue = !largeText;
    setLargeText(newValue);
    applySettings(highContrast, newValue, darkMode);
  };

  // 切换深色模式
  const toggleDarkMode = () => {
    const newValue = !darkMode;
    setDarkMode(newValue);
    applySettings(highContrast, largeText, newValue);
  };

  // 切换全屏模式
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
      setFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setFullscreen(false);
      }
    }
  };

  // 菜单选项
  const menuItems = [
    {
      key: '1',
      label: (
        <div className="accessibility-option">
          <EyeOutlined className="option-icon" />
          <span>高对比度模式</span>
          <Switch 
            checked={highContrast} 
            onChange={toggleHighContrast}
            aria-label="切换高对比度模式"
          />
        </div>
      ),
    },
    {
      key: '2',
      label: (
        <div className="accessibility-option">
          <FontSizeOutlined className="option-icon" />
          <span>大字体模式</span>
          <Switch 
            checked={largeText} 
            onChange={toggleLargeText}
            aria-label="切换大字体模式"
          />
        </div>
      ),
    },
    {
      key: '3',
      label: (
        <div className="accessibility-option">
          <BgColorsOutlined className="option-icon" />
          <span>深色模式</span>
          <Switch 
            checked={darkMode} 
            onChange={toggleDarkMode}
            aria-label="切换深色模式"
          />
        </div>
      ),
    },
    {
      key: '4',
      label: (
        <Button 
          type="text" 
          icon={fullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
          onClick={toggleFullscreen}
          className="fullscreen-btn"
          aria-label={fullscreen ? "退出全屏模式" : "进入全屏模式"}
        >
          {fullscreen ? "退出全屏" : "全屏模式"}
        </Button>
      ),
    },
  ];

  return (
    <div className="accessibility-component">
      <Dropdown 
        menu={{ items: menuItems }} 
        placement="bottomRight"
        trigger={['click']}
      >
        <Tooltip title="无障碍设置">
          <Button 
            type="primary" 
            icon={<HighlightOutlined />} 
            className="accessibility-toggle"
            aria-label="打开无障碍设置"
          >
            无障碍
          </Button>
        </Tooltip>
      </Dropdown>
    </div>
  );
};

export default Accessibility;
