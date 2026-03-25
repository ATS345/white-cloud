import React from 'react';
import { Typography, Card } from 'antd';

const { Title, Paragraph, Text } = Typography;

const Terms: React.FC = () => {
  return (
    <div style={{ padding: '40px 20px', maxWidth: '900px', margin: '0 auto' }}>
      <Card style={{ borderRadius: '12px' }}>
        <Title level={1} style={{ textAlign: 'center', marginBottom: '40px' }}>
          服务条款
        </Title>
        
        <Paragraph type="secondary" style={{ textAlign: 'center', marginBottom: '40px' }}>
          最后更新日期：2026年3月14日
        </Paragraph>

        <Title level={2}>1. 服务协议的接受</Title>
        <Paragraph>
          欢迎使用云幕游戏商店平台（以下简称"本平台"）。在使用本平台提供的服务之前，请您仔细阅读以下服务条款。
          一旦您使用本平台的服务，即表示您已充分理解并同意接受本服务条款的全部内容。
        </Paragraph>

        <Title level={2}>2. 服务内容</Title>
        <Paragraph>
          本平台为用户提供游戏浏览、购买、下载、社区互动等服务。具体服务内容包括但不限于：
        </Paragraph>
        <ul>
          <li>游戏信息浏览和搜索</li>
          <li>游戏购买和支付服务</li>
          <li>游戏下载和更新服务</li>
          <li>用户社区和互动功能</li>
          <li>客户支持服务</li>
        </ul>

        <Title level={2}>3. 用户账号</Title>
        <Paragraph>
          <Text strong>3.1 账号注册</Text><br />
          用户需要注册账号才能使用本平台的部分服务。注册时，您需要提供真实、准确、完整的信息，
          并及时更新您的信息以保持其准确性。
        </Paragraph>
        <Paragraph>
          <Text strong>3.2 账号安全</Text><br />
          您有责任保护您的账号安全，包括但不限于妥善保管密码、不将账号借给他人使用等。
          如发现账号被盗用或存在安全风险，请立即通知我们。
        </Paragraph>
        <Paragraph>
          <Text strong>3.3 账号注销</Text><br />
          您可以随时申请注销账号。账号注销后，您将无法继续使用相关服务，且账号中的数据将被删除或匿名化处理。
        </Paragraph>

        <Title level={2}>4. 用户行为规范</Title>
        <Paragraph>
          使用本平台服务时，您承诺不从事以下行为：
        </Paragraph>
        <ul>
          <li>发布违法、有害、虚假或侵权信息</li>
          <li>干扰或破坏服务的正常运行</li>
          <li>未经授权访问他人账号或数据</li>
          <li>利用平台进行欺诈或其他违法活动</li>
          <li>侵犯他人知识产权或其他合法权益</li>
        </ul>

        <Title level={2}>5. 知识产权</Title>
        <Paragraph>
          本平台上的所有内容，包括但不限于文字、图片、音频、视频、软件、商标等，
          均受相关知识产权法律保护。未经授权，您不得复制、修改、传播或用于商业目的。
        </Paragraph>

        <Title level={2}>6. 购买和退款</Title>
        <Paragraph>
          <Text strong>6.1 购买流程</Text><br />
          用户可以通过本平台购买游戏。购买前请仔细阅读游戏详情，确认购买后不支持随意退款。
        </Paragraph>
        <Paragraph>
          <Text strong>6.2 退款政策</Text><br />
          在以下情况下，您可以申请退款：
          <ul>
            <li>游戏存在严重技术问题，无法正常运行</li>
            <li>游戏描述与实际内容严重不符</li>
            <li>购买后未下载或激活游戏（限7天内）</li>
          </ul>
        </Paragraph>

        <Title level={2}>7. 免责声明</Title>
        <Paragraph>
          本平台仅提供游戏分发服务，不对游戏内容本身负责。游戏的质量、安全性、合法性由游戏开发商或发行商负责。
          本平台不对因网络、设备等原因导致的服务中断或数据丢失承担责任。
        </Paragraph>

        <Title level={2}>8. 服务变更和终止</Title>
        <Paragraph>
          本平台有权随时修改、暂停或终止部分或全部服务，恕不另行通知。如终止服务，我们将尽可能提前通知用户，
          并为用户提供数据导出等必要协助。
        </Paragraph>

        <Title level={2}>9. 争议解决</Title>
        <Paragraph>
          如发生争议，双方应首先协商解决。协商不成的，任何一方均可向本平台所在地人民法院提起诉讼。
        </Paragraph>

        <Title level={2}>10. 联系我们</Title>
        <Paragraph>
          如您对本服务条款有任何疑问，请通过以下方式联系我们：
        </Paragraph>
        <ul>
          <li>邮箱：legal@cloudcurtain.com</li>
          <li>电话：400-123-4567</li>
          <li>地址：中国北京市朝阳区科技园区</li>
        </ul>

        <Paragraph style={{ marginTop: '40px', color: '#999', textAlign: 'center' }}>
          © 2026 云幕游戏商店平台 版权所有
        </Paragraph>
      </Card>
    </div>
  );
};

export default Terms;
