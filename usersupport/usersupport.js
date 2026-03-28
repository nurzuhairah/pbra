
async function getAIResponse(userMessage) {
  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": "",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "openai/gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are PBRA Support Assistant, an AI chatbot that helps staff and admins navigate and use the PBRA system — a role management portal for Politeknik Brunei.
        
        PBRA stands for Politeknik Brunei Role Appointment. It helps staff manage:
        - 📌 Role-based resource access (e.g., documents by role/department)
        - 📣 Viewing and creating announcements
        - 🗂️ Task assignment and activity log updates
        - 📅 Calendar-based scheduling and completed task tracking
        - 📤 Internal mail and report system
        - 📋 Viewing user profiles by role or department
        
        Your job is to:
        1. Answer user questions based on how the PBRA system works.
        2. Simulate responses like "To upload a file, go to the Teaching Resources section..." or "Only admins can assign roles."
        3. Keep responses short, clear, and helpful — like a friendly tech support agent.
        4. Do NOT make up features PBRA doesn't have.
        
        Use role-based logic: Admins can assign roles, staff can only view and respond to assigned tasks or reports.
        
        Always refer to PBRA as “the PBRA portal” or “PBRA system.”`
          },
          {
            role: "user",
            content: userMessage
          }
        ]
        
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ OpenRouter API error:", response.status, errorText);
      throw new Error(`OpenRouter returned ${response.status}: ${errorText}`);
    }

    const data = await response.json();

    if (!data.choices || !data.choices.length) {
      console.error("⚠️ No response choices from AI:", data);
      throw new Error("AI returned an empty response.");
    }

    return data.choices[0].message.content;

  } catch (error) {
    console.error("❌ AI fetch failed:", error);
    throw error;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const chatBox = document.querySelector(".chat-messages");
  const userInput = document.getElementById("user-input");
  const chatForm = document.getElementById("chat-form");
  const attachBtn = document.querySelector(".attach-btn");
  const fileUpload = document.getElementById("file-upload");
  const historyList = document.querySelector(".history-box ul");

  const userKey = `chatHistory_user_${window.currentUserId}`;

  loadChatSidebar();

  chatForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const msg = userInput.value.trim();
    if (msg === "") return;

    appendMessage("user", msg);
    saveToHistory("You", msg);

    userInput.value = "";

    const botBubble = appendMessage("bot", "Thinking...");

    getAIResponse(msg).then(reply => {
      botBubble.textContent = reply;
      saveToHistory("PBRA Bot", reply);
    }).catch((error) => {
      botBubble.textContent = "Sorry, something went wrong.";
      console.error("🚨 Error during AI response:", error);
    });
  });

  function appendMessage(sender, msg) {
    const msgDiv = document.createElement("div");
    msgDiv.classList.add("message", sender === "user" ? "user-message" : "bot-message");
    msgDiv.textContent = msg;
    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
    return msgDiv;
  }

  function saveToHistory(sender, message) {
    const history = JSON.parse(localStorage.getItem(userKey) || "[]");
    const now = new Date();
    history.push({ sender, message, timestamp: now.toISOString() });
    localStorage.setItem(userKey, JSON.stringify(history));
    loadChatSidebar();
  }

  function loadChatSidebar() {
    const history = JSON.parse(localStorage.getItem(userKey) || "[]");
    const sessions = groupSessions(history);

    historyList.innerHTML = "";
    sessions.forEach(session => {
      const title = session.messages.find(m => m.sender === "You")?.message || "Chat Session";
      const li = document.createElement("li");
      li.textContent = `[${session.date}] ${title.substring(0, 30)}...`;
      li.style.cursor = "pointer";
      li.addEventListener("click", () => {
        chatBox.innerHTML = "";
        session.messages.forEach(msg => {
          appendMessage(msg.sender === "You" ? "user" : "bot", msg.message);
        });
      });
      historyList.appendChild(li);
    });
  }

  function groupSessions(history) {
    const sessions = [];
    let currentSession = [];
    let lastTime = null;
    const gap = 1000 * 60 * 10;

    history.forEach(item => {
      const time = new Date(item.timestamp);
      if (!lastTime || time - lastTime <= gap) {
        currentSession.push(item);
      } else {
        sessions.push({ messages: currentSession, date: new Date(currentSession[0].timestamp).toLocaleDateString() });
        currentSession = [item];
      }
      lastTime = time;
    });

    if (currentSession.length > 0) {
      sessions.push({ messages: currentSession, date: new Date(currentSession[0].timestamp).toLocaleDateString() });
    }

    return sessions.reverse();
  }

  attachBtn.addEventListener("click", () => fileUpload.click());
  fileUpload.addEventListener("change", e => {
    if (e.target.files.length > 0) {
      alert("📎 File selected: " + e.target.files[0].name);
    }
  });
});

// === Breadcrumbs ===
let breadcrumbs = JSON.parse(sessionStorage.getItem('breadcrumbs')) || [];
let currentPageUrl = window.location.pathname;
let currentPageName = '';

if (currentPageUrl.includes('homepage.php')) {
  currentPageName = 'Homepage';
} else if (currentPageUrl.includes('calendar.php')) {
  currentPageName = 'Calendar';
} else if (currentPageUrl.includes('distributetask.php')) {
  currentPageName = 'Distribute Task';
} else if (currentPageUrl.includes('events.php')) {
  currentPageName = 'Events';
} else if (currentPageUrl.includes('feedback.php')) {
  currentPageName = 'Feedback';
} else if (currentPageUrl.includes('mail.php')) {
  currentPageName = 'Mail';
} else if (currentPageUrl.includes('myrole.php')) {
  currentPageName = 'My Role';
} else if (currentPageUrl.includes('profile.php')) {
  currentPageName = 'Profile';
} else if (currentPageUrl.includes('report.php')) {
  currentPageName = 'Report';
} else if (currentPageUrl.includes('roles.php')) {
  currentPageName = 'Roles';
} else if (currentPageUrl.includes('schedule.php')) {
  currentPageName = 'Schedule';
} else if (currentPageUrl.includes('staff.php')) {
  currentPageName = 'Staff';
} else if (currentPageUrl.includes('usersupport.php')) {
  currentPageName = 'User Support';
} else {
  currentPageName = 'Unknown Page';
}

let pageExists = breadcrumbs.some(breadcrumb => breadcrumb.url === currentPageUrl);
if (!pageExists) {
  breadcrumbs.push({ name: currentPageName, url: currentPageUrl });
  sessionStorage.setItem('breadcrumbs', JSON.stringify(breadcrumbs));
}

let breadcrumbList = document.getElementById('breadcrumb-list');
if (breadcrumbList) {
  breadcrumbList.innerHTML = '';
  breadcrumbs.forEach((breadcrumb, index) => {
    let breadcrumbItem = document.createElement('li');
    let link = document.createElement('a');
    link.href = breadcrumb.url;
    link.textContent = breadcrumb.name;

    link.addEventListener('click', function (event) {
      event.preventDefault();
      let clickedIndex = index;
      breadcrumbs = breadcrumbs.slice(0, clickedIndex + 1);
      sessionStorage.setItem('breadcrumbs', JSON.stringify(breadcrumbs));
      window.location.href = breadcrumb.url;
    });

    breadcrumbItem.appendChild(link);
    breadcrumbList.appendChild(breadcrumbItem);

    if (index < breadcrumbs.length - 1) {
      let separator = document.createElement('span');
      separator.textContent = ' > ';
      breadcrumbList.appendChild(separator);
    }
  });
}
