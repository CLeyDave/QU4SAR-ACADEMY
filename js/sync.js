// ========== SYNC QUEUE ==========
// Replaces _pendingLocalSave + raw syncToDB()
// Queue-based sync with retry, status indicator, and DATA._sync state

window.SyncQueue = (function() {
  var queue = [];
  var processing = false;
  var retryMax = 3;
  var retryDelay = 2000;
  var status = 'idle'; // idle | syncing | saved | error

  function updateIndicator() {
    var el = document.getElementById('syncIndicator');
    if (!el) return;
    el.className = 'sync-indicator ' + status;
    var icons = { idle: 'cloud-off', syncing: 'loader', saved: 'cloud', error: 'alert-triangle' };
    el.innerHTML = '<i data-lucide="' + (icons[status] || 'cloud') + '" style="width:14px;height:14px;vertical-align:middle"></i>';
    if (typeof lucide !== 'undefined') renderIcons();
    if (window.DATA && window.DATA._sync) {
      window.DATA._sync.status = status;
      window.DATA._sync.lastAttempt = Date.now();
      if (status === 'saved') window.DATA._sync.lastSuccess = Date.now();
      window.DATA._sync.pendingCount = queue.length;
    }
  }

  function showToast(msg, type) {
    if (window.showToast) window.showToast(msg, type);
  }

  function enqueue(operation, label) {
    queue.push({ operation: operation, label: label || 'sync', timestamp: Date.now(), retries: 0 });
    if (!processing) process();
  }

  async function process() {
    if (processing) return;
    processing = true;
    status = 'syncing';
    updateIndicator();

    while (queue.length > 0) {
      var item = queue[0];
      var success = false;
      for (var attempt = 0; attempt < retryMax; attempt++) {
        try {
          await item.operation();
          success = true;
          break;
        } catch (err) {
          console.error('[SyncQueue] ' + item.label + ' attempt ' + (attempt + 1) + '/' + retryMax + ' failed:', err);
          if (attempt < retryMax - 1) {
            await sleep(retryDelay);
          }
        }
      }
      queue.shift();
      if (!success) {
        status = 'error';
        updateIndicator();
        console.error('[SyncQueue] ' + item.label + ' failed after ' + retryMax + ' attempts');
        showToast('Error al sincronizar: ' + item.label, 'error');
      }
    }

    status = 'saved';
    updateIndicator();
    processing = false;
    setTimeout(function() {
      if (!queue.length && status === 'saved') {
        status = 'idle';
        updateIndicator();
      }
    }, 3000);
  }

  function sleep(ms) {
    return new Promise(function(resolve) { setTimeout(resolve, ms); });
  }

  return {
    enqueue: enqueue,
    getStatus: function() { return status; },
    getQueueLength: function() { return queue.length; },
    reset: function() {
      queue = [];
      status = 'idle';
      updateIndicator();
    }
  };
})();
