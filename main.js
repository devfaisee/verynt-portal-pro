// main.js
import './command-palette.css';

// 1. Tool Data Definitions
const tools = [
  { title: 'Smart Vectorizer Pro', desc: 'Convert PNG/JPG graphics into clean, scalable SVG vector layers.', url: 'https://vector.verynt.com', icon: 'fa-compass-drafting', type: 'tool' },
  { title: 'Photo Upscaler Pro', desc: 'Upscale low-resolution pictures up to 4K using bilateral filtering.', url: 'https://enhance.verynt.com', icon: 'fa-maximize', type: 'tool' },
  { title: 'Vocal Separator Pro', desc: 'Isolate voice channels and music tracks from local audio files.', url: 'https://vocal.verynt.com', icon: 'fa-guitar', type: 'tool' },
  { title: 'AI Voiceover Pro', desc: 'Convert scripts, PDFs, and articles into natural human voiceovers.', url: 'https://voice.verynt.com', icon: 'fa-volume-high', type: 'tool' },
  { title: 'Smart SVG Logo Pro', desc: 'Create scalability-ready vector logos and adjust styles dynamically.', url: 'https://svg.verynt.com', icon: 'fa-palette', type: 'tool' },
  { title: 'Smart PDF Toolkit Pro', desc: 'Merge, split, compress, stamp, and sign PDFs offline in memory.', url: 'https://pdf.verynt.com', icon: 'fa-file-pdf', type: 'tool' },
  { title: 'Image Converter Pro', desc: 'Convert image formats (HEIC, WebP, PNG, SVG) inside your browser.', url: 'https://convert.verynt.com', icon: 'fa-arrow-right-arrow-left', type: 'tool' },
  { title: 'Media Compressor Pro', desc: 'Shrink large videos (MP4/MKV) or audio (MP3) using client FFmpeg.', url: 'https://compress.verynt.com', icon: 'fa-file-video', type: 'tool' },
  { title: 'Private Scribe Pro', desc: 'Dictate or transcribe audio files offline using local AI models.', url: 'https://scribe.verynt.com', icon: 'fa-microphone-lines', type: 'tool' },
  { title: 'Domain SPF Checker Pro', desc: 'Verify SPF records, compile IP authorization lists, check DNS lookups.', url: 'https://spf.verynt.com', icon: 'fa-shield-halved', type: 'tool' },
  { title: 'Portfolio Rebalancer Pro', desc: 'Distribute assets across target allocations and recommend buy/sell trades.', url: 'https://allocation.verynt.com', icon: 'fa-chart-pie', type: 'tool' }
];

const systemCommands = [
  { title: 'System Diagnostics Dashboard', desc: 'Check WebGPU compatibility, WASM status, and browser capabilities.', action: 'diagnostics', icon: 'fa-microchip', type: 'sys' },
  { title: 'Wipe Sandbox Cache & Settings', desc: 'Delete all locally cached AI models and reset application states.', action: 'clearCache', icon: 'fa-trash-can', type: 'sys' }
];

let items = [...tools, ...systemCommands];
let selectedIndex = 0;
let filteredItems = [...items];

// 2. DOM Injection & Rendering
function initCommandPalette() {
  // Check if markup already exists
  if (document.getElementById('palette-overlay')) return;

  const overlayHtml = `
    <div id="palette-overlay" class="palette-overlay">
      <div class="palette-card">
        <div class="palette-search-container">
          <i class="fa-solid fa-magnifying-glass palette-search-icon"></i>
          <input type="text" id="palette-search" class="palette-input" placeholder="Search tools or type commands (e.g., diagnostics)..." autocomplete="off" />
        </div>
        <div id="palette-results" class="palette-results"></div>
        <div class="palette-footer">
          <span><kbd>↑↓</kbd> Navigate</span>
          <span><kbd>Enter</kbd> Select</span>
          <span><kbd>Esc</kbd> Close</span>
        </div>
      </div>
    </div>
    <button id="palette-trigger-btn" class="palette-trigger-btn" title="Open Command Palette (Ctrl+K)">
      <i class="fa-solid fa-terminal"></i>
    </button>
  `;

  document.body.insertAdjacentHTML('beforeend', overlayHtml);
  
  // Set up events
  const overlay = document.getElementById('palette-overlay');
  const searchInput = document.getElementById('palette-search');
  const triggerBtn = document.getElementById('palette-trigger-btn');

  // Trigger button (mobile accessibility)
  triggerBtn.addEventListener('click', () => togglePalette(true));

  // Close overlay on backdrop click
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) togglePalette(false);
  });

  // Search input change handler
  searchInput.addEventListener('input', (e) => {
    filterResults(e.target.value);
  });

  // Keyboard navigation inside palette input
  searchInput.addEventListener('keydown', handleKeyNavigation);

  // Global keydown listeners for Ctrl+K / Cmd+K and Esc
  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      togglePalette();
    }
    if (e.key === 'Escape' && overlay.classList.contains('active')) {
      togglePalette(false);
    }
  });

  renderResults();
}

// 3. Command Palette Operations
function togglePalette(forceState) {
  const overlay = document.getElementById('palette-overlay');
  const searchInput = document.getElementById('palette-search');
  
  const isCurrentlyActive = overlay.classList.contains('active');
  const nextState = forceState !== undefined ? forceState : !isCurrentlyActive;
  
  if (nextState) {
    overlay.classList.add('active');
    searchInput.value = '';
    filteredItems = [...items];
    selectedIndex = 0;
    renderResults();
    setTimeout(() => searchInput.focus(), 100);
  } else {
    overlay.classList.remove('active');
    searchInput.blur();
  }
}

function filterResults(query) {
  const cleanQuery = query.toLowerCase().trim();
  if (cleanQuery === '') {
    filteredItems = [...items];
  } else {
    filteredItems = items.filter(item => 
      item.title.toLowerCase().includes(cleanQuery) || 
      item.desc.toLowerCase().includes(cleanQuery)
    );
  }
  selectedIndex = 0;
  renderResults();
}

function renderResults() {
  const resultsContainer = document.getElementById('palette-results');
  resultsContainer.innerHTML = '';
  
  if (filteredItems.length === 0) {
    resultsContainer.innerHTML = `
      <div style="padding: 2rem; text-align: center; color: var(--text-muted); font-size: 0.9rem;">
        <i class="fa-solid fa-triangle-exclamation" style="font-size: 1.5rem; margin-bottom: 0.5rem; display: block; color: var(--secondary);"></i>
        No tools or commands match your query.
      </div>
    `;
    return;
  }
  
  filteredItems.forEach((item, index) => {
    const isSelected = index === selectedIndex;
    const badgeText = item.type === 'tool' ? 'Tool' : 'System';
    const badgeClass = item.type === 'tool' ? 'tool' : 'sys';
    const shortcutSymbol = item.type === 'tool' ? '⏎ Launch' : '⚡ Action';

    const itemHtml = `
      <div class="palette-item ${isSelected ? 'selected' : ''}" data-index="${index}">
        <div class="palette-item-icon">
          <i class="fa-solid ${item.icon}"></i>
        </div>
        <div class="palette-item-info">
          <span class="palette-item-title">${item.title}</span>
          <span class="palette-item-desc">${item.desc}</span>
        </div>
        <div class="palette-item-meta">
          <span class="palette-badge ${badgeClass}">${badgeText}</span>
          <span class="palette-shortcut">${shortcutSymbol}</span>
        </div>
      </div>
    `;
    resultsContainer.insertAdjacentHTML('beforeend', itemHtml);
  });
  
  // Auto-scroll selected element into viewport
  const selectedEl = resultsContainer.querySelector('.palette-item.selected');
  if (selectedEl) {
    selectedEl.scrollIntoView({ block: 'nearest' });
  }

  // Click handling for each item
  resultsContainer.querySelectorAll('.palette-item').forEach(el => {
    el.addEventListener('click', () => {
      selectedIndex = parseInt(el.getAttribute('data-index'));
      executeSelection();
    });
  });
}

function handleKeyNavigation(e) {
  if (filteredItems.length === 0) return;
  
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    selectedIndex = (selectedIndex + 1) % filteredItems.length;
    renderResults();
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    selectedIndex = (selectedIndex - 1 + filteredItems.length) % filteredItems.length;
    renderResults();
  } else if (e.key === 'Enter') {
    e.preventDefault();
    executeSelection();
  }
}

function executeSelection() {
  const selected = filteredItems[selectedIndex];
  if (!selected) return;

  togglePalette(false);

  if (selected.type === 'tool') {
    window.open(selected.url, '_blank', 'noopener,noreferrer');
  } else if (selected.type === 'sys') {
    triggerSystemAction(selected.action);
  }
}

// 4. System Action Handlers
function triggerSystemAction(action) {
  if (action === 'diagnostics') {
    openDiagnosticsModal();
  } else if (action === 'clearCache') {
    confirmCacheWipe();
  }
}

// 5. Diagnostics Modal Builder
async function openDiagnosticsModal() {
  const isWebGpuSupported = 'gpu' in navigator ? 'Active (Supported)' : 'Not Supported';
  const webGpuStatusClass = 'gpu' in navigator ? 'ok' : 'err';
  
  const isWasmSupported = typeof WebAssembly === 'object' ? 'Supported' : 'Not Supported';
  const wasmStatusClass = typeof WebAssembly === 'object' ? 'ok' : 'err';
  
  // Storage usage
  let storageInfo = 'Unavailable';
  let storageStatusClass = 'warn';
  if (navigator.storage && navigator.storage.estimate) {
    try {
      const estimate = await navigator.storage.estimate();
      const usedMb = (estimate.usage / (1024 * 1024)).toFixed(1);
      const totalMb = (estimate.quota / (1024 * 1024)).toFixed(0);
      storageInfo = `${usedMb} MB / ${totalMb} MB Used`;
      storageStatusClass = 'ok';
    } catch (err) {
      storageInfo = 'Permission Denied';
      storageStatusClass = 'warn';
    }
  }

  // OS & Platform detection
  const platform = navigator.userAgentData?.platform || navigator.platform || 'Unknown OS';
  const browserBrand = navigator.userAgentData?.brands?.[0]?.brand || 'Standard Browser';
  
  const diagnosticContent = `
    <div class="diagnostic-grid">
      <div class="diagnostic-item">
        <div class="diagnostic-icon-box" style="background: rgba(16, 185, 129, 0.15); color: #10b981;">
          <i class="fa-solid fa-microchip"></i>
        </div>
        <div class="diagnostic-details">
          <span class="diagnostic-label">WebGPU Accelerator</span>
          <span class="diagnostic-value">${isWebGpuSupported}</span>
        </div>
        <div class="diagnostic-status ${webGpuStatusClass}"></div>
      </div>

      <div class="diagnostic-item">
        <div class="diagnostic-icon-box" style="background: rgba(6, 182, 212, 0.15); color: #06b6d4;">
          <i class="fa-solid fa-cube"></i>
        </div>
        <div class="diagnostic-details">
          <span class="diagnostic-label">WebAssembly Compiles</span>
          <span class="diagnostic-value">${isWasmSupported}</span>
        </div>
        <div class="diagnostic-status ${wasmStatusClass}"></div>
      </div>

      <div class="diagnostic-item">
        <div class="diagnostic-icon-box" style="background: rgba(139, 92, 246, 0.15); color: #8b5cf6;">
          <i class="fa-solid fa-database"></i>
        </div>
        <div class="diagnostic-details">
          <span class="diagnostic-label">Local Storage Quota</span>
          <span class="diagnostic-value">${storageInfo}</span>
        </div>
        <div class="diagnostic-status ${storageStatusClass}"></div>
      </div>

      <div class="diagnostic-item">
        <div class="diagnostic-icon-box" style="background: rgba(234, 179, 8, 0.15); color: #eab308;">
          <i class="fa-solid fa-circle-info"></i>
        </div>
        <div class="diagnostic-details">
          <span class="diagnostic-label">Platform Sandbox</span>
          <span class="diagnostic-value" style="font-size: 0.8rem;">${platform} (${browserBrand})</span>
        </div>
        <div class="diagnostic-status ok"></div>
      </div>
    </div>
  `;

  // Leverage the built-in openModal utility inside the portal to keep modal transitions premium!
  // Modal title, raw html injection capability, and icon class
  // Since we want raw HTML inside, let's inject it into modal-body-text directly.
  openModal('System Sandbox Diagnostics', '', 'fa-solid fa-sliders');
  const modalBody = document.getElementById('modal-body-text');
  modalBody.innerHTML = diagnosticContent;
}

// 6. Cache Purger & Storage Cleaner
function confirmCacheWipe() {
  openModal('Wipe Sandbox Settings & Models?', 
    'Warning: This action will completely erase all downloaded local AI models, cached transcripts, holdings templates, and offline configurations stored in your browser memory. You will need to download model assets again on subsequent launches. Are you sure you want to proceed?', 
    'fa-solid fa-circle-exclamation');
  
  // Re-purpose the close button to add confirmation logic, or simply add a clean wipe trigger.
  const modalBody = document.getElementById('modal-body-text');
  modalBody.insertAdjacentHTML('beforeend', `
    <div style="margin-top: 1.5rem; display: flex; gap: 1rem; justify-content: center;">
      <button id="wipe-confirm-btn" style="background: #ef4444; color: #ffffff; border: none; padding: 0.55rem 1.5rem; font-weight: 600; border-radius: 8px; cursor: pointer;">Yes, Wipe Everything</button>
    </div>
  `);

  document.getElementById('wipe-confirm-btn').addEventListener('click', async (e) => {
    e.target.innerText = 'Clearing...';
    e.target.disabled = true;
    
    // Clear LocalStorage
    localStorage.clear();
    
    // Clear Cache storage
    if (window.caches) {
      try {
        const cacheNames = await window.caches.keys();
        await Promise.all(cacheNames.map(name => window.caches.delete(name)));
      } catch (err) {
        console.error('Failed to clear cache storage:', err);
      }
    }

    // Clear IndexedDB
    if (window.indexedDB && window.indexedDB.databases) {
      try {
        const dbs = await window.indexedDB.databases();
        dbs.forEach(db => {
          window.indexedDB.deleteDatabase(db.name);
        });
      } catch (err) {
        console.error('Failed to clear IndexedDB:', err);
      }
    }

    e.target.innerText = 'Wiped!';
    setTimeout(() => {
      closeModal();
      openModal('Wipe Successful', 'Your browser memory sandbox has been completely purged and restored to clean standards.', 'fa-solid fa-circle-check');
    }, 500);
  });
}

// Bootstrapper initialization
document.addEventListener('DOMContentLoaded', () => {
  initCommandPalette();
});
