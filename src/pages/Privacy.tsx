import React from 'react';
import { Typography, Card } from 'antd';

const { Title, Paragraph, Text } = Typography;

const Privacy: React.FC = () => {
  return (
    <div style={{ padding: '40px 20px', maxWidth: '900px', margin: '0 auto' }}>
      <Card style={{ borderRadius: '12px' }}>
        <Title level={1} style={{ textAlign: 'center', marginBottom: '40px' }}>
          隐私政策
        </Title>
        
        <Paragraph type="secondary" style={{ textAlign: 'center', marginBottom: '40px' }}>
          最后更新日期：2026年3月14日
        </Paragraph>

        <Title level={2}>1. 引言</Title>
        <Paragraph>
          云幕游戏商店平台（以下简称"我们"）非常重视用户隐私保护。本隐私政策旨在向您说明我们如何收集、
          使用、存储和保护您的个人信息。请您仔细阅读本政策，了解我们对您个人信息的处理方式。
        </Paragraph>

        <Title level={2}>2. 信息收集</Title>
        <Paragraph>
          <Text strong>2.1 我们收集的信息</Text><br />
          为了向您提供服务，我们可能收集以下信息：
        </Paragraph>
        <ul>
          <li><Text strong>账户信息</Text>：用户名、邮箱地址、密码（加密存储）</li>
          <li><Text strong>交易信息</Text>：购买记录、支付信息（不包含完整银行卡号）</li>
          <li><Text strong>使用信息</Text>：浏览记录、搜索记录、下载记录</li>
          <li><Text strong>设备信息</Text>：设备型号、操作系统、浏览器类型</li>
          <li><Text strong>位置信息</Text>：基于IP地址的大致地理位置</li>
        </ul>

        <Paragraph>
          <Text strong>2.2 信息收集方式</Text><br />
          我们通过以下方式收集信息：
        </Paragraph>
        <ul>
          <li>您主动提供的信息（如注册时填写的信息）</li>
          <li>自动收集的信息（如Cookie、日志文件）</li>
          <li>第三方来源的信息（如社交账号登录）</li>
        </ul>

        <Title level={2}>3. 信息使用</Title>
        <Paragraph>
          我们使用收集的信息用于以下目的：
        </Paragraph>
        <ul>
          <li>提供、维护和改进我们的服务</li>
          <li>处理您的订单和支付</li>
          <li>发送服务通知和营销信息（经您同意）</li>
          <li>分析用户行为，优化用户体验</li>
          <li>检测和防止欺诈行为</li>
          <li>遵守法律法规要求</li>
        </ul>

        <Title level={2}>4. 信息共享</Title>
        <Paragraph>
          我们承诺不会出售您的个人信息。我们仅在以下情况下共享您的信息：
        </Paragraph>
        <ul>
          <li><Text strong>服务提供商</Text>：与帮助我们运营业务的合作伙伴共享（如支付服务商、CDN服务商）</li>
          <li><Text strong>法律要求</Text>：根据法律法规、法院命令或政府要求</li>
          <li><Text strong>业务转让</Text>：如发生合并、收购或资产出售</li>
          <li><Text strong>用户同意</Text>：经您明确同意的其他情况</li>
        </ul>

        <Title level={2}>5. 信息存储和保护</Title>
        <Paragraph>
          <Text strong>5.1 存储位置</Text><br />
          您的信息存储在位于中国的服务器上。如需跨境传输，我们将遵守相关法律法规。
        </Paragraph>
        <Paragraph>
          <Text strong>5.2 安全措施</Text><br />
          我们采取多种安全措施保护您的信息：
        </Paragraph>
        <ul>
          <li>数据传输使用SSL/TLS加密</li>
          <li>密码使用bcrypt算法加密存储</li>
          <li>敏感信息使用AES-256加密</li>
          <li>定期安全审计和漏洞扫描</li>
          <li>访问控制和权限管理</li>
        </ul>
        <Paragraph>
          <Text strong>5.3 数据保留</Text><br />
          我们仅在必要的时间内保留您的信息。账号注销后，我们将在合理期限内删除或匿名化处理您的个人信息。
        </Paragraph>

        <Title level={2}>6. 您的权利</Title>
        <Paragraph>
          根据相关法律法规，您享有以下权利：
        </Paragraph>
        <ul>
          <li><Text strong>访问权</Text>：您有权访问我们持有的您的个人信息</li>
          <li><Text strong>更正权</Text>：您有权更正不准确或不完整的信息</li>
          <li><Text strong>删除权</Text>：在特定情况下，您有权要求删除您的信息</li>
          <li><Text strong>限制处理权</Text>：您有权限制我们处理您的信息</li>
          <li><Text strong>数据携带权</Text>：您有权获取您的数据副本</li>
          <li><Text strong>撤回同意权</Text>：您有权随时撤回之前给予的同意</li>
        </ul>

        <Title level={2}>7. Cookie使用</Title>
        <Paragraph>
          我们使用Cookie和类似技术来：
        </Paragraph>
        <ul>
          <li>记住您的登录状态</li>
          <li>分析网站使用情况</li>
          <li>个性化您的体验</li>
          <li>提供相关广告</li>
        </ul>
        <Paragraph>
          您可以通过浏览器设置管理Cookie，但这可能影响某些功能的使用。
        </Paragraph>

        <Title level={2}>8. 未成年人保护</Title>
        <Paragraph>
          我们的服务不面向14周岁以下的儿童。如果我们发现在未经父母同意的情况下收集了儿童的个人信息，
          我们将尽快删除相关信息。如果您认为我们可能收集了儿童的信息，请联系我们。
        </Paragraph>

        <Title level={2}>9. 政策更新</Title>
        <Paragraph>
          我们可能会不时更新本隐私政策。更新后的政策将在本页面发布，重大变更时我们将通过邮件或站内信通知您。
          继续使用我们的服务即表示您接受更新后的政策。
        </Paragraph>

        <Title level={2}>10. 联系我们</Title>
        <Paragraph>
          如您对本隐私政策有任何疑问或建议，请通过以下方式联系我们：
        </Paragraph>
        <ul>
          <li>隐私邮箱：privacy@cloudcurtain.com</li>
          <li>客服电话：400-123-4567</li>
          <li>通讯地址：中国北京市朝阳区科技园区</li>
        </ul>
        <Paragraph>
          我们将在15个工作日内回复您的请求。
        </Paragraph>

        <Paragraph style={{ marginTop: '40px', color: '#999', textAlign: 'center' }}>
          © 2026 云幕游戏商店平台 版权所有
        </Paragraph>
      </Card>
    </div>
  );
};

export default Privacy;
