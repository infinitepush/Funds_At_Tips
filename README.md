
<h1>🌟 FundsAtTips — Mutual Fund Analysis & Ranking Platform</h1>

<p><strong>FundsAtTips</strong> is a full-stack web application designed to help users discover, analyze, and compare the best-performing mutual funds in India.  
It features automated data scraping, a smart ranking engine, an AI assistant, and a modern UI.</p>

<p>🔗 <strong>Live Project:</strong>  
<a class="link" href="https://funds-at-tips-git-master-piyush-tiwaris-projects-5cc291d5.vercel.app/" target="_blank">https://funds-at-tips-git-master-piyush-tiwaris-projects-5cc291d5.vercel.app/</a></p>

<p>🔗 <strong>Backend API:</strong>  
<a class="link" href="https://funds-at-tips.onrender.com" target="_blank">https://funds-at-tips.onrender.com</a></p>


<hr />

<h2>🚀 Features</h2>

<h3>📊 Mutual Fund Insights</h3>
<ul>
    <li><strong>Automated Scraper</strong> — Real-time scraping from Groww</li>
    <li><strong>Top 10 Ranking Engine</strong> — Based on 1Y/3Y/5Y CAGR</li>
    <li><strong>Complete Fund List</strong> — All cleaned & normalized data</li>
    <li><strong>Future:</strong> Fund comparison</li>
</ul>

<h3>🤖 AI Assistant — Wisbee</h3>
<ul>
    <li>Powered by <strong>Gemini Pro</strong></li>
    <li>Provides financial guidance & answers queries</li>
</ul>

<h3>📰 Latest Financial News</h3>
<ul>
    <li>BBC General News</li>
    <li>NYT Latest News</li>
    <li>NYT Business News</li>
</ul>

<h3>📄 One-Click Reports</h3>
<ul>
    <li>Export <strong>Top 10 Funds</strong> as CSV</li>
</ul>

<hr />


<h2>🏗️ Architecture Overview</h2>

<h3>🖥️ Frontend</h3>
<ul>
    <li>React + Vite</li>
    <li>Tailwind CSS</li>
    <li>Deployed on Vercel</li>
</ul>

<h3>⚙️ Backend</h3>
<ul>
    <li>FastAPI + Python + Uvicorn</li>
    <li>Selenium scraper</li>
    <li>JSON used as lightweight DB</li>
    <li>Deployed on Render (Docker)</li>
</ul>

<hr />

<h2>🛠️ Tech Stack</h2>

<ul>
    <li><strong>Frontend:</strong> React, Vite, Tailwind CSS</li>
    <li><strong>Backend:</strong> FastAPI, Python, Uvicorn, Selenium</li>
    <li><strong>Database:</strong> JSON Files</li>
    <li><strong>Deployment:</strong> Vercel (UI), Render (API)</li>
</ul>

<hr />

<h2>📦 Getting Started</h2>

<h3>🔧 Prerequisites</h3>
<ul>
    <li>Git</li>
    <li>Node.js & npm</li>
    <li>Python 3.11</li>
    <li>Docker (optional)</li>
</ul>

<h3>1️⃣ Clone Repository</h3>
<pre><code>git clone &lt;repository-url&gt;
cd FundsAtTips_final
</code></pre>

<h3>2️⃣ Start Frontend</h3>
<pre><code>cd frontend
npm install
npm run dev
</code></pre>

<p>Frontend runs at:
<br />👉 http://localhost:5173</p>

<h3>3️⃣ Start Backend</h3>

<h4>Create Virtual Environment</h4>
<pre><code># Windows
python -m venv .venv
.venv\Scripts\activate

# macOS / Linux
python3 -m venv .venv
source .venv/bin/activate
</code></pre>

<h4>Install Requirements</h4>
<pre><code>pip install -r requirements.txt
</code></pre>

<h4>Run Server</h4>
<pre><code>uvicorn main:app --reload --host 0.0.0.0 --port 8000
</code></pre>

<p>Backend runs at:
<br />👉 http://localhost:8000</p>

<hr />

<h2>📡 API Endpoints</h2>

<h3>General</h3>
<ul>
    <li><strong>GET /api/health</strong> — Health check</li>
    <li><strong>GET /</strong> — Backend status</li>
</ul>

<h3>Mutual Funds</h3>
<ul>
    <li><strong>POST /api/update</strong> — Trigger scraper</li>
    <li><strong>GET /api/funds</strong> — Get all funds</li>
    <li><strong>GET /api/funds/top10</strong> — Top 10 funds</li>
    <li><strong>GET /api/export/csv</strong> — Export CSV</li>
</ul>

<h3>News</h3>
<ul>
    <li><strong>GET /api/news</strong></li>
    <li><strong>GET /api/latest_news</strong></li>
    <li><strong>GET /api/business_news</strong></li>
</ul>

<hr />

<h2>🚀 Deployment Guide</h2>

<h3>🌐 Frontend (Vercel)</h3>
<p>Auto-deployed from <strong>main</strong> branch.</p>

<p><strong>Environment Variable:</strong></p>
<pre><code>VITE_API_BASE_URL = https://funds-at-tips.onrender.com
</code></pre>

<h3>🐳 Backend (Render)</h3>
<ul>
    <li>Dockerized</li>
    <li>Configured via render.yaml</li>
</ul>

<hr />

<h2>🤝 Contributing</h2>
<p>Contributions, issues, and feature requests are welcome!</p>

<hr />

<h2>📜 License</h2>
<p>MIT License</p>

</div>
</body>
</html>
