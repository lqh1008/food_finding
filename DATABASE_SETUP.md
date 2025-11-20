# 数据库设置指南 (macOS)

## 1. 当前配置：SQLite (无需安装)

本项目默认使用 **SQLite** 数据库。

*   **什么是 SQLite？** 它是一个轻量级的、基于文件的数据库。
*   **需要安装吗？** **不需要**。它直接作为文件存储在您的项目中 (`server/prisma/dev.db`)。
*   **如何使用？** 您只需要运行项目，Prisma 会自动为您处理一切。

如果您只是想运行本项目进行测试或开发，**您不需要进行任何额外的数据库安装操作**。

---

## 2. 进阶选项：安装 PostgreSQL (推荐用于生产环境)

如果您希望使用更强大的数据库（如 PostgreSQL），或者想学习如何配置它，请按照以下步骤操作。

### 方法一：使用 Postgres.app (最简单，推荐)

这是 macOS 上安装 PostgreSQL 最简单的方法，像安装普通 App 一样。

1.  **下载**：访问 [Postgres.app 官网](https://postgresapp.com/) 下载最新版本。
2.  **安装**：将下载的 App 拖入 `Applications` 文件夹。
3.  **运行**：打开 Postgres.app，点击 "Initialize" 初始化服务器。
4.  **配置命令行工具** (可选但推荐)：
    ```bash
    sudo mkdir -p /etc/paths.d &&
    echo /Applications/Postgres.app/Contents/Versions/latest/bin | sudo tee /etc/paths.d/postgresapp
    ```
    (运行后重启终端)

### 方法二：使用 Homebrew (开发者常用)

如果您习惯使用命令行，可以使用 Homebrew 安装。

1.  **安装 Homebrew** (如果尚未安装):
    ```bash
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    ```
2.  **安装 PostgreSQL**:
    ```bash
    brew install postgresql@14
    ```
3.  **启动服务**:
    ```bash
    brew services start postgresql@14
    ```

### 验证安装

在终端输入以下命令，如果能进入 SQL 交互界面，说明安装成功：
```bash
psql postgres
```
(输入 `\q` 退出)

---

## 3. 如何将本项目切换到 PostgreSQL

如果您安装了 PostgreSQL 并想在本项目中使用：

1.  **创建数据库**:
    ```bash
    createdb food_finding
    ```

2.  **修改 `server/prisma/schema.prisma`**:
    ```prisma
    datasource db {
      provider = "postgresql" // 将 sqlite 改为 postgresql
      // url      = env("DATABASE_URL") // 确保这里使用环境变量
    }
    ```

3.  **修改 `server/prisma.config.ts`**:
    ```typescript
    // ...
    datasource: {
        provider: 'postgresql', // 修改为 postgresql
        url: env('DATABASE_URL'),
    },
    // ...
    ```

4.  **修改 `server/.env`**:
    ```env
    # 替换为您的 PostgreSQL 连接字符串
    DATABASE_URL="postgresql://您的用户名:您的密码@localhost:5432/food_finding?schema=public"
    ```
    *(如果您使用 Postgres.app 且没有设置密码，通常是 `postgresql://localhost:5432/food_finding`)*

5.  **应用迁移**:
    ```bash
    cd server
    npx prisma migrate dev --name init_postgres
    ```

---

**总结**：对于当前项目，您可以直接使用默认的 SQLite，无需任何操作。如果您想折腾 PostgreSQL，请参考第 2 节。
