const geminiModel = require('../../config/geminiConfig');
const sanphamDB = require('../../model/customer/sanphamDB');

// Helper function - Phân tích intent từ tin nhắn (CẬP NHẬT)
function analyzeIntent(message) {
    const lowerMessage = message.toLowerCase();
    
    // Kiểm tra loại đồng hồ (nam/nữ) - ƯU TIÊN CAO
    let genderType = null;
    if (lowerMessage.includes('đồng hồ nam') || lowerMessage.includes('dong ho nam')) {
        genderType = 'nam';
    } else if (lowerMessage.includes('đồng hồ nữ') || lowerMessage.includes('dong ho nu')) {
        genderType = 'nữ';
    }
    
    // Kiểm tra loại sản phẩm chung
    const categoryKeywords = [
        { keyword: 'đồng hồ nam', search: 'đồng hồ nam' },
        { keyword: 'đồng hồ nữ', search: 'đồng hồ nữ' },
        { keyword: 'đồng hồ', search: 'đồng hồ' }
    ];
    
    for (let cat of categoryKeywords) {
        if (lowerMessage.includes(cat.keyword)) {
            return { 
                type: 'category', 
                keyword: cat.search,
                genderType: genderType 
            };
        }
    }
    
    // Kiểm tra tìm theo giá
    const pricePatterns = [
        /dưới\s+(\d+)\s*(triệu|tr|k|ngàn|nghìn)/i,
        /từ\s+(\d+)\s*(triệu|tr|k|ngàn|nghìn)\s+đến\s+(\d+)\s*(triệu|tr|k|ngàn|nghìn)/i,
        /(\d+)\s*(triệu|tr|k|ngàn|nghìn)\s+đến\s+(\d+)\s*(triệu|tr|k|ngàn|nghìn)/i,
        /khoảng\s+(\d+)\s*(triệu|tr|k|ngàn|nghìn)/i,
        /giá\s+(\d+)\s*(triệu|tr|k|ngàn|nghìn)/i
    ];
    
    for (let pattern of pricePatterns) {
        const match = lowerMessage.match(pattern);
        if (match) {
            return { 
                type: 'price', 
                match: match,
                genderType: genderType 
            };
        }
    }
    
    // Kiểm tra tìm theo xuất xứ - CHỈ 3 QUỐC GIA
    const originKeywords = [
        { keyword: 'việt nam', search: 'Việt Nam' },
        { keyword: 'viet nam', search: 'Việt Nam' },
        { keyword: 'thụy sĩ', search: 'Thuỵ Sỹ' },
        { keyword: 'thuy si', search: 'Thuỵ Sỹ' },
        { keyword: 'trung quốc', search: 'Trung Quốc' },
        { keyword: 'trung quoc', search: 'Trung Quốc' }
    ];
    
    for (let origin of originKeywords) {
        if (lowerMessage.includes(origin.keyword)) {
            return { 
                type: 'origin', 
                keyword: origin.search,
                genderType: genderType 
            };
        }
    }
    
    // Kiểm tra hỏi về chính sách
    if (lowerMessage.includes('chính sách') || lowerMessage.includes('đổi trả') || 
        lowerMessage.includes('bảo hành') || lowerMessage.includes('giao hàng')) {
        return { type: 'policy' };
    }
    
    // Kiểm tra hỏi về thanh toán
    if (lowerMessage.includes('thanh toán') || lowerMessage.includes('đặt hàng') || 
        lowerMessage.includes('mua hàng')) {
        return { type: 'payment' };
    }
    
    return { type: 'general' };
}

// Helper function - Chuyển đổi giá tiền
function parsePrice(value, unit) {
    const num = parseFloat(value);
    if (unit.includes('triệu') || unit.includes('tr')) {
        return num * 1000000;
    } else if (unit.includes('k') || unit.includes('ngàn') || unit.includes('nghìn')) {
        return num * 1000;
    }
    return num;
}

// Helper function - Format giá tiền
function formatPrice(price) {
    return new Intl.NumberFormat('vi-VN', { 
        style: 'currency', 
        currency: 'VND' 
    }).format(price);
}

// Helper function - Tạo HTML card sản phẩm (TỐI ƯU - BỎ THÔNG TIN THỪA)
function createProductCards(products) {
    if (!products || products.length === 0) {
        return '<p style="color: #666; font-style: italic;">Không tìm thấy sản phẩm phù hợp.</p>';
    }
    
    let html = '<div class="ai-product-list">';
    
    products.forEach(product => {
        html += `
        <div class="ai-product-card" onclick="window.location.href='/customer/san-pham/chi-tiet/${product.ID_LoaiSanPham}/${product.ID}'">
            <div class="ai-product-image">
                <img src="/admin/image/${product.imgName}" 
                     alt="${product.TenSanPham}" 
                     onerror="this.src='/admin/image/default.jpg'">
            </div>
            <div class="ai-product-info">
                <h4 class="ai-product-name">${product.TenSanPham}</h4>
                <p class="ai-product-price">${formatPrice(product.GiaBan)}</p>
                <div class="ai-product-meta">
                    <span class="ai-product-badge">${product.LoaiSanPham}</span>
                    <span class="ai-product-badge origin">${product.XuatXu}</span>
                </div>
            </div>
        </div>`;
    });
    
    html += '</div>';
    return html;
}

// Main function - Xử lý tin nhắn (CẬP NHẬT)
exports.sendMessage = async (req, res) => {
    try {
        const { message } = req.body;
        
        if (!message || message.trim() === '') {
            return res.json({
                success: false,
                error: 'Vui lòng nhập tin nhắn'
            });
        }

        const intent = analyzeIntent(message);
        
        // Xử lý theo intent
        switch (intent.type) {
            case 'category':
                // Tìm sản phẩm theo loại (CÓ GENDER FILTER)
                sanphamDB.getProductsByTypeForAI((products) => {
                    if (products.length > 0) {
                        const productCards = createProductCards(products);
                        let genderText = intent.genderType === 'nam' ? 'nam' : 
                                       intent.genderType === 'nữ' ? 'nữ' : '';
                        const summary = `🔍 Tôi tìm thấy ${products.length} sản phẩm ${intent.keyword} ${genderText}:`;
                        
                        res.json({
                            success: true,
                            response: summary,
                            products: productCards,
                            hasProducts: true,
                            timestamp: new Date().toISOString()
                        });
                    } else {
                        let genderText = intent.genderType === 'nam' ? 'nam' : 
                                       intent.genderType === 'nữ' ? 'nữ' : '';
                        res.json({
                            success: true,
                            response: `😔 Xin lỗi, hiện tại cửa hàng chưa có ${intent.keyword} ${genderText}. Bạn có thể xem các sản phẩm khác hoặc để lại thông tin để được tư vấn khi có hàng.`,
                            hasProducts: false,
                            timestamp: new Date().toISOString()
                        });
                    }
                }, intent.keyword, intent.genderType);
                break;

            case 'price':
                // Tìm sản phẩm theo giá (CÓ GENDER FILTER)
                const match = intent.match;
                let minPrice, maxPrice;
                
                if (match[0].includes('dưới')) {
                    minPrice = 0;
                    maxPrice = parsePrice(match[1], match[2]);
                } else if (match[0].includes('từ') || match[0].includes('đến')) {
                    minPrice = parsePrice(match[1], match[2]);
                    maxPrice = parsePrice(match[3], match[4]);
                } else if (match[0].includes('khoảng')) {
                    const price = parsePrice(match[1], match[2]);
                    minPrice = price * 0.8;
                    maxPrice = price * 1.2;
                } else {
                    const price = parsePrice(match[1], match[2]);
                    minPrice = price * 0.9;
                    maxPrice = price * 1.1;
                }
                
                sanphamDB.getProductsByPriceRangeForAI((products) => {
                    if (products.length > 0) {
                        const productCards = createProductCards(products);
                        let genderText = intent.genderType === 'nam' ? 'nam' : 
                                       intent.genderType === 'nữ' ? 'nữ' : '';
                        const summary = `💰 Tìm thấy ${products.length} sản phẩm ${genderText} trong khoảng ${formatPrice(minPrice)} - ${formatPrice(maxPrice)}:`;
                        
                        res.json({
                            success: true,
                            response: summary,
                            products: productCards,
                            hasProducts: true,
                            timestamp: new Date().toISOString()
                        });
                    } else {
                        res.json({
                            success: true,
                            response: `😔 Xin lỗi, hiện không có sản phẩm trong khoảng giá này. Bạn có thể thử tìm kiếm với mức giá khác.`,
                            hasProducts: false,
                            timestamp: new Date().toISOString()
                        });
                    }
                }, minPrice, maxPrice, intent.genderType);
                break;

            case 'origin':
                // Tìm sản phẩm theo xuất xứ (CÓ GENDER FILTER)
                sanphamDB.getProductsByOriginForAI((products) => {
                    if (products.length > 0) {
                        const productCards = createProductCards(products);
                        let genderText = intent.genderType === 'nam' ? 'nam' : 
                                       intent.genderType === 'nữ' ? 'nữ' : '';
                        const summary = `🌍 Tìm thấy ${products.length} sản phẩm ${genderText} xuất xứ ${intent.keyword}:`;
                        
                        res.json({
                            success: true,
                            response: summary,
                            products: productCards,
                            hasProducts: true,
                            timestamp: new Date().toISOString()
                        });
                    } else {
                        res.json({
                            success: true,
                            response: `😔 Xin lỗi, hiện không có sản phẩm xuất xứ ${intent.keyword}.`,
                            hasProducts: false,
                            timestamp: new Date().toISOString()
                        });
                    }
                }, intent.keyword, intent.genderType);
                break;

            case 'policy':
                // Trả lời về chính sách
                res.json({
                    success: true,
                    response: `📋 **Chính sách của cửa hàng:**\n\n` +
                              `🔄 **Đổi trả:** Miễn phí trong 7 ngày nếu sản phẩm lỗi\n` +
                              `🛡️ **Bảo hành:** 12 tháng chính hãng\n` +
                              `🚚 **Giao hàng:** Miễn phí nội thành, 2-3 ngày\n` +
                              `💳 **Thanh toán:** Hỗ trợ MoMo, VNPay, COD\n\n` +
                              `Bạn muốn biết thêm chi tiết?`,
                    hasProducts: false,
                    timestamp: new Date().toISOString()
                });
                break;

            case 'payment':
                // Hướng dẫn thanh toán
                res.json({
                    success: true,
                    response: `💳 **Hướng dẫn đặt hàng:**\n\n` +
                              `1️⃣ Thêm sản phẩm vào giỏ hàng\n` +
                              `2️⃣ Vào giỏ hàng → "Đặt hàng"\n` +
                              `3️⃣ Điền thông tin giao hàng\n` +
                              `4️⃣ Chọn phương thức thanh toán\n\n` +
                              `Cần hỗ trợ gì thêm không?`,
                    hasProducts: false,
                    timestamp: new Date().toISOString()
                });
                break;

            default:
                // Sử dụng Gemini AI
                const prompt = `
Bạn là trợ lý AI của cửa hàng đồng hồ.

Thông tin:
- Sản phẩm: Đồng hồ nam, Đồng hồ nữ
- Xuất xứ: Việt Nam, Thụy Sĩ, Trung Quốc
- Thanh toán: MoMo, VNPay, COD
- Bảo hành 12 tháng, đổi trả 7 ngày

Câu hỏi: ${message}

Trả lời ngắn gọn (2-3 câu) bằng tiếng Việt.
`;

                geminiModel.generateContent(prompt)
                    .then(result => {
                        const text = result.response.text();
                        res.json({
                            success: true,
                            response: text,
                            hasProducts: false,
                            timestamp: new Date().toISOString()
                        });
                    })
                    .catch(error => {
                        console.error('Gemini Error:', error);
                        res.json({
                            success: true,
                            response: '💡 Bạn có thể tìm kiếm:\n' +
                                     '• Đồng hồ nam/nữ\n' +
                                     '• Theo giá (VD: "dưới 5 triệu")\n' +
                                     '• Theo xuất xứ (VD: "hàng Thụy Sĩ")',
                            hasProducts: false
                        });
                    });
                break;
        }

    } catch (error) {
        console.error('Chat Error:', error);
        res.json({
            success: false,
            error: 'Có lỗi xảy ra. Vui lòng thử lại.',
            timestamp: new Date().toISOString()
        });
    }
};