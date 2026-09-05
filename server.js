const express=require("express");
const path=require("path");
const Database=require("better-sqlite3");
const app=express(), db=new Database("store.db");
app.use(express.json()); app.use(express.static(path.join(__dirname,"public")));
db.exec(`
CREATE TABLE IF NOT EXISTS products(
 id INTEGER PRIMARY KEY AUTOINCREMENT,name TEXT NOT NULL,category TEXT NOT NULL,
 price REAL NOT NULL,original_price REAL,description TEXT,stock INTEGER DEFAULT 0,
 badge TEXT,image_url TEXT,active INTEGER DEFAULT 1);
CREATE TABLE IF NOT EXISTS orders(
 id INTEGER PRIMARY KEY AUTOINCREMENT,uid TEXT NOT NULL,region TEXT,item_id INTEGER,
 amount REAL,status TEXT DEFAULT 'pending',created_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS settings(
 key TEXT PRIMARY KEY,value TEXT);
`);
const seed=db.prepare("SELECT COUNT(*) n FROM products").get().n;
if(!seed) db.prepare("INSERT INTO products(name,category,price,original_price,description,stock,badge,active) VALUES (?,?,?,?,?,?,?,1)")
.run("100 Diamonds","diamonds",99,120,"Standard diamond pack",999,"POPULAR");

app.get("/api/products",(req,res)=>res.json(db.prepare("SELECT * FROM products WHERE active=1 ORDER BY id DESC").all()));
app.get("/api/settings",(req,res)=>{
 const rows=db.prepare("SELECT key,value FROM settings").all(); const out=Object.fromEntries(rows);
 res.json({storeName:out.storeName||"Top Up Center",upiId:out.upiId||"",qrImageUrl:out.qrImageUrl||"",supportText:out.supportText||""});
});
app.post("/api/orders",(req,res)=>{
 const {uid,region,itemId}=req.body; const item=db.prepare("SELECT * FROM products WHERE id=? AND active=1").get(itemId);
 if(!uid||!item) return res.status(400).json({error:"Invalid UID or product"});
 const r=db.prepare("INSERT INTO orders(uid,region,item_id,amount) VALUES (?,?,?,?)").run(uid,String(region||""),item.id,item.price);
 res.json({orderId:r.lastInsertRowid,amount:item.price});
});
app.post("/api/orders/:id/paid",(req,res)=>{
 db.prepare("UPDATE orders SET status='payment_submitted' WHERE id=?").run(req.params.id);
 res.json({ok:true});
});
function admin(req,res,next){ if(req.headers["x-admin-password"]!==process.env.ADMIN_PASSWORD) return res.status(401).json({error:"Unauthorized"}); next(); }
app.get("/api/admin/orders",admin,(req,res)=>res.json(db.prepare(`
SELECT o.*,p.name item_name FROM orders o LEFT JOIN products p ON p.id=o.item_id ORDER BY o.id DESC`).all()));
app.post("/api/admin/orders/:id/status",admin,(req,res)=>{
 const allowed=["pending","payment_submitted","approved","completed","rejected"];
 if(!allowed.includes(req.body.status)) return res.status(400).json({error:"Invalid status"});
 db.prepare("UPDATE orders SET status=? WHERE id=?").run(req.body.status,req.params.id); res.json({ok:true});
});
app.post("/api/admin/products",admin,(req,res)=>{
 const p=req.body;
 if(p.id) db.prepare(`UPDATE products SET name=?,category=?,price=?,original_price=?,description=?,stock=?,badge=?,image_url=?,active=? WHERE id=?`)
 .run(p.name,p.category,p.price,p.original_price||null,p.description||"",p.stock||0,p.badge||"",p.image_url||"",p.active?1:0,p.id);
 else db.prepare(`INSERT INTO products(name,category,price,original_price,description,stock,badge,image_url,active) VALUES (?,?,?,?,?,?,?,?,?)`)
 .run(p.name,p.category,p.price,p.original_price||null,p.description||"",p.stock||0,p.badge||"",p.image_url||"",p.active?1:0);
 res.json({ok:true});
});
app.delete("/api/admin/products/:id",admin,(req,res)=>{db.prepare("DELETE FROM products WHERE id=?").run(req.params.id);res.json({ok:true})});
app.post("/api/admin/settings",admin,(req,res)=>{
 for(const [k,v] of Object.entries(req.body)) db.prepare("INSERT INTO settings(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value").run(k,String(v??""));
 res.json({ok:true});
});
app.get("/admin",(req,res)=>res.sendFile(path.join(__dirname,"public","admin.html")));
app.listen(process.env.PORT||3000,()=>console.log("Top-up center running"));
