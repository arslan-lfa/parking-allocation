// ============================================
// SmartPark UI Helper Functions
// ============================================

// ---- Toast Notifications ----
function showNotification(message, type = 'info', duration = 3000) {
    const notificationToast = document.getElementById('notification-toast') || createNotificationToast();
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        background: ${getNotificationColor(type)};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        margin-bottom: 1rem;
        display: flex;
        align-items: center;
        gap: 1rem;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        animation: slideIn 0.3s ease;
        max-width: 500px;
    `;
    
    const icon = document.createElement('i');
    icon.className = getNotificationIcon(type);
    icon.style.fontSize = '1.25rem';
    
    const content = document.createElement('div');
    content.textContent = message;
    content.style.flex = '1';
    
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '✕';
    closeBtn.style.cssText = `
        background: none;
        border: none;
        color: white;
        font-size: 1.25rem;
        cursor: pointer;
        opacity: 0.8;
        transition: opacity 0.2s;
    `;
    closeBtn.onmouseover = () => closeBtn.style.opacity = '1';
    closeBtn.onmouseout = () => closeBtn.style.opacity = '0.8';
    closeBtn.onclick = () => notification.remove();
    
    notification.appendChild(icon);
    notification.appendChild(content);
    notification.appendChild(closeBtn);
    notificationToast.appendChild(notification);
    
    if (duration > 0) {
        setTimeout(() => notification.remove(), duration);
    }
}

function createNotificationToast() {
    const toast = document.getElementById('notification-toast');
    if (toast) return toast;
    
    const newToast = document.createElement('div');
    newToast.id = 'notification-toast';
    newToast.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        z-index: 10000;
        max-width: 500px;
    `;
    document.body.appendChild(newToast);
    return newToast;
}

function getNotificationColor(type) {
    const colors = {
        success: '#10b981',
        error: '#ef4444',
        warning: '#f59e0b',
        info: '#3b82f6',
    };
    return colors[type] || colors.info;
}

function getNotificationIcon(type) {
    const icons = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-circle',
        warning: 'fas fa-exclamation-triangle',
        info: 'fas fa-info-circle',
    };
    return icons[type] || icons.info;
}

// ---- Loading Spinner ----
function showLoadingSpinner(show = true) {
    let spinner = document.getElementById('loading-spinner');
    
    if (show && !spinner) {
        spinner = document.createElement('div');
        spinner.id = 'loading-spinner';
        spinner.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
        `;
        
        const spinnerContent = document.createElement('div');
        spinnerContent.innerHTML = `
            <div style="text-align: center; color: white;">
                <div style="
                    width: 60px;
                    height: 60px;
                    border: 4px solid rgba(255, 255, 255, 0.3);
                    border-radius: 50%;
                    border-top-color: white;
                    animation: spin 1s linear infinite;
                    margin: 0 auto 1rem;
                "></div>
                <p style="margin: 0; font-size: 1.125rem;">Processing...</p>
            </div>
        `;
        
        spinner.appendChild(spinnerContent);
        document.body.appendChild(spinner);
        
        // Add CSS animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes spin {
                to { transform: rotate(360deg); }
            }
            @keyframes slideIn {
                from {
                    transform: translateX(400px);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(style);
    } else if (!show && spinner) {
        spinner.remove();
    }
}

// ---- API Functions ----
async function submitRequest(vehicle_id, zone_id) {
    const resp = await fetch("/api/user/submit_request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vehicle_id, preferred_zone_id: zone_id })
    });
    return resp.json();
}

async function releaseRequest(request_id) {
    const resp = await fetch("/api/user/release_request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ request_id })
    });
    return resp.json();
}

async function getRequestStatus(request_id) {
    const resp = await fetch(`/api/user/status/${request_id}`);
    return resp.json();
}

async function rollbackOperations(k) {
    const resp = await fetch("/api/admin/rollback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ k })
    });
    return resp.json();
}

// ---- Form Validation ----
function validateForm(formId) {
    const form = document.getElementById(formId);
    if (!form) return false;
    
    const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
    let isValid = true;
    
    inputs.forEach(input => {
        if (!input.value.trim()) {
            input.style.borderColor = '#ef4444';
            isValid = false;
        } else {
            input.style.borderColor = '';
        }
    });
    
    return isValid;
}

// ---- Format Utilities ----
function formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function formatDuration(seconds) {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
    return `${Math.round(seconds / 3600)}h`;
}

// ---- DOM Ready Initialization ----
document.addEventListener("DOMContentLoaded", () => {
    // Add animations CSS if not already present
    if (!document.querySelector('style[data-animations]')) {
        const style = document.createElement('style');
        style.setAttribute('data-animations', 'true');
        style.textContent = `
            @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.5; }
            }
            
            @keyframes slideInUp {
                from {
                    opacity: 0;
                    transform: translateY(20px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            .btn {
                transition: all 0.2s ease;
            }
            
            .btn:hover:not(:disabled) {
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
            }
            
            .btn:active:not(:disabled) {
                transform: translateY(0);
            }
            
            .card {
                animation: slideInUp 0.3s ease;
            }
        `;
        document.head.appendChild(style);
    }
    
    // Setup page-specific handlers
    setupSubmitFormHandler();
    setupStatusFormHandler();
})

// ---- Submit Form Handler ----
function setupSubmitFormHandler() {
    const submitForm = document.getElementById("submit-form");
    if (!submitForm) return;
    
    submitForm.addEventListener("submit", async e => {
        e.preventDefault();
        
        if (!validateForm("submit-form")) {
            showNotification('Please fill in all required fields', 'warning');
            return;
        }
        
        showLoadingSpinner(true);
        
        try {
            const vehicle_id = document.getElementById("vehicle_id").value;
            const zone_id = document.getElementById("preferred_zone_id").value;
            const data = await submitRequest(vehicle_id, zone_id);
            
            if (data.status === 'success') {
                showNotification('Parking request submitted successfully!', 'success');
                document.getElementById("submit-msg").innerHTML = `
                    <div class="alert alert-success" style="margin-top: 1rem;">
                        <i class="fas fa-check-circle"></i>
                        <div>
                            <strong>Request Submitted</strong>
                            <p style="margin: 0.5rem 0 0 0;">Your request ID: <strong>${data.data?.request_id}</strong></p>
                            <small style="color: rgba(255,255,255,0.8);">Copy this ID to check your request status later</small>
                        </div>
                    </div>
                `;
                
                // Reset form
                setTimeout(() => {
                    submitForm.reset();
                }, 1000);
            } else {
                showNotification(data.message || 'Failed to submit request', 'error');
            }
        } catch (err) {
            showNotification('Error submitting request', 'error');
        } finally {
            showLoadingSpinner(false);
        }
    });
}

// ---- Status Form Handler ----
function setupStatusFormHandler() {
    const statusForm = document.getElementById("status-form");
    if (!statusForm) return;
    
    statusForm.addEventListener("submit", async e => {
        e.preventDefault();
        
        showLoadingSpinner(true);
        try {
            const request_id = document.getElementById("request_id").value;
            const data = await getRequestStatus(request_id);
            
            if (data.status === 'success') {
                showNotification('Status retrieved successfully', 'success');
            } else {
                showNotification('Request not found', 'warning');
            }
        } catch (err) {
            showNotification('Error fetching status', 'error');
        } finally {
            showLoadingSpinner(false);
        }
    });
}

// ---- Sidebar Toggle (Mobile) ----
function setupSidebarToggle() {
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const sidebar = document.querySelector('aside');
    
    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('collapsed');
            localStorage.setItem('sidebarCollapsed', sidebar.classList.contains('collapsed'));
        });
        
        // Restore state
        if (localStorage.getItem('sidebarCollapsed') === 'true') {
            sidebar.classList.add('collapsed');
        }
    }
}

document.addEventListener('DOMContentLoaded', setupSidebarToggle);
// ---- Navigation Functions ----
function navigateTo(path) {
    window.location.href = path;
}

function getStatusColor(state) {
    const colors = {
        'new': '#3b82f6',
        'validated': '#3b82f6',
        'allocated': '#10b981',
        'active': '#10b981',
        'completed': '#8b5cf6',
        'failed': '#ef4444',
        'cancelled': '#6b7280'
    };
    return colors[state?.toLowerCase()] || '#6b7280';
}

// ---- Admin Dashboard Functions ----
async function loadDashboardData() {
    try {
        showLoadingSpinner(true);
        const resp = await fetch('/api/admin/zones');
        if (!resp.ok) throw new Error('Failed to load zones');
        
        const data = await resp.json();
        if (data.status === 'success') {
            const zones = data.data;
            
            // Update stat cards
            const totalZones = zones.length;
            const totalSlots = zones.reduce((sum, z) => sum + z.total_slots, 0);
            const occupiedSlots = zones.reduce((sum, z) => sum + z.occupied_slots, 0);
            const occupancyRate = totalSlots > 0 ? Math.round((occupiedSlots / totalSlots) * 100) : 0;
            
            document.getElementById('total-zones').textContent = totalZones;
            document.getElementById('total-slots').textContent = totalSlots;
            document.getElementById('occupied-slots').textContent = occupiedSlots;
            document.getElementById('occupancy-rate').textContent = occupancyRate + '%';
            
            // Update zones container
            const container = document.getElementById('zones-container');
            if (container) {
                container.innerHTML = zones.map(zone => `
                    <div style="padding: 1rem; background: var(--light); border-radius: 8px; border-left: 4px solid var(--primary);">
                        <h4 style="margin: 0 0 0.5rem 0;">${zone.zone_name} (${zone.zone_id})</h4>
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                            <span style="color: var(--text-light);">Available Slots:</span>
                            <strong>${zone.available_slots} / ${zone.total_slots}</strong>
                        </div>
                        <div style="background: white; border-radius: 4px; height: 8px; overflow: hidden;">
                            <div style="background: var(--primary); width: ${totalSlots > 0 ? (zone.available_slots / zone.total_slots) * 100 : 0}%; height: 100%;"></div>
                        </div>
                    </div>
                `).join('');
            }
        }
    } catch (err) {
        showNotification('Failed to load dashboard data', 'error');
    } finally {
        showLoadingSpinner(false);
    }
}

function refreshDashboard() {
    loadDashboardData();
    showNotification('Dashboard refreshed', 'success');
}

// ---- Analytics Functions ----
async function loadAnalyticsData() {
    try {
        showLoadingSpinner(true);
        
        // Fetch metrics
        const metricsResp = await fetch('/api/admin/metrics');
        const metricsData = await metricsResp.json();
        
        if (metricsData.status === 'success') {
            const metrics = metricsData.data;
            
            // Update stat cards
            document.getElementById('avg-duration').textContent = metrics.avg_parking_duration || '0m';
            document.getElementById('completed-sessions').textContent = metrics.completed_sessions || '0';
            document.getElementById('cancelled-sessions').textContent = metrics.cancelled_sessions || '0';
            
            // Update session statistics table
            document.getElementById('total-requests').textContent = metrics.total_requests || '0';
            document.getElementById('success-rate').textContent = (metrics.success_rate || 0) + '%';
            document.getElementById('avg-response').textContent = (metrics.avg_response_time || 0) + 'ms';
            document.getElementById('uptime').textContent = (metrics.uptime || 99.9) + '%';
        }
        
        // Load zones data for utilization chart
        const zonesResp = await fetch('/api/admin/zones');
        const zonesData = await zonesResp.json();
        
        if (zonesData.status === 'success') {
            const zones = zonesData.data;
            
            // Update zone utilization
            const utilContainer = document.getElementById('zone-util-container');
            if (utilContainer) {
                utilContainer.innerHTML = zones.map(zone => {
                    const utilization = zone.total_slots > 0 ? Math.round((zone.occupied_slots / zone.total_slots) * 100) : 0;
                    return `
                        <div style="padding: 1rem; background: var(--light); border-radius: 8px;">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                                <strong>${zone.zone_name}</strong>
                                <span style="color: var(--text-light);">${utilization}%</span>
                            </div>
                            <div style="background: white; border-radius: 4px; height: 8px; overflow: hidden;">
                                <div style="background: ${getUtilizationColor(utilization)}; width: ${utilization}%; height: 100%;"></div>
                            </div>
                        </div>
                    `;
                }).join('');
            }
            
            // Update peak zones
            const peakZones = zones.sort((a, b) => (b.occupied_slots / b.total_slots) - (a.occupied_slots / a.total_slots)).slice(0, 5);
            const peakContainer = document.getElementById('peak-zones-container');
            if (peakContainer) {
                peakContainer.innerHTML = peakZones.map((zone, idx) => {
                    const utilization = zone.total_slots > 0 ? Math.round((zone.occupied_slots / zone.total_slots) * 100) : 0;
                    return `
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; background: var(--light); border-radius: 8px; border-left: 4px solid ${getUtilizationColor(utilization)};">
                            <div>
                                <strong>#${idx + 1} ${zone.zone_name}</strong>
                                <small style="color: var(--text-light); display: block;">${zone.occupied_slots} / ${zone.total_slots} occupied</small>
                            </div>
                            <strong style="color: ${getUtilizationColor(utilization)};">${utilization}%</strong>
                        </div>
                    `;
                }).join('');
            }
        }
    } catch (err) {
        showNotification('Failed to load analytics data', 'error');
    } finally {
        showLoadingSpinner(false);
    }
}

function getUtilizationColor(percentage) {
    if (percentage >= 80) return '#ef4444';  // red - critical
    if (percentage >= 60) return '#f59e0b';  // orange - warning
    return '#10b981';  // green - normal
}

function generateReport() {
    showNotification('Generating report...', 'info');
    loadAnalyticsData();
}

function exportReport(format) {
    showNotification(`Exporting report as ${format.toUpperCase()}...`, 'info');
    // In a real application, this would call the backend to generate the export
    setTimeout(() => {
        showNotification(`Report exported as ${format.toUpperCase()}`, 'success');
    }, 1500);
}

// ---- Rollback Functions ----
async function loadOperations() {
    try {
        // Load recent operations
        const container = document.getElementById('operations-list');
        if (container) {
            // Simulated operations data - in a real app, this would come from the API
            const operations = [
                { id: 'OP-001', action: 'Allocation', request_id: 'REQ-001', timestamp: new Date(Date.now() - 5 * 60000), status: 'success' },
                { id: 'OP-002', action: 'Allocation', request_id: 'REQ-002', timestamp: new Date(Date.now() - 10 * 60000), status: 'success' },
                { id: 'OP-003', action: 'Release', request_id: 'REQ-025', timestamp: new Date(Date.now() - 15 * 60000), status: 'success' },
                { id: 'OP-004', action: 'Allocation', request_id: 'REQ-003', timestamp: new Date(Date.now() - 20 * 60000), status: 'success' },
                { id: 'OP-005', action: 'Allocation', request_id: 'REQ-004', timestamp: new Date(Date.now() - 25 * 60000), status: 'success' },
            ];
            
            container.innerHTML = operations.map(op => `
                <div style="padding: 1rem; background: var(--light); border-radius: 8px; border-left: 4px solid var(--success);">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                        <div>
                            <h5 style="margin: 0 0 0.5rem 0;">${op.action} - ${op.id}</h5>
                            <small style="color: var(--text-light);">Request: ${op.request_id}</small><br>
                            <small style="color: var(--text-light);">${formatDate(op.timestamp)}</small>
                        </div>
                        <span class="badge-status badge-completed">Success</span>
                    </div>
                </div>
            `).join('');
        }
    } catch (err) {
        console.error('Failed to load operations:', err);
    }
}

// ---- Status Display Functions ----
function displayRequestStatus(requestData) {
    const statusColor = getStatusColor(requestData.state);
    const container = document.getElementById('detailed-status');
    
    if (!container) return;
    
    const statusBadgeClass = {
        'new': 'badge-allocated',
        'validated': 'badge-allocated',
        'allocated': 'badge-active',
        'active': 'badge-active',
        'completed': 'badge-completed',
        'failed': 'badge-failed',
        'cancelled': 'badge-cancelled'
    }[requestData.state?.toLowerCase()] || 'badge-allocated';
    
    container.style.display = 'block';
    container.innerHTML = `
        <div class="card" style="margin-top: 2rem;">
            <div class="card-header">
                <div>
                    <h2 class="card-title">Request Details</h2>
                    <p class="card-subtitle">Complete information for your parking request</p>
                </div>
            </div>
            <div class="card-content">
                <div class="grid grid-2">
                    <div>
                        <div style="padding: 1rem; background: var(--light); border-radius: 8px; margin-bottom: 1rem;">
                            <small style="color: var(--text-light); display: block; margin-bottom: 0.5rem;">Request ID</small>
                            <code style="word-break: break-all;">${requestData.request_id}</code>
                        </div>
                        <div style="padding: 1rem; background: var(--light); border-radius: 8px; margin-bottom: 1rem;">
                            <small style="color: var(--text-light); display: block; margin-bottom: 0.5rem;">Vehicle ID</small>
                            <strong>${requestData.vehicle_id}</strong>
                        </div>
                        <div style="padding: 1rem; background: var(--light); border-radius: 8px; margin-bottom: 1rem;">
                            <small style="color: var(--text-light); display: block; margin-bottom: 0.5rem;">Current Status</small>
                            <span class="badge-status ${statusBadgeClass}" style="background-color: ${statusColor}20; color: ${statusColor}; border: 1px solid ${statusColor};">
                                ${requestData.state?.charAt(0).toUpperCase() + requestData.state?.slice(1)}
                            </span>
                        </div>
                    </div>
                    <div>
                        <div style="padding: 1rem; background: var(--light); border-radius: 8px; margin-bottom: 1rem;">
                            <small style="color: var(--text-light); display: block; margin-bottom: 0.5rem;">Allocated Zone</small>
                            <strong>${requestData.allocated_zone_id || 'Not allocated yet'}</strong>
                        </div>
                        <div style="padding: 1rem; background: var(--light); border-radius: 8px; margin-bottom: 1rem;">
                            <small style="color: var(--text-light); display: block; margin-bottom: 0.5rem;">Allocated Area</small>
                            <strong>${requestData.allocated_area_id || 'Not allocated yet'}</strong>
                        </div>
                        <div style="padding: 1rem; background: var(--light); border-radius: 8px; margin-bottom: 1rem;">
                            <small style="color: var(--text-light); display: block; margin-bottom: 0.5rem;">Allocated Slot</small>
                            <strong>${requestData.allocated_slot_id || 'Not allocated yet'}</strong>
                        </div>
                    </div>
                </div>
                <div style="margin-top: 1rem; padding: 1rem; background: var(--light); border-radius: 8px;">
                    <small style="color: var(--text-light);">
                        <strong>Created:</strong> ${formatDate(requestData.created_at)} | 
                        <strong>Updated:</strong> ${formatDate(requestData.updated_at)}
                    </small>
                </div>
            </div>
        </div>
    `;
}

// ---- Initialize Dashboard on Page Load ----
document.addEventListener('DOMContentLoaded', () => {
    // Check which page we're on and load appropriate data
    if (window.location.pathname.includes('/admin') && !window.location.pathname.includes('analytics') && !window.location.pathname.includes('rollback') && !window.location.pathname.includes('system')) {
        loadDashboardData();
    } else if (window.location.pathname.includes('analytics')) {
        loadAnalyticsData();
    } else if (window.location.pathname.includes('rollback') || window.location.pathname.includes('system')) {
        loadOperations();
    }
});