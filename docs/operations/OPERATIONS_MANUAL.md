# Yunmu Game Store Platform - Operations Manual

**Version**: 1.0  
**Last Updated**: 2026-03-25  
**Author**: Operations Team

---

## Table of Contents

1. [System Architecture Overview](#1-system-architecture-overview)
2. [Deployment Process](#2-deployment-process)
3. [Daily Operations](#3-daily-operations)
4. [Troubleshooting Guide](#4-troubleshooting-guide)
5. [Emergency Procedures](#5-emergency-procedures)
6. [Common Commands Reference](#6-common-commands-reference)

---

## 1. System Architecture Overview

### 1.1 System Components

| Component | Technology | Purpose | Port | Status |
|-----------|-----------|---------|------|--------|
| Frontend | React 18 + Vite | User interface | 8080 | ✅ Running |
| Backend | NestJS 10 + Node.js | API services | 3000 | ✅ Running |
| Database | SQLite | Data storage | - | ✅ Configured |
| API Docs | Swagger/OpenAPI | API documentation | 3000/api/docs | ✅ Available |

### 1.2 Architecture Diagram

```
┌─────────────────┐
│   User Browser  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Frontend (8080)│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Backend (3000) │
└────────┬────────┘
         │
         ├──────────┬──────────┐
         ▼          ▼          ▼
    ┌────────┐ ┌────────┐ ┌────────┐
    │Database│ │  Redis │ │Elastic │
    └────────┘ └────────┘ └────────┘
```

---

## 2. Deployment Process

### 2.1 Pre-Deployment Checklist

- [ ] Review latest changes in Git
- [ ] Run all tests (frontend and backend)
- [ ] Backup current database
- [ ] Check available disk space (> 10GB free)
- [ ] Notify stakeholders of deployment window

### 2.2 Deployment Steps

#### Step 1: Stop Services

```powershell
# Stop backend service (if running)
# Press Ctrl+C in the terminal running the backend

# Stop frontend service (if running)
# Press Ctrl+C in the terminal running the frontend
```

#### Step 2: Pull Latest Code

```powershell
cd c:\项目开发\云幕游戏商店平台
git pull origin main
```

#### Step 3: Install Dependencies

```powershell
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

#### Step 4: Build Applications

```powershell
# Build frontend
npm run build

# Build backend
cd backend
npm run build
cd ..
```

#### Step 5: Database Migration

```powershell
cd backend
npx prisma migrate deploy
cd ..
```

#### Step 6: Start Services

**Terminal 1 - Backend:**
```powershell
cd backend
$env:NODE_ENV="production"
$env:JWT_SECRET="your-jwt-secret-here"
$env:JWT_REFRESH_SECRET="your-refresh-secret-here"
$env:PAYMENT_CALLBACK_SECRET="your-payment-secret-here"
node dist/main.js
```

**Terminal 2 - Frontend:**
```powershell
npm run preview -- --port 8080
```

#### Step 7: Verify Deployment

```powershell
# Run health check script
powershell -ExecutionPolicy Bypass -File scripts\local-monitor.ps1
```

### 2.3 Post-Deployment Verification

- [ ] Frontend accessible at http://localhost:8080
- [ ] Backend health check at http://localhost:3000/health
- [ ] API docs available at http://localhost:3000/api/docs
- [ ] Login functionality works
- [ ] Game listing displays correctly
- [ ] Cart operations work

---

## 3. Daily Operations

### 3.1 Health Monitoring

#### Run Single Health Check

```powershell
powershell -ExecutionPolicy Bypass -File scripts\local-monitor.ps1
```

#### Continuous Monitoring

```powershell
powershell -ExecutionPolicy Bypass -File scripts\local-monitor.ps1 -Continuous -CheckInterval 60
```

### 3.2 Backup Operations

#### Full Backup

```powershell
powershell -ExecutionPolicy Bypass -File scripts\backup.ps1
```

#### Incremental Backup

```powershell
powershell -ExecutionPolicy Bypass -File scripts\backup.ps1 -Incremental
```

#### Restore Backup

```powershell
# Restore latest backup
powershell -ExecutionPolicy Bypass -File scripts\backup.ps1 -Restore

# Restore specific backup
powershell -ExecutionPolicy Bypass -File scripts\backup.ps1 -Restore -RestoreFile "C:\path\to\backup.zip"
```

#### Test Backup/Restore

```powershell
powershell -ExecutionPolicy Bypass -File scripts\backup.ps1 -Test
```

### 3.3 Log Management

#### Log Locations

| Log Type | Path |
|----------|------|
| Monitor Logs | `logs\monitor.log` |
| Backup Logs | `logs\backup.log` |
| Application Logs | `backend\logs\` |

#### View Recent Logs

```powershell
# View last 50 lines of monitor log
Get-Content logs\monitor.log -Tail 50

# View last 50 lines of backup log
Get-Content logs\backup.log -Tail 50
```

### 3.4 Scheduled Tasks

#### Recommended Backup Schedule

| Frequency | Type | Time | Retention |
|-----------|------|------|-----------|
| Daily | Full | 02:00 | 30 days |
| Hourly | Incremental | Every hour | 7 days |

#### Setup Windows Task Scheduler

1. Open Task Scheduler
2. Create Basic Task
3. Set trigger (daily at 2:00 AM)
4. Action: Start a program
5. Program: `powershell.exe`
6. Arguments: `-ExecutionPolicy Bypass -File "C:\项目开发\云幕游戏商店平台\scripts\backup.ps1"`

---

## 4. Troubleshooting Guide

### 4.1 Common Issues

#### Issue: Frontend not loading

**Symptoms**:
- Browser shows blank page
- Console shows connection errors

**Troubleshooting Steps**:
1. Check if frontend service is running
2. Verify port 8080 is not blocked
3. Check browser console for errors
4. Restart frontend service

**Resolution**:
```powershell
# Restart frontend
# Press Ctrl+C in frontend terminal, then:
npm run preview -- --port 8080
```

---

#### Issue: Backend API not responding

**Symptoms**:
- API requests timeout
- Health check fails

**Troubleshooting Steps**:
1. Check if backend service is running
2. Verify port 3000 is accessible
3. Check backend logs for errors
4. Verify environment variables are set

**Resolution**:
```powershell
# Verify environment variables
echo $env:NODE_ENV
echo $env:JWT_SECRET

# Restart backend with proper environment variables
cd backend
$env:NODE_ENV="production"
$env:JWT_SECRET="your-secret-here"
$env:JWT_REFRESH_SECRET="your-refresh-secret-here"
$env:PAYMENT_CALLBACK_SECRET="your-payment-secret-here"
node dist/main.js
```

---

#### Issue: Database connection failed

**Symptoms**:
- Database errors in logs
- Prisma connection errors

**Troubleshooting Steps**:
1. Check if database file exists
2. Verify database file permissions
3. Check DATABASE_URL environment variable

**Resolution**:
```powershell
# Verify database file exists
Test-Path backend\prisma\dev.db

# Check DATABASE_URL
echo $env:DATABASE_URL
```

---

#### Issue: High CPU/Memory usage

**Symptoms**:
- System slowdown
- Monitor alerts for high resource usage

**Troubleshooting Steps**:
1. Run health monitor to check metrics
2. Identify processes using high resources
3. Check for memory leaks
4. Review recent changes

**Resolution**:
```powershell
# Run monitor check
powershell -ExecutionPolicy Bypass -File scripts\local-monitor.ps1

# Restart services if needed
```

---

### 4.2 Error Log Analysis

#### Where to Find Logs

| Log Type | Location |
|----------|----------|
| Monitor | `logs\monitor.log` |
| Backup | `logs\backup.log` |
| Backend | Check backend terminal output |

#### How to Analyze

1. Look for ERROR level entries first
2. Check timestamps to correlate issues
3. Identify patterns in errors
4. Check for recent changes before errors started

---

## 5. Emergency Procedures

### 5.1 Service Outage Response

#### Step 1: Detect Outage

- Run health check script immediately
- Monitor alerts and notifications
- Check user reports

#### Step 2: Assess Impact

- Identify which services are down
- Estimate number of affected users
- Determine business impact

#### Step 3: Initial Troubleshooting

```powershell
# Quick health check
powershell -ExecutionPolicy Bypass -File scripts\local-monitor.ps1

# Check logs
Get-Content logs\monitor.log -Tail 100
Get-Content logs\backup.log -Tail 100
```

#### Step 4: Restore Service

**Option 1: Restart Services**
```powershell
# Stop and restart backend
# Stop and restart frontend
```

**Option 2: Restore from Backup**
```powershell
# If data corruption suspected
powershell -ExecutionPolicy Bypass -File scripts\backup.ps1 -Restore
```

#### Step 5: Verify Recovery

- Run full health check
- Test key functionality
- Monitor for recurrence

#### Step 6: Document Incident

- Record timeline of events
- Document root cause
- Note resolution steps
- Update prevention measures

### 5.2 Data Corruption Response

1. **Stop all services immediately**
2. **Take current state backup** (for forensic analysis)
3. **Restore from last known good backup**
4. **Verify data integrity**
5. **Gradually restore services**
6. **Monitor closely for recurrence**

### 5.3 Security Incident Response

1. **Isolate affected systems**
2. **Preserve evidence**
3. **Notify security team**
4. **Contain the incident**
5. **Eradicate the threat**
6. **Recover systems**
7. **Learn and improve**

---

## 6. Common Commands Reference

### 6.1 Service Management

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start frontend dev server |
| `npm run build` | Build frontend for production |
| `npm run preview` | Start frontend preview server |
| `npm run start:dev` | Start backend dev server |
| `npm run build` | Build backend (in backend dir) |
| `node dist/main.js` | Start backend production |

### 6.2 Monitoring & Backup

| Command | Purpose |
|---------|---------|
| `scripts\local-monitor.ps1` | Single health check |
| `scripts\local-monitor.ps1 -Continuous` | Continuous monitoring |
| `scripts\backup.ps1` | Full backup |
| `scripts\backup.ps1 -Incremental` | Incremental backup |
| `scripts\backup.ps1 -Restore` | Restore backup |
| `scripts\backup.ps1 -Test` | Test backup/restore |

### 6.3 Database Operations

| Command | Purpose |
|---------|---------|
| `npx prisma generate` | Generate Prisma client |
| `npx prisma migrate dev` | Run migrations (dev) |
| `npx prisma migrate deploy` | Deploy migrations (prod) |
| `npx prisma studio` | Open Prisma Studio |

### 6.4 Testing

| Command | Purpose |
|---------|---------|
| `npm run test:run` | Run frontend tests |
| `npm test` | Run backend tests (in backend dir) |

### 6.5 Git Operations

| Command | Purpose |
|---------|---------|
| `git status` | Check git status |
| `git pull` | Pull latest changes |
| `git log --oneline -10` | View recent commits |
| `git checkout <branch>` | Switch branch |

---

## Appendices

### Appendix A: Contact Information

| Role | Contact |
|------|---------|
| Technical Lead | tech-lead@example.com |
| DevOps Team | devops@example.com |
| Security Team | security@example.com |

### Appendix B: Related Documents

- [Deployment Checklist](../deployment/README.md)
- [Testing Guide](../testing/README.md)
- [API Documentation](../api/01-api-specification.md)
- [Security Strategy](../architecture/03-security-strategy.md)

---

**End of Operations Manual**

---

*Last Updated: 2026-03-25*
