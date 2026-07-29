// ==========================================
// TOAST NOTIFICATIONS SYSTEM
// ==========================================
let toastContainer = document.querySelector(".toast-container");
if (!toastContainer) {
    toastContainer = document.createElement("div");
    toastContainer.className = "toast-container";
    document.body.appendChild(toastContainer);
}

function showToast(message, type = "success") {
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    let icon = '<i class="fa-solid fa-circle-check" style="color: #00ffcc;"></i>';
    if (type === "error") {
        icon = '<i class="fa-solid fa-circle-xmark" style="color: #ff3366;"></i>';
    } else if (type === "info") {
        icon = '<i class="fa-solid fa-circle-info" style="color: #ffd500;"></i>';
    }
    toast.innerHTML = `${icon} <span>${message}</span>`;
    toastContainer.appendChild(toast);
    
    setTimeout(() => toast.classList.add("show"), 50);
    
    setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => toast.remove(), 400);
    }, 3500);
}

// ==========================================
// WISHLIST & TABS MANAGEMENT
// ==========================================
let wishlistIds = new Set();
let currentTab = "all"; // 'all' or 'wishlist'

function loadWishlistHearts() {
    fetch("/get_wishlist")
    .then(res => res.json())
    .then(items => {
        wishlistIds = new Set(items.map(item => item.id));
        document.querySelectorAll(".wishlist-heart-btn").forEach(btn => {
            const id = parseInt(btn.id.replace("wl-btn-", ""));
            const icon = btn.querySelector("i");
            if (wishlistIds.has(id)) {
                btn.classList.add("active");
                icon.className = "fa-solid fa-heart";
            } else {
                btn.classList.remove("active");
                icon.className = "fa-regular fa-heart";
            }
        });
    })
    .catch(err => console.error("Error loading wishlist:", err));
}

function toggleWishlist(event, productId) {
    event.stopPropagation(); // Stop clicking card
    const formData = new FormData();
    formData.append("product_id", productId);
    fetch("/toggle_wishlist", {
        method: "POST",
        body: formData
    })
    .then(res => res.json())
    .then(data => {
        const btn = document.getElementById("wl-btn-" + productId);
        const icon = btn.querySelector("i");
        if (data.status == "added") {
            wishlistIds.add(productId);
            btn.classList.add("active");
            icon.className = "fa-solid fa-heart";
            showToast("Added to wishlist", "success");
        } else if (data.status == "removed") {
            wishlistIds.delete(productId);
            btn.classList.remove("active");
            icon.className = "fa-regular fa-heart";
            showToast("Removed from wishlist", "info");
            if (currentTab === "wishlist") {
                filterProducts();
            }
        } else if (data.status == "login_required") {
            showToast("Please log in to manage wishlist", "error");
        }
    });
}

function switchProductTab(tab) {
    currentTab = tab;
    document.getElementById("tabAllCars").classList.toggle("active", tab === "all");
    document.getElementById("tabWishlist").classList.toggle("active", tab === "wishlist");
    filterProducts();
}

// Menu Animation

const menu=document.querySelector(".menu");

const sideMenu=document.getElementById("sideMenu");

// Create an overlay so clicking outside the sidebar closes it
let menuOverlay = document.getElementById("menuOverlay");
if (!menuOverlay) {
    menuOverlay = document.createElement("div");
    menuOverlay.id = "menuOverlay";
    menuOverlay.style.cssText = [
        "position:fixed",
        "inset:0",
        "z-index:99998",
        "background:rgba(0,0,0,0.45)",
        "display:none"
    ].join(";");
    document.body.appendChild(menuOverlay);
}

menu.addEventListener("click", () => {
    sideMenu.classList.add("active");
    menuOverlay.style.display = "block";
});

menuOverlay.addEventListener("click", () => {
    closeMenu();
});

function closeMenu(){
    sideMenu.classList.remove("active");
    menuOverlay.style.display = "none";
}
const cards=document.querySelectorAll(".card");

cards.forEach(card=>{

    card.addEventListener("click",()=>{

        card.animate([
            {transform:"scale(1)"},
            {transform:"scale(.95)"},
            {transform:"scale(1.03)"},
            {transform:"scale(1)"}
        ],{
            duration:300
        });

    });

});
function logoutUser(){

    if(confirm("Are you sure you want to logout?")){

        window.location.href="/logout";

    }

}
function openProfile(){

    const modal=document.getElementById("profileModal");

    if(modal){

        modal.style.display="flex";

    }

}

function closeProfile(){

    const modal=document.getElementById("profileModal");

    if(modal){

        modal.style.display="none";

    }

}
const whatsapp=document.querySelector(
'input[name="whatsapp"]'
);

if(whatsapp){

    whatsapp.addEventListener("input",function(){

        this.value=this.value.replace(/\D/g,'');

        if(this.value.length>10){

            this.value=this.value.slice(0,10);

        }

    });

}
const pin=document.querySelector(
'input[name="pincode"]'
);

if(pin){

    pin.addEventListener("input",function(){

        this.value=this.value.replace(/\D/g,'');

        if(this.value.length>6){

            this.value=this.value.slice(0,6);

        }

    });

}
// Enable WhatsApp Editing

function editWhatsapp() {

    const input = document.getElementById("whatsapp");
    const btn = document.getElementById("whatsappBtn");

    if (input.readOnly) {

        // Edit mode
        input.readOnly = false;
        input.focus();

        btn.innerHTML =
        '<i class="fa-solid fa-check"></i> <span>Save</span>';

    } else {

        // Save
        document.querySelector("#profileModal form").submit();

    }

}

function toggleAddress(){

    const preview = document.getElementById("cartAddressPreview");
    const form = document.getElementById("addressForm");

    if(form.style.display === "none"){

        form.style.display = "block";
        preview.style.display = "none";

    }else{

        form.style.display = "none";
        preview.style.display = "block";

    }

}
function goToCart(){

    closeMenu();

    document.getElementById("cart").scrollIntoView({
        behavior: "smooth"
    });

}
function openContactModal() {
    closeMenu(); // First sidebar ah close panniduvom
    const contactModal = document.getElementById("contactModal");
    if (contactModal) {
        contactModal.style.display = "flex";
        document.body.style.overflow = "hidden"; /* Main page scroll aagatha maari lock panrom */
    }
}

function closeContactModal() {
    const contactModal = document.getElementById("contactModal");
    if (contactModal) {
        contactModal.style.display = "none";
        document.body.style.overflow = "auto"; /* Close panna piragu normal ah scroll aagalam */
    }
}
// ======================
// Upload Product Modal
// ======================

function openProduct(id){

    fetch("/get_product/"+id)

    .then(res=>res.json())

    .then(product=>{

        document.getElementById("productModal").style.display="flex";

        document.getElementById("modalImage").src="/static/"+product.image_path;

        document.getElementById("modalImage").onclick=function(){

            openImageViewer(
                "/static/"+product.image_path
            );

        };

        document.getElementById("modalName").innerHTML=product.car_name;

        document.getElementById("modalPrice").innerHTML="₹"+product.price;

        document.getElementById("productId").value = product.id;

        // Set specifications
        document.getElementById("specBrand").innerText = product.brand || 'Generic';
        document.getElementById("specScale").innerText = product.scale || '1:36';
        document.getElementById("specMaterial").innerText = product.material || 'Diecast Metal';
        document.getElementById("specCategory").innerText = product.category || '-';
        document.getElementById("specDescription").innerText = product.description || 'No description available for this model.';

        // Set ratings badge
        const badge = document.getElementById("modalRatingBadge");
        let badgeStarsHtml = "";
        const avg = Math.round(product.avg_rating);
        for (let i = 1; i <= 5; i++) {
            if (i <= avg) {
                badgeStarsHtml += '<i class="fa-solid fa-star"></i>';
            } else {
                badgeStarsHtml += '<i class="fa-regular fa-star"></i>';
            }
        }
        badge.innerHTML = `
            <div class="rating-stars">${badgeStarsHtml}</div>
            <span style="color: #ffd500; font-weight: bold; font-size: 0.95rem; margin-left: 5px;">${product.avg_rating.toFixed(1)}</span>
            <span style="color: #888; font-size: 0.8rem; margin-left: 4px;">(${product.rating_count} reviews)</span>
        `;

        // Set stock status
        const stockStatus = document.getElementById("modalStockStatus");
        const cartBtn = document.getElementById("cartBtn");
        if (product.stock > 0) {
            stockStatus.innerHTML = `<span style="color: #00ffcc;"><i class="fa-solid fa-circle-check"></i> In Stock (${product.stock} available)</span>`;
            cartBtn.disabled = false;
        } else {
            stockStatus.innerHTML = `<span style="color: #ff3366;"><i class="fa-solid fa-circle-xmark"></i> Out of Stock</span>`;
            cartBtn.disabled = true;
        }

        // Hide write review form by default
        document.getElementById("addReviewForm").style.display = "none";

        // Set reviews list
        const reviewsList = document.getElementById("reviewsList");
        reviewsList.innerHTML = "";
        if (product.reviews && product.reviews.length > 0) {
            product.reviews.forEach(rev => {
                let stars = "";
                for (let i = 1; i <= 5; i++) {
                    stars += i <= rev.rating ? '<i class="fa-solid fa-star"></i>' : '<i class="fa-regular fa-star"></i>';
                }
                reviewsList.innerHTML += `
                    <div class="review-item">
                        <div class="review-hdr">
                            <span class="review-usr"><i class="fa-solid fa-user"></i> ${rev.username}</span>
                            <span class="review-stars">${stars}</span>
                        </div>
                        <div class="review-txt">${rev.review_text || ''}</div>
                        <div class="review-dt">${rev.date}</div>
                    </div>
                `;
            });
        } else {
            reviewsList.innerHTML = '<p class="no-reviews" style="font-size: 0.85rem; color: #666; font-style: italic;">No reviews yet. Be the first to review!</p>';
        }

        if(product.cart_quantity > 0){

            document.getElementById("cartBtn").style.display = "none";

            document.getElementById("qtyBox").style.display = "flex";

            document.getElementById("confirmBtn").style.display="block";

            document.getElementById("qtyValue").innerHTML =
            product.cart_quantity;

        }
        else {

            document.getElementById("cartBtn").style.display = "block";

            document.getElementById("qtyBox").style.display = "none";

            document.getElementById("confirmBtn").style.display="none";

            document.getElementById("qtyValue").innerHTML = 1;

        }

    });

}

function zoomModalImage() {
    const src = document.getElementById("modalImage").src;
    openImageViewer(src);
}

let currentReviewRating = 5;
function setReviewRating(rating) {
    currentReviewRating = rating;
    const stars = document.querySelectorAll("#reviewStarSelector i");
    stars.forEach((star, idx) => {
        if (idx < rating) {
            star.classList.add("active");
            star.className = "fa-solid fa-star active";
        } else {
            star.classList.remove("active");
            star.className = "fa-regular fa-star";
        }
    });
}

function toggleReviewForm() {
    const form = document.getElementById("addReviewForm");
    if (form.style.display === "none") {
        form.style.display = "flex";
        setReviewRating(5);
        document.getElementById("reviewText").value = "";
    } else {
        form.style.display = "none";
    }
}

function submitReview() {
    const productId = document.getElementById("productId").value;
    const text = document.getElementById("reviewText").value.trim();
    
    if (text === "") {
        showToast("Please enter some review text", "error");
        return;
    }
    
    const formData = new FormData();
    formData.append("product_id", productId);
    formData.append("rating", currentReviewRating);
    formData.append("review_text", text);
    
    fetch("/add_review", {
        method: "POST",
        body: formData
    })
    .then(res => res.json())
    .then(data => {
        if (data.status === "success") {
            showToast("Review submitted successfully!", "success");
            toggleReviewForm();
            openProduct(productId);
            // Refresh overall rating shown on card
            const card = document.querySelector(`.card[data-id="${productId}"]`);
            if (card) {
                fetch("/get_product/" + productId)
                .then(r => r.json())
                .then(p => {
                    card.dataset.rating = p.avg_rating;
                    filterProducts();
                });
            }
        } else {
            showToast("Failed to submit review", "error");
        }
    });
}

let zoom=false;

function openImageViewer(src){

    document.getElementById("imageViewer").style.display="flex";

    document.getElementById("viewerImage").src=src;

    zoom=false;

    document.getElementById("viewerImage").style.transform="scale(1)";

}

function closeImageViewer(){

    document.getElementById("imageViewer").style.display="none";

}

function toggleZoom(){

    let img=document.getElementById("viewerImage");

    if(zoom){

        img.style.transform="scale(1)";

        zoom=false;

    }
    else{

        img.style.transform="scale(2)";

        zoom=true;

    }

}

window.addEventListener("keydown",function(e){

    if(e.key=="Escape"){

        closeImageViewer();

    }

});

function confirmProduct(){

    closeProduct();

}

function closeProduct(){

    document.getElementById("productModal").style.display="none";

}

function addToCart(){

    let id=document.getElementById("productId").value;

    let formData=new FormData();

    formData.append("product_id",id);

    formData.append("quantity",1);

    fetch("/add_to_cart",{

        method:"POST",

        body:formData

    })

    .then(res=>res.json())

    .then(data=>{

        if(data.status=="success"){

            document.querySelector(".cart-btn").style.display="none";

            document.getElementById("qtyBox").style.display="flex";

            document.getElementById("confirmBtn").style.display="block";

            loadCartCount();

        }

        else if(data.status=="stock_exceeded"){

            alert("Out Of Stock");

        }

    });

}
function increaseQty(){

    let id=document.getElementById("productId").value;

    let formData=new FormData();

    formData.append("product_id",id);

    formData.append("action","plus");

    fetch("/update_cart",{

        method:"POST",

        body:formData

    })

    .then(res=>res.json())

    .then(data=>{

        if(data.status=="success"){

    document.getElementById("qtyValue").innerHTML=data.quantity;

    loadCartCount();

}

        else if(data.status=="stock_limit"){

            alert("Maximum Stock Reached");

        }

    });

}

function decreaseQty(){

    let id=document.getElementById("productId").value;

    let formData=new FormData();

    formData.append("product_id",id);

    formData.append("action","minus");

    fetch("/update_cart",{

        method:"POST",

        body:formData

    })

    .then(res=>res.json())

    .then(data=>{

        if(data.status=="success"){

    document.getElementById("qtyValue").innerHTML=data.quantity;

    loadCartCount();

}

else if(data.status=="removed"){

    document.querySelector(".cart-btn").style.display="block";

    document.getElementById("qtyBox").style.display="none";

    document.getElementById("confirmBtn").style.display="none";

    loadCartCount();

}

    });

}
function openCart(){
    const modal = document.getElementById("cartModal");
    // Remove any conflicting inline styles - let CSS handle everything
    modal.removeAttribute("style");
    modal.classList.add("active");
    document.body.style.overflow = "hidden";
    loadCart();
}

function closeCart(){
    const modal = document.getElementById("cartModal");
    modal.classList.remove("active");
    modal.removeAttribute("style");
    document.body.style.overflow = "auto";
}

function openOrders(){
    document.getElementById("ordersModal").style.display = "flex";
    document.body.style.overflow = "hidden";
    loadOrders();
}

function closeOrders(){
    document.getElementById("ordersModal").style.display = "none";
    document.body.style.overflow = "auto";
}

function loadCartCount(){
    fetch("/cart_count")
    .then(res=>res.json())
    .then(data=>{
        if(data.count>0){
            document.getElementById("myCartBtn").style.display="block";
            document.getElementById("cartCount").innerHTML=data.count;
        }else{
            document.getElementById("myCartBtn").style.display="none";
        }
    });
}
loadCartCount();

function loadCart(){
    fetch("/get_cart")
    .then(res=>res.json())
    .then(items=>{
        let body=document.getElementById("cartBody");
        body.innerHTML="";
        let total=0;

        if(items.length==0){
            body.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; padding: 20px; color: #888;">
                    Cart is Empty
                </td>
            </tr>`;
            document.getElementById("cartTotal").innerHTML = 100;
            return;
        }

        items.forEach(item=>{
            total += item.price * item.quantity;
            body.innerHTML += `
            <tr>
                <td>
                    <img src="/static/${item.image_path}" width="80" style="border-radius: 4px; border: 1px solid rgba(255,213,0,0.2);">
                </td>
                <td style="font-weight: 600;">${item.car_name}</td>
                <td>${item.category}</td>
                <td>
                    <div class="qty-box">
                        <button onclick="cartMinus(${item.product_id})">-</button>
                        <span>${item.quantity}</span>
                        <button onclick="cartPlus(${item.product_id})">+</button>
                    </div>
                </td>
                <td style="font-weight: bold; color: #ffd500;">₹${item.price * item.quantity}</td>
            </tr>
            `;
        });

        total += 100;
        document.getElementById("cartTotal").innerHTML=total;
    });
}

function cartPlus(id){
    let formData = new FormData();
    formData.append("product_id", id);
    formData.append("action", "plus");

    fetch("/update_cart",{
        method:"POST",
        body:formData
    })
    .then(res => res.json())
    .then(data => {
        if(data.status=="stock_limit"){
            showToast("Cannot add more. Stock limit reached!", "error");
        } else {
            loadCart();
            loadCartCount();
        }
    });
}

function placeOrder(){
    if(!confirm("Place Order?")){
        return;
    }

    fetch("/place_order",{
        method:"POST"
    })
    .then(res=>res.json())
    .then(data=>{
        if(data.status=="success"){
            showToast("Order Placed Successfully!", "success");
            closeCart();
            loadCart();
            loadCartCount();
            openOrders();
        }
    });
}

// Function to generate Order Status Timeline stepper nodes
function getTimelineHTML(status) {
    const statuses = ["Pending", "Payment", "Processing", "Shipping", "Delivered"];
    const statusLabels = ["Order Placed", "Payment Checked", "Processing", "Shipped", "Delivered"];
    const currentIdx = statuses.indexOf(status);
    
    let fillWidth = 0;
    if (currentIdx > 0) {
        fillWidth = (currentIdx / (statuses.length - 1)) * 100;
    }
    
    let html = `
    <div class="order-timeline">
        <div class="timeline-fill-bar" style="width: ${fillWidth}%;"></div>
    `;
    
    statuses.forEach((st, idx) => {
        let stateClass = "";
        let icon = '<i class="fa-solid fa-circle" style="font-size: 8px;"></i>';
        if (idx < currentIdx) {
            stateClass = "completed";
            icon = '<i class="fa-solid fa-check"></i>';
        } else if (idx === currentIdx) {
            stateClass = "active";
            icon = '<i class="fa-solid fa-spinner fa-spin"></i>';
            if (st === "Delivered") {
                icon = '<i class="fa-solid fa-box-open"></i>';
            } else if (st === "Shipping") {
                icon = '<i class="fa-solid fa-truck-fast"></i>';
            }
        }
        
        html += `
        <div class="timeline-step ${stateClass}">
            <div class="step-dot">${icon}</div>
            <div class="step-label">${statusLabels[idx]}</div>
        </div>
        `;
    });
    
    html += `</div>`;
    return html;
}

function loadOrders(){
    fetch("/get_orders")
    .then(res=>res.json())
    .then(data=>{
        let container=document.getElementById("ordersContainer");
        container.innerHTML="";

        if(data.length==0){
            container.innerHTML="<h2 style='text-align: center; margin-top: 50px; color: #666;'>No Orders Yet</h2>";
            return;
        }

        data.forEach(order=>{
            let timelineHTML = getTimelineHTML(order.status);
            
            let html=`
            <div class="order-card" style="margin-bottom: 25px;">
                <div class="order-header-row">
                    <div>
                        <span style="font-size: 1.1rem; font-weight: 700; color: #ffd500;">Order #${order.order_id}</span>
                        <div class="order-date-label">Placed on ${order.order_date}</div>
                    </div>
                    <div style="text-align: right;">
                        <span style="font-weight: 700; font-size: 1.1rem; color: #fff;">Total: ₹${order.total}</span>
                    </div>
                </div>

                <div class="order-images" style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 15px;">
            `;

            order.products.forEach(product=>{
                html+=`
                <div class="order-product" style="display: flex; align-items: center; gap: 15px; background: rgba(255,255,255,0.02); padding: 8px 12px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.04);">
                    <img src="/static/${product.image_path}" style="width: 60px; height: 40px; object-fit: cover; border-radius: 4px;">
                    <div style="flex: 1;">
                        <h4 style="font-size: 0.95rem; margin: 0; color: #fff;">${product.car_name}</h4>
                        <span style="font-size: 0.8rem; color: #888;">Category: ${product.category}</span>
                    </div>
                    <div style="text-align: right;">
                        <div style="font-size: 0.9rem; font-weight: 600; color: #ffd500;">₹${product.price}</div>
                        <div style="font-size: 0.8rem; color: #888;">Qty: ${product.quantity}</div>
                    </div>
                </div>
                `;
            });

            html+=`
                </div>

                <!-- Visual Timeline Stepper -->
                ${timelineHTML}

                <div style="text-align:center; margin: 15px 0; padding: 12px 20px; background: rgba(255,213,0,0.08); border: 1px solid rgba(255,213,0,0.3); border-radius: 10px; font-size: 0.9rem; color: #ffd500; letter-spacing: 0.5px;">
                    <i class="fa-solid fa-phone-volume" style="margin-right:8px;"></i>
                    <strong>Contact us for payment confirmation</strong>
                </div>

                <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 15px; margin-top: 10px; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 15px;">
                    <div style="display: flex; gap: 10px;">
                        <a href="https://wa.me/918056964818" target="_blank" style="text-decoration: none;">
                            <button class="save-btn" style="background: #25d366; color: white; padding: 8px 16px; font-size: 0.85rem; display: flex; align-items: center; gap: 8px; border-radius: 6px; border: none; cursor: pointer; font-weight: 600;"><i class="fa-brands fa-whatsapp"></i> Chat Support</button>
                        </a>
                        <a href="https://www.instagram.com/gacaruniverse?utm_source=qr&igsh=dGFvM2ZpM2hrc3ds" target="_blank" style="text-decoration: none;">
                            <button class="save-btn" style="background: radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%,#d6249f 60%,#285AEB 90%); color: white; padding: 8px 16px; font-size: 0.85rem; display: flex; align-items: center; gap: 8px; border-radius: 6px; border: none; cursor: pointer; font-weight: 600;"><i class="fa-brands fa-instagram"></i> Instagram</button>
                        </a>
                    </div>
                    
                    <div>
                        ${order.status=="Pending" ? `
                        <button class="cancel-order-btn" style="background: transparent; border: 1px solid #ff3366; color: #ff3366; padding: 8px 16px; border-radius: 6px; font-weight: 600; cursor: pointer; transition: 0.3s; font-size: 0.85rem;" onclick="cancelOrder(${order.order_id})">
                            <i class="fa-solid fa-ban"></i> Cancel Order
                        </button>
                        ` : ""}
                    </div>
                </div>

                ${(order.status=="Processing" || order.status=="Shipping") ? `
                <div class="courier-info-box">
                    <i class="fa-solid fa-truck-ramp-box" style="font-size: 1.2rem;"></i>
                    <div>
                        <div style="font-weight: bold; font-size: 0.9rem;">Shipping via ${order.courier_name ? order.courier_name : "Courier Company"}</div>
                        <div style="font-size: 0.8rem; opacity: 0.8;">Tracking ID: <strong style="color: white;">${order.tracking_id ? order.tracking_id : "Waiting for details..."}</strong></div>
                    </div>
                </div>
                ` : ""}
            </div>
            `;
            container.innerHTML+=html;
        });
    });
}

function editCartWhatsapp(){
    let input=document.getElementById("cartWhatsapp");
    let btn=document.getElementById("cartWhatsappBtn");

    if(btn.innerHTML.includes("Edit") || btn.innerHTML=="Edit"){
        input.removeAttribute("readonly");
        input.focus();
        btn.innerHTML="Save";
    }
    else{
        let form=new FormData();
        form.append("whatsapp",input.value);
        fetch("/update_whatsapp",{
            method:"POST",
            body:form
        })
        .then(res=>res.json())
        .then(data=>{
            if(data.status=="success"){
                input.setAttribute("readonly",true);
                btn.innerHTML="Edit";
                showToast("WhatsApp Updated Successfully", "success");
            }
        });
    }
}

function toggleCartAddress(){
    let preview=document.getElementById("cartAddressPreview");
    let form=document.getElementById("cartAddressForm");
    let btn=document.getElementById("cartAddressBtn");

    if(form.style.display=="none"){
        preview.style.display="none";
        form.style.display="block";
        btn.style.display="none";
    }
}

function editCartAddress(){
    document.getElementById("cartAddressPreview").style.display="none";
    document.getElementById("cartAddressForm").style.display="block";
}

function saveCartAddress(e){
    e.preventDefault();
    let form=document.getElementById("cartAddressForm");
    let data=new FormData(form);

    fetch("/update_address",{
        method:"POST",
        body:data
    })
    .then(res=>res.json())
    .then(result=>{
        if(result.status=="success"){
            showToast("Address Updated Successfully", "success");
            // Update preview in place — stay in cart
            const name = form.querySelector('[name="name"]').value;
            const door = form.querySelector('[name="door_no"]').value;
            const street = form.querySelector('[name="street"]').value;
            const area = form.querySelector('[name="area"]').value;
            const city = form.querySelector('[name="city"]').value;
            const state = form.querySelector('[name="state"]').value;
            const pin = form.querySelector('[name="pincode"]').value;

            const preview = document.getElementById("cartAddressPreview");
            preview.innerHTML = `
                <strong>${name}</strong><br>
                ${door}, ${street}<br>
                ${area}<br>
                ${city}<br>
                ${state} - ${pin}
            `;
            // Show preview, hide form
            form.style.display = "none";
            preview.style.display = "block";
            document.getElementById("cartAddressBtn").style.display = "inline-block";
        }
    });
}

function cartMinus(id){
    let formData = new FormData();
    formData.append("product_id", id);
    formData.append("action", "minus");

    fetch("/update_cart",{
        method:"POST",
        body:formData
    })
    .then(res => res.json())
    .then(data => {
        loadCart();
        loadCartCount();

        fetch("/cart_count")
        .then(res => res.json())
        .then(cart => {
            if(cart.count == 0){
                closeCart();
            }
        });
    });
}

function cancelOrder(orderId){
    if(!confirm("Are you sure you want to cancel this order?")){
        return;
    }

    fetch("/cancel_order/" + orderId,{
        method:"POST"
    })
    .then(res=>res.json())
    .then(data=>{
        if(data.status=="success"){
            showToast("Order Cancelled Successfully", "info");
            closeOrders();
            openOrders();
        }
    });
}

function filterProducts(){
    const search = document.getElementById("searchInput").value.toLowerCase();
    const category = document.getElementById("categoryFilter").value.toLowerCase();
    const sortBy = document.getElementById("sortFilter").value;
    const stockVal = document.getElementById("stockFilter").value;
    
    const container = document.getElementById("cart");
    const cards = Array.from(document.querySelectorAll(".card"));
    
    let visibleCards = [];
    
    cards.forEach(card => {
        const name = card.dataset.name.toLowerCase();
        const cat = card.dataset.category.toLowerCase();
        const price = parseInt(card.dataset.price);
        const stock = parseInt(card.dataset.stock);
        const rating = parseFloat(card.dataset.rating);
        const id = parseInt(card.dataset.id);
        
        const matchesSearch = name.includes(search);
        const matchesCategory = (category === "" || cat === category);
        const matchesStock = (stockVal === "all" || stock > 0);
        const matchesTab = (currentTab === "all" || wishlistIds.has(id));
        
        if (matchesSearch && matchesCategory && matchesStock && matchesTab) {
            card.style.display = "block";
            visibleCards.push(card);
        } else {
            card.style.display = "none";
        }
    });
    
    if (sortBy === "price-asc") {
        visibleCards.sort((a, b) => parseInt(a.dataset.price) - parseInt(b.dataset.price));
    } else if (sortBy === "price-desc") {
        visibleCards.sort((a, b) => parseInt(b.dataset.price) - parseInt(a.dataset.price));
    } else if (sortBy === "rating") {
        visibleCards.sort((a, b) => parseFloat(b.dataset.rating) - parseFloat(a.dataset.rating));
    } else if (sortBy === "newest") {
        visibleCards.sort((a, b) => parseInt(b.dataset.id) - parseInt(a.dataset.id));
    }
    
    visibleCards.forEach(card => {
        container.appendChild(card);
    });
}

// Load wishlist hearts on window load
window.addEventListener("DOMContentLoaded", () => {
    loadWishlistHearts();
});

function openTermsModal() {
    closeMenu();
    document.getElementById("termsModal").style.display = "flex";
    document.body.style.overflow = "hidden";
}

function closeTermsModal() {
    document.getElementById("termsModal").style.display = "none";
    document.body.style.overflow = "auto";
}