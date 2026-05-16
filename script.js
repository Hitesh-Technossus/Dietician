/* ============================================
   NUTRI COPILOT — APPLICATION LOGIC
   AI Dietitian Assistant Prototype
   ============================================ */

// ============================================
// STATE
// ============================================
const state = {
    currentPatient: null,
    chatHistory: [],
    contextVisible: false,
    sidebarVisible: true,
    planGenerated: false,
    selectedPreferences: {
        diet: [],
        allergies: [],
        conditions: [],
        cuisine: [],
        activity: null,
        goals: [],
        notes: ''
    }
};

// ============================================
// DOM ELEMENTS
// ============================================
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

const els = {
    sidebar: $('#sidebar'),
    sidebarToggle: $('#sidebarToggle'),
    mainContent: $('#mainContent'),
    welcomeState: $('#welcomeState'),
    chatState: $('#chatState'),
    chatMessages: $('#chatMessages'),
    promptInput: $('#promptInput'),
    chatInput: $('#chatInput'),
    generateBtn: $('#generateBtn'),
    chatSendBtn: $('#chatSendBtn'),
    uploadBtn: $('#uploadBtn'),
    chatUploadBtn: $('#chatUploadBtn'),
    voiceBtn: $('#voiceBtn'),
    fileInput: $('#fileInput'),
    newPatientBtn: $('#newPatientBtn'),
    patientSearch: $('#patientSearch'),
    patientList: $('#patientList'),
    contextPanel: $('#contextPanel'),
    contextEmpty: $('#contextEmpty'),
    contextData: $('#contextData'),
    contextPanelClose: $('#contextPanelClose'),
    greeting: $('#greeting'),
    dropZone: $('#dropZone'),
    mobileOverlay: $('#mobileOverlay')
};

// ============================================
// INITIALIZATION
// ============================================
function init() {
    setGreeting();
    bindEvents();
    autoResizeTextareas();
}

function setGreeting() {
    const hour = new Date().getHours();
    let greet = 'Good Evening';
    if (hour < 12) greet = 'Good Morning';
    else if (hour < 17) greet = 'Good Afternoon';
    els.greeting.textContent = `${greet}, Dr. Sharma`;
}

// ============================================
// EVENT BINDINGS
// ============================================
function bindEvents() {
    // Sidebar
    els.sidebarToggle.addEventListener('click', toggleSidebar);
    els.mobileOverlay.addEventListener('click', closePanels);

    // New Patient
    els.newPatientBtn.addEventListener('click', startNewPatient);

    // Patient list
    els.patientList.addEventListener('click', handlePatientClick);

    // Search
    els.patientSearch.addEventListener('input', handlePatientSearch);

    // Prompt actions
    els.generateBtn.addEventListener('click', handlePromptSubmit);
    els.chatSendBtn.addEventListener('click', handleChatSubmit);
    els.uploadBtn.addEventListener('click', () => els.fileInput.click());
    els.chatUploadBtn.addEventListener('click', () => els.fileInput.click());
    els.voiceBtn.addEventListener('click', handleVoice);
    els.fileInput.addEventListener('change', handleFileUpload);

    // Keyboard
    els.promptInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handlePromptSubmit();
        }
    });

    els.chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleChatSubmit();
        }
    });

    // Drag & Drop
    const dropZone = els.dropZone;
    document.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.querySelector('.prompt-upload-area').classList.add('dragover');
    });
    document.addEventListener('dragleave', (e) => {
        if (!e.relatedTarget || !dropZone.contains(e.relatedTarget)) {
            dropZone.querySelector('.prompt-upload-area')?.classList.remove('dragover');
        }
    });
    document.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.querySelector('.prompt-upload-area')?.classList.remove('dragover');
        if (e.dataTransfer.files.length > 0) {
            simulateReportUpload(e.dataTransfer.files[0].name);
        }
    });

    // Context Panel
    els.contextPanelClose.addEventListener('click', () => {
        els.contextPanel.classList.remove('visible');
    });

    // Quick actions
    $$('.quick-action-card').forEach((card, i) => {
        card.addEventListener('click', () => {
            if (i === 0) els.fileInput.click();
            else if (i === 1) simulateReportUpload('quick_report.pdf');
            else if (i === 2) simulateReportUpload('existing_plan.pdf');
        });
    });
}

// ============================================
// AUTO RESIZE TEXTAREAS
// ============================================
function autoResizeTextareas() {
    [els.promptInput, els.chatInput].forEach(textarea => {
        if (!textarea) return;
        textarea.addEventListener('input', () => {
            textarea.style.height = 'auto';
            textarea.style.height = Math.min(textarea.scrollHeight, 150) + 'px';
        });
    });
}

// ============================================
// SIDEBAR
// ============================================
function toggleSidebar() {
    els.sidebar.classList.toggle('visible');
    if (window.innerWidth <= 900) {
        els.mobileOverlay.classList.toggle('hidden', !els.sidebar.classList.contains('visible'));
    }
}

function closePanels() {
    els.sidebar.classList.remove('visible');
    els.contextPanel.classList.remove('visible');
    els.mobileOverlay.classList.add('hidden');
}

// ============================================
// PATIENT MANAGEMENT
// ============================================
function startNewPatient() {
    state.currentPatient = null;
    state.chatHistory = [];
    state.planGenerated = false;
    state.selectedPreferences = {
        diet: [], allergies: [], conditions: [],
        cuisine: [], activity: null, goals: [], notes: ''
    };

    // Reset UI
    els.welcomeState.classList.remove('hidden');
    els.chatState.classList.add('hidden');
    els.chatMessages.innerHTML = '';
    els.contextEmpty.classList.remove('hidden');
    els.contextData.classList.add('hidden');
    els.promptInput.value = '';

    // Update active state
    $$('.patient-item').forEach(el => el.classList.remove('active'));

    if (window.innerWidth <= 900) closePanels();
}

function handlePatientClick(e) {
    const item = e.target.closest('.patient-item');
    if (!item) return;

    $$('.patient-item').forEach(el => el.classList.remove('active'));
    item.classList.add('active');

    // Simulate loading existing patient
    simulateReportUpload('patient_report.pdf');

    if (window.innerWidth <= 900) closePanels();
}

function handlePatientSearch(e) {
    const query = e.target.value.toLowerCase();
    $$('.patient-item').forEach(item => {
        const name = item.querySelector('.patient-name').textContent.toLowerCase();
        item.style.display = name.includes(query) ? 'flex' : 'none';
    });
}

// ============================================
// PROMPT HANDLING
// ============================================
function handlePromptSubmit() {
    const text = els.promptInput.value.trim();
    if (!text) {
        simulateReportUpload('blood_report_sharma.pdf');
        return;
    }

    els.promptInput.value = '';
    els.promptInput.style.height = 'auto';
    transitionToChat();
    addMessage('user', text);
    simulateAIResponse(text);
}

function handleChatSubmit() {
    const text = els.chatInput.value.trim();
    if (!text) return;

    els.chatInput.value = '';
    els.chatInput.style.height = 'auto';
    addMessage('user', text);
    simulateAIResponse(text);
}

// ============================================
// FILE UPLOAD
// ============================================
function handleFileUpload(e) {
    const file = e.target.files[0];
    if (file) {
        simulateReportUpload(file.name);
    }
    e.target.value = '';
}

function simulateReportUpload(filename) {
    transitionToChat();

    // User message
    addMessage('user', `Uploaded: ${filename}`, true);

    // Show AI processing
    showTypingIndicator();

    setTimeout(() => {
        removeTypingIndicator();
        addAIMessage(createShimmerContent());

        // Simulate extraction
        setTimeout(() => {
            removeLastMessage();
            addAIMessage(createExtractionMessage());
            showContextPanel();

            // After showing extraction, ask for preferences
            setTimeout(() => {
                showTypingIndicator();
                setTimeout(() => {
                    removeTypingIndicator();
                    addAIMessage(createContextCollectionUI());
                    scrollChatToBottom();
                }, 1200);
            }, 800);
        }, 2000);
    }, 1500);
}

// ============================================
// CHAT MANAGEMENT
// ============================================
function transitionToChat() {
    els.welcomeState.classList.add('hidden');
    els.chatState.classList.remove('hidden');
}

function addMessage(type, content, isFile = false) {
    const msg = document.createElement('div');
    msg.className = 'message';

    const avatarClass = type === 'user' ? 'user' : 'ai';
    const avatarText = type === 'user' ? 'DS' : 'AI';
    const label = type === 'user' ? 'You' : 'NutriCopilot';

    msg.innerHTML = `
        <div class="message-avatar ${avatarClass}">${avatarText}</div>
        <div class="message-content">
            <div class="message-label">${label}</div>
            ${isFile ? `
                <div class="upload-success">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14,2 14,8 20,8"/>
                    </svg>
                    <span>${content}</span>
                </div>
            ` : `<p>${content}</p>`}
        </div>
    `;

    els.chatMessages.appendChild(msg);
    scrollChatToBottom();
}

function addAIMessage(htmlContent) {
    const msg = document.createElement('div');
    msg.className = 'message';
    msg.innerHTML = `
        <div class="message-avatar ai">AI</div>
        <div class="message-content">
            <div class="message-label">NutriCopilot</div>
            ${htmlContent}
        </div>
    `;
    els.chatMessages.appendChild(msg);
    scrollChatToBottom();
    return msg;
}

function removeLastMessage() {
    const messages = els.chatMessages.querySelectorAll('.message');
    if (messages.length > 0) {
        messages[messages.length - 1].remove();
    }
}

function showTypingIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'message typing-message';
    indicator.innerHTML = `
        <div class="message-avatar ai">AI</div>
        <div class="message-content">
            <div class="typing-indicator">
                <span></span><span></span><span></span>
            </div>
        </div>
    `;
    els.chatMessages.appendChild(indicator);
    scrollChatToBottom();
}

function removeTypingIndicator() {
    const typing = els.chatMessages.querySelector('.typing-message');
    if (typing) typing.remove();
}

function scrollChatToBottom() {
    requestAnimationFrame(() => {
        els.chatMessages.scrollTop = els.chatMessages.scrollHeight;
    });
}

// ============================================
// AI RESPONSE SIMULATION
// ============================================
function simulateAIResponse(userText) {
    showTypingIndicator();

    const responses = [
        "I've noted that. Let me adjust the dietary recommendations based on this information.",
        "Thank you for the clarification. I'll incorporate this into the personalized plan.",
        "Understood. This helps me refine the nutritional targets for optimal outcomes.",
        "Got it. I'll factor this into the meal structure and caloric distribution."
    ];

    setTimeout(() => {
        removeTypingIndicator();
        const response = responses[Math.floor(Math.random() * responses.length)];
        streamText(response);
    }, 1500);
}

function streamText(text) {
    const msg = document.createElement('div');
    msg.className = 'message';
    msg.innerHTML = `
        <div class="message-avatar ai">AI</div>
        <div class="message-content">
            <div class="message-label">NutriCopilot</div>
            <p class="streaming-text"></p>
        </div>
    `;
    els.chatMessages.appendChild(msg);

    const textEl = msg.querySelector('.streaming-text');
    let i = 0;
    const interval = setInterval(() => {
        if (i < text.length) {
            textEl.textContent += text[i];
            i++;
            scrollChatToBottom();
        } else {
            clearInterval(interval);
        }
    }, 20);
}

// ============================================
// SHIMMER / LOADING CONTENT
// ============================================
function createShimmerContent() {
    return `
        <p style="margin-bottom: 12px; color: var(--text-secondary); font-size: 13px;">
            Analyzing patient report...
        </p>
        <div class="shimmer long"></div>
        <div class="shimmer medium"></div>
        <div class="shimmer short"></div>
        <div class="shimmer medium"></div>
    `;
}

// ============================================
// EXTRACTION MESSAGE
// ============================================
function createExtractionMessage() {
    return `
        <p style="margin-bottom: 16px;">I've analyzed the patient report. Here's what I extracted:</p>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px;">
            <div style="padding: 10px; background: var(--bg-tertiary); border-radius: 8px;">
                <span style="font-size: 11px; color: var(--text-tertiary); display: block;">Patient</span>
                <span style="font-size: 13px; font-weight: 500;">Rajesh Sharma, 52M</span>
            </div>
            <div style="padding: 10px; background: var(--bg-tertiary); border-radius: 8px;">
                <span style="font-size: 11px; color: var(--text-tertiary); display: block;">BMI</span>
                <span style="font-size: 13px; font-weight: 500; color: var(--warning);">28.4 (Overweight)</span>
            </div>
            <div style="padding: 10px; background: var(--bg-tertiary); border-radius: 8px;">
                <span style="font-size: 11px; color: var(--text-tertiary); display: block;">HbA1c</span>
                <span style="font-size: 13px; font-weight: 500; color: var(--error);">8.2% (High)</span>
            </div>
            <div style="padding: 10px; background: var(--bg-tertiary); border-radius: 8px;">
                <span style="font-size: 11px; color: var(--text-tertiary); display: block;">BP</span>
                <span style="font-size: 13px; font-weight: 500; color: var(--warning);">142/92 mmHg</span>
            </div>
            <div style="padding: 10px; background: var(--bg-tertiary); border-radius: 8px;">
                <span style="font-size: 11px; color: var(--text-tertiary); display: block;">Cholesterol</span>
                <span style="font-size: 13px; font-weight: 500; color: var(--error);">245 mg/dL</span>
            </div>
            <div style="padding: 10px; background: var(--bg-tertiary); border-radius: 8px;">
                <span style="font-size: 11px; color: var(--text-tertiary); display: block;">Vitamin D</span>
                <span style="font-size: 13px; font-weight: 500; color: var(--info);">12 ng/mL (Low)</span>
            </div>
        </div>
        <p style="font-size: 13px; color: var(--text-secondary); padding: 10px; background: var(--warning-light); border-radius: 8px; border-left: 3px solid var(--warning);">
            ⚠️ Patient shows signs of uncontrolled Type 2 Diabetes with hypertension. Dietary intervention is critical.
        </p>
    `;
}

// ============================================
// CONTEXT COLLECTION UI
// ============================================
function createContextCollectionUI() {
    return `
        <p style="margin-bottom: 16px;">Please confirm patient preferences before I generate the diet plan:</p>
        <div class="context-cards-container">
            <!-- Diet Preference -->
            <div class="context-card">
                <div class="context-card-title">🥗 Diet Preference</div>
                <div class="chips-container" data-category="diet">
                    <span class="chip" data-value="Vegetarian">Vegetarian</span>
                    <span class="chip" data-value="Non Vegetarian">Non Vegetarian</span>
                    <span class="chip" data-value="Vegan">Vegan</span>
                    <span class="chip" data-value="Jain">Jain</span>
                    <span class="chip" data-value="Eggetarian">Eggetarian</span>
                    <span class="chip" data-value="Other">Other</span>
                </div>
            </div>

            <!-- Allergies -->
            <div class="context-card">
                <div class="context-card-title">⚠️ Allergies</div>
                <div class="chips-container" data-category="allergies" data-multi="true">
                    <span class="chip" data-value="Lactose">Lactose</span>
                    <span class="chip" data-value="Gluten">Gluten</span>
                    <span class="chip" data-value="Nuts">Nuts</span>
                    <span class="chip" data-value="Soy">Soy</span>
                    <span class="chip" data-value="Seafood">Seafood</span>
                    <span class="chip" data-value="None">None</span>
                </div>
            </div>

            <!-- Medical Conditions -->
            <div class="context-card">
                <div class="context-card-title">🏥 Medical Conditions</div>
                <div class="chips-container" data-category="conditions" data-multi="true">
                    <span class="chip selected" data-value="Diabetes">Diabetes</span>
                    <span class="chip selected" data-value="Hypertension">Hypertension</span>
                    <span class="chip" data-value="Thyroid">Thyroid</span>
                    <span class="chip" data-value="PCOS">PCOS</span>
                    <span class="chip" data-value="Kidney Disease">Kidney Disease</span>
                    <span class="chip" data-value="Fatty Liver">Fatty Liver</span>
                    <span class="chip" data-value="Other">Other</span>
                </div>
            </div>

            <!-- Cuisine Preference -->
            <div class="context-card">
                <div class="context-card-title">🍛 Cuisine Preference</div>
                <div class="chips-container" data-category="cuisine" data-multi="true">
                    <span class="chip" data-value="Indian">Indian</span>
                    <span class="chip" data-value="South Indian">South Indian</span>
                    <span class="chip" data-value="Gujarati">Gujarati</span>
                    <span class="chip" data-value="Punjabi">Punjabi</span>
                    <span class="chip" data-value="Maharashtrian">Maharashtrian</span>
                    <span class="chip" data-value="High Protein">High Protein</span>
                    <span class="chip" data-value="Satvik">Satvik</span>
                    <span class="chip" data-value="Other">Other</span>
                </div>
            </div>

            <!-- Activity Level -->
            <div class="context-card">
                <div class="context-card-title">🏃 Activity Level</div>
                <div class="activity-chips" data-category="activity">
                    <span class="activity-chip" data-value="Sedentary">Sedentary</span>
                    <span class="activity-chip" data-value="Moderate">Moderate</span>
                    <span class="activity-chip" data-value="Active">Active</span>
                </div>
            </div>

            <!-- Goals -->
            <div class="context-card">
                <div class="context-card-title">🎯 Goals</div>
                <div class="chips-container" data-category="goals" data-multi="true">
                    <span class="chip selected" data-value="Sugar Control">Sugar Control</span>
                    <span class="chip" data-value="Weight Loss">Weight Loss</span>
                    <span class="chip" data-value="Muscle Gain">Muscle Gain</span>
                    <span class="chip selected" data-value="Heart Healthy">Heart Healthy</span>
                    <span class="chip" data-value="Kidney Safe">Kidney Safe</span>
                </div>
            </div>

            <!-- Additional Notes -->
            <div class="context-card">
                <div class="context-card-title">📝 Additional Notes</div>
                <textarea class="context-textarea" placeholder="Any specific dietary preferences, timing constraints, cultural considerations..." id="additionalNotes"></textarea>
            </div>

            <button class="generate-plan-btn" id="generatePlanBtn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polygon points="13,2 3,14 12,14 11,22 21,10 12,10"/>
                </svg>
                Generate Diet Plan
            </button>
        </div>
    `;
}

// ============================================
// CONTEXT PANEL
// ============================================
function showContextPanel() {
    els.contextEmpty.classList.add('hidden');
    els.contextData.classList.remove('hidden');

    if (window.innerWidth <= 1200) {
        els.contextPanel.classList.add('visible');
    }
}

// ============================================
// DIET PLAN GENERATION
// ============================================
function generateDietPlan() {
    // Collect preferences
    collectPreferences();

    // Show workflow animation
    showTypingIndicator();

    setTimeout(() => {
        removeTypingIndicator();
        const workflowMsg = addAIMessage(createWorkflowSteps());

        // Animate steps
        const steps = workflowMsg.querySelectorAll('.workflow-step');
        animateWorkflowSteps(steps, () => {
            // After workflow, show diet plan
            setTimeout(() => {
                showTypingIndicator();
                setTimeout(() => {
                    removeTypingIndicator();
                    addAIMessage(createDietPlanHTML());
                    scrollChatToBottom();
                    state.planGenerated = true;
                    bindPlanActions();
                }, 1000);
            }, 500);
        });
    }, 800);
}

function collectPreferences() {
    const containers = els.chatMessages.querySelectorAll('.chips-container');
    containers.forEach(container => {
        const category = container.dataset.category;
        const selected = container.querySelectorAll('.chip.selected');
        state.selectedPreferences[category] = Array.from(selected).map(c => c.dataset.value);
    });

    const activityChips = els.chatMessages.querySelectorAll('.activity-chip.selected');
    if (activityChips.length > 0) {
        state.selectedPreferences.activity = activityChips[0].dataset.value;
    }

    const notes = els.chatMessages.querySelector('#additionalNotes');
    if (notes) {
        state.selectedPreferences.notes = notes.value;
    }
}

function createWorkflowSteps() {
    return `
        <p style="margin-bottom: 12px;">Generating your personalized diet plan...</p>
        <div class="workflow-steps">
            <div class="workflow-step" data-step="1">
                <div class="workflow-step-icon">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="4"/>
                    </svg>
                </div>
                <span class="workflow-step-text">Analyzing clinical reports...</span>
            </div>
            <div class="workflow-step" data-step="2">
                <div class="workflow-step-icon">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="4"/>
                    </svg>
                </div>
                <span class="workflow-step-text">Reviewing clinical restrictions...</span>
            </div>
            <div class="workflow-step" data-step="3">
                <div class="workflow-step-icon">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="4"/>
                    </svg>
                </div>
                <span class="workflow-step-text">Personalizing nutrition targets...</span>
            </div>
            <div class="workflow-step" data-step="4">
                <div class="workflow-step-icon">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="4"/>
                    </svg>
                </div>
                <span class="workflow-step-text">Building meal structure...</span>
            </div>
        </div>
    `;
}

function animateWorkflowSteps(steps, callback) {
    let current = 0;
    const interval = setInterval(() => {
        if (current > 0) {
            steps[current - 1].classList.remove('active');
            steps[current - 1].classList.add('completed');
            steps[current - 1].querySelector('.workflow-step-icon').innerHTML = `
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                    <polyline points="20,6 9,17 4,12"/>
                </svg>
            `;
        }

        if (current < steps.length) {
            steps[current].classList.add('active');
            current++;
            scrollChatToBottom();
        } else {
            clearInterval(interval);
            if (callback) callback();
        }
    }, 1000);
}

// ============================================
// DIET PLAN HTML
// ============================================
function createDietPlanHTML() {
    return `
        <p style="margin-bottom: 8px;">Here's the personalized diet plan for <strong>Rajesh Sharma</strong>:</p>
        <p style="font-size: 12px; color: var(--text-tertiary); margin-bottom: 16px;">
            Optimized for: Sugar Control • Heart Healthy • Low Sodium • High Fiber
        </p>
        <div class="diet-plan-container">
            <div class="meal-card" style="animation-delay: 0.1s">
                <div class="meal-card-header">
                    <div class="meal-card-title">
                        <div class="meal-time-icon" style="background: #fef3c7;">🌅</div>
                        <div>
                            <h4>Early Morning</h4>
                            <span>6:00 – 6:30 AM</span>
                        </div>
                    </div>
                    <div class="meal-card-actions">
                        <button class="meal-action-btn edit-meal" title="Edit">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                        </button>
                        <button class="meal-action-btn regen-meal" title="Regenerate">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="23,4 23,10 17,10"/>
                                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
                            </svg>
                        </button>
                    </div>
                </div>
                <ul class="meal-items">
                    <li>Warm water with lemon and methi seeds (soaked overnight)</li>
                    <li>5 almonds (soaked) + 2 walnuts</li>
                </ul>
            </div>

            <div class="meal-card" style="animation-delay: 0.2s">
                <div class="meal-card-header">
                    <div class="meal-card-title">
                        <div class="meal-time-icon" style="background: #fef9c3;">🍳</div>
                        <div>
                            <h4>Breakfast</h4>
                            <span>8:00 – 8:30 AM</span>
                        </div>
                    </div>
                    <div class="meal-card-actions">
                        <button class="meal-action-btn edit-meal" title="Edit">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                        </button>
                        <button class="meal-action-btn regen-meal" title="Regenerate">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="23,4 23,10 17,10"/>
                                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
                            </svg>
                        </button>
                    </div>
                </div>
                <ul class="meal-items">
                    <li>Moong dal chilla (2 pcs) with mint chutney</li>
                    <li>1 bowl vegetable upma (low oil, with oats)</li>
                    <li>Green tea or black coffee (no sugar)</li>
                </ul>
            </div>

            <div class="meal-card" style="animation-delay: 0.3s">
                <div class="meal-card-header">
                    <div class="meal-card-title">
                        <div class="meal-time-icon" style="background: #e0f2fe;">🍎</div>
                        <div>
                            <h4>Mid-Morning Snack</h4>
                            <span>10:30 – 11:00 AM</span>
                        </div>
                    </div>
                    <div class="meal-card-actions">
                        <button class="meal-action-btn edit-meal" title="Edit">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                        </button>
                        <button class="meal-action-btn regen-meal" title="Regenerate">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="23,4 23,10 17,10"/>
                                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
                            </svg>
                        </button>
                    </div>
                </div>
                <ul class="meal-items">
                    <li>1 small apple or guava (low GI fruit)</li>
                    <li>Handful of roasted chana (20g)</li>
                </ul>
            </div>

            <div class="meal-card" style="animation-delay: 0.4s">
                <div class="meal-card-header">
                    <div class="meal-card-title">
                        <div class="meal-time-icon" style="background: #dcfce7;">🥗</div>
                        <div>
                            <h4>Lunch</h4>
                            <span>1:00 – 1:30 PM</span>
                        </div>
                    </div>
                    <div class="meal-card-actions">
                        <button class="meal-action-btn edit-meal" title="Edit">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                        </button>
                        <button class="meal-action-btn regen-meal" title="Regenerate">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="23,4 23,10 17,10"/>
                                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
                            </svg>
                        </button>
                    </div>
                </div>
                <ul class="meal-items">
                    <li>1 small jowar/bajra roti + 1 multigrain roti</li>
                    <li>1 bowl dal (masoor/moong) – low salt</li>
                    <li>Lauki/tinda sabzi (low oil preparation)</li>
                    <li>Cucumber & tomato salad with lemon dressing</li>
                    <li>1 small bowl curd (low fat)</li>
                </ul>
            </div>

            <div class="meal-card" style="animation-delay: 0.5s">
                <div class="meal-card-header">
                    <div class="meal-card-title">
                        <div class="meal-time-icon" style="background: #fce7f3;">☕</div>
                        <div>
                            <h4>Evening Snack</h4>
                            <span>4:30 – 5:00 PM</span>
                        </div>
                    </div>
                    <div class="meal-card-actions">
                        <button class="meal-action-btn edit-meal" title="Edit">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                        </button>
                        <button class="meal-action-btn regen-meal" title="Regenerate">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="23,4 23,10 17,10"/>
                                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
                            </svg>
                        </button>
                    </div>
                </div>
                <ul class="meal-items">
                    <li>Green tea (unsweetened)</li>
                    <li>1 multigrain khakhra or 2 flax crackers</li>
                    <li>Sprout salad with lemon (small bowl)</li>
                </ul>
            </div>

            <div class="meal-card" style="animation-delay: 0.6s">
                <div class="meal-card-header">
                    <div class="meal-card-title">
                        <div class="meal-time-icon" style="background: #ede9fe;">🌙</div>
                        <div>
                            <h4>Dinner</h4>
                            <span>7:30 – 8:00 PM</span>
                        </div>
                    </div>
                    <div class="meal-card-actions">
                        <button class="meal-action-btn edit-meal" title="Edit">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                        </button>
                        <button class="meal-action-btn regen-meal" title="Regenerate">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="23,4 23,10 17,10"/>
                                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
                            </svg>
                        </button>
                    </div>
                </div>
                <ul class="meal-items">
                    <li>1 multigrain roti (small)</li>
                    <li>Palak/methi sabzi (low oil, no cream)</li>
                    <li>1 bowl mix veg soup (clear, no corn starch)</li>
                    <li>Small portion grilled paneer (50g) or fish</li>
                </ul>
            </div>

            <div class="meal-card" style="animation-delay: 0.7s">
                <div class="meal-card-header">
                    <div class="meal-card-title">
                        <div class="meal-time-icon" style="background: #e0f2fe;">💧</div>
                        <div>
                            <h4>Hydration Plan</h4>
                            <span>Throughout the day</span>
                        </div>
                    </div>
                </div>
                <ul class="meal-items">
                    <li>Minimum 2.5–3 liters of water daily</li>
                    <li>1 glass warm water before each meal</li>
                    <li>Coconut water (unsweetened) – 1 glass post lunch</li>
                    <li>Avoid sugary drinks, packaged juices, sodas</li>
                </ul>
            </div>

            <div class="meal-card avoid" style="animation-delay: 0.8s">
                <div class="meal-card-header">
                    <div class="meal-card-title">
                        <div class="meal-time-icon" style="background: var(--error-light);">🚫</div>
                        <div>
                            <h4>Foods to Avoid</h4>
                            <span>Strict restrictions</span>
                        </div>
                    </div>
                </div>
                <ul class="meal-items">
                    <li>White rice, maida, white bread, refined flour products</li>
                    <li>Sugar, jaggery, honey in excess</li>
                    <li>Fried foods, pakoras, samosas, chips</li>
                    <li>Full-fat dairy, butter, ghee (limit to 1 tsp/day)</li>
                    <li>Mango, banana, grapes, chikoo (high GI fruits)</li>
                    <li>Pickles, papads, processed foods (high sodium)</li>
                </ul>
            </div>

            <div class="meal-card supplements" style="animation-delay: 0.9s">
                <div class="meal-card-header">
                    <div class="meal-card-title">
                        <div class="meal-time-icon" style="background: var(--info-light);">💊</div>
                        <div>
                            <h4>Supplement Notes</h4>
                            <span>Doctor to prescribe</span>
                        </div>
                    </div>
                </div>
                <ul class="meal-items">
                    <li>Vitamin D3 — 60,000 IU weekly (8 weeks) then maintenance</li>
                    <li>Omega-3 fatty acids — 1000mg daily</li>
                    <li>Chromium picolinate — may improve insulin sensitivity</li>
                    <li>Fiber supplement — Isabgol 1 tsp at bedtime if needed</li>
                </ul>
            </div>
        </div>

        <!-- Plan Actions -->
        <div class="plan-actions">
            <button class="plan-action-btn secondary" id="regeneratePlanBtn">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="23,4 23,10 17,10"/>
                    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
                </svg>
                Regenerate
            </button>
            <button class="plan-action-btn success" id="approvePlanBtn">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="20,6 9,17 4,12"/>
                </svg>
                Approve Plan
            </button>
            <button class="plan-action-btn primary" id="exportPdfBtn">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7,10 12,15 17,10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Export PDF
            </button>
        </div>
    `;
}

// ============================================
// PLAN ACTIONS
// ============================================
function bindPlanActions() {
    setTimeout(() => {
        const regenerateBtn = document.getElementById('regeneratePlanBtn');
        const approveBtn = document.getElementById('approvePlanBtn');
        const exportBtn = document.getElementById('exportPdfBtn');

        if (regenerateBtn) {
            regenerateBtn.addEventListener('click', () => {
                addMessage('user', 'Please regenerate the diet plan with more variety.');
                showTypingIndicator();
                setTimeout(() => {
                    removeTypingIndicator();
                    streamText("I'll regenerate the plan with more variety while keeping the same nutritional targets. Give me a moment...");
                }, 1500);
            });
        }

        if (approveBtn) {
            approveBtn.addEventListener('click', () => {
                const approvedDiv = document.createElement('div');
                approvedDiv.className = 'plan-approved';
                approvedDiv.innerHTML = `
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                        <polyline points="22,4 12,14.01 9,11.01"/>
                    </svg>
                    <span>Diet plan approved by Dr. Sharma • ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                `;

                const planActions = document.querySelector('.plan-actions');
                if (planActions) {
                    planActions.parentNode.insertBefore(approvedDiv, planActions.nextSibling);
                    planActions.remove();
                }
                scrollChatToBottom();
            });
        }

        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                // Simulate PDF export
                exportBtn.innerHTML = `
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="20,6 9,17 4,12"/>
                    </svg>
                    Downloaded!
                `;
                exportBtn.style.background = 'var(--success)';
                setTimeout(() => {
                    exportBtn.innerHTML = `
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                            <polyline points="7,10 12,15 17,10"/>
                            <line x1="12" y1="15" x2="12" y2="3"/>
                        </svg>
                        Export PDF
                    `;
                    exportBtn.style.background = '';
                }, 2000);
            });
        }

        // Edit meal buttons
        document.querySelectorAll('.edit-meal').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const card = e.target.closest('.meal-card');
                const items = card.querySelector('.meal-items');
                if (items.contentEditable === 'true') {
                    items.contentEditable = 'false';
                    items.style.background = '';
                    items.style.padding = '';
                    items.style.borderRadius = '';
                } else {
                    items.contentEditable = 'true';
                    items.style.background = 'var(--accent-primary-light)';
                    items.style.padding = '8px';
                    items.style.borderRadius = '6px';
                    items.focus();
                }
            });
        });

        // Regenerate meal buttons
        document.querySelectorAll('.regen-meal').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const card = e.target.closest('.meal-card');
                const items = card.querySelector('.meal-items');
                items.style.opacity = '0.5';
                setTimeout(() => {
                    items.style.opacity = '1';
                }, 1000);
            });
        });
    }, 100);
}

// ============================================
// VOICE (Simulation)
// ============================================
function handleVoice() {
    const btn = els.voiceBtn;
    btn.classList.toggle('recording');

    if (btn.classList.contains('recording')) {
        // Simulate recording
        setTimeout(() => {
            btn.classList.remove('recording');
            els.promptInput.value = "Patient is a 52 year old male with uncontrolled diabetes and high cholesterol. Needs a strict vegetarian diet plan.";
            els.promptInput.dispatchEvent(new Event('input'));
        }, 3000);
    }
}

// ============================================
// EVENT DELEGATION FOR DYNAMIC ELEMENTS
// ============================================
document.addEventListener('click', (e) => {
    // Chip selection
    if (e.target.classList.contains('chip')) {
        const container = e.target.closest('.chips-container');
        const isMulti = container?.dataset.multi === 'true';

        if (isMulti) {
            e.target.classList.toggle('selected');
        } else {
            container.querySelectorAll('.chip').forEach(c => c.classList.remove('selected'));
            e.target.classList.add('selected');
        }
    }

    // Activity chip selection
    if (e.target.classList.contains('activity-chip')) {
        const container = e.target.closest('.activity-chips');
        container.querySelectorAll('.activity-chip').forEach(c => c.classList.remove('selected'));
        e.target.classList.add('selected');
    }

    // Generate Plan button
    if (e.target.id === 'generatePlanBtn' || e.target.closest('#generatePlanBtn')) {
        generateDietPlan();
    }
});

// ============================================
// INITIALIZE
// ============================================
document.addEventListener('DOMContentLoaded', init);
