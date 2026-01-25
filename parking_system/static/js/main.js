// ---- User Submit Request ----
async function submitRequest(vehicle_id, zone_id) {
    const resp = await fetch("/api/user/submit_request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vehicle_id, preferred_zone_id: zone_id })
    });
    return resp.json();
}

// ---- User Release Request ----
async function releaseRequest(request_id) {
    const resp = await fetch("/api/user/release_request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ request_id })
    });
    return resp.json();
}

// ---- User Status ----
async function getRequestStatus(request_id) {
    const resp = await fetch(`/api/user/status/${request_id}`);
    return resp.json();
}

// ---- Admin Rollback ----
async function rollbackOperations(k) {
    const resp = await fetch("/api/admin/rollback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ k })
    });
    return resp.json();
}

// ---- Example form handling ----
document.addEventListener("DOMContentLoaded", () => {
    // Submit form
    const submitForm = document.getElementById("submit-form");
    if(submitForm) {
        submitForm.addEventListener("submit", async e => {
            e.preventDefault();
            const vehicle_id = document.getElementById("vehicle_id").value;
            const zone_id = document.getElementById("preferred_zone_id").value;
            const data = await submitRequest(vehicle_id, zone_id);
            document.getElementById("submit-msg").innerText = data.message + (data.data?.request_id ? ` | Request ID: ${data.data.request_id}` : "");
        });
    }

    // Status form
    const statusForm = document.getElementById("status-form");
    if(statusForm) {
        statusForm.addEventListener("submit", async e => {
            e.preventDefault();
            const request_id = document.getElementById("request_id").value;
            const data = await getRequestStatus(request_id);
            if(data.status === "success") {
                document.getElementById("status-msg").innerText = 
                    `State: ${data.data.state}, Slot: ${data.data.allocated_slot_id || "-"}, Zone: ${data.data.allocated_zone_id || "-"}`;
            } else {
                document.getElementById("status-msg").innerText = data.message;
            }
        });
    }

    // Rollback form
    const rollbackForm = document.getElementById("rollback-form");
    if(rollbackForm) {
        rollbackForm.addEventListener("submit", async e => {
            e.preventDefault();
            const k = e.target.k.value;
            const data = await rollbackOperations(k);
            document.getElementById("rollback-msg").innerText = data.message;
        });
    }
});
