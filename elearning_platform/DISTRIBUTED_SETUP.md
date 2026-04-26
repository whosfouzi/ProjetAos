# Full Walkthrough: Distributed E-Learning Platform

Follow these steps exactly to link your machine (Main) and your teammate's machine (Worker).

## 🌍 Step 0: Prerequisites
- Ensure both computers are connected to the same Wi-Fi/Network.
- **Your IP**: `172.20.10.4`
- **Teammate's IP**: `172.20.10.7`

---

## 💻 Step 1: Your Machine (Main - Mac)
This machine will host the "Brain" of the system (Consul, RabbitMQ, and Traefik).

1. **Open your terminal** in the `elearning_platform` folder.
2. **Set your environment variables**:
   ```bash
   export CORE_IP=172.20.10.4
   export SERVICE_IP=172.20.10.4
   ```
3. **Start the Core Services**:
   ```bash
   docker compose up traefik consul rabbitmq auth-service frontend
   ```
   *Keep this terminal open.*

---

## 🪟 Step 2: Teammate's Machine (Worker - Windows)
This machine will run the courses and quizzes, connecting back to your IP.

1. **Open PowerShell** in the `elearning_platform` folder.
2. **Run the connection command**:
   ```powershell
   # This command sets the variables AND starts the services
   $env:CORE_IP="172.20.10.4"; $env:SERVICE_IP="172.20.10.7"; docker compose up course-service enrollment-service enrollment-worker quiz-service quiz-worker notification-service
   ```
   *Keep this terminal open.*

---

## 🔍 Step 3: Verification (The "Wow" Factor)
Once both terminals are running without errors:

1. **Check the Gateway**: On your machine, go to [http://localhost:8080](http://localhost:8080). 
   - Click on **HTTP Services**.
   - You should see `enrollment-service` listed with your teammate's IP: `172.20.10.7:8003`.
2. **Check the Registry**: Go to [http://localhost:8500](http://localhost:8500).
   - You should see all services in the list with "passing" status.
3. **Use the App**: Go to [http://localhost:3000](http://localhost:3000).
   - Login and try to view a course. The request goes to **Your Machine**, which then talks to **Their Machine** to get the data!

---

## 🛠️ Troubleshooting
- **Firewall**: If the teammate cannot connect, ensure the firewall on **your Mac** allows incoming connections on ports `8500` (Consul) and `5672` (RabbitMQ).
- **Restarting**: If something fails, run `docker compose down` on both machines and start from Step 1 again.
