// =========================================================================
// 🛒 ENGINE EKOSISTEM EKONOMI: EDU, GIFT, AVATAR & BADGES SHOP (VERSI LENGKAP)
// =========================================================================

// --- PEMBOLEHUBAH GLOBAL AM ---
let adminInventoryData = [];
let adminAllClaimsData = []; 
let cachedUserClaims = null; // Cache global untuk elak baca Firebase berulang kali

// ==========================================
// 🛠️ HELPER: JANA KOD PENEBUSAN UNIK RAWAK
// ==========================================
function generateRedemptionCode(prefix = "TXT") {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Elak karakter mengelirukan
    let code = "";
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `${prefix}-${Math.floor(100 + Math.random() * 900)}-${code}`;
}

// ==========================================
// 🧭 1. FUNGSI NAVIGASI TAB KEDAI MURID
// ==========================================
function switchShopTab(tabName) {
    if (window.Trackers) Trackers.rekodBukaKedai();

    // 1. Sembunyikan semua konten shop
    document.querySelectorAll('.shop-section').forEach(el => {
        el.classList.add('hidden');
    });
    
    // 2. Reset warna semua butang tab
    document.querySelectorAll('.shop-tab-btn').forEach(btn => {
        btn.classList.remove('bg-indigo-600', 'text-white', 'shadow-sm');
        btn.classList.add('bg-gray-200', 'text-gray-500');
    });

    // 3. Tunjukkan konten tab yang aktif
    const activeSection = document.getElementById(`shop-content-${tabName}`);
    if (activeSection) activeSection.classList.remove('hidden');

    // 4. Warnakan butang tab yang aktif
    const activeBtn = document.getElementById(`tab-btn-${tabName}`);
    if (activeBtn) {
        activeBtn.classList.remove('bg-gray-200', 'text-gray-500');
        activeBtn.classList.add('bg-indigo-600', 'text-white', 'shadow-sm');
    }

    // 5. Muatkan data berdasarkan tab yang diklik
    if (tabName === 'edu') {
        loadShopInventory('edu'); 
    } 
    else if (tabName === 'gift') {
        loadShopInventory('gift'); 
    } 
    else if (tabName === 'avatar') {
        if (typeof loadAvatarShop === 'function') loadAvatarShop(); 
    } 
    else if (tabName === 'badge') {
        if (typeof loadMedalShop === 'function') loadMedalShop(); 
    }
    
    localStorage.setItem('lastShopTab', tabName);
}

// ==========================================
// 🛒 VARIABLE CACHE KEDAI (TAMBAH DI LUAR FUNGSI)
// ==========================================
let shopCacheTemp = {
    dataPenuh: [],
    masaTarikanTerakhir: 0
};

// ==========================================
// 🛍️ 2. PAPARAN KEDAI (EDU SHOP & GIFT SHOP)
// ==========================================
async function loadShopInventory(kategoriPilihan = 'edu') {
    // Tentukan kontena mana yang mahu dilukis
    const containerId = (kategoriPilihan === 'gift') ? 'gift-shop-items' : 'edu-shop-items';
    const container = document.getElementById(containerId); 
    
    if (!container) return;

    const currentTime = Date.now();
    const cacheValidTime = 5 * 60 * 1000; // Cache tahan 5 minit

    // 🛡️ GATEKEEPER CACHE 🛡️
    // Jika data dah ada dan belum expired, LUKIS TERUS DARI CACHE (0 Reads!)
    if (shopCacheTemp.dataPenuh.length > 0 && (currentTime - shopCacheTemp.masaTarikanTerakhir) < cacheValidTime) {
        console.log(`Kedai: Lukis ${kategoriPilihan} dari Cache (Zero Reads)`);
        renderInventoryHTML(kategoriPilihan, container);
        return; // HENTIKAN proses. Jangan panggil Firebase!
    }

    container.innerHTML = `
        <div class="text-center col-span-full py-10 text-gray-500">
            <i class="fas fa-spinner fa-spin text-3xl mb-2 text-indigo-600"></i>
            <p>Menyemak stok kedai dari Firebase...</p>
        </div>`;

    try {
        // 🔥 KITA TARIK SEMUA BARANG SEKALIGUS (BUANG .where("category")) 🔥
        const snapshot = await db.collection("eduItems").get();
        
        // Kosongkan cache lama
        shopCacheTemp.dataPenuh = [];
        
        snapshot.forEach(doc => {
            shopCacheTemp.dataPenuh.push(doc.data());
        });

        // Kemaskini masa tarikan
        shopCacheTemp.masaTarikanTerakhir = currentTime;

        // Panggil fungsi melukis HTML
        renderInventoryHTML(kategoriPilihan, container);

    } catch (e) {
        console.error("Ralat load kedai:", e);
        container.innerHTML = `<p class="text-center col-span-full py-10 text-red-500">Gagal memuatkan kedai.</p>`;
    }
}

// 🎨 FUNGSI MELUKIS HTML (DIPISAHKAN SUPAYA BOLEH DIPANGGIL OLEH CACHE)
function renderInventoryHTML(kategoriPilihan, container) {
    // Tapis barang dari ARRAY CACHE, BUKAN dari Firebase
    const itemsToDisplay = shopCacheTemp.dataPenuh.filter(item => item.category === kategoriPilihan);

    if (itemsToDisplay.length === 0) {
        container.innerHTML = `
            <div class="text-center col-span-full py-10 text-gray-400">
                <i class="fas fa-box-open text-5xl mb-3 text-gray-300"></i>
                <h3 class="font-bold text-lg">Kedai Masih Kosong</h3>
            </div>`;
        return;
    }

    let html = "";
    itemsToDisplay.forEach(item => {
        const isOutOfStock = item.stock <= 0;
        
        // ==========================================
        // ✨ LOGIK LTE: SEMAK & KIRA DISKAUN KEDAI
        // ==========================================
        let hargaPapar = item.price;
        let ribonDiskaunHTML = ""; 

        if (typeof currentActiveEvent !== 'undefined' && currentActiveEvent !== null && currentActiveEvent.rewardType === 'shop_discount') {
            const kadarDiskaun = currentActiveEvent.rewardValue; // Cth: 0.5 (50%)
            hargaPapar = Math.floor(item.price * kadarDiskaun);
            
            // Bina ribon diskaun di penjuru kiri kad
            const peratusPotongan = (1 - kadarDiskaun) * 100;
            ribonDiskaunHTML = `
                <div class="absolute top-3 left-[-25px] bg-red-500 text-white text-[9px] font-black px-8 py-1.5 -rotate-45 shadow-sm z-10 animate-pulse">
                    -${peratusPotongan}%
                </div>
            `;
        }
        
        // Tentukan fungsi butang (Hantar 'item.price' harga asal. Fungsi processShopPurchase akan kira semula demi keselamatan)
        const actionClick = kategoriPilihan === 'gift' 
            ? `processShopPurchase('${item.id}', '${item.name}', ${item.price}, 'gift')`
            : `processShopPurchase('${item.id}', '${item.name}', ${item.price}, 'self')`;

        html += `
        <div class="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 flex flex-col items-center text-center relative overflow-hidden hover:shadow-md transition-shadow">
            ${isOutOfStock ? `<div class="absolute top-3 right-[-25px] bg-red-500 text-white text-[10px] font-black px-8 py-1.5 rotate-45 z-10">HABIS</div>` : ''}
            ${ribonDiskaunHTML} <div class="w-14 h-14 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center text-2xl mb-2">
                <i class="${item.icon || 'fas fa-gift'}"></i>
            </div>
            <h4 class="font-bold text-gray-800 text-xs mb-1">${item.name}</h4>
            <p class="text-[9px] text-gray-400 mb-3 h-8 overflow-hidden">${item.desc || ''}</p>
            
            <div class="w-full flex justify-between items-center mt-auto pt-2 border-t">
                
                <div class="font-black flex flex-col items-start gap-0.5 text-xs">
                    <div class="text-yellow-600 flex items-center gap-1">
                        <i class="fas fa-coins"></i> ${hargaPapar}
                    </div>
                    ${hargaPapar < item.price ? `<span class="text-[9px] text-gray-400 line-through ml-1">${item.price}</span>` : ''}
                </div>

                <span class="text-[9px] font-bold px-2 py-0.5 rounded ${isOutOfStock ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-600'}">
                    Stok: ${item.stock}
                </span>
            </div>

            <button 
                onclick="${actionClick}" 
                class="mt-3 w-full py-2 rounded-xl font-bold text-xs transition-all ${isOutOfStock ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md'}"
                ${isOutOfStock ? 'disabled' : ''}>
                ${isOutOfStock ? 'STOK KOSONG' : (kategoriPilihan === 'gift' ? '🎁 HADIAHKAN RAKAN' : '🛍️ BELI SEKARANG')}
            </button>
        </div>`;
    });
    
    container.innerHTML = html;
}

// ==========================================
// 📥 3. LOGIK PEMBELIAN & PENJANAAN KOD 
// ==========================================
async function processShopPurchase(itemID, itemName, price, purchaseType = 'self') {
    // ==========================================
    // ✨ LOGIK LTE: ANTI-CHEAT PENGIRAAN HARGA
    // ==========================================
    let finalPrice = price; // Anggap 'price' adalah harga asal (100%)
    let isDiscounted = false;

    // Semak dan potong harga secara paksa jika event diskaun sedang aktif
    if (typeof currentActiveEvent !== 'undefined' && currentActiveEvent !== null && currentActiveEvent.rewardType === 'shop_discount') {
        const kadarDiskaun = currentActiveEvent.rewardValue;
        finalPrice = Math.floor(price * kadarDiskaun);
        isDiscounted = true;
        console.log(`🛡️ [Sistem Kedai] Diskaun aktif dikesan. Harga asal ${price} diselaraskan ke ${finalPrice}.`);
    }

    // 0. SEMAKAN BAKI SYILING (Gunakan finalPrice, BUKAN price asal)
    if (localPlayerData.coins < finalPrice) {
        return Swal.fire('🪙 Koin Tidak Cukup!', `Anda perlukan ${finalPrice} koin untuk transaksi ini!`, 'error');
    }

    try {
        // 1. Semak stok terkini terus dari Firestore (Anti-Cheat)
        const itemDoc = await db.collection("eduItems").doc(itemID).get();
        if (!itemDoc.exists || itemDoc.data().stock <= 0) {
            Swal.fire('📦 Habis Stok!', 'Alamak, barang ini baru sahaja habis dijual!', 'warning');
            loadShopInventory(purchaseType === 'gift' ? 'gift' : 'edu');
            return;
        }

        let targetStudentName = localPlayerData.name.trim().toUpperCase();
        let receiverDocId = `${localPlayerData.school || 'SK_DEFAULT'}_${localPlayerData.class || '-'}_${targetStudentName}`.replace(/\s+/g, '_');
        let notificationMsg = "";

        // 2. Logik Khas Jika Membeli Sebagai Hadiah (Social Gifting)
        if (purchaseType === 'gift') {
            const playersSnap = await db.collection("players")
                .where("school", "==", localPlayerData.school || "SK_DEFAULT")
                .where("class", "==", localPlayerData.class || "-")
                .get();

            if (playersSnap.empty) return Swal.fire('Ralat', 'Tiada murid lain ditemui dalam kelas anda.', 'error');

            let optionsHtml = {};
            playersSnap.forEach(pDoc => {
                const pData = pDoc.data();
                if (pData.name !== localPlayerData.name) { // Jangan senaraikan diri sendiri
                    optionsHtml[pDoc.id] = pData.name.toUpperCase();
                }
            });

            if (Object.keys(optionsHtml).length === 0) {
                return Swal.fire('Info', 'Anda adalah satu-satunya murid di dalam kelas ini buat masa sekarang!', 'info');
            }

            const { value: selectedPlayerDocId } = await Swal.fire({
                title: '🎁 PILIH PENERIMA HADIAH',
                input: 'select',
                inputOptions: optionsHtml,
                inputPlaceholder: 'Pilih nama rakan sekelas...',
                showCancelButton: true,
                confirmButtonColor: '#4f46e5'
            });

            if (!selectedPlayerDocId) return; // Batal pembelian jika tidak pilih rakan

            receiverDocId = selectedPlayerDocId;
            targetStudentName = optionsHtml[selectedPlayerDocId];
            notificationMsg = `Anda mendapat hadiah ${itemName} daripada ${localPlayerData.name.toUpperCase()}! 🎉`;
        } else {
            // Confirm popup untuk beli sendiri (Paparkan harga akhir kepada murid)
            const confirmResult = await Swal.fire({
                title: 'Sahkan Pembelian',
                text: `Beli ${itemName} dengan harga ${finalPrice} koin? ${isDiscounted ? '(✨ Harga Diskaun!)' : ''}`,
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Ya, Beli!',
                confirmButtonColor: '#4f46e5'
            });
            if (!confirmResult.isConfirmed) return;
        }

        // 3. TOLAK KOIN (LOKAL & CLOUD) DAN STOK (CLOUD) - Guna finalPrice
        localPlayerData.coins -= finalPrice;
        if (window.Trackers) Trackers.rekodKoinBelanja(finalPrice);
        
        localStorage.setItem('currentPlayer', JSON.stringify(localPlayerData));
        if (typeof updateUI === 'function') updateUI();

        const uniqueClaimCode = generateRedemptionCode(purchaseType === 'gift' ? 'GIFT' : 'EDU');
        const myDocId = `${localPlayerData.school || 'SK_DEFAULT'}_${localPlayerData.class || '-'}_${localPlayerData.name.trim().toUpperCase()}`.replace(/\s+/g, '_');
        
        // Kemas kini pembeli di Firestore (Guna finalPrice)
        await db.collection("players").doc(myDocId).update({
            coins: firebase.firestore.FieldValue.increment(-finalPrice),
            totalSpent: firebase.firestore.FieldValue.increment(finalPrice)
        });

        // Potong stok barang di Firestore
await db.collection("eduItems").doc(itemID).update({
    stock: firebase.firestore.FieldValue.increment(-1)
});

// 💡 KEMAS KINI STOK DALAM CACHE TEMPATAN (Supaya UI paparkan stok baharu serta-merta)
if (typeof shopCacheTemp !== 'undefined' && shopCacheTemp.dataPenuh) {
    const itemDalamCache = shopCacheTemp.dataPenuh.find(i => i.id === itemID);
    if (itemDalamCache) {
        itemDalamCache.stock = Math.max(0, itemDalamCache.stock - 1);
    }
}

        // 4. DAFTARKAN KOD PENEBUSAN KE KOLEKSI UTAMA 'claims'
        await db.collection("claims").add({
            claimCode: uniqueClaimCode,
            buyerName: localPlayerData.name.toUpperCase(),
            studentName: targetStudentName, 
            playerDocId: receiverDocId,     
            itemID: itemID,
            itemName: itemName,
            status: "Belum Dituntut",
            shopType: purchaseType === 'gift' ? "Gift Shop" : "Edu Shop",
            school: localPlayerData.school || 'SK_DEFAULT',
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });

        if (purchaseType === 'gift' && notificationMsg !== "") {
            await db.collection("players").doc(receiverDocId).update({
                pendingNotification: notificationMsg
            });
        }

        // 5. SELESAI & PAPARKAN KOD KEPADA MURID (Paparkan finalPrice dalam resit)
        Swal.fire({
            title: purchaseType === 'gift' ? '🎁 HADIAH DIHANTAR!' : '🛍️ PEMBELIAN BERJAYA!',
            html: `
                <div class="bg-gray-100 p-4 rounded-2xl my-3 text-center border-2 border-dashed border-indigo-400">
                    <p class="text-xs text-gray-400 font-bold uppercase tracking-wider">Kod Tuntutan Anda</p>
                    <p class="text-2xl font-black text-indigo-900 tracking-widest my-1">${uniqueClaimCode}</p>
                    <p class="text-[10px] text-gray-500">Tunjukkan kod ini kepada Cikgu untuk menuntut barang.</p>
                </div>
                <p class="text-xs text-gray-500">${purchaseType === 'gift' ? `Koin anda ditolak ${finalPrice}. Hadiah telah dipindahkan ke profil ${targetStudentName}.` : `Koin telah ditolak sebanyak ${finalPrice}. Sila semak tab 'Inventori' anda.`}</p>
            `,
            icon: 'success',
            confirmButtonColor: '#22c55e'
        });

        loadShopInventory(purchaseType === 'gift' ? 'gift' : 'edu');

    } catch (error) {
        console.error("Ralat Checkout Ekosistem Kedai:", error);
        Swal.fire('Ralat Sistem', 'Gagal memproses transaksi. Koin anda selamat.', 'error');
    }
}

// ==========================================
// 🔥 FUNGSI SEMAK SYARAT LENCANA
// ==========================================
function checkMedalRequirement(reqType, reqValue) {
    if (typeof localPlayerData === 'undefined' || !localPlayerData) return false;

    let conditionMet = false;
    const target = reqValue;
    const currentMonth = new Date().getMonth() + 1; // 1-12

    switch (reqType) {
        case "total_score":
            if ((Number(localPlayerData.totalScore) || 0) >= target) conditionMet = true;
            break;
        case "perfect_scores":
            if ((Number(localPlayerData.perfectScores) || 0) >= target) conditionMet = true;
            break;
        case "total_games":
            if ((Number(localPlayerData.totalGames) || 0) >= target) conditionMet = true;
            break;
        case "send_challenge":
            if ((Number(localPlayerData.challengesSent) || 0) >= target) conditionMet = true;
            break;
        case "win_challenge":
            if ((Number(localPlayerData.challengesWon) || 0) >= target) conditionMet = true;
            break;
        case "total_challenges":
            if ((Number(localPlayerData.totalChallenges) || 0) >= target) conditionMet = true;
            break;
        case "lose_challenge":
            if ((Number(localPlayerData.challengesLost) || 0) >= target) conditionMet = true;
            break;
        case "total_coins": 
            if ((Number(localPlayerData.coins) || 0) >= target) conditionMet = true;
            break;
        case "total_earned": 
        case "total_coins_earned":
            if ((Number(localPlayerData.totalCoinsEarned) || 0) >= target) conditionMet = true;
            break;
        case "total_spent":
        case "spend_coins":
            if ((Number(localPlayerData.totalSpent) || 0) >= target) conditionMet = true;
            break;
        case "avatar_count":
        case "unlock_avatar":
        case "all_avatars":
        case "all_standard_avatars":
            let avatarCount = 0;
            if (localPlayerData.avatars) {
                avatarCount = Object.keys(localPlayerData.avatars).length;
            }
            if (avatarCount >= target) conditionMet = true;
            break;
        case "avatar_level": 
            let maxLvl = 0;
            if (localPlayerData.avatars) {
                for (let key in localPlayerData.avatars) {
                    let lvl = localPlayerData.avatars[key].level || 0;
                    if (lvl > maxLvl) maxLvl = lvl;
                }
            }
            if (maxLvl >= target) conditionMet = true;
            break;
        case "avatars_at_level": 
        case "multiple_avatar_level":
            let avatarsAtMaxLevel = 0;
            if (localPlayerData.avatars) {
                for (let key in localPlayerData.avatars) {
                    let lvl = localPlayerData.avatars[key].level || 0;
                    if (lvl >= 10) avatarsAtMaxLevel++;
                }
            }
            if (avatarsAtMaxLevel >= target) conditionMet = true; 
            break;
        case "avatar_streak":
            if ((Number(localPlayerData.avatarStreak) || 0) >= target) conditionMet = true;
            break;
        case "login_streak":
            if ((Number(localPlayerData.loginStreak) || 0) >= target) conditionMet = true;
            break;
        case "daily_games":
            if ((Number(localPlayerData.dailyGamesCount) || 0) >= target) conditionMet = true;
            break;
        case "unique_games": 
            if (((localPlayerData.playedGamesList || []).length) >= target) conditionMet = true;
            break;
        case "score_threshold": 
        case "high_score_all":
            if ((Number(localPlayerData.gamesWithScore50Plus) || 0) >= target) conditionMet = true;
            break;
        case "play_time_late": 
            if (localPlayerData.hasPlayedLate) conditionMet = true;
            break;
        case "play_time_early": 
            if (localPlayerData.hasPlayedEarly) conditionMet = true;
            break;
        case "weekend_play":
        case "play_weekend":
            if (localPlayerData.hasPlayedWeekend) conditionMet = true;
            break;
        case "merdeka_day":
            if (localPlayerData.hasPlayedMerdeka) conditionMet = true;
            break;
        case "play_month":
            if (localPlayerData.hasPlayedDecember && target === 12) conditionMet = true;
            else if (currentMonth === target) conditionMet = true;
            break;
        case "shop_visits":
        case "visit_shop":
            if ((Number(localPlayerData.shopVisits) || 0) >= target) conditionMet = true;
            break;
        case "first_login":
            if ((Number(localPlayerData.loginCount) || 0) >= 1 || localPlayerData.name) {
                conditionMet = true;
            }
            break;
        case "event_play":
        case "special_event":
            if (localPlayerData.hasPlayedEvent) conditionMet = true;
            break;
        case "special_avatar":
            if (localPlayerData.hasSecretAvatar) conditionMet = true;
            break;
        case "rank":
        case "leaderboard_rank": 
            const cRank = Number(localPlayerData.currentRank) || 999;
            const bRank = Number(localPlayerData.bestRank) || 999;
            const actualRank = Math.min(cRank, bRank);
            if (actualRank > 0 && actualRank <= target) {
                conditionMet = true;
            }
            break;
        case "tie_challenge":
            if (localPlayerData.lastGameResult === 'tie') conditionMet = true;
            break;
        case "comeback_win":
            if (localPlayerData.hasDoneComeback) conditionMet = true;
            break;
        case "narrow_win":
            if (localPlayerData.hasDoneNarrowWin) conditionMet = true;
            break;
        case "revenge_win":
            if (localPlayerData.hasDoneRevenge) conditionMet = true;
            break;
        case "hidden_secret":
            if (localPlayerData.foundSecret) conditionMet = true;
            break;
        case "level_reach":
            if ((Number(localPlayerData.level) || 0) >= target) conditionMet = true;
            break;
        default:
            conditionMet = false;
    }
    return conditionMet;
}

// ==========================================
// 🏆 4. LOGIK KEDAI LENCANA (BADGES SHOP) - TERKEMASKINI 100% DIGITAL
// ==========================================
async function loadMedalShop(kategoriPilihan = 'all') {
    const container = document.getElementById('medal-shop-container');
    
    if (!container) return; 
    if (typeof achievementsData === 'undefined' || !localPlayerData) {
        container.innerHTML = '<p class="text-gray-500 text-center">Memuat turun profil & data...</p>';
        return;
    }

    const playerInventory = Array.isArray(localPlayerData.inventory) ? localPlayerData.inventory : [];

    let filterWrapper = document.getElementById('medal-shop-filter-wrapper');
    if (!filterWrapper) {
        filterWrapper = document.createElement('div');
        filterWrapper.id = 'medal-shop-filter-wrapper';
        filterWrapper.className = 'w-full mb-5'; 
        container.parentNode.insertBefore(filterWrapper, container);
    }

    filterWrapper.innerHTML = `
        <div class="flex flex-col sm:flex-row justify-between items-center bg-gray-50 p-3 rounded-xl border border-gray-200 shadow-sm w-full">
            <label class="font-bold text-gray-700 text-sm mb-2 sm:mb-0"><i class="fas fa-filter mr-2 text-blue-500"></i>Pilih Kategori Lencana:</label>
            <select id="shop-category-filter" onchange="loadMedalShop(this.value)" class="w-full sm:w-auto p-2 border-2 border-blue-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 font-bold text-gray-700 bg-white cursor-pointer transition-all">
                <option value="all" ${kategoriPilihan === 'all' ? 'selected' : ''}>🌟 Tunjuk Semua</option>
                <option value="ach_" ${kategoriPilihan === 'ach_' ? 'selected' : ''}>🏆 Umum & Khas</option>
                <option value="math_" ${kategoriPilihan === 'math_' ? 'selected' : ''}>🔢 Matematik</option>
                <option value="sn_" ${kategoriPilihan === 'sn_' ? 'selected' : ''}>🧬 Sains</option>
                <option value="bm_" ${kategoriPilihan === 'bm_' ? 'selected' : ''}>🇲🇾 Bahasa Melayu</option>
                <option value="sej_" ${kategoriPilihan === 'sej_' ? 'selected' : ''}>⏳ Sejarah</option>
                <option value="mor_" ${kategoriPilihan === 'mor_' ? 'selected' : ''}>🤝 Pend. Moral</option>
                <option value="pk_" ${kategoriPilihan === 'pk_' ? 'selected' : ''}>🩺 Pend. Kesihatan</option>
                <option value="mz_" ${kategoriPilihan === 'mz_' ? 'selected' : ''}>🎵 Pend. Muzik</option>
                <option value="psv_" ${kategoriPilihan === 'psv_' ? 'selected' : ''}>🎨 Seni Visual</option>
                <option value="rbt_" ${kategoriPilihan === 'rbt_' ? 'selected' : ''}>⚙️ RBT</option>
            </select>
        </div>
    `;

    let filteredData = achievementsData;
    if (kategoriPilihan !== 'all') {
        filteredData = achievementsData.filter(item => item.id.startsWith(kategoriPilihan));
    }

    container.innerHTML = '';
    container.classList.add('max-h-[55vh]', 'overflow-y-auto', 'p-2', 'custom-scrollbar');

    if (filteredData.length === 0) {
        container.innerHTML = `<div class="col-span-full text-center py-10 text-gray-500 font-bold w-full">Tiada lencana dijumpai untuk kategori ini.</div>`;
        return;
    }

    filteredData.forEach(item => {
        const isOwned = playerInventory.includes(item.id);
        const isUnlocked = checkMedalRequirement(item.reqType, item.reqValue);

        // ==========================================
        // ✨ LOGIK LTE: SEMAK & KIRA DISKAUN KEDAI LENCANA
        // ==========================================
        let hargaPapar = item.price;
        let lencanaDiskaunHTML = ""; 

        if (typeof currentActiveEvent !== 'undefined' && currentActiveEvent !== null && currentActiveEvent.rewardType === 'shop_discount') {
            const kadarDiskaun = currentActiveEvent.rewardValue; 
            hargaPapar = Math.floor(item.price * kadarDiskaun);
            
            const peratusPotongan = Math.round((1 - kadarDiskaun) * 100);
            lencanaDiskaunHTML = `
                <div class="absolute top-3 left-[-25px] bg-red-500 text-white text-[9px] font-black px-8 py-1.5 -rotate-45 shadow-sm z-10 animate-pulse">
                    -${peratusPotongan}%
                </div>
            `;
        }

        let buttonHTML = '';
        
        // --- ⚙️ LANGKAH 2: LOGIK BUTANG RINGKAS (100% DIGITAL) ---
        if (isOwned) {
            buttonHTML = `<button class="w-full py-2 bg-gray-400 text-white rounded-lg cursor-not-allowed font-bold text-sm shadow-inner" disabled>Dimiliki</button>`;
        } 
        else if (isUnlocked) {
            let teksButang = hargaPapar < item.price 
                ? `Beli: <span class="line-through text-blue-300 mr-1 text-[10px]">${item.price}</span> ${hargaPapar} Koin` 
                : `Beli: ${item.price} Koin`;

            buttonHTML = `<button onclick="buyMedal('${item.id}', ${item.price}, \`${item.name}\`)" class="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-sm transition shadow-md active:scale-95">${teksButang}</button>`;
        } 
        else {
            buttonHTML = `<button class="w-full py-2 bg-gray-200 text-gray-500 rounded-lg cursor-not-allowed font-bold text-[11px]" disabled><i class="fas fa-lock mr-1"></i>Terkunci</button>`;
        }
        // -------------------------------------------------------------------

        const badgeImage = item.image ? item.image : "assets/badges/default.webp";

        const card = `
            <div class="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 border-2 ${isUnlocked ? 'border-blue-200' : 'border-gray-100'} text-center relative flex flex-col h-full justify-between overflow-hidden">
                ${lencanaDiskaunHTML} 
                <div>
                    <div class="w-20 h-20 mx-auto mb-3 bg-gray-50 rounded-full flex items-center justify-center relative overflow-hidden shadow-inner mt-2">
                        <img src="${badgeImage}" alt="${item.name}" class="w-14 h-14 object-contain transition-all duration-500 ${isUnlocked ? 'drop-shadow-md hover:scale-110' : 'grayscale opacity-30'}">
                        ${!isUnlocked ? '<div class="absolute inset-0 flex items-center justify-center text-gray-600 text-3xl bg-white/40"><i class="fas fa-lock drop-shadow-md"></i></div>' : ''}
                    </div>
                    <h4 class="font-bold text-sm text-gray-800 mb-1 leading-tight">${item.name}</h4>
                    <p class="text-[10px] text-gray-500 mb-3 h-10 leading-tight flex items-center justify-center">${item.description}</p>
                </div>
                ${buttonHTML}
            </div>
        `;
        container.innerHTML += card;
    });
}

// ==========================================
// FUNGSI PEMBELIAN LENCANA (DIGITAL SAHAJA)
// ==========================================
async function buyMedal(id, price, name) {
    // ==========================================
    // ✨ LOGIK LTE: ANTI-CHEAT PENGIRAAN HARGA
    // ==========================================
    let finalPrice = price; 
    let isDiscounted = false;

    if (typeof currentActiveEvent !== 'undefined' && currentActiveEvent !== null && currentActiveEvent.rewardType === 'shop_discount') {
        const kadarDiskaun = currentActiveEvent.rewardValue;
        finalPrice = Math.floor(price * kadarDiskaun);
        isDiscounted = true;
        console.log(`🛡️ [Kedai Lencana] Diskaun aktif dikesan. Harga asal ${price} diselaraskan ke ${finalPrice}.`);
    }

    if (localPlayerData.coins < finalPrice) {
        Swal.fire('🪙 Koin Tidak Cukup!', `Anda perlukan ${finalPrice} koin untuk memiliki lencana ini.`, 'error');
        return;
    }

    const confirmResult = await Swal.fire({
        title: 'Beli Lencana ini?',
        text: `Adakah anda ingin membeli ${name} dengan harga ${finalPrice} koin? ${isDiscounted ? '(✨ Harga Diskaun!)' : ''}`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Ya, Milikinya!',
        confirmButtonColor: '#4f46e5'
    });

    if (!confirmResult.isConfirmed) return;

    try {
        // 1. TOLAK KOIN LOKAL
        localPlayerData.coins -= finalPrice;
        
        if (window.Trackers) {
            Trackers.rekodKoinBelanja(finalPrice);
        }
        
        if (!localPlayerData.inventory) localPlayerData.inventory = [];
        localPlayerData.inventory.push(id);

        localStorage.setItem('currentPlayer', JSON.stringify(localPlayerData));
        if (typeof updateUI === 'function') updateUI();

        // 2. KEMASKINI FIREBASE CLOUD
        const myDocId = `${localPlayerData.school || 'SK_DEFAULT'}_${localPlayerData.class || '-'}_${localPlayerData.name.trim().toUpperCase()}`.replace(/\s+/g, '_');
        await db.collection("players").doc(myDocId).update({
            coins: firebase.firestore.FieldValue.increment(-finalPrice),
            inventory: firebase.firestore.FieldValue.arrayUnion(id)
        });

        // Paparkan status kejayaan terus (tiada lagi penjanaan pin tuntutan)
        Swal.fire('🎉 KINI DIAKTIFKAN!', `Lencana digital ${name} telah diaktifkan pada papan profil anda! (Koin ditolak: ${finalPrice})`, 'success');

        loadMedalShop();

    } catch (e) {
        console.error("Gagal membeli lencana:", e);
        Swal.fire('Ralat', 'Proses pembelian terganggu.', 'error');
    }
}

// ==========================================
// 👤 5. PAPARAN KEDAI AVATAR DIGITAL (BERANTAI & LTE DISKAUN)
// ==========================================
function loadAvatarShop() {
    const container = document.getElementById('avatar-shop-items');
    if (!container) return;

    const playerLevel = localPlayerData.level || 1;
    const playerName = localPlayerData.name || "";
    
    if (!localPlayerData.avatars) localPlayerData.avatars = {};
    if (!localPlayerData.inventory) localPlayerData.inventory = [];

    let html = "";
    
    for (const key in avatars) {
        const category = avatars[key];
        
        // 🆕 LOGIK BERANTAI: Semak jika murid sudah memiliki avatar dari kategori ini
        let highestOwnedLevel = 0;
        category.levels.forEach(item => {
             const itemKey = `${key}_lvl${item.level}`;
             if (localPlayerData.inventory.includes(itemKey) && item.level > highestOwnedLevel) {
                 highestOwnedLevel = item.level;
             }
        });

        // Loop melalui senarai avatar dalam kategori ini secara tertib
        for (let i = 0; i < category.levels.length; i++) {
            const item = category.levels[i];
            
            if (item.isSecret && playerName.trim().toUpperCase() !== "GAME MASTER") continue; 

            const itemKey = `${key}_lvl${item.level}`;
            const isOwned = localPlayerData.inventory.includes(itemKey);
            const isLevelLocked = playerLevel < item.level; // Kunci berdasarkan profil level
            
            // 🆕 LOGIK BERANTAI: Kunci evolusi!
            let isEvolutionLocked = false;
            let previousLevelRequired = 0;
            
            if (i > 0) {
                 const previousItem = category.levels[i-1];
                 previousLevelRequired = previousItem.level; 
                 
                 if (highestOwnedLevel < previousLevelRequired) {
                     isEvolutionLocked = true;
                 }
            }

            // ==========================================
            // ✨ LOGIK LTE: KIRA DISKAUN KEDAI AVATAR
            // ==========================================
            let hargaPapar = item.price;
            let diskaunHTML = "";
            let currentActiveEvent = null;

            if (typeof currentActiveEvent !== 'undefined' && currentActiveEvent !== null && currentActiveEvent.rewardType === 'shop_discount') {
                const kadarDiskaun = currentActiveEvent.rewardValue;
                hargaPapar = Math.floor(item.price * kadarDiskaun);
                
                const peratusPotongan = Math.round((1 - kadarDiskaun) * 100);
                diskaunHTML = `
                    <div class="absolute top-3 left-[-25px] bg-red-500 text-white text-[9px] font-black px-8 py-1.5 -rotate-45 shadow-sm z-10 animate-pulse pointer-events-none">
                        -${peratusPotongan}%
                    </div>
                `;
            }

            const safeImg = item.img ? item.img : '';
            const safeIcon = item.icon ? item.icon : '';

            // Visual avatar akan dimalapkan (grayscale) jika dikunci
            const visual = item.img 
                ? `<img src="assets/avatars/${item.img}" class="w-20 h-20 object-contain mb-2 ${(isLevelLocked || isEvolutionLocked) ? 'grayscale opacity-50' : ''}">`
                : `<div class="w-14 h-14 ${(isLevelLocked || isEvolutionLocked) ? 'bg-gray-200 text-gray-400' : 'bg-blue-50 text-blue-600'} rounded-full flex items-center justify-center text-2xl mb-2 shadow-inner"><i class="${(isLevelLocked || isEvolutionLocked) ? 'fas fa-lock' : item.icon}"></i></div>`;

            let buttonHtml = "";
            
            if (isOwned) {
                buttonHtml = `<button onclick="equipAvatar('${safeImg}', '${safeIcon}', '${item.name}')" class="mt-3 w-full py-2 bg-green-500 text-white rounded-xl font-bold text-[10px] hover:bg-green-600 shadow-md">GUNA AVATAR</button>`;
            } else if (isEvolutionLocked) {
                buttonHtml = `<button class="mt-3 w-full py-2 bg-slate-300 text-slate-500 rounded-xl font-bold text-[10px] cursor-not-allowed" disabled>BELI LVL ${previousLevelRequired} DAHULU</button>`;
            } else if (isLevelLocked) {
                buttonHtml = `<button class="mt-3 w-full py-2 bg-gray-200 text-gray-400 rounded-xl font-bold text-[10px] cursor-not-allowed" disabled>LVL ${item.level} DIPERLUKAN</button>`;
            } else {
                // Harga asal (item.price) dihantar ke fungsi buyAvatar untuk tapisan Anti-Cheat
                buttonHtml = `<button onclick="buyAvatar('${key}', ${item.level}, ${item.price}, '${item.name}')" class="mt-3 w-full py-2 bg-indigo-600 text-white rounded-xl font-bold text-[10px] hover:bg-indigo-700 shadow-md">BELI GUARDIAN</button>`;
            }

            // Status Badge di bahagian atas kad
            let badgeText = item.rarity;
            let badgeClass = 'bg-indigo-600';
            
            if (isEvolutionLocked) { badgeText = 'PERLU EVOLUSI'; badgeClass = 'bg-slate-400'; }
            else if (isLevelLocked) { badgeText = 'TERKUNCI'; badgeClass = 'bg-gray-400'; }

            // Logik Paparan Harga (Strikethrough jika diskaun)
            let paparanHargaHTML = isOwned 
                ? 'DIMILIKI' 
                : (hargaPapar < item.price 
                    ? `<span class="line-through text-gray-400 text-[10px] mr-1">${item.price}</span> <i class="fas fa-coins text-yellow-600"></i> ${hargaPapar}` 
                    : `<i class="fas fa-coins text-yellow-600"></i> ${item.price}`);

            html += `
            <div class="bg-white rounded-3xl p-4 shadow-sm border flex flex-col items-center text-center relative overflow-hidden">
                ${diskaunHTML}
                <div class="absolute top-0 left-0 w-full text-center ${badgeClass} text-white text-[8px] font-bold py-0.5 uppercase z-0">
                    ${badgeText}
                </div>
                <div class="mt-3"></div>
                ${visual}
                <h4 class="font-bold text-xs ${(isLevelLocked || isEvolutionLocked) ? 'text-gray-400' : 'text-gray-800'} mb-1">${item.name}</h4>
                
                <div class="font-black ${isOwned ? 'text-green-500' : 'text-yellow-600'} text-xs mt-auto pt-2 border-t w-full text-center z-10">
                    ${paparanHargaHTML}
                </div>
                ${buttonHtml}
            </div>`;
        }
    }
    container.innerHTML = html;
}

// ==========================================
// FUNGSI PEMBELIAN AVATAR (ANTI-CHEAT)
// ==========================================
function buyAvatar(category, level, price, name) {
    // ✨ LOGIK LTE: ANTI-CHEAT
    let finalPrice = price;
    let isDiscounted = false;

    if (typeof currentActiveEvent !== 'undefined' && currentActiveEvent !== null && currentActiveEvent.rewardType === 'shop_discount') {
        const kadarDiskaun = currentActiveEvent.rewardValue;
        finalPrice = Math.floor(price * kadarDiskaun);
        isDiscounted = true;
    }

    if (localPlayerData.coins < finalPrice) {
        Swal.fire('Koin Tidak Cukup!', `Sila kumpul ${finalPrice} koin dahulu untuk memiliki avatar ini.`, 'error');
        return;
    }

    Swal.fire({
        title: 'Beli Avatar?',
        text: `Beli ${name} dengan harga ${finalPrice} koin? ${isDiscounted ? '(✨ Harga Diskaun!)' : ''}`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Ya, Beli',
        confirmButtonColor: '#4f46e5'
    }).then((result) => {
        if (result.isConfirmed) {
            localPlayerData.coins -= finalPrice; // Tolak harga akhir (selepas diskaun)
            
            // Rekodkan koin yang dibelanjakan (Jika Cikgu ada sistem Tracker)
            if (window.Trackers && typeof Trackers.rekodKoinBelanja === 'function') {
                Trackers.rekodKoinBelanja(finalPrice);
            }

            const itemKey = `${category}_lvl${level}`;
            if (!localPlayerData.inventory.includes(itemKey)) localPlayerData.inventory.push(itemKey);
            
            localStorage.setItem('currentPlayer', JSON.stringify(localPlayerData));
            if (typeof saveCloudPlayerData === 'function') saveCloudPlayerData();
            if (typeof updateUI === 'function') updateUI();
            
            // Refresh semula kedai untuk kemas kini butang & rantaian evolusi
            loadAvatarShop();
            
            Swal.fire('Berjaya!', 'Avatar sedia digunakan.', 'success');
        }
    });
}

// =========================================================================
// 👑 6. PAPARAN PENGURUSAN ADMIN (GURU DASHBOARD CONTROL ENGINE)
// =========================================================================

async function loadAdminOrders(selectedStudent = 'all') {
    const container = document.getElementById('admin-content');
    if (!container) return; 

    // Jika dipanggil untuk refresh, atau jika data cache kosong, tarik dari Firebase
    if (selectedStudent === 'all_refresh' || adminAllClaimsData.length === 0) {
        container.innerHTML = `<div class="text-center py-10"><i class="fas fa-spinner fa-spin text-3xl text-indigo-600"></i><p class="mt-2 text-gray-500">Memuat turun data tuntutan aktif...</p></div>`;
        try {
            // 🔴 KEMASKINI DI SINI: Tambah tapisan sekolah
            const snapshot = await db.collection("claims")
                .where("school", "==", currentSchoolData.schoolName)
                .orderBy("timestamp", "desc")
                .get();
                
            adminAllClaimsData = [];
            snapshot.forEach(doc => {
                adminAllClaimsData.push({ id: doc.id, ...doc.data() });
            });
        } catch (e) {
            console.error("Gagal memuatkan data tuntutan admin:", e);
            container.innerHTML = "<p class='text-center text-red-500'>Gagal memuatkan data dari Firebase. Sila semak Console (F12) untuk ralat Index.</p>";
            return;
        }
    }

    if (adminAllClaimsData.length === 0) {
        container.innerHTML = "<p class='text-center py-10 text-gray-400'>Tiada rekod kod tuntutan ditemui setakat ini untuk sekolah ini.</p>";
        return;
    }

    // Ekstrak nama unik murid untuk dimasukkan ke dalam Dropdown
    const uniqueStudents = [...new Set(adminAllClaimsData.map(item => item.studentName))].sort();

    // 1. Bina Menu Filter (Dropdown)
    let filterHTML = `
        <div class="mb-5 bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-3">
            <label class="font-bold text-gray-700 text-sm w-full sm:w-auto"><i class="fas fa-filter text-indigo-500 mr-2"></i>Tapis Mengikut Murid:</label>
            <div class="flex gap-2 w-full sm:w-auto">
                <select id="admin-student-filter" onchange="filterAdminOrders(this.value)" class="w-full sm:w-auto p-2 border-2 border-indigo-200 rounded-lg text-sm font-bold text-indigo-900 outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer bg-indigo-50">
                    <option value="all">👥 Semua Murid (${adminAllClaimsData.length} Item)</option>
                    ${uniqueStudents.map(name => `<option value="${name}" ${selectedStudent === name ? 'selected' : ''}>👤 ${name}</option>`).join('')}
                </select>
                <button onclick="refreshAdminOrders()" class="bg-gray-100 hover:bg-indigo-100 hover:text-indigo-600 text-gray-500 px-3 py-2 rounded-lg transition-all border border-gray-200 shadow-sm" title="Muat Semula Data">
                    <i class="fas fa-sync-alt"></i>
                </button>
            </div>
        </div>
    `;

    // 2. Tapis senarai mengikut pilihan Dropdown
    let filteredClaims = adminAllClaimsData;
    if (selectedStudent !== 'all' && selectedStudent !== 'all_refresh') {
        filteredClaims = adminAllClaimsData.filter(claim => claim.studentName === selectedStudent);
    }

    // 3. Bina senarai Kad Tuntutan
    let listHTML = `<div class="grid gap-4">`;
    
    if (filteredClaims.length === 0) {
        listHTML += `<p class="text-center py-10 text-gray-500 col-span-full font-bold">Tiada tuntutan dijumpai untuk murid ini.</p>`;
    } else {
        filteredClaims.forEach(claim => {
            const docId = claim.id; 
            const isPending = claim.status === 'Belum Dituntut';
            const orderDate = claim.timestamp && claim.timestamp.toDate ? claim.timestamp.toDate().toLocaleString() : 'Baru sahaja';

            listHTML += `
                <div class="bg-white p-4 rounded-2xl border ${isPending ? 'border-indigo-200 bg-indigo-50/10' : 'border-gray-200'} shadow-sm flex flex-wrap justify-between items-center transition-all hover:shadow-md">
                    <div class="w-full sm:w-auto mb-3 sm:mb-0">
                        <div class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">${claim.shopType} • ${orderDate}</div>
                        <div class="font-black text-lg text-indigo-900 uppercase">${claim.studentName}</div>
                        ${claim.buyerName !== claim.studentName ? `<div class="text-xs text-pink-600 font-bold"><i class="fas fa-gift mr-1"></i>Dikirim oleh: ${claim.buyerName}</div>` : ''}
                        
                        <div class="text-sm font-semibold text-gray-700 mt-2">Item: <span class="text-indigo-600 font-bold">${claim.itemName}</span></div>
                        <div class="mt-2 inline-block bg-white border border-indigo-100 text-indigo-800 font-mono text-xs px-3 py-1.5 rounded-lg font-bold tracking-widest shadow-sm">KOD: ${claim.claimCode}</div>
                    </div>
                    <div class="flex items-center w-full sm:w-auto mt-2 sm:mt-0">
                        ${isPending ? 
                            `<button onclick="approveClaim('${docId}', '${claim.claimCode}')" class="w-full sm:w-auto bg-green-500 hover:bg-green-600 text-white px-5 py-3 rounded-xl font-bold text-xs shadow-md transition-all active:scale-95"><i class="fas fa-check-circle mr-1"></i> SAHKAN & SERAH</button>` : 
                            `<span class="w-full sm:w-auto text-center bg-gray-100 text-gray-400 px-5 py-3 rounded-xl font-bold text-xs border border-gray-200"><i class="fas fa-check-double mr-1"></i> TELAH DISERAHKAN</span>`
                        }
                    </div>
                </div>`;
        });
    }
    listHTML += `</div>`;

    container.innerHTML = filterHTML + listHTML;
}

// Helper: Fungsi untuk menukar filter tanpa memanggil database
function filterAdminOrders(studentName) {
    loadAdminOrders(studentName);
}

// Helper: Fungsi untuk memaksa database tarik data terkini
function refreshAdminOrders() {
    adminAllClaimsData = []; 
    loadAdminOrders('all_refresh');
}

async function approveClaim(claimDocId, claimCode) {
    const confirmResult = await Swal.fire({
        title: 'Sahkan Penyerahan?',
        text: `Adakah kod ${claimCode} sepadan dengan kod pada peranti murid?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#22c55e',
        confirmButtonText: 'Ya, Sahkan Serahan!'
    });

    if (!confirmResult.isConfirmed) return;
    
    try {
        await db.collection("claims").doc(claimDocId).update({ 
            status: "Sudah Dituntut",
            claimedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        Swal.fire('Selesai!', 'Status kod telah dikemas kini. Sila serahkan barang fizikal kepada murid.', 'success');
        
        // Kemas kini cache tempatan supaya tidak perlu loading lambat
        const claimIndex = adminAllClaimsData.findIndex(c => c.id === claimDocId);
        if (claimIndex !== -1) {
            adminAllClaimsData[claimIndex].status = "Sudah Dituntut";
        }
        
        // Reload UI dan kekalkan nama murid yang sedang dipilih di Dropdown!
        const currentFilter = document.getElementById('admin-student-filter') ? document.getElementById('admin-student-filter').value : 'all';
        loadAdminOrders(currentFilter); 

    } catch (e) {
        console.error("Ralat Pengesahan Guru:", e);
        Swal.fire('Ralat Rangkaian', 'Gagal menukar status pangkalan data.', 'error');
    }
}

// ==========================================
// 🛠️ 7. PENGURUSAN STOK INVENTORI (ADMIN)
// ==========================================
async function loadAdminInventory() {
    const container = document.getElementById('admin-content');
    if (!container) return; 

    container.innerHTML = `<div class="text-center py-10"><i class="fas fa-spinner fa-spin text-3xl text-indigo-600"></i><p>Memuatkan stor Firestore...</p></div>`;

    try {
        // 🔴 KEMASKINI DI SINI: Tambah tapisan sekolah
        const snapshot = await db.collection("eduItems")
            .where("school", "==", currentSchoolData.schoolName)
            .get();
            
        adminInventoryData = [];
        snapshot.forEach(doc => adminInventoryData.push(doc.data()));

        let html = `
            <div class="mb-6 flex justify-between items-center bg-indigo-50 p-4 rounded-2xl">
                <h3 class="font-bold text-indigo-800">Senarai Stok Inventori Kedai</h3>
                <button onclick="openAddItemForm()" class="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold text-xs"><i class="fas fa-plus mr-1"></i> TAMBAH BARANG</button>
            </div>
            <div class="overflow-x-auto">
                <table class="w-full text-left bg-white rounded-xl overflow-hidden shadow-sm">
                    <thead class="bg-gray-100 text-[10px] uppercase text-gray-500">
                        <tr>
                            <th class="p-3">Item</th><th class="p-3">Kategori</th><th class="p-3">Harga</th><th class="p-3">Stok</th><th class="p-3">Tindakan</th>
                        </tr>
                    </thead>
                    <tbody class="text-sm">`;

        if(adminInventoryData.length === 0){
             html += `<tr><td colspan="5" class="p-4 text-center text-gray-500">Tiada barang dijumpai untuk sekolah ini.</td></tr>`;
        } else {
            adminInventoryData.forEach(item => {
                const badgeColor = item.category === 'gift' ? 'bg-pink-100 text-pink-600' : 'bg-blue-100 text-blue-600';
                html += `
                    <tr class="border-b hover:bg-gray-50 transition-colors">
                        <td class="p-3">
                            <div class="flex items-center gap-3">
                                <div class="w-8 h-8 bg-gray-100 rounded flex items-center justify-center"><i class="${item.icon || 'fas fa-box'}"></i></div>
                                <div>
                                    <div class="font-bold text-xs">${item.name}</div>
                                    <div class="text-[9px] text-gray-400">${item.id}</div>
                                </div>
                            </div>
                        </td>
                        <td class="p-3">
                            <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase ${badgeColor}">${item.category || 'edu'}</span>
                        </td>
                        <td class="p-3 font-bold text-yellow-600 text-xs">${item.price}</td>
                        <td class="p-3 font-bold text-xs ${item.stock <= 5 ? 'text-red-500' : 'text-green-600'}">${item.stock}</td>
                        <td class="p-3">
                             <button onclick="editItem('${item.id}')" class="text-indigo-500 hover:text-indigo-700 font-bold text-xs bg-indigo-50 px-3 py-1 rounded">Edit</button>
                        </td>
                    </tr>`;
            });
        }
        container.innerHTML = html + "</tbody></table></div>";
    } catch (e) {
        container.innerHTML = "<p class='text-center text-red-500'>Gagal memuatkan inventori.</p>";
        console.error("Ralat inventori:", e);
    }
}

function openAddItemForm() {
    const modal = document.getElementById('admin-item-modal');
    if(modal) modal.classList.remove('hidden');
    document.getElementById('admin-item-action').value = 'add';
    document.getElementById('admin-item-id').value = '';
    document.getElementById('admin-item-name').value = '';
    document.getElementById('admin-item-price').value = '';
    document.getElementById('admin-item-stock').value = '';
    document.getElementById('admin-item-category').value = 'edu'; // default
    document.getElementById('admin-item-icon').value = 'fas fa-box';
    document.getElementById('admin-item-desc').value = '';
}

function closeItemForm() {
    const modal = document.getElementById('admin-item-modal');
    if(modal) modal.classList.add('hidden');
}

function editItem(id) {
    const item = adminInventoryData.find(i => i.id === id);
    if (!item) return;
    const modal = document.getElementById('admin-item-modal');
    if(modal) modal.classList.remove('hidden');
    document.getElementById('admin-item-action').value = 'edit';
    document.getElementById('admin-item-id').value = item.id;
    document.getElementById('admin-item-name').value = item.name;
    document.getElementById('admin-item-price').value = item.price;
    document.getElementById('admin-item-stock').value = item.stock;
    document.getElementById('admin-item-category').value = item.category || 'edu';
    document.getElementById('admin-item-icon').value = item.icon || 'fas fa-box';
    document.getElementById('admin-item-desc').value = item.desc || '';
}

async function submitItemForm() {
    const btn = document.getElementById('admin-save-item-btn');
    const itemId = document.getElementById('admin-item-id').value.trim().toUpperCase();
    
    const itemData = {
        id: itemId,
        name: document.getElementById('admin-item-name').value.trim(),
        price: parseInt(document.getElementById('admin-item-price').value) || 0,
        stock: parseInt(document.getElementById('admin-item-stock').value) || 0,
        category: document.getElementById('admin-item-category').value, // edu / gift
        icon: document.getElementById('admin-item-icon').value.trim(),
        desc: document.getElementById('admin-item-desc').value.trim(),
        
        // 🔴 WAJIB TAMBAH BARIS INI: Supaya barang diikat pada sekolah yang sedang log masuk
        school: currentSchoolData.schoolName
    };

    if (!itemId || !itemData.name) {
        alert("Sila lengkapkan ID dan Nama Barang!");
        return;
    }

    const originalBtnHTML = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Menyimpan...';

    try {
        await db.collection("eduItems").doc(itemId).set(itemData, { merge: true });
        alert(`Berjaya! Item ${itemId} dikemas kini.`);
        closeItemForm();
        loadAdminInventory(); 
    } catch (e) {
        console.error("Save Item Error:", e);
        alert("Gagal menyimpan data barang.");
    } finally {
        btn.disabled = false;
        btn.innerHTML = originalBtnHTML;
    }
}

// ==========================================
// 🔔 SISTEM NOTIFIKASI HADIAH (POP-UP KEJUTAN)
// ==========================================
async function checkPendingNotifications() {
    // Pastikan data pemain wujud dan mempunyai notifikasi
    if (typeof localPlayerData !== 'undefined' && localPlayerData && localPlayerData.pendingNotification) {
        
        // 1. Tayangkan pop-up kejutan kepada murid
        Swal.fire({
            title: '🎁 HADIAH DITERIMA!',
            text: localPlayerData.pendingNotification,
            icon: 'info',
            confirmButtonColor: '#f472b6', // Warna pink muda yang ceria
            confirmButtonText: 'Terima Kasih!'
        });

        // 2. Padam notifikasi dari memori peranti supaya tidak berulang
        delete localPlayerData.pendingNotification;
        localStorage.setItem('currentPlayer', JSON.stringify(localPlayerData));

        // 3. Padam notifikasi dari Firebase 
        const myDocId = `${localPlayerData.school || 'SK_DEFAULT'}_${localPlayerData.class || '-'}_${localPlayerData.name.trim().toUpperCase()}`.replace(/\s+/g, '_');
        
        try {
            await db.collection("players").doc(myDocId).update({
                pendingNotification: firebase.firestore.FieldValue.delete()
            });
        } catch (e) {
            console.error("Gagal memadam notifikasi dari Firebase:", e);
        }
    }
}
