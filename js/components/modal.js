// ============================================
// MODAL COMPONENT
// Handles modal dialog display and interactions
// ============================================

/**
 * Modal - Component for displaying modal dialogs
 * Provides methods to show, hide, and configure modals
 */
const Modal = (function() {
  // Private variables
  let modalOverlay = null;
  let modalBody = null;
  let modalClose = null;
  let isOpen = false;

  /**
   * Initialize the modal component
   * Sets up event listeners
   */
  function init() {
    console.log('Modal component initializing...');

    // Get modal elements
    modalOverlay = document.getElementById('modal-overlay');
    modalBody = document.getElementById('modal-body');
    modalClose = document.querySelector('.modal-close');

    if (!modalOverlay || !modalBody || !modalClose) {
      console.error('Modal elements not found in DOM');
      return;
    }

    // Set up event listeners
    setupEventListeners();

    console.log('Modal component initialized successfully');
  }

  /**
   * Set up event listeners for modal interactions
   */
  function setupEventListeners() {
    // Close button click
    modalClose.addEventListener('click', close);

    // Click outside modal content to close
    modalOverlay.addEventListener('click', function(e) {
      if (e.target === modalOverlay) {
        close();
      }
    });

    // ESC key to close
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && isOpen) {
        close();
      }
    });
  }

  /**
   * Show the modal with custom content
   * @param {string} content - HTML content to display in modal
   */
  function show(content) {
    if (!modalOverlay || !modalBody) {
      console.error('Modal not initialized');
      return;
    }

    // Set the content
    modalBody.innerHTML = content;

    // Show the modal
    modalOverlay.classList.add('active');
    isOpen = true;

    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
  }

  /**
   * Show a confirmation dialog
   * @param {Object} options - Configuration object
   * @param {string} options.title - Dialog title
   * @param {string} options.message - Dialog message
   * @param {Function} options.onConfirm - Callback when confirmed
   * @param {Function} options.onCancel - Callback when cancelled
   */
  function confirm(options) {
    const {
      title = 'Confirm',
      message = 'Are you sure?',
      confirmText = 'Confirm',
      cancelText = 'Cancel',
      onConfirm = () => {},
      onCancel = () => {}
    } = options;

    const content = `
      <div class="modal-header">
        <h2>${title}</h2>
      </div>
      <div class="modal-body">
        <p>${message}</p>
      </div>
      <div class="modal-actions">
        <button class="btn btn-secondary" id="modal-cancel-btn">${cancelText}</button>
        <button class="btn btn-primary" id="modal-confirm-btn">${confirmText}</button>
      </div>
    `;

    show(content);

    // Set up button listeners
    const confirmBtn = document.getElementById('modal-confirm-btn');
    const cancelBtn = document.getElementById('modal-cancel-btn');

    if (confirmBtn) {
      confirmBtn.addEventListener('click', function() {
        onConfirm();
        close();
      });
    }

    if (cancelBtn) {
      cancelBtn.addEventListener('click', function() {
        onCancel();
        close();
      });
    }
  }

  /**
   * Show an alert dialog
   * @param {Object} options - Configuration object
   * @param {string} options.title - Alert title
   * @param {string} options.message - Alert message
   * @param {string} options.type - Alert type (info, success, warning, danger)
   */
  function alert(options) {
    const {
      title = 'Notice',
      message = '',
      type = 'info',
      okText = 'OK',
      onClose = () => {}
    } = options;

    // Icon based on type
    const icons = {
      info: 'ℹ️',
      success: '✅',
      warning: '⚠️',
      danger: '❌'
    };

    const icon = icons[type] || icons.info;

    const content = `
      <div class="modal-header">
        <h2>${icon} ${title}</h2>
      </div>
      <div class="modal-body">
        <p>${message}</p>
      </div>
      <div class="modal-actions">
        <button class="btn btn-primary" id="modal-ok-btn">${okText}</button>
      </div>
    `;

    show(content);

    // Set up OK button listener
    const okBtn = document.getElementById('modal-ok-btn');
    if (okBtn) {
      okBtn.addEventListener('click', function() {
        onClose();
        close();
      });
    }
  }

  /**
   * Show a custom form in modal
   * @param {Object} options - Configuration object
   */
  function showForm(options) {
    const {
      title = 'Input',
      fields = [],
      onSubmit = () => {},
      onCancel = () => {}
    } = options;

    // Build form fields HTML
    let fieldsHTML = '';
    fields.forEach(field => {
      fieldsHTML += `
        <div class="form-group">
          <label class="form-label">${field.label}</label>
          ${field.type === 'textarea'
            ? `<textarea class="form-textarea" id="${field.id}" placeholder="${field.placeholder || ''}" rows="${field.rows || 4}"></textarea>`
            : `<input type="${field.type || 'text'}" class="form-input" id="${field.id}" placeholder="${field.placeholder || ''}">`
          }
          ${field.help ? `<span class="form-help">${field.help}</span>` : ''}
        </div>
      `;
    });

    const content = `
      <div class="modal-header">
        <h2>${title}</h2>
      </div>
      <form id="modal-form">
        ${fieldsHTML}
        <div class="modal-actions">
          <button type="button" class="btn btn-secondary" id="modal-form-cancel">Cancel</button>
          <button type="submit" class="btn btn-primary">Submit</button>
        </div>
      </form>
    `;

    show(content);

    // Set up form submission
    const form = document.getElementById('modal-form');
    const cancelBtn = document.getElementById('modal-form-cancel');

    if (form) {
      form.addEventListener('submit', function(e) {
        e.preventDefault();

        // Collect form data
        const formData = {};
        fields.forEach(field => {
          const input = document.getElementById(field.id);
          if (input) {
            formData[field.id] = input.value;
          }
        });

        onSubmit(formData);
        close();
      });
    }

    if (cancelBtn) {
      cancelBtn.addEventListener('click', function() {
        onCancel();
        close();
      });
    }
  }

  /**
   * Close the modal
   */
  function close() {
    if (!modalOverlay) {
      return;
    }

    // Hide the modal
    modalOverlay.classList.remove('active');
    isOpen = false;

    // Restore body scroll
    document.body.style.overflow = '';

    // Clear content after animation
    setTimeout(() => {
      if (modalBody) {
        modalBody.innerHTML = '';
      }
    }, 300);
  }

  /**
   * Check if modal is currently open
   * @returns {boolean} True if modal is open
   */
  function isModalOpen() {
    return isOpen;
  }

  // Public API
  return {
    init: init,
    show: show,
    close: close,
    confirm: confirm,
    alert: alert,
    showForm: showForm,
    isOpen: isModalOpen
  };
})();

// Log that Modal component is loaded
console.log('Modal component loaded successfully');
