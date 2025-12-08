# 云服务器部署指南

## 服务器要求

- **系统**: Ubuntu 20.04+ / CentOS 7+
- **配置**: 2核 4G 以上
- **软件**: Python 3.10+, Node.js 18+, Nginx

---

## 1. 安装依赖

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装 Python 3.10+
sudo apt install python3.10 python3.10-venv python3-pip -y

# 安装 Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install nodejs -y

# 安装 Nginx
sudo apt install nginx -y

# 安装 PM2 (进程管理)
sudo npm install -g pm2
```

---

## 2. 上传代码

```bash
# 在服务器上创建目录
mkdir -p /var/www/banana
cd /var/www/banana

# 上传代码（使用 scp 或 git clone）
# scp -r ./banana root@your-server-ip:/var/www/
```

---

## 3. 部署后端 (Python)

```bash
cd /var/www/banana/backend

# 创建虚拟环境
python3 -m venv venv
source venv/bin/activate

# 安装依赖
pip install -r requirements.txt

# 测试运行
uvicorn main:app --host 0.0.0.0 --port 8000

# 使用 PM2 后台运行
pm2 start "uvicorn main:app --host 0.0.0.0 --port 8000" --name banana-api
pm2 save
```

---

## 4. 部署前端 (Next.js)

```bash
cd /var/www/banana/frontend

# 安装依赖
npm install

# 修改 API 地址（指向后端）
# 编辑 src/lib/api.ts，将 localhost:8000 改为实际地址

# 构建
npm run build

# 启动
pm2 start npm --name banana-web -- start
pm2 save
```

---

## 5. 配置 Nginx

```bash
sudo nano /etc/nginx/sites-available/banana
```

```nginx
server {
    listen 80;
    server_name your-domain.com;  # 改为你的域名

    # 前端
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # 后端 API
    location /api/ {
        proxy_pass http://127.0.0.1:8000/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

```bash
# 启用配置
sudo ln -s /etc/nginx/sites-available/banana /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## 6. 配置 HTTPS (可选)

```bash
# 安装 Certbot
sudo apt install certbot python3-certbot-nginx -y

# 获取证书
sudo certbot --nginx -d your-domain.com
```

---

## 7. 检查服务状态

```bash
pm2 status          # 查看进程
pm2 logs            # 查看日志
pm2 restart all     # 重启所有服务
```

---

## 常用命令

| 操作 | 命令 |
|------|------|
| 查看后端日志 | `pm2 logs banana-api` |
| 查看前端日志 | `pm2 logs banana-web` |
| 重启后端 | `pm2 restart banana-api` |
| 重启前端 | `pm2 restart banana-web` |
| 开机自启 | `pm2 startup && pm2 save` |
