document.addEventListener('DOMContentLoaded', function() {
    // 主題切換
    const themeToggle = document.querySelector('.theme-toggle');
    const body = document.body;
    
    function setTheme(theme) {
        if (theme === 'dark') {
            body.classList.remove('light-theme');
            body.classList.add('dark-theme');
            localStorage.setItem('theme', 'dark');
        } else {
            body.classList.remove('dark-theme');
            body.classList.add('light-theme');
            localStorage.setItem('theme', 'light');
        }
    }

    const savedTheme = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    setTheme(savedTheme);

    themeToggle.addEventListener('click', () => {
        const currentTheme = body.classList.contains('dark-theme') ? 'dark' : 'light';
        setTheme(currentTheme === 'dark' ? 'light' : 'dark');
    });

// 移動端選單切換
    const menuToggle = document.querySelector('.menu-toggle');
    const navList = document.querySelector('.nav-list');
    const mainNav = document.querySelector('.main-nav');
    if (menuToggle && navList) {
        menuToggle.addEventListener('click', () => {
            navList.classList.toggle('active');
            const isExpanded = navList.classList.contains('active');
            menuToggle.setAttribute('aria-expanded', isExpanded);
        });
    }

    // 菜單切換功能
    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', function() {
            mainNav.classList.toggle('active');
            const isExpanded = mainNav.classList.contains('active');
            menuToggle.setAttribute('aria-expanded', isExpanded);
        });
    }
    // 點擊菜單項後關閉菜單 (在移動設備上)
    if (navList) {
        navList.addEventListener('click', function(e) {
            if (e.target.tagName === 'A' && window.innerWidth <= 768) {
                mainNav.classList.remove('active');
                menuToggle.setAttribute('aria-expanded', false);
            }
        });
    }
    // 監聽窗口大小變化，在大屏幕模式下重置菜單狀態
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            mainNav.classList.remove('active');
            menuToggle.setAttribute('aria-expanded', false);
        }
    });
    //更新導航高亮
    function updateActiveNavItem() {
        const currentPath = window.location.pathname.split('/').pop() || 'index.html';
        document.querySelectorAll('.nav-list a').forEach(link => {
            if (link.getAttribute('href') === currentPath) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }


// 确保在页面加载完成后调用此函数
document.addEventListener('DOMContentLoaded', updateActiveNavItem);

// 如果使用了 AJAX 进行页面切换，在切换完成后也要调用此函数
// 例如：在页面切换的 AJAX 回调中添加 updateActiveNavItem();

    // 公告滑動
    const announcementWrapper = document.getElementById('announcementWrapper');
    const prevButton = document.querySelector('.announcement-nav-btn.prev');
    const nextButton = document.querySelector('.announcement-nav-btn.next');
    let currentIndex = 0;
    let announcements = [];

    async function fetchAnnouncements() {
        try {
            const response = await fetch('https://fssa.vic0407lu.workers.dev/api/announcements');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            announcements = await response.json();
            displayAnnouncements(announcements);
        } catch (error) {
            console.error('獲取公告時出錯:', error);
            displayError('無法載入公告，請稍後再試。');
        }
    }
    
    function displayAnnouncements(announcements) {
        if (!announcementWrapper) return;
        announcementWrapper.innerHTML = '';
        announcements.forEach((announcement, index) => {
            const announcementItem = document.createElement('div');
            announcementItem.classList.add('announcement-item');
            announcementItem.innerHTML = `
                <h3>${announcement.title}</h3>
                <p>${announcement.content.substring(0, 100)}${announcement.content.length > 100 ? '...' : ''}</p>
                <small>${new Date(announcement.date).toLocaleDateString()}</small>
                <div class="announcement-preview">
                    ${announcement.images && announcement.images.length ? `<span class="preview-icon"><i class="fas fa-image"></i> ${announcement.images.length}</span>` : ''}
                    ${announcement.attachments && announcement.attachments.length ? `<span class="preview-icon"><i class="fas fa-paperclip"></i> ${announcement.attachments.length}</span>` : ''}
                </div>
            `;
            announcementItem.addEventListener('click', () => openModal(index));
            announcementWrapper.appendChild(announcementItem);
        });
        updateCarousel();
    }

    function displayError(message) {
        if (announcementWrapper) {
            announcementWrapper.innerHTML = `<p class="error-message">${message}</p>`;
        }
    }
    
    function updateCarousel() {
        if (!announcementWrapper) return;
        const itemWidth = announcementWrapper.offsetWidth;
        announcementWrapper.style.transform = `translateX(-${currentIndex * itemWidth}px)`;
        updateNavButtons();
    }

    function updateNavButtons() {
        if (prevButton) prevButton.disabled = currentIndex === 0;
        if (nextButton) nextButton.disabled = currentIndex === announcements.length - 1;
    }

    if (prevButton) {
        prevButton.addEventListener('click', () => {
            if (currentIndex > 0) {
                currentIndex--;
                updateCarousel();
            }
        });
    }

    if (nextButton) {
        nextButton.addEventListener('click', () => {
            if (currentIndex < announcements.length - 1) {
                currentIndex++;
                updateCarousel();
            }
        });
    }

    function openModal(index) {
        const modal = document.getElementById('announcementModal');
        const modalContent = modal.querySelector('.modal-content');
        const announcement = announcements[index];
        
        modalContent.innerHTML = `
            <span class="close-modal">&times;</span>
            <h2>${announcement.title}</h2>
            <small>${new Date(announcement.date).toLocaleDateString()}</small>
            <div class="modal-body">
                <p>${announcement.content}</p>
                <div id="modalImageGallery" class="modal-image-gallery"></div>
                <div id="modalAttachments" class="modal-attachments"></div>
            </div>
        `;
        
        const modalImageGallery = document.getElementById('modalImageGallery');
        const modalAttachments = document.getElementById('modalAttachments');
        
        if (announcement.images && announcement.images.length > 0) {
            modalImageGallery.innerHTML = `
                <h3>圖片</h3>
                <div class="image-gallery">
                    ${announcement.images.map(imgUrl => `
                        <div class="image-thumbnail">
                            <img src="${imgUrl}" alt="公告圖片" loading="lazy" onclick="openLightbox('${imgUrl}')">
                        </div>
                    `).join('')}
                </div>
            `;
        }
        
        if (announcement.attachments && announcement.attachments.length > 0) {
            modalAttachments.innerHTML = `
                <h3>附件</h3>
                <ul class="attachment-list">
                    ${announcement.attachments.map(att => {
                        const fileName = att.filename || '未命名檔案';
                        const fileExtension = fileName.split('.').pop().toLowerCase();
                        const iconClass = getFileIconClass(fileExtension);
                        return `<li>
                            <a href="${att.url}" target="_blank" rel="noopener noreferrer">
                                <i class="${iconClass}"></i> ${fileName}
                            </a>
                        </li>`;
                    }).join('')}
                </ul>
            `;
        }
        
        modal.classList.add('active');
        
        const closeModal = modalContent.querySelector('.close-modal');
        closeModal.addEventListener('click', () => modal.classList.remove('active'));

        modal.addEventListener('click', (event) => {
            if (event.target === modal) {
                modal.classList.remove('active');
            }
        });
    }

    function getFileIconClass(extension) {
        const iconMap = {
            'pdf': 'fas fa-file-pdf',
            'doc': 'fas fa-file-word',
            'docx': 'fas fa-file-word',
            'xls': 'fas fa-file-excel',
            'xlsx': 'fas fa-file-excel',
            'ppt': 'fas fa-file-powerpoint',
            'pptx': 'fas fa-file-powerpoint',
            'jpg': 'fas fa-file-image',
            'jpeg': 'fas fa-file-image',
            'png': 'fas fa-file-image',
            'gif': 'fas fa-file-image',
            'zip': 'fas fa-file-archive',
            'rar': 'fas fa-file-archive',
            'txt': 'fas fa-file-alt',
        };
        return iconMap[extension] || 'fas fa-file';
    }

    // 燈箱功能
    window.openLightbox = function(imgUrl) {
        const lightbox = document.createElement('div');
        lightbox.classList.add('lightbox');
        lightbox.innerHTML = `
            <span class="close-lightbox">&times;</span>
            <img src="${imgUrl}" alt="公告圖片全圖">
        `;
        document.body.appendChild(lightbox);
        
        lightbox.addEventListener('click', (e) => {
            if (e.target !== e.currentTarget) return;
            document.body.removeChild(lightbox);
        });
        
        const closeLightbox = lightbox.querySelector('.close-lightbox');
        closeLightbox.addEventListener('click', () => document.body.removeChild(lightbox));
    }

    // 獲取並顯示公告
    fetchAnnouncements();

    // 可愛元素點擊效果
    const cuteElement = document.getElementById('cuteElement');
    if (cuteElement) {
        const emojis = ['🐾', '🎓', '📚', '🖋️', '🍎'];
        let currentEmojiIndex = 0;
        cuteElement.addEventListener('click', () => {
            currentEmojiIndex = (currentEmojiIndex + 1) % emojis.length;
            cuteElement.textContent = emojis[currentEmojiIndex];
            cuteElement.style.transform = 'scale(1.2) rotate(10deg)';
            setTimeout(() => {
                cuteElement.style.transform = 'scale(1) rotate(0deg)';
            }, 300);
        });
    }

    // 平滑滾動到頁面頂部
    function scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    // 創建"回到頂部"按鈕
    const scrollTopButton = document.createElement('button');
    scrollTopButton.textContent = '↑';
    scrollTopButton.classList.add('scroll-top-btn');
    scrollTopButton.addEventListener('click', scrollToTop);
    document.body.appendChild(scrollTopButton);

    // 顯示/隱藏"回到頂部"按鈕
    window.addEventListener('scroll', () => {
        scrollTopButton.classList.toggle('show', window.pageYOffset > 300);
    });

    // 簡化的頁面切換
    document.querySelectorAll('a').forEach(link => {
        if (link.hostname === window.location.hostname) {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                document.body.style.opacity = '0';
                setTimeout(() => {
                    window.location = this.href;
                }, 100);
            });
        }
    });

    // 頁面載入完成後的淡入效果
    document.body.style.opacity = '1';

    // 監聽窗口大小變化，更新輪播
    window.addEventListener('resize', updateCarousel);
});