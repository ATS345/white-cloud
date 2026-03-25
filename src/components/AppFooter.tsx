import React from 'react';
import { Layout } from 'antd';

const { Footer } = Layout;

const AppFooter: React.FC = () => {
  return (
    <Footer style={{ textAlign: 'center', background: '#001529', color: 'white' }}>
      <div style={{ marginBottom: '16px' }}>
        <a href="#" style={{ color: 'white', margin: '0 16px' }}>
          关于我们
        </a>
        <a href="#" style={{ color: 'white', margin: '0 16px' }}>
          服务条款
        </a>
        <a href="#" style={{ color: 'white', margin: '0 16px' }}>
          隐私政策
        </a>
        <a href="#" style={{ color: 'white', margin: '0 16px' }}>
          联系我们
        </a>
      </div>
      <div>
        © 2024 云幕游戏平台. All rights reserved.
      </div>
    </Footer>
  );
};

export default AppFooter;