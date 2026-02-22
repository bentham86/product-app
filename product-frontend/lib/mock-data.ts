import type { Product } from "@/types/product"

let nextId = 26

function generateMockProducts(): Product[] {
  const now = new Date().toISOString()
  return [
    { id: 1, name: "Wireless Bluetooth Headphones", description: "Premium noise-cancelling wireless headphones with 30-hour battery life and comfortable over-ear design.", price: "79.99", stock: 150, sku: "WBH001", active: true, created_at: now, updated_at: now },
    { id: 2, name: "USB-C Charging Cable 2m", description: "Durable braided USB-C to USB-C cable with fast charging support up to 100W.", price: "14.99", stock: 500, sku: "UCC002", active: true, created_at: now, updated_at: now },
    { id: 3, name: "Mechanical Keyboard RGB", description: "Full-size mechanical keyboard with Cherry MX Blue switches and per-key RGB backlighting.", price: "129.99", stock: 75, sku: "MKR003", active: true, created_at: now, updated_at: now },
    { id: 4, name: "Ergonomic Mouse Pad XL", description: "Extra-large mouse pad with memory foam wrist rest and non-slip rubber base.", price: "24.99", stock: 200, sku: "EMP004", active: true, created_at: now, updated_at: now },
    { id: 5, name: "4K Webcam Pro", description: "Ultra HD webcam with autofocus, built-in microphone, and privacy shutter.", price: "89.99", stock: 60, sku: "WCP005", active: true, created_at: now, updated_at: now },
    { id: 6, name: "Portable SSD 1TB", description: "Compact portable solid-state drive with USB 3.2 interface and read speeds up to 1050MB/s.", price: "109.99", stock: 90, sku: "PSD006", active: true, created_at: now, updated_at: now },
    { id: 7, name: "Monitor Stand Riser", description: "Adjustable aluminum monitor stand with USB hub and cable management.", price: "49.99", stock: 120, sku: "MSR007", active: false, created_at: now, updated_at: now },
    { id: 8, name: "Wireless Charging Pad", description: "Qi-certified wireless charging pad compatible with all Qi-enabled devices. 15W fast charge.", price: "19.99", stock: 300, sku: "WCP008", active: true, created_at: now, updated_at: now },
    { id: 9, name: "Laptop Cooling Stand", description: "Ergonomic laptop stand with dual fan cooling system and adjustable height.", price: "34.99", stock: 85, sku: "LCS009", active: true, created_at: now, updated_at: now },
    { id: 10, name: "Noise Cancelling Earbuds", description: "True wireless earbuds with active noise cancellation and IPX5 water resistance.", price: "59.99", stock: 200, sku: "NCE010", active: true, created_at: now, updated_at: now },
    { id: 11, name: "HDMI Cable 4K 3m", description: "High-speed HDMI 2.1 cable supporting 4K@120Hz and 8K@60Hz with eARC.", price: "12.99", stock: 400, sku: "HDM011", active: true, created_at: now, updated_at: now },
    { id: 12, name: "Desk Lamp LED Smart", description: "Smart LED desk lamp with adjustable color temperature and brightness. App controlled.", price: "44.99", stock: 0, sku: "DLS012", active: false, created_at: now, updated_at: now },
    { id: 13, name: "Webcam Ring Light", description: "Clip-on ring light for webcams with 3 color modes and 10 brightness levels.", price: "22.99", stock: 180, sku: "WRL013", active: true, created_at: now, updated_at: now },
    { id: 14, name: "USB Hub 7-Port", description: "Powered USB 3.0 hub with 7 ports and individual power switches. Includes AC adapter.", price: "29.99", stock: 110, sku: "UHB014", active: true, created_at: now, updated_at: now },
    { id: 15, name: "Cable Management Kit", description: "Complete cable management solution with clips, ties, sleeves, and adhesive mounts.", price: "16.99", stock: 250, sku: "CMK015", active: true, created_at: now, updated_at: now },
    { id: 16, name: "Bluetooth Speaker Mini", description: "Portable Bluetooth 5.3 speaker with 12-hour battery life and IPX7 waterproofing.", price: "39.99", stock: 140, sku: "BSM016", active: true, created_at: now, updated_at: now },
    { id: 17, name: "Privacy Screen Filter 27in", description: "Anti-glare privacy screen filter for 27-inch monitors. Reduces blue light emission.", price: "54.99", stock: 45, sku: "PSF017", active: false, created_at: now, updated_at: now },
    { id: 18, name: "Ethernet Adapter USB-C", description: "USB-C to Gigabit Ethernet adapter with LED indicators. Plug and play.", price: "18.99", stock: 160, sku: "EAU018", active: true, created_at: now, updated_at: now },
    { id: 19, name: "Keyboard Wrist Rest", description: "Premium memory foam keyboard wrist rest with cooling gel layer and non-slip base.", price: "21.99", stock: 190, sku: "KWR019", active: true, created_at: now, updated_at: now },
    { id: 20, name: "Docking Station USB-C", description: "12-in-1 USB-C docking station with dual HDMI, Ethernet, SD reader, and 100W PD.", price: "149.99", stock: 35, sku: "DSU020", active: true, created_at: now, updated_at: now },
    { id: 21, name: "Microphone Condenser USB", description: "Studio-quality USB condenser microphone with cardioid pattern. Includes pop filter.", price: "69.99", stock: 70, sku: "MCU021", active: true, created_at: now, updated_at: now },
    { id: 22, name: "Screen Cleaning Kit", description: "Professional screen cleaning kit with microfiber cloth and anti-static spray.", price: "9.99", stock: 350, sku: "SCK022", active: true, created_at: now, updated_at: now },
    { id: 23, name: "Power Strip Smart WiFi", description: "Smart WiFi power strip with 4 outlets and 2 USB ports. Voice assistant compatible.", price: "32.99", stock: 95, sku: "PSW023", active: true, created_at: now, updated_at: now },
    { id: 24, name: "Laptop Sleeve 15.6in", description: "Water-resistant laptop sleeve with shock-absorbing padding and accessory pocket.", price: "27.99", stock: 170, sku: "LSV024", active: false, created_at: now, updated_at: now },
    { id: 25, name: "Wireless Presenter Remote", description: "2.4GHz wireless presenter with laser pointer and slide navigation controls.", price: "24.99", stock: 80, sku: "WPR025", active: true, created_at: now, updated_at: now },
  ]
}

let mockProducts: Product[] = generateMockProducts()

export function getMockProducts() {
  return mockProducts
}

export function resetMockProducts() {
  mockProducts = generateMockProducts()
  nextId = 26
}

export function getNextId() {
  return nextId++
}

export function setMockProducts(products: Product[]) {
  mockProducts = products
}
