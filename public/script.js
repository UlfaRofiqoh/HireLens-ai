const landingPage = document.getElementById('landing-page');
const startBtn = document.getElementById('start-btn');
const chatContainer = document.getElementById('chat-container');
const endBtn = document.getElementById('end-interview-btn');

const form = document.getElementById('chat-form');
const input = document.getElementById('user-input');
const chatBox = document.getElementById('chat-box');
const attachBtn = document.getElementById('attach-btn');
const fileInput = document.getElementById('file-input');

let conversationHistory = [];

// ========================
// LANDING PAGE LOGIC
// ========================
startBtn.onclick = () => {
    // Hide Landing Page with fade effect
    landingPage.style.opacity = '0';
    setTimeout(() => {
        landingPage.style.display = 'none';
        
        // Show Chat Interface
        chatContainer.style.display = 'flex';
        
        // Trigger Cherry's Auto-Greeting AFTER starting
        initiateInterview();
    }, 500); // Wait for fade out animation
};


function initiateInterview() {
    sendToBackend("[SYSTEM: INITIATE_ONBOARDING]", true);
}


endBtn.onclick = () => {

    const confirmEnd = confirm("Are you sure you want to end this interview session? All chat history will be lost.");
    
    if (confirmEnd) {
        
        window.location.reload();
    }
};


let attachedFile = null;



attachBtn.onclick = () => fileInput.click();
fileInput.onchange = (e) => {
    if(e.target.files.length > 0) {
        const file = e.target.files[0];
        
        
        if (file.size > 2097152) {
            alert("Whoa, that file’s huge. Keep it under 2MB.");
            
            
            fileInput.value = ''; 
            attachedFile = null;
            attachBtn.style.backgroundColor = '#1e293b'; 
            input.placeholder = "Type your response here...";
            return; 
        }

        
        attachedFile = file;
        attachBtn.style.backgroundColor = '#991b1b';
        input.placeholder = `📄 ${attachedFile.name} (Siap dikirim!)`;
    }
};


form.addEventListener('submit', async function (e) {
  e.preventDefault();

  const userMessage = input.value.trim();
  
  
  if (!userMessage && !attachedFile) return;

  
  const displayMsg = userMessage || "Membagikan dokumen untuk direview...";
  appendMessage('user', displayMsg);
  
  
  input.value = ''; 
  input.placeholder = "Type your response here...";
  attachBtn.style.backgroundColor = '#1e293b'; 

  
  if (attachedFile) {
      
      const reader = new FileReader();
      reader.readAsDataURL(attachedFile);
      reader.onload = async () => {
          
          const base64String = reader.result.split(',')[1];
          const fileData = { data: base64String, mimeType: attachedFile.type };
          
          attachedFile = null; 
          await sendToBackend(userMessage, false, fileData);
      };
  } else {
      
      await sendToBackend(userMessage, false, null);
  }
});


async function sendToBackend(messageText, isHidden, fileData = null) {
    
    let msgObj = { role: "user", text: messageText || "Tolong review dokumen ini." };
    
    
    if (fileData) {
        msgObj.file = fileData;
    }
    
    conversationHistory.push(msgObj);

    const loadingId = "loading-" + Date.now();
    
    if (!isHidden) {
        showTypingIndicator(loadingId);
    }

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ conversation: conversationHistory })
        });

        
        if (response.status === 413) {
            if (!isHidden) removeMessage(loadingId);
            appendMessage('bot', 'Whoa, that file’s huge. Keep it under 2MB. 📂');
            
            
            conversationHistory.pop(); 
            return;
        }

        const data = await response.json();

        if (!isHidden) removeMessage(loadingId);

        if (response.ok) {
            appendMessage('bot', data.result);
            conversationHistory.push({ role: "model", text: data.result });
        } else {
            const errorMsg = data.error || '';
            if (errorMsg.includes("429") || errorMsg.includes("quota")) {
                appendMessage('bot', 'Cherry is currently processing a lot of candidates. Please wait a moment, then try again! ⏳');
            } else {
                appendMessage('bot', 'Sorry, a technical error occurred. Please try again later.');
            }
        }
    } catch (error) {
        console.error("Detail Error Asli:", error);
        if (!isHidden) removeMessage(loadingId);
        appendMessage('bot', 'Failed to connect to Cherry.');
    }
}

// ========================
// UI HELPER FUNCTIONS
// ========================
function appendMessage(sender, text, id = null) {
  const wrapper = document.createElement('div');
  wrapper.classList.add('message-wrapper', sender);
  if (id) wrapper.id = id;
  
  const avatar = document.createElement('div');
  avatar.classList.add('avatar');
  // Inisial CH buat Cherry, ME buat User
  avatar.textContent = sender === 'bot' ? 'CH' : 'ME';

  const bubble = document.createElement('div');
  bubble.classList.add('bubble');
  bubble.textContent = text;

  wrapper.appendChild(avatar);
  wrapper.appendChild(bubble);
  
  chatBox.appendChild(wrapper);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function showTypingIndicator(id) {
  const wrapper = document.createElement('div');
  wrapper.classList.add('message-wrapper', 'bot');
  wrapper.id = id;
  
  const avatar = document.createElement('div');
  avatar.classList.add('avatar');
  avatar.textContent = 'CH';

  const bubble = document.createElement('div');
  bubble.classList.add('bubble');
  bubble.innerHTML = '<div class="typing-dots"><span></span><span></span><span></span></div>';

  wrapper.appendChild(avatar);
  wrapper.appendChild(bubble);
  
  chatBox.appendChild(wrapper);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function removeMessage(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
}