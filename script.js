let items = [];
let tempImgs = []; // ตัวแปรเก็บรูปภาพชั่วคราวตอนกรอกฟอร์ม Modal
let currentLang = 'th';

const translations = {
    th: { 
        title: "ระบบเปิดบิลด่วน", 
        add: "เพิ่มรายการ", 
        exportPdf: "ดาวน์โหลด PDF",
        modalTitleAdd: "เพิ่มสินค้า",
        modalTitleEdit: "แก้ไขสินค้า",
        save: "บันทึก",
        cancel: "ยกเลิก",
        model: "รุ่น",
        qty: "จำนวน",
        images: "รูปภาพ (Images)",
        takePhoto: "ถ่ายรูป",
        gallery: "คลังรูป",
        phName: "ชื่อสินค้า (Product Name)",
        phModel: "รุ่น (Model)",
        phQty: "จำนวน (Qty)",
        phNote: "หมายเหตุ (Note)"
    },
    cn: { 
        title: "快速订单系统", 
        add: "添加项目",
        exportPdf: "导出 PDF",
        modalTitleAdd: "添加产品",
        modalTitleEdit: "编辑产品",
        save: "保存",
        cancel: "取消",
        model: "型号",
        qty: "数量",
        images: "图片 (Images)",
        takePhoto: "拍照",
        gallery: "图库",
        phName: "产品名称 (Product Name)",
        phModel: "型号 (Model)",
        phQty: "数量 (Qty)",
        phNote: "备注 (Note)"
    },
    en: { 
        title: "Quick Order System", 
        add: "Add Item",
        exportPdf: "Export PDF",
        modalTitleAdd: "Add Product",
        modalTitleEdit: "Edit Product",
        save: "Save",
        cancel: "Cancel",
        model: "Model",
        qty: "Qty",
        images: "Images",
        takePhoto: "Take Photo",
        gallery: "Gallery",
        phName: "Product Name",
        phModel: "Model",
        phQty: "Qty",
        phNote: "Note"
    },
    my: { 
        title: "အမြန်မှာယူမှုစနစ်", 
        add: "ပစ္စည်းထည့်ရန်",
        exportPdf: "PDF ဒေါင်းလုဒ်လုပ်ရန်",
        modalTitleAdd: "ကုန်ပစ္စည်းထည့်ရန်",
        modalTitleEdit: "ကုန်ပစ္စည်းပြင်ရန်",
        save: "သိမ်းဆည်းမည်",
        cancel: "ပယ်ဖျက်မည်",
        model: "မော်ဒယ်",
        qty: "အရေအတွက်",
        images: "ရုပ်ပုံများ (Images)",
        takePhoto: "ဓာတ်ပုံရိုက်ရန်",
        gallery: "ဓာတ်ပုံပြခန်း",
        phName: "ကုန်ပစ္စည်းအမည် (Product Name)",
        phModel: "မော်ဒယ် (Model)",
        phQty: "အရေအတွက် (Qty)",
        phNote: "မှတ်ချက် (Note)"
    }
};

// --- Initialization ---
window.onload = () => {
    const savedItems = localStorage.getItem('warehouseItems');
    if (savedItems) {
        items = JSON.parse(savedItems);
    }
    
    const langSelect = document.getElementById('langSelect');
    langSelect.addEventListener('change', (e) => {
        currentLang = e.target.value;
        updateLanguage();
        renderCards();
    });
    
    updateLanguage();
    renderCards();
};

function updateLanguage() {
    const t = translations[currentLang];
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (t[key]) {
            el.innerText = t[key];
        }
    });
    
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (t[key]) {
            el.placeholder = t[key];
        }
    });
}

function saveToLocalStorage() {
    localStorage.setItem('warehouseItems', JSON.stringify(items));
}

// --- Image Processing ---
function resizeAndConvertImage(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 400; 
                let width = img.width;
                let height = img.height;
                
                if (width > MAX_WIDTH) {
                    const scaleSize = MAX_WIDTH / width;
                    width = MAX_WIDTH;
                    height = height * scaleSize;
                }
                
                canvas.width = width;
                canvas.height = height;
                
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL('image/jpeg', 0.7)); 
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
}

// เมื่อผู้ใช้เลือกไฟล์จากปุ่ม (กล้อง หรือ คลัง)
async function handleImageSelection(input) {
    if (input.files && input.files.length > 0) {
        // วนลูปอ่านทุกไฟล์และแปลงเป็น base64
        for (let file of input.files) {
            const base64 = await resizeAndConvertImage(file);
            tempImgs.push(base64);
        }
        renderModalImages();
    }
    // เคลียร์ค่า input เพื่อให้สามารถเลือกรูปเดิมซ้ำได้ในครั้งต่อไป
    input.value = '';
}

// แสดงรูปภาพแบบ Real-time ใน Modal
function renderModalImages() {
    const container = document.getElementById('modalImagesContainer');
    container.innerHTML = tempImgs.map((src, i) => `
        <div class="relative inline-block mt-2">
            <img src="${src}" class="img-thumbnail cursor-pointer border-2 border-gray-200 hover:border-blue-500 transition" onclick="openImageViewer('${src}')">
            <button type="button" onclick="removeTempImage(event, ${i})" class="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs -mt-2 -mr-2 shadow-md hover:bg-red-600 transition"><i class="fas fa-times"></i></button>
        </div>
    `).join('');
}

// ลบรูปภาพในขณะที่อยู่ใน Modal
function removeTempImage(event, index) {
    event.stopPropagation();
    if (confirm('ต้องการลบรูปนี้ใช่หรือไม่?')) {
        tempImgs.splice(index, 1);
        renderModalImages();
    }
}

// --- Modal & Form Logic ---
function toggleModal(show, index = -1) {
    document.getElementById('modal').classList.toggle('hidden', !show);
    const t = translations[currentLang];
    const modalTitle = document.getElementById('modalTitle');
    
    if (show) {
        if (index > -1) {
            // โหมดแก้ไข: โหลดข้อมูลและรูปเดิม
            const item = items[index];
            document.getElementById('itemName').value = item.name || '';
            document.getElementById('itemModel').value = item.model || '';
            document.getElementById('itemQty').value = item.qty || '';
            document.getElementById('itemNote').value = item.note || '';
            document.getElementById('editIndex').value = index;
            modalTitle.innerText = t.modalTitleEdit;
            modalTitle.setAttribute('data-i18n', 'modalTitleEdit');
            
            tempImgs = item.imgs ? [...item.imgs] : [];
        } else {
            // โหมดเพิ่ม: ล้างฟอร์มทั้งหมด
            document.getElementById('itemName').value = '';
            document.getElementById('itemModel').value = '';
            document.getElementById('itemQty').value = '';
            document.getElementById('itemNote').value = '';
            document.getElementById('editIndex').value = -1;
            modalTitle.innerText = t.modalTitleAdd;
            modalTitle.setAttribute('data-i18n', 'modalTitleAdd');
            
            tempImgs = [];
        }
        
        // เคลียร์ input รูปภาพและวาดรูปใน UI ใหม่
        document.getElementById('cameraInput').value = '';
        document.getElementById('galleryInput').value = '';
        renderModalImages();
    }
}

function saveItem() {
    const nameInput = document.getElementById('itemName');
    const qtyInput = document.getElementById('itemQty');
    const index = parseInt(document.getElementById('editIndex').value);

    const item = {
        name: nameInput.value.trim(),
        model: document.getElementById('itemModel').value.trim(),
        qty: qtyInput.value.trim(),
        note: document.getElementById('itemNote').value.trim(),
        imgs: [...tempImgs] // บันทึกรูปจากตัวแปรชั่วคราว
    };
    
    if(index > -1) {
        items[index] = item;
    } else {
        items.push(item);
    }
    
    saveToLocalStorage();
    renderCards();
    toggleModal(false);
}

function deleteItem(index) {
    if(confirm('ต้องการลบรายการนี้ใช่หรือไม่? / Are you sure?')) {
        items.splice(index, 1);
        saveToLocalStorage();
        renderCards();
    }
}

// --- Image Viewer Logic ---
function openImageViewer(src) {
    event.stopPropagation();
    document.getElementById('viewerImage').src = src;
    document.getElementById('imageViewerModal').classList.remove('hidden');
}

function closeImageViewer() {
    document.getElementById('imageViewerModal').classList.add('hidden');
}

// --- Rendering ---
function renderCards() {
    const container = document.getElementById('cardContainer');
    const t = translations[currentLang];
    
    container.innerHTML = items.map((item, index) => {
        let imgHtml = '';
        if (item.imgs && item.imgs.length > 0) {
            const imgTags = item.imgs.map(src => `<img src="${src}" class="img-thumbnail cursor-pointer hover:opacity-80 transition" alt="item" onclick="openImageViewer('${src}')">`).join('');
            imgHtml = `<div class="img-grid mt-3">${imgTags}</div>`;
        }
        
        return `
        <div class="card bg-white p-5 rounded-2xl shadow-sm hover:shadow-md border border-gray-100 flex flex-col relative overflow-hidden">
            <div class="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
            <div class="flex-grow">
                <div class="font-bold text-lg text-gray-800">${item.name || '-'}</div>
                <div class="text-sm text-gray-600 mt-1"><span class="font-medium">${t.model}:</span> ${item.model || '-'} | <span class="font-medium">${t.qty}:</span> ${item.qty || '-'}</div>
                ${item.note ? `<div class="text-xs text-gray-500 mt-2 bg-gray-50 p-2 rounded">หมายเหตุ: ${item.note}</div>` : ''}
                ${imgHtml}
            </div>
            <div class="mt-4 flex gap-2 justify-end border-t border-gray-50 pt-3">
                <button onclick="toggleModal(true, ${index})" class="text-blue-500 p-2 hover:bg-blue-50 rounded-lg transition" title="Edit"><i class="fas fa-edit"></i></button>
                <button onclick="deleteItem(${index})" class="text-red-500 p-2 hover:bg-red-50 rounded-lg transition" title="Delete"><i class="fas fa-trash"></i></button>
            </div>
        </div>
        `;
    }).join('');
}

// --- PDF Export ---
function downloadPDF() {
    const printArea = document.getElementById('printArea');
    
    // บังคับหัวข้อเป็น ไทย/จีน ตามโจทย์
    let html = `
        <div style="padding: 20px; font-family: sans-serif; background: white;">
            <h2 style="text-align:center; color: #333; margin-bottom: 20px; font-size: 24px;">รายการสินค้า (产品列表)</h2>
            <table class="pdf-table">
                <thead>
                    <tr>
                        <th width="30%">รูป (图片)</th>
                        <th width="25%">ชื่อสินค้า (产品名称)</th>
                        <th width="15%">รุ่น (型号)</th>
                        <th width="10%" style="text-align:center;">จำนวน (数量)</th>
                        <th width="20%">หมายเหตุ (备注)</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    items.forEach(item => {
        let imgsHtml = '<div style="text-align:center; color:#999;">-</div>';
        if (item.imgs && item.imgs.length > 0) {
            imgsHtml = item.imgs.map(src => `<img src="${src}" class="pdf-img">`).join(' ');
        }
        
        html += `
            <tr>
                <td style="text-align:center; vertical-align: middle;">${imgsHtml}</td>
                <td style="vertical-align: middle;">${item.name || '-'}</td>
                <td style="vertical-align: middle;">${item.model || '-'}</td>
                <td style="text-align:center; vertical-align: middle; font-weight: bold;">${item.qty || '-'}</td>
                <td style="vertical-align: middle;">${item.note || '-'}</td>
            </tr>
        `;
    });
    
    html += `
                </tbody>
            </table>
        </div>
    `;
    
    printArea.innerHTML = html;
    printArea.classList.remove('hidden'); 
    
    const opt = {
      margin:       10,
      filename:     'Warehouse_Order_System.pdf',
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    
    html2pdf().set(opt).from(printArea).save().then(() => {
        printArea.classList.add('hidden'); 
    });
}