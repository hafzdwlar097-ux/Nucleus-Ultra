import json
import math
import uuid
import datetime
from flask import Flask, request, jsonify, render_template_string, Response

app = Flask(__name__)

# ==========================================
# 1. قاعدة البيانات الموحدة (الشاملة)
# ==========================================
# تحتوي على المواد الأساسية + مكان لتخزين مساهمات المجتمع
data_store = {
    "materials": [
        {"id": "steel", "name": "فولاذ صناعي", "strength": 100, "carbon": "0%", "type": "standard", "contributor": "النظام"},
        {"id": "bamboo", "name": "خشب البامبو", "strength": 60, "carbon": "95%", "type": "eco", "contributor": "Core Team"},
        {"id": "pvc_waste", "name": "بلاستيك معاد تدويره", "strength": 30, "carbon": "85%", "type": "waste", "contributor": "Green_Lab"},
        {"id": "palm", "name": "جريد النخل المعالج", "strength": 45, "carbon": "98%", "type": "eco", "contributor": "Egypt_Branch"}
    ],
    "designs": {
        "pump": {"name": "مضخة مياه يدوية", "parts": [{"id": "handle", "req": 50, "orig": 20}, {"id": "body", "req": 80, "orig": 15}]}
    },
    "feed": [] # سجل النشاط الحي
}

# ==========================================
# 2. إعدادات التثبيت (PWA)
# ==========================================
@app.route('/manifest.json')
def manifest():
    return Response(json.dumps({
        "short_name": "NUCLEUS ULTRA",
        "name": "نواة - المنصة الهندسية الشاملة",
        "icons": [{"src": "https://cdn-icons-png.flaticon.com/512/1005/1005141.png", "type": "image/png", "sizes": "512x512"}],
        "start_url": "/",
        "display": "standalone",
        "background_color": "#0f172a",
        "theme_color": "#00ffcc"
    }), mimetype='application/manifest+json')

# ==========================================
# 3. الواجهة الأمامية (The Ultimate UI)
# ==========================================
@app.route('/')
def home():
    return render_template_string("""
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="manifest" href="/manifest.json">
        <title>NUCLEUS ULTRA</title>
        <style>
            :root { --primary: #00ffcc; --bg: #0f172a; --card: #1e293b; --text: white; }
            body { font-family: system-ui, sans-serif; background: var(--bg); color: var(--text); margin: 0; padding-bottom: 80px; }
            
            /* Navbar */
            .nav { position: fixed; bottom: 0; width: 100%; background: #0b1120; display: flex; justify-content: space-around; padding: 15px 0; border-top: 1px solid #334155; z-index: 100; }
            .nav-btn { background: none; border: none; color: #64748b; font-size: 24px; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 5px; }
            .nav-btn span { font-size: 10px; font-weight: bold; }
            .nav-btn.active { color: var(--primary); }

            /* Sections */
            .view { display: none; padding: 20px; animation: fadeIn 0.3s; }
            .view.active { display: block; }
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

            /* Scanner UI */
            .scanner-frame { width: 100%; height: 200px; background: #000; position: relative; border-radius: 15px; overflow: hidden; border: 2px solid var(--primary); margin-bottom: 20px; }
            .scan-line { width: 100%; height: 2px; background: var(--primary); position: absolute; animation: scan 2s infinite; box-shadow: 0 0 10px var(--primary); }
            @keyframes scan { 0% { top: 0; } 100% { top: 100%; } }

            /* Cards & Inputs */
            .card { background: var(--card); padding: 20px; border-radius: 15px; margin-bottom: 15px; border: 1px solid #334155; }
            h2, h3 { margin-top: 0; color: var(--primary); }
            
            select, input, button { width: 100%; padding: 14px; margin: 8px 0; border-radius: 10px; border: none; background: #334155; color: white; font-size: 16px; }
            button.action { background: var(--primary); color: #000; font-weight: 800; cursor: pointer; transition: 0.2s; }
            button.action:active { transform: scale(0.98); }

            /* Results */
            .res-box { background: rgba(0, 255, 204, 0.1); border: 1px solid var(--primary); padding: 15px; border-radius: 10px; margin-top: 15px; display: none; }
            .blueprint { border: 1px dashed #64748b; padding: 10px; margin-top: 10px; display: flex; justify-content: center; align-items: center; height: 100px; }
            
            /* Feed */
            .feed-item { border-right: 3px solid var(--primary); padding-right: 15px; margin-bottom: 15px; background: rgba(255,255,255,0.03); padding: 10px; border-radius: 8px; }
        </style>
    </head>
    <body>

        <div id="lab" class="view active">
            <div class="scanner-frame">
                <video id="cam" autoplay playsinline style="width:100%; height:100%; object-fit:cover; opacity:0.6;"></video>
                <div class="scan-line"></div>
                <div style="position:absolute; bottom:10px; right:10px; font-size:10px; background:black; padding:2px 5px;">AI VISION: ON</div>
            </div>

            <div class="card">
                <h3>🎛️ لوحة التحكم الهندسية</h3>
                <label>نوع التصميم:</label>
                <select id="design"><option value="pump">مضخة مياه يدوية</option></select>
                
                <label>المادة المكتشفة:</label>
                <select id="material">
                    {% for m in materials %}
                    <option value="{{ m.id }}">{{ m.name }} ({{ m.type }})</option>
                    {% endfor %}
                </select>

                <button class="action" onclick="analyze()">🚀 تحليل وتوليد المخطط</button>
            </div>

            <div id="result" class="res-box">
                <h1 style="margin:0; font-size:40px;"><span id="thickVal">0</span> <small style="font-size:14px">مم</small></h1>
                <div id="carbonNote" style="color:#aaa; font-size:12px; margin-bottom:10px;"></div>
                
                <div style="background:#000; padding:5px; font-size:12px; color:yellow;">نظام التدعيم المقترح:</div>
                <div class="blueprint" id="blueprintGraphic">
                    </div>
                <p id="tip" style="font-size:12px; color:#cbd5e1; margin-top:10px;"></p>
            </div>
        </div>

        <div id="hive" class="view">
            <div class="card">
                <h3>🌍 ساهم في المصدر المفتوح</h3>
                <p style="font-size:12px; color:#94a3b8;">أضف مادة محلية جديدة لقاعدة البيانات العالمية.</p>
                <input id="newMatName" placeholder="اسم المادة (مثلاً: خشب الزيتون)">
                <input id="newMatStr" type="number" placeholder="القوة التقريبية (1-100)">
                <input id="contributor" placeholder="اسمك / اسم الورشة">
                <button class="action" style="background:#8b5cf6; color:white;" onclick="addMaterial()">➕ إرسال للمجتمع</button>
            </div>

            <div class="card">
                <h3>📡 البث المباشر (Live Feed)</h3>
                <div id="feedBox">
                    {% for item in feed %}
                    <div class="feed-item">{{ item }}</div>
                    {% else %}
                    <p style="color:#64748b; font-size:12px;">لا توجد نشاطات حديثة..</p>
                    {% endfor %}
                </div>
            </div>
        </div>

        <div class="nav">
            <button class="nav-btn active" onclick="switchTab('lab', this)">
                ⚙️ <span>المختبر</span>
            </button>
            <button class="nav-btn" onclick="switchTab('hive', this)">
                🐝 <span>المجتمع</span>
            </button>
        </div>

        <script>
            // تشغيل الكاميرا
            navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
                .then(stream => document.getElementById('cam').srcObject = stream)
                .catch(e => console.log("Cam error"));

            function switchTab(id, btn) {
                document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
                document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
                document.getElementById(id).classList.add('active');
                btn.classList.add('active');
            }

            async function analyze() {
                const matId = document.getElementById('material').value;
                const res = await fetch('/api/calculate', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({ mat_id: matId })
                });
                const data = await res.json();
                
                document.getElementById('result').style.display = 'block';
                document.getElementById('thickVal').innerText = data.thickness;
                document.getElementById('carbonNote').innerText = `🌱 توفير كربون: ${data.carbon}`;
                document.getElementById('tip').innerText = data.tip;
                
                // رسم توضيحي بسيط
                const bp = document.getElementById('blueprintGraphic');
                if(data.ribs) {
                    bp.innerHTML = '<div style="color:#facc15; font-weight:bold;">⚠️ يتطلب أعصاب تدعيم (X-Ribs)</div>';
                    bp.style.border = "2px solid #facc15";
                } else {
                    bp.innerHTML = '<div style="color:#4ade80; font-weight:bold;">✅ هيكل مصمت (Solid)</div>';
                    bp.style.border = "1px solid #4ade80";
                }
            }

            async function addMaterial() {
                const name = document.getElementById('newMatName').value;
                const str = document.getElementById('newMatStr').value;
                const by = document.getElementById('contributor').value;

                if(!name || !str) return alert("أدخل البيانات!");

                const res = await fetch('/api/add', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({ name, strength: str, contributor: by })
                });

                if(res.ok) {
                    alert("تمت الإضافة بنجاح!");
                    location.reload(); // تحديث الصفحة لرؤية المادة
                }
            }
        </script>
    </body>
    </html>
    """, materials=data_store["materials"], feed=data_store["feed"])

# ==========================================
# 4. الذكاء الخلفي (Backend Logic)
# ==========================================
@app.route('/api/calculate', methods=['POST'])
def calculate_logic():
    req = request.json
    # البحث عن المادة في القائمة
    mat = next((m for m in data_store["materials"] if m["id"] == req["mat_id"]), None)
    part = data_store["designs"]["pump"]["parts"][0] # نفترض المقبض كمثال

    if not mat: return jsonify({"error": "Material not found"})

    # 1. معادلة النواة (Nucleus Equation)
    ratio = int(mat["strength"]) / part["req"]
    factor = 1.0
    ribs_required = False
    
    if ratio < 1:
        factor = 1 / math.sqrt(ratio)
        ribs_required = True # إذا المادة ضعيفة، نطلب تدعيم
    
    final_thick = round(part["orig"] * factor, 1)

    # 2. النصيحة الذكية
    tip = "تصميم ممتاز!"
    if mat["type"] == "waste":
        tip = "تنبيه: تأكد من تنظيف البلاستيك جيداً قبل الصهر لضمان التماسك."
    elif mat["type"] == "eco":
        tip = "نصيحة: ادهن المادة بزيت الكتان لحمايتها من الرطوبة."

    return jsonify({
        "thickness": final_thick,
        "carbon": mat.get("carbon", "غير معروف"),
        "ribs": ribs_required,
        "tip": tip
    })

@app.route('/api/add', methods=['POST'])
def add_logic():
    data = request.json
    new_mat = {
        "id": str(uuid.uuid4())[:6],
        "name": data["name"],
        "strength": data["strength"],
        "carbon": "??%",
        "type": "user_added",
        "contributor": data["contributor"]
    }
    data_store["materials"].append(new_mat)
    
    # إضافة للسجل العام
    log_entry = f"⚡ {data['contributor']} أضاف مادة: {data['name']}"
    data_store["feed"].insert(0, log_entry) # إضافة في البداية
    
    return jsonify({"success": True})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080)
