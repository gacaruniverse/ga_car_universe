from flask import Flask, render_template, request, redirect, session, flash, make_response, jsonify
import mysql.connector
from werkzeug.security import generate_password_hash, check_password_hash
import os
from werkzeug.utils import secure_filename
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import io
import base64
app = Flask(__name__)
app.secret_key = "ga_car_universe_secret"
UPLOAD_FOLDER = "static/uploads"

app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
# ==========================
# Disable Browser Cache
# ==========================

@app.after_request
def add_header(response):

    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Pragma"] = "no-cache"
    response.headers["Expires"] = "0"

    return response

# ==========================
# MySQL Connection & Migrations
# ==========================

def run_migrations(mydb):
    try:
        mycursor = mydb.cursor()
        # 1. Create tables if they don't exist
        mycursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(100) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                whatsapp VARCHAR(15),
                name VARCHAR(100),
                door_no VARCHAR(50),
                street VARCHAR(255),
                area VARCHAR(255),
                city VARCHAR(100),
                state VARCHAR(100),
                pincode VARCHAR(10)
            )
        """)
        mycursor.execute("""
            CREATE TABLE IF NOT EXISTS products (
                id INT AUTO_INCREMENT PRIMARY KEY,
                car_name VARCHAR(100) NOT NULL,
                price INT NOT NULL DEFAULT 0,
                category VARCHAR(100),
                stock INT NOT NULL DEFAULT 0,
                image_path VARCHAR(255),
                description TEXT,
                scale VARCHAR(20) DEFAULT '1:36',
                brand VARCHAR(50) DEFAULT 'Generic',
                material VARCHAR(50) DEFAULT 'Diecast Metal',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        mycursor.execute("""
            CREATE TABLE IF NOT EXISTS cart (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(100) NOT NULL,
                product_id INT NOT NULL,
                quantity INT NOT NULL DEFAULT 1,
                UNIQUE KEY user_product (username, product_id)
            )
        """)
        mycursor.execute("""
            CREATE TABLE IF NOT EXISTS order_master (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(100) NOT NULL,
                whatsapp VARCHAR(15),
                name VARCHAR(100),
                door_no VARCHAR(50),
                street VARCHAR(255),
                area VARCHAR(255),
                city VARCHAR(100),
                state VARCHAR(100),
                pincode VARCHAR(10),
                order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                status VARCHAR(50) DEFAULT 'Pending',
                courier_name VARCHAR(100),
                tracking_id VARCHAR(100)
            )
        """)
        mycursor.execute("""
            CREATE TABLE IF NOT EXISTS order_items (
                id INT AUTO_INCREMENT PRIMARY KEY,
                order_id INT NOT NULL,
                product_id INT,
                quantity INT NOT NULL,
                price INT NOT NULL,
                image_path VARCHAR(255)
            )
        """)
        mycursor.execute("""
            CREATE TABLE IF NOT EXISTS wishlist (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(100) NOT NULL,
                product_id INT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE KEY user_wishlist (username, product_id)
            )
        """)
        mycursor.execute("""
            CREATE TABLE IF NOT EXISTS reviews (
                id INT AUTO_INCREMENT PRIMARY KEY,
                product_id INT NOT NULL,
                username VARCHAR(100) NOT NULL,
                rating INT NOT NULL DEFAULT 5,
                review_text TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # 2. Check and add columns to products table
        mycursor.execute("DESCRIBE products")
        columns = [row[0] for row in mycursor.fetchall()]
        columns_lower = [c.lower() for c in columns]
        
        if 'stock' not in columns_lower:
            mycursor.execute("ALTER TABLE products ADD COLUMN stock INT NOT NULL DEFAULT 0")
        if 'description' not in columns_lower:
            mycursor.execute("ALTER TABLE products ADD COLUMN description TEXT")
        if 'scale' not in columns_lower:
            mycursor.execute("ALTER TABLE products ADD COLUMN scale VARCHAR(20) DEFAULT '1:36'")
        if 'brand' not in columns_lower:
            mycursor.execute("ALTER TABLE products ADD COLUMN brand VARCHAR(50) DEFAULT 'Generic'")
        if 'material' not in columns_lower:
            mycursor.execute("ALTER TABLE products ADD COLUMN material VARCHAR(50) DEFAULT 'Diecast Metal'")
            
        mydb.commit()
        mycursor.close()
        print("✅ Database schemas and columns verified successfully")
    except Exception as ex:
        print("❌ Error running database migrations:", ex)

try:
    db = mysql.connector.connect(
        host="localhost",
        user="root",
        password="sriram@2005",
        database="ga_car_universe",
        autocommit=True,
        connection_timeout=600,
        ssl_disabled=True
    )
    print("✅ Connected Successfully")
    run_migrations(db)
except Exception as e:
    print(e)

cursor = db.cursor(dictionary=True)

def check_db():
    global db, cursor
    try:
        if not db.is_connected():
            db.reconnect(attempts=3, delay=2)
            cursor = db.cursor(dictionary=True)
            run_migrations(db)
    except:
        db = mysql.connector.connect(
            host="localhost",
            user="root",
            password="sriram@2005",
            database="ga_car_universe",
            autocommit=True,
            connection_timeout=600,
            ssl_disabled=True
        )
        cursor = db.cursor(dictionary=True)
        run_migrations(db)

# ==========================
# Admin Credentials
# ==========================

ADMIN_USERNAME = "sriramsundar"
ADMIN_PASSWORD = "ga@45"

# ==========================
# Login Page
# ==========================

@app.route("/")
def home():

    if "user" in session:
        return redirect("/user")

    if "admin" in session:
        return redirect("/admin")

    return render_template("login.html")

# ==========================
# Register
# ==========================

@app.route("/register", methods=["POST"])
def register():

    check_db()

    username = request.form["username"].strip()
    whatsapp = request.form["whatsapp"].strip()
    password = request.form["password"]

    # Reserved Admin
    if username.lower() == ADMIN_USERNAME.lower():
        flash("Username Reserved For Admin")
        return redirect("/")

    if password == ADMIN_PASSWORD:
        flash("Password Reserved For Admin")
        return redirect("/")

    # Duplicate Username
    cursor.execute(
        "SELECT * FROM users WHERE username=%s",
        (username,)
    )

    user = cursor.fetchone()

    if user:
        flash("Username Already Exists")
        return redirect("/")

    hashed_password = generate_password_hash(password)

    cursor.execute(
        """
        INSERT INTO users(username,whatsapp,password)
        VALUES(%s,%s,%s)
        """,
        (
            username,
            whatsapp,
            hashed_password
        )
    )

    db.commit()

    flash("Registration Successful")
    return redirect("/")

# ==========================
# Check Username Availability (AJAX)
# ==========================

@app.route("/check_username", methods=["GET"])
def check_username():
    check_db()
    username = request.args.get("username", "").strip()

    if not username:
        return jsonify({"available": False, "message": "Username cannot be empty"})

    # Check if it's the reserved admin username
    if username.lower() == ADMIN_USERNAME.lower():
        return jsonify({"available": False, "message": "This username is reserved. Please choose another."})

    # Check if already registered in DB
    cursor.execute("SELECT id FROM users WHERE username=%s", (username,))
    existing = cursor.fetchone()

    if existing:
        return jsonify({"available": False, "message": "Username already exists. Please choose another."})

    return jsonify({"available": True, "message": "Username is available!"})

# ==========================
# Login
# ==========================

@app.route("/login", methods=["POST"])
def login():

    check_db()

    username = request.form["username"].strip()
    password = request.form["password"]

    # Admin Login
    if username == ADMIN_USERNAME and password == ADMIN_PASSWORD:

        session["admin"] = True

        return redirect("/admin")

    cursor.execute(
        "SELECT * FROM users WHERE username=%s",
        (username,)
    )

    user = cursor.fetchone()

    if user:

        if check_password_hash(
            user["password"],
            password
        ):

            session["user"] = username

            return redirect("/user")

    flash("Invalid Username or Password")

    return redirect("/")

# ==========================
# Forgot Password
# ==========================

@app.route("/forgot", methods=["POST"])
def forgot():

    check_db()

    username = request.form["username"]
    whatsapp = request.form["whatsapp"]
    new_password = request.form["new_password"]

    if username.lower() == ADMIN_USERNAME.lower():

        flash("Admin Password Cannot Be Changed Here")

        return redirect("/")

    cursor.execute(
        """
        SELECT * FROM users
        WHERE username=%s
        AND whatsapp=%s
        """,
        (
            username,
            whatsapp
        )
    )

    user = cursor.fetchone()

    if user:

        hashed = generate_password_hash(new_password)

        cursor.execute(
            """
            UPDATE users
            SET password=%s
            WHERE username=%s
            """,
            (
                hashed,
                username
            )
        )

        db.commit()

        flash("Password Updated Successfully")

    else:

        flash("Verification Failed")

    return redirect("/")

# ==========================
# User Page
# ==========================

@app.route("/user")
def user():

    check_db()

    if "user" not in session:
        return redirect("/")

    # User details
    cursor.execute("""
        SELECT username, whatsapp, name, door_no, street,
               area, city, state, pincode
        FROM users
        WHERE username=%s
    """, (session["user"],))

    user = cursor.fetchone()

    # Products fetch
    cursor.execute("""
        SELECT p.*, COALESCE(AVG(r.rating), 0) AS avg_rating, COUNT(r.id) AS rating_count
        FROM products p
        LEFT JOIN reviews r ON p.id = r.product_id
        GROUP BY p.id
        ORDER BY p.id DESC
    """)
    products = cursor.fetchall()

    # Categories fetch
    cursor.execute("""
        SELECT DISTINCT category
        FROM products
        ORDER BY category
    """)

    categories = cursor.fetchall()

    return render_template(
        "user.html",
        user=user,
        products=products,
        categories=categories
    )

# ==========================
# Admin Page
# ==========================

@app.route("/admin")
def admin():

    check_db()

    if "admin" not in session:
        return redirect("/")

    # Get all products
    cursor.execute("""
        SELECT *
        FROM products
        ORDER BY id DESC
    """)
    products = cursor.fetchall()

    # Get all unique categories
    cursor.execute("""
        SELECT DISTINCT category
        FROM products
        ORDER BY category
    """)
    categories = cursor.fetchall()

    return render_template(
        "admin.html",
        products=products,
        categories=categories
    )
# ==========================
# cart
# ==========================
@app.route("/cart")
def cart():
    return "<h1>Cart Page</h1>"


@app.route("/orders")
def orders():
    return "<h1>My Orders</h1>"


@app.route("/terms")
def terms():
    return "<h1>Terms & Conditions</h1>"

@app.route("/contact")
def contact():

    if "user" not in session:
        return redirect("/")

    return render_template("contact.html")


# ==========================
# Update Profile
# ==========================

@app.route("/update_profile", methods=["POST"])
def update_profile():

    if "user" not in session:
        return redirect("/")

    whatsapp = request.form.get("whatsapp", "")
    name = request.form.get("name", "")
    door_no = request.form.get("door_no", "")
    street = request.form.get("street", "")
    area = request.form.get("area", "")
    city = request.form.get("city", "")
    state = request.form.get("state", "")
    pincode = request.form.get("pincode", "")

    cursor.execute("""
        UPDATE users
        SET
            whatsapp=%s,
            name=%s,
            door_no=%s,
            street=%s,
            area=%s,
            city=%s,
            state=%s,
            pincode=%s
        WHERE username=%s
    """, (
        whatsapp,
        name,
        door_no,
        street,
        area,
        city,
        state,
        pincode,
        session["user"]
    ))

    db.commit()

    if request.headers.get("X-Requested-With") == "XMLHttpRequest":
        return jsonify({"status": "success"})

    flash("Profile Updated Successfully")

    return redirect("/user")

# ==========================
# Logout
# ==========================

@app.route("/logout")
def logout():

    session.clear()

    return redirect("/")

@app.route("/update_product/<int:id>", methods=["POST"])
def update_product(id):

    check_db()

    name = request.form["carName"]
    price = request.form["price"]
    category = request.form["category"]
    stock = request.form["stock"]
    description = request.form.get("description", "")
    scale = request.form.get("scale", "1:36")
    brand = request.form.get("brand", "Generic")
    material = request.form.get("material", "Diecast Metal")

    image = request.files.get("carImage")

    if image and image.filename != "":

        filename = secure_filename(image.filename)
        image.save(os.path.join(app.config["UPLOAD_FOLDER"], filename))

        image_path = "uploads/" + filename

        cursor.execute("""
            UPDATE products
            SET
                car_name=%s,
                price=%s,
                category=%s,
                stock=%s,
                image_path=%s,
                description=%s,
                scale=%s,
                brand=%s,
                material=%s
            WHERE id=%s
        """, (name, price, category, stock, image_path, description, scale, brand, material, id))

    else:

        cursor.execute("""
            UPDATE products
            SET
                car_name=%s,
                price=%s,
                category=%s,
                stock=%s,
                description=%s,
                scale=%s,
                brand=%s,
                material=%s
            WHERE id=%s
        """, (name, price, category, stock, description, scale, brand, material, id))

    db.commit()

    return "success"

@app.route("/get_product/<int:id>")
def get_product(id):

    check_db()

    cursor.execute(
        "SELECT * FROM products WHERE id=%s",
        (id,)
    )

    product = cursor.fetchone()

    if not product:
        return jsonify({"status":"not_found"}),404

    username = session.get("user")

    if username:

        cursor.execute("""
            SELECT quantity
            FROM cart
            WHERE username=%s
            AND product_id=%s
        """,(username,id))

        cart = cursor.fetchone()

        product["cart_quantity"] = cart["quantity"] if cart else 0

        # Check Wishlist
        cursor.execute("""
            SELECT id FROM wishlist
            WHERE username = %s AND product_id = %s
        """, (username, id))
        wl = cursor.fetchone()
        product["is_wishlist"] = True if wl else False

    else:
        product["cart_quantity"] = 0
        product["is_wishlist"] = False

    # Get Reviews and Stats
    cursor.execute("""
        SELECT username, rating, review_text, DATE_FORMAT(created_at, '%Y-%m-%d %H:%i') as date
        FROM reviews
        WHERE product_id = %s
        ORDER BY id DESC
    """, (id,))
    reviews = cursor.fetchall()
    product["reviews"] = reviews
    
    cursor.execute("""
        SELECT COALESCE(AVG(rating), 0) as avg_rating, COUNT(id) as rating_count
        FROM reviews
        WHERE product_id = %s
    """, (id,))
    rating_stats = cursor.fetchone()
    product["avg_rating"] = float(rating_stats["avg_rating"]) if rating_stats else 0.0
    product["rating_count"] = rating_stats["rating_count"] if rating_stats else 0

    return jsonify(product)

@app.route("/upload_product", methods=["POST"])
def upload_product():

    check_db()

    image = request.files["carImage"]
    name = request.form["carName"]
    price = request.form["carPrice"]
    category = request.form["carCategory"]
    stock = request.form["stock"]
    description = request.form.get("description", "")
    scale = request.form.get("scale", "1:36")
    brand = request.form.get("brand", "Generic")
    material = request.form.get("material", "Diecast Metal")

    filename = secure_filename(image.filename)
    image.save(os.path.join(app.config["UPLOAD_FOLDER"], filename))

    image_path = "uploads/" + filename

    cursor.execute("""
        INSERT INTO products (car_name,price,category,stock,image_path,description,scale,brand,material)
        VALUES(%s,%s,%s,%s,%s,%s,%s,%s,%s)
    """, (name, price, category, stock, image_path, description, scale, brand, material))

    db.commit()

    return redirect("/admin")

# ==========================
# New Routes: Wishlist, Reviews, Analytics
# ==========================

@app.route("/get_wishlist")
def get_wishlist():
    check_db()
    if "user" not in session:
        return jsonify([])
    username = session["user"]
    cursor.execute("""
        SELECT p.*
        FROM wishlist w
        JOIN products p ON w.product_id = p.id
        WHERE w.username = %s
        ORDER BY w.id DESC
    """, (username,))
    items = cursor.fetchall()
    return jsonify(items)

@app.route("/toggle_wishlist", methods=["POST"])
def toggle_wishlist():
    check_db()
    if "user" not in session:
        return jsonify({"status": "login_required"})
    username = session["user"]
    product_id = request.form.get("product_id")
    
    cursor.execute("""
        SELECT id FROM wishlist
        WHERE username = %s AND product_id = %s
    """, (username, product_id))
    item = cursor.fetchone()
    
    if item:
        cursor.execute("""
            DELETE FROM wishlist
            WHERE username = %s AND product_id = %s
        """, (username, product_id))
        db.commit()
        return jsonify({"status": "removed"})
    else:
        cursor.execute("""
            INSERT INTO wishlist (username, product_id)
            VALUES (%s, %s)
        """, (username, product_id))
        db.commit()
        return jsonify({"status": "added"})

@app.route("/add_review", methods=["POST"])
def add_review():
    check_db()
    if "user" not in session:
        return jsonify({"status": "login_required"})
    username = session["user"]
    product_id = request.form.get("product_id")
    rating = int(request.form.get("rating", 5))
    review_text = request.form.get("review_text", "").strip()
    
    cursor.execute("""
        INSERT INTO reviews (product_id, username, rating, review_text)
        VALUES (%s, %s, %s, %s)
    """, (product_id, username, rating, review_text))
    db.commit()
    return jsonify({"status": "success"})

@app.route("/admin_analytics")
def admin_analytics():
    check_db()
    if "admin" not in session:
        return jsonify({"status": "failed", "message": "unauthorized"})
    
    local_cursor = db.cursor(dictionary=True)
    try:
        local_cursor.execute("SELECT IFNULL(SUM(quantity * price), 0) AS total_sales FROM order_items")
        sales_res = local_cursor.fetchone()
        total_sales = float(sales_res["total_sales"]) if sales_res else 0.0
        
        local_cursor.execute("SELECT COUNT(*) AS total_orders FROM order_master")
        orders_res = local_cursor.fetchone()
        total_orders = orders_res["total_orders"] if orders_res else 0
        
        local_cursor.execute("SELECT COUNT(*) AS active_orders FROM order_master WHERE status != 'Delivered'")
        active_res = local_cursor.fetchone()
        active_orders = active_res["active_orders"] if active_res else 0
        
        local_cursor.execute("SELECT COUNT(*) AS low_stock FROM products WHERE stock < 5")
        stock_res = local_cursor.fetchone()
        low_stock = stock_res["low_stock"] if stock_res else 0
        
        local_cursor.execute("SELECT COUNT(*) AS total_users FROM users")
        users_res = local_cursor.fetchone()
        total_users = users_res["total_users"] if users_res else 0
        
        return jsonify({
            "status": "success",
            "total_sales": total_sales,
            "total_orders": total_orders,
            "active_orders": active_orders,
            "low_stock": low_stock,
            "total_users": total_users
        })
    finally:
        local_cursor.close()

@app.route("/admin_charts")
def admin_charts():
    check_db()
    if "admin" not in session:
        return jsonify({"status": "failed", "message": "unauthorized"})

    local_cursor = db.cursor(dictionary=True)
    try:
        # Chart 1: Orders by Status
        local_cursor.execute("SELECT status, COUNT(*) as count FROM order_master GROUP BY status")
        status_data = local_cursor.fetchall()
        statuses = [row["status"] for row in status_data]
        counts = [row["count"] for row in status_data]

        plt.figure(figsize=(6, 4), facecolor='#050505')
        ax = plt.subplot(111)
        ax.set_facecolor('#0f0f0f')
        ax.spines['bottom'].set_color('#ffd500')
        ax.spines['top'].set_color('none')
        ax.spines['left'].set_color('#ffd500')
        ax.spines['right'].set_color('none')
        ax.tick_params(colors='white')
        ax.yaxis.label.set_color('#ffd500')
        ax.xaxis.label.set_color('#ffd500')
        ax.title.set_color('#ffd500')
        
        if len(statuses) > 0:
            bars = plt.bar(statuses, counts, color='#ffd500', edgecolor='white', width=0.4)
            # Add labels on top of bars
            for bar in bars:
                height = bar.get_height()
                plt.text(bar.get_x() + bar.get_width()/2.0, height, '%d' % int(height), ha='center', va='bottom', color='white')
        else:
            plt.text(0.5, 0.5, 'No Order Data Available', ha='center', va='center', color='white', fontsize=12)

        plt.title("Orders by Status", fontsize=14, fontweight='bold', pad=15)
        plt.ylabel("Number of Orders")
        
        plt.tight_layout()
        img1 = io.BytesIO()
        plt.savefig(img1, format='png', facecolor='#050505', dpi=100)
        img1.seek(0)
        chart1 = base64.b64encode(img1.getvalue()).decode('utf-8')
        plt.close()

        # Chart 2: Revenue by Category
        local_cursor.execute("""
            SELECT p.category, SUM(oi.price * oi.quantity) as revenue 
            FROM order_items oi 
            JOIN products p ON oi.product_id = p.id 
            GROUP BY p.category
        """)
        cat_data = local_cursor.fetchall()
        
        categories = [row["category"] if row["category"] else "Other" for row in cat_data]
        revenues = [float(row["revenue"]) for row in cat_data]

        plt.figure(figsize=(6, 4), facecolor='#050505')
        ax = plt.subplot(111)
        ax.set_facecolor('#0f0f0f')
        
        colors = ['#ffd500', '#00ff88', '#ff3366', '#00bfff', '#9932cc', '#ff8c00']
        if len(categories) > 0:
            wedges, texts, autotexts = plt.pie(
                revenues, 
                labels=categories, 
                autopct='%1.1f%%', 
                startangle=140,
                colors=colors[:len(categories)],
                textprops=dict(color="white"),
                wedgeprops=dict(edgecolor='#050505', linewidth=2)
            )
            for text in texts:
                text.set_color('#ffd500')
            for autotext in autotexts:
                autotext.set_color('black')
                autotext.set_weight('bold')
        else:
            plt.text(0.5, 0.5, 'No Revenue Data Available', ha='center', va='center', color='white', fontsize=12)
            
        plt.title("Revenue by Category", fontsize=14, fontweight='bold', pad=15, color='#ffd500')
        plt.tight_layout()
        img2 = io.BytesIO()
        plt.savefig(img2, format='png', facecolor='#050505', dpi=100)
        img2.seek(0)
        chart2 = base64.b64encode(img2.getvalue()).decode('utf-8')
        plt.close()

        # Chart 3: Top 5 Products by Sales
        local_cursor.execute("""
            SELECT p.car_name, SUM(oi.quantity) as qty 
            FROM order_items oi 
            JOIN products p ON oi.product_id = p.id 
            GROUP BY p.id, p.car_name 
            ORDER BY qty DESC 
            LIMIT 5
        """)
        top_products = local_cursor.fetchall()
        product_names = [row["car_name"] for row in top_products]
        qtys = [int(row["qty"]) for row in top_products]

        plt.figure(figsize=(10, 4), facecolor='#050505')
        ax = plt.subplot(111)
        ax.set_facecolor('#0f0f0f')
        ax.spines['bottom'].set_color('#ffd500')
        ax.spines['top'].set_color('none')
        ax.spines['left'].set_color('#ffd500')
        ax.spines['right'].set_color('none')
        ax.tick_params(colors='white')
        ax.yaxis.label.set_color('#ffd500')
        ax.xaxis.label.set_color('#ffd500')
        ax.title.set_color('#ffd500')

        if len(product_names) > 0:
            bars = plt.barh(product_names, qtys, color='#00ff88', edgecolor='white', height=0.5)
            plt.title("Top 5 Products by Quantity Sold", fontsize=14, fontweight='bold', pad=15)
            plt.xlabel("Quantity Sold")
            for bar in bars:
                width = bar.get_width()
                plt.text(width + 0.1, bar.get_y() + bar.get_height()/2.0, '%d' % int(width), ha='left', va='center', color='white', fontweight='bold')
        else:
            plt.text(0.5, 0.5, 'No Product Sales Data Available', ha='center', va='center', color='white', fontsize=12)

        plt.tight_layout()
        img3 = io.BytesIO()
        plt.savefig(img3, format='png', facecolor='#050505', dpi=100)
        img3.seek(0)
        chart3 = base64.b64encode(img3.getvalue()).decode('utf-8')
        plt.close()

        return jsonify({
            "status": "success",
            "chart1": chart1,
            "chart2": chart2,
            "chart3": chart3
        })
    except Exception as e:
        print("Error generating matplotlib charts:", e)
        return jsonify({"status": "failed", "message": str(e)})
    finally:
        local_cursor.close()

@app.route("/delete_product/<int:id>", methods=["POST"])
def delete_product(id):

    check_db()

    cursor.execute(
        "DELETE FROM products WHERE id=%s",
        (id,)
    )

    db.commit()

    return "success"

@app.route("/add_to_cart", methods=["POST"])
def add_to_cart():

    check_db()

    if "user" not in session:
        return jsonify({"status": "login_required"})

    username = session["user"]

    product_id = request.form["product_id"]
    quantity = int(request.form["quantity"])

    # Product stock fetch
    cursor.execute(
        "SELECT stock FROM products WHERE id=%s",
        (product_id,)
    )

    product = cursor.fetchone()

    if not product:
        return jsonify({"status": "not_found"})

    stock = product["stock"]

    # Already in cart?
    cursor.execute("""
        SELECT quantity
        FROM cart
        WHERE username=%s
        AND product_id=%s
    """, (username, product_id))

    cart = cursor.fetchone()

    if cart:

        new_qty = cart["quantity"] + quantity

        if new_qty > stock:
            return jsonify({
                "status": "stock_exceeded"
            })

        cursor.execute("""
            UPDATE cart
            SET quantity=%s
            WHERE username=%s
            AND product_id=%s
        """, (
            new_qty,
            username,
            product_id
        ))

    else:

        if quantity > stock:
            return jsonify({
                "status": "stock_exceeded"
            })

        cursor.execute("""
            INSERT INTO cart(username,product_id,quantity)
            VALUES(%s,%s,%s)
        """, (
            username,
            product_id,
            quantity
        ))

    db.commit()

    return jsonify({
        "status": "success"
    })

@app.route("/update_cart", methods=["POST"])
def update_cart():

    check_db()

    if "user" not in session:
        return jsonify({"status":"login_required"})

    username = session["user"]

    product_id = request.form["product_id"]
    action = request.form["action"]

    cursor.execute(
        "SELECT stock FROM products WHERE id=%s",
        (product_id,)
    )

    product = cursor.fetchone()

    stock = product["stock"]

    cursor.execute("""
        SELECT quantity
        FROM cart
        WHERE username=%s
        AND product_id=%s
    """,(username,product_id))

    cart = cursor.fetchone()

    if not cart:
        return jsonify({"status":"not_found"})

    qty = cart["quantity"]

    # PLUS
    if action=="plus":

        if qty>=stock:

            return jsonify({
                "status":"stock_limit",
                "quantity":qty
            })

        qty += 1

        cursor.execute("""
            UPDATE cart
            SET quantity=%s
            WHERE username=%s
            AND product_id=%s
        """,(qty,username,product_id))

    # MINUS
    else:

        qty -= 1

        if qty<=0:

            cursor.execute("""
                DELETE FROM cart
                WHERE username=%s
                AND product_id=%s
            """,(username,product_id))

            db.commit()

            return jsonify({
                "status":"removed"
            })

        cursor.execute("""
            UPDATE cart
            SET quantity=%s
            WHERE username=%s
            AND product_id=%s
        """,(qty,username,product_id))

    db.commit()

    return jsonify({
        "status":"success",
        "quantity":qty
    })

@app.route("/get_cart")
def get_cart():

    check_db()

    if "user" not in session:
        return jsonify([])

    cursor.execute("""
        SELECT
            cart.product_id,
            cart.quantity,
            products.car_name,
            products.category,
            products.price,
            products.image_path
        FROM cart
        JOIN products
        ON cart.product_id = products.id
        WHERE cart.username=%s
    """,(session["user"],))

    items = cursor.fetchall()

    return jsonify(items)

@app.route("/cart_count")
def cart_count():

    check_db()

    if not db.is_connected():
        db.reconnect(attempts=3, delay=2)

    if "user" not in session:
        return jsonify({"count":0})

    cursor.execute("""
    SELECT IFNULL(SUM(quantity),0) AS total
    FROM cart
    WHERE username=%s
""", (session["user"],))

    result = cursor.fetchone()

    return jsonify({
        "count": result["total"]
    })

@app.route("/place_order", methods=["POST"])
def place_order():

    check_db()

    if "user" not in session:
        return jsonify({"status": "login_required"})

    username = session["user"]

    # Get cart items + user details
    cursor.execute("""
        SELECT
            cart.product_id,
            cart.quantity,

            products.price,
            products.image_path,

            users.username,
            users.whatsapp,
            users.name,
            users.door_no,
            users.street,
            users.area,
            users.city,
            users.state,
            users.pincode

        FROM cart

        JOIN products
            ON cart.product_id = products.id

        JOIN users
            ON users.username = cart.username

        WHERE cart.username = %s
    """, (username,))

    items = cursor.fetchall()

    if not items:
        return jsonify({"status": "empty"})

    # -------------------------
    # Insert into order_master
    # -------------------------
    cursor.execute("""
        INSERT INTO order_master(
            username,
            whatsapp,
            name,
            door_no,
            street,
            area,
            city,
            state,
            pincode
        )
        VALUES(%s,%s,%s,%s,%s,%s,%s,%s,%s)
    """, (
        items[0]["username"],
        items[0]["whatsapp"],
        items[0]["name"],
        items[0]["door_no"],
        items[0]["street"],
        items[0]["area"],
        items[0]["city"],
        items[0]["state"],
        items[0]["pincode"]
    ))

    # Newly created Order ID
    order_id = cursor.lastrowid

    # -------------------------
    # Insert all products
    # -------------------------
    for item in items:

        cursor.execute("""
            INSERT INTO order_items(
                order_id,
                product_id,
                quantity,
                price,
                image_path
            )
            VALUES(%s,%s,%s,%s,%s)
        """, (
            order_id,
            item["product_id"],
            item["quantity"],
            item["price"],
            item["image_path"]
        ))

        # Reduce stock
        cursor.execute("""
            UPDATE products
            SET stock = stock - %s
            WHERE id = %s
        """, (
            item["quantity"],
            item["product_id"]
        ))

    # -------------------------
    # Clear Cart
    # -------------------------
    cursor.execute("""
        DELETE FROM cart
        WHERE username = %s
    """, (username,))

    db.commit()

    return jsonify({
        "status": "success"
    })

@app.route("/get_orders")
def get_orders():

    check_db()

    if "user" not in session:
        return jsonify([])

    cursor.execute("""
        SELECT

            om.id AS order_id,
            om.order_date,
            om.status,
            om.whatsapp,
            om.courier_name,
            om.tracking_id,

            oi.product_id,
            oi.quantity,
            oi.price,
            oi.image_path,

            p.car_name,
            p.category

        FROM order_master om

        JOIN order_items oi
            ON om.id = oi.order_id

        JOIN products p
            ON oi.product_id = p.id

        WHERE om.username=%s

        ORDER BY om.id DESC

    """,(session["user"],))

    data = cursor.fetchall()

    orders = {}

    for row in data:

        oid = row["order_id"]

        if oid not in orders:

            orders[oid] = {
    "order_id": oid,
    "status": row["status"],
    "order_date": row["order_date"],
    "whatsapp": row["whatsapp"],

    "courier_name": row["courier_name"],
    "tracking_id": row["tracking_id"],

    "total":100,
    "products":[]
}

        orders[oid]["products"].append(row)

        orders[oid]["total"] += row["price"] * row["quantity"]

    return jsonify(list(orders.values()))

@app.route("/update_whatsapp", methods=["POST"])
def update_whatsapp():

    if "user" not in session:
        return jsonify({"status":"login_required"})

    whatsapp = request.form["whatsapp"]

    cursor.execute("""
        UPDATE users
        SET whatsapp=%s
        WHERE username=%s
    """, (
        whatsapp,
        session["user"]
    ))

    db.commit()

    return jsonify({"status":"success"})

@app.route("/update_address", methods=["POST"])
def update_address():

    if "user" not in session:
        return jsonify({"status":"login_required"})

    cursor.execute("""
        UPDATE users
        SET
            name=%s,
            door_no=%s,
            street=%s,
            area=%s,
            city=%s,
            state=%s,
            pincode=%s
        WHERE username=%s
    """,(

        request.form["name"],
        request.form["door_no"],
        request.form["street"],
        request.form["area"],
        request.form["city"],
        request.form["state"],
        request.form["pincode"],
        session["user"]

    ))

    db.commit()

    return jsonify({"status":"success"})

@app.route("/admin_orders")
def admin_orders():

    check_db()

    if "admin" not in session:
        return jsonify([])

    cursor.execute("""
        SELECT
    om.id AS order_id,
    om.username,
    om.whatsapp,
    om.name,

    om.door_no,
    om.street,
    om.area,
    om.city,
    om.state,
    om.pincode,

    om.order_date,
    om.status,
    om.courier_name,
    om.tracking_id,

    oi.quantity,
    oi.price,
    oi.image_path,

    p.car_name

FROM order_master om

JOIN order_items oi
    ON om.id = oi.order_id

JOIN products p
    ON oi.product_id = p.id

ORDER BY om.id DESC
    """)

    return jsonify(cursor.fetchall())

@app.route("/update_order_status/<int:id>", methods=["POST"])
def update_order_status(id):

    check_db()

    if "admin" not in session:
        return jsonify({"status":"failed"})

    cursor.execute(
        "SELECT status FROM order_master WHERE id=%s",
        (id,)
    )

    order = cursor.fetchone()

    current = order["status"]

    if current == "Pending":
        new_status = "Payment"

    elif current == "Payment":
        new_status = "Processing"

    elif current == "Shipping":
        new_status = "Delivered"

    else:
        return jsonify({"status":"success"})

    cursor.execute("""
        UPDATE order_master
        SET status=%s
        WHERE id=%s
    """, (new_status, id))

    db.commit()

    return jsonify({"status":"success"})

@app.route("/cancel_order/<int:order_id>", methods=["POST"])
def cancel_order(order_id):

    check_db()

    if "user" not in session:
        return jsonify({"status": "login_required"})

    username = session["user"]

    # Check order belongs to logged in user
    cursor.execute("""
        SELECT id
        FROM order_master
        WHERE id=%s AND username=%s
    """, (order_id, username))

    order = cursor.fetchone()

    if not order:
        return jsonify({"status": "failed"})

    # Get ordered products
    cursor.execute("""
        SELECT product_id, quantity
        FROM order_items
        WHERE order_id=%s
    """, (order_id,))

    items = cursor.fetchall()

    # Return stock
    for item in items:

        cursor.execute("""
            UPDATE products
            SET stock = stock + %s
            WHERE id = %s
        """, (
            item["quantity"],
            item["product_id"]
        ))

    # Delete order items
    cursor.execute("""
        DELETE FROM order_items
        WHERE order_id=%s
    """, (order_id,))

    # Delete order master
    cursor.execute("""
        DELETE FROM order_master
        WHERE id=%s
    """, (order_id,))

    db.commit()

    return jsonify({
        "status": "success"
    })

@app.route("/update_tracking/<int:id>", methods=["POST"])
def update_tracking(id):

    check_db()

    if "admin" not in session:
        return jsonify({"status":"failed"})

    courier_name = request.form["courier_name"]
    tracking_id = request.form["tracking_id"]

    cursor.execute("""
        UPDATE order_master
        SET
            courier_name=%s,
            tracking_id=%s,
            status='Shipping'
        WHERE id=%s
    """, (
        courier_name,
        tracking_id,
        id
    ))

    db.commit()

    return jsonify({"status":"success"})

@app.route("/save_tracking/<int:order_id>", methods=["POST"])
def save_tracking(order_id):

    check_db()

    if "admin" not in session:
        return jsonify({"status":"failed"})

    courier = request.form["courier_name"]
    tracking = request.form["tracking_id"]

    cursor.execute("""
        UPDATE order_master
        SET
            courier_name=%s,
            tracking_id=%s,
            status='Shipping'
        WHERE id=%s
    """,(
        courier,
        tracking,
        order_id
    ))

    db.commit()

    return jsonify({
        "status":"success"
    })

@app.route("/admin_cancel_order/<int:order_id>", methods=["POST"])
def admin_cancel_order(order_id):

    check_db()

    if "admin" not in session:
        return jsonify({"status":"failed"})

    # Ordered Products
    cursor.execute("""
        SELECT product_id,quantity
        FROM order_items
        WHERE order_id=%s
    """,(order_id,))

    items=cursor.fetchall()

    # Return Stock
    for item in items:

        cursor.execute("""
            UPDATE products
            SET stock=stock+%s
            WHERE id=%s
        """,(item["quantity"],item["product_id"]))

    # Delete Items
    cursor.execute("""
        DELETE FROM order_items
        WHERE order_id=%s
    """,(order_id,))

    # Delete Master
    cursor.execute("""
        DELETE FROM order_master
        WHERE id=%s
    """,(order_id,))

    db.commit()

    return jsonify({"status":"success"})

# ==========================

if __name__ == "__main__":
    app.run(debug=True, threaded=False)
