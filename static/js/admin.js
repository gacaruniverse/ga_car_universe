// ======================
// Upload Product Modal
// ======================

function openUpload(){
    document.getElementById("uploadModal").style.display="flex";
}

// Ensure the modal can close
function closeUpload(){
    document.getElementById("uploadModal").style.display="none";
}

function logoutAdmin() {
    if (confirm("Are you sure you want to logout?")) {
        window.location.href = "/logout";
    }
}

function openProduct(id){
    fetch("/get_product/" + id)
    .then(response => response.json())
    .then(product => {
        document.getElementById("productModal").style.display = "flex";
        document.getElementById("productId").value = product.id;
        document.getElementById("modalImage").src = "/static/" + product.image_path;
        document.getElementById("modalName").value = product.car_name;
        document.getElementById("modalPrice").value = product.price;
        document.getElementById("modalCategory").value = product.category;
        document.getElementById("modalStock").value = product.stock;
        
        // Specs and Description
        document.getElementById("modalBrand").value = product.brand || 'Generic';
        document.getElementById("modalScale").value = product.scale || '1:36';
        document.getElementById("modalMaterial").value = product.material || 'Diecast Metal';
        document.getElementById("modalDescription").value = product.description || '';

        // Load Reviews
        const reviewsList = document.getElementById("adminReviewsList");
        reviewsList.innerHTML = "";
        if (product.reviews && product.reviews.length > 0) {
            product.reviews.forEach(rev => {
                let stars = "";
                for (let i = 1; i <= 5; i++) {
                    stars += i <= rev.rating ? '<i class="fa-solid fa-star"></i>' : '<i class="fa-regular fa-star"></i>';
                }
                reviewsList.innerHTML += `
                    <div class="admin-review-item">
                        <div class="admin-review-hdr">
                            <span class="admin-review-usr"><i class="fa-solid fa-user"></i> ${rev.username}</span>
                            <span class="admin-review-stars">${stars}</span>
                        </div>
                        <div class="admin-review-txt">${rev.review_text || ''}</div>
                        <div class="admin-review-dt">${rev.date}</div>
                    </div>
                `;
            });
        } else {
            reviewsList.innerHTML = '<p style="color:#666; font-style:italic; font-size:0.85rem; padding: 10px 0;">No reviews yet for this product.</p>';
        }
    });
}

function closeProduct(){
    document.getElementById("productModal").style.display = "none";
}

function updateProduct() {
    let id = document.getElementById("productId").value;
    let formData = new FormData();

    formData.append("carName", document.getElementById("modalName").value);
    formData.append("price", document.getElementById("modalPrice").value);
    formData.append("category", document.getElementById("modalCategory").value);
    formData.append("stock", document.getElementById("modalStock").value);
    
    // Append brand, scale, material, description
    formData.append("brand", document.getElementById("modalBrand").value);
    formData.append("scale", document.getElementById("modalScale").value);
    formData.append("material", document.getElementById("modalMaterial").value);
    formData.append("description", document.getElementById("modalDescription").value);

    let image = document.getElementById("modalNewImage").files[0];
    if(image){
        formData.append("carImage", image);
    }

    fetch("/update_product/" + id, {
        method: "POST",
        body: formData
    })
    .then(res => res.text())
    .then(data => {
        alert("Product Updated Successfully");
        location.reload();
    });
}

function deleteProduct() {
    let id = document.getElementById("productId").value;

    if (!confirm("Are you sure you want to delete this product?")) {
        return;
    }

    fetch("/delete_product/" + id, {
        method: "POST"
    })
    .then(res => res.text())
    .then(data => {
        alert("Product Deleted Successfully");
        location.reload();
    });
}

function toggleMenu(){
    document.getElementById("sideMenu").classList.add("active");
}

function closeMenu(){
    document.getElementById("sideMenu").classList.remove("active");
}

function showProducts(){
    sessionStorage.setItem("adminTab", "products");
    document.getElementById("dashboardSection").style.display = "none";
    document.getElementById("productsSection").style.display = "grid";
    document.getElementById("ordersSection").style.display = "none";

    document.getElementById("addCardBtn").style.display = "flex";
    document.getElementById("filterBar").style.display = "flex";

    closeMenu();
}

function showOrders(){
    sessionStorage.setItem("adminTab", "orders");
    document.getElementById("dashboardSection").style.display = "none";
    document.getElementById("productsSection").style.display = "none";
    document.getElementById("ordersSection").style.display = "block";

    document.getElementById("addCardBtn").style.display = "none";
    document.getElementById("filterBar").style.display = "none";

    closeMenu();
    loadOrders();
}

// Dashboard Switch and Visualizations
function showDashboard(){
    sessionStorage.setItem("adminTab", "dashboard");
    document.getElementById("dashboardSection").style.display = "block";
    document.getElementById("productsSection").style.display = "none";
    document.getElementById("ordersSection").style.display = "none";

    document.getElementById("addCardBtn").style.display = "none";
    document.getElementById("filterBar").style.display = "none";

    closeMenu();
    loadDashboardData();
}

function loadDashboardData() {
    // 1. Fetch text analytics
    fetch("/admin_analytics")
    .then(res => res.json())
    .then(data => {
        if (data.status === "success") {
            document.getElementById("statSales").innerText = "₹" + data.total_sales;
            document.getElementById("statOrders").innerText = data.total_orders;
            document.getElementById("statActive").innerText = data.active_orders;
            document.getElementById("statLowStock").innerText = data.low_stock;
            document.getElementById("statUsers").innerText = data.total_users;
        }
    })
    .catch(err => console.error("Error fetching admin stats:", err));

    // 2. Fetch chart visualizations
    document.getElementById("chart1Loading").style.display = "block";
    document.getElementById("chart2Loading").style.display = "block";
    document.getElementById("chart3Loading").style.display = "block";
    document.getElementById("chart1Img").style.display = "none";
    document.getElementById("chart2Img").style.display = "none";
    document.getElementById("chart3Img").style.display = "none";

    fetch("/admin_charts")
    .then(res => res.json())
    .then(data => {
        if (data.status === "success") {
            document.getElementById("chart1Loading").style.display = "none";
            document.getElementById("chart2Loading").style.display = "none";
            document.getElementById("chart3Loading").style.display = "none";

            document.getElementById("chart1Img").src = "data:image/png;base64," + data.chart1;
            document.getElementById("chart2Img").src = "data:image/png;base64," + data.chart2;
            document.getElementById("chart3Img").src = "data:image/png;base64," + data.chart3;

            document.getElementById("chart1Img").style.display = "block";
            document.getElementById("chart2Img").style.display = "block";
            document.getElementById("chart3Img").style.display = "block";
        } else {
            console.error("Failed to load charts:", data.message);
        }
    })
    .catch(err => console.error("Error fetching dashboard charts:", err));
}

function loadOrders(){
    fetch("/admin_orders")
    .then(res => res.json())
    .then(data => {
        let html = "";
        let currentOrder = "";

        data.forEach(item => {
            if(currentOrder != item.order_id){
                if(currentOrder != ""){
                    html += `
                        </div>
                    </div>
                    `;
                }

                currentOrder = item.order_id;

                html += `
                <div class="admin-order-card">
                    <h2>Order #${item.order_id}</h2>
                    <p><b>User :</b> ${item.username}</p>
                    <p><b>WhatsApp :</b> ${item.whatsapp}</p>
                    <p>
                        <b>Address :</b>
                        ${item.name || ""},
                        ${item.door_no || ""},
                        ${item.street || ""},
                        ${item.area || ""},
                        ${item.city || ""},
                        ${item.state || ""} - ${item.pincode || ""}
                    </p>
                    <p><b>Date :</b> ${item.order_date}</p>
                    <p>
                        <b>Status :</b>
                        <button class="status-btn" onclick="updateOrderStatus(${item.order_id})">
                            ${item.status}
                        </button>
                    </p>
                `;

                // If Processing status, show Courier/Tracking Inputs
                if(item.status === "Processing"){
                    html += `
                    <div class="tracking-form">
                        <input
                            type="text"
                            id="courier${item.order_id}"
                            placeholder="Courier Company"
                            value="${item.courier_name || ""}">
                        <input
                            type="text"
                            id="tracking${item.order_id}"
                            placeholder="Tracking ID"
                            value="${item.tracking_id || ""}">
                        <button onclick="saveTracking(${item.order_id})">
                            Save Tracking
                        </button>
                    </div>
                    `;
                }

                // If not delivered, show cancel button
                if(item.status !== "Delivered"){
                    html += `
                    <button class="cancel-btn" onclick="adminCancelOrder(${item.order_id})">
                        <i class="fa-solid fa-ban"></i> Cancel This Order
                    </button>
                    `;
                }

                html += `<div class="order-images">`;
            }

            html += `
                <div class="product-box">
                    <img src="/static/${item.image_path}">
                    <h4>${item.car_name}</h4>
                    <p>Qty : ${item.quantity}</p>
                    <p>₹${item.price}</p>
                </div>
            `;
        });

        if(data.length > 0){
            html += `
                </div>
            </div>
            `;
        } else {
            html = `<p style="text-align:center; color:#888; font-size:1.1rem; padding: 40px 0;">No orders found.</p>`;
        }

        document.getElementById("adminOrdersContainer").innerHTML = html;
    })
    .catch(err=>{
        console.log(err);
    });
}

function updateOrderStatus(id){
    fetch("/update_order_status/" + id,{
        method:"POST"
    })
    .then(res=>res.json())
    .then(data=>{
        if(data.status=="success"){
            loadOrders();
        }
    });
}

function saveTracking(orderId){
    let courier = document.getElementById("courier"+orderId).value;
    let tracking = document.getElementById("tracking"+orderId).value;

    if(courier.trim()=="" || tracking.trim()==""){
        alert("Enter Courier Company and Tracking ID");
        return;
    }

    let formData = new FormData();
    formData.append("courier_name",courier);
    formData.append("tracking_id",tracking);

    fetch("/save_tracking/"+orderId,{
        method:"POST",
        body:formData
    })
    .then(res=>res.json())
    .then(data=>{
        if(data.status=="success"){
            alert("Tracking Updated Successfully");
            loadOrders();
        }
    });
}

function searchOrder(){
    let input = document.getElementById("orderSearch").value.toLowerCase();
    let cards = document.querySelectorAll(".admin-order-card");

    cards.forEach(card=>{
        let id = card.querySelector("h2").innerText.toLowerCase();
        if(id.includes(input)){
            card.style.display="block";
        }
        else{
            card.style.display="none";
        }
    });
}

function adminCancelOrder(orderId){
    if(!confirm("Cancel this order?")){
        return;
    }

    fetch("/admin_cancel_order/" + orderId,{
        method:"POST"
    })
    .then(res=>res.json())
    .then(data=>{
        if(data.status=="success"){
            alert("Order Cancelled");
            loadOrders();
        }
    });
}

function filterAdminProducts(){
    let search = document.getElementById("adminSearch").value.toLowerCase();
    let category = document.getElementById("adminCategory").value.toLowerCase();
    let cards = document.querySelectorAll(".card");

    cards.forEach(card=>{
        let name = card.dataset.name;
        let cat = card.dataset.category;

        let matchName = name.includes(search);
        let matchCategory = category=="" || cat==category;

        if(matchName && matchCategory){
            card.style.display="block";
        }
        else{
            card.style.display="none";
        }
    });
}

// Show active tab on initial admin page load automatically (persists on reload)
window.addEventListener("DOMContentLoaded", () => {
    const activeTab = sessionStorage.getItem("adminTab") || "dashboard";
    if (activeTab === "products") {
        showProducts();
    } else if (activeTab === "orders") {
        showOrders();
    } else {
        showDashboard();
    }
});