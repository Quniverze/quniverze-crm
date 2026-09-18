/**
 * QUNIVERZE FOUNDER COMMAND CENTER
 * Design System Implementation
 * Editorial, Calm, Operational, Focused, Information-Dense
 */

(function () {
  'use strict';

  // LocalStorage keys
  const STORAGE_KEY_ITEMS = 'quniverze_items_v2';
  const STORAGE_KEY_CONTACTS = 'quniverze_contacts_v2';

  // Seed Data strictly aligned with specification
  const DEFAULT_ITEMS = [
    {
      id: 'item-1',
      title: 'Call ABC Restaurant',
      venture: 'Quniverze',
      type: 'Opportunity',
      assignee: 'You',
      section: 'overdue',
      dueLabel: '2 days overdue',
      dueDate: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0],
      important: false,
      status: 'open',
      description: 'Discuss pilot expansion for back-of-house automated procurement module. Owner David Chen requested quick call before Friday dinner rush.',
      subtasks: [
        { id: 'st-1', text: 'Pull metrics from initial 14-day trial run', done: true },
        { id: 'st-2', text: 'Confirm hardware specs for kitchen tablet', done: false },
        { id: 'st-3', text: 'Send revised commercial terms', done: false }
      ],
      activity: [
        { desc: 'Follow-up requested by David Chen', time: '2 days ago' },
        { desc: 'Initial trial onboarded', time: '14 days ago' }
      ]
    },
    {
      id: 'item-2',
      title: 'Review Product X results',
      venture: 'Dropshipping',
      type: 'Experiment',
      assignee: 'You',
      section: 'today',
      dueLabel: 'Due today',
      dueDate: new Date().toISOString().split('T')[0],
      important: false,
      status: 'open',
      description: 'Analyze conversion metrics and CPA for variant test #4. Verify if margin holds above 38% after customs surcharge.',
      subtasks: [
        { id: 'st-4', text: 'Export ad spend from TikTok Ads manager', done: true },
        { id: 'st-5', text: 'Calculate net contribution margin per SKU', done: false },
        { id: 'st-6', text: 'Decide kill or scale threshold ($2,000/day)', done: false }
      ],
      activity: [
        { desc: 'Variant test #4 commenced', time: 'Yesterday' },
        { desc: 'Ad spend scaled to $500/day', time: '3 days ago' }
      ]
    },
    {
      id: 'item-3',
      title: 'Proposal sent to XYZ Café',
      venture: 'Quniverze',
      type: 'Opportunity',
      assignee: 'You',
      section: 'needs_call',
      dueLabel: '6 days quiet',
      dueDate: new Date(Date.now() - 6 * 86400000).toISOString().split('T')[0],
      important: true,
      status: 'open',
      description: 'Founder Sarah Lin received our bespoke proposal for multi-location rollout. No reply for 6 days — need to make executive call to unblock decision.',
      subtasks: [
        { id: 'st-7', text: 'Review sent slide deck for pricing objection points', done: true },
        { id: 'st-8', text: 'Direct WhatsApp/phone check-in with Sarah', done: false }
      ],
      activity: [
        { desc: '6 days without response (threshold triggered)', time: 'Today' },
        { desc: 'Enterprise proposal delivered via email', time: '6 days ago' }
      ]
    },
    {
      id: 'item-4',
      title: 'Research 20 new prospects',
      venture: 'Quniverze',
      type: 'Task',
      assignee: 'Quniverze Assistant',
      section: 'delegated',
      dueLabel: 'Due tomorrow',
      dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      important: false,
      status: 'open',
      description: 'Build targeted list of high-volume specialty coffee roasters in metropolitan hubs. Qualify for inventory turnover and modern POS compatibility.',
      subtasks: [
        { id: 'st-9', text: 'Filter registry by revenue > $1.2M', done: true },
        { id: 'st-10', text: 'Find verified emails for Heads of Operations', done: false },
        { id: 'st-11', text: 'Add to founder CRM table', done: false }
      ],
      activity: [
        { desc: 'Delegated to Quniverze Assistant', time: 'Yesterday' },
        { desc: 'Initial qualification criteria approved', time: '2 days ago' }
      ]
    },
    {
      id: 'item-5',
      title: 'Negotiate bulk terms with packaging supplier',
      venture: 'Dropshipping',
      type: 'Task',
      assignee: 'Dropshipping Assistant',
      section: 'delegated',
      dueLabel: 'In 3 days',
      dueDate: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
      important: false,
      status: 'open',
      description: 'Apex Packaging quotes $1.42/unit at 5,000 units. Target is $1.18 with 30-day payment terms.',
      subtasks: [
        { id: 'st-12', text: 'Send counter-offer with volume commitment', done: false }
      ],
      activity: [
        { desc: 'Quote received from Apex', time: '2 days ago' }
      ]
    },
    {
      id: 'item-6',
      title: 'Interview finalist for Operations Lead',
      venture: 'Quniverze',
      type: 'Task',
      assignee: 'You',
      section: 'upcoming',
      dueLabel: 'In 4 days',
      dueDate: new Date(Date.now() + 4 * 86400000).toISOString().split('T')[0],
      important: true,
      status: 'open',
      description: 'Final 45-min founder interview with candidate Mark. Focus on crisis management, inventory reconciliation, and operator empathy.',
      subtasks: [
        { id: 'st-13', text: 'Review case study submitted by candidate', done: false },
        { id: 'st-14', text: 'Prepare reference check contacts', done: false }
      ],
      activity: [
        { desc: 'Second-round interview passed', time: '4 days ago' }
      ]
    }
  ];

  const DEFAULT_CONTACTS = [
    {
      id: 'contact-1',
      name: 'ABC Restaurant',
      person: 'David Chen, Managing Partner',
      venture: 'Quniverze',
      quietDays: 2,
      lastInteraction: '2 days ago',
      notes: 'High-margin flagship venue with 3 sister locations planned. Evaluating Quniverze for group-wide adoption.',
      linkedItemId: 'item-1',
      linkedItemTitle: 'Call ABC Restaurant'
    },
    {
      id: 'contact-2',
      name: 'XYZ Café',
      person: 'Sarah Lin, Operations Lead',
      venture: 'Quniverze',
      quietDays: 6,
      lastInteraction: '6 days ago',
      notes: 'Sent formal enterprise proposal. Key concern was staff training time. Needs executive reassurance.',
      linkedItemId: 'item-3',
      linkedItemTitle: 'Proposal sent to XYZ Café'
    },
    {
      id: 'contact-3',
      name: 'Apex Logistics & Packaging',
      person: 'Marcus Vance, Commercial Director',
      venture: 'Dropshipping',
      quietDays: 1,
      lastInteraction: 'Yesterday',
      notes: 'Primary supplier for air freight custom cartons. Dependable SLA, room to negotiate volume brackets.',
      linkedItemId: 'item-5',
      linkedItemTitle: 'Negotiate bulk terms with packaging supplier'
    }
  ];

  // State
  let items = [];
  let contacts = [];
  let currentView = 'today';
  let selectedItemId = null;
  let selectedContactId = null;

  // DOM Elements
  const feedListEl = document.getElementById('feed-list');
  const detailPaneEl = document.getElementById('detail-pane-content');
  const mobileDetailBodyEl = document.getElementById('mobile-detail-scroll-body');
  const mobileFullscreenDetailEl = document.getElementById('mobile-fullscreen-detail');
  const mobileDetailBackBtn = document.getElementById('mobile-detail-back-btn');
  const mobileDetailHeaderPreview = document.getElementById('mobile-detail-header-preview');
  const mobileDetailHeaderActions = document.getElementById('mobile-detail-header-actions');
  const quickCaptureDialog = document.getElementById('quick-capture-dialog');
  const quickCaptureInput = document.getElementById('quick-capture-input');
  const quickCaptureCloseBtn = document.getElementById('quick-capture-close-btn');
  const shortcutsDialog = document.getElementById('shortcuts-dialog');
  const shortcutsTriggerBtn = document.getElementById('shortcuts-trigger-btn');
  const shortcutsCloseBtn = document.getElementById('shortcuts-close-btn');
  const sidebarQuickCaptureBtn = document.getElementById('sidebar-quick-capture-btn');
  const feedCaptureTrigger = document.getElementById('feed-capture-trigger');
  const mobileFab = document.getElementById('mobile-fab');
  const todayBadgeCount = document.getElementById('today-badge-count');
  const sidebarSummaryText = document.getElementById('sidebar-summary-text');
  const feedStatusLine = document.getElementById('feed-status-line');
  const currentDateLabel = document.getElementById('current-date-label');
  const appToast = document.getElementById('app-toast');

  // Contact Dialog
  const contactDialog = document.getElementById('contact-dialog');
  const contactForm = document.getElementById('contact-form');
  const addContactBtn = document.getElementById('add-contact-btn');
  const contactDialogClose = document.getElementById('contact-dialog-close');
  const contactCancelBtn = document.getElementById('contact-cancel-btn');

  // Initialize
  function init() {
    loadState();
    setupDateDisplay();
    setupNavigation();
    setupQuickCapture();
    setupShortcuts();
    setupKeyboardListeners();
    setupContactsDialog();

    // Default selection
    if (!selectedItemId && items.length > 0) {
      selectedItemId = items[0].id;
    }
    if (!selectedContactId && contacts.length > 0) {
      selectedContactId = contacts[0].id;
    }

    renderTodayFeed();
    renderDetailPane();
    renderVenturesView();
    renderContactsView();
    updateBadges();
  }

  // Load and save state
  function loadState() {
    try {
      const storedItems = localStorage.getItem(STORAGE_KEY_ITEMS);
      if (storedItems) {
        items = JSON.parse(storedItems);
      } else {
        items = DEFAULT_ITEMS;
        saveItems();
      }

      const storedContacts = localStorage.getItem(STORAGE_KEY_CONTACTS);
      if (storedContacts) {
        contacts = JSON.parse(storedContacts);
      } else {
        contacts = DEFAULT_CONTACTS;
        saveContacts();
      }
    } catch (e) {
      console.error('Failed to load state from localStorage', e);
      items = DEFAULT_ITEMS;
      contacts = DEFAULT_CONTACTS;
    }
  }

  function saveItems() {
    try {
      localStorage.setItem(STORAGE_KEY_ITEMS, JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save items', e);
    }
    updateBadges();
  }

  function saveContacts() {
    try {
      localStorage.setItem(STORAGE_KEY_CONTACTS, JSON.stringify(contacts));
    } catch (e) {
      console.error('Failed to save contacts', e);
    }
  }

  function setupDateDisplay() {
    const today = new Date();
    const options = { weekday: 'long', month: 'short', day: 'numeric' };
    currentDateLabel.textContent = today.toLocaleDateString('en-US', options);
  }

  function showToast(message) {
    if (!appToast) return;
    appToast.textContent = message;
    appToast.hidden = false;
    clearTimeout(appToast._timeout);
    appToast._timeout = setTimeout(() => {
      appToast.hidden = true;
    }, 2400);
  }

  // Navigation Logic
  function setupNavigation() {
    const desktopNavBtns = document.querySelectorAll('.sidebar-nav .nav-link');
    const mobileNavBtns = document.querySelectorAll('.mobile-bottom-bar .mobile-nav-btn');

    function switchView(viewName) {
      currentView = viewName;

      // Update desktop buttons
      desktopNavBtns.forEach(btn => {
        btn.classList.toggle('is-active', btn.dataset.view === viewName);
      });

      // Update mobile buttons
      mobileNavBtns.forEach(btn => {
        btn.classList.toggle('is-active', btn.dataset.view === viewName);
      });

      // Switch panels
      document.querySelectorAll('.view-panel').forEach(panel => {
        if (panel.id === `view-${viewName}`) {
          panel.classList.add('is-active');
          panel.hidden = false;
        } else {
          panel.classList.remove('is-active');
          panel.hidden = true;
        }
      });

      // Dismiss mobile full-screen detail when switching views
      closeMobileDetail();

      if (viewName === 'ventures') {
        renderVenturesView();
      } else if (viewName === 'contacts') {
        renderContactsView();
      }
    }

    desktopNavBtns.forEach(btn => {
      btn.addEventListener('click', () => switchView(btn.dataset.view));
    });

    mobileNavBtns.forEach(btn => {
      btn.addEventListener('click', () => switchView(btn.dataset.view));
    });

    // Mobile back button
    if (mobileDetailBackBtn) {
      mobileDetailBackBtn.addEventListener('click', () => {
        closeMobileDetail();
      });
    }
  }

  function closeMobileDetail() {
    if (mobileFullscreenDetailEl) {
      mobileFullscreenDetailEl.hidden = true;
    }
  }

  function openMobileDetail() {
    if (mobileFullscreenDetailEl && window.innerWidth < 860) {
      renderMobileDetail();
      mobileFullscreenDetailEl.hidden = false;
    }
  }

  // Badges and Summaries
  function updateBadges() {
    const openItems = items.filter(i => i.status !== 'completed');
    const overdueCount = items.filter(i => i.status !== 'completed' && i.section === 'overdue').length;
    const needsCallCount = items.filter(i => i.status !== 'completed' && i.section === 'needs_call').length;

    if (todayBadgeCount) {
      todayBadgeCount.textContent = openItems.length;
    }

    const summaryStr = `${openItems.length} open · ${needsCallCount} needs call`;
    if (sidebarSummaryText) {
      sidebarSummaryText.textContent = summaryStr;
    }
    if (feedStatusLine) {
      feedStatusLine.textContent = `${openItems.length} active items · ${overdueCount} overdue · ${needsCallCount} awaiting response`;
    }
  }

  // ==========================================================================
  // TODAY FEED ENGINE (Continuous Vertical Feed with Inline Section Labels)
  // ==========================================================================

  function renderTodayFeed() {
    feedListEl.innerHTML = '';

    // Grouping sections in editorial priority order
    const sections = [
      { key: 'overdue', label: 'OVERDUE', glyph: '●', glyphClass: 'glyph-overdue' },
      { key: 'today', label: 'DUE TODAY', glyph: '○', glyphClass: 'glyph-today' },
      { key: 'needs_call', label: 'NEEDS YOUR CALL', glyph: '◆', glyphClass: 'glyph-call' },
      { key: 'delegated', label: 'DELEGATED', glyph: '□', glyphClass: 'glyph-delegated' },
      { key: 'upcoming', label: 'UPCOMING', glyph: '○', glyphClass: 'glyph-today' },
      { key: 'completed', label: 'COMPLETED', glyph: '✓', glyphClass: 'glyph-completed' }
    ];

    sections.forEach(sec => {
      let secItems = [];
      if (sec.key === 'completed') {
        secItems = items.filter(i => i.status === 'completed');
      } else {
        secItems = items.filter(i => i.status !== 'completed' && (i.section === sec.key || (!i.section && sec.key === 'today')));
      }

      if (secItems.length === 0) return;

      // Section Header
      const headerEl = document.createElement('div');
      headerEl.className = 'feed-section-header';
      headerEl.innerHTML = `
        <span>${sec.label}</span>
        <span class="feed-section-count">${secItems.length}</span>
      `;
      feedListEl.appendChild(headerEl);

      // Section Items
      secItems.forEach(item => {
        const itemRow = document.createElement('div');
        itemRow.className = `feed-item ${item.id === selectedItemId ? 'is-selected' : ''} ${item.status === 'completed' ? 'is-completed' : ''}`;
        itemRow.dataset.id = item.id;
        itemRow.setAttribute('role', 'listitem');
        itemRow.tabIndex = 0;

        // Custom glyph per row
        let glyphChar = sec.glyph;
        let glyphClass = sec.glyphClass;

        if (item.status === 'completed') {
          glyphChar = '✓';
          glyphClass = 'glyph-completed';
        }

        // Timing label formatting
        let timingHtml = '';
        if (item.dueLabel) {
          let timingClass = 'due-subtle';
          if (item.section === 'overdue') timingClass = 'due-overdue';
          else if (item.section === 'needs_call') timingClass = 'due-quiet';
          else if (item.section === 'today') timingClass = 'due-today';

          timingHtml = `<div class="item-due-row ${timingClass}">${escapeHtml(item.dueLabel)}</div>`;
        }

        // Star indicator: small star ⭐ Important
        const starHtml = item.important ? `<span class="item-star" title="Important">⭐ Important</span>` : '';

        // Assignee formatting (subtle, distinguished)
        const assigneeClass = item.assignee === 'You' ? 'assignee-badge-subtle' : '';

        itemRow.innerHTML = `
          <div class="item-glyph-box">
            <span class="glyph-indicator ${glyphClass}">${glyphChar}</span>
          </div>
          <div class="item-content">
            <div class="item-title-row">
              <span class="item-title">${escapeHtml(item.title)}</span>
              ${starHtml}
            </div>
            <div class="item-meta-line">
              <span>${escapeHtml(item.venture || 'Unassigned')}</span>
              <span class="meta-dot">·</span>
              <span>${escapeHtml(item.type || 'Task')}</span>
              <span class="meta-dot">·</span>
              <span class="${assigneeClass}">${escapeHtml(item.assignee || 'You')}</span>
            </div>
            ${timingHtml}
          </div>
          <button type="button" class="item-action-check" title="${item.status === 'completed' ? 'Mark open' : 'Mark done'}" aria-label="Toggle completed">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <rect x="1" y="1" width="12" height="12" rx="2" stroke="currentColor" stroke-width="1.5" fill="${item.status === 'completed' ? 'currentColor' : 'none'}"/>
              ${item.status === 'completed' ? '<path d="M4 7L6 9L10 4" stroke="#FFFFFF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>' : ''}
            </svg>
          </button>
        `;

        // Row Click: Select item and preserve feed context
        itemRow.addEventListener('click', (e) => {
          if (e.target.closest('.item-action-check')) {
            toggleItemComplete(item.id);
            return;
          }
          selectItem(item.id);
        });

        // Keyboard navigation Enter
        itemRow.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            selectItem(item.id);
          }
        });

        feedListEl.appendChild(itemRow);
      });
    });
  }

  function selectItem(id) {
    selectedItemId = id;

    // Update selected class in feed list without losing scroll
    const rows = feedListEl.querySelectorAll('.feed-item');
    rows.forEach(r => {
      r.classList.toggle('is-selected', r.dataset.id === id);
    });

    renderDetailPane();

    if (window.innerWidth < 860) {
      openMobileDetail();
    }
  }

  function toggleItemComplete(id) {
    const item = items.find(i => i.id === id);
    if (!item) return;

    const newStatus = item.status === 'completed' ? 'open' : 'completed';
    item.status = newStatus;

    if (newStatus === 'completed') {
      item.activity.unshift({
        desc: 'Marked completed by You',
        time: 'Just now'
      });
      showToast(`Completed: ${item.title}`);
    } else {
      item.activity.unshift({
        desc: 'Re-opened by You',
        time: 'Just now'
      });
      showToast(`Re-opened: ${item.title}`);
    }

    saveItems();
    renderTodayFeed();
    renderDetailPane();
    renderMobileDetail();
  }

  function toggleItemStar(id) {
    const item = items.find(i => i.id === id);
    if (!item) return;

    item.important = !item.important;
    item.activity.unshift({
      desc: item.important ? 'Marked as Important ⭐' : 'Removed Important flag',
      time: 'Just now'
    });

    saveItems();
    renderTodayFeed();
    renderDetailPane();
    renderMobileDetail();
    showToast(item.important ? 'Marked important' : 'Unmarked important');
  }

  // ==========================================================================
  // DETAIL PANE ENGINE (Clean Vertical Information Hierarchy over Cards)
  // ==========================================================================

  function getDetailHtml(item) {
    if (!item) {
      return `
        <div class="detail-empty-state">
          <div class="detail-empty-title">Select an item from the Today feed</div>
          <p>Click any row on the left or press J/K to inspect details.</p>
        </div>
      `;
    }

    const subtasksHtml = (item.subtasks || []).map(st => `
      <div class="subtask-item ${st.done ? 'is-done' : ''}" data-stid="${st.id}">
        <input type="checkbox" class="subtask-checkbox" ${st.done ? 'checked' : ''} aria-label="Subtask checkbox" />
        <span class="subtask-text">${escapeHtml(st.text)}</span>
        <button type="button" class="subtask-delete-btn" title="Delete subtask" aria-label="Delete">✕</button>
      </div>
    `).join('');

    const activityHtml = (item.activity || []).map(act => `
      <div class="activity-event">
        <span class="activity-event-desc">${escapeHtml(act.desc)}</span>
        <span class="activity-event-time">${escapeHtml(act.time)}</span>
      </div>
    `).join('');

    return `
      <div class="detail-view-card" data-id="${item.id}">
        
        <!-- TITLE & EDITORIAL HIERARCHY -->
        <div class="detail-header-block">
          <textarea class="detail-title-input" id="detail-title" rows="1" placeholder="Title">${escapeHtml(item.title)}</textarea>
          
          <div class="detail-meta-hierarchy">
            <span class="meta-field-clickable" id="detail-type-btn" title="Click to cycle type">${escapeHtml(item.type || 'Task')}</span>
            <span class="meta-dot">·</span>
            <span class="meta-field-clickable" id="detail-venture-btn" title="Click to cycle venture">${escapeHtml(item.venture || 'Unassigned')}</span>
            <span class="meta-dot">·</span>
            <span class="meta-field-clickable" id="detail-assignee-btn" title="Click to cycle assignee">${escapeHtml(item.assignee || 'You')}</span>
          </div>
        </div>

        <!-- OPERATIONAL PROPERTIES -->
        <div class="detail-properties-table">
          <div class="prop-row">
            <span class="prop-label">Status</span>
            <div class="prop-value">
              <button type="button" class="state-pill ${item.status !== 'completed' ? 'is-active' : ''}" id="status-open-btn">Open</button>
              <button type="button" class="state-pill ${item.status === 'completed' ? 'is-active' : ''}" id="status-done-btn">Completed</button>
            </div>
          </div>
          <div class="prop-row">
            <span class="prop-label">Due Date</span>
            <div class="prop-value">
              <input type="date" class="due-date-input" id="detail-due-input" value="${item.dueDate || ''}" />
              <span class="due-subtle" style="font-size: 12px;">(${escapeHtml(item.dueLabel || 'No due date set')})</span>
            </div>
          </div>
          <div class="prop-row">
            <span class="prop-label">Priority</span>
            <div class="prop-value">
              <button type="button" class="btn-star-toggle ${item.important ? 'is-starred' : ''}" id="detail-star-btn">
                <span>⭐</span>
                <span>${item.important ? 'Important' : 'Normal priority'}</span>
              </button>
            </div>
          </div>
        </div>

        <!-- DESCRIPTION -->
        <div class="detail-section">
          <div class="section-label-editorial">Description &amp; Context</div>
          <textarea class="detail-notes-textarea" id="detail-desc" placeholder="Add operational context, notes, or execution details...">${escapeHtml(item.description || '')}</textarea>
        </div>

        <!-- CHILD ITEMS -->
        <div class="detail-section">
          <div class="section-label-editorial">Child Items (${(item.subtasks || []).filter(s => s.done).length}/${(item.subtasks || []).length})</div>
          <div class="subtasks-list" id="subtasks-container">
            ${subtasksHtml}
            <div class="add-subtask-row">
              <input type="text" class="add-subtask-input" id="new-subtask-input" placeholder="+ Add child item (Press Enter)" />
            </div>
          </div>
        </div>

        <!-- ACTIVITY STREAM -->
        <div class="detail-section">
          <div class="section-label-editorial">Activity Log</div>
          <div class="activity-stream">
            ${activityHtml || '<div style="font-size: 12.5px; color: var(--text-secondary);">No recent activity recorded.</div>'}
          </div>
        </div>

      </div>
    `;
  }

  function bindDetailEvents(containerEl, item) {
    if (!item || !containerEl) return;

    // Title auto-save & auto-resize
    const titleInput = containerEl.querySelector('#detail-title');
    if (titleInput) {
      autoResizeTextarea(titleInput);
      titleInput.addEventListener('input', () => {
        autoResizeTextarea(titleInput);
        item.title = titleInput.value;
        saveItems();
        renderTodayFeed();
      });
    }

    // Type cycling
    const typeBtn = containerEl.querySelector('#detail-type-btn');
    if (typeBtn) {
      const types = ['Opportunity', 'Experiment', 'Task', 'Idea'];
      typeBtn.addEventListener('click', () => {
        const nextIdx = (types.indexOf(item.type) + 1) % types.length;
        item.type = types[nextIdx];
        typeBtn.textContent = item.type;
        saveItems();
        renderTodayFeed();
        showToast(`Type changed to ${item.type}`);
      });
    }

    // Venture cycling
    const ventureBtn = containerEl.querySelector('#detail-venture-btn');
    if (ventureBtn) {
      const ventures = ['Quniverze', 'Dropshipping', 'Unassigned'];
      ventureBtn.addEventListener('click', () => {
        const nextIdx = (ventures.indexOf(item.venture) + 1) % ventures.length;
        item.venture = ventures[nextIdx];
        ventureBtn.textContent = item.venture;
        saveItems();
        renderTodayFeed();
        showToast(`Venture changed to ${item.venture}`);
      });
    }

    // Assignee cycling
    const assigneeBtn = containerEl.querySelector('#detail-assignee-btn');
    if (assigneeBtn) {
      const assignees = ['You', 'Quniverze Assistant', 'Dropshipping Assistant'];
      assigneeBtn.addEventListener('click', () => {
        const nextIdx = (assignees.indexOf(item.assignee) + 1) % assignees.length;
        item.assignee = assignees[nextIdx];
        item.section = item.assignee === 'You' ? 'today' : 'delegated';
        assigneeBtn.textContent = item.assignee;
        saveItems();
        renderTodayFeed();
        showToast(`Assigned to ${item.assignee}`);
      });
    }

    // Status toggles
    const statusOpenBtn = containerEl.querySelector('#status-open-btn');
    const statusDoneBtn = containerEl.querySelector('#status-done-btn');
    if (statusOpenBtn && statusDoneBtn) {
      statusOpenBtn.addEventListener('click', () => {
        if (item.status === 'completed') toggleItemComplete(item.id);
      });
      statusDoneBtn.addEventListener('click', () => {
        if (item.status !== 'completed') toggleItemComplete(item.id);
      });
    }

    // Due date input
    const dueInput = containerEl.querySelector('#detail-due-input');
    if (dueInput) {
      dueInput.addEventListener('change', () => {
        item.dueDate = dueInput.value;
        if (dueInput.value) {
          const dueD = new Date(dueInput.value);
          const nowD = new Date();
          nowD.setHours(0, 0, 0, 0);
          dueD.setHours(0, 0, 0, 0);
          const diffDays = Math.round((dueD - nowD) / 86400000);

          if (diffDays < 0) {
            item.section = 'overdue';
            item.dueLabel = `${Math.abs(diffDays)} days overdue`;
          } else if (diffDays === 0) {
            item.section = 'today';
            item.dueLabel = 'Due today';
          } else {
            item.section = 'upcoming';
            item.dueLabel = `In ${diffDays} days`;
          }
        }
        saveItems();
        renderTodayFeed();
        renderDetailPane();
      });
    }

    // Star toggle
    const starBtn = containerEl.querySelector('#detail-star-btn');
    if (starBtn) {
      starBtn.addEventListener('click', () => toggleItemStar(item.id));
    }

    // Description
    const descTextarea = containerEl.querySelector('#detail-desc');
    if (descTextarea) {
      autoResizeTextarea(descTextarea);
      descTextarea.addEventListener('input', () => {
        autoResizeTextarea(descTextarea);
        item.description = descTextarea.value;
        saveItems();
      });
    }

    // Subtasks
    const subtaskItems = containerEl.querySelectorAll('.subtask-item');
    subtaskItems.forEach(stEl => {
      const stid = stEl.dataset.stid;
      const subtask = (item.subtasks || []).find(s => s.id === stid);
      if (!subtask) return;

      const checkbox = stEl.querySelector('.subtask-checkbox');
      const deleteBtn = stEl.querySelector('.subtask-delete-btn');

      if (checkbox) {
        checkbox.addEventListener('change', () => {
          subtask.done = checkbox.checked;
          stEl.classList.toggle('is-done', subtask.done);
          saveItems();
          renderDetailPane();
        });
      }

      if (deleteBtn) {
        deleteBtn.addEventListener('click', () => {
          item.subtasks = item.subtasks.filter(s => s.id !== stid);
          saveItems();
          renderDetailPane();
          renderMobileDetail();
        });
      }
    });

    // Add subtask input
    const newSubtaskInput = containerEl.querySelector('#new-subtask-input');
    if (newSubtaskInput) {
      newSubtaskInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && newSubtaskInput.value.trim()) {
          e.preventDefault();
          if (!item.subtasks) item.subtasks = [];
          item.subtasks.push({
            id: 'st-' + Date.now(),
            text: newSubtaskInput.value.trim(),
            done: false
          });
          newSubtaskInput.value = '';
          saveItems();
          renderDetailPane();
          renderMobileDetail();
        }
      });
    }
  }

  function renderDetailPane() {
    const item = items.find(i => i.id === selectedItemId);
    detailPaneEl.innerHTML = getDetailHtml(item);
    bindDetailEvents(detailPaneEl, item);
  }

  function renderMobileDetail() {
    const item = items.find(i => i.id === selectedItemId);
    if (!item) return;

    if (mobileDetailHeaderPreview) {
      mobileDetailHeaderPreview.textContent = item.title;
    }

    if (mobileDetailHeaderActions) {
      mobileDetailHeaderActions.innerHTML = `
        <button type="button" class="btn-star-toggle ${item.important ? 'is-starred' : ''}" id="mob-star-btn" style="padding: 2px 6px;">
          ${item.important ? '⭐' : '☆'}
        </button>
        <button type="button" class="btn-editorial" id="mob-toggle-done-btn" style="padding: 2px 8px; font-size: 11.5px;">
          ${item.status === 'completed' ? 'Re-open' : 'Complete'}
        </button>
      `;

      const mobStarBtn = mobileDetailHeaderActions.querySelector('#mob-star-btn');
      if (mobStarBtn) {
        mobStarBtn.addEventListener('click', () => toggleItemStar(item.id));
      }

      const mobToggleDoneBtn = mobileDetailHeaderActions.querySelector('#mob-toggle-done-btn');
      if (mobToggleDoneBtn) {
        mobToggleDoneBtn.addEventListener('click', () => toggleItemComplete(item.id));
      }
    }

    mobileDetailBodyEl.innerHTML = getDetailHtml(item);
    bindDetailEvents(mobileDetailBodyEl, item);
  }

  function autoResizeTextarea(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
  }

  // ==========================================================================
  // QUICK CAPTURE ENGINE (Cmd/Ctrl + K or Floating +)
  // "What needs to happen?"
  // Defaults: type = idea, venture = unassigned, status = open, important = false
  // ==========================================================================

  function setupQuickCapture() {
    function openCaptureModal() {
      quickCaptureDialog.showModal();
      quickCaptureInput.value = '';
      setTimeout(() => quickCaptureInput.focus(), 50);
    }

    function closeCaptureModal() {
      quickCaptureDialog.close();
    }

    if (sidebarQuickCaptureBtn) {
      sidebarQuickCaptureBtn.addEventListener('click', openCaptureModal);
    }
    if (feedCaptureTrigger) {
      feedCaptureTrigger.addEventListener('click', openCaptureModal);
    }
    if (mobileFab) {
      mobileFab.addEventListener('click', openCaptureModal);
    }
    if (quickCaptureCloseBtn) {
      quickCaptureCloseBtn.addEventListener('click', closeCaptureModal);
    }

    // Input Enter handler
    quickCaptureInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const text = quickCaptureInput.value.trim();
        if (!text) return;

        // Create item with strict defaults
        const newItem = {
          id: 'item-' + Date.now(),
          title: text,
          type: 'Idea',
          venture: 'Unassigned',
          assignee: 'You',
          section: 'today',
          dueLabel: 'Due today',
          dueDate: new Date().toISOString().split('T')[0],
          important: false,
          status: 'open',
          description: '',
          subtasks: [],
          activity: [
            { desc: 'Captured via Quick Capture', time: 'Just now' }
          ]
        };

        items.unshift(newItem);
        selectedItemId = newItem.id;
        saveItems();
        closeCaptureModal();

        // Switch to today view if not currently there
        if (currentView !== 'today') {
          document.getElementById('nav-today').click();
        }

        renderTodayFeed();
        renderDetailPane();
        showToast(`Captured: ${newItem.title}`);
      } else if (e.key === 'Escape') {
        closeCaptureModal();
      }
    });
  }

  // ==========================================================================
  // SHORTCUTS ENGINE
  // ==========================================================================

  function setupShortcuts() {
    if (shortcutsTriggerBtn) {
      shortcutsTriggerBtn.addEventListener('click', () => shortcutsDialog.showModal());
    }
    if (shortcutsCloseBtn) {
      shortcutsCloseBtn.addEventListener('click', () => shortcutsDialog.close());
    }
  }

  function setupKeyboardListeners() {
    window.addEventListener('keydown', (e) => {
      // Cmd/Ctrl + K: Quick Capture
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        quickCaptureDialog.showModal();
        quickCaptureInput.value = '';
        setTimeout(() => quickCaptureInput.focus(), 50);
        return;
      }

      // Ignore when focused inside text inputs, textareas, or dialogs
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) {
        return;
      }
      if (quickCaptureDialog.open || shortcutsDialog.open || contactDialog.open) {
        return;
      }

      // '?': Help modal
      if (e.key === '?') {
        shortcutsDialog.showModal();
        return;
      }

      // View switching: 1 = Today, 2 = Ventures, 3 = Contacts
      if (e.key === '1') {
        document.getElementById('nav-today').click();
      } else if (e.key === '2') {
        document.getElementById('nav-ventures').click();
      } else if (e.key === '3') {
        document.getElementById('nav-contacts').click();
      }

      // Feed navigation only active in Today view
      if (currentView === 'today') {
        const feedRows = Array.from(feedListEl.querySelectorAll('.feed-item'));
        if (feedRows.length === 0) return;

        const currentIndex = feedRows.findIndex(r => r.dataset.id === selectedItemId);

        // 'j' or ArrowDown: Next item
        if (e.key === 'j' || e.key === 'ArrowDown') {
          e.preventDefault();
          const nextIndex = Math.min(currentIndex + 1, feedRows.length - 1);
          selectItem(feedRows[nextIndex].dataset.id);
          feedRows[nextIndex].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }

        // 'k' or ArrowUp: Previous item
        if (e.key === 'k' || e.key === 'ArrowUp') {
          e.preventDefault();
          const prevIndex = Math.max(currentIndex - 1, 0);
          selectItem(feedRows[prevIndex].dataset.id);
          feedRows[prevIndex].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }

        // 'x': Toggle complete
        if (e.key === 'x' && selectedItemId) {
          e.preventDefault();
          toggleItemComplete(selectedItemId);
        }

        // 's': Toggle star
        if (e.key === 's' && selectedItemId) {
          e.preventDefault();
          toggleItemStar(selectedItemId);
        }

        // Enter: Open mobile detail
        if (e.key === 'Enter' && selectedItemId && window.innerWidth < 860) {
          openMobileDetail();
        }
      }

      // Escape: close mobile detail view if open
      if (e.key === 'Escape') {
        if (mobileFullscreenDetailEl && !mobileFullscreenDetailEl.hidden) {
          closeMobileDetail();
        }
      }
    });

    // Light-dismiss on dialog backdrops
    [quickCaptureDialog, shortcutsDialog, contactDialog].forEach(dialog => {
      if (!dialog) return;
      dialog.addEventListener('click', (e) => {
        const rect = dialog.getBoundingClientRect();
        const isInDialog = (
          rect.top <= e.clientY &&
          e.clientY <= rect.top + rect.height &&
          rect.left <= e.clientX &&
          e.clientX <= rect.left + rect.width
        );
        if (!isInDialog) {
          dialog.close();
        }
      });
    });
  }

  // ==========================================================================
  // VENTURES VIEW ENGINE (Calm Editorial Overview of Ventures)
  // ==========================================================================

  function renderVenturesView() {
    const container = document.getElementById('ventures-container');
    if (!container) return;

    const venturesData = [
      {
        name: 'Quniverze',
        tagline: 'Enterprise B2B Hospitality & Operations Platform',
        items: items.filter(i => i.venture === 'Quniverze')
      },
      {
        name: 'Dropshipping',
        tagline: 'Direct-to-Consumer Commerce & High-Velocity Product Testing',
        items: items.filter(i => i.venture === 'Dropshipping')
      },
      {
        name: 'Unassigned / Incubation',
        tagline: 'Early stage capture, experiments, and exploratory leads',
        items: items.filter(i => i.venture === 'Unassigned' || !i.venture)
      }
    ];

    container.innerHTML = venturesData.map(v => {
      const openCount = v.items.filter(i => i.status !== 'completed').length;
      const completedCount = v.items.filter(i => i.status === 'completed').length;
      const importantCount = v.items.filter(i => i.important && i.status !== 'completed').length;

      const itemsListHtml = v.items.map(item => `
        <div class="venture-item-row" data-id="${item.id}">
          <div style="display: flex; align-items: baseline; gap: 8px;">
            <span style="font-weight: 500; color: var(--text-primary);">${escapeHtml(item.title)}</span>
            ${item.important ? '<span style="font-size: 11px; color: #D97706;">⭐</span>' : ''}
          </div>
          <div style="font-size: 12px; color: var(--text-secondary);">
            <span>${escapeHtml(item.type)}</span>
            <span style="padding: 0 4px;">·</span>
            <span>${escapeHtml(item.assignee)}</span>
          </div>
        </div>
      `).join('');

      return `
        <div class="venture-card">
          <div class="venture-card-header">
            <div>
              <div class="venture-name">${escapeHtml(v.name)}</div>
              <div class="venture-tagline">${escapeHtml(v.tagline)}</div>
            </div>
            <div class="venture-stats">
              <div class="venture-stat-item"><strong>${openCount}</strong> active</div>
              <div class="venture-stat-item"><strong>${importantCount}</strong> important</div>
              <div class="venture-stat-item"><strong>${completedCount}</strong> closed</div>
            </div>
          </div>
          <div class="venture-items-list">
            ${itemsListHtml || '<div style="font-size: 12.5px; color: var(--text-secondary); padding: 8px 0;">No active items assigned to this venture.</div>'}
          </div>
        </div>
      `;
    }).join('');

    // Clicking an item in ventures switches to Today and selects it
    container.querySelectorAll('.venture-item-row').forEach(row => {
      row.addEventListener('click', () => {
        const id = row.dataset.id;
        document.getElementById('nav-today').click();
        selectItem(id);
      });
    });
  }

  // ==========================================================================
  // CONTACTS VIEW ENGINE (Founder Relationship Network & Quiet Age Tracking)
  // ==========================================================================

  function renderContactsView() {
    const listEl = document.getElementById('contacts-list');
    const detailEl = document.getElementById('contacts-detail-pane');
    if (!listEl || !detailEl) return;

    listEl.innerHTML = contacts.map(c => `
      <div class="contact-row ${c.id === selectedContactId ? 'is-selected' : ''}" data-id="${c.id}">
        <div class="contact-row-name">${escapeHtml(c.name)}</div>
        <div class="contact-row-sub">${escapeHtml(c.person)}</div>
        <div class="contact-row-meta">
          <span style="color: var(--text-secondary);">${escapeHtml(c.venture)}</span>
          <span style="padding: 0 2px; color: #BDBDBD;">·</span>
          <span class="quiet-tag">${c.quietDays} days quiet</span>
        </div>
      </div>
    `).join('');

    listEl.querySelectorAll('.contact-row').forEach(row => {
      row.addEventListener('click', () => {
        selectedContactId = row.dataset.id;
        renderContactsView();
      });
    });

    const activeContact = contacts.find(c => c.id === selectedContactId) || contacts[0];
    if (!activeContact) {
      detailEl.innerHTML = `<div style="color: var(--text-secondary);">No contacts recorded.</div>`;
      return;
    }

    detailEl.innerHTML = `
      <div style="border-bottom: 1px solid var(--border); padding-bottom: 14px;">
        <h2 style="font-size: 22px; font-weight: 600; color: var(--text-primary); line-height: 1.2;">${escapeHtml(activeContact.name)}</h2>
        <div style="font-size: 13.5px; color: var(--text-secondary); margin-top: 4px;">${escapeHtml(activeContact.person)}</div>
      </div>

      <div class="detail-properties-table">
        <div class="prop-row">
          <span class="prop-label">Venture</span>
          <span class="prop-value" style="font-weight: 500;">${escapeHtml(activeContact.venture)}</span>
        </div>
        <div class="prop-row">
          <span class="prop-label">Communications</span>
          <span class="prop-value quiet-tag">${activeContact.quietDays} days quiet (Last touch: ${escapeHtml(activeContact.lastInteraction)})</span>
        </div>
        <div class="prop-row">
          <span class="prop-label">Linked Action</span>
          <div class="prop-value">
            ${activeContact.linkedItemId ? `
              <button type="button" class="btn-editorial" id="jump-linked-action-btn" style="padding: 3px 8px;">
                ${escapeHtml(activeContact.linkedItemTitle || 'View open item')} →
              </button>
            ` : '<span style="color: var(--text-secondary);">None</span>'}
          </div>
        </div>
      </div>

      <div class="detail-section">
        <div class="section-label-editorial">Relationship Notes &amp; Context</div>
        <textarea class="detail-notes-textarea" id="contact-notes-edit" rows="4">${escapeHtml(activeContact.notes || '')}</textarea>
      </div>

      <div style="display: flex; gap: 8px;">
        <button type="button" class="btn-editorial" id="log-interaction-btn">Log Interaction (Reset Quiet Timer)</button>
        <button type="button" class="btn-editorial" id="delete-contact-btn" style="color: var(--danger);">Delete</button>
      </div>
    `;

    // Notes auto-save
    const notesEdit = detailEl.querySelector('#contact-notes-edit');
    if (notesEdit) {
      notesEdit.addEventListener('input', () => {
        activeContact.notes = notesEdit.value;
        saveContacts();
      });
    }

    // Log interaction button
    const logInteractionBtn = detailEl.querySelector('#log-interaction-btn');
    if (logInteractionBtn) {
      logInteractionBtn.addEventListener('click', () => {
        activeContact.quietDays = 0;
        activeContact.lastInteraction = 'Today';
        saveContacts();
        renderContactsView();
        showToast(`Interaction logged for ${activeContact.name}`);
      });
    }

    // Jump to linked action
    const jumpLinkedBtn = detailEl.querySelector('#jump-linked-action-btn');
    if (jumpLinkedBtn && activeContact.linkedItemId) {
      jumpLinkedBtn.addEventListener('click', () => {
        document.getElementById('nav-today').click();
        selectItem(activeContact.linkedItemId);
      });
    }

    // Delete contact
    const deleteContactBtn = detailEl.querySelector('#delete-contact-btn');
    if (deleteContactBtn) {
      deleteContactBtn.addEventListener('click', () => {
        contacts = contacts.filter(c => c.id !== activeContact.id);
        selectedContactId = contacts.length > 0 ? contacts[0].id : null;
        saveContacts();
        renderContactsView();
        showToast('Contact deleted');
      });
    }
  }

  function setupContactsDialog() {
    if (addContactBtn) {
      addContactBtn.addEventListener('click', () => {
        contactDialog.showModal();
      });
    }
    if (contactDialogClose) {
      contactDialogClose.addEventListener('click', () => contactDialog.close());
    }
    if (contactCancelBtn) {
      contactCancelBtn.addEventListener('click', () => contactDialog.close());
    }

    if (contactForm) {
      contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const nameInput = document.getElementById('contact-name-input');
        const personInput = document.getElementById('contact-person-input');
        const ventureSelect = document.getElementById('contact-venture-select');
        const notesInput = document.getElementById('contact-notes-input');

        const newContact = {
          id: 'contact-' + Date.now(),
          name: nameInput.value.trim(),
          person: personInput.value.trim() || 'General Lead',
          venture: ventureSelect.value,
          quietDays: 0,
          lastInteraction: 'Today',
          notes: notesInput.value.trim(),
          linkedItemId: null,
          linkedItemTitle: null
        };

        contacts.unshift(newContact);
        selectedContactId = newContact.id;
        saveContacts();
        contactDialog.close();
        contactForm.reset();
        renderContactsView();
        showToast(`Added contact: ${newContact.name}`);
      });
    }
  }

  // Utilities
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Run on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
