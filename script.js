let OPENAI_API_KEY = '';
let chatHistory = [];

// 페이지 로드 시 저장된 API 키와 대화 내역 확인
window.addEventListener('load', () => {
    const savedApiKey = localStorage.getItem('openai_api_key');
    if (savedApiKey) {
        validateSavedApiKey(savedApiKey);
    }
    
    // 저장된 대화 내역 불러오기
    const savedHistory = localStorage.getItem('chat_history');
    if (savedHistory) {
        chatHistory = JSON.parse(savedHistory);
        chatHistory.forEach(msg => {
            appendMessage(msg.sender, msg.content);
        });
    }
});

async function validateSavedApiKey(apiKey) {
    try {
        const response = await fetch('https://api.openai.com/v1/models', {
            headers: {
                'Authorization': `Bearer ${apiKey}`
            }
        });

        if (response.ok) {
            OPENAI_API_KEY = apiKey;
            document.getElementById('apiKeyContainer').style.display = 'none';
            document.getElementById('chatContainer').style.display = 'block';
        } else {
            localStorage.removeItem('openai_api_key');
        }
    } catch (error) {
        console.error('Error:', error);
        localStorage.removeItem('openai_api_key');
    }
}

async function validateApiKey() {
    const apiKeyInput = document.getElementById('apiKeyInput');
    const apiKey = apiKeyInput.value.trim();
    const errorMessage = document.getElementById('apiKeyError');

    if (!apiKey) {
        showError('API 키를 입력해주세요.');
        return;
    }

    try {
        const response = await fetch('https://api.openai.com/v1/models', {
            headers: {
                'Authorization': `Bearer ${apiKey}`
            }
        });

        if (response.ok) {
            // API 키가 유효한 경우
            OPENAI_API_KEY = apiKey;
            // 로컬 스토리지에 API 키 저장
            localStorage.setItem('openai_api_key', apiKey);
            document.getElementById('apiKeyContainer').style.display = 'none';
            document.getElementById('chatContainer').style.display = 'block';
            errorMessage.style.display = 'none';
        } else {
            showError('유효하지 않은 API 키입니다.');
        }
    } catch (error) {
        showError('API 키 확인 중 오류가 발생했습니다.');
        console.error('Error:', error);
    }
}

function showError(message) {
    const errorMessage = document.getElementById('apiKeyError');
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
}

async function sendMessage() {
    const userInput = document.getElementById('userInput');
    const message = userInput.value.trim();

    if (message === '') return;

    // 사용자 메시지 표시
    appendMessage('user', message);
    // 대화 내역 저장
    chatHistory.push({ sender: 'user', content: message });
    saveHistory();
    
    userInput.value = '';

    try {
        // OpenAI API 호출
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [{
                    role: "user",
                    content: message
                }]
            })
        });

        const data = await response.json();
        const botResponse = data.choices[0].message.content;

        // 봇 응답 표시
        appendMessage('bot', botResponse);
        // 대화 내역 저장
        chatHistory.push({ sender: 'bot', content: botResponse });
        saveHistory();

    } catch (error) {
        console.error('Error:', error);
        appendMessage('bot', '죄송합니다. 오류가 발생했습니다.');
    }
}

function saveHistory() {
    localStorage.setItem('chat_history', JSON.stringify(chatHistory));
}

function appendMessage(sender, message) {
    const chatBox = document.getElementById('chatBox');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    messageDiv.textContent = message;
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

// 대화 내역 초기화 기능 추가
function clearHistory() {
    chatHistory = [];
    localStorage.removeItem('chat_history');
    document.getElementById('chatBox').innerHTML = '';
}

// Enter 키로 메시지 전송
document.getElementById('userInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

// API 키 입력창에서 Enter 키 처리
document.getElementById('apiKeyInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        validateApiKey();
    }
}); 