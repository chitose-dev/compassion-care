// API設定
const API_BASE_URL = 'https://shimuryo-ai-yi6i57qx4a-an.a.run.app/api';

// セッション管理
let sessionToken = null;
let currentScenario = null;
let messageCount = 0;
let selectedHeart = null;
let selectedHeartData = {};
let conversationHistory = [];
let currentScenarioData = null;
let allScenarios = {}; // 全シナリオを保持

// 心のメッセージデータ
const heartMessages = {
    metta: {
        icon: '🌸',
        name: 'ラビングカインドネス',
        message: '今日は"ラビングカインドネス（思いやりの心）"を意識してみましょう。\n\n相手を変えようとせず、"幸せであってほしい"という願いだけを静かに向けてください。\nその願いは、相手だけでなく、自分自身にも届いています。'
    },
    karuna: {
        icon: '🌊',
        name: 'コンパッション',
        message: '今日は"コンパッション（いたわりの心）"を意識してみましょう。\n\n苦しみを消そうとせず、"共に感じる"ことから始めてください。\nあなたがそばにいることで、痛みは少しやわらぐかもしれません。'
    },
    mudita: {
        icon: '☀️',
        name: 'エンパシック・ジョイ',
        message: '今日は"エンパシック・ジョイ（共に喜ぶ心）"を意識してみましょう。\n\n他者の幸せや成長を、自分のことのように感じてみてください。\n嫉妬や比較を手放し、"ともにうれしい"を分かち合いましょう。'
    },
    upekkha: {
        icon: '🍃',
        name: 'エクアニミティ',
        message: '今日は"エクアニミティ（巻き込まれない心）"を意識してみましょう。\n\nすべてを抱え込まず、判断や執着を手放してみてください。\nどんな波が来ても、あなたの心の奥には、静かな湖のような穏やかさが残っています。'
    },
    'empathic-understanding': {
        icon: '💧',
        name: '相手の世界を感じる心',
        message: '今日は"相手の世界を感じる心"を意識してみましょう。\n\n言葉の奥にある"その人の世界"を感じてみてください。\n相手の立場から世界を眺めることが、癒しの始まりです。'
    },
    'unconditional-regard': {
        icon: '🌷',
        name: '無条件の受容',
        message: '今日は"無条件の受容（存在そのものを大切に思う心）"を意識してみましょう。\n\nたとえ相手の行動が理解できなくても、存在そのものを大切に思ってください。\n"あなたがここにいてくれていい"という肯定を、心の中で伝えてみてください。'
    },
    congruence: {
        icon: '🌾',
        name: 'ありのままの誠実さ',
        message: '今日は"ありのままの誠実さ"を意識してみましょう。\n\nあなたの感じていること、考えていること、言葉が重なる瞬間を見つけてください。\n正しさより、誠実さ。飾らず、ありのままのあなたでいてください。'
    },
    abstinence: {
        icon: '🕊️',
        name: '静けさを保つ心',
        message: '今日は"静けさを保つ心"を意識してみましょう。\n\n自分の欲求や承認欲を、少しだけ脇に置いてみてください。\n相手の物語に入りすぎず、あなたの静けさを保つことが、最大の支援になります。'
    }
};

// 心の解説コンテンツ
const heartExplanations = {
    metta: {
        icon: '🌸',
        title: 'ラビングカインドネス',
        subtitle: '思いやりの心',
        origin: `<p>全ての存在の幸福を願う心です。</p>`,
        clinical: `<p>支援の場面では、クライエントの幸福を純粋に願う姿勢として現れます。「直す」のではなく「幸せであってほしい」と願うことで、支援の質が深まります。</p>`,
        tips: ["「あなたが幸せでありますように」と心の中で唱える", "自分自身への慈しみも忘れない"]
    },
    karuna: {
        icon: '🌊',
        title: 'コンパッション',
        subtitle: 'いたわりの心',
        origin: `<p>苦しみを共に感じ、それが取り除かれることを願う心です。</p>`,
        clinical: `<p>解決を急がず、まず苦しみを「共に感じる時間」を持つことが重要です。「つらいね」と認め、そばにいることが癒しとなります。</p>`,
        tips: ["解決を考える前に、ただ共に感じる", "自分の感情に気づき、抱えながらも距離を保つ"]
    },
    mudita: {
        icon: '☀️',
        title: 'エンパシック・ジョイ',
        subtitle: '共に喜ぶ心',
        origin: `<p>他者の幸福や成功を、嫉妬なく共に喜ぶ心です。</p>`,
        clinical: `<p>クライエントの小さな成長や前進を心から喜ぶことは、自己肯定感を育み、レジリエンスを高めます。</p>`,
        tips: ["小さな前進を見逃さず共に喜ぶ", "比較や評価を手放して純粋に喜ぶ"]
    },
    upekkha: {
        icon: '🍃',
        title: 'エクアニミティ',
        subtitle: '巻き込まれない心',
        origin: `<p>動揺せず、偏りのない平静な心です。</p>`,
        clinical: `<p>クライエントの状態に一喜一憂せず、穏やかな「器」であり続けることで、安全な場を提供します。</p>`,
        tips: ["結果への執着に気づき、プロセスを信頼する", "呼吸と共に平静さを取り戻す"]
    },
    'empathic-understanding': {
        icon: '💧',
        title: '相手の世界を感じる心',
        subtitle: '',
        origin: `<p>相手の内的世界を、あたかも自分自身のものであるかのように感じる力です。</p>`,
        clinical: `<p>評価や判断をせず、相手の視点から世界を見ることで、クライエントの自己理解を助けます。</p>`,
        tips: ["「もし私がこの人だったら」と想像する", "言葉の背景にある感情に耳を傾ける"]
    },
    'unconditional-regard': {
        icon: '🌷',
        title: '無条件の受容',
        subtitle: '',
        origin: `<p>相手の感情や行動を評価せず、人間としての価値を無条件に尊重する心です。</p>`,
        clinical: `<p>防衛を解き、ありのままの自分を探求できる安全な関係性を築きます。</p>`,
        tips: ["内心の「良い/悪い」という判断に気づく", "存在そのものを肯定する"]
    },
    congruence: {
        icon: '🌾',
        title: 'ありのままの誠実さ',
        subtitle: '',
        origin: `<p>支援者が専門家の仮面をつけず、内面の体験と外面の表現が一致している状態です。</p>`,
        clinical: `<p>透明性のある誠実な関わりが、クライエントとの真正な信頼関係を生み出します。</p>`,
        tips: ["自分の内側の感覚に正直になる", "適切に自分の感覚を言葉にする"]
    },
    abstinence: {
        icon: '🕊️',
        title: '静けさを保つ心',
        subtitle: '',
        origin: `<p>支援者が自身の欲求（承認欲や解決欲）を脇に置き、クライエントのために場を保つ心です。</p>`,
        clinical: `<p>「役に立ちたい」という焦りを手放すことで、クライエント自身の成長力を信じて待つことができます。</p>`,
        tips: ["「何とかしたい」という焦りに気づく", "沈黙や停滞を許容する"]
    }
};

// ===== 認証関連 =====

async function login() {
    const password = document.getElementById('login-password').value;
    const errorEl = document.getElementById('login-error');
    
    if (!password) {
        errorEl.textContent = 'パスワードを入力してください';
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            sessionToken = data.token;
            localStorage.setItem('sessionToken', sessionToken);
            showMainApp();
        } else {
            errorEl.textContent = data.error || 'ログインに失敗しました';
        }
    } catch (error) {
        console.error('Login error:', error);
        errorEl.textContent = 'ログインに失敗しました。もう一度お試しください。';
    }
}

function handleLoginKeyPress(event) {
    if (event.key === 'Enter') {
        login();
    }
}

function logout() {
    sessionToken = null;
    localStorage.removeItem('sessionToken');
    document.getElementById('login-screen').style.display = 'flex';
    document.getElementById('main-header').style.display = 'none';
    document.getElementById('main-container').style.display = 'none';
    document.getElementById('main-footer').style.display = 'none';
    document.getElementById('login-password').value = '';
    document.getElementById('login-error').textContent = '';
}

function showMainApp() {
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('main-header').style.display = 'flex';
    document.getElementById('main-container').style.display = 'block';
    document.getElementById('main-footer').style.display = 'block';
    backToHome();
    loadSettings();
    loadScenarios(); // シナリオ読み込み
}

// ===== 設定画面 =====

async function showSettings() {
    document.querySelectorAll('.welcome-screen, .heart-preparation-screen, .scenario-selection, .dialogue-screen, .feedback-screen, .scenario-creator-screen, .heart-explanation-screen').forEach(screen => {
        screen.style.display = 'none';
    });
    document.querySelector('.settings-screen').style.display = 'block';
    await loadSettings();
}

function closeSettings() {
    document.querySelector('.settings-screen').style.display = 'none';
    document.querySelector('.welcome-screen').style.display = 'block';
}

async function loadSettings() {
    try {
        const response = await fetch(`${API_BASE_URL}/settings`, {
            headers: { 'Authorization': `Bearer ${sessionToken}` }
        });
        
        if (response.ok) {
            const data = await response.json();
            document.getElementById('api-key').value = data.api_key || '';
            document.getElementById('ai-model').value = data.model || 'gpt-4o';
        }
    } catch (error) {
        console.error('Failed to load settings:', error);
    }
}

async function saveSettings() {
    const apiKey = document.getElementById('api-key').value;
    const model = document.getElementById('ai-model').value;
    const messageEl = document.getElementById('settings-message');
    
    try {
        const response = await fetch(`${API_BASE_URL}/settings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${sessionToken}`
            },
            body: JSON.stringify({ api_key: apiKey, model })
        });
        
        if (response.ok) {
            messageEl.textContent = '設定を保存しました';
            messageEl.style.color = 'var(--primary-color)';
            setTimeout(() => { messageEl.textContent = ''; }, 3000);
        } else {
            const data = await response.json();
            messageEl.textContent = data.error || '設定の保存に失敗しました';
            messageEl.style.color = '#f44336';
        }
    } catch (error) {
        console.error('Failed to save settings:', error);
        messageEl.textContent = '設定の保存に失敗しました';
        messageEl.style.color = '#f44336';
    }
}

async function changePassword() {
    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const messageEl = document.getElementById('settings-message');
    
    if (!currentPassword || !newPassword || !confirmPassword) {
        messageEl.textContent = 'すべてのパスワード欄を入力してください';
        messageEl.style.color = '#f44336';
        return;
    }
    if (newPassword !== confirmPassword) {
        messageEl.textContent = '新しいパスワードが一致しません';
        messageEl.style.color = '#f44336';
        return;
    }
    if (newPassword.length < 6) {
        messageEl.textContent = 'パスワードは6文字以上にしてください';
        messageEl.style.color = '#f44336';
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${sessionToken}`
            },
            body: JSON.stringify({ current_password: currentPassword, new_password: newPassword })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            messageEl.textContent = 'パスワードを変更しました';
            messageEl.style.color = 'var(--primary-color)';
            document.getElementById('current-password').value = '';
            document.getElementById('new-password').value = '';
            document.getElementById('confirm-password').value = '';
            setTimeout(() => { messageEl.textContent = ''; }, 3000);
        } else {
            messageEl.textContent = data.error || 'パスワードの変更に失敗しました';
            messageEl.style.color = '#f44336';
        }
    } catch (error) {
        console.error('Failed to change password:', error);
        messageEl.textContent = 'パスワードの変更に失敗しました';
        messageEl.style.color = '#f44336';
    }
}

function toggleApiKeyVisibility() {
    const apiKeyInput = document.getElementById('api-key');
    apiKeyInput.type = apiKeyInput.type === 'password' ? 'text' : 'password';
}

// ===== ナビゲーション =====

function backToHome() {
    document.querySelectorAll('.heart-preparation-screen, .scenario-selection, .dialogue-screen, .feedback-screen, .scenario-creator-screen, .heart-explanation-screen, .settings-screen').forEach(screen => {
        screen.style.display = 'none';
    });
    
    document.querySelector('.welcome-screen').style.display = 'block';
    
    // 選択状態のリセット
    document.querySelectorAll('.heart-card').forEach(card => {
        card.classList.remove('selected');
        const details = card.querySelector('.heart-details-expanded');
        if (details) details.remove();
    });
    
    // PC用プレビューとレイアウトのリセット
    const layout = document.getElementById('preparation-layout');
    if (layout) {
        layout.classList.remove('layout-shifted');
    }
    const desktopPreview = document.getElementById('desktop-preview');
    if(desktopPreview) {
        desktopPreview.classList.remove('active');
    }

    selectedHeart = null;
}

function showHeartSelectionScreen() {
    document.querySelector('.welcome-screen').style.display = 'none';
    document.querySelector('.heart-preparation-screen').style.display = 'block';
}

// ドロップダウン（アコーディオン）およびPC用プレビューの選択処理
function selectHeart(heart, element) {
    // 1. 他のカードのリセット
    document.querySelectorAll('.heart-card').forEach(card => {
        card.classList.remove('selected');
        const details = card.querySelector('.heart-details-expanded');
        if (details) details.remove();
    });
    
    // 2. 新しい選択状態の適用
    element.classList.add('selected');
    selectedHeart = heart;
    selectedHeartData = heartMessages[heart];
    
    // 3. スマホ・タブレット用：詳細エリア（アコーディオン）の動的生成
    const detailsDiv = document.createElement('div');
    detailsDiv.className = 'heart-details-expanded';
    detailsDiv.innerHTML = `
        <div class="expanded-message">
            <p>${selectedHeartData.message.replace(/\n/g, '<br>')}</p>
        </div>
        <div class="expanded-actions">
            <button class="btn btn-primary btn-sm" onclick="event.stopPropagation(); showHeartExplanation()">
                解説を読む →
            </button>
        </div>
    `;
    element.appendChild(detailsDiv);

    requestAnimationFrame(() => {
        detailsDiv.classList.add('show');
    });
    
    // スマホのみ自動スクロール
    if (window.innerWidth < 1024) {
        setTimeout(() => {
            element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);
    }

    // 4. PC用：レイアウト変更とサイドパネルのアニメーション
    const layout = document.getElementById('preparation-layout');
    const desktopPreview = document.getElementById('desktop-preview');
    
    if (layout && desktopPreview) {
        // データ流し込み
        document.getElementById('preview-icon').textContent = selectedHeartData.icon;
        document.getElementById('preview-title').textContent = selectedHeartData.name;
        document.getElementById('preview-message').innerHTML = selectedHeartData.message.replace(/\n/g, '<br>');
        
        // レイアウトをシフトさせるクラスを付与
        layout.classList.add('layout-shifted');
        
        // パネルを表示させるクラスを付与
        desktopPreview.classList.add('active');
    }
}

function showHeartExplanation() {
    if (!selectedHeart) return;
    
    const explanationData = heartExplanations[selectedHeart];
    
    document.getElementById('explanation-icon').textContent = explanationData.icon;
    document.getElementById('explanation-title').textContent = explanationData.title;
    document.getElementById('explanation-subtitle').textContent = explanationData.subtitle;
    document.getElementById('explanation-origin').innerHTML = explanationData.origin;
    document.getElementById('explanation-clinical').innerHTML = explanationData.clinical;
    
    const tipsList = document.getElementById('explanation-tips');
    tipsList.innerHTML = '';
    explanationData.tips.forEach(tip => {
        const li = document.createElement('li');
        li.textContent = tip;
        tipsList.appendChild(li);
    });
    
    document.querySelector('.heart-preparation-screen').style.display = 'none';
    document.querySelector('.heart-explanation-screen').style.display = 'block';
}

function proceedToScenarios() {
    document.querySelector('.heart-explanation-screen').style.display = 'none';
    document.querySelector('.scenario-selection').style.display = 'block';
}

function backToHeartSelection() {
    document.querySelectorAll('.dialogue-screen, .feedback-screen, .scenario-creator-screen, .scenario-selection, .heart-explanation-screen').forEach(screen => {
        screen.style.display = 'none';
    });
    document.querySelector('.heart-preparation-screen').style.display = 'block';
    document.getElementById('personal-reflection').value = '';
}

function backToScenarios() {
    document.querySelectorAll('.dialogue-screen, .feedback-screen, .scenario-creator-screen').forEach(screen => {
        screen.style.display = 'none';
    });
    document.querySelector('.scenario-selection').style.display = 'block';
}

// ===== シナリオ作成 =====

function showScenarioCreator() {
    document.querySelector('.scenario-selection').style.display = 'none';
    document.querySelector('.scenario-creator-screen').style.display = 'block';
}

function cancelScenarioCreation() {
    document.querySelector('.scenario-creator-screen').style.display = 'none';
    document.querySelector('.scenario-selection').style.display = 'block';
    
    document.getElementById('scenario-theme').value = '';
    document.getElementById('client-age').value = '';
    document.getElementById('scenario-difficulty').value = 'beginner';
    document.getElementById('additional-notes').value = '';
    document.querySelectorAll('.checkbox-label input[type="checkbox"]').forEach(cb => cb.checked = false);
}

async function generateScenario() {
    const theme = document.getElementById('scenario-theme').value.trim();
    const age = document.getElementById('client-age').value;
    const difficulty = document.getElementById('scenario-difficulty').value;
    const additionalNotes = document.getElementById('additional-notes').value.trim();
    
    const selectedFocus = [];
    document.querySelectorAll('.checkbox-label input[type="checkbox"]:checked').forEach(cb => {
        selectedFocus.push(cb.value);
    });
    
    if (!theme) {
        alert('シナリオのテーマ・状況を入力してください。');
        return;
    }
    if (!age) {
        alert('クライアントの年齢層を選択してください。');
        return;
    }
    
    const loadingEl = document.getElementById('scenario-loading');
    loadingEl.style.display = 'block';
    
    try {
        const response = await fetch(`${API_BASE_URL}/scenarios/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${sessionToken}`
            },
            body: JSON.stringify({
                theme, age, difficulty, focus: selectedFocus, additional_notes: additionalNotes
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            alert('シナリオを作成しました！');
            cancelScenarioCreation();
            loadScenarios();
        } else {
            alert(data.error || 'シナリオの生成に失敗しました');
        }
    } catch (error) {
        console.error('Failed to generate scenario:', error);
        alert('エラーが発生しました。');
    } finally {
        loadingEl.style.display = 'none';
    }
}

async function loadScenarios() {
    try {
        const response = await fetch(`${API_BASE_URL}/scenarios`, {
            headers: { 'Authorization': `Bearer ${sessionToken}` }
        });
        
        if (response.ok) {
            const data = await response.json();
            const grid = document.getElementById('scenario-grid');
            
            // 全シナリオをクリア
            grid.innerHTML = '';
            allScenarios = {};
            
            // DBから取得したシナリオを追加
            data.scenarios.forEach((scenario, index) => {
                const scenarioId = scenario.id;
                allScenarios[scenarioId] = scenario;
                
                const diffClass = scenario.difficulty === 'beginner' ? 'beginner' : 
                                  scenario.difficulty === 'advanced' ? 'advanced' : 'intermediate';
                const diffText = scenario.difficulty === 'beginner' ? '初級' :
                                 scenario.difficulty === 'advanced' ? '上級' : '中級';
                
                const card = document.createElement('div');
                card.className = 'scenario-card';
                card.setAttribute('data-order', scenario.order || (100 + index));
                card.onclick = () => startScenario(scenarioId);
                
                card.innerHTML = `
                    <h3>
                        <span>${scenario.title}</span>
                        <span class="difficulty-indicator ${diffClass}">${diffText}</span>
                    </h3>
                    <p>${scenario.description}</p>
                    <span class="scenario-tag">${scenario.tag || 'カスタム'}</span>
                `;
                grid.appendChild(card);
            });
        }
    } catch (error) {
        console.error('Failed to load scenarios:', error);
    }
}

function sortScenarios() {
    const sortValue = document.getElementById('sort-select').value;
    const grid = document.getElementById('scenario-grid');
    const cards = Array.from(grid.children);
    
    if (sortValue === 'difficulty') {
        cards.sort((a, b) => {
            const diffA = a.querySelector('.difficulty-indicator.beginner') ? 1 :
                          a.querySelector('.difficulty-indicator.intermediate') ? 2 : 3;
            const diffB = b.querySelector('.difficulty-indicator.beginner') ? 1 :
                          b.querySelector('.difficulty-indicator.intermediate') ? 2 : 3;
            return diffA - diffB;
        });
    } else {
        cards.sort((a, b) => {
            const orderA = parseInt(a.getAttribute('data-order')) || 0;
            const orderB = parseInt(b.getAttribute('data-order')) || 0;
            return orderA - orderB;
        });
    }
    cards.forEach(card => grid.appendChild(card));
}

// ===== 対話 =====

async function startScenario(scenarioId) {
    currentScenario = scenarioId;
    conversationHistory = [];
    
    let scenario = allScenarios[scenarioId];
    
    if (!scenario) {
        try {
            const response = await fetch(`${API_BASE_URL}/scenarios/${scenarioId}`, {
                headers: { 'Authorization': `Bearer ${sessionToken}` }
            });
            if (response.ok) {
                scenario = await response.json();
                allScenarios[scenarioId] = scenario;
            } else {
                alert('シナリオの読み込みに失敗しました');
                return;
            }
        } catch (error) {
            console.error('Failed to load scenario:', error);
            return;
        }
    }
    
    currentScenarioData = scenario;
    
    document.querySelector('.scenario-selection').style.display = 'none';
    document.querySelector('.dialogue-screen').style.display = 'block';
    
    if (selectedHeart) {
        document.getElementById('reminder-icon').textContent = selectedHeartData.icon;
        document.getElementById('reminder-text').textContent = `今日の心：${selectedHeartData.name}`;
    }
    
    document.getElementById('scenario-title').textContent = scenario.title;
    document.getElementById('scenario-description').textContent = scenario.description;
    
    const chatArea = document.getElementById('chat-area');
    chatArea.innerHTML = `
        <div class="message client">
            <div class="message-avatar"></div>
            <div class="message-content">
                ${scenario.initialMessage || scenario.initial_message}
            </div>
        </div>
    `;
    
    conversationHistory.push({
        role: 'client',
        content: scenario.initialMessage || scenario.initial_message
    });
    
    messageCount = 0;
}

async function sendMessage() {
    const input = document.getElementById('message-input');
    const message = input.value.trim();
    if (!message) return;
    
    const chatArea = document.getElementById('chat-area');
    // セラピスト（自分）のメッセージ
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message therapist';
    messageDiv.innerHTML = `
        <div class="message-avatar"></div>
        <div class="message-content">
            ${message}
        </div>
    `;
    chatArea.appendChild(messageDiv);
    chatArea.scrollTop = chatArea.scrollHeight;
    
    input.value = '';
    messageCount++;
    conversationHistory.push({ role: 'therapist', content: message });
    
    const loadingEl = document.getElementById('chat-loading');
    loadingEl.style.display = 'block';
    
    try {
        const response = await fetch(`${API_BASE_URL}/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${sessionToken}`
            },
            body: JSON.stringify({
                scenario_id: currentScenario,
                selected_heart: selectedHeart,
                conversation_history: conversationHistory
            })
        });
        
        const data = await response.json();
        if (response.ok) {
            addClientMessage(data.response);
            conversationHistory.push({ role: 'client', content: data.response });
        } else {
            addClientMessage('（エラーが発生しました。設定を確認してください）');
        }
    } catch (error) {
        console.error('Chat error:', error);
        addClientMessage('（通信エラーが発生しました）');
    } finally {
        loadingEl.style.display = 'none';
    }
}

function addClientMessage(message) {
    const chatArea = document.getElementById('chat-area');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message client';
    messageDiv.innerHTML = `
        <div class="message-avatar"></div>
        <div class="message-content">
            ${message}
        </div>
    `;
    chatArea.appendChild(messageDiv);
    chatArea.scrollTop = chatArea.scrollHeight;
}

function handleKeyPress(event) {
    if (event.key === 'Enter') sendMessage();
}

async function endDialogue() {
    document.querySelector('.dialogue-screen').style.display = 'none';
    document.querySelector('.feedback-screen').style.display = 'block';
    
    const loadingEl = document.getElementById('feedback-loading');
    loadingEl.style.display = 'block';
    
    try {
        const response = await fetch(`${API_BASE_URL}/feedback`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${sessionToken}`
            },
            body: JSON.stringify({
                scenario_id: currentScenario,
                selected_heart: selectedHeart,
                conversation_history: conversationHistory
            })
        });
        
        const data = await response.json();
        if (response.ok) {
            displayFeedback(data);
        } else {
            document.getElementById('feedback-empathy').textContent = '生成に失敗しました';
        }
    } catch (error) {
        console.error('Feedback error:', error);
        document.getElementById('feedback-empathy').textContent = 'エラーが発生しました';
    } finally {
        loadingEl.style.display = 'none';
    }
}

function displayFeedback(data) {
    document.getElementById('feedback-empathy').textContent = data.empathy_feedback || '';
    document.getElementById('feedback-equanimity').textContent = data.equanimity_feedback || '';
    
    const attitudesEl = document.getElementById('attitude-evaluations');
    attitudesEl.innerHTML = '';
    
    const attitudes = [
        { key: 'metta', icon: '🌸', title: 'ラビングカインドネス' },
        { key: 'karuna', icon: '🌊', title: 'コンパッション' },
        { key: 'mudita', icon: '☀️', title: 'エンパシック・ジョイ' },
        { key: 'upekkha', icon: '🍃', title: 'エクアニミティ' },
        { key: 'empathic_understanding', icon: '💧', title: '相手の世界を感じる心' },
        { key: 'unconditional_regard', icon: '🌷', title: '無条件の受容' },
        { key: 'congruence', icon: '🌾', title: 'ありのままの誠実さ' },
        { key: 'abstinence', icon: '🕊️', title: '静けさを保つ心' }
    ];
    
    attitudes.forEach(attitude => {
        if (data.attitudes && data.attitudes[attitude.key]) {
            const div = document.createElement('div');
            div.className = 'evaluation-item';
            div.innerHTML = `
                <div class="evaluation-header">
                    <span class="eval-icon">${attitude.icon}</span>
                    <span class="eval-title">${attitude.title}</span>
                </div>
                <p class="evaluation-text">${data.attitudes[attitude.key]}</p>
            `;
            attitudesEl.appendChild(div);
        }
    });
    
    const nextStepsEl = document.getElementById('next-steps-list');
    nextStepsEl.innerHTML = '';
    if (data.next_steps && Array.isArray(data.next_steps)) {
        data.next_steps.forEach(step => {
            const li = document.createElement('li');
            li.textContent = step;
            nextStepsEl.appendChild(li);
        });
    }
}

function restartScenario() {
    document.querySelector('.feedback-screen').style.display = 'none';
    document.getElementById('personal-reflection').value = '';
    startScenario(currentScenario);
}

function downloadReflection() {
    const reflectionText = document.getElementById('personal-reflection').value;
    const now = new Date();
    const dateStr = now.toLocaleDateString();
    
    // フィードバックテキストの取得（簡易版）
    const empathy = document.getElementById('feedback-empathy').textContent;
    
    const content = `コンパッションケアAI - 対話の振り返り記録
=============================================
日時: ${now.toLocaleString()}
選択した心: ${selectedHeartData.name || '未選択'}
シナリオ: ${currentScenarioData?.title || '未記録'}

=============================================
【振り返りの概要】
${empathy.substring(0, 200)}...

=============================================
【あなた自身の振り返り】
${reflectionText}

=============================================
© Compassion Care AI Research Project
`;
    
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `対話の振り返り_${dateStr.replace(/\//g,'-')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// ===== 初期化 =====
window.addEventListener('DOMContentLoaded', function() {
    const savedToken = localStorage.getItem('sessionToken');
    if (savedToken) {
        sessionToken = savedToken;
        fetch(`${API_BASE_URL}/auth/verify`, {
            headers: { 'Authorization': `Bearer ${sessionToken}` }
        }).then(response => {
            if (response.ok) showMainApp();
            else {
                localStorage.removeItem('sessionToken');
                sessionToken = null;
            }
        }).catch(() => {
            localStorage.removeItem('sessionToken');
            sessionToken = null;
        });
    }
});
