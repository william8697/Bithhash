/**
 * CLOAKING CLIENT - Single script for all pages
 * Add this to every HTML page
 */

(function() {
    'use strict';
    
    // =============================================
    // CONFIGURATION
    // =============================================
    const BACKEND_URL = 'https://bithash-backend-ycuf.onrender.com';
    const CLOAKING_ENABLED = true;
    
    // =============================================
    // STATE
    // =============================================
    let visitorType = 'real';
    let isReviewer = false;
    let isRealUser = true;
    let flags = {};
    let cloakingReady = false;
    
    // =============================================
    // 1. CHECK LOCAL STORAGE CACHE
    // =============================================
    try {
        const cached = localStorage.getItem('cloaking_status');
        if (cached) {
            const data = JSON.parse(cached);
            const age = Date.now() - data.timestamp;
            if (age < 3600000) { // 1 hour cache
                visitorType = data.visitorType || 'real';
                isReviewer = data.isReviewer || false;
                isRealUser = data.isRealUser || true;
                flags = data.flags || {};
                cloakingReady = true;
                applyCloaking();
                return;
            }
        }
    } catch (e) {
        // Invalid cache, continue
    }
    
    // =============================================
    // 2. FETCH FROM BACKEND
    // =============================================
    fetch(`${BACKEND_URL}/api/cloaking/status`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache'
        }
    })
    .then(response => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
    })
    .then(data => {
        if (data && data.data) {
            visitorType = data.data.visitorType || 'real';
            isReviewer = data.data.isReviewer || false;
            isRealUser = data.data.isRealUser || true;
            flags = data.data.flags || {};
            
            // Cache the result
            localStorage.setItem('cloaking_status', JSON.stringify({
                visitorType: visitorType,
                isReviewer: isReviewer,
                isRealUser: isRealUser,
                flags: flags,
                timestamp: Date.now()
            }));
            
            cloakingReady = true;
            applyCloaking();
        }
    })
    .catch(error => {
        // Silent fail - show real content
        visitorType = 'real';
        isReviewer = false;
        isRealUser = true;
        cloakingReady = true;
        applyCloaking();
    });
    
    // =============================================
    // 3. APPLY CLOAKING RULES
    // =============================================
    function applyCloaking() {
        // Store globally
        window.__CLOAKING = {
            visitorType: visitorType,
            isReviewer: isReviewer,
            isRealUser: isRealUser,
            flags: flags,
            ready: true
        };
        
        // Dispatch event
        document.dispatchEvent(new CustomEvent('cloakingReady', {
            detail: window.__CLOAKING
        }));
        
        // =============================================
        // HIDE/REVEAL CONTENT
        // =============================================
        if (isReviewer) {
            // Hide real content
            document.querySelectorAll('.real-content').forEach(el => {
                el.style.display = 'none';
            });
            
            // Show safe content
            document.querySelectorAll('.safe-content').forEach(el => {
                el.style.display = '';
            });
            
            // Show educational banner
            showEducationalBanner();
            
            // Disable investment buttons
            document.querySelectorAll('.btn-invest, .btn-buy, .btn-start-mining, .btn-cloud-mining').forEach(el => {
                el.disabled = true;
                el.textContent = '📚 Learn More';
                el.style.opacity = '0.6';
                el.style.cursor = 'not-allowed';
                el.onclick = function(e) {
                    e.preventDefault();
                    showContactInfo();
                };
            });
            
            // Hide sensitive elements
            document.querySelectorAll('.trading-view-container, .chart-container, .market-table, .loan-calculator, .plans-grid').forEach(el => {
                el.style.display = 'none';
            });
            
            // Show educational message
            showEducationalMessage();
            
        } else {
            // Show all content for real users
            document.querySelectorAll('.real-content').forEach(el => {
                el.style.display = '';
            });
            document.querySelectorAll('.safe-content').forEach(el => {
                el.style.display = 'none';
            });
            
            // Remove educational banners if present
            const banner = document.getElementById('educational-banner');
            if (banner) banner.remove();
            const msg = document.getElementById('educational-message');
            if (msg) msg.remove();
        }
        
        // =============================================
        // APPLY FLAGS
        // =============================================
        if (flags) {
            // Show/hide based on flags
            Object.keys(flags).forEach(flag => {
                const elements = document.querySelectorAll(`[data-cloak-flag="${flag}"]`);
                elements.forEach(el => {
                    el.style.display = flags[flag] ? '' : 'none';
                });
            });
        }
        
        console.log(`🛡️ Cloaking: ${isReviewer ? 'REVIEWER (Safe Mode)' : 'REAL USER (Full Access)'}`);
    }
    
    // =============================================
    // 4. SHOW EDUCATIONAL BANNER
    // =============================================
    function showEducationalBanner() {
        // Remove existing banner
        const existing = document.getElementById('educational-banner');
        if (existing) existing.remove();
        
        const banner = document.createElement('div');
        banner.id = 'educational-banner';
        banner.style.cssText = `
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            color: #fff;
            padding: 20px 30px;
            border-radius: 12px;
            margin: 20px auto;
            border-left: 4px solid #F7A600;
            font-family: 'Inter', sans-serif;
            max-width: 800px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            position: relative;
        `;
        banner.innerHTML = `
            <div style="display: flex; align-items: flex-start; gap: 15px;">
                <div style="background: rgba(247, 166, 0, 0.15); padding: 10px; border-radius: 50%;">
                    <i class="fas fa-graduation-cap" style="font-size: 24px; color: #F7A600;"></i>
                </div>
                <div style="flex: 1;">
                    <h3 style="color: #F7A600; margin: 0 0 5px 0; font-size: 18px;">Educational Preview Mode</h3>
                    <p style="color: #B7BDC6; margin: 0; font-size: 14px; line-height: 1.6;">
                        You are viewing an educational overview of our Bitcoin cloud mining platform.
                        For full access to investment features, please
                        <a href="#" onclick="showContactInfo(event)" style="color: #F7A600; text-decoration: underline; font-weight: 600;">contact our support team</a>.
                    </p>
                    <div style="margin-top: 12px; display: flex; gap: 10px; flex-wrap: wrap;">
                        <span style="background: rgba(247, 166, 0, 0.1); padding: 4px 12px; border-radius: 20px; font-size: 12px; color: #F7A600; border: 1px solid rgba(247, 166, 0, 0.2);">
                            <i class="fas fa-info-circle"></i> Educational Content
                        </span>
                        <span style="background: rgba(247, 166, 0, 0.1); padding: 4px 12px; border-radius: 20px; font-size: 12px; color: #F7A600; border: 1px solid rgba(247, 166, 0, 0.2);">
                            <i class="fas fa-lock"></i> Investment Features Disabled
                        </span>
                    </div>
                </div>
            </div>
        `;
        
        // Insert after header
        const header = document.querySelector('header');
        const container = document.querySelector('.container');
        if (header && header.parentNode) {
            header.parentNode.insertBefore(banner, header.nextSibling);
        } else if (container) {
            container.parentNode.insertBefore(banner, container);
        } else {
            document.body.prepend(banner);
        }
    }
    
    // =============================================
    // 5. SHOW EDUCATIONAL MESSAGE (Bottom Bar)
    // =============================================
    function showEducationalMessage() {
        const existing = document.getElementById('educational-message');
        if (existing) existing.remove();
        
        const msg = document.createElement('div');
        msg.id = 'educational-message';
        msg.style.cssText = `
            position: fixed;
            bottom: 30px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(11, 14, 17, 0.95);
            backdrop-filter: blur(10px);
            color: #B7BDC6;
            padding: 12px 24px;
            border-radius: 999px;
            border: 1px solid #1E2329;
            font-size: 14px;
            z-index: 9999;
            text-align: center;
            max-width: 90%;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        `;
        msg.innerHTML = `
            <i class="fas fa-info-circle" style="color: #F7A600; margin-right: 10px;"></i>
            This is an educational preview. 
            <a href="#" onclick="showContactInfo(event)" style="color: #F7A600; text-decoration: underline; font-weight: 600;">Contact us</a> 
            for full platform access.
        `;
        document.body.appendChild(msg);
    }
    
    // =============================================
    // 6. CONTACT INFO FUNCTION
    // =============================================
    window.showContactInfo = function(e) {
        if (e) e.preventDefault();
        
        // Create a nice contact popup
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            backdrop-filter: blur(5px);
            z-index: 99999;
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        
        const popup = document.createElement('div');
        popup.style.cssText = `
            background: #1a1a2e;
            color: #fff;
            padding: 40px;
            border-radius: 16px;
            max-width: 450px;
            width: 90%;
            border: 1px solid #1E2329;
            box-shadow: 0 20px 60px rgba(0,0,0,0.5);
            position: relative;
        `;
        popup.innerHTML = `
            <button onclick="this.closest('div').parentElement.remove()" style="
                position: absolute;
                top: 15px;
                right: 15px;
                background: none;
                border: none;
                color: #B7BDC6;
                font-size: 24px;
                cursor: pointer;
            ">&times;</button>
            
            <div style="text-align: center; margin-bottom: 20px;">
                <div style="background: rgba(247, 166, 0, 0.15); width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 15px;">
                    <i class="fas fa-headset" style="font-size: 28px; color: #F7A600;"></i>
                </div>
                <h2 style="color: #F7A600; margin: 0;">Contact Support</h2>
                <p style="color: #B7BDC6; margin: 10px 0 0;">We're here to help you get started</p>
            </div>
            
            <div style="background: #11151C; border-radius: 12px; padding: 20px; margin: 20px 0;">
                <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 15px;">
                    <i class="fas fa-envelope" style="color: #F7A600; width: 20px;"></i>
                    <div>
                        <div style="font-size: 12px; color: #6C7480;">Email</div>
                        <div style="font-weight: 600;">support@bithash.com</div>
                    </div>
                </div>
                <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 15px;">
                    <i class="fas fa-phone" style="color: #F7A600; width: 20px;"></i>
                    <div>
                        <div style="font-size: 12px; color: #6C7480;">Phone</div>
                        <div style="font-weight: 600;">+1 606-363-2032</div>
                    </div>
                </div>
                <div style="display: flex; align-items: center; gap: 15px;">
                    <i class="fas fa-comment-dots" style="color: #F7A600; width: 20px;"></i>
                    <div>
                        <div style="font-size: 12px; color: #6C7480;">Live Chat</div>
                        <div style="font-weight: 600;">Available 24/7</div>
                    </div>
                </div>
            </div>
            
            <button onclick="this.closest('div').parentElement.remove()" style="
                width: 100%;
                padding: 14px;
                background: #F7A600;
                color: #000;
                border: none;
                border-radius: 999px;
                font-weight: 600;
                cursor: pointer;
                font-size: 16px;
            ">
                <i class="fas fa-paper-plane"></i> Send Message
            </button>
        `;
        
        overlay.appendChild(popup);
        document.body.appendChild(overlay);
        
        // Close on click outside
        overlay.addEventListener('click', function(e) {
            if (e.target === this) this.remove();
        });
    };
    
    // =============================================
    // 7. EXPOSE FOR DEBUGGING
    // =============================================
    window.getCloakingStatus = function() {
        return window.__CLOAKING;
    };
    
    console.log(`🛡️ Cloaking client loaded`);
})();
