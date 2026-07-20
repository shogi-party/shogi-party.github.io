// ページング状態管理
let currentNoticeMode = 'summary'; // 'summary' (最新3件) または 'more' (10件ずつ)
let noticeDisplayCount = 3;
let blogDisplayCount = 3;
let currentBlogMode = 'summary'; // 'summary' (最新3件) または 'more' (5件ずつ)

window.addEventListener('DOMContentLoaded', () => {
    initContact();
    renderNotices();
    renderBlogs();
});

// スムーズスクロール制御
function scrollToSection(id) {
    const element = document.getElementById(id);
    if (element) {
        const offset = 120; // ヘッダーの高さ分のマージン
        const bodyRect = document.body.getBoundingClientRect().top;
        const elementRect = element.getBoundingClientRect().top;
        const elementPosition = elementRect - bodyRect;
        const offsetPosition = elementPosition - offset;

        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    }
}

// クラブ概要・連絡先の初期化
function initContact() {
    document.getElementById('main-title').innerText = contactData.title;
    document.getElementById('sub-title').innerText = contactData.subtitle;
    
    // クラブ概要
    const aboutContainer = document.getElementById('about-content');
    aboutContainer.innerHTML = `
        <div class="about-text">${contactData.about.text}</div>
        <img src="${contactData.about.image}" alt="クラブ概要画像" class="about-image" onerror="this.style.display='none'">
    `;
    
    // 連絡先
    document.getElementById('contact-content').innerHTML = contactData.contact;
}

// --- お知らせ制御 ---
function renderNotices() {
    const container = document.getElementById('notices-container');
    const paginationContainer = document.getElementById('notices-pagination');
    container.innerHTML = '';
    paginationContainer.innerHTML = '';

    let limit = currentNoticeMode === 'summary' ? 3 : noticeDisplayCount;
    const targetData = noticesData.slice(0, limit);

// --- お知らせ制御 ---（該当箇所の抜粋）

    targetData.forEach((notice, index) => {
        const item = document.createElement('div');
        item.className = 'item-summary';
        
        item.innerHTML = `
            <div class="notice-summary-click" style="cursor: pointer;">
                <div class="item-date">${notice.date}</div>
                <div class="item-title">${notice.title}</div>
            </div>
            <div id="notice-detail-${index}" class="item-detail hidden">${notice.content}</div>
        `;
        
        // 概要部分のクリックで開閉
        item.querySelector('.notice-summary-click').onclick = () => toggleNotice(index);

        // 【ここを修正】詳細部分のクリック処理
        item.querySelector('.item-detail').onclick = (e) => {
            // リンク（Aタグ）をクリックした場合は、親へのイベント伝播（開閉）だけを止めて元の挙動を維持
            if (e.target.tagName === 'A') {
                e.stopPropagation();
                return; // リンク移動をそのまま実行
            }
            // リンク以外のテキスト部分をクリックした場合も閉じるのを防ぐ
            e.stopPropagation();
        };

        container.appendChild(item);
    });

    // ボタン制御（変更なし）
    if (currentNoticeMode === 'summary') {
        if (noticesData.length > 3) {
            const btn = document.createElement('button');
            btn.className = 'more-btn';
            btn.innerText = 'お知らせをもっと見る';
            btn.onclick = () => {
                currentNoticeMode = 'more';
                noticeDisplayCount = 10;
                renderNotices();
            };
            paginationContainer.appendChild(btn);
        }
    } else {
        if (noticesData.length > noticeDisplayCount) {
            const btn = document.createElement('button');
            btn.className = 'more-btn';
            btn.innerText = '次の10件を表示';
            btn.onclick = () => {
                noticeDisplayCount += 10;
                renderNotices();
            };
            paginationContainer.appendChild(btn);
        }
    }
}

function toggleNotice(index) {
    const detail = document.getElementById(`notice-detail-${index}`);
    if (detail) {
        detail.classList.toggle('hidden');
    }
}

// --- ブログ制御 ---
function renderBlogs() {
    const container = document.getElementById('blogs-container');
    const paginationContainer = document.getElementById('blogs-pagination');
    container.innerHTML = '';
    paginationContainer.innerHTML = '';

    let limit = currentBlogMode === 'summary' ? 3 : blogDisplayCount;
    const targetData = blogsData.slice(0, limit);

    targetData.forEach((blog, index) => {
        const item = document.createElement('div');
        item.className = 'item-summary';
        
        const plainText = blog.content.replace(/<[^>]*>/g, ''); 
        const summaryText = plainText.length > 80 ? plainText.substring(0, 80) + '...' : plainText;

        // --- サムネイル画像の処理 ---
        // 画像配列の1枚目があれば使用し、なければ空文字にする
        const thumbImg = blog.images && blog.images.length > 0 
            ? `<img src="${blog.images[0].src}" alt="${blog.images[0].alt || 'ブログ画像'}" class="blog-thumbnail">` 
            : '';

        // --- 詳細部分の画像リストを生成 ---
        // 画像がある場合のみ、imgタグとcaptionタグをペアで作成する
        const detailImagesHtml = (blog.images && blog.images.length > 0) 
            ? blog.images.map(img => `
                <img src="${img.src}" alt="${img.alt || ''}" class="blog-full-image">
                <div class="image-caption">${img.alt || ''}</div>
              `).join('') 
            : '';

        item.innerHTML = `
            <div class="blog-flex blog-summary-wrapper">
                ${thumbImg}
                <div class="blog-body">
                    <div class="item-date">${blog.date}</div>
                    <div class="item-title">${blog.title}</div>
                    <p class="blog-summary-text">${summaryText}</p> 
                </div>
            </div>
            <div id="blog-detail-${index}" class="item-detail hidden">
                <p>${blog.content}</p>
                ${detailImagesHtml}
            </div>
        `;

        item.onclick = () => handleBlogClick(blog, index);
        container.appendChild(item);
    });

    // ボタン制御（変更なし）
    if (currentBlogMode === 'summary') {
        if (blogsData.length > 3) {
            const btn = document.createElement('button');
            btn.className = 'more-btn';
            btn.innerText = 'ブログをもっと見る';
            btn.onclick = () => {
                currentBlogMode = 'more';
                blogDisplayCount = 5;
                renderBlogs();
            };
            paginationContainer.appendChild(btn);
        }
    } else {
        if (blogsData.length > blogDisplayCount) {
            const btn = document.createElement('button');
            btn.className = 'more-btn';
            btn.innerText = '次の5件を表示';
            btn.onclick = () => {
                blogDisplayCount += 5;
                renderBlogs();
            };
            paginationContainer.appendChild(btn);
        }
    }
}

function handleBlogClick(blog, index) {
    const viewBox = document.getElementById('blog-content-view');

    if (blog.link && blog.link.trim() !== '') {
        // 単独のHTMLファイルがある場合の処理（変更なし）
        viewBox.innerHTML = `
            <div class="blog-view-box">
                <h3>${blog.title}</h3>
                <div class="item-date" style="margin-bottom:10px;">${blog.date}</div>
                <iframe src="${blog.link}" width="100%" height="500" frameborder="0" style="border:1px solid #ccc; background:#fff;"></iframe>
                <button class="blog-view-close" onclick="closeBlogView()">閉じる</button>
            </div>
        `;
        viewBox.classList.remove('hidden');
        scrollToSection('blog-content-view');
    } else {
        // 【ここを修正】アコーディオン展開時の処理
        const detail = document.getElementById(`blog-detail-${index}`);
        if (detail) {
            // 1. 詳細部分の表示/非表示を切り替える
            const isHidden = detail.classList.toggle('hidden');
            
            // 2. 親要素（item）の中から「概要テキスト」だけを探して、詳細とは逆の状態にする
            // detailの兄弟要素である .blog-summary-wrapper の中から探します
            const summaryWrapper = detail.previousElementSibling;
            if (summaryWrapper) {
                const summaryTextElement = summaryWrapper.querySelector('.blog-summary-text');
                if (summaryTextElement) {
                    // 詳細が表示された(isHidden=false)なら、概要を隠す(hidden=true)
                    summaryTextElement.classList.toggle('hidden', !isHidden);
                }
            }
        }
    }
}

function handleBlogClick(blog, index) {
    const viewBox = document.getElementById('blog-content-view');

    if (blog.link && blog.link.trim() !== '') {
        // 単独のHTMLファイルがある場合の処理（変更なし）
        viewBox.innerHTML = `
            <div class="blog-view-box">
                <h3>${blog.title}</h3>
                <div class="item-date" style="margin-bottom:10px;">${blog.date}</div>
                <iframe src="${blog.link}" width="100%" height="500" frameborder="0" style="border:1px solid #ccc; background:#fff;"></iframe>
                <button class="blog-view-close" onclick="closeBlogView()">閉じる</button>
            </div>
        `;
        viewBox.classList.remove('hidden');
        scrollToSection('blog-content-view');
    } else {
        // 【ここを修正】アコーディオン展開時の処理
        const detail = document.getElementById(`blog-detail-${index}`);
        if (detail) {
            // 1. 詳細部分の表示/非表示を切り替える
            const isHidden = detail.classList.toggle('hidden');
            
            // 2. 親要素（item）の中から「概要テキスト」だけを探して、詳細とは逆の状態にする
            // detailの兄弟要素である .blog-summary-wrapper の中から探します
            const summaryWrapper = detail.previousElementSibling;
            if (summaryWrapper) {
                const summaryTextElement = summaryWrapper.querySelector('.blog-summary-text');
                if (summaryTextElement) {
                    // 詳細が表示された(isHidden=false)なら、概要を隠す(hidden=true)
                    summaryTextElement.classList.toggle('hidden', !isHidden);
                }
            }
        }
    }
}


function closeBlogView() {
    const viewBox = document.getElementById('blog-content-view');
    viewBox.classList.add('hidden');
    viewBox.innerHTML = '';
    scrollToSection('blogs-section');
}
