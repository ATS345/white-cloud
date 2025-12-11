// 网关服务 - Consul配置
import consul from 'consul';
import logger from './logger.js';

// 初始化Consul客户端
const consulClient = new consul({
  host: process.env.CONSUL_HOST || 'localhost',
  port: process.env.CONSUL_PORT || 8500,
  promisify: true,
});

// 服务注册配置
const serviceConfig = {
  name: 'gateway-service',
  id: `gateway-service-${Date.now()}`,
  address: process.env.SERVICE_HOST || 'localhost',
  port: parseInt(process.env.PORT || 3000, 10),
  tags: ['api', 'gateway', 'v1'],
  check: {
    http: `http://${process.env.SERVICE_HOST || 'localhost'}:${process.env.PORT || 3000}/health`,
    interval: '10s',
    timeout: '5s',
    deregisterCriticalServiceAfter: '30s',
  },
};

// 注册服务到Consul
const registerService = async () => {
  try {
    await consulClient.agent.service.register(serviceConfig);
    logger.info('[Consul] 服务注册成功');
    
    // 监听服务停止事件，注销服务
    process.on('SIGINT', async () => {
      await deregisterService();
      process.exit(0);
    });
    
    process.on('SIGTERM', async () => {
      await deregisterService();
      process.exit(0);
    });
  } catch (error) {
    logger.error('[Consul] 服务注册失败:', error);
    // 服务注册失败，不影响网关启动，但记录错误
  }
};

// 从Consul注销服务
const deregisterService = async () => {
  try {
    await consulClient.agent.service.deregister(serviceConfig.id);
    logger.info('[Consul] 服务注销成功');
  } catch (error) {
    logger.error('[Consul] 服务注销失败:', error);
  }
};

// 从Consul获取服务实例
const getServiceInstances = async (serviceName) => {
  try {
    const services = await consulClient.agent.service.list();
    const instances = [];
    
    for (const serviceId in services) {
      if (services[serviceId].Service === serviceName) {
        instances.push({
          id: services[serviceId].ID,
          name: services[serviceId].Service,
          address: services[serviceId].Address,
          port: services[serviceId].Port,
          tags: services[serviceId].Tags,
        });
      }
    }
    
    return instances;
  } catch (error) {
    logger.error(`[Consul] 获取服务${serviceName}实例失败:`, error);
    return [];
  }
};

// 从Consul获取健康的服务实例
const getHealthyServiceInstances = async (serviceName) => {
  try {
    const healthChecks = await consulClient.health.service(serviceName, {
      passing: true,
    });
    
    const instances = healthChecks.map(check => ({
      id: check.Service.ID,
      name: check.Service.Service,
      address: check.Service.Address,
      port: check.Service.Port,
      tags: check.Service.Tags,
    }));
    
    return instances;
  } catch (error) {
    logger.error(`[Consul] 获取健康服务${serviceName}实例失败:`, error);
    return [];
  }
};

// 负载均衡策略：轮询
let serviceIndex = {};

const getNextServiceInstance = (serviceName, instances) => {
  if (!instances || instances.length === 0) {
    return null;
  }
  
  if (!serviceIndex[serviceName]) {
    serviceIndex[serviceName] = 0;
  }
  
  const instance = instances[serviceIndex[serviceName]];
  serviceIndex[serviceName] = (serviceIndex[serviceName] + 1) % instances.length;
  
  return instance;
};

// 从Consul获取配置
const getConfig = async (key) => {
  try {
    const result = await consulClient.kv.get(key);
    if (result && result.Value) {
      return JSON.parse(result.Value);
    }
    return null;
  } catch (error) {
    logger.error(`[Consul] 获取配置${key}失败:`, error);
    return null;
  }
};

export {
  consulClient,
  registerService,
  deregisterService,
  getServiceInstances,
  getHealthyServiceInstances,
  getNextServiceInstance,
  getConfig,
};