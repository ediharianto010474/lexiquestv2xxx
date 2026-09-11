// ==========================================
// GAME LOGIC, LEVEL ACCESS & XP (NEW PROGRESSIVE MODE)
// ==========================================
const englishCategoryDifficulty = {
    easy: ['missing', 'spelling', 'plural', 'genderNouns', 'occupations'],
    medium: ['puzzle', 'guessing', 'pastTense', 'superlatives', 'synonym', 'antonym'],
    hard: ['grammar', 'architect', 'idioms', 'listening']
};

const mathCategoryDifficulty = {
    easy: ['number_recognition', 'addition_basic', 'subtraction_basic', 'multiplication_table', 'division_basic', 'shapes_and_space'],
    medium: ['fractions_intro', 'decimal_basics', 'percentage_fun', 'money_matters', 'time_and_clock', 'length_and_mass'],
    hard: ['volume_of_liquid', 'area_and_perimeter', 'data_handling', 'math_logic']
};

const scienceCategoryDifficulty = {
    easy: ['scientific_skills', 'human_life_processes', 'animal_classification', 'plant_processes', 'microorganisms'],
    medium: ['food_chains', 'energy_forms', 'light_properties', 'electricity_basics', 'heat_and_temperature', 'states_of_matter'],
    hard: ['materials_properties', 'solar_system', 'machines_simple', 'food_preservation', 'preservation_conservation']
};

const bmCategoryDifficulty = {
    easy: ['kata_nama', 'kata_kerja', 'kata_adjektif', 'kata_tugas'],
    medium: ['penjodoh_bilangan', 'sinonim_antonim', 'ayat_tunggal', 'ayat_majmuk'],
    hard: ['kesalahan_tatabahasa', 'peribahasa', 'ayat_aktif_pasif', 'susunan_songsang']
};

const muzikCategoryDifficulty = {
    easy: ['notasi_dan_balar', 'klef_trebel', 'jenis_alat_muzik'],
    medium: ['nilai_nota_ritma', 'solfa_dan_nyanyian', 'muzik_tradisional'],
    hard: ['apresiasi_muzik', 'etika_persembahan', 'kerjaya_muzik']
};

const kesihatanCategoryDifficulty = {
    easy: ['gimnastik_asas', 'pergerakan_berirama', 'olahraga_asas'],
    medium: ['permainan_kategori_serangan', 'permainan_kategori_jaring', 'permainan_kategori_padang'],
    hard: ['komponen_kecergasan', 'kekeluargaan_dan_perhubungan']
};

const moralCategoryDifficulty = {
    easy: ['kepercayaan_kepada_tuhan', 'baik_hati', 'bertanggungjawab', 'berterima_kasih'],
    medium: ['hemah_tinggi', 'hormat_menghormati', 'kasih_sayang', 'keadilan'],
    hard: ['keberanian', 'kejujuran', 'kerajinan', 'kerjasama', 'kesederhanaan', 'hak_asasi']
};

const psvCategoryDifficulty = {
    easy: ['unsur_seni', 'prinsip_rekaan', 'media_bahan'],
    medium: ['lukisan_dan_catan', 'gosokan_dan_cetakan', 'kolaj_dan_montaj'],
    hard: ['kraf_tradisional', 'apresiasi_seni', 'pameran_seni']
};

const rbtCategoryDifficulty = {
    easy: ['keselamatan_bengkel', 'pengenalan_reka_bentuk', 'reka_bentuk_pembungkusan', 'reka_bentuk_makanan', 'pengaturcaraan_t4'],
    medium: ['teknologi_rumah_tangga', 'teknologi_pertanian', 'pengaturcaraan_t5', 'kejuruteraan'],
    hard: ['pembangunan_produk', 'pengaturcaraan_t6', 'elektromekanikal']
};

const sejarahCategoryDifficulty = {
    easy: [
        'pengenalan_ilmu_sejarah',
        'sejarah_diri_dan_keluarga',
        'sejarah_sekolah',
        'zaman_air_batu'
    ],
    medium: [
        'kerajaan_melayu_awal',
        'tokoh_terbilang',
        'warisan_negara',
        'sejarah_kemerdekaan_1957'
    ],
    hard: [
        'pembentukan_malaysia_1963',
        'lambang_dan_identiti_negara',
        'rukun_negara_dan_kaum_di_malaysia',
        'pemimpin_negara_dan_perdana_menteri'
    ]
};

// -------------------------------------------------------------------------
// PENDIDIKAN AGAMA ISLAM & BAHASA ARAB
// Kategori diletakkan di 'medium' untuk sepadan dengan +2 XP
// -------------------------------------------------------------------------
const paiCategoryDifficulty = {
    easy: ['aqidah'],
    medium: ['ibadah', 'sirah'],
    hard: ['akhlak']
};

const baCategoryDifficulty = {
    easy: ['mufrodat', 'arqam'],
    medium: ['qawaid'],
    hard: ['hiwar']
};

// ==========================================
// 🛡️ GATEKEEPER: FUNGSI TARIK DATA & SEMAK AKSES LOBI 3V3
// ==========================================
function prosesMasukLobi3v3() {
    // 1. Pastikan maklumat asas wujud
    if (!studentInfo || !studentInfo.name) {
        Swal.fire('Ralat', 'Maklumat asas pemain tidak wujud. Sila log masuk semula.', 'error');
        return;
    }

    // 2. Tunjuk paparan Loading
    Swal.fire({
        title: 'Menyemak Kelayakan...',
        text: 'Sedang menarik rekod pertempuran anda...',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    // 3. Bina ID Dokumen untuk Firestore (Format: SEKOLAH_KELAS_NAMA)
    const docId = `${studentInfo.school}_${studentInfo.class}_${studentInfo.name}`.replace(/\s+/g, '_').toUpperCase();

    // 4. Tarik data dari Firestore
    db.collection("players").doc(docId).get().then((doc) => {
        if (!doc.exists) {
            Swal.fire('Ralat Rekod', `Dokumen pemain [${docId}] tidak dijumpai.`, 'error');
            return;
        }

        // 5. TINDAN studentInfo lama dengan data lengkap dari Firestore
        studentInfo = doc.data();

        // 6. Mula Semak Syarat Level
        const playerLevel = Number(studentInfo.level) || 0;
        if (playerLevel < 35) {
            Swal.fire('Akses Ditolak', `Level anda: ${playerLevel}. Perlu level 35.`, 'error');
            return;
        }

	// ---------------------------------------------------------
        // 7. Himpunkan senarai subjek mengikut kategori (VERSI SELAMAT & LENGKAP)
        // ---------------------------------------------------------
        let allEasyCats = [];
        let allMedCats = [];
        let allHardCats = [];

        function extractDifficulty(diffObject) {
            if (typeof diffObject !== 'undefined' && diffObject) {
                if (diffObject.easy) allEasyCats.push(...diffObject.easy.map(c => c.toLowerCase()));
                if (diffObject.medium) allMedCats.push(...diffObject.medium.map(c => c.toLowerCase()));
                if (diffObject.hard) allHardCats.push(...diffObject.hard.map(c => c.toLowerCase()));
            }
        }

        // 📚 Sedut data dari objek kesukaran global (Termasuk PAI & BA!)
        extractDifficulty(typeof englishCategoryDifficulty !== 'undefined' ? englishCategoryDifficulty : undefined);
        extractDifficulty(typeof mathCategoryDifficulty !== 'undefined' ? mathCategoryDifficulty : undefined);
        extractDifficulty(typeof scienceCategoryDifficulty !== 'undefined' ? scienceCategoryDifficulty : undefined);
        extractDifficulty(typeof bmCategoryDifficulty !== 'undefined' ? bmCategoryDifficulty : undefined);
        extractDifficulty(typeof muzikCategoryDifficulty !== 'undefined' ? muzikCategoryDifficulty : undefined);
        extractDifficulty(typeof kesihatanCategoryDifficulty !== 'undefined' ? kesihatanCategoryDifficulty : undefined);
        extractDifficulty(typeof moralCategoryDifficulty !== 'undefined' ? moralCategoryDifficulty : undefined);
        extractDifficulty(typeof psvCategoryDifficulty !== 'undefined' ? psvCategoryDifficulty : undefined);
        extractDifficulty(typeof rbtCategoryDifficulty !== 'undefined' ? rbtCategoryDifficulty : undefined);
        extractDifficulty(typeof sejarahCategoryDifficulty !== 'undefined' ? sejarahCategoryDifficulty : undefined);
        
        // 🕌 🇸🇦 TAMBAHAN PAI & BAHASA ARAB DI SINI
        extractDifficulty(typeof paiCategoryDifficulty !== 'undefined' ? paiCategoryDifficulty : undefined);
        extractDifficulty(typeof baCategoryDifficulty !== 'undefined' ? baCategoryDifficulty : undefined);
        extractDifficulty(typeof arabicCategoryDifficulty !== 'undefined' ? arabicCategoryDifficulty : undefined);

        // 🛡️ PELAN SANDARAN KESELAMATAN (HARDCODE FALLBACK)
        const fallbackEasy = ['missing', 'spelling', 'plural', 'gendernouns', 'occupation', 'number_recognition', 'addition', 'subtraction', 'kata_nama', 'mufrodat', 'arqam', 'alquran', 'jawi', 'aqidah', 'pengenalan_ilmu_sejarah', 'keselamatan_bengkel', 'unsur_seni', 'notasi_dan_balar', 'kepercayaan_kepada_tuhan', 'gimnastik_asas'];
        const fallbackMed = ['puzzle', 'guessing', 'pasttense', 'superlatives', 'synonym', 'antonym', 'multiplication', 'division', 'time_and_money', 'simpulan_bahasa', 'hiwar', 'ibadah', 'sirah', 'zaman_air_batu', 'kerajaan_melayu_awal', 'asas_reka_bentuk', 'prinsip_rekaan', 'apresiasi_muzik', 'baik_hati', 'bertanggungjawab', 'olahraga_asas'];
        const fallbackHard = ['grammar', 'architect', 'idioms', 'listening', 'speaking', 'fraction_and_decimal', 'area_and_perimeter', 'susunan_songsang', 'pemahaman', 'qawaid', 'akhlak', 'tokoh_terbilang', 'reka_bentuk_pembungkusan', 'asas_pertanian', 'menggambar', 'kraf_tradisional', 'nyanyian', 'keadilan', 'toleransi', 'pertolongan_cemas', 'kesihatan_diri'];
        
        allEasyCats.push(...fallbackEasy);
        allMedCats.push(...fallbackMed);
        allHardCats.push(...fallbackHard);

        let passedEasy = 0, passedMedium = 0, passedHard = 0;

        // ---------------------------------------------------------
        // 8. Semak Markah di dalam studentInfo.games
        // ---------------------------------------------------------
        if (studentInfo.games) {
            // Tukar semua kunci subjek ke huruf kecil supaya mudah dipadankan
            const normalizedGames = {};
            for (let key in studentInfo.games) {
                normalizedGames[key.toLowerCase()] = studentInfo.games[key];
            }

            // Fungsi pengiraan untuk setiap aras
            function checkScore(subjectArray) {
                let count = 0;
                // Gunakan Set untuk buang nama kategori yang berulang (duplicate)
                const uniqueSubjects = [...new Set(subjectArray)]; 
                
                uniqueSubjects.forEach(subject => {
                    const gameData = normalizedGames[subject.toLowerCase()];
                    if (gameData !== undefined) {
                        // Semak kalau format Objek {highScore: x} atau Nombor bulat
                        let score = (typeof gameData === 'object' && gameData !== null) ? (Number(gameData.highScore) || 0) : (Number(gameData) || 0);
                        if (score >= 35) count++;
                    }
                });
                return count;
            }

            passedEasy = checkScore(allEasyCats);
            passedMedium = checkScore(allMedCats);
            passedHard = checkScore(allHardCats);
        }

// 9. Keputusan Akhir Semakan
        if (passedEasy >= 5 && passedMedium >= 5 && passedHard >= 5) {
            
            // --- 1. SEMBUNYIKAN PAPARAN LAMA (CHALLENGE LOBBY) ---
            const menuUtama = document.getElementById('challenge-lobby-screen'); // <-- Tukar di sini
            if (menuUtama) {
                menuUtama.classList.add('hidden');
            }

            // --- 2. BUKA LOBI 3V3 ---
            const arenaContainer = document.getElementById('arena-lobby-container');
            if (arenaContainer) {
                arenaContainer.classList.remove('hidden');
                arenaContainer.style.display = 'block';
                
                // Bawa pengguna terus ke bahagian atas lobi
                window.scrollTo({ top: 0, behavior: 'smooth' });

		mulaPantauSenaraiLobi();
            }

            // --- 3. TUNJUK POPUP KEJAYAAN ---
            Swal.fire({
                title: 'Syarat Terbuka!',
                text: 'Selamat Datang ke Arena 3v3!',
                icon: 'success',
                timer: 2500,
                showConfirmButton: false
            });
            
        } else {
            // Jika gagal
            let msg = `<div class="text-left text-sm mt-3">
                       <b>Prestasi Semasa Anda:</b><br><br>
                       🟢 Aras Easy: ${passedEasy}/5<br>
                       🟡 Aras Medium: ${passedMedium}/5<br>
                       🔴 Aras Hard: ${passedHard}/5<br><br>
                       <i>Anda perlu capai sekurang-kurangnya 35 markah dalam 5 sub-kategori untuk setiap aras.</i></div>`;
            Swal.fire({ title: 'Syarat Tidak Mencukupi', html: msg, icon: 'error' });
        }

    }).catch((error) => {
        console.error("Ralat muat turun:", error);
        Swal.fire('Ralat Sambungan', 'Gagal menghubungi pangkalan data Firestore.', 'error');
    });
}

// ==========================================
// 🚪 FUNGSI KELUAR DARI LOBI 3V3
// ==========================================
function keluarLobi3v3() {
    // 1. Sembunyikan kotak Lobi 3v3
    const arenaContainer = document.getElementById('arena-lobby-container');
    if (arenaContainer) {
        arenaContainer.classList.add('hidden');
        arenaContainer.style.display = 'none'; // Pastikan ia betul-betul hilang
    }

    // 2. Buka semula Skrin Challenge
    const menuUtama = document.getElementById('challenge-lobby-screen');
    if (menuUtama) {
        menuUtama.classList.remove('hidden');
        
        // Skrol kembali ke atas supaya paparan menu nampak kemas
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// ==========================================
// 🔥 FASA 2: FUNGSI FIREBASE ARENA 3V3
// ==========================================

let pemantauLobi = null; // Menyimpan sambungan real-time
let lobiAktifSemasa = null; // Menyimpan ID bilik jika pemain masuk bilik
let selectedLobbyId = null; // KUNCI: Menyimpan ID lobi yang dipilih pengguna

// 1. FUNGSI MEMANTAU SENARAI LOBI SECARA REAL-TIME (RADAR) RTDB
function mulaPantauSenaraiLobi() {
    const listContainer = document.getElementById('active-lobbies-list');
    
    // Hentikan pemantauan lama jika ada
    if (pemantauLobi) firebase.database().ref('arena_lobbies').off('value', pemantauLobi);

    // Mula pantau nod "arena_lobbies"
    pemantauLobi = firebase.database().ref('arena_lobbies').on('value', (snapshot) => {
        listContainer.innerHTML = ''; // Kosongkan senarai lama
        
        // JIKA KOSONG (Tiada Lobi)
        if (!snapshot.exists()) {
            listContainer.innerHTML = `
                <div id="empty-lobby-message" class="flex flex-col items-center justify-center h-full text-slate-500 italic py-12">
                    <i class="fas fa-ghost text-4xl mb-3 opacity-50"></i>
                    <p>Tiada lobi aktif dikesan buat masa ini.</p>
                    <p class="text-sm">Jadilah yang pertama mencipta ruang pertempuran!</p>
                </div>
            `;
            // Sembunyikan kembali tombol jika lobi tiba-tiba kosong
            selesaiPilihLobi();
            return;
        }

        // Kumpul data ke dalam Array untuk tujuan susunan (Order By Descending)
        let senaraiLobi = [];
        snapshot.forEach((child) => {
            senaraiLobi.push({ id: child.key, ...child.val() });
        });
        
        // Susun lobi yang paling baru dicipta berada di atas
        senaraiLobi.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

        // JIKA ADA LOBI (Papar setiap satu)
        senaraiLobi.forEach((lobi) => {
            const lobiId = lobi.id;
            
            // Kira berapa orang dah masuk
            let jumlahPemain = 0;
            ['A1','A2','A3'].forEach(slot => { if(lobi.teamA && lobi.teamA[slot]) jumlahPemain++; });
            ['B1','B2','B3'].forEach(slot => { if(lobi.teamB && lobi.teamB[slot]) jumlahPemain++; });

            // Tentukan warna status
            const warnaStatus = lobi.status === 'menunggu' ? 'text-emerald-400' : 'text-red-400';
            
            // KEMAS KINI DI SINI: Ditambah id="lobi-${lobiId}" dan class "lobi-item"
            const kotakLobi = `
                <div id="lobi-${lobiId}" class="lobi-item bg-slate-700/50 hover:bg-slate-700 border border-slate-600 rounded-xl p-4 cursor-pointer transition-all flex items-center justify-between"
                     onclick="pilihLobi('${lobiId}', '${lobi.status}')">
                    <div>
                        <h4 class="text-white font-bold text-lg">Bilik: ${lobi.hostName}</h4>
                        <p class="text-sm ${warnaStatus} uppercase font-bold text-xs mt-1">
                            <i class="fas fa-circle text-[8px] align-middle mr-1"></i> ${lobi.status}
                        </p>
                    </div>
                    <div class="text-right">
                        <span class="bg-slate-900 text-slate-300 px-3 py-1 rounded-full text-sm font-bold border border-slate-700">
                            <i class="fas fa-users text-xs mr-1"></i> ${jumlahPemain} / 6
                        </span>
                    </div>
                </div>
            `;
            listContainer.innerHTML += kotakLobi;
        });

        // Mengekalkan highlight jika Firebase memperbarui data secara real-time
        if (selectedLobbyId) {
            const lobiDipilih = document.getElementById(`lobi-${selectedLobbyId}`);
            if (lobiDipilih) {
                lobiDipilih.classList.remove('border-slate-600', 'bg-slate-700/50');
                lobiDipilih.classList.add('border-amber-500', 'bg-slate-700');
            }
        }

    }, (error) => {
        console.error("Ralat radar lobi:", error);
    });
}

// Fungsi reset untuk menyembunyikan tombol jika tiada lobi terpilih
function selesaiPilihLobi() {
    selectedLobbyId = null;
    document.getElementById('btn-watch-battle').classList.add('hidden');
    document.getElementById('btn-join-lobby').classList.add('hidden');
}

// Fungsi aksi untuk tombol WATCH BATTLE
function tontonLobi() {
    if (!selectedLobbyId) {
        alert("Sila pilih satu lobi dari senarai terlebih dahulu!");
        return;
    }
    // Membuka tab baru langsung ke penonton.html dengan parameter ID lobi
    window.open(`penonton.html?id=${selectedLobbyId}`, '_blank');
}

// 2. FUNGSI UNTUK MENCIPTA LOBI BAHARU (RTDB)
async function ciptaLobiBaharu() {
isGanjaranDisimpan = false;
    Swal.fire({
        title: 'Mencipta Bilik...',
        allowOutsideClick: false,
        didOpen: () => { Swal.showLoading(); }
    });

    try {
        const lobiBaruRef = firebase.database().ref('arena_lobbies').push(); 
        
        const dataLobi = {
            hostName: studentInfo.name,
            status: 'menunggu', 
            createdAt: firebase.database.ServerValue.TIMESTAMP, // Masa Server RTDB
            teamAName: 'PASUKAN A',
            teamBName: 'PASUKAN B',
            teamA: {
                A1: { name: studentInfo.name, level: studentInfo.level, avatar: studentInfo.activeAvatar || `https://ui-avatars.com/api/?name=${studentInfo.name}&background=random` },
                A2: null,
                A3: null
            },
            teamB: { B1: null, B2: null, B3: null }
        };

        await lobiBaruRef.set(dataLobi);
        Swal.close();
        masukBilik(lobiBaruRef.key); // Gunakan .key untuk RTDB

    } catch (error) {
        Swal.fire('Ralat', 'Gagal mencipta lobi: ' + error.message, 'error');
    }
}

// 3. FUNGSI TUKAR PAPARAN KE DALAM BILIK
function bukaPaparanBilik() {
    document.getElementById('lobby-list-view').classList.add('hidden');
    document.getElementById('lobby-room-view').classList.remove('hidden');
    
    // Sembunyikan butang Kembali utama, tunjuk butang Tinggalkan Bilik
    document.getElementById('btn-back-lobby').classList.add('hidden');
    
    // (Nota: Nanti kita akan buat sistem pantau siapa yang masuk ke Slot A/B di sini)
}

// KLIK PADA LOBI UNTUK MUNCULKAN BUTANG (VERSI GABUNGAN TERAKHIR)
function pilihLobi(id, status) {
    console.log("=========================================");
    console.log("🎯 FUNGSI pilihLobi UTAMA BERJALAN! ID:", id, "| Status:", status);
    
    selectedLobbyId = id;
    
    // 1. Serlahkan (Highlight) kotak lobi
    const lobiDipilih = document.getElementById(`lobi-${id}`);
    if (lobiDipilih) {
        document.querySelectorAll('.lobi-item').forEach(item => {
            item.classList.remove('border-amber-500', 'bg-slate-700');
            item.classList.add('border-slate-600', 'bg-slate-700/50');
        });
        lobiDipilih.classList.remove('border-slate-600', 'bg-slate-700/50');
        lobiDipilih.classList.add('border-amber-500', 'bg-slate-700');
    }
    
    // 2. Ambil elemen butang dari HTML
    const btnJoin = document.getElementById('btn-join-lobby');
    const btnWatch = document.getElementById('btn-watch-battle');
    
    // 3. Reset (Sembunyikan JOIN dahulu)
    if (btnJoin) btnJoin.classList.add('hidden');
    
    // 4. 🔥 BUTANG WATCH SENTIASA MUNCUL 🔥
    if (btnWatch) {
        btnWatch.classList.remove('hidden');
        btnWatch.onclick = tontonLobi; 
        console.log("✅ Butang WATCH berjaya dihidupkan!");
    }
    
    // 5. Butang JOIN hanya muncul jika lobi sedang 'menunggu'
    if (status === 'menunggu' && btnJoin) {
        btnJoin.classList.remove('hidden');
        // Kita masukkan fungsi asal dari FASA 3 anda ke sini!
        btnJoin.onclick = () => masukBilik(id); 
        console.log("✅ Butang JOIN sedia untuk digunakan!");
    }
    console.log("=========================================");
}

window.pilihLobi = pilihLobi;

// ==========================================
// 🔥 FASA 3: FUNGSI DALAM BILIK (LIVE SYNC & JOIN)
// ==========================================

let pemantauBilik = null; // Untuk memastikan skrin "live"
let timerBanningAktif = false; // KOD BARU: Untuk elak popup bertindih

// FUNGSI 1: MASUK BILIK & HIDUPKAN "LIVE SYNC" (SUIS PAPARAN RTDB)
function masukBilik(lobiId) {
    // Matikan pemantau bilik lama jika ada sebelum masuk bilik baru
    if (lobiAktifSemasa) {
        firebase.database().ref('arena_lobbies/' + lobiAktifSemasa).off();
    }
    lobiAktifSemasa = lobiId;

    // Pantau perubahan dalam bilik ini secara Live menggunakan RTDB!
    firebase.database().ref('arena_lobbies/' + lobiId).on('value', (snapshot) => {
        if (!snapshot.exists()) {
            Swal.fire('Ralat', 'Bilik ini telah ditutup atau dimusnahkan.', 'error');
            if (typeof kembaliKeSenaraiLobi === "function") kembaliKeSenaraiLobi(); 
            return;
        }
        
        const lobi = snapshot.val(); // RTDB guna .val()
        if (!lobi) return;

	// =======================================================
        // 📛 KEMASKINI NAMA PASUKAN DINAMIK 
        // =======================================================
        const namaPasukanA = lobi.teamAName || "PASUKAN A"; 
        const namaPasukanB = lobi.teamBName || "PASUKAN B";

        const labelNamaA = document.getElementById('label-name-team-a'); 
        const labelNamaB = document.getElementById('label-name-team-b'); 

        if (labelNamaA) labelNamaA.innerText = namaPasukanA;
        if (labelNamaB) labelNamaB.innerText = namaPasukanB;

        // =======================================================
        // 📊 KIRA JUMLAH SKOR PASUKAN SECARA LIVE DARI SLOT 
        // =======================================================
        let totalScoreA = 0;
        let totalScoreB = 0;

        if (lobi.teamA) {
            ['A1', 'A2', 'A3'].forEach(slot => {
                if (lobi.teamA[slot] && lobi.teamA[slot].points) {
                    totalScoreA += Number(lobi.teamA[slot].points);
                }
            });
        }

        if (lobi.teamB) {
            ['B1', 'B2', 'B3'].forEach(slot => {
                if (lobi.teamB[slot] && lobi.teamB[slot].points) {
                    totalScoreB += Number(lobi.teamB[slot].points);
                }
            });
        }

        const liveScoreAEl = document.getElementById('live-score-team-a'); 
        const liveScoreBEl = document.getElementById('live-score-team-b'); 

        // Kekalkan perkataan "pts" di belakang nombor
        if (liveScoreAEl) liveScoreAEl.innerHTML = `${totalScoreA} <span class="text-lg font-normal text-slate-400">pts</span>`;
        if (liveScoreBEl) liveScoreBEl.innerHTML = `${totalScoreB} <span class="text-lg font-normal text-slate-400">pts</span>`;

	// =======================================================
        // 🏁 TAMBAH KOD INI: PEMANTAU STATUS BATTLE ANALYSIS 🏁
        // =======================================================
        if (lobi.status === 'battle_analysis') {
            console.log("Status Battle Analysis dikesan! Memaparkan skrin...");
            
            // Matikan pemasa (jika masih berjalan)
            if (typeof pemasaBattleInterval !== 'undefined') {
                clearInterval(pemasaBattleInterval);
            }
            
            // Panggil fungsi Battle Analysis yang kita buat tadi!
            if (typeof prosesBattleAnalysis === "function") {
                prosesBattleAnalysis(lobi);
            }
        }

        // =======================================================
        // 💥 KOD 1: PENGESAN SERANGAN (DEBUFF) UNTUK MANGSA 💥
        // =======================================================
        const mySlotElement = document.getElementById('my-battle-slot');
        if (mySlotElement) {
            const mySlot = mySlotElement.innerText; // Cth: 'A1', 'B2'
            const isTeamA = mySlot.startsWith('A');
            const myTeam = isTeamA ? 'teamA' : 'teamB';

            // Semak jika data slot kita wujud di Firebase dan mempunyai rekod 'debuff'
            if (lobi[myTeam] && lobi[myTeam][mySlot]) {
                const dataSaya = lobi[myTeam][mySlot];

                if (dataSaya.debuff === 'mist') {
                    firebase.database().ref(`arena_lobbies/${lobiId}/${myTeam}/${mySlot}`).update({
                        debuff: null, debuffTime: null
                    });
                    if (typeof aktifkanKesanMist === "function") aktifkanKesanMist();
                } 
                else if (dataSaya.debuff === 'challenger') {
                    firebase.database().ref(`arena_lobbies/${lobiId}/${myTeam}/${mySlot}`).update({
                        debuff: null, debuffTime: null
                    });
                    if (typeof aktifkanKesanChallenger === "function") aktifkanKesanChallenger();
                }
                // 💥 KEMASKINI SYNC: SEKARANG AMBIL DATA DARI NODE PICKS YANG TEPAT 💥
                else if (dataSaya.debuff === 'switch') {
                    // Padam debuff profil pemain supaya tak berulang
                    firebase.database().ref(`arena_lobbies/${lobiId}/${myTeam}/${mySlot}`).update({
                        debuff: null, debuffTime: null
                    });
                    
                    // Membaca subjek baharu yang telah diputar dari dalam node lobi.picks
                    if (lobi.picks && lobi.picks[myTeam] && lobi.picks[myTeam][mySlot]) {
                        let dataSubjekBaharu = {
                            id: lobi.picks[myTeam][mySlot].id,
                            name: lobi.picks[myTeam][mySlot].name
                        };

                        // Panggil fungsi kesan Switch dengan membawa objek subjek baharu dari node picks
                        if (typeof aktifkanKesanSwitch === "function") aktifkanKesanSwitch(dataSubjekBaharu);
                    } else {
                        console.error("[MANGSA SWITCH] Gagal membaca data subjek baharu dari lobi.picks");
                    }
                }
            }
        }

        // =======================================================
        // 🚦 KOD 2: ROUTER PAPARAN SKRIN MENGIKUT STATUS LOBI
        // =======================================================
        if (lobi.status === 'menunggu') {
            document.getElementById('lobby-list-view').classList.add('hidden');
            document.getElementById('lobby-room-view').classList.remove('hidden');
            if(document.getElementById('banning-view')) document.getElementById('banning-view').classList.add('hidden');
            if(document.getElementById('picking-view')) document.getElementById('picking-view').classList.add('hidden'); 
            
            document.getElementById('btn-back-lobby').classList.add('hidden');
            kemaskiniPaparanBilik(lobi, lobiId);
        } 
        else if (lobi.status === 'banning') {
            document.getElementById('lobby-room-view').classList.add('hidden');
            if(document.getElementById('picking-view')) document.getElementById('picking-view').classList.add('hidden'); 
            if(document.getElementById('banning-view')) document.getElementById('banning-view').classList.remove('hidden');
            kemaskiniPaparanBanning(lobi, lobiId);
        }
        else if (lobi.status === 'picking') {
            document.getElementById('lobby-room-view').classList.add('hidden');
            if(document.getElementById('banning-view')) document.getElementById('banning-view').classList.add('hidden');
            
            if(document.getElementById('picking-view')) {
                document.getElementById('picking-view').classList.remove('hidden');
                kemaskiniPaparanPicking(lobi, lobiId); 
            }
        }
        else if (lobi.status === 'battle') {
            if(document.getElementById('lobby-room-view')) document.getElementById('lobby-room-view').classList.add('hidden');
            if(document.getElementById('banning-view')) document.getElementById('banning-view').classList.add('hidden');
            if(document.getElementById('picking-view')) document.getElementById('picking-view').classList.add('hidden');
            
            if(document.getElementById('battle-view')) document.getElementById('battle-view').classList.remove('hidden');
            
            console.log("FASA BATTLE BERMULA!"); 
            
            if (typeof mulakanPemasaBattle === "function") {
                mulakanPemasaBattle(lobiId, lobi);
            } else {
                console.error("Fungsi mulakanPemasaBattle tidak dijumpai!");
            }
            
            let slotPemain = sessionStorage.getItem('slotPemainSemasa');
            
            if (!slotPemain && typeof studentInfo !== 'undefined' && studentInfo.name) {
                const teams = ['A', 'B'];
                teams.forEach(t => {
                    const teamData = t === 'A' ? lobi.teamA : lobi.teamB;
                    if (teamData) {
                        for (let i = 1; i <= 3; i++) {
                            const semakSlot = `${t}${i}`;
                            if (teamData[semakSlot] && teamData[semakSlot].name === studentInfo.name) {
                                slotPemain = semakSlot;
                                sessionStorage.setItem('slotPemainSemasa', slotPemain); 
                                console.log("Berjaya kesan slot melalui carian nama:", slotPemain);
                            }
                        }
                    }
                });
            }
            
            if (slotPemain) {
                kemaskiniPaparanBattle(lobi, lobiId, slotPemain); 
            } else {
                console.error("Ralat: Masih tak jumpa slot! Guna A1 sebagai percubaan akhir.");
                kemaskiniPaparanBattle(lobi, lobiId, 'A1'); 
            }
            
        } 
    }); 
}

// FUNGSI 2: LUKIS AVATAR & NAMA PEMAIN PADA SLOT
function kemaskiniPaparanBilik(lobi, lobiId) {
    // ========================================================
    // --- KOD PENYELAMAT RTDB (LETAKKAN DI SINI) ---
    // ========================================================
    lobi.teamA = lobi.teamA || {};
    lobi.teamB = lobi.teamB || {};
    // ========================================================

    // Kod asal Cikgu di bawah ini kekal sama, tak perlu usik
    const isKetuaA = (lobi.teamA.A1 && lobi.teamA.A1.name === studentInfo.name);
    const isKetuaB = (lobi.teamB.B1 && lobi.teamB.B1.name === studentInfo.name);

    // KEMAS KINI NAMA PASUKAN
    let namaA = document.getElementById('team-a-name');
    namaA.innerHTML = lobi.teamAName || "PASUKAN A";
    if (isKetuaA) { 
        namaA.innerHTML += ' <i class="fas fa-edit text-sm ml-2 cursor-pointer text-white/50 hover:text-white"></i>';
        namaA.onclick = () => tukarNamaPasukan('teamAName', lobiId);
        namaA.classList.add('cursor-pointer');
    } else {
        namaA.onclick = null;
        namaA.classList.remove('cursor-pointer');
    }

    let namaB = document.getElementById('team-b-name');
    namaB.innerHTML = lobi.teamBName || "PASUKAN B";
    if (isKetuaB) { 
        namaB.innerHTML += ' <i class="fas fa-edit text-sm ml-2 cursor-pointer text-white/50 hover:text-white"></i>';
        namaB.onclick = () => tukarNamaPasukan('teamBName', lobiId);
        namaB.classList.add('cursor-pointer');
    } else {
        namaB.onclick = null;
        namaB.classList.remove('cursor-pointer');
    }

    // KEMAS KINI SLOT PEMAIN
    const teams = ['A', 'B'];
    teams.forEach(team => {
        const teamData = team === 'A' ? lobi.teamA : lobi.teamB;
        const color = team === 'A' ? 'red' : 'blue';

        for (let i = 1; i <= 3; i++) {
            const slotId = `${team}${i}`;
            const slotDiv = document.getElementById(`slot-${slotId}`);
            const playerData = teamData[slotId];

            if (playerData) {
                // JIKA SLOT ADA ORANG (Lukis Avatar & Nama)
                
                // --- KOD BARU: BAIKI URL GAMBAR & FOLDER ---
                let rawAvatar = playerData.avatar || `https://ui-avatars.com/api/?name=${playerData.name}&background=random`;
                
                // 1. Tukar simbol pelik kepada '/'
                // 2. Buang perkataan 'img/' di hadapan jika ada
                const avatarImg = rawAvatar.replace(/\|/g, '/').replace(/%7C/gi, '/').replace('img/', '');
                // -------------------------------------------
                
                slotDiv.innerHTML = `
                    <div class="flex items-center gap-3 w-full px-4 h-full">
                        <img src="${avatarImg}" onerror="this.onerror=null; this.src='https://ui-avatars.com/api/?name=${playerData.name}&background=random';" class="w-10 h-10 rounded-full border-2 border-${color}-500 shadow-md object-cover bg-slate-800">
                        
                        <div class="text-left flex-1 overflow-hidden">
                            <p class="text-white font-bold text-sm truncate">${playerData.name}</p>
                            <p class="text-${color}-400 text-xs">Lv ${playerData.level}</p>
                        </div>
                    </div>
                `;
                slotDiv.onclick = null; // Dah ada orang, tak boleh tekan
                slotDiv.classList.remove('cursor-pointer', 'hover:bg-red-900/30', 'hover:bg-blue-900/30');
                slotDiv.classList.add(`border-${color}-500`); // Solid border
            } else {
                // JIKA SLOT KOSONG
                slotDiv.innerHTML = `<span class="text-${color}-500/60 font-bold uppercase tracking-wider">+ Slot ${slotId}</span>`;
                slotDiv.onclick = () => sertaiSlotKosong(slotId, lobiId);
                slotDiv.classList.add('cursor-pointer', `hover:bg-${color}-900/30`);
                slotDiv.classList.remove(`border-${color}-500`);
            }
        }
    }); // <-- BLOK SEMAKAN SLOT TAMAT DI SINI

    // =========================================================
    // --- KOD PENGESAN SLOT PENUH DILETAKKAN DI SINI ---
    // =========================================================
	const semuaPenuh = lobi.teamA.A1 && lobi.teamA.A2 && lobi.teamA.A3 &&
                           lobi.teamB.B1 && lobi.teamB.B2 && lobi.teamB.B3;

    // Jika semua penuh dan lobi masih berstatus 'menunggu'
    if (semuaPenuh && lobi.status === 'menunggu' && !timerBanningAktif) {
        timerBanningAktif = true; // Kunci supaya popup tak keluar banyak kali

        let timerInterval;
        Swal.fire({
            title: 'AMARAN PERTEMPURAN!',
            html: 'Arena telah penuh. Beralih ke Fasa Banning dalam masa <br><br><b class="text-4xl text-red-500"></b><br><br>saat...',
            icon: 'warning',
            timer: 20000, // 20 Saat
            timerProgressBar: true,
            allowOutsideClick: false,
            showConfirmButton: false,
            background: '#1e293b', // Warna gelap (slate-800)
            color: '#fff',
            didOpen: () => {
                const b = Swal.getHtmlContainer().querySelector('b');
                // Kemas kini nombor setiap saat
                timerInterval = setInterval(() => {
                    b.textContent = Math.ceil(Swal.getTimerLeft() / 1000);
                }, 100);
            },
            willClose: () => {
                clearInterval(timerInterval);
            }
        }).then((result) => {
            // Bila 20 saat tepat berakhir
            if (result.dismiss === Swal.DismissReason.timer) {
                timerBanningAktif = false;
                if(typeof masukFasaBanning === "function") {
                    masukFasaBanning(lobiId); // Panggil fungsi fasa seterusnya jika wujud
                }
            }
        });

    } 
    // JIKA ADA ORANG KELUAR SEMASA TIMER BERJALAN
    else if (!semuaPenuh && timerBanningAktif) {
        Swal.close(); // Tutup timer serta-merta
        timerBanningAktif = false; // Buka balik kunci
        
        // Beritahu pemain perlawanan tergendala
        Swal.fire({
            title: 'Tergendala!',
            text: 'Seorang pemain telah meninggalkan arena. Menunggu pemain baru...',
            icon: 'info',
            timer: 3000,
            showConfirmButton: false,
            background: '#1e293b',
            color: '#fff'
        });
    }
}

// FUNGSI 3: TEKAN SLOT UNTUK MASUK (RTDB)
function sertaiSlotKosong(slotId, lobiId) {
    const team = slotId.startsWith('A') ? 'teamA' : 'teamB';
    
    // 🔥 TAMBAH BARIS INI: Simpan memori kerusi peribadi peranti ini
    sessionStorage.setItem('slotPemainSemasa', slotId); 
    
    // Guna slash '/' untuk nested update di RTDB
    firebase.database().ref('arena_lobbies/' + lobiId).update({
        [`${team}/${slotId}`]: {
            name: studentInfo.name,
            level: studentInfo.level,
            avatar: studentInfo.activeAvatar || `https://ui-avatars.com/api/?name=${studentInfo.name}&background=random`
        }
    }).catch(err => {
        Swal.fire('Ralat', 'Gagal menyertai slot: ' + err.message, 'error');
    });
}

// FUNGSI 4: TUKAR NAMA PASUKAN (RTDB)
async function tukarNamaPasukan(teamField, lobiId) {
    const { value: newName } = await Swal.fire({
        title: 'Tukar Nama Pasukan',
        input: 'text',
        inputPlaceholder: 'Cth: HARIMAU MALAYA',
        showCancelButton: true,
        confirmButtonText: 'Tukar',
        cancelButtonText: 'Batal'
    });

    if (newName && newName.trim() !== '') {
        firebase.database().ref('arena_lobbies/' + lobiId).update({
            [teamField]: newName.toUpperCase().substring(0, 15) // Hadkan 15 huruf
        });
    }
}

// ==========================================
// 🚪 FUNGSI KELUAR BILIK SECARA RASMI (RTDB)
// ==========================================
async function tinggalkanBilik() {
    if (!lobiAktifSemasa) {
        kembaliKeSenaraiLobi();
        return;
    }

    Swal.fire({
        title: 'Keluar Bilik...',
        allowOutsideClick: false,
        didOpen: () => { Swal.showLoading(); }
    });

    try {
        const lobiRef = firebase.database().ref('arena_lobbies/' + lobiAktifSemasa);
        const snapshot = await lobiRef.once('value'); // RTDB guna .once('value')
        
        if (snapshot.exists()) {
            const data = snapshot.val();
            let kemaskiniSlot = {}; 
            
            // Perhatian: Guna slash '/' untuk RTDB update (Contoh: teamA/A1)
            ['A1', 'A2', 'A3'].forEach(slot => {
                if (data.teamA && data.teamA[slot] && data.teamA[slot].name === studentInfo.name) {
                    kemaskiniSlot[`teamA/${slot}`] = null; 
                }
            });
            
            ['B1', 'B2', 'B3'].forEach(slot => {
                if (data.teamB && data.teamB[slot] && data.teamB[slot].name === studentInfo.name) {
                    kemaskiniSlot[`teamB/${slot}`] = null; 
                }
            });
            
            if (Object.keys(kemaskiniSlot).length > 0) {
                await lobiRef.update(kemaskiniSlot);
            }
        }
        
        Swal.close();
        kembaliKeSenaraiLobi(); 
        
    } catch (error) {
        console.error("Ralat keluar bilik:", error);
        Swal.close();
        kembaliKeSenaraiLobi(); 
    }
}

// =========================================================================
// FUNGSI KAWALAN PAPARAN: KEMBALI KE SENARAI LOBI
// =========================================================================
function kembaliKeSenaraiLobi() {
    // 1. Dapatkan elemen-elemen HTML
    const lobbyListView = document.getElementById('lobby-list-view');
    const lobbyRoomView = document.getElementById('lobby-room-view');
    const banningView = document.getElementById('banning-view');
    
    // 🔥 KOD BARU: Dapatkan elemen butang KEMBALI
    const btnBack = document.getElementById('btn-back-lobby'); 

    // 2. Sembunyikan Bilik Lobi dan Skrin Banning
    if (lobbyRoomView) {
        lobbyRoomView.classList.add('hidden');
    }
    if (banningView) {
        banningView.classList.add('hidden');
    }

    // 3. Paparkan semula Senarai Lobi Utama
    if (lobbyListView) {
        lobbyListView.classList.remove('hidden');
        lobbyListView.classList.add('block');
    }

    // 4. 🔥 KOD BARU: Munculkan semula butang <-- KEMBALI
    if (btnBack) {
        btnBack.classList.remove('hidden');
    }
}

// ==========================================
// ⚔️ FASA 4: BANNING PHASE (FASA UTAMA RTDB)
// ==========================================
async function masukFasaBanning(lobiId) {
    const lobiRef = firebase.database().ref('arena_lobbies/' + lobiId);
    const snapshot = await lobiRef.once('value');
    
    if (!snapshot.exists()) return;
    const lobi = snapshot.val();
    
    // HANYA KETUA HOS (Slot A1) yang akan tetapkan subjek rawak
    const adakahHostA1 = lobi.teamA && lobi.teamA.A1 && lobi.teamA.A1.name === studentInfo.name;
    
    if (adakahHostA1) {
        const masterSubjek = [
            { id: "bm", name: "BAHASA MELAYU", icon: "📝", color: "from-blue-600 to-indigo-700" },
            { id: "bi", name: "BAHASA INGGERIS", icon: "🔤", color: "from-purple-600 to-pink-600" },
            { id: "mt", name: "MATEMATIK", icon: "🧮", color: "from-amber-500 to-orange-600" },
            { id: "sn", name: "SAINS", icon: "🧪", color: "from-emerald-500 to-teal-600" },
            { id: "sejarah", name: "SEJARAH", icon: "🏛️", color: "from-yellow-700 to-amber-800" },
            { id: "rbt", name: "RBT", icon: "⚙️", color: "from-slate-600 to-slate-800" },
            { id: "psv", name: "SENI VISUAL", icon: "🎨", color: "from-rose-500 to-red-600" },
            { id: "mz", name: "MUZIK", icon: "🎵", color: "from-fuchsia-500 to-violet-600" },
            { id: "pjk", name: "PJK", icon: "⚽", color: "from-green-500 to-emerald-600" },
            { id: "pm", name: "MORAL", icon: "🤝", color: "from-cyan-500 to-sky-600" },
            // 🆕 KEMAS KINI: Menambah PAI & Bahasa Arab ke dalam Pool
            { id: "pai", name: "AGAMA ISLAM", icon: "🕌", color: "from-emerald-600 to-green-800" },
            { id: "ba", name: "BAHASA ARAB", icon: "🐫", color: "from-amber-600 to-yellow-800" }
        ];
        
        // Pilih 9 subjek secara rawak daripada 12 subjek di atas
        const pool9 = masterSubjek.sort(() => 0.5 - Math.random()).slice(0, 9);
        
        let susunanGiliranDinamik = [];
        const susunanAsal = ['A1', 'B1', 'A2', 'B2', 'A3', 'B3'];
        susunanAsal.forEach(slot => {
            const teamKey = slot.startsWith('A') ? 'teamA' : 'teamB';
            if (lobi[teamKey] && lobi[teamKey][slot]) {
                susunanGiliranDinamik.push(slot);
            }
        });

        // Kemaskini bilik ke status 'banning' menggunakan RTDB update
        await lobiRef.update({
            status: "banning",
            banningPool: pool9,
            turnOrder: susunanGiliranDinamik,
            turnIndex: 0,
            currentTurn: susunanGiliranDinamik[0], 
            bans: {
                teamA: [],
                teamB: []
            }
        });
    }
}

// FUNGSI UTAMA: LUKIS & UPDATE PAPARAN BANNING SECARA REAL-TIME
function kemaskiniPaparanBanning(lobi, lobiId) {
    // ========================================================
    // --- KOD PENYELAMAT RTDB (WAJIB ADA) ---
    // ========================================================
    lobi.teamA = lobi.teamA || {};
    lobi.teamB = lobi.teamB || {};
    lobi.bans = lobi.bans || {};
    lobi.bans.teamA = lobi.bans.teamA || [];
    lobi.bans.teamB = lobi.bans.teamB || [];
    // ========================================================

    // 1. Kemaskini nama pasukan pada panel kiri dan kanan
    const banA = document.getElementById('ban-team-a-name');
    const banB = document.getElementById('ban-team-b-name');
    if(banA) banA.textContent = `${lobi.teamAName || 'PASUKAN A'} BAN`;
    if(banB) banB.textContent = `${lobi.teamBName || 'PASUKAN B'} BAN`;

    // 2. Cari kedudukan slot saya sendiri (Cth: saya duduk di A1 atau B1?)
    let slotSaya = null;
    ['A1','A2','A3'].forEach(s => { if(lobi.teamA[s] && lobi.teamA[s].name === studentInfo.name) slotSaya = s; });
    ['B1','B2','B3'].forEach(s => { if(lobi.teamB[s] && lobi.teamB[s].name === studentInfo.name) slotSaya = s; });

    // 3. Kenal pasti siapa yang memegang giliran sekarang
    const slotSemasa = lobi.currentTurn;
    if (!slotSemasa) return; // Jika belum sedia, berhenti sekejap

    const teamSemasa = slotSemasa.startsWith('A') ? 'teamA' : 'teamB';
    const infoPemainSemasa = lobi[teamSemasa][slotSemasa];
    const namaPemainSemasa = infoPemainSemasa ? infoPemainSemasa.name : "Pemain";
    const warnaTeksGiliran = slotSemasa.startsWith('A') ? 'text-red-500' : 'text-blue-400';

    // Update teks papan tanda giliran
    const turnIndicator = document.getElementById('turn-indicator');
    if (turnIndicator) {
        if (slotSaya === slotSemasa) {
            turnIndicator.innerHTML = `⚠️ GILIRAN ANDA (${slotSaya})! PILIH 1 SUBJEK UNTUK DI-BAN!`;
            turnIndicator.className = "text-2xl text-yellow-400 font-bold animate-pulse uppercase tracking-wider";
        } else {
            turnIndicator.innerHTML = `GILIRAN: <span class="${warnaTeksGiliran}">${namaPemainSemasa} (${slotSemasa})</span> SEDANG MEMILIH...`;
            turnIndicator.className = "text-2xl text-gray-400 font-medium";
        }
    }

    // 4. LUKIS 9 KAD SUBJEK DI TENGAH APABILA POOL WUJUD
    const subjectPoolDiv = document.getElementById('subject-pool');
    if (subjectPoolDiv) subjectPoolDiv.innerHTML = ""; // Bersihkan tapak lama

    if (lobi.banningPool && subjectPoolDiv) {
        lobi.banningPool.forEach(subjek => {
            // Semak adakah subjek ini telah di-ban oleh mana-mana pasukan
            const diBanOlehA = lobi.bans.teamA.some(s => s.id === subjek.id);
            const diBanOlehB = lobi.bans.teamB.some(s => s.id === subjek.id);
            const sudahDiBan = diBanOlehA || diBanOlehB;
            const warnaBan = diBanOlehA ? 'border-red-500 bg-red-950/40 text-red-500/50' : 'border-blue-500 bg-blue-950/40 text-blue-500/50';

            const card = document.createElement('div');
            
            if (sudahDiBan) {
                // Rupa kad jika telah di-ban (Tutup / Mati)
                card.className = `relative p-6 rounded-xl border-2 ${warnaBan} flex flex-col items-center justify-center opacity-40 grayscale select-none h-32`;
                card.innerHTML = `
                    <span class="text-3xl mb-1">${subjek.icon}</span>
                    <span class="text-xs font-bold text-center">${subjek.name}</span>
                    <div class="absolute inset-0 flex items-center justify-center bg-black/60 rounded-xl">
                        <span class="text-xl font-black tracking-widest text-white border-2 border-white px-3 py-1 rotate-12 uppercase">BANNED</span>
                    </div>
                `;
            } else {
                // Rupa kad jika masih aktif (Boleh ditekan jika giliran saya)
                const adakahGiliranSaya = (slotSaya === slotSemasa);
                
                card.className = `p-6 rounded-xl bg-gradient-to-br ${subjek.color} text-white flex flex-col items-center justify-center text-center shadow-lg transition-all h-32 select-none ` +
                                 (adakahGiliranSaya ? 'cursor-pointer hover:scale-105 hover:shadow-[0_0_15px_rgba(255,255,255,0.2)]' : 'opacity-80 cursor-not-allowed');
                
                card.innerHTML = `
                    <span class="text-4xl mb-2">${subjek.icon}</span>
                    <span class="text-sm font-black tracking-wide leading-tight">${subjek.name}</span>
                `;

                if (adakahGiliranSaya) {
                    card.onclick = () => jalankanAksiBan(subjek.id, slotSaya, lobi, lobiId);
                }
            }
            subjectPoolDiv.appendChild(card);
        });
    }

    // 5. KEMASKINI SLOT REKOD DI KIRI & KANAN (MAX 3 BAN SETIAP PASUKAN)
    ['A', 'B'].forEach(team => {
        const senaraiBanPasukan = team === 'A' ? lobi.bans.teamA : lobi.bans.teamB;
        const color = team === 'A' ? 'red' : 'blue';
        const container = document.getElementById(`team-${team.toLowerCase()}-bans`);
        
        if (container) {
            container.innerHTML = ""; // Reset slot visual

            for (let i = 0; i < 3; i++) {
                const dataBan = senaraiBanPasukan[i];
                if (dataBan) {
                    container.innerHTML += `
                        <div class="h-12 w-full bg-${color}-950/50 border-2 border-${color}-500/70 rounded-lg flex items-center px-3 gap-2 text-white animate-fadeIn">
                            <span>${dataBan.icon}</span>
                            <span class="text-xs font-bold truncate">${dataBan.name}</span>
                        </div>
                    `;
                } else {
                    container.innerHTML += `
                        <div class="h-12 w-full border border-${color}-500/20 bg-slate-900/40 rounded-lg flex items-center justify-center text-${color}-500/30 text-xs tracking-widest uppercase">
                            Slot Kosong
                        </div>
                    `;
                }
            }
        }
    });
}

// FUNGSI APABILA PEMAIN KLIK PADA KAD SUBJEK UNTUK DISINGKIRKAN
async function jalankanAksiBan(subjekId, slotSaya, lobi, lobiId) {
    const teamSaya = slotSaya.startsWith('A') ? 'teamA' : 'teamB';
    const objekSubjek = lobi.banningPool.find(s => s.id === subjekId);
    
    // Pastikan tatasusunan (array) ban sedia ada wujud sebelum push
    let senaraiBanBaru = lobi.bans && lobi.bans[teamSaya] ? [...lobi.bans[teamSaya]] : [];
    senaraiBanBaru.push(objekSubjek);

    const indeksSeterusnya = lobi.turnIndex + 1;
    const susunanGiliran = lobi.turnOrder;

    let updateData = {};
    updateData[`bans/${teamSaya}`] = senaraiBanBaru; // Cara RTDB kemaskini objek bersarang
    updateData[`turnIndex`] = indeksSeterusnya;

    if (indeksSeterusnya >= susunanGiliran.length) {
        updateData['status'] = "picking"; 
        updateData['currentTurn'] = susunanGiliran[0]; 
        
        Swal.fire({
            title: 'FASA BANNING TAMAT!',
            text: 'Bersedia untuk memilih subjek perlawanan anda!',
            icon: 'success',
            timer: 3000,
            showConfirmButton: false,
            background: '#1e293b',
            color: '#fff'
        });
    } else {
        updateData['currentTurn'] = susunanGiliran[indeksSeterusnya];
    }

    // Hantar data dikemaskini ke RTDB
    await firebase.database().ref('arena_lobbies/' + lobiId).update(updateData);
}

// =========================================================================
// FUNGSI UTAMA: LUKIS & UPDATE PAPARAN PICKING SECARA REAL-TIME
// =========================================================================
function kemaskiniPaparanPicking(lobi, lobiId) {
    // Kod Penyelamat Data Kosong Firebase
    lobi.teamA = lobi.teamA || {};
    lobi.teamB = lobi.teamB || {};
    lobi.bans = lobi.bans || {};
    lobi.bans.teamA = lobi.bans.teamA || [];
    lobi.bans.teamB = lobi.bans.teamB || [];
    
    lobi.picks = lobi.picks || {};
    lobi.picks.teamA = lobi.picks.teamA || {};
    lobi.picks.teamB = lobi.picks.teamB || {};

    // 1. Kemaskini nama pasukan di panel kiri/kanan
    const pickA = document.getElementById('pick-team-a-name');
    const pickB = document.getElementById('pick-team-b-name');
    if(pickA) pickA.textContent = `${lobi.teamAName || 'PASUKAN A'} PICKS`;
    if(pickB) pickB.textContent = `${lobi.teamBName || 'PASUKAN B'} PICKS`;

    // 2. Cari kedudukan slot saya sendiri (A1-A3 atau B1-B3)
    let slotSaya = null;
    ['A1','A2','A3'].forEach(s => { if(lobi.teamA[s] && lobi.teamA[s].name === studentInfo.name) slotSaya = s; });
    ['B1','B2','B3'].forEach(s => { if(lobi.teamB[s] && lobi.teamB[s].name === studentInfo.name) slotSaya = s; });

    // 3. Kenal pasti giliran semasa
    const slotSemasa = lobi.currentTurn;
    const teamSemasa = slotSemasa?.startsWith('A') ? 'teamA' : 'teamB';
    const infoPemainSemasa = lobi[teamSemasa][slotSemasa];
    const namaPemainSemasa = infoPemainSemasa ? infoPemainSemasa.name : "Pemain";
    const warnaTeksGiliran = slotSemasa?.startsWith('A') ? 'text-red-500' : 'text-blue-400';

    // Update teks papan tanda giliran picking
    const turnIndicator = document.getElementById('pick-turn-indicator');
    if (turnIndicator && slotSemasa) {
        if (slotSaya === slotSemasa) {
            turnIndicator.innerHTML = `⚠️ GILIRAN ANDA (${slotSaya})! PILIH 1 SUBJEK UTK BERTEMPUR!`;
            turnIndicator.className = "text-2xl text-yellow-400 font-bold animate-pulse uppercase tracking-wider";
        } else {
            turnIndicator.innerHTML = `GILIRAN: <span class="${warnaTeksGiliran}">${namaPemainSemasa} (${slotSemasa})</span> SEDANG MEMILIH...`;
            turnIndicator.className = "text-2xl text-gray-400 font-medium";
        }
    }

    // 4. LUKIS KAD SUBJEK DI PANEL TENGAH
    const pickingPoolDiv = document.getElementById('picking-pool');
    if (pickingPoolDiv && lobi.banningPool) {
        pickingPoolDiv.innerHTML = ""; // Bersihkan tapak lama

        lobi.banningPool.forEach(subjek => {
            // Semak status subjek: Adakah di-ban atau sudah di-pick?
            const diBanOlehA = lobi.bans.teamA.some(s => s.id === subjek.id);
            const diBanOlehB = lobi.bans.teamB.some(s => s.id === subjek.id);
            const sudahDiBan = diBanOlehA || diBanOlehB;

            // Semak jika ahli pasukan SAYA SENDIRI sudah pick subjek ini
            const myTeamKey = slotSaya?.startsWith('A') ? 'teamA' : 'teamB';
            const sudahDiPickPasukanSaya = Object.values(lobi.picks[myTeamKey]).some(p => p.id === subjek.id);
            
            // Semak jika ada sesiapa (mana-mana pasukan) sudah ambil
            const sudahDiPickPasukanA = Object.values(lobi.picks.teamA).some(p => p.id === subjek.id);
            const sudahDiPickPasukanB = Object.values(lobi.picks.teamB).some(p => p.id === subjek.id);

            const card = document.createElement('div');

            if (sudahDiBan) {
                // Rupa kad jika subjek telah di-BAN semasa fasa lepas
                card.className = `p-4 rounded-xl border-2 border-red-950 bg-red-950/20 text-red-900 flex flex-col items-center justify-center opacity-20 grayscale select-none h-28 relative`;
                card.innerHTML = `<span class="text-2xl">${subjek.icon}</span><span class="text-xs font-bold">${subjek.name}</span><div class="absolute text-[10px] font-black bg-red-600 text-white px-1 rounded rotate-12">BANNED</div>`;
            } 
            else if (sudahDiPickPasukanSaya) {
                // Rupa kad jika RAKAN SEPASUKAN SAYA sudah ambil subjek ini (Lock!)
                card.className = `p-4 rounded-xl border-2 border-slate-700 bg-slate-800 text-slate-500 flex flex-col items-center justify-center opacity-40 select-none h-28 relative`;
                card.innerHTML = `<span class="text-2xl">${subjek.icon}</span><span class="text-xs font-bold">${subjek.name}</span><div class="absolute text-[10px] font-black bg-slate-600 text-white px-1 rounded">TAKEN BY TEAM</div>`;
            } 
            else {
                // Rupa kad jika AKTIF & BOLEH DIPILIH
                const adakahGiliranSaya = (slotSaya === slotSemasa);
                card.className = `p-4 rounded-xl bg-gradient-to-br ${subjek.color} text-white flex flex-col items-center justify-center text-center shadow-md transition-all h-28 select-none ` +
                                 (adakahGiliranSaya ? 'cursor-pointer hover:scale-105' : 'opacity-70 cursor-not-allowed');
                
                // Beri penanda kecil jika musuh yang pick subjek ini (tapi kita masih boleh pick sebab berbeza pasukan)
                let penandaMusuh = "";
                if (myTeamKey === 'teamA' && sudahDiPickPasukanB) penandaMusuh = `<div class="absolute bottom-1 right-1 text-xs">🔵</div>`;
                if (myTeamKey === 'teamB' && sudahDiPickPasukanA) penandaMusuh = `<div class="absolute bottom-1 right-1 text-xs">🔴</div>`;

                card.innerHTML = `
                    <span class="text-3xl mb-1">${subjek.icon}</span>
                    <span class="text-xs font-black tracking-wide leading-tight">${subjek.name}</span>
                    ${penandaMusuh}
                `;

                if (adakahGiliranSaya) {
                    card.onclick = () => jalankanAksiPick(subjek, slotSaya, lobi, lobiId);
                }
            }
            pickingPoolDiv.appendChild(card);
        });
    }

    // 5. KEMASKINI VISUAL SLOT DI KIRI (TEAM A) & KANAN (TEAM B)
    ['A', 'B'].forEach(t => {
        const teamKey = `team${t}`;
        const container = document.getElementById(`team-${t.toLowerCase()}-picks`);
        if (container) {
            container.innerHTML = "";
            ['1', '2', '3'].forEach(num => {
                const slotId = `${t}${num}`;
                const dataPemain = lobi[teamKey][slotId];
                const dataPick = lobi.picks[teamKey][slotId];
                const namaPemain = dataPemain ? dataPemain.name : `Slot ${slotId}`;
                const color = t === 'A' ? 'red' : 'blue';

                if (dataPick) {
                    // Jika slot ini sudah selesai membuat pilihan subjek
                    container.innerHTML += `
                        <div class="p-2 w-full bg-${color}-950/60 border border-${color}-500 rounded-lg flex flex-col gap-1 text-white">
                            <span class="text-[10px] text-gray-400 font-mono">${namaPemain} picked:</span>
                            <div class="flex items-center gap-2">
                                <span class="text-xl">${dataPick.icon}</span>
                                <span class="text-xs font-bold truncate">${dataPick.name}</span>
                            </div>
                        </div>
                    `;
                } else {
                    // Jika slot ini masih belum/sedang menunggu giliran memilih
                    const adakahSedangMemilih = (slotSemasa === slotId) ? `border-yellow-400 bg-yellow-950/20 animate-pulse text-yellow-400` : `border-${color}-500/20 bg-slate-900/40 text-${color}-500/40`;
                    container.innerHTML += `
                        <div class="h-14 w-full border rounded-lg flex flex-col justify-center px-3 ${adakahSedangMemilih}">
                            <span class="text-[10px] font-mono">${namaPemain}</span>
                            <span class="text-[10px] tracking-wider uppercase font-bold">${slotSemasa === slotId ? 'CHOOSING...' : 'WAITING...'}</span>
                        </div>
                    `;
                }
            });
        }
    });
}

// =========================================================================
// FUNGSI AKSI: SIMPAN PILIHAN KE FIREBASE & GERAKKAN GILIRAN / FASA
// =========================================================================
function jalankanAksiPick(subjekObj, slotSaya, lobi, lobiId) {
    // 1. SEMAKAN KESELAMATAN GILIRAN
    if (lobi.currentTurn !== slotSaya) {
        alert('Sabar! Belum giliran anda untuk membuat pilihan.');
        return;
    }

    const teamSaya = slotSaya.startsWith('A') ? 'teamA' : 'teamB';
    
    // 2. SEMAKAN KESELAMATAN SUBJEK: Pastikan ahli sepasukan belum pilih subjek ini
    if (lobi.picks && lobi.picks[teamSaya]) {
        // Dapatkan senarai subjek yang telah dipilih oleh pasukan ini
        const pilihanPasukan = Object.values(lobi.picks[teamSaya]);
        const sudahDipilih = pilihanPasukan.some(s => s.id === subjekObj.id);
        
        if (sudahDipilih) {
            alert('Ahli sepasukan anda telah pun memilih subjek ini! Sila pilih subjek lain.');
            return; // Hentikan fungsi
        }
    }

    // Susunan Aturan Giliran yang Adil
    const aturanTurn = ['A1', 'B1', 'A2', 'B2', 'A3', 'B3'];
    const indexSekeri = aturanTurn.indexOf(slotSaya);
    
    let updates = {};
    
    // 3. Masukkan data subjek ke dalam rekod pick slot pemain (folder arena_lobbies)
    updates[`arena_lobbies/${lobiId}/picks/${teamSaya}/${slotSaya}`] = subjekObj;

    // 4. Semak status giliran seterusnya
    if (indexSekeri + 1 < aturanTurn.length) {
        // Jika masih ada pemain seterusnya, tukar giliran ke pemain itu
        updates[`arena_lobbies/${lobiId}/currentTurn`] = aturanTurn[indexSekeri + 1];
    } else {
        // Jika B3 (pemain terakhir) selesai pick, TUKAR KE BATTLE!
        // 👇 KITA DEFINISIKAN MASA TAMAT DI SINI AGAR TIDAK ERROR
        const masaTamatBattle = Date.now() + (10 * 60 * 1000); // 10 minit dari sekarang (milisaat)
        
        updates[`arena_lobbies/${lobiId}/status`] = 'battle'; 
        updates[`arena_lobbies/${lobiId}/currentTurn`] = 'A1'; // Set giliran menyerang bermula dari A1 semula
        updates[`arena_lobbies/${lobiId}/battleEndTime`] = masaTamatBattle; // 👈 SIMPAN DI FIREBASE
    }

    // 5. Hantar kemaskini serentak ke Firebase RTDB
    firebase.database().ref().update(updates)
    .then(() => {
        console.log(`Berjaya pick ${subjekObj.name} untuk slot ${slotSaya}`);
    })
    .catch(err => console.error("Ralat semasa menyimpan Pick:", err));
}

let pemasaBattleInterval = null; // Pembolehubah global untuk menyimpan tracker interval

function mulakanPemasaBattle(lobiId, lobi) {
    // 1. Bersihkan interval lama jika ada (untuk elakkan pemasa bertindih/laju)
    if (pemasaBattleInterval) clearInterval(pemasaBattleInterval);

    const elemenTimer = document.getElementById('battle-main-timer');
    if (!elemenTimer) return;

    // 2. Dapatkan waktu tamat dari Firebase data lobi
    const targetTime = lobi.battleEndTime;

    if (!targetTime) {
        console.warn("Waktu tamat battle belum ditetapkan di Firebase.");
        return;
    }

    // 3. Jalankan fungsi pengiraan setiap 1 saat
    pemasaBattleInterval = setInterval(() => {
        const masaSekarang = Date.now();
        const bakiMasaMili = targetTime - masaSekarang; // Kira beza masa
        
        // Tukar milisaat kepada jumlah saat keseluruhan
        const bakiMasaSaat = Math.max(0, Math.floor(bakiMasaMili / 1000));

        // Kira Minit & Saat untuk paparan UI
        const minit = Math.floor(bakiMasaSaat / 60);
        const saat = bakiMasaSaat % 60;

        // Formatkan supaya sentiasa ada 2 digit (Cth: 09:05, bukan 9:5)
        const paparanMinit = minit.toString().padStart(2, '0');
        const paparanSaat = saat.toString().padStart(2, '0');

        // Kemaskini teks pada UI skrin battle
        elemenTimer.innerText = `${paparanMinit}:${paparanSaat}`;

        // 4. JIKA MASA SUDAH TAMAT (00:00)
        if (bakiMasaSaat <= 0) {
            clearInterval(pemasaBattleInterval); // Hentikan pemasa lokal
            tamatkanPertempuran(lobiId); // Panggil fungsi tamat perlawanan
        }
    }, 1000);
}

function tamatkanPertempuran(lobiId) {
    console.log("Masa tamat! Menukar status perlawanan di Firebase...");
    
    // 🛑 1. Matikan pemasa lokal serta-merta untuk keselamatan
    if (typeof pemasaBattleInterval !== 'undefined' && pemasaBattleInterval) {
        clearInterval(pemasaBattleInterval);
    }

    // 🚀 2. TERUS KEMASKINI RTDB (Direct & Kalis Ralat)
    let updates = {};
    updates[`arena_lobbies/${lobiId}/status`] = 'battle_analysis'; 

    firebase.database().ref().update(updates)
    .then(() => {
        console.log("RTDB berjaya dikemaskini: status -> battle_analysis");
    })
    .catch(err => {
        console.error("Ralat terus ke RTDB untuk tamatkan perlawanan:", err);
    });
}

// Pembolehubah global
let senaraiSoalanSemasa = [];
let soalanAktif = null;
let subjekSediaAda = "";
let boosterAktif = null;
let bakiSoalanBooster = 0;
let myLivePoints = 0;
let currentStreak = 0;
let longestStreak = 0;
let myBoostersUsed = 0;
let myBoostersReceived = 0;
let bakiSoalanMudahPaksaan = 0;
let isGanjaranDisimpan = false;
let isGanjaranPvPDisimpan = false;

// =========================================================================
// 1. FUNGSI: KEMASKINI UI PROFIL & SUBJEK DARI FIREBASE (VERSI PENUH 6 PEMAIN)
// =========================================================================
function kemaskiniPaparanBattle(lobi, lobiId, slotSaya) {
    if (!lobi) return;
    const teamSaya = slotSaya.startsWith('A') ? 'teamA' : 'teamB';

    try {
        // ==========================================
        // A. KEMASKINI PROFIL SAYA (DIRI SENDIRI)
        // ==========================================
        let namaPemainSebenar = "Pemain " + slotSaya;
        let avatarPemainSebenar = "";

        // Tarik data terus dari lobi.teamA atau lobi.teamB (Mengikut struktur asal Cikgu)
        if (lobi[teamSaya] && lobi[teamSaya][slotSaya]) {
            let dataSaya = lobi[teamSaya][slotSaya];
            namaPemainSebenar = dataSaya.name || namaPemainSebenar;
            
            let rawAvatar = dataSaya.avatar || "";
            // Bersihkan format gambar jika ada simbol pelik
            avatarPemainSebenar = rawAvatar.replace(/\|/g, '/').replace(/%7C/gi, '/').replace('img/', '');
        }

        // Suntik ke UI Diri Sendiri
        if (document.getElementById('my-battle-name')) document.getElementById('my-battle-name').innerText = namaPemainSebenar;
        if (document.getElementById('my-battle-avatar') && avatarPemainSebenar) {
            document.getElementById('my-battle-avatar').innerHTML = `<img src="${avatarPemainSebenar}" class="w-full h-full object-cover rounded-xl" alt="Avatar">`;
        }
        if (document.getElementById('my-battle-slot')) document.getElementById('my-battle-slot').innerText = slotSaya;


        // ==========================================
        // B. KEMASKINI SEMUA 6 PEMAIN LAIN DI SKRIN
        // ==========================================
        const teams = ['A', 'B'];
        teams.forEach(t => {
            let namaTeam = t === 'A' ? 'teamA' : 'teamB';
            
            // Jika ada orang dalam pasukan ini
            if (lobi[namaTeam]) {
                for (let i = 1; i <= 3; i++) {
                    let idSlot = `${t}${i}`; // Akan jadi A1, A2, A3, B1, B2, B3
                    let dataPemainLain = lobi[namaTeam][idSlot];

                    // Jika kerusi itu ada orang duduk
                    if (dataPemainLain) {
                        let nama = dataPemainLain.name;
                        let rawAv = dataPemainLain.avatar || "";
                        let avatar = rawAv.replace(/\|/g, '/').replace(/%7C/gi, '/').replace('img/', '');

                        // SUNTIK KE HTML SKRIN BATTLE 
                        // (Nota: Pastikan ID HTML Cikgu sepadan dengan nama di bawah)
                        let elemenNama = document.getElementById(`battle-name-${idSlot}`);
                        if (elemenNama) elemenNama.innerText = nama;

                        let elemenAvatar = document.getElementById(`battle-avatar-${idSlot}`);
                        if (elemenAvatar) {
                            elemenAvatar.innerHTML = `<img src="${avatar}" class="w-full h-full object-cover rounded-full" alt="Avatar ${idSlot}">`;
                        }
                    }
                }
            }
        });


        // ==========================================
        // C. TARIK DATA SUBJEK & MUAT SOALAN
        // ==========================================
        let namaSubjekSaya = "Tiada Subjek";
        let idSubjekSaya = "";

        if (lobi.picks && lobi.picks[teamSaya] && lobi.picks[teamSaya][slotSaya]) {
            namaSubjekSaya = lobi.picks[teamSaya][slotSaya].name || "Subjek Misteri"; 
            idSubjekSaya = lobi.picks[teamSaya][slotSaya].id || "";     
        }

        if (document.getElementById('my-active-subject')) document.getElementById('my-active-subject').innerText = namaSubjekSaya;

        // Logik Muat Soalan Sekali Sahaja
        if (idSubjekSaya && subjekSediaAda !== idSubjekSaya) {
            subjekSediaAda = idSubjekSaya;
            sediakanSoalanPertamaPemain(idSubjekSaya);
        }

    } catch (error) {
        console.error("Ralat pada kemaskiniPaparanBattle: ", error);
    }
}

// Tambah pembolehubah global baru ini di bahagian luar (atas) fungsi
let senaraiSoalanSukar = []; 

// =========================================================================
// 2. FUNGSI: PADANKAN ID SUBJEK & FORMAT DATA SECARA DINAMIK (3v3)
// =========================================================================
function sediakanSoalanPertamaPemain(kodSubjek, dataLobi) {
    senaraiSoalanSemasa = []; 
    senaraiSoalanSukar = []; 
    senaraiSoalanMudah = []; 
    let dataKasar = null;
    let jenisFormatObjektif = true;

// Pastikan ID ini sama dengan ID di RTDB Cikgu
    switch(kodSubjek) {
        case 'bm': dataKasar = typeof malayLanguageData !== 'undefined' ? malayLanguageData : null; break;
        case 'bi': dataKasar = typeof gameData !== 'undefined' ? gameData : null; break; 
        case 'mt': dataKasar = typeof mathData !== 'undefined' ? mathData : null; break;
        case 'sn': dataKasar = typeof scienceData !== 'undefined' ? scienceData : null; break;
        case 'sejarah': dataKasar = typeof sejarahData !== 'undefined' ? sejarahData : null; break;
        case 'mz': dataKasar = typeof pendidikanMuzikData !== 'undefined' ? pendidikanMuzikData : null; break;
        
        // 🔥 KEMASKINI BARU: Kenal pasti semua ID PJK dan set sebagai OBJEKTIF 🔥
        case 'pjk': 
        case 'pj':
        case 'pk':
        case 'kesihatan':
            dataKasar = typeof pjkData !== 'undefined' ? pjkData : null; 
            jenisFormatObjektif = true; // <--- WAJIB TAMBAH BARIS INI!
            break;
            
        case 'pm': dataKasar = typeof moralData !== 'undefined' ? moralData : null; break;
        case 'psv': dataKasar = typeof psvData !== 'undefined' ? psvData : null; break;
        case 'rbt': dataKasar = typeof rbtData !== 'undefined' ? rbtData : null; break;
        
        case 'pai': 
            dataKasar = typeof paiQuestions !== 'undefined' ? paiQuestions : null; 
            jenisFormatObjektif = true; 
            break;
        case 'ba': 
            dataKasar = typeof baQuestions !== 'undefined' ? baQuestions : null; 
            jenisFormatObjektif = true; 
            break;
    }
    
    if (!dataKasar) {
        if(document.getElementById('quiz-question-text')) {
            document.getElementById('quiz-question-text').innerText = "Ralat: Fail data bagi subjek " + kodSubjek + " tidak dijumpai di dalam HTML!";
        }
        return;
    }

// Longgokkan kesemua soalan dari pelbagai kategori (campur aras)
    for (let kategori in dataKasar) {
        if (dataKasar.hasOwnProperty(kategori)) {
            let susunanKategori = dataKasar[kategori];
            
            // 🔥 KOD BARU: Sistem Auto-Kesan Format Soalan (MCQ / Struktur) 🔥
            let senaraiDiproses = susunanKategori.map(item => {
                // Jika soalan ini ada 'options' (Format Objektif A,B,C,D)
                if (item.options && Array.isArray(item.options)) {
                    return {
                        q: item.question || item.q, // Ambil 'question', jika tiada ambil 'q'
                        options: item.options,
                        a: item.answer !== undefined ? item.answer : item.a
                    };
                } 
                // Jika soalan ini TIADA 'options' (Format Struktur/Subjektif)
                else {
                    return {
                        q: item.q || item.question,
                        a: item.a || item.answer
                    };
                }
            });

            senaraiSoalanSemasa = senaraiSoalanSemasa.concat(senaraiDiproses);
            
            // 💥 KOD PENGASINGAN ARAS SOALAN 💥
            let namaKategori = String(kategori).toLowerCase();
            if (namaKategori.includes('sukar') || namaKategori.includes('hard') || namaKategori.includes('tinggi') || namaKategori.includes('3') || namaKategori.includes('adab') || namaKategori.includes('sirah')) {
                senaraiSoalanSukar = senaraiSoalanSukar.concat(senaraiDiproses);
            }
            if (namaKategori.includes('mudah') || namaKategori.includes('easy') || namaKategori.includes('rendah') || namaKategori.includes('1') || namaKategori.includes('aqidah') || namaKategori.includes('mufrodat')) {
                senaraiSoalanMudah = senaraiSoalanMudah.concat(senaraiDiproses);
            }
        }
    }

    // Fail-safe jika tong pengasingan kosong
    if (senaraiSoalanSukar.length === 0) {
        let kunciKategori = Object.keys(dataKasar);
        if (kunciKategori.length > 0) {
            let kategoriTerakhir = kunciKategori[kunciKategori.length - 1];
            if (jenisFormatObjektif) {
                senaraiSoalanSukar = dataKasar[kategoriTerakhir].map(item => ({
                    q: item.question, options: item.options, a: item.answer
                }));
            } else {
                senaraiSoalanSukar = dataKasar[kategoriTerakhir];
            }
        } else {
            senaraiSoalanSukar = senaraiSoalanSemasa;
        }
    }

    if (senaraiSoalanMudah.length === 0) {
        senaraiSoalanMudah = senaraiSoalanSemasa;
    }
    
    // Simpan rujukan lobi ke skop global untuk semakan masa tamat (kalis ralat)
    if (dataLobi) window.rtdbLobiDataSemasa = dataLobi;

    paparSoalanBaru();
}

// =========================================================================
// 3. FUNGSI: PAPAR SOALAN & TUKAR UI SECARA DINAMIK (TAIP VS OBJEKTIF)
// =========================================================================
function paparSoalanBaru() {
    if (senaraiSoalanSemasa.length === 0) return;

    let bankSoalan = senaraiSoalanSemasa; 

    // 💥 SEMAK IMPAK BOOSTER (SHINING / CHALLENGER) 💥
    if (typeof bakiSoalanMudahPaksaan !== 'undefined' && bakiSoalanMudahPaksaan > 0) {
        if (typeof senaraiSoalanMudah !== 'undefined' && senaraiSoalanMudah.length > 0) {
            bankSoalan = senaraiSoalanMudah; 
        }
        bakiSoalanMudahPaksaan--; 
        console.log(`[Shining] Soalan Mudah dipaksa! Baki ganjaran: ${bakiSoalanMudahPaksaan}`);
    } 
    else if (typeof bakiSoalanSukarPaksaan !== 'undefined' && bakiSoalanSukarPaksaan > 0) {
        if (typeof senaraiSoalanSukar !== 'undefined' && senaraiSoalanSukar.length > 0) {
            bankSoalan = senaraiSoalanSukar; 
        }
        bakiSoalanSukarPaksaan--; 
        console.log(`[Challenger] Soalan Sukar dipaksa! Baki hukuman: ${bakiSoalanSukarPaksaan}`);
    }

    // Ambil soalan rawak
    const indexRawak = Math.floor(Math.random() * bankSoalan.length);
    soalanAktif = bankSoalan[indexRawak];

    // Paparkan teks soalan utama
    document.getElementById('quiz-question-text').innerText = soalanAktif.q;
    
    // Dapatkan elemen kontena UI
    const containerTaip = document.getElementById('container-input-taip'); 
    const containerObjektif = document.getElementById('container-input-objektif'); 
    const kotakInput = document.getElementById('input-jawapan-taip');
    const butangHantar = document.getElementById('btn-hantar-jawapan');

    // 💥 LOGIK PERTUKARAN SKRIN INTERFAKS 💥
    if (soalanAktif.options) {
        // Papar UI Objektif, Sembunyikan Kotak Taip
        if (containerTaip) containerTaip.style.display = 'none';
        if (containerObjektif) containerObjektif.style.display = 'block';

        // Kemaskini teks pada ke-4 butang objektif (Sama konsep macam pvp)
        for(let i = 0; i < 4; i++) {
            let btn = document.getElementById('battle-btn-mcq-' + i);
            if(btn) {
                btn.innerText = soalanAktif.options[i] || "";
                btn.disabled = false;
                btn.classList.remove('bg-red-500', 'bg-emerald-500', 'animate-shake'); 
            }
        }
    } else {
        // Papar UI Kotak Taip, Sembunyikan Objektif
        if (containerTaip) containerTaip.style.display = 'block';
        if (containerObjektif) containerObjektif.style.display = 'none';

        // Reset tetapan kotak taip asal
        kotakInput.value = "";
        kotakInput.disabled = false;
        butangHantar.disabled = false;
        kotakInput.classList.remove('border-red-500', 'border-emerald-500', 'bg-red-900/30', 'bg-emerald-900/30');
        kotakInput.focus(); 
    }
}

// =========================================================================
// 4A. FUNGSI SEMAK JAWAPAN: JIKA MURID KLIK BUTANG OBJEKTIF (PAI / BA)
// =========================================================================
function hantarJawapanObjektif(selectedIndex) {
    // Pengahadang masa tamat menggunakan objek pembantu global window
    if (window.rtdbLobiDataSemasa && window.rtdbLobiDataSemasa.battleEndTime) {
        if (Date.now() >= window.rtdbLobiDataSemasa.battleEndTime) {
            console.log("Masa tamat! Pilihan ditolak.");
            return;
        }
    }

    // Kunci semua butang objektif serta merta semasa animasi jawapan diproses
    for(let i = 0; i < 4; i++) {
        let btn = document.getElementById('battle-btn-mcq-' + i);
        if(btn) btn.disabled = true;
    }

    const btnDitekan = document.getElementById('battle-btn-mcq-' + selectedIndex);
    const indexJawapanBetul = soalanAktif.a; 

    // Bandingkan indeks butang dengan indeks skema jawapan
    if (parseInt(selectedIndex) === parseInt(indexJawapanBetul)) {
        if(btnDitekan) btnDitekan.classList.add('bg-emerald-500');
        prosesKiraanMarkahDanStreak(true); // Isyarat Betul
    } else {
        if(btnDitekan) btnDitekan.classList.add('animate-shake', 'bg-red-500');
        prosesKiraanMarkahDanStreak(false); // Isyarat Salah
    }

    // Beri masa 1 saat untuk kesan visual hijau/merah sebelum tukar soalan
    setTimeout(() => paparSoalanBaru(), 1000);
}

// =========================================================================
// 4B. FUNGSI SEMAK JAWAPAN: JIKA MURID MENGGUNAKAN KOTAK TAIP (BM, MT, DLL)
// =========================================================================
function semakTekanEnter(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        hantarJawapanTaip();
    }
}

function hantarJawapanTaip() {
    if (window.rtdbLobiDataSemasa && window.rtdbLobiDataSemasa.battleEndTime) {
        if (Date.now() >= window.rtdbLobiDataSemasa.battleEndTime) {
            console.log("Masa perlawanan telah tamat! Jawapan ditolak.");
            return;
        }
    }

    const kotakInput = document.getElementById('input-jawapan-taip');
    const butangHantar = document.getElementById('btn-hantar-jawapan');
    let jawapanMurid = kotakInput.value.trim().toLowerCase();
    
    if (jawapanMurid === "") return;

    kotakInput.disabled = true;
    butangHantar.disabled = true;

    let jawapanSkema = String(soalanAktif.a).toLowerCase().split(" atau "); 
    let adakahBetul = jawapanSkema.includes(jawapanMurid);

    if (adakahBetul) {
        kotakInput.classList.add('border-emerald-500', 'bg-emerald-900/30');
        prosesKiraanMarkahDanStreak(true);
    } else {
        kotakInput.classList.add('border-red-500', 'bg-red-900/30');
        prosesKiraanMarkahDanStreak(false);
    }

    setTimeout(() => paparSoalanBaru(), 1000);
}

// =========================================================================
// 5. ENJIN UTAMA: PROSES KIRAAN SKOR, STREAK, DETEKSI BOOSTER & SINKRONISASI RTDB
// =========================================================================
function prosesKiraanMarkahDanStreak(adakahBetul) {
    if (adakahBetul) {
        currentStreak++;
        if (currentStreak > longestStreak) longestStreak = currentStreak;

        let mataDiperoleh = 1;
        
        if (boosterAktif === 'x2') {
            mataDiperoleh = 2;
            bakiSoalanBooster--;
        } else if (boosterAktif === 'x3') {
            mataDiperoleh = 3;
            bakiSoalanBooster--;
        }

        myLivePoints += mataDiperoleh;

        if ((boosterAktif === 'x2' || boosterAktif === 'x3') && bakiSoalanBooster <= 0) {
            boosterAktif = null;
        } 
        else if (boosterAktif === 'shining' && bakiSoalanMudahPaksaan <= 0) {
            boosterAktif = null;
        }

    } else {
        currentStreak = 0;
        boosterAktif = null; 
        bakiSoalanBooster = 0;
        bakiSoalanMudahPaksaan = 0; 

        myLivePoints = Math.max(0, myLivePoints - 1);
    }

    // Kemaskini Visual Papan Skor Pemain (UI Teman Lokal)
    if(document.getElementById('my-live-points')) document.getElementById('my-live-points').innerText = myLivePoints;
    if(document.getElementById('quiz-current-streak')) document.getElementById('quiz-current-streak').innerText = currentStreak;
    if(document.getElementById('my-longest-streak')) document.getElementById('my-longest-streak').innerText = longestStreak;

    // HANTAR SERENTAK DATA TERBARU KE DATABASE REALTIME FIREBASE
    const elemenSlot = document.getElementById('my-battle-slot');
    const mySlot = elemenSlot ? elemenSlot.innerText : '';

    if (lobiAktifSemasa && mySlot) {
        const teamSaya = mySlot.startsWith('A') ? 'teamA' : 'teamB';
        firebase.database().ref(`arena_lobbies/${lobiAktifSemasa}/${teamSaya}/${mySlot}`).update({
            points: myLivePoints,
            longestStreak: longestStreak
        });
    }

    // Segarkan rupa panel booster jika fungsi tersebut wujud
    if (typeof kemaskiniPanelBooster === 'function') kemaskiniPanelBooster();
}

// =========================================================================
// FUNGSI BARU 1: APABILA MURID KLIK KAD BOOSTER SECARA MANUAL
// =========================================================================
function pilihBooster(jenis) {
    // Tetapkan syarat minimum (harga) streak 
    const syaratStreak = { 'x2': 5, 'x3': 7, 'shining': 10, 'mist': 15, 'challenger': 20, 'switch': 25 };

    // 1. Sekat jika streak murid belum mencukupi syarat kelayakan
    if (currentStreak < syaratStreak[jenis]) {
        Swal.fire({
            icon: 'error',
            title: 'Booster Terkunci!',
            text: `Perlu capai sekurang-kurangnya ${syaratStreak[jenis]} Streak dahulu!`,
            timer: 2000,
            showConfirmButton: false
        });
        return;
    }

    // 2. Sekat jika murid cuba aktifkan ketika ada booster lain sedang berjalan
    if (boosterAktif !== null) {
        Swal.fire({
            icon: 'warning',
            title: 'Booster Sedang Berjalan',
            text: 'Tunggu booster sedia ada tamat dahulu.',
            timer: 2000,
            showConfirmButton: false
        });
        return;
    }

    // 💥 3. TOLAK STREAK (PILIHAN B: Tolak ikut harga booster)
    currentStreak -= syaratStreak[jenis];
    
    // Kemaskini paparan nombor streak yang baru di skrin HTML
    document.getElementById('quiz-current-streak').innerText = currentStreak;

    // 4. Murid sah klik & guna booster tersebut!
    boosterAktif = jenis;

    // 💥 TAMBAHAN LOGIKA: Hitung dan Sync penggunaan booster ke Firebase 💥
    myBoostersUsed++;
    
    const elemenSlot = document.getElementById('my-battle-slot');
    const mySlot = elemenSlot ? elemenSlot.innerText : '';
    
    if (lobiAktifSemasa && mySlot) {
        const teamSaya = mySlot.startsWith('A') ? 'teamA' : 'teamB';
        firebase.database().ref(`arena_lobbies/${lobiAktifSemasa}/${teamSaya}/${mySlot}`).update({
            boostersUsed: myBoostersUsed
        });
    }

    // 5. Paparkan notifikasi dan jalankan kesan booster
    if (jenis === 'x2' || jenis === 'x3') {
        bakiSoalanBooster = 3; // Mengikut spek: Sah untuk 3 soalan seterusnya
        Swal.fire({ icon: 'success', title: `Booster ${jenis.toUpperCase()} Aktif!`, text: 'Mata ganda untuk 3 soalan bermula sekarang.', timer: 2000, showConfirmButton: false });
    } 
    else if (jenis === 'shining') {
        // 💥 KEMASKINI DI SINI: Set baki 5 soalan mudah
        bakiSoalanMudahPaksaan = 5; 
        Swal.fire({ icon: 'success', title: 'Shining Buff Aktif!', text: '5 soalan seterusnya dijatuhkan ke Aras Mudah (Easy Qs)!', timer: 2000, showConfirmButton: false });
    }
    else if (jenis === 'mist') {
        Swal.fire({ icon: 'info', title: 'Mist Attack!', text: 'Serangan pandangan kabur dihantar ke pihak lawan!', timer: 2000, showConfirmButton: false });

        // 💥 PANGGIL FUNGSI SERANGAN KE FIREBASE DI SINI 💥
        hantarSeranganBooster('mist');
    }
    else if (jenis === 'challenger') {
        Swal.fire({ icon: 'warning', title: 'Challenger Aktif!', text: 'Lawan menerima cabaran Aras Sukar (Hard Qs)!', timer: 2000, showConfirmButton: false });

        // 💥 PANGGIL FUNGSI SERANGAN KE FIREBASE DI SINI 💥
        hantarSeranganBooster('challenger');
    }
    else if (jenis === 'switch') {
        Swal.fire({ icon: 'warning', title: 'Switch Aktif!', text: 'Seluruh pasukan lawan terkena sumpahan!', timer: 2000, showConfirmButton: false });
        
        // Hantar serangan ke Firebase
        hantarSeranganBooster('switch');
    }

    // 6. Kemaskini UI panel 
    // (Kad-kad lain secara automatik akan malap/terkunci semula kerana baki streak dah berkurang)
    kemaskiniPanelBooster();
}

// =========================================================================
// FUNGSI BARU 2: URUS RUPA KAD (TERKUNCI / BOLEH KLIK / SEDANG DIGUNAKAN)
// =========================================================================
function kemaskiniPanelBooster() {
    const syarat = { 'x2': 5, 'x3': 7, 'shining': 10, 'mist': 15, 'challenger': 20, 'switch': 25 };
    
    function setGayaKad(idElemen, jenis, warnaTema) {
        const elemen = document.getElementById(idElemen);
        if (!elemen) return;

        // Bersihkan kelas khas lama terlebih dahulu
        elemen.classList.remove('opacity-40', 'opacity-100', 'border-slate-800', 'scale-105', 'cursor-pointer', 'ring-4', 'ring-amber-400');
        elemen.classList.remove('border-emerald-500', 'border-teal-500', 'border-amber-500', 'border-purple-500', 'border-rose-500', 'border-indigo-500');

        const layakGuna = currentStreak >= syarat[jenis];
        const sedangAktif = boosterAktif === jenis;

        if (sedangAktif) {
            // RUPA: Tengah digunakan (Terang + Ada border warna + Ring bersinar kuning)
            elemen.classList.add('opacity-100', 'scale-105', 'ring-4', 'ring-amber-400', warnaTema);
        } else if (layakGuna) {
            // RUPA: Layak tapi belum diklik (Terang + Boleh Klik + Hover)
            elemen.classList.add('opacity-100', 'cursor-pointer', 'hover:scale-105', warnaTema);
        } else {
            // RUPA: Terkunci (Malap)
            elemen.classList.add('opacity-40', 'border-slate-800');
        }
    }

    setGayaKad('booster-card-x2', 'x2', 'border-emerald-500');
    setGayaKad('booster-card-x3', 'x3', 'border-teal-500');
    setGayaKad('booster-card-shining', 'shining', 'border-amber-500');
    setGayaKad('booster-card-mist', 'mist', 'border-purple-500');
    setGayaKad('booster-card-challenger', 'challenger', 'border-rose-500');
    setGayaKad('booster-card-switch', 'switch', 'border-indigo-500');
}

// =========================================================================
// FUNGSI 3: HANTAR SERANGAN BOOSTER KE FIREBASE
// =========================================================================
function hantarSeranganBooster(jenisBooster) {
    const mySlot = document.getElementById('my-battle-slot').innerText; 
    const isTeamA = mySlot.startsWith('A'); 
    const teamLawan = isTeamA ? 'teamB' : 'teamA';
    const slotLawan = isTeamA ? ['B1', 'B2', 'B3'] : ['A1', 'A2', 'A3'];
    
    if (jenisBooster === 'mist') {
        // MIST: 1 pemain rawak
        const slotRawak = slotLawan[Math.floor(Math.random() * slotLawan.length)];
        if (lobiAktifSemasa) {
            firebase.database().ref(`arena_lobbies/${lobiAktifSemasa}/${teamLawan}/${slotRawak}`).update({
                debuff: 'mist',
                debuffTime: firebase.database.ServerValue.TIMESTAMP
            });
        }
    } 
    else if (jenisBooster === 'challenger') {
        // CHALLENGER: 2 pemain rawak
        // Cara goncang (shuffle) susunan pemain lawan
        let lawanDigoncang = slotLawan.sort(() => 0.5 - Math.random());
        
        // Ambil 2 pemain teratas dari senarai yang dah digoncang
        let mangsaChallenger = lawanDigoncang.slice(0, 2);

        if (lobiAktifSemasa) {
            // Hantar serangan ke setiap mangsa
            mangsaChallenger.forEach(slot => {
                firebase.database().ref(`arena_lobbies/${lobiAktifSemasa}/${teamLawan}/${slot}`).update({
                    debuff: 'challenger',
                    debuffTime: firebase.database.ServerValue.TIMESTAMP
                });
            });
            console.log(`Challenger dihantar ke: ${mangsaChallenger.join(', ')}`);
        }
    }
    else if (jenisBooster === 'switch') {
        // SWITCH: Ambil keseluruhan pakej data subjek dari node 'picks', putarkan, dan hantar semula!
        if (lobiAktifSemasa) {
            firebase.database().ref(`arena_lobbies/${lobiAktifSemasa}`).once('value').then((snapshot) => {
                const lobi = snapshot.val();
                
                // Pastikan lobi, node picks, dan data kumpulan lawan di dalam picks wujud
                if (lobi && lobi.picks && lobi.picks[teamLawan]) {
                    
                    let subjekAsal = [];
                    // 1. Kumpul data subjek yang lengkap (objek) dari node 'picks' setiap pemain lawan.
                    for (let slot of slotLawan) {
                        let dataPicksLawan = lobi.picks[teamLawan][slot];
                        
                        // 💥 KOD KESELAMATAN: Pastikan data subjek wujud di bawah node 'picks'
                        if (!dataPicksLawan || !dataPicksLawan.id || !dataPicksLawan.name) {
                            console.error(`[SWITCH] Ralat: Data di picks/${teamLawan}/${slot} tidak lengkap.`, dataPicksLawan);
                            
                            Swal.fire({
                                icon: 'error',
                                title: 'Gagal Lancar!',
                                text: 'Gagal mengumpul data pilihan subjek pasukan lawan.',
                                timer: 3000,
                                showConfirmButton: false
                            });
                            return; // Batalkan fungsi terus jika tidak lengkap
                        }
                        
                        let dataSubj = {
                            id: dataPicksLawan.id,
                            name: dataPicksLawan.name,
                            icon: dataPicksLawan.icon || '📝',
                            color: dataPicksLawan.color || ''
                        };
                        subjekAsal.push(dataSubj);
                    }

                    // 💥 SEKATAN TAMBAHAN: Pastikan kita berjaya kumpul tepat 3 subjek 💥
                    if (subjekAsal.length !== 3) {
                        console.error(`[SWITCH] Ralat: Kita kumpul ${subjekAsal.length} subjek, sedangkan sepatutnya 3. Membatalkan.`, subjekAsal);
                        return;
                    }

                    // 2. Putarkan subjek (Kebarangkalian 50% pusing Kanan, 50% pusing Kiri)
                    let subjekBaru = [];
                    let arahPutaran = Math.random() < 0.5 ? 1 : -1;
                    
                    if (arahPutaran === 1) { // Pusing Kanan (A, B, C -> C, A, B)
                        subjekBaru = [subjekAsal[2], subjekAsal[0], subjekAsal[1]];
                    } else { // Pusing Kiri (A, B, C -> B, C, A)
                        subjekBaru = [subjekAsal[1], subjekAsal[2], subjekAsal[0]];
                    }

                    // 3. Sediakan kemaskini pukal (Update node 'picks' & Hantar 'debuff' ke node pemain)
                    let kemaskini = {};
                    slotLawan.forEach((slot, index) => {
                        // Kemaskini subjek secara rasmi di bawah node 'picks'
                        kemaskini[`picks/${teamLawan}/${slot}/id`] = subjekBaru[index].id; 
                        kemaskini[`picks/${teamLawan}/${slot}/name`] = subjekBaru[index].name; 
                        kemaskini[`picks/${teamLawan}/${slot}/icon`] = subjekBaru[index].icon; 
                        kemaskini[`picks/${teamLawan}/${slot}/color`] = subjekBaru[index].color; 
                        
                        // Hantar sumpahan 'switch' ke node profil pemain asal
                        kemaskini[`${teamLawan}/${slot}/debuff`] = 'switch';
                        kemaskini[`${teamLawan}/${slot}/debuffTime`] = firebase.database.ServerValue.TIMESTAMP;
                    });

                    // Lakukan kemaskini (update) pukal ke Firebase
                    firebase.database().ref(`arena_lobbies/${lobiAktifSemasa}`).update(kemaskini);
                    console.log(`[SWITCH] Putaran subjek pada node 'picks' berjaya dihantar ke RTDB pasukan lawan!`);
                } else {
                    console.error("[SWITCH] Struktur node 'picks' tidak ditemui dalam lobi ini.");
                }
            });
        }
    }
}

// =========================================================================
// FUNGSI BANTU: KEMASKINI REKOD MANGSA BOOSTER KE FIREBASE
// =========================================================================
function kemaskiniBoosterReceivedKeFirebase() {
    const elemenSlot = document.getElementById('my-battle-slot');
    const mySlot = elemenSlot ? elemenSlot.innerText : '';
    
    if (lobiAktifSemasa && mySlot) {
        const teamSaya = mySlot.startsWith('A') ? 'teamA' : 'teamB';
        firebase.database().ref(`arena_lobbies/${lobiAktifSemasa}/${teamSaya}/${mySlot}`).update({
            boostersReceived: myBoostersReceived
        });
    }
}

// =========================================================================
// FUNGSI BARU 4: KESAN VISUAL MIST (SKRIN KABUR UNTUK MANGSA)
// =========================================================================
function aktifkanKesanMist() {
    myBoostersReceived++;
    kemaskiniBoosterReceivedKeFirebase();

    // 1. Bunyi amaran kecil / Toast pop-up di penjuru skrin
    Swal.fire({
        icon: 'warning',
        title: 'MIST ATTACK!',
        text: 'Pandangan anda diganggu oleh asap pihak lawan!',
        timer: 3000,
        showConfirmButton: false,
        toast: true,
        position: 'top-end'
    });

    // 2. Cipta elemen overlay kabur di dalam HTML secara dinamik (jika belum ada)
    let overlay = document.getElementById('mist-blur-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'mist-blur-overlay';
        
        overlay.className = 'fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[9999] pointer-events-none flex items-center justify-center transition-all duration-500';
        
        overlay.innerHTML = `
            <div class="text-center p-6 bg-slate-800/90 border border-purple-500/50 rounded-2xl shadow-2xl animate-pulse">
                <i class="fas fa-smog text-6xl text-purple-400 mb-2"></i>
                <h2 class="text-xl font-black text-white uppercase tracking-wider">Skrin Berkabut!</h2>
                <p class="text-xs text-slate-300 mt-1">Sumpahan asap akan hilang dalam beberapa saat...</p>
            </div>
        `;
        document.body.appendChild(overlay);
    }

    // 3. Tetapkan pemasa (Timer) selama 8 saat (8000ms) untuk hilangkan kabur
    setTimeout(() => {
        const overlayWujud = document.getElementById('mist-blur-overlay');
        if (overlayWujud) {
            overlayWujud.classList.add('opacity-0');
            setTimeout(() => {
                overlayWujud.remove();
            }, 500);
        }
    }, 8000); 
}

// =========================================================================
// FUNGSI 5: KESAN CHALLENGER (MANGSA DIPAKSA JAWAB SOALAN SUSAH)
// =========================================================================
let bakiSoalanSukarPaksaan = 0; 

function aktifkanKesanChallenger() {
    myBoostersReceived++;
    kemaskiniBoosterReceivedKeFirebase();

    // 1. Beri amaran keras kepada mangsa
    Swal.fire({
        icon: 'error',
        title: 'CHALLENGER DITERIMA!',
        text: 'Lawan mencabar anda! 3 soalan seterusnya HANYA dari Aras Sukar!',
        timer: 4000,
        showConfirmButton: false,
        background: '#450a0a', 
        color: '#f87171' 
    });

    // 2. Setkan jumlah hukuman (Contoh: 3 soalan seterusnya wajib Hard)
    bakiSoalanSukarPaksaan = 3;
}

// =========================================================================
// FUNGSI: KESAN BOOSTER SWITCH (MANGSA) DENGAN KEMASKINI UI
// =========================================================================
function aktifkanKesanSwitch(dataSubjek) {
    // 1. Berikan amaran mengejut di skrin mangsa!
    Swal.fire({
        title: '⚡ KENA SWITCH!',
        text: 'Subjek pasukan anda telah diputar! Soalan ditukar serta-merta!',
        icon: 'warning',
        timer: 4000,
        showConfirmButton: false,
        background: '#ffe5e5', 
        color: '#cc0000'
    });

    // 2. KEMASKINI PAPARAN VISUAL (UI) NAMA SUBJEK DENGAN SEGERA!
    let namaSubjekBaru = dataSubjek.name; 
    
    if (document.getElementById('my-active-subject')) {
        document.getElementById('my-active-subject').innerText = namaSubjekBaru;
    }

    console.log(`[Kesan Switch Aktif] Anda dipaksa menjawab subjek: ${namaSubjekBaru} (ID: ${dataSubjek.id})`);

    // 3. Kosongkan kotak taip secara kejam
    const kotakInput = document.getElementById('input-jawapan-taip');
    if (kotakInput) {
        kotakInput.value = "";
    }
    
    // 4. Panggil fungsi enjin kuiz Cikgu untuk jana soalan subjek baharu mengikut ID baharu!
    if (dataSubjek.id && typeof sediakanSoalanPertamaPemain === "function") {
        sediakanSoalanPertamaPemain(dataSubjek.id);
    }
}

/**
 * Fungsi Utama: Memproses dan Memaparkan Skrin Battle Analysis
 * @param {Object} roomData - Data penuh bilik/lobi daripada Firebase
 */
function prosesBattleAnalysis(roomData) {
    // 1. Ambil rujukan elemen UI utama
    const screenAnalysis = document.getElementById('screen-battle-analysis');
    const titleVictory = document.getElementById('analysis-victory-title');
    const scoreAEl = document.getElementById('analysis-score-teamA');
    const scoreBEl = document.getElementById('analysis-score-teamB');
    const containerA = document.getElementById('container-cards-teamA');
    const containerB = document.getElementById('container-cards-teamB');

    // Kembalikan skrin ke atas dan kosongkan kontainer kad lama
    containerA.innerHTML = '';
    containerB.innerHTML = '';

    // =========================================================
    // 🏷️ KEMASKINI NAMA PASUKAN SECARA DINAMIK DARI RTDB
    // =========================================================
    // Nota: Sila pastikan elemen tajuk Pasukan A & B di HTML Cikgu mempunyai ID di bawah
    const labelTeamAEl = document.getElementById('analysis-label-teamA');
    const labelTeamBEl = document.getElementById('analysis-label-teamB');
    if (labelTeamAEl) labelTeamAEl.textContent = roomData.teamAName || "PASUKAN A (GREEN FACTION)";
    if (labelTeamBEl) labelTeamBEl.textContent = roomData.teamBName || "PASUKAN B (PURPLE SHADOWS)";

    // 2. KIRA SKOR PASUKAN DARI SLOT
    let scoreA = 0;
    let scoreB = 0;

    if (roomData.teamA) {
        ['A1', 'A2', 'A3'].forEach(slot => {
            if (roomData.teamA[slot] && roomData.teamA[slot].points) {
                scoreA += Number(roomData.teamA[slot].points);
            }
        });
    }
    if (roomData.teamB) {
        ['B1', 'B2', 'B3'].forEach(slot => {
            if (roomData.teamB[slot] && roomData.teamB[slot].points) {
                scoreB += Number(roomData.teamB[slot].points);
            }
        });
    }

    scoreAEl.textContent = scoreA;
    scoreBEl.textContent = scoreB;

    // 3. Tentukan Pasukan Pemenang
    let winningTeam = 'SERI';
    if (scoreA > scoreB) {
        winningTeam = 'A';
        titleVictory.textContent = (roomData.teamAName ? `${roomData.teamAName.toUpperCase()} JUARA ARENA!` : "PASUKAN A JUARA ARENA!");
        titleVictory.className = "text-3xl md:text-5xl font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-yellow-300 to-emerald-500 drop-shadow-[0_4px_12px_rgba(16,185,129,0.5)] animate-pulse";
    } else if (scoreB > scoreA) {
        winningTeam = 'B';
        titleVictory.textContent = (roomData.teamBName ? `${roomData.teamBName.toUpperCase()} JUARA ARENA!` : "PASUKAN B JUARA ARENA!");
        titleVictory.className = "text-3xl md:text-5xl font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-yellow-300 to-indigo-500 drop-shadow-[0_4px_12px_rgba(168,85,247,0.5)] animate-pulse";
    } else {
        titleVictory.textContent = "PERTEMBUNGAN SERI!";
        titleVictory.className = "text-3xl md:text-5xl font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-slate-400 via-gray-200 to-slate-500 drop-shadow-[0_4px_12px_rgba(255,255,255,0.3)] animate-pulse";
    }

// =========================================================
    // 4. Kumpul senarai semua pemain (SUNTIKAN FIX BOOSTER)
    // =========================================================
    const semuaPemain = [];
    const slotList = ['A1', 'A2', 'A3', 'B1', 'B2', 'B3'];

    slotList.forEach(slot => {
        const isTeamA = slot.startsWith('A');
        const teamNode = isTeamA ? roomData.teamA : roomData.teamB;

        if ((roomData.players && roomData.players[slot]) || (teamNode && teamNode[slot])) {
            const pInfo = (roomData.players && roomData.players[slot]) ? roomData.players[slot] : {};
            const pStats = (teamNode && teamNode[slot]) ? teamNode[slot] : {};

            semuaPemain.push({
                slot: slot,
                team: isTeamA ? 'A' : 'B',
                uid: pStats.uid || pInfo.uid || 'Tiada UID',
                name: pInfo.name || pStats.name || 'Pemain',
                avatar: pInfo.avatar || pStats.avatar || 'user-ninja',
                mata: Number(pStats.points) || 0,
                streak: Number(pStats.longestStreak) || 0,
                // 🛠️ FIX BOOSTER: Tambah huruf 's' supaya sama dengan RTDB Cikgu
                boosterGuna: Number(pStats.boostersUsed) || 0, 
                boosterKena: Number(pStats.boostersReceived) || 0 
            });
        }
    });

// =========================================================
    // ⭐ 5. ALGORITMA GELARAN KASTAM (FIX: GUNA 'SLOT' BUKAN 'UID')
    // =========================================================
    
    // a. Susun pemain mengikut mata (dari tinggi ke rendah) - Hanya yang ada markah
    const pemainBerMata = [...semuaPemain].filter(p => p.mata > 0).sort((a, b) => b.mata - a.mata);
    const pemainRank1 = pemainBerMata[0]; // Terbanyak (Collector)
    const pemainRank2 = pemainBerMata[1]; // Kedua (Supporter)
    const pemainRank3 = pemainBerMata[2]; // Ketiga (Life Guard)

    // b. Cari nilai tertinggi untuk Booster
    const maxBoosterGuna = Math.max(...semuaPemain.map(p => p.boosterGuna), 1);
    const maxBoosterKena = Math.max(...semuaPemain.map(p => p.boosterKena), 1);

    // c. Tentukan MVP (Mata + Streak + Booster Terbanyak)
    let skorMVPTertinggi = -1;
    let slotMVP = null; // KINI KITA GUNAKAN SLOT
    semuaPemain.forEach(p => {
        let skorKombinasi = p.mata + p.streak + p.boosterGuna;
        if (skorKombinasi > skorMVPTertinggi && skorKombinasi > 0) {
            skorMVPTertinggi = skorKombinasi;
            slotMVP = p.slot; // Simpan kod slot (Contoh: A3)
        }
    });

    semuaPemain.forEach(p => {
        let gelaran = { teks: "💥 PAWN ♟️", kelasCSS: "from-slate-600/20 via-slate-500/40 to-slate-600/20 text-slate-400 border-slate-500/50" };
        let multiplierGanjaran = 1.0;

        // Semakan hierarki gelaran (Menggunakan p.slot untuk mengelakkan isu duplikasi)
        if (p.slot === slotMVP) {
            gelaran = { teks: "👑 MVP 🥇", kelasCSS: "from-amber-500/20 via-amber-500/50 to-amber-500/20 text-amber-400 border-amber-500/60 shadow-[0_0_15px_rgba(245,158,11,0.2)] animate-bounce" };
            multiplierGanjaran = 1.5;
        } 
        else if (pemainRank1 && p.slot === pemainRank1.slot) {
            gelaran = { teks: "💎 COLLECTOR 🏆", kelasCSS: "from-emerald-500/20 via-emerald-400/50 to-emerald-500/20 text-emerald-400 border-emerald-400/60 shadow-[0_0_10px_rgba(16,185,129,0.3)]" };
            multiplierGanjaran = 1.4;
        } 
        else if (pemainRank2 && p.slot === pemainRank2.slot) {
            gelaran = { teks: "🛡️ SUPPORTER 🥈", kelasCSS: "from-blue-500/20 via-blue-400/50 to-blue-500/20 text-blue-400 border-blue-400/60 shadow-[0_0_10px_rgba(59,130,246,0.3)]" };
            multiplierGanjaran = 1.3;
        } 
        else if (pemainRank3 && p.slot === pemainRank3.slot) {
            gelaran = { teks: "⛑️ LIFE GUARD 🥉", kelasCSS: "from-teal-500/20 via-teal-400/50 to-teal-500/20 text-teal-400 border-teal-400/60 shadow-[0_0_10px_rgba(20,184,166,0.3)]" };
            multiplierGanjaran = 1.2;
        } 
        else if (p.boosterGuna === maxBoosterGuna && p.boosterGuna > 0) {
            gelaran = { teks: "💣 ARTILLERY 🚀", kelasCSS: "from-orange-600/20 via-orange-500/40 to-orange-600/20 text-orange-400 border-orange-500/50" };
            multiplierGanjaran = 1.2;
        } 
        else if (p.boosterKena === maxBoosterKena && p.boosterKena > 0) {
            gelaran = { teks: "💅 GLAMOUR 🌟", kelasCSS: "from-pink-600/20 via-pink-500/40 to-pink-600/20 text-pink-400 border-pink-500/50" };
            multiplierGanjaran = 1.1;
        }

        // 6. Kira Ganjaran Asas
        let asasCoins = 200 + (p.mata * 2); 
        let asasXP = 1000 + (p.mata * 10);

        if (p.team === winningTeam && winningTeam !== 'SERI') {
            asasCoins += 100;
            asasXP += 500;
        }

        const finalCoins = Math.round(asasCoins * multiplierGanjaran);
        const finalXP = Math.round(asasXP * multiplierGanjaran);

        // =========================================================
        // ⭐ PENGESANAN AVATAR (VERSI BARU: TANPA TOPENG BULAT)
        // =========================================================
        let avatarHTML = '';
        if (p.avatar && p.avatar.startsWith('img|')) {
            const pathFail = p.avatar.replace('img|', ''); // Buang perkataan 'img|'
            avatarHTML = `<img src="${pathFail}" class="w-full h-auto max-h-16 object-contain" alt="Avatar" onerror="this.src='assets/avatars/default.webp';">`;
        } else {
            avatarHTML = `<i class="fas fa-${p.avatar || 'user-ninja'} text-3xl ${p.team === 'A' ? 'text-emerald-400' : 'text-purple-400'}"></i>`;
        }

        // =========================================================
        // ⭐ PENGESANAN "ADAKAH INI SAYA?" YANG LEBIH TEPAT
        // =========================================================
        const currentUser = firebase.auth().currentUser;
        
        // Guna gabungan Nama Murid ATAU UID untuk pastikan ia tidak ralat
        const adakahSaya = (typeof studentInfo !== 'undefined' && p.name === studentInfo.name) || 
                           (currentUser && p.uid === currentUser.uid); 
        
        console.log(`[SEMAK BATTLE] Pemain: ${p.name} | Adakah Saya?: ${adakahSaya}`);

        // 7. Bina Kad HTML
        const borderWarnaPasukan = p.team === 'A' ? 'border-emerald-500/80 shadow-[0_0_20px_rgba(16,185,129,0.2)]' : 'border-purple-500/80 shadow-[0_0_20px_rgba(168,85,247,0.2)]';
        const bgBadgeSlot = p.team === 'A' ? 'bg-emerald-600' : 'bg-purple-600';
        
        const statusBlink = adakahSaya ? 'ring-4 ring-yellow-400 ring-offset-4 ring-offset-slate-950 scale-105 z-10' : '';

        const cardHTML = `
            <div class="flex flex-col bg-slate-900/90 border-2 ${borderWarnaPasukan} ${statusBlink} rounded-3xl p-4 text-center items-center relative overflow-hidden transition-all duration-500">
                <span class="absolute top-2 left-2 ${bgBadgeSlot} text-white font-black text-[10px] px-2 py-0.5 rounded-md shadow-md">${p.slot}</span>
                
                <div class="w-20 h-16 flex items-center justify-center mt-2 overflow-visible">
                    ${avatarHTML}
                </div>
                <h3 class="text-sm font-bold text-white mt-2 truncate w-full">${p.name} ${adakahSaya ? '<span class="text-yellow-400">(SAYA)</span>' : ''}</h3>
                
                <div class="w-full bg-gradient-to-r ${gelaran.kelasCSS} border-y py-1.5 my-3 font-black text-xs uppercase tracking-widest flex items-center justify-center gap-1.5">
                    ${gelaran.teks}
                </div>
                
                <div class="w-full text-left bg-slate-950 border border-slate-800/80 p-2.5 rounded-xl text-[11px] space-y-1 text-slate-300">
                    <div class="flex justify-between"><span>🎯 Mata</span> <span class="font-bold text-emerald-400">${p.mata} Pts</span></div>
                    <div class="flex justify-between"><span>🔥 Streak Max</span> <span class="font-bold text-orange-400">${p.streak}</span></div>
                    <div class="flex justify-between"><span>🚀 Guna Booster</span> <span class="font-bold text-sky-400">${p.boosterGuna}</span></div>
                    <div class="flex justify-between"><span>💥 Kena Serang</span> <span class="font-bold text-red-400">${p.boosterKena}</span></div>
                </div>
                
                <div class="w-full mt-3 border-t border-dashed border-slate-800 pt-2.5 flex justify-around text-[11px] font-bold">
                    <div class="flex items-center gap-1 text-yellow-400">
                        <i class="fas fa-coins animate-spin" style="animation-duration: 4s"></i> +${finalCoins.toLocaleString()}
                    </div>
                    <div class="flex items-center gap-1 text-cyan-400">
                        <i class="fas fa-sparkles text-xs"></i> +${finalXP.toLocaleString()} XP
                    </div>
                </div>
            </div>
        `;

        if (p.team === 'A') {
            containerA.innerHTML += cardHTML;
        } else {
            containerB.innerHTML += cardHTML;
        }

        // =========================================================
        // "SUIS" UNTUK MENGHANTAR GANJARAN KE DATABASE
        // =========================================================
        if (adakahSaya) {
            console.log(`🎯 [TRIGGER] Akaun SAYA dikesan! Memanggil fungsi ganjaran...`);
            simpanGanjaranKeDatabase(p.uid || 'tiada_uid', finalCoins, finalXP);
        }
    });

    // 9. Buka Skrin Analisis
    document.getElementById('arena-lobby-container').classList.add('hidden');
    screenAnalysis.classList.remove('hidden');
}

/**
 * Fungsi untuk menghantar murid kembali ke lobi utama sistem kuiz
 */
function kembaliKeLobiUtama() {
    console.log("[UI] Butang kembali ke lobi ditekan.");

   
    // 1. PAKSA TUTUP SKRIN BATTLE ANALYSIS
    const analysisScreen = document.getElementById('screen-battle-analysis');
    if (analysisScreen) {
        analysisScreen.classList.add('hidden');
        console.log("✅ Berjaya menyembunyikan 'screen-battle-analysis'");
    } else {
        console.warn("⚠️ Amaran: Elemen 'screen-battle-analysis' tidak dijumpai.");
    }
    
    // 2. PAKSA TUTUP KONTENA BATTLE-VIEW
    const battleScreen = document.getElementById('battle-view');
    if (battleScreen) {
        battleScreen.classList.add('hidden');
        console.log("✅ Berjaya menyembunyikan kontena 'battle-view'");
    }

    // 3. BUKA LOBI UTAMA
    const lobbyScreen = document.getElementById('arena-lobby-container');
    if (lobbyScreen) {
        lobbyScreen.classList.remove('hidden');
    }

    // 4. BUKA SENARAI BILIK & TUTUP PAPARAN DALAM BILIK (Ini penyelesaian untuk lobi kosong!)
    const listView = document.getElementById('lobby-list-view');
    if (listView) {
        listView.classList.remove('hidden'); // Paparkan semula senarai bilik
    }
    
    const roomView = document.getElementById('lobby-room-view');
    if (roomView) {
        roomView.classList.add('hidden'); // Sembunyikan paparan dalam bilik lama
    }
    
    // Tunjukkan semula butang kembali lobi utama (jika ada)
    const btnBackLobby = document.getElementById('btn-back-lobby');
    if (btnBackLobby) {
        btnBackLobby.classList.remove('hidden');
    }

    console.log("✅ Berjaya memaparkan lobi utama dan senarai bilik ('lobby-list-view').");
}

/**
 * Menyimpan ganjaran Coins dan XP terus ke pangkalan data beserta Console Log
 */
// 🔴 1. TAMBAHKAN PEMBOLEHBAH/FLAG INI DI BAGIAN PALING ATAS (Luar Fungsi/Global)
async function simpanGanjaranKeDatabase(uid, earnedCoins, earnedXp, subjectKey = null) {
    
    // 🔴 2. SEKATAN KESELAMATAN: Jika sudah disimpan, langsung batalkan fungsi!
    if (isGanjaranDisimpan) {
        console.warn("⚠️ Amaran: Ganjaran sudah disimpan sebelumnya. Menghalang duplikasi penulisan ke Firestore.");
        return;
    }

    console.log("====== 🔥 MULA PROSES SIMPAN GANJARAN 🔥 ======");
    console.log("1. Data diterima dari perlawanan:", { UID: uid, Koin: earnedCoins, XP: earnedXp });
    console.log("2. studentInfo semasa:", typeof studentInfo !== 'undefined' ? studentInfo : "KOSONG/RALAT!");

    try {
        // 1. Pastikan data profil murid wujud
        if (typeof studentInfo === 'undefined' || !studentInfo.school || !studentInfo.class || !studentInfo.name) {
            console.error("❌ GAGAL: Data 'studentInfo' tidak lengkap. Adakah murid log masuk dengan betul?");
            console.log("=========================================");
            return;
        }

        // 2. KUNCI STATUS: Set menjadi true sesegera mungkin agar panggilan bertindih tidak dapat lolos
        isGanjaranDisimpan = true;

        // 3. Bina ID Dokumen mengikut format auth.js cikgu
        const docId = `${studentInfo.school}_${studentInfo.class}_${studentInfo.name}`.replace(/\s+/g, '_');
        console.log(`3. Sasaran Firestore: Koleksi [players] -> Dokumen [${docId}]`);

        // 4. Sediakan data untuk ditambah
        const updateData = {
            coins: firebase.firestore.FieldValue.increment(earnedCoins),
            totalScore: firebase.firestore.FieldValue.increment(earnedXp),
            lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
        };

        // 5. Deteksi Subjek (Sokongan 10 Subjek)
        let subKey = subjectKey;
        if (!subKey && typeof currentSubject !== 'undefined' && currentSubject) {
            subKey = currentSubject === "math" ? "score_matematik" : "score_" + currentSubject;
        }

        if (subKey) {
            updateData[subKey] = firebase.firestore.FieldValue.increment(earnedXp);
            console.log(`4. Subjek dikesan: ${subKey}. Markah XP juga akan dimasukkan ke lajur subjek ini.`);
        }

        console.log("5. Data yang akan dihantar ke Firestore:", updateData);

        // 6. Hantar ke Firestore guna SET + MERGE 
        await db.collection("players").doc(docId).set(updateData, { merge: true });
        
        console.log(`✅ [FIRESTORE SUCCESS] Ganjaran selamat dimasukkan ke database!`);

        // 7. Kemas kini data lokal & gerakkan UI
        if (typeof kemasKiniDataLokal === 'function') {
            console.log("6. Memanggil fungsi kemasKiniDataLokal() untuk ubah paparan UI...");
            kemasKiniDataLokal(earnedCoins, earnedXp, subKey);
        }

    } catch (error) {
        // 🔴 3. JIKA GAGAL: Reset kembali menjadi false supaya pemain bisa mencoba menyimpan ulang jika ada ralat rangkaian
        isGanjaranDisimpan = false;
        console.error("❌ [FIRESTORE ERROR] Ralat sewaktu menyimpan ganjaran:", error);
    }
    console.log("=========================================");
}

// ==========================================
// 1. FUNGSI AMARAN (ALERTS)
// ==========================================
function lockedAlert(diff) {
    let msg = diff === 'medium' 
        ? "Selesaikan 3 kategori EASY dengan markah penuh (50/50) untuk buka tahap ini!" 
        : "Selesaikan 3 kategori MEDIUM dengan markah penuh (50/50) untuk buka tahap ini!";
    Swal.fire({
        icon: 'warning',
        title: 'Tahap Terkunci 🔒',
        text: msg,
        confirmButtonColor: '#4f46e5'
    });
}

function comingSoonAlert(subjek = 'ini') {
    Swal.fire({
        icon: 'info',
        title: 'Sabar Ya! 🚀',
        text: `Modul ${subjek} sedang disiapkan. Buat masa ini, sila main subjek yang tersedia.`,
        confirmButtonColor: '#14b8a6'
    });
}

// =============================================================================
// 2. FUNGSI NAVIGASI BUKA SUBJEK (VERSI OPTIMUM & DINAMIK)
// =============================================================================

/**
 * Fungsi Induk untuk membuka mana-mana subjek secara dinamik
 * @param {string} subjectId - ID bagi elemen kontena subjek di HTML (contoh: 'math', 'bm')
 * @param {Function} renderCallback - Fungsi lukis butang yang berkaitan
 */
function openSubjectCategories(subjectId, renderCallback) {
    const subjectGrid = document.getElementById('subject-grid');
    
    // 1. Sembunyikan grid pemilihan subjek utama
    if (subjectGrid) subjectGrid.classList.add('hidden');
    
    // 2. Sembunyikan SEMUA kontena kategori subjek lain terlebih dahulu (untuk elak bertindan)
    const allContainers = document.querySelectorAll('[id$="-categories"]');
    allContainers.forEach(container => container.classList.add('hidden'));
    
    // 3. Tunjukkan kontena subjek yang dipilih sahaja
    const targetContainer = document.getElementById(`${subjectId}-categories`);
    if (targetContainer) {
        targetContainer.classList.remove('hidden');
    } else {
        console.warn(`Kontena HTML '#${subjectId}-categories' tidak dijumpai.`);
    }
    
    // 4. Panggil fungsi lukis butang kategori jika wujud
    if (typeof renderCallback === 'function' && renderCallback !== null) {
        renderCallback();
    }

    // ==========================================
    // FUNGSI CLOSE/BACK DI DALAM BLOK (GLOBAL WINDOW)
    // ==========================================
    window.closeSubject = function() {
        // Tampilkan kembali menu utama
        if (subjectGrid) subjectGrid.classList.remove('hidden');
        
        // Sembunyikan semua kontena subjek
        const containers = document.querySelectorAll('[id$="-categories"]');
        containers.forEach(container => container.classList.add('hidden'));
    };
}

// -----------------------------------------------------------------------------
// PANGGILAN KESERASIAN (WRAPPER FUNCTIONS)
// Sesuai digunakan terus pada 'onclick' di fail HTML Cikgu
// -----------------------------------------------------------------------------

// Subjek Asal
function showEnglishCategories() { openSubjectCategories('english', typeof renderCategoryButtons === 'function' ? renderCategoryButtons : null); }
function openScienceCategories()  { openSubjectCategories('science', typeof renderScienceCategoryButtons === 'function' ? renderScienceCategoryButtons : null); }
function showMathCategories()     { openSubjectCategories('math', typeof renderMathCategoryButtons === 'function' ? renderMathCategoryButtons : null); }

// Subjek Baharu 🇲🇾
function openBmCategories()       { openSubjectCategories('bm', typeof renderBMCategoryButtons === 'function' ? renderBMCategoryButtons : null); }
function openSejarahCategories()  { openSubjectCategories('sejarah', typeof renderSejarahCategoryButtons === 'function' ? renderSejarahCategoryButtons : null); }
function openKesihatanCategories()      { openSubjectCategories('pjk', typeof renderPJKCategoryButtons === 'function' ? renderPJKCategoryButtons : null); }
function openMuzikCategories()    { openSubjectCategories('muzik', typeof renderMuzikCategoryButtons === 'function' ? renderMuzikCategoryButtons : null); }
function openMoralCategories()    { openSubjectCategories('moral', typeof renderMoralCategoryButtons === 'function' ? renderMoralCategoryButtons : null); }
function openPsvCategories()      { openSubjectCategories('psv', typeof renderPSVCategoryButtons === 'function' ? renderPSVCategoryButtons : null); }
function showRbtCategories()      { openSubjectCategories('rbt', typeof renderRBTCategoryButtons === 'function' ? renderRBTCategoryButtons : null); }

// 🟢 SUBJEK AGAMA & ARAB 🕌🇸🇦 (TIDAK PERLU RENDER CALLBACK)
function openPaiCategories()      { openSubjectCategories('pai', null); }
function openBaCategories()       { openSubjectCategories('ba', null); }

// ==========================================
// 3. FUNGSI KEMBALI KE MENU UTAMA
// ==========================================
function backToSubjects() {
    const subjectGrid = document.getElementById('subject-grid');
    
    // Buka semula menu utama
    if (subjectGrid) subjectGrid.classList.remove('hidden');
    
    // Tutup (sembunyikan) semua skrin subjek secara dinamik (Lebih kemas & selamat)
    const allContainers = document.querySelectorAll('[id$="-categories"]');
    allContainers.forEach(container => container.classList.add('hidden'));
}

function closeSubjectModal() {
    const modal = document.getElementById('subject-modal');
    if (modal) modal.classList.add('hidden');
    backToSubjects(); 
}

// =========================================================================
// 🇬🇧 1. FUNGSI KATEGORI ENGLISH
// =========================================================================
function renderCategoryButtons() {
    const userScores = localPlayerData.games || {};
    const PERFECT_SCORE = 50;
    
    function getRealScore(cat) {
        let rawScore = userScores[cat];
        if (typeof rawScore === 'object' && rawScore !== null) {
            return parseInt(rawScore.score || rawScore.best || rawScore.mark || 0);
        }
        return parseInt(rawScore) || 0;
    }

    const createBtn = (cat, diff, isLocked) => {
        const score = getRealScore(cat);
        const isMastered = score >= PERFECT_SCORE;
        const actionOnClick = isLocked 
            ? `lockedAlert('${diff}')` 
            : `closeSubjectModal(); showScreen('game-arena'); initGame('${cat}');`;

        return `
            <button onclick="${actionOnClick}" 
                class="p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${isLocked ? 'bg-gray-100 border-gray-200 opacity-60' : 'bg-white border-indigo-100 hover:border-indigo-500 shadow-sm'}">
                <span class="text-sm font-black uppercase tracking-wider ${isLocked ? 'text-gray-400' : 'text-indigo-600'}">${cat.replace(/_/g, ' ')}</span>
                <span class="text-3xl">${isLocked ? '🔒' : (isMastered ? '⭐' : '📖')}</span>
                <span class="text-[10px] font-bold bg-gray-100 px-2 py-1 rounded-full text-gray-600">${isLocked ? 'LOCKED' : `Score: ${score}/${PERFECT_SCORE}`}</span>
            </button>
        `;
    };

    // Guna Keselamatan Keserasian ID HTML (Sama ada berkongsi ID atau ID berbeza)
    const easyContainer = document.getElementById('list-easy');
    const mediumContainer = document.getElementById('list-medium');
    const hardContainer = document.getElementById('list-hard');

    // NOTA: Tukar 'false' kepada 'easyMastered < 3' jika cikgu mahu sistem kunci berfungsi semula
    if (easyContainer) easyContainer.innerHTML = englishCategoryDifficulty.easy.map(c => createBtn(c, 'easy', false)).join('');
    if (mediumContainer) mediumContainer.innerHTML = englishCategoryDifficulty.medium.map(c => createBtn(c, 'medium', false)).join(''); // 👈 FORCE UNLOCK (TIADA KUNCI)
    if (hardContainer) hardContainer.innerHTML = englishCategoryDifficulty.hard.map(c => createBtn(c, 'hard', false)).join(''); // 👈 FORCE UNLOCK (TIADA KUNCI)
}

// =========================================================================
// 🔢 2. FUNGSI KATEGORI MATHEMATICS
// =========================================================================
function renderMathCategoryButtons() {
    const userScores = localPlayerData.games || {};
    const PERFECT_SCORE = 50;
    
    function getRealScore(cat) {
        let rawScore = userScores[cat];
        if (typeof rawScore === 'object' && rawScore !== null) {
            return parseInt(rawScore.score || rawScore.best || rawScore.mark || 0);
        }
        return parseInt(rawScore) || 0;
    }

    const createBtn = (cat, diff, isLocked) => {
        const score = getRealScore(cat);
        const isMastered = score >= PERFECT_SCORE;
        
        let iconHtml = '🔢';
        if (cat === 'addition_basic') iconHtml = '➕';
        if (cat === 'subtraction_basic') iconHtml = '➖';
        if (cat === 'multiplication_table') iconHtml = '✖️';
        if (cat === 'division_basic') iconHtml = '➗';
        if (cat === 'shapes_and_space') iconHtml = '🔺';
        if (cat === 'fractions_intro') iconHtml = '🍕';
        if (cat === 'decimal_basics') iconHtml = '⏺️';
        if (cat === 'percentage_fun') iconHtml = '💯';
        if (cat === 'money_matters') iconHtml = '💰';
        if (cat === 'time_and_clock') iconHtml = '⏱️';
        if (cat === 'length_and_mass') iconHtml = '📏';
        if (cat === 'volume_of_liquid') iconHtml = '🧪';
        if (cat === 'area_and_perimeter') iconHtml = '🏗️';
        if (cat === 'data_handling') iconHtml = '📊';
        if (cat === 'math_logic') iconHtml = '🧠';

        let displayTitle = cat.replace(/_/g, ' ').toUpperCase();
        const actionOnClick = isLocked 
            ? `lockedAlert('${diff}')` 
            : `closeSubjectModal(); showScreen('game-arena'); initGame('${cat}');`;

        return `
            <button onclick="${actionOnClick}" 
                class="p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${isLocked ? 'bg-gray-100 border-gray-200 opacity-60' : 'bg-white border-blue-100 hover:border-blue-500 shadow-sm'}">
                <span class="text-xs font-black uppercase text-center tracking-wider ${isLocked ? 'text-gray-400' : 'text-blue-700'}">${displayTitle}</span>
                <div class="text-4xl my-1 relative">
                    ${isLocked ? '🔒' : iconHtml}
                    ${isMastered && !isLocked ? '<span class="absolute -top-2 -right-2 text-xl">⭐</span>' : ''}
                </div>
                <span class="text-[10px] font-bold bg-gray-100 px-2 py-1 rounded-full text-gray-600">${isLocked ? 'LOCKED' : `Score: ${score}/${PERFECT_SCORE}`}</span>
            </button>
        `;
    };

    // SISTEM KESELAMATAN: Cari list-math-easy, jika tiada ia guna list-easy (elak bug paparan statik melekat)
    const easyContainer = document.getElementById('list-math-easy') || document.getElementById('list-easy');
    const mediumContainer = document.getElementById('list-math-medium') || document.getElementById('list-medium');
    const hardContainer = document.getElementById('list-math-hard') || document.getElementById('list-hard');

    if (easyContainer) easyContainer.innerHTML = mathCategoryDifficulty.easy.map(c => createBtn(c, 'easy', false)).join('');
    if (mediumContainer) mediumContainer.innerHTML = mathCategoryDifficulty.medium.map(c => createBtn(c, 'medium', false)).join(''); // 👈 FORCE UNLOCK (TIADA KUNCI)
    if (hardContainer) hardContainer.innerHTML = mathCategoryDifficulty.hard.map(c => createBtn(c, 'hard', false)).join(''); // 👈 FORCE UNLOCK (TIADA KUNCI)
}

// =========================================================================
// 🔬 3. FUNGSI KATEGORI SCIENCE
// =========================================================================
function renderScienceCategoryButtons() {
    const userScores = localPlayerData.games || {};
    const PERFECT_SCORE = 50;
    
    function getRealScore(cat) {
        let rawScore = userScores[cat];
        if (typeof rawScore === 'object' && rawScore !== null) {
            return parseInt(rawScore.score || rawScore.best || rawScore.mark || 0);
        }
        return parseInt(rawScore) || 0;
    }

    const createBtn = (cat, diff, isLocked) => {
        const score = getRealScore(cat);
        const isMastered = score >= PERFECT_SCORE;
        
        let iconHtml = '🔬';
        if (cat === 'scientific_skills') iconHtml = '🔬';
        if (cat === 'human_life_processes') iconHtml = '🫁';
        if (cat === 'animal_classification') iconHtml = '🐾';
        if (cat === 'plant_processes') iconHtml = '🌱';
        if (cat === 'microorganisms') iconHtml = '🦠';
        if (cat === 'food_chains') iconHtml = '🌾';
        if (cat === 'energy_forms') iconHtml = '⚡';
        if (cat === 'light_properties') iconHtml = '💡';
        if (cat === 'electricity_basics') iconHtml = '🔋';
        if (cat === 'heat_and_temperature') iconHtml = '🌡️';
        if (cat === 'states_of_matter') iconHtml = '☁️';
        if (cat === 'materials_properties') iconHtml = '🪵';
        if (cat === 'solar_system') iconHtml = '🪐';
        if (cat === 'machines_simple') iconHtml = '⚙️';
        if (cat === 'food_preservation') iconHtml = '🥫';
        if (cat === 'preservation_conservation') iconHtml = '🌳';

        let displayTitle = cat.replace(/_/g, ' ').toUpperCase();
        const actionOnClick = isLocked 
            ? `lockedAlert('${diff}')` 
            : `closeSubjectModal(); showScreen('game-arena'); initGame('${cat}');`;

        return `
            <button onclick="${actionOnClick}" 
                class="p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${isLocked ? 'bg-gray-100 border-gray-200 opacity-60' : 'bg-white border-teal-100 hover:border-teal-500 shadow-sm'}">
                <span class="text-xs font-black uppercase text-center tracking-wider ${isLocked ? 'text-gray-400' : 'text-teal-700'}">${displayTitle}</span>
                <div class="text-4xl my-1 relative">
                    ${isLocked ? '🔒' : iconHtml}
                    ${isMastered && !isLocked ? '<span class="absolute -top-2 -right-2 text-xl">⭐</span>' : ''}
                </div>
                <span class="text-[10px] font-bold bg-gray-100 px-2 py-1 rounded-full text-gray-600">${isLocked ? 'LOCKED' : `Score: ${score}/${PERFECT_SCORE}`}</span>
            </button>
        `;
    };

    // SISTEM KESELAMATAN: Cari list-science-easy, jika tiada ia guna list-easy
    const easyContainer = document.getElementById('list-science-easy') || document.getElementById('list-easy');
    const mediumContainer = document.getElementById('list-science-medium') || document.getElementById('list-medium');
    const hardContainer = document.getElementById('list-science-hard') || document.getElementById('list-hard');

    if (easyContainer) easyContainer.innerHTML = scienceCategoryDifficulty.easy.map(c => createBtn(c, 'easy', false)).join('');
    if (mediumContainer) mediumContainer.innerHTML = scienceCategoryDifficulty.medium.map(c => createBtn(c, 'medium', false)).join(''); // 👈 FORCE UNLOCK (TIADA KUNCI)
    if (hardContainer) hardContainer.innerHTML = scienceCategoryDifficulty.hard.map(c => createBtn(c, 'hard', false)).join(''); // 👈 FORCE UNLOCK (TIADA KUNCI)
}

// ------------------------------------------
// FUNGSI KIRA XP (VERSI KEMASKINI LOCAL DATA)
// ------------------------------------------
function giveXP(category, correctCount) {
    let multiplier = 1; // Markah asas (untuk EASY)

    // 1. Himpunkan SEMUA kategori MEDIUM daripada kesemua 10 subjek
    const semuaKategoriMedium = [
        ...englishCategoryDifficulty.medium, ...mathCategoryDifficulty.medium, ...scienceCategoryDifficulty.medium,
        ...bmCategoryDifficulty.medium, ...sejarahCategoryDifficulty.medium, ...kesihatanCategoryDifficulty.medium,
        ...muzikCategoryDifficulty.medium, ...moralCategoryDifficulty.medium, ...psvCategoryDifficulty.medium, ...rbtCategoryDifficulty.medium
    ];

    // 2. Himpunkan SEMUA kategori HARD daripada kesemua 10 subjek
    const semuaKategoriHard = [
        ...englishCategoryDifficulty.hard, ...mathCategoryDifficulty.hard, ...scienceCategoryDifficulty.hard,
        ...bmCategoryDifficulty.hard, ...sejarahCategoryDifficulty.hard, ...kesihatanCategoryDifficulty.hard,
        ...muzikCategoryDifficulty.hard, ...moralCategoryDifficulty.hard, ...psvCategoryDifficulty.hard, ...rbtCategoryDifficulty.hard
    ];

    // Semak tahap kesukaran permainan semasa untuk penggandaan XP
    if (semuaKategoriMedium.includes(category)) {
        multiplier = 2; // Ganjaran berganda untuk tahap Medium
    } else if (semuaKategoriHard.includes(category)) {
        multiplier = 3; // Ganjaran tiga kali ganda untuk tahap Hard
    }

    let earnedXP = correctCount * multiplier;
    localPlayerData.totalScore = (Number(localPlayerData.totalScore) || 0) + earnedXP;
    
    // ==========================================
    // 🟢 SELITKAN NAMA GAME KE DALAM DATA PEMAIN
    // ==========================================
    // 1. Jika memori playedGamesList belum wujud, kita cipta baru
    if (!localPlayerData.playedGamesList) {
        localPlayerData.playedGamesList = [];
    }
    
    // 2. Jika nama game ini belum ada dalam memori, kita masukkan
    if (!localPlayerData.playedGamesList.includes(category)) {
        localPlayerData.playedGamesList.push(category);
    }
    // ==========================================

    // Simpan semua data terkini (termasuk array di atas) ke Firebase
    saveCloudPlayerData();
    
    checkLevelRewardsOnLogin(); // Cek jika pemain naik level
    return earnedXP;
}

// ==========================================
// 1. SISTEM KUIZ & MEMORI PERMAINAN
// ==========================================
function initGame(type) {
    isGanjaranDisimpan = false;
    if (typeof pauseBgMusic === 'function') pauseBgMusic();
    if (!type) return; 
    const safeType = type.toUpperCase(); 

    const playerName = localPlayerData.passcode || localPlayerData.name || "guest";
    const userKey = "memoriPemain_" + playerName;

    // ==========================================
    // 🟢 KEMAS KINI STATUS FIREBASE KE "IN-GAME" (VERSI SELAMAT)
    // ==========================================
    let player = null;
    if (typeof studentInfo !== 'undefined' && studentInfo && studentInfo.name) {
        player = studentInfo;
    } else if (typeof localPlayerData !== 'undefined' && localPlayerData && localPlayerData.name) {
        player = localPlayerData;
    }

    if (player && typeof db !== 'undefined') {
        const docId = `${player.school}_${player.class}_${player.name}`.replace(/\s+/g, '_');
        db.collection("players").doc(docId).set({
            isOnline: true,
            currentStatus: "in-game",
            lastActive: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true }).catch(e => console.log("Gagal kemaskini status in-game:", e));
    }
    // ==========================================

    // Pemulihan Memori
    let currentMem = localPlayerData.lastPlayed || [];
    if (typeof currentMem === 'string') currentMem = currentMem.replace(/[\[\]"'\\]/g, '').split(',').map(s => s.trim()).filter(s => s !== "");
    
    let localMem = [];
    try {
        const savedMem = localStorage.getItem(userKey);
        if (savedMem) localMem = savedMem.replace(/[\[\]"'\\]/g, '').split(',').map(s => s.trim()).filter(s => s !== "");
    } catch (e) {}

    let combinedMem = localMem.length > currentMem.length ? localMem : currentMem;
    const HAD_MEMORI = 2;
    if (combinedMem.length > HAD_MEMORI) combinedMem = combinedMem.slice(-HAD_MEMORI);
    
    localPlayerData.lastPlayed = combinedMem.map(s => s.toUpperCase());

    // Sistem Anti-Grinding
    if (localPlayerData.lastPlayed.includes(safeType) && !window.currentActiveChallenge) {
        alert(`⛔ THIS CATEGORY IS RESTING! ⛔\n\nYou have played category "${safeType}" recently.\nPlease choose another category to play.\n\nRecent Memory:\n[ ${localPlayerData.lastPlayed.join(' ➔ ')} ]`);
        return; 
    }

    localPlayerData.lastPlayed.push(safeType);
    if (localPlayerData.lastPlayed.length > HAD_MEMORI) localPlayerData.lastPlayed = localPlayerData.lastPlayed.slice(-HAD_MEMORI);
    localStorage.setItem(userKey, localPlayerData.lastPlayed.join(','));

    if (typeof saveCloudPlayerData === 'function') saveCloudPlayerData(); 

    // ==========================================
    // Mula UI Permainan & Kemasan Skrin
    // ==========================================
    currentGameType = type;
    
    // 1. TUTUP KOTAK SUBJEK SECARA PAKSA JIKA MASIH TERBUKA
    if (typeof closeSubjectModal === 'function') {
        closeSubjectModal();
    }
    
    document.getElementById('menu-screen')?.classList.add('hidden');
    document.getElementById('game-arena')?.classList.remove('hidden');
    document.getElementById('check-btn')?.classList.remove('hidden'); 
    document.getElementById('final-score')?.classList.add('hidden');

    const checkBtn = document.getElementById('check-btn');
    if (checkBtn) {
        checkBtn.disabled = false;
        checkBtn.innerHTML = 'CHECK ANSWERS & SEE SCORE'; 
        checkBtn.classList.remove('bg-gray-400', 'cursor-not-allowed'); 
        checkBtn.classList.add('bg-green-500', 'hover:bg-green-600'); 
    }
    
    const container = document.getElementById('question-container');
    if (!container) return; 
    container.innerHTML = "";
    
    // =========================================================================
    // 2. TETAPAN TAJUK PERMAINAN DINAMIK (MAPPING DICTIONARY)
    // =========================================================================
    const DAFTAR_TAJUK = {
        // English
        "guessing": "Guess the Word", "puzzle": "Word Scramble", "synonym": "Synonyms",
        "antonym": "Antonyms", "missing": "Missing Letters", "pastTense": "Past Tense Challenge",
        "plural": "Singular to Plural", "spelling": "Correct the Spelling",
        
        // Matematik
        "number_recognition": "Kenal Nombor", "addition_basic": "Tambah Asas", "subtraction_basic": "Tolak Asas",
        "multiplication_table": "Darab Asas", "division_basic": "Bahagi Asas", "shapes_and_space": "Bentuk & Ruang",
        "fractions_intro": "Pecahan Asas", "decimal_basics": "Asas Perpuluhan", "percentage_fun": "Peratusan",
        "money_matters": "Wang (RM)", "time_and_clock": "Masa & Waktu", "length_and_mass": "Panjang & Jisim",
        "volume_of_liquid": "Isi Padu Cecair", "area_and_perimeter": "Luas & Perimeter", "data_handling": "Pengurusan Data",
        "math_logic": "Logik Akal",

        // Sains
        "scientific_skills": "Kemahiran Saintifik", "human_life_processes": "Proses Hidup Manusia", 
        "animal_classification": "Pengelasan Haiwan", "plant_processes": "Proses Hidup Tumbuhan", 
        "microorganisms": "Mikroorganisma", "food_chains": "Rantai Makanan", "energy_forms": "Bentuk Tenaga", 
        "light_properties": "Sifat Cahaya", "electricity_basics": "Asas Elektrik", "heat_and_temperature": "Haba & Suhu", 
        "states_of_matter": "Keadaan Bahan", "materials_properties": "Sifat Bahan", "solar_system": "Sistem Suria", 
        "machines_simple": "Mesin Ringkas", "food_preservation": "Pengawetan Makanan", 
        "preservation_conservation": "Pemeliharaan & Pemuliharaan",

        // Bahasa Melayu
        "kata_nama": "Kata Nama", "kata_kerja": "Kata Kerja", "kata_adjektif": "Kata Adjektif", "kata_tugas": "Kata Tugas",
        "penjodoh_bilangan": "Penjodoh Bilangan", "sinonim_antonim": "Sinonim & Antonim", "ayat_tunggal": "Ayat Tunggal",
        "ayat_majmuk": "Ayat Majmuk", "kesalahan_tatabahasa": "Kesalahan Tatabahasa", "peribahasa": "Peribahasa",
        "ayat_aktif_pasif": "Ayat Aktif & Pasif", "susunan_songsang": "Susunan Songsang",

        // Pendidikan Muzik
        "notasi_dan_balar": "Notasi & Balar", "klef_trebel": "Klef Trebel", "jenis_alat_muzik": "Jenis Alat Muzik",
        "nilai_nota_ritma": "Nilai Nota & Ritma", "solfa_dan_nyanyian": "Solfa & Nyanyian", "muzik_tradisional": "Muzik Tradisional",
        "apresiasi_muzik": "Apresiasi Muzik", "etika_persembahan": "Etika Persembahan", "kerjaya_muzik": "Kerjaya Muzik",

        // PJK
        "gimnastik_asas": "Gimnastik Asas", 
        "pergerakan_berirama": "Pergerakan Berirama", 
        "permainan_kategori_serangan": "Permainan Kategori Serangan",
        "permainan_kategori_jaring": "Permainan Kategori Jaring", 
        "permainan_kategori_padang": "Permainan Kategori Padang", 
        "olahraga_asas": "Olahraga Asas",
        "komponen_kecergasan": "Komponen Kecergasan", 
        "kekeluargaan_dan_perhubungan": "Kekeluargaan & Perhubungan",

        // Pendidikan Moral
        "kepercayaan_kepada_tuhan": "Kepercayaan Kepada Tuhan", "baik_hati": "Baik Hati", "bertanggungjawab": "Bertanggungjawab",
        "berterima_kasih": "Berterima Kasih", "hemah_tinggi": "Hemah Tinggi", "hormat_menghormati": "Hormat-Menghormati",
        "kasih_sayang": "Kasih Sayang", "keadilan": "Keadilan", "keberanian": "Keberanian", "kejujuran": "Kejujuran",
        "kerajinan": "Kerajinan", "kerjasama": "Kerjasama", "kesederhanaan": "Kesederhanaan", "hak_asasi": "Hak Asasi",

        // Sejarah
        "pengenalan_ilmu_sejarah": "Pengenalan Ilmu Sejarah", "sejarah_diri_dan_keluarga": "Sejarah Diri & Keluarga",
        "sejarah_sekolah": "Sejarah Sekolah", "zaman_air_batu": "Zaman Air Batu", "zaman_prasejarah": "Zaman Prasejarah",
        "kerajaan_melayu_awal": "Kerajaan Melayu Awal", "tokoh_terbilang": "Tokoh Terbilang", "warisan_negara": "Warisan Negara",
        "pembangunan_dan_ekonomi": "Pembangunan & Ekonomi",

        // Seni Visual
        "unsur_seni": "Unsur Seni", "prinsip_rekaan": "Prinsip Rekaan", "media_dan_bahan": "Media & Bahan",
        "lukisan_dan_catan": "Lukisan & Catan", "membuat_corak": "Membuat Corak", "membentuk_binaan": "Membentuk Binaan",
        "kraf_tradisional": "Kraf Tradisional", "apresiasi_seni": "Apresiasi Seni", "pameran_seni": "Pameran Seni",

        // RBT
        "keselamatan_bengkel": "Keselamatan Bengkel", "pengenalan_reka_bentuk": "Pengenalan Reka Bentuk", "alatan_tangan": "Alatan Tangan",
        "asas_teknologi": "Asas Teknologi", "reka_bentuk_pengaturcaraan": "Reka Bentuk Pengaturcaraan", "hidroponik": "Hidroponik",
        "kos_dan_modal": "Kos & Modal", "pemasaran_digital": "Pemasaran Digital", "etika_keusahawanan": "Etika Keusahawanan",

        // 🟢 PAI & BA (KEMAS KINI BAHARU)
        "aqidah": "Aqidah", "ibadah": "Ibadah", "sirah": "Sirah", "akhlak": "Akhlak",
        "mufrodat": "Mufrodat", "qawaid": "Qawaid", "hiwar": "Hiwar", "arqam": "Arqam"
    };

    // Ambil tajuk yang dipetakan, jika tiada baru fallback format asal string (.toUpperCase)
    let title = DAFTAR_TAJUK[type] || type.toUpperCase().replace(/_/g, ' ');
    
    const titleEl = document.getElementById('game-title');
    if (titleEl) titleEl.innerText = title;

// ==========================================
    // 3. TARIK DATA SOALAN (SEMUA SUBJEK)
    // ==========================================
    let allQuestions = [];
    let isRTL = false; // 🟢 Tambah penanda untuk format Kanan-ke-Kiri
    
    if (typeof gameData !== 'undefined' && gameData[type]) {
        allQuestions = [...gameData[type]]; 
    } 
    else if (typeof mathData !== 'undefined' && mathData[type]) {
        allQuestions = [...mathData[type]]; 
    }
    else if (typeof scienceData !== 'undefined' && scienceData[type]) {
        allQuestions = [...scienceData[type]]; 
    }
    else if (typeof malayLanguageData !== 'undefined' && malayLanguageData[type]) {
        allQuestions = [...malayLanguageData[type]]; 
    }
    else if (typeof sejarahData !== 'undefined' && sejarahData[type]) {
        allQuestions = [...sejarahData[type]]; 
    }
    else if (typeof pjkData !== 'undefined' && pjkData[type]) {
        allQuestions = [...pjkData[type]]; 
    }
    else if (typeof pendidikanMuzikData !== 'undefined' && pendidikanMuzikData[type]) {
        allQuestions = [...pendidikanMuzikData[type]]; 
    }
    else if (typeof moralData !== 'undefined' && moralData[type]) {
        allQuestions = [...moralData[type]]; 
    }
    else if (typeof psvData !== 'undefined' && psvData[type]) {
        allQuestions = [...psvData[type]]; 
    }
    else if (typeof rbtData !== 'undefined' && rbtData[type]) {
        allQuestions = [...rbtData[type]]; 
    }
    // 🟢 SUBJEK JAWI / ARAB
    else if (typeof paiQuestions !== 'undefined' && paiQuestions[type]) {
        allQuestions = [...paiQuestions[type]]; 
        isRTL = true; // Aktifkan RTL
    }
    else if (typeof baQuestions !== 'undefined' && baQuestions[type]) {
        allQuestions = [...baQuestions[type]]; 
        isRTL = true; // Aktifkan RTL
    }

    if (allQuestions.length === 0) {
        container.innerHTML = "<p class='text-center text-red-500 font-bold mt-10'>Soalan belum disediakan untuk kategori ini!</p>";
        return; 
    }
    
    // Susun rawak soalan
    allQuestions.sort(() => Math.random() - 0.5);

    // Render ke HTML kontena
    allQuestions.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = "bg-white p-5 rounded-2xl border-l-4 border-indigo-400 shadow-sm";
        
        // Semak format data
        const soalanTeks = item.question || item.q;
        const jawapanTeks = item.answer !== undefined ? item.answer : item.a;
        
        if (type === 'speaking' || type === 'pronunciation') {
            div.classList.add('text-center');
            div.innerHTML = `
                <p class="font-bold text-gray-500 mb-2">Sebut ayat di bawah:</p>
                <h1 class="text-2xl font-extrabold text-indigo-700 mb-4 target-word">${soalanTeks}</h1>
                <button type="button" onclick="startMic(this)" class="bg-red-500 hover:bg-red-600 text-white py-3 px-6 rounded-full font-bold shadow-md">
                    🎤 Tekan & Cakap
                </button>
                <p class="status-text text-sm text-gray-500 mt-3 italic"></p>
                <input type="hidden" class="game-input" data-answer="${jawapanTeks}" value="">
            `;
        } 
        else if (item.options && Array.isArray(item.options)) {
            // ====================================================================
            // 🟢 MAGIS BUTANG MCQ (MENYOKONG KEDUA-DUA LTR & RTL)
            // ====================================================================
            let butangPilihanHTML = '';
            item.options.forEach((opt, optIndex) => {
                butangPilihanHTML += `
                    <label class="block p-4 mb-3 border-2 border-gray-100 rounded-xl cursor-pointer hover:bg-indigo-50 hover:border-indigo-300 transition-all flex items-center gap-4">
                        <input type="radio" name="soalan_${index}" value="${optIndex}" onchange="document.getElementById('hidden_jawapan_${index}').value = this.value" class="w-6 h-6 text-indigo-600 focus:ring-indigo-500 mx-2 cursor-pointer">
                        <span class="flex-1 ${isRTL ? 'text-xl' : 'text-lg'} font-bold text-gray-800">${opt}</span>
                    </label>
                `;
            });

            // Guna 'isRTL' untuk ubah class dan struktur secara dinamik
            const divDirection = isRTL ? 'dir="rtl" class="text-right"' : 'dir="ltr" class="text-left"';
            const textSize = isRTL ? 'text-2xl' : 'text-lg';
            const numbering = isRTL ? `${soalanTeks} .${index + 1}` : `${index + 1}. ${soalanTeks}`;

            div.innerHTML = `
                <div ${divDirection}>
                    <p class="font-bold text-indigo-900 mb-5 ${textSize} leading-relaxed">${numbering}</p>
                    <div class="space-y-2 mt-4">
                        ${butangPilihanHTML}
                    </div>
                    <input type="hidden" id="hidden_jawapan_${index}" class="game-input" data-answer="${jawapanTeks}" value="">
                </div>
            `;
        } 
        else {
            // Format Biasa (Taip Jawapan)
            // ... (Kekalkan bahagian ini sama seperti asal)
            div.innerHTML = `
                <p class="font-bold text-gray-700 mb-3">${index + 1}. ${soalanTeks}</p>
                <input type="text" class="game-input w-full p-3 rounded-lg bg-gray-50 border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-400" placeholder="Taip jawapan anda di sini..." data-answer="${jawapanTeks}">
            `;
        }
        container.appendChild(div);
    });


// ==========================================
    // 4. PENGURUSAN MASA (DINAMIK GLOBAL)
    // ==========================================
    let timeLimit = 180; // Default: Easy = 3 minit (180 saat) jika tiada dalam config

    // 1. UTAMA: Cari masa spesifik dalam config global HAD_MASA_GAME (Menyokong SEMUA subjek)
    if (typeof HAD_MASA_GAME !== 'undefined' && HAD_MASA_GAME[type] !== undefined) {
        timeLimit = HAD_MASA_GAME[type];
    } 
    // 2. SANDARAN (Fallback): Jika kod lama Matematik masih digunakan di tempat lain
    else if (typeof HAD_MASA_MATEMATIK !== 'undefined' && HAD_MASA_MATEMATIK[type] !== undefined) {
        timeLimit = HAD_MASA_MATEMATIK[type];
    } 
    // 3. SANDARAN TERAKHIR: Jika kategori tiada langsung dalam HAD_MASA_GAME (Semakan Tahap Am)
    else {
        // Semak jika kategori termasuk dalam kumpulan MEDIUM (5 minit / 300 saat)
        if (
            (typeof englishCategoryDifficulty !== 'undefined' && englishCategoryDifficulty.medium.includes(type)) || 
            (typeof mathCategoryDifficulty !== 'undefined' && mathCategoryDifficulty.medium.includes(type)) || 
            (typeof scienceCategoryDifficulty !== 'undefined' && scienceCategoryDifficulty.medium.includes(type))
        ) {
            timeLimit = 300;
        }
        
        // Semak jika kategori termasuk dalam kumpulan HARD (7 minit / 420 saat)
        if (
            (typeof englishCategoryDifficulty !== 'undefined' && englishCategoryDifficulty.hard.includes(type)) || 
            (typeof mathCategoryDifficulty !== 'undefined' && mathCategoryDifficulty.hard.includes(type)) || 
            (typeof scienceCategoryDifficulty !== 'undefined' && scienceCategoryDifficulty.hard.includes(type))
        ) {
            timeLimit = 420;
        }
    }

    // Gerakkan jam pembilang mengikut had masa yang telah ditentukan
    if (typeof startTimer === 'function') {
        startTimer(timeLimit); 
    }
} // <--- INI SAHAJA PENUTUP UNTUK FUNGSI initGame()

// ==========================================
// 2. KAWALAN MASA & MARKAH
// ==========================================

function startTimer(seconds) {
    console.log("🕒 Sistem cuba mulakan jam: " + seconds + " saat"); // Pengesan 1
    
    timeLeft = seconds;
    if(currentTimer) clearInterval(currentTimer);
    
    currentTimer = setInterval(() => {
        const mins = Math.floor(timeLeft / 60);
        const secs = timeLeft % 60;
        
        // Cari ID 'timer-text' dalam HTML
        const timerBox = document.getElementById('timer-text'); 
        
        if (timerBox) {
            timerBox.innerText = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
            if (timeLeft <= 10) {
                timerBox.classList.add('animate-pulse', 'text-red-800'); 
            } else {
                timerBox.classList.remove('animate-pulse', 'text-red-800');
            }
        } else {
            console.log("❌ Ralat: Sistem tak jumpa ID 'timer-text' di dalam index.html!"); // Pengesan 2
        }

        if (timeLeft <= 0) {
            clearInterval(currentTimer);
            if (typeof timeUp === 'function') timeUp();
        }
        timeLeft--;
    }, 1000);
}

function timeUp() {
    const timerBox = document.getElementById('timer-text'); // Ditukar kepada 'timer-tefxt'
    if (timerBox) timerBox.innerText = "TIME UP!";
    
    // Kunci semua input supaya murid tak boleh menaip lagi
    document.querySelectorAll('.game-input').forEach(input => input.disabled = true);
    
    // Tunjuk popup yang lebih kemas berbanding 'alert' biasa, dan terus semak jawapan
    Swal.fire({
        icon: 'warning',
        title: "TIME'S UP! ⏳",
        text: "Times Up. Let's check your score!",
        confirmButtonText: "Semak Markah",
        confirmButtonColor: "#ef4444",
        allowOutsideClick: false
    }).then(() => {
        endGame(); // Terus kira markah tanpa murid perlu tekan butang
    });
}


// ==========================================
// KEMASKINI: PENGIRAAN MASTERY UNTUK SEMUA SUBJEK
// ==========================================
function updateCategoryProgress() {
    const userScores = localPlayerData.games || {};
    let totalMastered = Object.keys(userScores).filter(cat => {
        let sc = typeof userScores[cat] === 'object' ? userScores[cat].score : parseInt(userScores[cat]) || 0;
        
        // 🛠️ FIX: Cari jumlah soalan dalam SEMUA fail pangkalan data subjek
        let tq = -1;
        if (typeof gameData !== 'undefined' && gameData[cat]) tq = gameData[cat].length; // English
        else if (typeof mathData !== 'undefined' && mathData[cat]) tq = mathData[cat].length;
        else if (typeof scienceData !== 'undefined' && scienceData[cat]) tq = scienceData[cat].length;
        else if (typeof bmData !== 'undefined' && bmData[cat]) tq = bmData[cat].length;
        else if (typeof sejarahData !== 'undefined' && sejarahData[cat]) tq = sejarahData[cat].length;
        else if (typeof pjkData !== 'undefined' && pjkData[cat]) tq = pjkData[cat].length;
        else if (typeof muzikData !== 'undefined' && muzikData[cat]) tq = muzikData[cat].length;
        else if (typeof moralData !== 'undefined' && moralData[cat]) tq = moralData[cat].length;
        else if (typeof psvData !== 'undefined' && psvData[cat]) tq = psvData[cat].length;
        else if (typeof rbtData !== 'undefined' && rbtData[cat]) tq = rbtData[cat].length;

        // Semak jika markah sama dengan jumlah soalan (Sempurna)
        return sc > 0 && sc === tq; 
    }).length;
    
    const masteryElement = document.getElementById('mastery-count');
    if (masteryElement) masteryElement.innerText = totalMastered;
}

// ==========================================
// 3. LEADERBOARD (VERSI 12 SUBJEK, SCROLLABLE TABS & DEV GOD-MODE)
// ==========================================

window.leaderboardDataTemp = []; 
window.lastLeaderboardFetch = 0; 
window.currentDevYearView = '6'; // Default paparan tahun untuk akaun DEV

async function loadLeaderboard() {
    document.getElementById('menu-screen').classList.add('hidden');
    document.getElementById('game-arena').classList.add('hidden');
    document.getElementById('leaderboard-screen').classList.remove('hidden');
    
    const listContainer = document.getElementById('leaderboard-list');
    const lbSchoolName = document.getElementById('lb-school-name');
    
    const infoPemain = (typeof studentInfo !== 'undefined') ? studentInfo : (typeof localPlayerData !== 'undefined' ? localPlayerData : null);
    const mySchool = infoPemain ? infoPemain.school : "";

    if (lbSchoolName) lbSchoolName.innerText = `School: ${mySchool || 'Global'}`;

    // 🛡️ GATEKEEPER CACHE (PENTING!) 🛡️
    const currentTime = Date.now();
    const cacheValidTime = 3 * 60 * 1000; // 3 minit
    
    if (window.leaderboardDataTemp.length > 0 && (currentTime - window.lastLeaderboardFetch) < cacheValidTime) {
        console.log("Leaderboard: Menggunakan data dari cache lokal (Menjimatkan Reads!)");
        renderLeaderboardData('all');
        return; // BERHENTI DI SINI. Jangan panggil Firebase!
    }
    
    if (listContainer) {
        listContainer.innerHTML = `
            <div class='p-12 text-center text-indigo-500 font-bold animate-pulse'>
                <i class='fas fa-shield-alt fa-spin text-4xl mb-4 block'></i>
                Menyusun Kedudukan Sekolah...
            </div>`;
    }

    try {
        let query = db.collection("players");
        if (mySchool) {
            query = query.where("school", "==", mySchool);
        }

        const snapshot = await query.get();
        
        if(snapshot.empty) {
            listContainer.innerHTML = "<div class='p-8 text-center text-gray-400 font-bold'>Tiada rekod untuk sekolah ini.</div>";
            return;
        }

        window.leaderboardDataTemp = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            if (data.class !== "ADMIN" && data.totalScore && data.totalScore > 0) { 
                window.leaderboardDataTemp.push(data);
            }
        });

        window.lastLeaderboardFetch = currentTime;
        renderLeaderboardData('all');

    } catch (error) {
        console.error("Leaderboard Error:", error);
        listContainer.innerHTML = `
            <div class='p-8 text-center text-red-500 font-bold'>
                <i class='fas fa-exclamation-circle text-2xl mb-2'></i><br>
                Ralat memuat turun data.
            </div>`;
    }
}

// 🌟 FUNGSI PENUKAR TAHUN KHAS UNTUK USER DEV 🌟
function changeDevYearView(year, currentTab) {
    window.currentDevYearView = year;
    renderLeaderboardData(currentTab);
}

// 🌟 FUNGSI UTAMA PAPARAN LEADERBOARD 🌟
function renderLeaderboardData(filterTab) {
    const listContainer = document.getElementById('leaderboard-list');
    const controlsContainer = document.getElementById('leaderboard-controls');
    if (!listContainer) return;

    // Ambil data pemain semasa log masuk
    const infoPemain = (typeof studentInfo !== 'undefined') ? studentInfo : (typeof localPlayerData !== 'undefined' ? localPlayerData : null);
    const currentPlayerName = infoPemain ? String(infoPemain.name).toUpperCase().trim() : "";
    const currentUserClass = infoPemain ? String(infoPemain.class).toUpperCase().trim() : "";
    
    const isDevUser = currentUserClass === "DEV";

    // 🛡️ Logik Kecemasan: Jika DEV masuk dan tahun belum dipilih, tetapkan ke Tahun 4 secara default
    if (isDevUser && !window.currentDevYearView) {
        window.currentDevYearView = "4";
    }

    // Tentukan tahun sasaran yang mahu dilihat
    const targetYear = isDevUser ? window.currentDevYearView : currentUserClass.charAt(0);

    // 🔥 TAPIS DATA: Buang semua akaun DEV dan ambil tahun yang betul sahaja
    let players = window.leaderboardDataTemp.filter(p => {
        const pClass = String(p.class || "").toUpperCase().trim();
        
        // ❌ JIKA KELAS ADALAH "DEV", JANGAN MASUKKAN DALAM LEADERBOARD Langsung!
        if (pClass === "DEV") return false; 
        
        // Hanya ambil murid yang kelasnya bermula dengan angka tahun sasaran (cth: "4")
        return pClass.startsWith(targetYear); 
    });

    // 🎨 KONFIGURASI 12 SUBJEK
    const subjectConfig = {
        'all':     { label: 'Keseluruhan', icon: '🏆', colorBtn: 'bg-indigo-600',  colorText: 'text-indigo-600',  field: 'totalScore' },
        'bm':      { label: 'BM',          icon: '📝', colorBtn: 'bg-red-500',     colorText: 'text-red-600',     field: 'score_bm' },
        'english': { label: 'English',     icon: '📘', colorBtn: 'bg-blue-500',    colorText: 'text-blue-600',    field: 'score_english' },
        'math':    { label: 'Matematik',   icon: '📐', colorBtn: 'bg-green-500',   colorText: 'text-green-600',   field: 'score_matematik' },
        'sains':   { label: 'Sains',       icon: '🔬', colorBtn: 'bg-teal-500',    colorText: 'text-teal-600',    field: 'score_sains' },
        'sejarah': { label: 'Sejarah',     icon: '⏳', colorBtn: 'bg-amber-600',   colorText: 'text-amber-700',   field: 'score_sejarah' },
        'pjk':     { label: 'PJK',         icon: '🏃', colorBtn: 'bg-rose-500',    colorText: 'text-rose-600',    field: 'score_pjk' },
        'muzik':   { label: 'Muzik',       icon: '🎵', colorBtn: 'bg-purple-500',  colorText: 'text-purple-600',  field: 'score_muzik' },
        'moral':   { label: 'Moral',       icon: '🤝', colorBtn: 'bg-orange-500',  colorText: 'text-orange-600',  field: 'score_moral' },
        'psv':     { label: 'Seni (PSV)',  icon: '🎨', colorBtn: 'bg-pink-500',    colorText: 'text-pink-600',    field: 'score_psv' },
        'rbt':     { label: 'RBT',         icon: '⚙️',  colorBtn: 'bg-cyan-600',    colorText: 'text-cyan-700',    field: 'score_rbt' },
        'pai':     { label: 'PAI',         icon: '🕋', colorBtn: 'bg-emerald-600', colorText: 'text-emerald-700', field: 'score_pai' },
        'ba':      { label: 'B.Arab',      icon: '🔤', colorBtn: 'bg-lime-600',    colorText: 'text-lime-700',    field: 'score_ba' }
    };

    // Ekstrak markah ikut subjek terpilih & susun kedudukan (Sorting)
    players.forEach(p => {
        const config = subjectConfig[filterTab] || subjectConfig['all'];
        p.sortScore = parseInt(p[config.field]) || 0;
    });
    players.sort((a, b) => b.sortScore - a.sortScore);

    // 👑 REKAAN DASHBOARD UNTUK GURU / DEV USER
    let devControlsHtml = '';
    if (isDevUser) {
        devControlsHtml = `
        <div class="mb-3 p-3 bg-slate-950 rounded-2xl border-2 border-amber-500 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-2">
            <div class="text-amber-400 font-black text-xs uppercase tracking-wider flex items-center gap-1.5">
                <i class="fas fa-user-shield text-sm"></i> DEV MODE (VIEWING YEAR ${targetYear})
            </div>
            <div class="flex gap-1">
                <button onclick="changeDevYearView('4', '${filterTab}')" class="px-3 py-1.5 rounded-xl font-black text-xs transition-all ${targetYear === '4' ? 'bg-amber-500 text-slate-900 shadow-md scale-105' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}">Tahun 4</button>
                <button onclick="changeDevYearView('5', '${filterTab}')" class="px-3 py-1.5 rounded-xl font-black text-xs transition-all ${targetYear === '5' ? 'bg-amber-500 text-slate-900 shadow-md scale-105' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}">Tahun 5</button>
                <button onclick="changeDevYearView('6', '${filterTab}')" class="px-3 py-1.5 rounded-xl font-black text-xs transition-all ${targetYear === '6' ? 'bg-amber-500 text-slate-900 shadow-md scale-105' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}">Tahun 6</button>
            </div>
        </div>`;
    }

    // 📱 REKAAN MENU BUTTON SUBJEK (SCROLLABLE)
    let tabsHtml = `<div class="flex overflow-x-auto pb-2 mb-2 space-x-2 scrollbar-none">`;
    Object.keys(subjectConfig).forEach(key => {
        const conf = subjectConfig[key];
        const isActive = filterTab === key;
        const btnClass = isActive ? `${conf.colorBtn} text-white shadow-md scale-105` : `bg-gray-100 text-gray-500 hover:bg-gray-200`;
            
        tabsHtml += `
            <button onclick="renderLeaderboardData('${key}')" class="shrink-0 px-4 py-2 rounded-xl font-bold text-xs transition-all ${btnClass}">
                ${conf.icon} ${conf.label}
            </button>`;
    });
    tabsHtml += `</div>`;

    // Masukkan bahagian penapis ke HTML container atas
    if (controlsContainer) {
        controlsContainer.innerHTML = devControlsHtml + tabsHtml;
    }

// 📜 REKAAN SENARAI MURID
    let htmlContent = ''; 
    let index = 0;
    
    players.slice(0, 50).forEach(student => {
        if (student.sortScore <= 0) return; // Langkau jika tiada markah

        index++;
        const safeName = student.name ? String(student.name).toUpperCase() : "EXPLORER";
        const safeCls = student.class || "-";
        const studentLevel = student.level || 1; 
        
        let rankIcon = `#${index}`;
        if(index === 1) rankIcon = `🥇`;
        else if(index === 2) rankIcon = `🥈`;
        else if(index === 3) rankIcon = `🥉`;

        const isMe = (currentPlayerName !== "" && safeName === currentPlayerName);

        let visualContent = `<span class="text-xl">👤</span>`;
        let avatarData = student.activeAvatar || student.avatar;
        if (avatarData && typeof avatarData === 'string') {
            if (avatarData.startsWith('img|')) {
                // Tambah drop-shadow supaya imej lebih pop-up
                visualContent = `<img src="${avatarData.replace('img|', '').trim()}" class="w-[85%] h-[85%] object-contain drop-shadow-sm">`;
            } else if (avatarData.startsWith('icon|')) {
                visualContent = `<i class="${avatarData.replace('icon|', '').trim()} text-xl text-indigo-500"></i>`;
            }
        }

        // 🌟 KEMASKINI: Tambah z-10 pada LVL dan letak posisi yang lebih cantik
        const avatarHtml = `
            <div class="relative flex items-center justify-center w-12 h-12 bg-gradient-to-b from-white to-indigo-50 rounded-xl border shrink-0">
                ${visualContent}
                <div class="absolute -bottom-2 -right-1.5 bg-green-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow-sm z-10">LVL ${studentLevel}</div>
            </div>`;

        const currentConfig = subjectConfig[filterTab] || subjectConfig['all'];
        let rowTheme = isMe ? 'bg-yellow-50 border-yellow-300' : 'bg-white border-gray-100 hover:border-indigo-100';

        // 🌟 KEMASKINI: Ganti 'overflow-hidden' dengan 'min-w-0 flex-1'
        htmlContent += `
            <div class="flex items-center justify-between p-3 rounded-2xl border-2 mb-2 ${rowTheme}">
                <div class="flex items-center gap-3 min-w-0 flex-1">
                    <div class="font-black text-indigo-400 text-lg w-6 text-center shrink-0">${rankIcon}</div>
                    ${avatarHtml}
                    <div class="flex flex-col min-w-0 pr-2">
                        <div class="font-bold uppercase text-slate-800 text-sm truncate">${safeName}</div>
                        <div class="text-[10px] font-bold text-slate-400 uppercase truncate">${safeCls}</div>
                    </div>
                </div>
                <div class="text-right shrink-0">
                    <div class="${currentConfig.colorBtn} text-white px-3 py-1 rounded-xl font-black text-sm">
                        ${student.sortScore.toLocaleString()} <span class="text-[9px] font-normal opacity-80">${filterTab === 'all' ? 'XP' : 'PTS'}</span>
                    </div>
                </div>
            </div>`;
    });

    if (index === 0) {
        htmlContent += `<div class='p-8 text-center text-gray-400 font-bold'>Tiada rekod data bagi Tahun ${targetYear} untuk kategori ini.</div>`;
    }

    listContainer.innerHTML = htmlContent;
}


/* ==========================================
   FUNGSI AUDIO UNTUK LISTENING GAME (WEB SPEECH API)
   ========================================== */
window.playAudio = function(wordToSay) {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel(); 
        var msg = new SpeechSynthesisUtterance();
        msg.text = wordToSay;
        msg.lang = 'en-US'; 
        msg.rate = 0.85; // Diperlahankan sedikit supaya murid dengar dengan jelas
        window.speechSynthesis.speak(msg);
    } else {
        alert("Sorry, this browser (device) did not support audio function.");
    }
};

/* ==========================================
   FUNGSI AI SUARA (SPEECH RECOGNITION) - VERSI KEBAL
   ========================================== */
window.startMic = function(btnElement) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        alert("Please use Google Chrome for microphone function.");
        return;
    }

    // CARA BAHARU: Suruh sistem cari kotak utama (kad putih) berbanding kotak sebelah
    const parentDiv = btnElement.closest('.bg-white') || btnElement.parentElement;
    
    // Cari elemen perkataan (AI akan cari class .target-word ATAU tag <h1> sebagai sandaran)
    const wordElement = parentDiv.querySelector('.target-word') || parentDiv.querySelector('h1');
    
    if (!wordElement) {
        alert("System Error: Can't detect question text on the screen.");
        return;
    }

    const targetWord = wordElement.innerText.toLowerCase();
    const statusText = parentDiv.querySelector('.status-text');
    const hiddenInput = parentDiv.querySelector('.game-input');

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;

    recognition.onstart = function() {
        btnElement.innerHTML = "🎙️ Mendengar...";
        btnElement.classList.replace('bg-red-500', 'bg-red-800');
        if(statusText) statusText.innerText = "Sila sebut sekarang...";
    };

    recognition.onresult = function(event) {
        // Ambil suara murid
        let transcript = event.results[0][0].transcript.toLowerCase().trim();
        
        // Buang tanda baca supaya AI tak keliru
        let cleanTranscript = transcript.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"");
        let cleanTarget = targetWord.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"");

        if (cleanTranscript === cleanTarget) {
            if(statusText) {
                statusText.innerText = "✅ TEPAT! (" + transcript + ")";
                statusText.classList.replace('text-gray-500', 'text-green-600');
            }
            // Masukkan jawapan betul ke dalam input ghaib
            if(hiddenInput) hiddenInput.value = targetWord; 
            
            btnElement.innerHTML = "✅ Selesai";
            btnElement.disabled = true;
            btnElement.classList.replace('bg-red-800', 'bg-green-500');
        } else {
            if(statusText) {
                statusText.innerText = "❌ Anda sebut: '" + transcript + "'. Cuba lagi!";
                statusText.classList.replace('text-gray-500', 'text-red-500');
            }
            btnElement.innerHTML = "🎤 Cuba Lagi";
            btnElement.classList.replace('bg-red-800', 'bg-red-500');
        }
    };

    recognition.onerror = function(event) {
        if(statusText) statusText.innerText = "Gagal mengecam suara. Sila tekan sekali lagi.";
        btnElement.innerHTML = "🎤 Tekan & Cakap";
        btnElement.classList.replace('bg-red-800', 'bg-red-500');
    };

    recognition.onend = function() {
        if(btnElement.innerHTML !== "✅ Selesai") {
            btnElement.innerHTML = "🎤 Tekan & Cakap";
            btnElement.classList.replace('bg-red-800', 'bg-red-500');
        }
    };

    recognition.start();
  };

// ==========================================
// 3. PENGIRAAN MARKAH (END GAME) - VERSI LENGKAP & SEMPURNA
// ==========================================
function endGame() {
    // 1. Hentikan masa (jika ia masih berjalan)
    if (typeof currentTimer !== 'undefined') clearInterval(currentTimer);

    // ==========================================
    // 🟢 KEMAS KINI STATUS FIREBASE KE "IDLE"
    // ==========================================
    if (typeof studentInfo !== 'undefined' && studentInfo.name) {
        const docId = `${studentInfo.school}_${studentInfo.class}_${studentInfo.name}`.replace(/\s+/g, '_');
        db.collection("players").doc(docId).set({
            isOnline: true,
            currentStatus: "idle"
        }, { merge: true }).catch(e => console.log("Gagal kemaskini status idle:", e));
    }

    let score = 0;
    const inputs = document.querySelectorAll('.game-input');
    const totalQuestions = inputs.length;

    // Jika tiada soalan, elakkan ralat
    if (totalQuestions === 0) return;

    // Sembunyikan butang semak supaya tak ditekan 2 kali
    const checkBtn = document.getElementById('check-btn');
    if (checkBtn) checkBtn.classList.add('hidden');

    // 2. Semak setiap jawapan murid
    inputs.forEach(input => {
        input.disabled = true; // Kunci kotak
        
        const userAnswer = input.value.trim().toLowerCase();
        const correctAnswersList = input.getAttribute('data-answer').trim().toLowerCase().split("|");

        if (correctAnswersList.includes(userAnswer) && userAnswer !== "") {
            // BETUL
            score++;
            input.classList.remove('bg-gray-50', 'border-gray-200');
            input.classList.add('bg-green-100', 'border-green-500', 'text-green-800', 'font-bold');
        } else {
            // SALAH / KOSONG
            input.classList.remove('bg-gray-50', 'border-gray-200');
            input.classList.add('bg-red-100', 'border-red-500', 'text-red-800');
            
            if (userAnswer === "") {
                input.value = `(Jawapan: ${input.getAttribute('data-answer')})`;
            } else {
                input.value = `${input.value} ❌ (Betul: ${input.getAttribute('data-answer')})`;
            }
        }
    });

    // 3. Kira peratus markah
    const percentage = Math.round((score / totalQuestions) * 100);

    // =========================================================================
    // LOGIK SIMPAN MARKAH, XP & KOIN 💰 (VERSI STABIL - CEGAH RESET DATA)
    // =========================================================================

    // 🚫 SISTEM PENGHALANG (SAFEGUARD 1): Sekat simpanan jika data murid belum sedia/kosong
    if (typeof localPlayerData === 'undefined' || !localPlayerData.name) {
        console.error("⚠️ RALAT KRITIKAL: Data pemain belum dimuatkan sepenuhnya! Rekod permainan TIDAK disimpan bagi mengelakkan data ter-reset.");
        return;
    }

    // 🛡️ SISTEM PENGHALANG (SAFEGUARD 2): Sekat jika data XP/Coins hilang dari memori
    if (typeof localPlayerData.coins === 'undefined' || typeof localPlayerData.xp === 'undefined') {
        console.error("⚠️ RALAT KRITIKAL: Data XP/Coins tempatan hilang! Simpanan dibatalkan untuk elak reset data.");
        return;
    }

    // 1. TAMBAHKAN SUBJEK KE DALAM ARRAY KESUKARAN
    const allMedium = [
        ...(typeof mathCategoryDifficulty !== 'undefined' ? mathCategoryDifficulty.medium : []),
        ...(typeof englishCategoryDifficulty !== 'undefined' ? englishCategoryDifficulty.medium : []),
        ...(typeof scienceCategoryDifficulty !== 'undefined' ? scienceCategoryDifficulty.medium : []),
        ...(typeof bmCategoryDifficulty !== 'undefined' ? bmCategoryDifficulty.medium : []),
        ...(typeof sejarahCategoryDifficulty !== 'undefined' ? sejarahCategoryDifficulty.medium : []),
        ...(typeof kesihatanCategoryDifficulty !== 'undefined' ? kesihatanCategoryDifficulty.medium : []),
        ...(typeof muzikCategoryDifficulty !== 'undefined' ? muzikCategoryDifficulty.medium : []),
        ...(typeof moralCategoryDifficulty !== 'undefined' ? moralCategoryDifficulty.medium : []),
        ...(typeof psvCategoryDifficulty !== 'undefined' ? psvCategoryDifficulty.medium : []),
        ...(typeof rbtCategoryDifficulty !== 'undefined' ? rbtCategoryDifficulty.medium : []),
        ...(typeof paiCategoryDifficulty !== 'undefined' ? paiCategoryDifficulty.medium : []), 
        ...(typeof baCategoryDifficulty !== 'undefined' ? baCategoryDifficulty.medium : [])  
    ];

    const allHard = [
        ...(typeof mathCategoryDifficulty !== 'undefined' ? mathCategoryDifficulty.hard : []),
        ...(typeof englishCategoryDifficulty !== 'undefined' ? englishCategoryDifficulty.hard : []),
        ...(typeof scienceCategoryDifficulty !== 'undefined' ? scienceCategoryDifficulty.hard : []),
        ...(typeof bmCategoryDifficulty !== 'undefined' ? bmCategoryDifficulty.hard : []),
        ...(typeof sejarahCategoryDifficulty !== 'undefined' ? sejarahCategoryDifficulty.hard : []),
        ...(typeof kesihatanCategoryDifficulty !== 'undefined' ? kesihatanCategoryDifficulty.hard : []),
        ...(typeof muzikCategoryDifficulty !== 'undefined' ? muzikCategoryDifficulty.hard : []),
        ...(typeof moralCategoryDifficulty !== 'undefined' ? moralCategoryDifficulty.hard : []),
        ...(typeof psvCategoryDifficulty !== 'undefined' ? psvCategoryDifficulty.hard : []),
        ...(typeof rbtCategoryDifficulty !== 'undefined' ? rbtCategoryDifficulty.hard : []),
        ...(typeof paiCategoryDifficulty !== 'undefined' ? paiCategoryDifficulty.hard : []), 
        ...(typeof baCategoryDifficulty !== 'undefined' ? baCategoryDifficulty.hard : [])  
    ];

    // Tentukan pengganda (multiplier) kesukaran
    let multiplier = 1; // Default: Easy
    if (typeof currentGameType !== 'undefined' && currentGameType) {
        if (allMedium.includes(currentGameType)) multiplier = 2;
        else if (allHard.includes(currentGameType)) multiplier = 3;
    }

    // Kira XP dan Koin (Asas)
    let pointsEarned = score * multiplier; 
    let coinsEarned = score * 2 * multiplier; 

    // =======================================================
    // ✨ INTEGRASI BARU: PEMPROSESAN IMPAK GANJARAN LTE
    // =======================================================
    let dipengaruhiLTE = false;
    let jenisBoost = "";

    if (typeof currentActiveEvent !== 'undefined' && currentActiveEvent !== null) {
        // HALUAN A: Ganjaran Jenis Pengganda (Buff)
        if (currentActiveEvent.rewardType === 'xp_buff') {
            pointsEarned = Math.floor(pointsEarned * currentActiveEvent.rewardValue);
            dipengaruhiLTE = true;
            jenisBoost = `✨ XP x${currentActiveEvent.rewardValue} BOOST!`;
            console.log(`🚀 LTE AKTIF: XP digandakan kepada ${pointsEarned}!`);
        } 
        else if (currentActiveEvent.rewardType === 'coins_buff') {
            coinsEarned = Math.floor(coinsEarned * currentActiveEvent.rewardValue);
            dipengaruhiLTE = true;
            jenisBoost = `💰 KOIN x${currentActiveEvent.rewardValue} BOOST!`;
            console.log(`💰 LTE AKTIF: Syiling digandakan kepada ${coinsEarned}!`);
        }
        
        // HALUAN B: Ganjaran Jenis Kumpul Hari (Login & Play)
        if (currentActiveEvent.requiredAction === "login_and_play") {
            if (!localPlayerData.lte_attendance) localPlayerData.lte_attendance = {};
            if (!localPlayerData.lte_attendance[currentActiveEvent.name]) {
                localPlayerData.lte_attendance[currentActiveEvent.name] = {};
            }
            
            const today = new Date();
            const dateKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
            
            // Rekodkan kehadiran hari ini
            localPlayerData.lte_attendance[currentActiveEvent.name][dateKey] = true;
            
            const totalDaysPlayed = Object.keys(localPlayerData.lte_attendance[currentActiveEvent.name]).length;
            console.log(`📅 [LTE Kehadiran] Misi: ${currentActiveEvent.name} | Progress: ${totalDaysPlayed}/${currentActiveEvent.requiredDays} Hari`);

            // =======================================================
            // 🎁 SISTEM PENGANUGERAHAN AUTOMATIK LTE (AUTO-GIFT)
            // =======================================================
            if (totalDaysPlayed >= currentActiveEvent.requiredDays) {
                let eventSafeName = currentActiveEvent.name.replace(/\s+/g, '_');
                if (!localPlayerData.lte_claimed) localPlayerData.lte_claimed = {};
                
                if (!localPlayerData.lte_claimed[eventSafeName]) {
                    // 1. Hadiah Jenis Lencana (Badge & Title)
                    if (currentActiveEvent.rewardType === "custom_title" || currentActiveEvent.rewardType === "event_badge") {
                        if (!localPlayerData.inventory) localPlayerData.inventory = [];
                        
                        let badgeIdToGive = "";
                        if (currentActiveEvent.name.includes("Pencarian Perintis")) badgeIdToGive = "lte_feb_2026";
                        if (currentActiveEvent.name.includes("Karnival Jaguh")) badgeIdToGive = "lte_jul_2026";
                        if (currentActiveEvent.name.includes("Pahlawan Merdeka")) badgeIdToGive = "lte_aug_2026";
                        
                        if (badgeIdToGive && !localPlayerData.inventory.includes(badgeIdToGive)) {
                            localPlayerData.inventory.push(badgeIdToGive);
                            localPlayerData.lte_claimed[eventSafeName] = true;
                            
                            jenisBoost = `🏆 MISI SELESAI: Lencana & Title '${currentActiveEvent.rewardValue}' Diperolehi! Buka Profil Untuk Pakai.`;
                            dipengaruhiLTE = true;
                            console.log(`🎁 [AUTO-GIFT] Lencana ${badgeIdToGive} ditolak ke inventory!`);
                        }
                    }
                    // 2. Hadiah Jenis Avatar
                    else if (currentActiveEvent.rewardType === "custom_avatar") {
                        if (!localPlayerData.ownedAvatars) localPlayerData.ownedAvatars = [];
                        let avatarFile = `img|assets/avatars/${currentActiveEvent.rewardValue}`;
                        
                        if (!localPlayerData.ownedAvatars.includes(avatarFile)) {
                            localPlayerData.ownedAvatars.push(avatarFile);
                            localPlayerData.lte_claimed[eventSafeName] = true;
                            
                            jenisBoost = `👤 MISI SELESAI: Avatar Eksklusif Diperolehi! Buka Profil Untuk Pakai.`;
                            dipengaruhiLTE = true;
                            console.log(`🎁 [AUTO-GIFT] Avatar ${avatarFile} ditambah!`);
                        }
                    }
                    // 3. Hadiah Jenis Border
                    else if (currentActiveEvent.rewardType === "custom_border") {
                        if (!localPlayerData.ownedBorders) localPlayerData.ownedBorders = [];
                        let borderFile = `assets/borders/${currentActiveEvent.rewardValue}`;
                        
                        if (!localPlayerData.ownedBorders.includes(borderFile)) {
                            localPlayerData.ownedBorders.push(borderFile);
                            localPlayerData.lte_claimed[eventSafeName] = true;
                            
                            jenisBoost = `🖼️ MISI SELESAI: Bingkai Profil Eksklusif Diperolehi! Buka Profil Untuk Pakai.`;
                            dipengaruhiLTE = true;
                            console.log(`🎁 [AUTO-GIFT] Border ${borderFile} ditambah!`);
                        }
                    }
                }
            }
        }
    }

    // =======================================================
    // 2. KEMAS KINI DOMPET MURID (DATA SAH)
    // =======================================================
    localPlayerData.points = (localPlayerData.points || 0) + pointsEarned;
    localPlayerData.totalScore = (parseInt(localPlayerData.totalScore) || 0) + pointsEarned;
    localPlayerData.xp = (parseInt(localPlayerData.xp) || 0) + pointsEarned; 
    localPlayerData.coins = (parseInt(localPlayerData.coins) || 0) + coinsEarned;
    localPlayerData.totalCoinsEarned = (parseInt(localPlayerData.totalCoinsEarned) || 0) + coinsEarned;

    // 3. PENGIRAAN LEVEL SELAMAT
    const calculatedLevel = Math.floor(localPlayerData.xp / 100) + 1;
    const currentLevel = parseInt(localPlayerData.level) || 1;

    if (calculatedLevel > currentLevel) {
        localPlayerData.level = calculatedLevel;
        console.log(`🎉 TAHNIAH! Murid naik ke Level ${calculatedLevel}!`);
    }

    // 4. REKOD PROGRES LTE KE FIRESTORE
    if (typeof updateLteProgress === "function") {
        updateLteProgress();
        console.log("Merekod progres LTE ke Firebase...");
    }

    // 5. SIMPAN KE LOCALSTORAGE
    try {
        localStorage.setItem('playerData', JSON.stringify(localPlayerData));
    } catch (e) {
        console.error("Gagal simpan ke localStorage:", e);
    }

    // 6. SYNC KE FIREBASE FIRESTORE
    if (typeof db !== 'undefined' && typeof studentInfo !== 'undefined' && studentInfo.name) {
        const docId = `${studentInfo.school}_${studentInfo.class}_${studentInfo.name}`.replace(/\s+/g, '_');
        db.collection("players").doc(docId).set(localPlayerData, { merge: true })
            .then(() => console.log("Data permainan berjaya disimpan ke Firebase!"))
            .catch(e => console.error("Gagal simpan ke Firebase:", e));
    }

    // 7. PAPARKAN MODAL KEPUTUSAN
    if (typeof showResultModal === 'function') {
        showResultModal({
            score: score,
            totalQuestions: totalQuestions,
            percentage: percentage,
            pointsEarned: pointsEarned,
            coinsEarned: coinsEarned,
            dipengaruhiLTE: dipengaruhiLTE,
            jenisBoost: jenisBoost
        });
    }
}
    
    // 🔥 MULTI-LEADERBOARD: SIMPAN XP MENGIKUT SUBJEK
    let currentType = (typeof currentGameType !== 'undefined' && currentGameType !== "") ? currentGameType.toLowerCase() : "";

    const senaraiSubjekMaju = [
        { field: 'score_matematik', label: 'Matematik', list: typeof mathCategoryDifficulty !== 'undefined' ? [...mathCategoryDifficulty.easy, ...mathCategoryDifficulty.medium, ...mathCategoryDifficulty.hard] : [] },
        { field: 'score_english',   label: 'English',   list: typeof englishCategoryDifficulty !== 'undefined' ? [...englishCategoryDifficulty.easy, ...englishCategoryDifficulty.medium, ...englishCategoryDifficulty.hard] : [] },
        { field: 'score_sains',     label: 'Sains',     list: typeof scienceCategoryDifficulty !== 'undefined' ? [...scienceCategoryDifficulty.easy, ...scienceCategoryDifficulty.medium, ...scienceCategoryDifficulty.hard] : [] },
        { field: 'score_bm',        label: 'BM',        list: typeof bmCategoryDifficulty !== 'undefined' ? [...bmCategoryDifficulty.easy, ...bmCategoryDifficulty.medium, ...bmCategoryDifficulty.hard] : [] },
        { field: 'score_sejarah',   label: 'Sejarah',   list: typeof sejarahCategoryDifficulty !== 'undefined' ? [...sejarahCategoryDifficulty.easy, ...sejarahCategoryDifficulty.medium, ...sejarahCategoryDifficulty.hard] : [] },
        { field: 'score_pjk',       label: 'PJK',       list: typeof kesihatanCategoryDifficulty !== 'undefined' ? [...kesihatanCategoryDifficulty.easy, ...kesihatanCategoryDifficulty.medium, ...kesihatanCategoryDifficulty.hard] : [] },
        { field: 'score_muzik',     label: 'Muzik',     list: typeof muzikCategoryDifficulty !== 'undefined' ? [...muzikCategoryDifficulty.easy, ...muzikCategoryDifficulty.medium, ...muzikCategoryDifficulty.hard] : [] },
        { field: 'score_moral',     label: 'Moral',     list: typeof moralCategoryDifficulty !== 'undefined' ? [...moralCategoryDifficulty.easy, ...moralCategoryDifficulty.medium, ...moralCategoryDifficulty.hard] : [] },
        { field: 'score_psv',       label: 'PSV',       list: typeof psvCategoryDifficulty !== 'undefined' ? [...psvCategoryDifficulty.easy, ...psvCategoryDifficulty.medium, ...psvCategoryDifficulty.hard] : [] },
        { field: 'score_rbt',       label: 'RBT',       list: typeof rbtCategoryDifficulty !== 'undefined' ? [...rbtCategoryDifficulty.easy, ...rbtCategoryDifficulty.medium, ...rbtCategoryDifficulty.hard] : [] },
        
        // 🟢 TAMBAHAN BAHARU UNTUK PAI & BA 🟢
        { field: 'score_pai',       label: 'PAI',       list: typeof paiCategoryDifficulty !== 'undefined' ? [...paiCategoryDifficulty.easy, ...paiCategoryDifficulty.medium, ...paiCategoryDifficulty.hard] : [] },
        { field: 'score_ba',        label: 'B.Arab',    list: typeof baCategoryDifficulty !== 'undefined' ? [...baCategoryDifficulty.easy, ...baCategoryDifficulty.medium, ...baCategoryDifficulty.hard] : [] }
    ];

    let padananSubjek = senaraiSubjekMaju.find(subjek => subjek.list.includes(currentType));

    if (padananSubjek) {
        localPlayerData[padananSubjek.field] = (parseInt(localPlayerData[padananSubjek.field]) || 0) + pointsEarned;
        console.log(`➕ Tambah ${pointsEarned} XP ${padananSubjek.label}. Jumlah: ${localPlayerData[padananSubjek.field]}`);
    } else {
        // Backup kecemasan (jika ada subjek lama yang belum dipetakan)
        console.log("⚠️ Kategori tidak dijumpai dalam senaraiSubjekMaju:", currentType);
        // Anda boleh buang baris 'score_english' jika tidak mahu ia masuk ke English secara rawak
    }

    // Hujung minggu checker
    const todayDay = new Date().getDay();
    if (todayDay === 0 || todayDay === 6) {
        localPlayerData.hasPlayedWeekend = true;
    }

    // 🏆 SIMPAN MARKAH TERTINGGI (HIGH SCORE) KATEGORI (Asal)
    if (!localPlayerData.games) localPlayerData.games = {}; 
    
    let catName = (typeof currentGameType !== 'undefined' && currentGameType !== "") ? currentGameType : "missing";
    let currentBest = localPlayerData.games[catName] || 0;
	let score = 0;
    
    if (typeof currentBest === 'object') {
        currentBest = parseInt(currentBest.score || currentBest.best || currentBest.mark || 0);
    } else {
        currentBest = parseInt(currentBest) || 0;
    }

    if (score > currentBest) {
        localPlayerData.games[catName] = score;
        console.log(`⭐ Markah tertinggi baru untuk ${catName}: ${score}`);
    }

    // Simpan Data ke LocalStorage
    localStorage.setItem('currentPlayer', JSON.stringify(localPlayerData));
    
    // Hantar Data ke Cloud & Kemaskini UI
    if (typeof saveCloudPlayerData === 'function') saveCloudPlayerData();
    if (typeof updateUI === 'function') updateUI();
    if (typeof updateJulyLteCardUI === 'function') updateJulyLteCardUI();

    // =======================================================
    // 📢 NOTIFIKASI UI (DITAMBAH DI SINI)
    // =======================================================
	let pointsEarned = 0;
	let coinsEarned = 0;
	let dipengaruhiLTE = false;
	let jenisBoost = "";
    let mesejNotifikasi = `Tahniah! Anda berjaya mengumpul ${pointsEarned} XP dan ${coinsEarned} Koin.`;
    
    // Tambah mesej bonus jika ada event LTE sedang berjalan
    if (dipengaruhiLTE && jenisBoost !== "") {
        mesejNotifikasi += `\n\n🎉 BONUS ACARA: ${jenisBoost}`;
    }

    // Paparkan notifikasi 
    if (typeof Swal !== 'undefined') {
        Swal.fire({
            title: 'Selesai!',
            text: mesejNotifikasi,
            icon: 'success',
            confirmButtonText: 'Teruskan',
            confirmButtonColor: '#3085d6'
        });
    } else {
        alert(mesejNotifikasi);
    }

    // =======================================================
    // 🎥 CCTV TRACKER (DIPINDAHKAN KE SINI AGAR TIDAK RALAT)
    // =======================================================
	let totalQuestions = senaraiSoalan ? senaraiSoalan.length : 0;

    if (window.Trackers) {
        let isPerfect = (score === totalQuestions && totalQuestions > 0); 
        let catNameForTracker = (typeof currentGameType !== 'undefined' && currentGameType !== "") ? currentGameType : "unknown_game";
        Trackers.rekodTamatGame(catNameForTracker, score, isPerfect);
        Trackers.rekodKoinDapat(coinsEarned); 
    }

    // 🎯 REKOD BUKU LOG KE FIREBASE
    try {
        let currentDifficulty = multiplier === 3 ? "Hard" : (multiplier === 2 ? "Medium" : "Easy");
        let gameCategoryName = (typeof currentGameType !== 'undefined') ? currentGameType : "Latihan";
        
        if (typeof saveGameRecord === 'function') {
            saveGameRecord(gameCategoryName, currentDifficulty, score, totalQuestions);
            if (typeof checkAndUnlockLevels === 'function') checkAndUnlockLevels();
        }
    } catch (error) {
        console.error("Ralat memanggil saveGameRecord:", error);
    }

    // 4. Paparkan pop-up keputusan berserta mesej Boost (jika aktif)
    let extraHTML = dipengaruhiLTE 
        ? `<div class="bg-yellow-100 p-2 rounded text-yellow-800 font-black text-sm my-2 animate-bounce border-2 border-yellow-400">${jenisBoost}</div>` 
        : "";

    Swal.fire({
        icon: percentage >= 50 ? 'success' : 'error',
        title: 'Permainan Tamat! 🏁',
        html: `Anda berjaya menjawab <b>${score}</b> daripada <b>${totalQuestions}</b> soalan dengan betul.<br><br>
               Markah Keseluruhan: <span class="text-2xl font-bold text-indigo-600">${percentage}%</span><br>
               ${extraHTML}
               <br><span class="text-sm text-green-600 font-bold">+ ${pointsEarned} XP Earned!</span>
               <br><span class="text-sm text-yellow-600 font-bold">+ ${coinsEarned} Coins Earned!</span>`,
        confirmButtonText: 'Kembali ke Menu',
        confirmButtonColor: '#4f46e5',
        allowOutsideClick: false
    }).then(() => {
        // 5. Kembali ke paparan asal
        const gameArena = document.getElementById('game-arena');
        const menuScreen = document.getElementById('menu-screen');
        const finalScoreScreen = document.getElementById('final-score');
        
        if (gameArena) gameArena.classList.add('hidden');
        if (finalScoreScreen) finalScoreScreen.classList.add('hidden');
        if (menuScreen) menuScreen.classList.remove('hidden');

        if (typeof playBgMusic === 'function') playBgMusic();
        if (typeof backToSubjects === 'function') backToSubjects();
    });

function updateUI() {
    // 1. Pastikan data pemain wujud
    if (typeof localPlayerData === 'undefined' || !localPlayerData) return;

    // 2. Ambil nilai totalScore
    const currentScore = localPlayerData.totalScore || 0;

    // 3. Kemaskini Paparan Syiling & Mata
    const scoreElements = ['total-points']; 
    scoreElements.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.innerText = currentScore;
    });

    const elCoins = document.getElementById('display-coins');
    const elUserCoins = document.getElementById('user-coins');
    
    if (elCoins) elCoins.innerText = localPlayerData.coins || 0;
    if (elUserCoins) elUserCoins.innerText = localPlayerData.coins || 0;

    // 4. Kemaskini Nama & Kelas
    const nameEl = document.getElementById('menu-player-name');
    const classEl = document.getElementById('menu-player-class');
    const playerName = localPlayerData.name || "Adventurer";
    
    if (nameEl) nameEl.innerText = playerName;
    if (classEl) classEl.innerText = localPlayerData.class || "6 CEMERLANG";

    // 5. LOGIK XP BAR (Penuh Progresif!)
    const xpText = document.getElementById('xp-text');
    const xpBarFill = document.getElementById('xp-bar-fill');
    const nextLevelText = document.getElementById('next-level-text');
    
    let tempScore = Number(currentScore) || 0;
    let calculatedLevel = 1;
    let requiredXpForNextLevel = 100; 

    while (tempScore >= requiredXpForNextLevel) {
        tempScore -= requiredXpForNextLevel;
        calculatedLevel++;
        requiredXpForNextLevel += 50;
    }

    const xpInCurrentLevel = tempScore;
    const progressPercent = (xpInCurrentLevel / requiredXpForNextLevel) * 100;

    localPlayerData.level = calculatedLevel;
    localStorage.setItem('currentPlayer', JSON.stringify(localPlayerData));

    if (xpText) xpText.innerText = `XP: ${xpInCurrentLevel} / ${requiredXpForNextLevel}`;
    if (xpBarFill) xpBarFill.style.width = `${progressPercent}%`;
    if (nextLevelText) nextLevelText.innerText = `LEVEL ${calculatedLevel + 1}`; 

    const levelDisplay = document.querySelector('#menu-player-class'); 
    if (levelDisplay && localPlayerData.class) {
        levelDisplay.innerText = `${localPlayerData.class} • LEVEL ${calculatedLevel}`;
    }

// ==========================================
// ⭐ 6. KEMASKINI AVATAR (VERSI UPGRADED - BESAR & BERPROFIL TINGGI)
// ==========================================
const avatarContainer = document.getElementById('dashboard-avatar-container');
const currentLiveName = (localPlayerData && localPlayerData.name) ? localPlayerData.name : "";

if (avatarContainer) {
    // 1. Kosongkan container dahulu
    avatarContainer.innerHTML = ""; 

    // 2. Setkan gaya container utama (DIBESARKAN)
    // Kita tukar w-16 h-16 kepada w-24 h-24 (Mobile) dan md:w-28 md:h-28 (Desktop/Laptop)
    avatarContainer.className = "w-24 h-24 md:w-28 md:h-28 flex items-center justify-center relative overflow-visible cursor-pointer hover:scale-110 transition-transform duration-300";
    
    // Reset sebarang style manual yang mungkin tertinggal
    avatarContainer.style.border = "none";
    avatarContainer.style.boxShadow = "none";
    avatarContainer.style.background = "transparent";

    // 3. AMBIL DATA AVATAR DARI MEMORI
    const savedAvatar = (localPlayerData && localPlayerData.activeAvatar) ? localPlayerData.activeAvatar : "fas fa-user";

    if (currentLiveName.trim().toUpperCase() === "GAME MASTER") {
        // --- LOGIK KHAS GAME MASTER ---
        let avatarUrl = savedAvatar.startsWith("img|") 
            ? savedAvatar.replace("img|", "") 
            : "https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png";

        const img = document.createElement('img');
        img.src = avatarUrl;
        
        // Dibesarkan ke w-full h-full supaya mengikut saiz bekas baharu
        img.className = "w-full h-full object-contain drop-shadow-[0_0_25px_rgba(255,215,0,0.9)]";
        img.style.display = "block";
        
        avatarContainer.appendChild(img);

        avatarContainer.style.border = "3px solid gold";
        avatarContainer.style.boxShadow = "0 0 25px gold";
        avatarContainer.style.borderRadius = "50%";

    } else {
        // --- LOGIK MURID BIASA ---
        if (savedAvatar.startsWith("img|")) {
            const img = document.createElement('img');
            img.src = savedAvatar.replace("img|", "");
            
            // KUNCI UTAMA: Kita masukkan 'drop-shadow' yang tebal dan dalam (deep shadow)
            // Ini akan membentuk bayang-bayang realistik mengikut potongan badan karakter (bukan petak)
            img.className = "w-full h-full object-contain drop-shadow-[0_12px_16px_rgba(0,0,0,0.55)]"; 
            avatarContainer.appendChild(img);
        } else {
            // Jika ia sekadar ikon FontAwesome, kita besarkan saiz teks teks ke 5xl/6xl supaya sepadan
            avatarContainer.innerHTML = `<i class="${savedAvatar} text-5xl md:text-6xl text-indigo-900 drop-shadow-lg"></i>`;
        }
    }
}

    // 🛍️ KEMASKINI KEDAI AVATAR
    if (typeof loadAvatarShop === 'function') {
        loadAvatarShop();
    } else if (typeof updateShopUI === 'function') {
        updateShopUI();
    }
}

// ==========================================
// 📊 FUNGSI REKOD PRESTASI PERMAINAN (LOG BUKU REKOD)
// ==========================================
async function saveGameRecord(category, difficulty, score, maxScore) {
    try {
        // 1. Pastikan data pemain wujud
        if (!localPlayerData || !localPlayerData.name) {
            console.error("Gagal simpan rekod: Tiada nama pemain dijumpai.");
            return;
        }

        // 2. Semak adakah markah ini Perfect Score (Markah Penuh)?
        const isPerfect = (score === maxScore);

        // 3. Susun data untuk dihantar ke Firebase
        const newRecord = {
            playerName: localPlayerData.name, // Nama murid
            category: category,               // Contoh: "Missing"
            difficulty: difficulty,           // Contoh: "Easy"
            score: parseInt(score),
            maxScore: parseInt(maxScore),
            isPerfectScore: isPerfect,
            timestamp: new Date().toISOString() // Tarikh & masa direkod
        };

        // 4. Hantar ke koleksi baharu: 'game_records'
        // Kita guna .add() supaya ia cipta dokumen baru setiap kali main, bukan tindih yang lama
        await db.collection("game_records").add(newRecord);
        
        console.log(`✅ Rekod permainan disimpan: ${category} (${difficulty}) - Skor: ${score}/${maxScore}`);
        
    } catch (error) {
        console.error("❌ Gagal simpan rekod permainan:", error);
    }
}

// ==========================================
// 🔓 FUNGSI SEMAK & BUKA TAHAP (MEDIUM/HARD)
// ==========================================
async function checkAndUnlockLevels() {
    try {
        if (!localPlayerData || !localPlayerData.name) return;

        console.log("🔍 Menyemak kelayakan pembukaan tahap...");

        // 1. Ambil semua rekod "Perfect Score" untuk tahap "Easy" bagi murid ini
        const snapshot = await db.collection("game_records")
            .where("playerName", "==", localPlayerData.name)
            .where("difficulty", "==", "Easy")
            .where("isPerfectScore", "==", true)
            .get();

        // 2. Kita guna 'Set' untuk simpan kategori UNIK (supaya murid tak boleh main 1 kategori sama 3 kali)
        const perfectCategories = new Set();
        snapshot.forEach(doc => {
            perfectCategories.add(doc.data().category);
        });

        const totalPerfectEasy = perfectCategories.size;
        console.log(`⭐ Murid ada Perfect Score dalam ${totalPerfectEasy} kategori Easy.`);

        // 3. LOGIK PEMBUKAAN BUTANG
        const mediumBtn = document.getElementById('difficulty-medium-btn'); // Pastikan ID butang betul
        const hardBtn = document.getElementById('difficulty-hard-btn');

        // Syarat Buka Medium: Perlu 3 kategori Easy yang Perfect
        if (totalPerfectEasy >= 3) {
            if (mediumBtn) {
                mediumBtn.disabled = false;
                mediumBtn.classList.remove('opacity-50', 'cursor-not-allowed');
                mediumBtn.innerHTML = 'MEDIUM <i class="fas fa-unlock ml-2 text-green-400"></i>';
            }
            console.log("🔓 TAHAP MEDIUM DIBUKA!");
        } else {
            // Jika belum cukup 3, kunci butang tersebut
            if (mediumBtn) {
                mediumBtn.disabled = true;
                mediumBtn.classList.add('opacity-50', 'cursor-not-allowed');
                mediumBtn.innerHTML = `MEDIUM <i class="fas fa-lock ml-2 text-red-400"></i> <br><span class="text-[10px] text-yellow-300">(${totalPerfectEasy}/3 Easy Perfect)</span>`;
            }
        }

        // Tips: Cikgu boleh tambah logik yang sama untuk tahap HARD di sini nanti.

    } catch (error) {
        console.error("❌ Ralat semasa menyemak tahap:", error);
    }
}

// ==========================================
// 📈 FUNGSI PAPARAN ANALISIS ADMIN
// ==========================================
// 1. Wajib ada pembolehubah global ini di bahagian atas
let allGameRecords = [];

// 2. GANTIKAN loadGameRecords LAMA DENGAN INI
async function loadGameRecords() {
    const tableBody = document.getElementById('analysis-table-body');
    try {
        if (!tableBody) return;
        tableBody.innerHTML = "<tr><td class='p-6 text-center font-bold text-indigo-500'>⏳ Sedang menjana rumusan murid...</td></tr>";

        // Ambil data dari Firebase
        let q = db.collection("game_records").orderBy("timestamp", "asc");
        
        // Penapis: Jika Admin Sekolah, ambil data sekolah dia sahaja
        if(localPlayerData.role === 'SCHOOL_ADMIN') {
            q = q.where("schoolName", "==", localPlayerData.schoolName);
        }

        const snapshot = await q.get();
        allGameRecords = []; // Reset data
        const studentsSet = new Set(); 

        snapshot.forEach(doc => {
            const data = doc.data();
            allGameRecords.push(data);
            studentsSet.add(data.playerName); // Simpan nama unik sahaja
        });

        // Paparkan Jadual Master (Nama Murid Sahaja)
        let html = "";
        const sortedStudents = Array.from(studentsSet).sort(); // Susun ikut abjad A-Z

        sortedStudents.forEach(name => {
            html += `
                <tr class="border-b border-gray-100 hover:bg-indigo-50 transition-colors">
                    <td class="p-4 flex items-center justify-between">
                        <div>
                            <span class="text-xs text-gray-400 block font-bold">NAMA MURID</span>
                            <span class="font-black text-indigo-900 text-lg">${name}</span>
                        </div>
                        <button onclick="showStudentDetail('${name}')" class="bg-indigo-600 text-white px-6 py-2 rounded-xl text-xs font-black hover:bg-indigo-700 shadow-md transition-all active:scale-95">
                            ANALISIS PRESTASI 🔍
                        </button>
                    </td>
                </tr>
            `;
        });

        tableBody.innerHTML = html || "<tr><td class='p-4 text-center'>Tiada rekod murid dijumpai.</td></tr>";

    } catch (error) {
        console.error("Ralat:", error);
        tableBody.innerHTML = "<tr><td class='p-4 text-red-500 text-center'>Gagal memuatkan data. Sila semak sambungan internet.</td></tr>";
    }
}

// 3. TAMBAH FUNGSI UNTUK PAPAR DETAIL (MODAL)
function showStudentDetail(studentName) {
    const modal = document.getElementById('student-detail-modal');
    const detailTable = document.getElementById('detail-table-body');
    
    if(!modal || !detailTable) return;
    
    document.getElementById('detail-student-name').innerText = studentName;

    // Tapis rekod murid ini sahaja
    const studentData = allGameRecords.filter(r => r.playerName === studentName);

    // Kumpulkan rekod ikut kategori
    const categories = {};
    studentData.forEach(r => {
        if (!categories[r.category]) categories[r.category] = [];
        categories[r.category].push(r.score);
    });

    let html = "";
    for (const cat in categories) {
        const scores = categories[cat];
        const sum = scores.reduce((a, b) => a + b, 0);
        // Kira purata (Andaian setiap game max score 50. Jika cikgu guna nilai lain, tukar angka 50 ini)
        const avg = ((sum / (scores.length * 50)) * 100).toFixed(1); 

        // Logik Ulasan Automatik
        let ulasan = "";
        if (avg >= 80) ulasan = "🌟 Sangat Cemerlang! Menguasai topik.";
        else if (avg >= 50) ulasan = "📈 Baik. Menunjukkan perkembangan positif.";
        else ulasan = "⚠️ Perlu bimbingan dan latihan tambahan.";

        html += `
            <tr class="border-b border-gray-50 hover:bg-gray-50">
                <td class="p-4 font-black text-indigo-700 uppercase text-sm">${cat}</td>
                <td class="p-4">
                    <div class="flex flex-wrap gap-1">
                        ${scores.map(s => `<span class="bg-gray-100 px-2 py-1 rounded font-bold text-xs">${s}</span>`).join("")}
                    </div>
                </td>
                <td class="p-4 text-center">
                    <span class="font-black ${avg >= 80 ? 'text-green-600' : 'text-orange-600'}">${avg}%</span>
                </td>
                <td class="p-4 text-xs italic text-gray-500 leading-tight">${ulasan}</td>
            </tr>
        `;
    }

    detailTable.innerHTML = html;
    modal.classList.remove('hidden'); // Paparkan modal
}

// 4. TAMBAH FUNGSI TUTUP MODAL
function closeStudentDetail() {
    const modal = document.getElementById('student-detail-modal');
    if(modal) modal.classList.add('hidden');
}

// Letakkan di dalam fail .js (bukan .html)
function applyAnalysisFilters() {
    const userRole = localPlayerData.role; 

    const cardSchools = document.getElementById('stat-card-schools');
    const sectionBreakdown = document.getElementById('stat-section-breakdown');
    const titleAnalysis = document.querySelector('#sa-analysis-screen h2');

    if (userRole === 'SCHOOL_ADMIN') {
        if (cardSchools) cardSchools.classList.add('hidden');
        if (sectionBreakdown) sectionBreakdown.classList.add('hidden');
        if (titleAnalysis) titleAnalysis.innerText = "📊 Analisis Prestasi Murid Sekolah";
        
        const statsGrid = document.querySelector('#sa-analysis-screen .grid');
        if (statsGrid) {
            statsGrid.classList.remove('grid-cols-2');
            statsGrid.classList.add('grid-cols-1');
        }
    } else {
        if (cardSchools) cardSchools.classList.remove('hidden');
        if (sectionBreakdown) sectionBreakdown.classList.remove('hidden');
        if (titleAnalysis) titleAnalysis.innerText = "📊 Analisis Sistem Keseluruhan";
    }
}

// ==========================================
// FUNGSI KELAYAKAN CABARAN (ARENA PVP)
// ==========================================

// 1. Fungsi Semak Kelayakan Level
function checkChallengeEligibility() {
    const requiredLevel = 15;
    
    // Pastikan data pemain telah dimuatkan
    if (typeof localPlayerData === 'undefined' || !localPlayerData) {
        alert("Sila tunggu sebentar, sedang memuat turun profil anda...");
        return;
    }
    
    // Semak tahap pemain
    if (localPlayerData.level < requiredLevel) {
        // Jika belum Level 15, tunjuk amaran
        alert(`🔒 ACCESS DENIED!\n\nYou just level ${localPlayerData.level}. Keep playing in Solo Mode until you reach Level ${requiredLevel} to open Challenge Arena PVP.`);
        return; 
    }
    
    // Jika layak, buka skrin Lobi Cabaran dan muatkan pemain
    if (typeof showScreen === 'function') {
        showScreen('challenge-lobby-screen');
    } else {
        console.warn("Fungsi showScreen tiada, menggunakan logik lalai...");
        document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
        const lobby = document.getElementById('challenge-lobby-screen');
        if (lobby) lobby.classList.remove('hidden');
    }

    // Panggil fungsi memuatkan pemain
    window.loadAvailableOpponents();
};

// 2. Fungsi Tarik Senarai Pemain Level 15+ dari Firebase
window.loadAvailableOpponents = async function() {
    const listContainer = document.getElementById('available-players-list');
    if (!listContainer) return;
    
    listContainer.innerHTML = "<li class='text-center italic text-indigo-400 py-4'>⏳ Sedang mengimbas arena...</li>";

    try {
        if (typeof db === 'undefined') {
            listContainer.innerHTML = "<li class='text-center text-red-500 py-4'>Pangkalan data terputus. Sila muat semula.</li>";
            return;
        }

        // Cari pemain yang Level 15 dan ke atas SAHAJA
        const snapshot = await db.collection("players")
                                 .where("level", ">=", 15)
                                 .get();

        let html = "";
        
        let myName = "";
        if (typeof studentInfo !== 'undefined' && studentInfo && studentInfo.name) {
            myName = studentInfo.name;
        } else if (typeof localPlayerData !== 'undefined' && localPlayerData && localPlayerData.name) {
            myName = localPlayerData.name;
        }
        
        snapshot.forEach(doc => {
            const opponent = doc.data();

            // Jangan tunjukkan diri sendiri dalam senarai cabaran
            if (opponent.name !== myName) {
                let isPlayerOnline = opponent.isOnline === true; 
                let specificStatus = opponent.currentStatus || 'idle'; 

                let dotColor = 'bg-gray-400'; // Offline (Kelabu)
                let statusLabel = 'Offline';
                let btnDisabled = 'disabled';
                let btnClass = 'bg-gray-300 text-gray-500 cursor-not-allowed';

                if (isPlayerOnline) {
                    if (specificStatus === 'idle') {
                        dotColor = 'bg-green-500';
                        statusLabel = 'Ready (Idle)';
                        btnDisabled = ''; 
                        btnClass = 'bg-red-500 hover:bg-red-600 text-white shadow-sm';
                    } else if (specificStatus === 'in-game') {
                        dotColor = 'bg-yellow-400';
                        statusLabel = 'Busy (In-Game)';
                    } else if (specificStatus === 'in-pvp') {
                        dotColor = 'bg-red-600';
                        statusLabel = 'In Battle (PvP)';
                    }
                }

                html += `
                    <li class="flex justify-between items-center bg-gray-50 p-4 rounded-xl border hover:border-red-300 hover:shadow-md transition-all">
                        <div class="flex items-center gap-4">
                            <div class="relative w-12 h-12 bg-red-100 rounded-full flex items-center justify-center font-black text-red-500 text-xl shadow-inner">
                                L${opponent.level || 15}
                                <span class="absolute bottom-0 right-0 w-3.5 h-3.5 ${dotColor} border-2 border-white rounded-full"></span>
                            </div>
                            <div>
                                <p class="font-black text-gray-800 text-lg">${opponent.name}</p> 
                                <p class="text-xs text-gray-500 font-bold">${opponent.school || 'Pemain Bebas'} • <span class="${dotColor.replace('bg-', 'text-')}">${statusLabel}</span></p> 
                            </div>
                        </div>
                        <button onclick="sendChallengeInvite('${opponent.name}')" ${btnDisabled} class="${btnClass} px-6 py-2 rounded-lg font-bold transition-colors">
                            ⚔️ CHALLENGE
                        </button>
                    </li>
                `;
            }
        });

        if (html === "") {
            listContainer.innerHTML = "<li class='text-center font-bold text-gray-500 py-8'>Belum ada pemain lain yang mencapai Level 15. Jadilah yang pertama!</li>";
        } else {
            listContainer.innerHTML = html;
        }

    } catch (error) {
        console.error("Ralat memuatkan lawan:", error);
        listContainer.innerHTML = "<li class='text-center text-red-500 py-4'>Ralat menyambung ke pelayan arena.</li>";
    }
};


// ==========================================
// A. PENGHANTAR: Fungsi Hantar Jemputan & Semak Syarat Kelayakan
// ==========================================
window.sendChallengeInvite = async function(opponentName) {
    // ---------------------------------------------------------
    // 🛑 1. SARINGAN KELAYAKAN LEVEL 15
    // ---------------------------------------------------------
    const currentLevel = Number(localPlayerData.level) || 1;
    if (currentLevel < 15) {
        Swal.fire({
            icon: 'error',
            title: 'Akses Ditolak!',
            text: 'Anda perlu mencapai sekurang-kurangnya Level 15 untuk mencabar pemain lain di Arena PvP.'
        });
        return;
    }

// ---------------------------------------------------------
    // 🛑 2. SARINGAN PENGUASAAN KATEGORI (VERSI MAHA LENGKAP - SEMUA SUBJEK)
    // ---------------------------------------------------------
    let playedGames = [];
    if (localPlayerData.games) {
        playedGames = Object.keys(localPlayerData.games);
    } else if (localPlayerData.playedGamesList) {
        playedGames = localPlayerData.playedGamesList;
    }
    let hasEasy = false, hasMed = false, hasHard = false;

    let allEasyCats = [];
    let allMedCats = [];
    let allHardCats = [];

    function extractDifficulty(diffObject) {
        if (typeof diffObject !== 'undefined' && diffObject) {
            if (diffObject.easy) allEasyCats.push(...diffObject.easy.map(c => c.toLowerCase()));
            if (diffObject.medium) allMedCats.push(...diffObject.medium.map(c => c.toLowerCase()));
            if (diffObject.hard) allHardCats.push(...diffObject.hard.map(c => c.toLowerCase()));
        }
    }

    // 📚 1. SEDUT DATA DARI OBJEK KESUKARAN GLOBAL (JIKA WUJUD)
    extractDifficulty(typeof englishCategoryDifficulty !== 'undefined' ? englishCategoryDifficulty : undefined);
    extractDifficulty(typeof mathCategoryDifficulty !== 'undefined' ? mathCategoryDifficulty : undefined);
    extractDifficulty(typeof scienceCategoryDifficulty !== 'undefined' ? scienceCategoryDifficulty : undefined);
    extractDifficulty(typeof bmCategoryDifficulty !== 'undefined' ? bmCategoryDifficulty : undefined);
    extractDifficulty(typeof paiCategoryDifficulty !== 'undefined' ? paiCategoryDifficulty : undefined);
    extractDifficulty(typeof baCategoryDifficulty !== 'undefined' ? baCategoryDifficulty : undefined);
    extractDifficulty(typeof arabicCategoryDifficulty !== 'undefined' ? arabicCategoryDifficulty : undefined);
    
    // 🆕 Tambahan subjek baharu yang Cikgu perasan:
    extractDifficulty(typeof sejarahCategoryDifficulty !== 'undefined' ? sejarahCategoryDifficulty : undefined);
    extractDifficulty(typeof rbtCategoryDifficulty !== 'undefined' ? rbtCategoryDifficulty : undefined);
    extractDifficulty(typeof psvCategoryDifficulty !== 'undefined' ? psvCategoryDifficulty : undefined);
    extractDifficulty(typeof muzikCategoryDifficulty !== 'undefined' ? muzikCategoryDifficulty : undefined);
    extractDifficulty(typeof moralCategoryDifficulty !== 'undefined' ? moralCategoryDifficulty : undefined);
    extractDifficulty(typeof pkCategoryDifficulty !== 'undefined' ? pkCategoryDifficulty : undefined);

// 🛡️ 2. PELAN SANDARAN KESELAMATAN (HARDCODE FALLBACK) YANG TELAH DIKEMAS KINI
    const fallbackEasy = [
        // English & Matematik & BM
        'missing', 'spelling', 'plural', 'gendernouns', 'occupation', 'number_recognition', 'addition', 'subtraction', 'kata_nama',
        // Agama Islam & Bahasa Arab
        'mufrodat', 'arqam', 'alquran', 'jawi', 'aqidah', 
        // Subjek Elektif & Teras Lain (PSV, RBT, Muzik, Sejarah, Moral, PJK)
        'pengenalan_ilmu_sejarah', 'keselamatan_bengkel', 'unsur_seni', 'notasi_dan_balar', 'kepercayaan_kepada_tuhan', 'gimnastik_asas',
        // Kata Kunci Am (Luar Jangkaan)
        'tokoh', 'tarikh', 'alatan', 'bahan', 'warna', 'lukisan', 'not', 'irama', 'nilai', 'kebersihan', 'kesihatan'
    ];
    
    const fallbackMed = [
        // English & Matematik & BM
        'puzzle', 'guessing', 'pasttense', 'superlatives', 'synonym', 'antonym', 'multiplication', 'division', 'time_and_money', 'simpulan_bahasa',
        // Agama Islam & Bahasa Arab
        'hiwar', 'ibadah', 'sirah', 
        // Subjek Elektif & Teras Lain
        'zaman_air_batu', 'kerajaan_melayu_awal', 'asas_reka_bentuk', 'prinsip_rekaan', 'apresiasi_muzik', 'baik_hati', 'bertanggungjawab', 'olahraga_asas',
        // Kata Kunci Am (Luar Jangkaan)
        'peristiwa', 'kerajaan', 'reka-bentuk', 'kraf', 'anyaman', 'alat-muzik', 'tempo', 'diri', 'keluarga', 'pemakanan'
    ];
    
    const fallbackHard = [
        // English & Matematik & BM
        'grammar', 'architect', 'idioms', 'listening', 'speaking', 'fraction_and_decimal', 'area_and_perimeter', 'susunan_songsang', 'pemahaman',
        // Agama Islam & Bahasa Arab
        'qawaid', 'akhlak', 
        // Subjek Elektif & Teras Lain
        'tokoh_terbilang', 'reka_bentuk_pembungkusan', 'asas_pertanian', 'menggambar', 'kraf_tradisional', 'nyanyian', 'keadilan', 'toleransi', 'pertolongan_cemas', 'kesihatan_diri',
        // Kata Kunci Am (Luar Jangkaan)
        'kemerdekaan', 'nasionalisme', 'pengaturcaraan', 'elektronik', 'senibina', 'apresiasi', 'simfoni', 'masyarakat', 'penyakit', 'gejala'
    ];
    
    allEasyCats.push(...fallbackEasy);
    allMedCats.push(...fallbackMed);
    allHardCats.push(...fallbackHard);

    // 🔍 3. SEMAK LOG DATA PERMAINAN MURID
    playedGames.forEach(gameKey => {
        const cat = String(gameKey).toLowerCase().trim(); 
        
        if (allEasyCats.includes(cat)) hasEasy = true;
        if (allMedCats.includes(cat)) hasMed = true;
        if (allHardCats.includes(cat)) hasHard = true;
    });

    if (!hasEasy || !hasMed || !hasHard) {
        Swal.fire({
            icon: 'warning',
            title: 'Syarat Belum Dipenuhi!',
            html: `Untuk memasuki Arena PvP, anda mesti bermain sekurang-kurangnya 1 permainan dari setiap tahap kesukaran (Mudah, Sederhana & Sukar) merentasi mana-mana subjek.<br><br>
                   Kemajuan Anda Sekarang:<br>
                   ✅ Mudah: ${hasEasy ? '<span style="color:green; font-weight:bold;">Selesai</span>' : '<b style="color:red;">Belum Selesai</b>'}<br>
                   ✅ Sederhana: ${hasMed ? '<span style="color:green; font-weight:bold;">Selesai</span>' : '<b style="color:red;">Belum Selesai</b>'}<br>
                   ✅ Sukar: ${hasHard ? '<span style="color:green; font-weight:bold;">Selesai</span>' : '<b style="color:red;">Belum Selesai</b>'}`
        });
        return;
    }

    // --- LOGIK PENGHANTARAN JEMPUTAN REALTIME FIREBASE AKAN BERSAMBUNG DI BAWAH SINI ---
    console.log(`🚀 Kelayakan lulus! Menghantar jemputan PvP kepada ${opponentName}...`);
    if (typeof sendChallengeInvite_Realtime === 'function') {
        sendChallengeInvite_Realtime(opponentName);
}

    // ---------------------------------------------------------
    // 🛑 3. SEMAK HAD HARIAN (Maksimum 5 kali sehari)
    // ---------------------------------------------------------
    const today = new Date().toISOString().split('T')[0];
    const docId = `${studentInfo.school}_${studentInfo.class}_${studentInfo.name}`.replace(/\s+/g, '_');

    try {
        const playerDoc = await db.collection("players").doc(docId).get();
        if (playerDoc.exists) {
            const data = playerDoc.data();
            if (data.lastPvPDate === today && data.pvpCountToday >= 5) {
                Swal.fire('Had Harian Dicapai 🛑', 'Anda telah mencapai had maksimum 5 perlawanan PvP hari ini. Sila kembali esok!', 'warning');
                return;
            }
        };

// ========================================================
        // 🆕 4. UI BARU: PILIH SUBJEK DAHULU KEMUDIAN KATEGORI
        // ========================================================
        const allSubjectsData = {
            "Bahasa Inggeris": typeof gameData !== 'undefined' ? gameData : {},
            "Bahasa Melayu": typeof malayLanguageData !== 'undefined' ? malayLanguageData : {},
            "Matematik": typeof mathData !== 'undefined' ? mathData : (typeof mathematicsData !== 'undefined' ? mathematicsData : {}),
            "Sains": typeof scienceData !== 'undefined' ? scienceData : {},
            
            // 🕌 🇸🇦 TAMBAHAN PAI & BAHASA ARAB DI SINI
            "Pendidikan Agama Islam": typeof paiQuestions !== 'undefined' ? paiQuestions : (typeof paiData !== 'undefined' ? paiData : {}),
            "Bahasa Arab": typeof baQuestions !== 'undefined' ? baQuestions : (typeof baData !== 'undefined' ? baData : {}),
            
            "Pendidikan Jasmani & Kesihatan": typeof pjkData !== 'undefined' ? pjkData : {},
            "Pendidikan Muzik": typeof pendidikanMuzikData !== 'undefined' ? pendidikanMuzikData : {},
            "Sejarah": typeof sejarahData !== 'undefined' ? sejarahData : {},
            "Reka Bentuk dan Teknologi (RBT)": typeof rbtData !== 'undefined' ? rbtData : {},
            "Pendidikan Seni Visual": typeof psvData !== 'undefined' ? psvData : {},
            "Pendidikan Moral": typeof moralData !== 'undefined' ? moralData : {}
        };

        const { isConfirmed, value: selectedValues } = await Swal.fire({
            title: `Cabar ${opponentName} ⚔️`,
            html: `
                <div class="mb-4 text-left">
                    <label class="block text-sm font-bold text-gray-700 mb-2">1. Pilih Subjek:</label>
                    <select id="pvp-subject-select" class="swal2-input w-full mt-0 text-sm">
                        <option value="" disabled selected>-- Sila Pilih Subjek --</option>
                        ${Object.keys(allSubjectsData).map(subj => `<option value="${subj}">${subj}</option>`).join('')}
                    </select>
                </div>
                <div class="text-left">
                    <label class="block text-sm font-bold text-gray-700 mb-2">2. Pilih Kategori:</label>
                    <select id="pvp-category-select" class="swal2-input w-full mt-0 text-sm bg-gray-100" disabled>
                        <option value="" disabled selected>-- Pilih Subjek Dahulu --</option>
                    </select>
                </div>
            `,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonText: 'Batal',
            confirmButtonText: 'HANTAR CABARAN ⚔️',
            didOpen: () => {
                const subjectSelect = document.getElementById('pvp-subject-select');
                const categorySelect = document.getElementById('pvp-category-select');

                subjectSelect.addEventListener('change', () => {
                    const chosenSubject = subjectSelect.value;
                    const subjectDataObj = allSubjectsData[chosenSubject];
                    
                    categorySelect.innerHTML = '<option value="" disabled selected>-- Sila Pilih Kategori --</option>';
                    categorySelect.disabled = false;
                    categorySelect.classList.remove('bg-gray-100');

                    for (let key in subjectDataObj) {
                        let displayName = key.replace(/_/g, ' ').toUpperCase();
                        categorySelect.innerHTML += `<option value="${key}">${displayName}</option>`;
                    }
                });
            },
            preConfirm: () => {
                const subj = document.getElementById('pvp-subject-select').value;
                const cat = document.getElementById('pvp-category-select').value;
                if (!subj || !cat) {
                    Swal.showValidationMessage('Sila pilih Subjek DAN Kategori terlebih dahulu!');
                    return false;
                }
                return { subject: subj, category: cat };
            }
        });

        if (!isConfirmed || !selectedValues) return;

        const finalSubject = selectedValues.subject;
        const finalCategory = selectedValues.category;

        // ---------------------------------------------------------
        // 5. HANTAR CABARAN KE REALTIME DATABASE (RTDB)
        // ---------------------------------------------------------
        const challengeRef = rtdb.ref("challenges").push();
        await challengeRef.set({
            challengerName: studentInfo.name,
            opponentName: opponentName,
            subject: finalSubject,       // 🆕 Simpan Nama Subjek
            category: finalCategory,     // Simpan Key Kategori (cth: kata_nama)
            status: "pending",
            timestamp: firebase.database.ServerValue.TIMESTAMP
        });

        Swal.fire({ title: 'Berjaya!', text: `Menunggu respon daripada ${opponentName}...`, icon: 'success', showConfirmButton: false });

        // 🟢 DENGAR STATUS CABARAN (DITERIMA/DITOLAK)
        const listener = challengeRef.on('value', snapshot => {
            if (!snapshot.exists()) return;
            const data = snapshot.val();
            
            if (data.status === "accepted") {
                challengeRef.off('value', listener);
                Swal.fire({ title: 'Cabaran Diterima!', text: `Bersedia untuk bertarung!`, icon: 'success', timer: 2000, showConfirmButton: false });
                setTimeout(() => startPvPMatch(snapshot.key, data), 2000);
            } else if (data.status === "declined") {
                challengeRef.off('value', listener);
                Swal.fire('Ditolak', `${opponentName} sedang sibuk atau telah menolak cabaran anda.`, 'error');
            }
        });

    } catch (error) {
        console.error("Ralat menghantar jemputan:", error);
    }
};

// ==========================================
// B. PENERIMA: Pendengar Jemputan Masuk (Versi RTDB Mantap)
// ==========================================
function startChallengeListener(myName) {
    if (!myName) {
        console.error("Ralat: Nama pemain kosong, tidak boleh mulakan pendengar!");
        return;
    }

    console.log("📡 Sistem Pendengar Cabaran RTDB Aktif untuk: " + myName);
    
    // 🟢 GUNA RTDB ('child_added') UNTUK TANGKAP CABARAN BARU
    rtdb.ref("challenges").orderByChild("opponentName").equalTo(myName).on('child_added', snapshot => {
        const data = snapshot.val();
        const challengeId = snapshot.key;

        // Hanya layan cabaran yang berstatus 'pending'
        if (data.status === "pending") {
            
            // 1. SEMAKAN ANTI-ZOMBIE (Masa Luput 2 Minit)
            if (data.timestamp) {
                const currentTime = new Date().getTime();
                const diffInMinutes = (currentTime - data.timestamp) / (1000 * 60);

                if (diffInMinutes > 2) {
                    console.log("Cabaran lama dikesan & diabaikan:", challengeId);
                    rtdb.ref("challenges/" + challengeId).update({ status: "expired" });
                    return; // Keluar, jangan tunjuk popup
                }
            }

            // 2. LOGIK JANGAN GANGGU (DND)
            const menuScreen = document.getElementById('menu-screen');
            const isBusy = menuScreen ? menuScreen.classList.contains('hidden') : false;

            if (isBusy) {
                console.log("Pemain sedang bertarung. Cabaran ditolak automatik.");
                rtdb.ref("challenges/" + challengeId).update({ status: "busy" });
                return; // Keluar, jangan kacau konsentrasi pemain
            }

            // 3. PAPARKAN NOTIFIKASI JIKA PEMAIN SEDIA (IDLE)
            Swal.fire({
                title: '⚔️ CABARAN BARU!',
                html: `<b class="text-red-600">${data.challengerName}</b> mahu bertarung dengan anda dalam kategori <b>${data.category}</b>!`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#22c55e',
                cancelButtonColor: '#d33',
                confirmButtonText: 'SAHUT! ✅',
                cancelButtonText: 'TOLAK ❌',
                allowOutsideClick: false
            }).then((result) => {
                if (result.isConfirmed) {
                    // Jika setuju: Kemas kini status ke 'accepted' (GUNA RTDB)
                    rtdb.ref("challenges/" + challengeId).update({ 
                        status: "accepted",
                        acceptedAt: firebase.database.ServerValue.TIMESTAMP 
                    });
                    
                    // Panggil fungsi Arena
                    if (typeof startPvPMatch === 'function') {
                        startPvPMatch(challengeId, data);
                    } else {
                        console.log("Fungsi startPvPMatch tiada!");
                    }
                } else {
                    // Jika tolak: Kemas kini status ke 'declined' (GUNA RTDB)
                    rtdb.ref("challenges/" + challengeId).update({ status: "declined" });
                }
            });
            
        } // <--- PENUTUP 1: Penutup untuk if (data.status === "pending")
        
    }, error => {
        console.error("Ralat Pendengar Cabaran: ", error);
    }); // <--- PENUTUP 2: Penutup untuk rtdb.ref(...).on(...)
    
} // <--- PENUTUP 3: Penutup untuk function startChallengeListener(...)

// ==========================================
// C. MULA PERLAWANAN PVP (COUNTDOWN & ARENA)
// ==========================================
function startPvPMatch(challengeId, challengeData) {
isGanjaranDisimpan = false;
    if (typeof playBgMusic === 'function') playBgMusic('pvp');
    console.log("⚔️ Mempersiapkan Arena PvP untuk cabaran:", challengeId);
    
    // 1. Kenal pasti pemain dan kemas kini UI Papan Markah
    document.getElementById('pvp-p1-name').innerText = challengeData.challengerName;
    document.getElementById('pvp-p2-name').innerText = challengeData.opponentName;
    document.getElementById('pvp-category-title').innerText = challengeData.category;

    // Reset markah dan soalan
    document.getElementById('pvp-p1-score').innerText = "0";
    document.getElementById('pvp-p2-score').innerText = "0";
    document.getElementById('pvp-question-display').innerText = "READY...";
    
    // 2. Paparkan Kiraan Detik 5 Saat menggunakan SweetAlert
    let timerInterval;
    Swal.fire({
        title: '🔥 PERTEMPURAN BERMULA! 🔥',
        html: `Menuju ke arena dalam <b>5</b> saat...<br><br><small class="text-gray-500">Get ready on you keyboard!</small>`,
        icon: 'info',
        timer: 5000,
        timerProgressBar: true,
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => {
            const b = Swal.getHtmlContainer().querySelector('b');
            timerInterval = setInterval(() => {
                b.textContent = Math.ceil(Swal.getTimerLeft() / 1000);
            }, 100);
        },
        willClose: () => {
            clearInterval(timerInterval);
        }
    }).then(() => {
        // 3. Masuk ke Skrin Arena selepas masa tamat
        if (typeof showScreen === "function") {
            showScreen('pvp-arena');
        } else {
            const pvpArenaScreen = document.getElementById('pvp-arena-screen');
            if (pvpArenaScreen) pvpArenaScreen.classList.remove('hidden');
            document.getElementById('challenge-lobby-screen').classList.add('hidden');
        }
        
        // 4. Aktifkan kotak teks untuk menaip
        const answerInput = document.getElementById('pvp-answer-input');
        if (answerInput) {
            answerInput.disabled = false;
            answerInput.value = "";
            answerInput.focus();
        }
        setupPvPLogic(challengeId, challengeData);

        console.log("🚀 Skrin Arena dipaparkan. Menunggu soalan dari Game Master...");

        // 🔴 TAMBAH INI: Kemaskini status ke in-pvp DENGAN ID YANG BETUL
        const docId = `${studentInfo.school}_${studentInfo.class}_${studentInfo.name}`.replace(/\s+/g, '_');
        db.collection("players").doc(docId).update({
            currentStatus: "in-pvp"
        }).catch(e => console.log("Ralat update status:", e));
    });
}

// ==========================================
// D. LOGIK PERLAWANAN & MARKAH (VERSI BEBAS FORMAT)
// ==========================================
function setupPvPLogic(challengeId, data) {
    currentPvPChallengeId = challengeId;
    isPlayer1 = (data.challengerName === studentInfo.name); 
    
    let pvpEndTime = null; 
    const timerDisplay = document.getElementById('pvp-timer');

    // 🆕 SISTEM PENGHALA BANK DATA
    window.getPvPBankData = function(subjectName) {
        switch(subjectName) {
            case "Bahasa Melayu": return typeof malayLanguageData !== 'undefined' ? malayLanguageData : {};
            case "Matematik": return typeof mathData !== 'undefined' ? mathData : (typeof mathematicsData !== 'undefined' ? mathematicsData : {});
            case "Sains": return typeof scienceData !== 'undefined' ? scienceData : {};
            case "Pendidikan Agama Islam": return typeof paiQuestions !== 'undefined' ? paiQuestions : {};
            case "Bahasa Arab": return typeof baQuestions !== 'undefined' ? baQuestions : {};
            case "Pendidikan Jasmani & Kesihatan": return typeof pjkData !== 'undefined' ? pjkData : {};
            case "Pendidikan Muzik": return typeof pendidikanMuzikData !== 'undefined' ? pendidikanMuzikData : {};
            case "Sejarah": return typeof sejarahData !== 'undefined' ? sejarahData : {};
            case "Reka Bentuk dan Teknologi (RBT)": return typeof rbtData !== 'undefined' ? rbtData : {};
            case "Pendidikan Seni Visual": return typeof psvData !== 'undefined' ? psvData : {};
            case "Pendidikan Moral": return typeof moralData !== 'undefined' ? moralData : {};
            default: return typeof gameData !== 'undefined' ? gameData : {};
        }
    };

    // 1. Pemain 1 tarik soalan pertama
    if (isPlayer1 && !data.currentQ) {
        const targetBankData = window.getPvPBankData(data.subject);
        let catKey = "missing"; 
        let chosenCategory = data.category ? data.category.toLowerCase() : "";
        
        if (targetBankData[data.category]) {
            catKey = data.category;
        } else {
            for (let key in targetBankData) {
                if (chosenCategory.includes(key.toLowerCase()) || key.toLowerCase().includes(chosenCategory)) { 
                    catKey = key; break; 
                }
            }
        }
        currentPvPCategoryKey = catKey;
        const questions = targetBankData[currentPvPCategoryKey] || gameData.missing; 
        const firstQ = questions[Math.floor(Math.random() * questions.length)];
        
        // 🟢 NORMALIZER: Cantumkan format yang berbeza!
        const qText = firstQ.question || firstQ.q;
        const qAns = firstQ.answer !== undefined ? firstQ.answer : firstQ.a;
        const qOpts = firstQ.options || null;

        rtdb.ref("challenges/" + challengeId).update({
            p1Score: 0, p2Score: 0,
            currentQ: qText, 
            currentA: qAns,
            currentOptions: qOpts, // 🟢 Simpan Butang Pilihan ke Firebase!
            categoryKey: currentPvPCategoryKey,
            subjectKey: data.subject,
            isTransitioning: false, 
            endTime: (() => {
                let namaKategoriInput = data.category ? data.category.toLowerCase().trim() : "";
                let masaDariConfig = 90; 
                if (typeof HAD_MASA_GAME !== 'undefined' && HAD_MASA_GAME[namaKategoriInput]) {
                    masaDariConfig = HAD_MASA_GAME[namaKategoriInput];
                }
                return Date.now() + (masaDariConfig * 1000);
            })()
        });
    }

    // 2. Dengar perubahan dari Firebase (UI Controller)
    rtdb.ref("challenges/" + challengeId).on('value', snapshot => {
        if (!snapshot.exists()) return;
        const matchData = snapshot.val(); 

        document.getElementById('pvp-p1-score').innerText = matchData.p1Score || 0;
        document.getElementById('pvp-p2-score').innerText = matchData.p2Score || 0;

        if (matchData.endTime) pvpEndTime = matchData.endTime;
        if (matchData.categoryKey) currentPvPCategoryKey = matchData.categoryKey;
        if (matchData.subjectKey) window.currentPvPSubjectKey = matchData.subjectKey; 

        // Rujukan Elemen UI
        const inputBox = document.getElementById('pvp-answer-input');
        const inputContainer = document.getElementById('pvp-input-container');
        const optionsContainer = document.getElementById('pvp-options-container');

        if (matchData.isTransitioning) {
            // Kunci semua UI sementara Jeda "Siapa Cepat"
            if (inputBox) { inputBox.disabled = true; inputBox.value = ""; }
            for(let i=0; i<4; i++) {
                let btn = document.getElementById('pvp-btn-'+i);
                if(btn) { btn.disabled = true; btn.classList.remove('bg-red-500', 'animate-shake'); }
            }
            
            Swal.fire({
                toast: true, position: 'top', icon: 'success',
                title: `⚡ ${matchData.lastScorer} mendapat markah!`,
                showConfirmButton: false, timer: 1500
            });

            if (isPlayer1) {
                setTimeout(() => {
                    rtdb.ref("challenges/" + challengeId).update({
                        currentQ: matchData.nextQ,
                        currentA: matchData.nextA,
                        currentOptions: matchData.nextOptions || null, // 🟢 Tembak options baharu
                        isTransitioning: false 
                    });
                }, 1500);
            }
        } else {
            // PAPARKAN SOALAN & BUKA KUNCI UI
            if (matchData.currentQ) {
                document.getElementById('pvp-question-display').innerText = matchData.currentQ;
                currentPvPAnswer = matchData.currentA; 
                window.currentPvPQuestionText = matchData.currentQ; 
                
                // 🟢 PENGESAN FORMAT (Objektif vs Menaip)
                if (matchData.currentOptions) {
                    // MODE OBJEKTIF (PAI/BA)
                    if(inputContainer) inputContainer.classList.add('hidden');
                    if(optionsContainer) {
                        optionsContainer.classList.remove('hidden');
                        optionsContainer.classList.add('grid', 'grid-cols-1', 'md:grid-cols-2');
                    }
                    matchData.currentOptions.forEach((opt, idx) => {
                        let btn = document.getElementById('pvp-btn-'+idx);
                        if(btn) {
                            btn.innerText = opt;
                            btn.disabled = false;
                            btn.classList.remove('bg-red-500', 'animate-shake'); // Buang kesan salah sebelumnya
                        }
                    });
                } else {
                    // MODE MENAIP (BM/Math)
                    if(optionsContainer) {
                        optionsContainer.classList.add('hidden');
                        optionsContainer.classList.remove('grid', 'grid-cols-1', 'md:grid-cols-2');
                    }
                    if(inputContainer) inputContainer.classList.remove('hidden');
                    if (inputBox) {
                        inputBox.disabled = false;
                        inputBox.focus();
                    }
                }
            }
        }
    });

    if (window.pvpTimerInterval) clearInterval(window.pvpTimerInterval);
    window.pvpTimerInterval = setInterval(() => {
        if (!pvpEndTime) return;
        let timeLeft = Math.floor((pvpEndTime - Date.now()) / 1000);
        if (timeLeft < 0) timeLeft = 0;
        timerDisplay.innerText = timeLeft;
        if (timeLeft <= 0) {
            clearInterval(window.pvpTimerInterval);
            endPvPMatch(); 
        }
    }, 1000);
}

// ==========================================
// E. PENGESAN JAWAPAN (MENAIP & OBJEKTIF)
// ==========================================

// 1. PENGESAN KOTAK MENAIP 
document.addEventListener('input', function(e) {
    if (e.target && e.target.id === 'pvp-answer-input') {
        if (!currentPvPChallengeId || currentPvPAnswer === undefined || currentPvPAnswer === null) return;
        
        const inputBox = e.target;
        const userInput = String(inputBox.value).toUpperCase().trim();
        const correctA_raw = String(currentPvPAnswer).toUpperCase().trim();
        const possibleAnswers = correctA_raw.split('|');
        
        if (possibleAnswers.includes(userInput)) {
            inputBox.value = ""; 
            inputBox.disabled = true; 
            hantarTransaksiMarkah();
        }
    }
});

// 2. PENGESAN BUTANG OBJEKTIF (Baru!)
window.submitPvPObjektif = function(selectedIndex) {
    if (!currentPvPChallengeId || currentPvPAnswer === undefined || currentPvPAnswer === null) return;

    if (parseInt(selectedIndex) === parseInt(currentPvPAnswer)) {
        // Kunci butang sementara memproses
        for(let i=0; i<4; i++) {
            let btn = document.getElementById('pvp-btn-'+i);
            if(btn) btn.disabled = true;
        }
        hantarTransaksiMarkah();
    } else {
        // Jika Salah - Goncang & Merahkan butang! (Feedback Visual)
        const btn = document.getElementById('pvp-btn-'+selectedIndex);
        if(btn) {
            btn.classList.add('animate-shake', 'bg-red-500');
            setTimeout(() => {
                btn.classList.remove('animate-shake', 'bg-red-500');
            }, 500);
        }
    }
};

// 3. FUNGSI PUSAT PENGHANTARAN MARKAH (Jimat Kod Berkali-kali)
function hantarTransaksiMarkah() {
    const rtdbChallengeRef = rtdb.ref("challenges/" + currentPvPChallengeId);
            
    rtdbChallengeRef.transaction((data) => {
        if (data) {
            // Batal jika soalan dah bertukar (lawan dah jawab dulu)
            if (data.currentQ !== window.currentPvPQuestionText || data.isTransitioning) {
                return; 
            }

            const targetBankData = window.getPvPBankData(window.currentPvPSubjectKey);
            const questions = targetBankData[currentPvPCategoryKey] || gameData.missing; 
            const newQ = questions[Math.floor(Math.random() * questions.length)];
            
            const scoreField = isPlayer1 ? "p1Score" : "p2Score";

            // Normalizer untuk soalan seterusnya
            data[scoreField] = (data[scoreField] || 0) + 1; 
            data.lastScorer = studentInfo.name; 
            data.nextQ = newQ.question || newQ.q;
            data.nextA = newQ.answer !== undefined ? newQ.answer : newQ.a;
            data.nextOptions = newQ.options || null; // Simpan option baru jika ada
            data.isTransitioning = true; 
            
            return data; 
        }
        return data; 
        
    }, (error, committed, snapshot) => {
        if (error || !committed) {
            // Jika transaksi gagal (contohnya internet lambat), buka semula UI
            const inputBox = document.getElementById('pvp-answer-input');
            if(inputBox && !inputBox.parentElement.classList.contains('hidden')) {
                inputBox.disabled = false; inputBox.focus();
            } else {
                for(let i=0; i<4; i++) {
                    let btn = document.getElementById('pvp-btn-'+i);
                    if(btn) btn.disabled = false;
                }
            }
        }
    });
}

// ==========================================
// F. TAMAT PERLAWANAN & GANJARAN (TIERS) - VERSI SELAMAT
// ==========================================
function endPvPMatch() {
    // 🛡️ GATEKEEPER PVP: Sekat jika ganjaran perlawanan ini sudah/sedang diproses!
    if (isGanjaranPvPDisimpan) return;
    isGanjaranPvPDisimpan = true; // 🔒 KUNCI PINTU SERTA-MERTA

    // Hentikan pemasa jika masih berjalan
    if (window.pvpTimerInterval) clearInterval(window.pvpTimerInterval);

    // Ambil markah dari skrin
    const p1Score = parseInt(document.getElementById('pvp-p1-score').innerText) || 0;
    const p2Score = parseInt(document.getElementById('pvp-p2-score').innerText) || 0;

    let myScore = isPlayer1 ? p1Score : p2Score;
    let oppScore = isPlayer1 ? p2Score : p1Score;
    let result = (myScore > oppScore) ? "menang" : (myScore < oppScore ? "kalah" : "seri");

    // 1. TENTUKAN TIER (KUMPULAN KESUKARAN)
    const easyCats = ['missing', 'spelling', 'plural', 'gendernouns', 'occupation'];
    const medCats = ['puzzle', 'guessing', 'pasttense', 'superlatives', 'synonym', 'antonym'];
    const hardCats = ['grammar', 'architect', 'idioms', 'listening', 'speaking'];

    let tier = "easy"; // Lalai
    let currentCat = (currentPvPCategoryKey || "").toLowerCase();
    
    if (medCats.includes(currentCat)) tier = "medium";
    if (hardCats.includes(currentCat)) tier = "hard";

    // 2. KIRA XP & COINS BERDASARKAN TIER
    let xpReward = 0; let coinReward = 0;
    
    if (tier === "easy") {
        if (result === "menang") { xpReward = 100; coinReward = 200; }
        else if (result === "kalah") { xpReward = 25; coinReward = 50; }
        else { xpReward = 50; coinReward = 100; }
    } else if (tier === "medium") {
        if (result === "menang") { xpReward = 150; coinReward = 300; }
        else if (result === "kalah") { xpReward = 50; coinReward = 100; }
        else { xpReward = 100; coinReward = 150; }
    } else if (tier === "hard") {
        if (result === "menang") { xpReward = 250; coinReward = 400; }
        else if (result === "kalah") { xpReward = 100; coinReward = 100; }
        else { xpReward = 150; coinReward = 200; }
    }

    // 3. Masukkan ganjaran ke data tempatan pemain
    localPlayerData.coins = (localPlayerData.coins || 0) + coinReward;
    localPlayerData.totalScore = (localPlayerData.totalScore || 0) + xpReward;

    // 4. SIMPAN KEPUTUSAN & GANJARAN KE FIREBASE (VERSI OPTIMUM & JAYAHED COINS)
    const today = new Date().toISOString().split('T')[0];
    const docId = `${studentInfo.school}_${studentInfo.class}_${studentInfo.name}`.replace(/\s+/g, '_');

    // Sediakan objek kemas kini
    let updateData = {
        coins: localPlayerData.coins,
        totalScore: localPlayerData.totalScore,
        currentStatus: "idle" // 🟢 Sekali gus kemas kini status ke idle di sini!
    };

    // Logik had harian pvpCountToday tanpa perlu .get() dahulu
    if (localPlayerData.lastPvPDate === today) {
        localPlayerData.pvpCountToday = (localPlayerData.pvpCountToday || 0) + 1;
        updateData.pvpCountToday = firebase.firestore.FieldValue.increment(1);
    } else {
        localPlayerData.lastPvPDate = today;
        localPlayerData.pvpCountToday = 1;
        updateData.lastPvPDate = today;
        updateData.pvpCountToday = 1;
    }

    // Terus hantar UPDATE (Jimat 100% kos operasi BACA/READ!)
    db.collection("players").doc(docId).update(updateData)
    .then(() => {
        console.log("💰 [PvP] Ganjaran disimpan & Status menjadi IDLE!");
        if (typeof updateUI === "function") updateUI(); 
    }).catch(error => {
        console.error("❌ Ralat menyimpan ganjaran PvP:", error);
    });

    // 5. PAPARKAN KEPUTUSAN KEPADA MURID
    let titleText = result === "menang" ? "Tahniah, Anda Menang! 🏆" : (result === "kalah" ? "Anda Tewas! 💔" : "Seri! 🤝");
    let iconType = result === "menang" ? "success" : (result === "kalah" ? "error" : "info");

    Swal.fire({
        title: titleText,
        html: `Kategori: <b>${tier.toUpperCase()}</b><br><br>
               Markah Anda: <b>${myScore}</b><br>
               Markah Lawan: <b>${oppScore}</b><br><br>
               <b>Ganjaran Diterima:</b><br>
               +${xpReward} XP ⭐<br>
               +${coinReward} Syiling 💰`,
        icon: iconType,
        confirmButtonText: "Kembali ke Lobi",
        allowOutsideClick: false
    }).then(() => {
        // 🟢 BUKA SEMULA KUNCI: Supaya mereka boleh dapat ganjaran lagi untuk game PvP yang seterusnya!
        isGanjaranPvPDisimpan = false;

        // Tutup arena, buka balik lobi
        if (typeof showScreen === "function") {
            showScreen('challenge-lobby-screen');
        } else {
            const pvpArenaScreen = document.getElementById('pvp-arena-screen');
            if (pvpArenaScreen) pvpArenaScreen.classList.add('hidden');
            document.getElementById('challenge-lobby-screen').classList.remove('hidden');
        }

        // 🎵 Mainkan semula muzik apabila kembali ke Lobi PvP
        if (typeof playBgMusic === 'function') playBgMusic();

        // 🗑️ (KOD REDUNDANT DI SINI TELAH DIBUANG UNTUK JIMAT KUOTA WRITE FIREBASE)
        console.log("🟢 Pemain kembali ke lobi.");
    });
}

// ==========================================
// E. PENGESAN JAWAPAN (TRANSAKSI SIAPA CEPAT)
// ==========================================
document.addEventListener('input', function(e) {
    if (e.target && e.target.id === 'pvp-answer-input') {
        
        if (typeof currentPvPChallengeId === 'undefined' || !currentPvPChallengeId || typeof currentPvPAnswer === 'undefined' || currentPvPAnswer === null) return;
        
        const inputBox = e.target;
        const userInput = String(inputBox.value).toUpperCase().trim();
        const correctA_raw = String(currentPvPAnswer).toUpperCase().trim();
        const possibleAnswers = correctA_raw.split('|');
        
        if (possibleAnswers.includes(userInput)) {
            
            inputBox.value = ""; 
            inputBox.disabled = true; 

            const rtdbChallengeRef = rtdb.ref("challenges/" + currentPvPChallengeId);
            
            rtdbChallengeRef.transaction((data) => {
                if (data) {
                    if (data.currentQ !== window.currentPvPQuestionText || data.isTransitioning) {
                        return; // Batal transaksi
                    }

                    // 🟢 TARIK SOALAN SETERUSNYA DARI SUBJEK YANG BETUL!
                    const targetBankData = window.getPvPBankData(window.currentPvPSubjectKey);
                    const questions = targetBankData[currentPvPCategoryKey] || gameData.missing; 
                    const newQ = questions[Math.floor(Math.random() * questions.length)];
                    
                    const scoreField = isPlayer1 ? "p1Score" : "p2Score";

                    data[scoreField] = (data[scoreField] || 0) + 1; 
                    data.lastScorer = studentInfo.name; 
                    data.nextQ = newQ.q;
                    data.nextA = newQ.a;
                    data.isTransitioning = true; 
                    
                    return data; 
                }
                return data; 
                
            }, (error, committed, snapshot) => {
                if (error || !committed) {
                    inputBox.disabled = false;
                    inputBox.focus();
                }
            });
        }
    }
});


// ============================================================================
// 📅 PENGURUSAN WIDGET EVENT (LTE) - VERSI OPTIMASI 12 BULAN AUTOMATIK
// ============================================================================
let lteTimerInterval = null;
let currentActiveEvent = null; // Memori cache untuk menyimpan acara aktif (Mengelakkan spam log)

// Semak acara yang sedang berlangsung berdasarkan tarikh hari ini
function getCurrentEvent() {
    const now = new Date();
    
    if (typeof EVENT_CALENDAR === 'undefined') {
        console.error("❌ [LTE] Ralat Kritikal: Variabel 'EVENT_CALENDAR' langsung tidak dijumpai dalam skop fail ini!");
        return null;
    }

    // Cari acara yang bertindih dengan tarikh peranti sekarang
    const matchedEvent = EVENT_CALENDAR.find(event => {
        const start = new Date(event.startDate);
        const end = new Date(event.endDate);
        return now >= start && now <= end; 
    });

    // LOG SELESAI: Log hanya dicetak SEKALI sahaja semasa fungsi ini dipanggil (Bukan setiap saat)
    if (matchedEvent) {
        console.log(`🎯 [LTE] Acara Aktif Dikesan: "${matchedEvent.name}" | Jenis: ${matchedEvent.rewardType}`);
    } else {
        console.log("🎯 [LTE] Hasil carian: Tiada sebarang acara aktif untuk tarikh hari ini.");
    }

    return matchedEvent;
}

// Fungsi utama untuk setup teks statik, ikon ganjaran dan paparan widget
function setupLTEWidget() {
    // Ambil data acara aktif dan simpan dalam memori global cache
    currentActiveEvent = getCurrentEvent();
    
    const widgetDOM = document.getElementById('lte-active-widget');
    const titleDOM = document.getElementById('lte-widget-title');
    const iconDOM = document.getElementById('lte-widget-icon'); // Elemen emoji (jika ada)

    // Pengesan ralat elemen HTML jika ID tidak sepadan
    if (!widgetDOM) {
        console.error("❌ [LTE] Ralat UI: Elemen HTML dengan id 'lte-active-widget' TIDAK DIJUMPAI dalam dokumen!");
        return;
    }

    // 1. Sembunyikan widget jika tiada acara aktif untuk bulan ini
    if (!currentActiveEvent) {
        if (!widgetDOM.classList.contains('hidden')) {
            console.log("🙈 [LTE] Tiada acara aktif dikesan. Menyembunyikan widget dari paparan murid.");
            widgetDOM.classList.add('hidden');
        }
        if (lteTimerInterval) clearInterval(lteTimerInterval);
        return;
    }

    // 2. Paparkan widget jika ada acara aktif
    if (widgetDOM.classList.contains('hidden')) {
        console.log(`👀 [LTE] Acara aktif "${currentActiveEvent.name}" dikesan! Membuka paparan widget.`);
        widgetDOM.classList.remove('hidden');
    }

    // 3. Format teks ganjaran & Emoji dinamik berdasarkan kalendar 12 Bulan Cikgu
    let rewardText = "";
    let emojiIcon = "🔥"; 
    
    switch(currentActiveEvent.rewardType) {
        case 'xp_buff': 
            rewardText = `(${currentActiveEvent.rewardValue}x XP)`; 
            emojiIcon = "⚡";
            break;
        case 'coins_buff': 
            rewardText = `(${currentActiveEvent.rewardValue}x Koin)`; 
            emojiIcon = "💰";
            break;
        case 'no_penalty': 
            rewardText = `(Zon Kebal Boss)`; 
            emojiIcon = "🛡️";
            break;
        case 'shop_discount': 
            rewardText = `(Diskaun Kedai ${(1 - currentActiveEvent.rewardValue) * 100}%)`; 
            emojiIcon = "🏷️";
            break;
        case 'custom_title': 
            rewardText = `(Misi Gelaran)`; 
            emojiIcon = "🎖️";
            break;
        case 'custom_avatar': 
            rewardText = `(Misi Avatar)`; 
            emojiIcon = "🖼️";
            break;
        case 'custom_border': 
            rewardText = `(Misi Bingkai)`; 
            emojiIcon = "🔲";
            break;
        case 'event_badge': 
            rewardText = `(Misi Lencana)`; 
            emojiIcon = "🏅";
            break;
        default: 
            rewardText = `(Misi Khas)`;
            emojiIcon = "🔥";
    }

    // Suntik Teks Nama dan Ganjaran Acara
    if (titleDOM) {
        titleDOM.innerText = `${currentActiveEvent.name} ${rewardText}`;
    }
    
    // Suntik Emoji Dinamik (Jika Cikgu menyediakan id="lte-widget-icon" pada HTML)
    if (iconDOM) {
        iconDOM.innerText = emojiIcon;
    }

    // 4. Mulakan pemasa countdown baki masa (Sifar Log)
    startLteCountdown();
}

// Fungsi Pemasa: Hanya fokus mengira baki masa setiap saat (Jimat CPU & Bebas Spam)
// Fungsi Pemasa: Hanya fokus mengira baki masa setiap saat (Jimat CPU & Bebas Spam)
function startLteCountdown() {
    const timerDOM = document.getElementById('lte-widget-timer');
    if (!timerDOM || !currentActiveEvent) return;

    const endDate = new Date(currentActiveEvent.endDate);

    if (lteTimerInterval) clearInterval(lteTimerInterval);

    lteTimerInterval = setInterval(() => {
        const now = new Date();
        const timeDiff = endDate - now;

        // Jika masa tamat semasa murid sedang melihat dashboard
        if (timeDiff <= 0) {
            console.log("⌛ [LTE] Tempoh masa acara telah tamat secara rasmi.");
            timerDOM.innerText = "Telah Tamat!";
            clearInterval(lteTimerInterval);
            
            // Tunggu 2 saat, kemudian semak semula konfigurasi (kot ada event baharu bermula)
            setTimeout(setupLTEWidget, 2000); 
            return;
        }

        // Pengiraan Hari, Jam, Minit, Saat
        const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

        let timerText = "⏳ ";
        if (days > 0) timerText += `${days}H `;
        timerText += `${hours}J ${minutes}M ${seconds}S`;

        // Kemaskini DOM masa sahaja (Tiada console.log di sini, bermakna tiada lagi spam!)
        timerDOM.innerText = timerText;
    }, 1000);
}

// Fungsi inisialisasi yang dipanggil semasa Dashboard dimuatkan
function initLTE() {
    console.log("🚀 [LTE] Sistem pengurusan automatik 12 bulan diaktifkan!");
    
    if (lteTimerInterval) {
        clearInterval(lteTimerInterval);
    }
    
    // Jalankan penetapan teks widget dan mulakan countdown
    setupLTEWidget();
}

// ============================================================================
// 🔥 FIREBASE: KEMASKINI PROGRES HARI TERKUMPUL LTE (KALIS SPAM)
// ============================================================================
async function updateLteProgress() {
    if (!currentActiveEvent || !currentActiveEvent.requiredDays) {
        return; 
    }

    let myUserId = null;
    if (typeof currentUserId !== 'undefined' && currentUserId) myUserId = currentUserId;
    else if (firebase.auth().currentUser) myUserId = firebase.auth().currentUser.uid;
    else if (typeof studentInfo !== 'undefined' && studentInfo.uid) myUserId = studentInfo.uid;
    else if (typeof studentInfo !== 'undefined' && studentInfo.docId) myUserId = studentInfo.docId;
    else if (localStorage.getItem('studentId')) myUserId = localStorage.getItem('studentId');
    else if (typeof studentInfo !== 'undefined' && studentInfo.name) myUserId = studentInfo.name;

    if (!myUserId) {
        console.warn("⚠️ [LTE] Tiada ID murid dikesan. Gagal mengemas kini progres.");
        return;
    }

    const hariIni = new Date().toISOString().split('T')[0]; 

    try {
        // 🔥 PEMBETULAN KRITIKAL: Tukar "users" kepada "players"
        let userRef = firebase.firestore().collection("players").doc(myUserId);
        let userSnap = await userRef.get();

        let isExists = typeof userSnap.exists === 'function' ? userSnap.exists() : userSnap.exists;

        // JIKA GAGAL: Cari guna Query Nama dalam koleksi "players"
        if (!isExists && typeof studentInfo !== 'undefined' && studentInfo.name) {
            const querySnapshot = await firebase.firestore().collection("players").where("name", "==", studentInfo.name).get();
            if (!querySnapshot.empty) {
                userRef = querySnapshot.docs[0].ref; 
                userSnap = querySnapshot.docs[0];    
                isExists = true;
            }
        }

        if (!isExists) return; 

        const userData = userSnap.data();
        let lteProgress = userData.lte_progress || { activeEventName: "", cumulativeDays: 0, lastPlayedDate: "" };

        if (lteProgress.activeEventName !== currentActiveEvent.name) {
            console.log(`♻️ [LTE] Acara baharu dikesan (${currentActiveEvent.name}). Me-reset kaunter progres murid.`);
            lteProgress.activeEventName = currentActiveEvent.name;
            lteProgress.cumulativeDays = 1;
            lteProgress.lastPlayedDate = hariIni;
            await userRef.update({ lte_progress: lteProgress });
            console.log("✅ [LTE] Progres bulan baharu berjaya dimulakan: 1 Hari.");
            return;
        }

        if (lteProgress.lastPlayedDate === hariIni) {
            console.log("🛡️ [LTE] Murid sudah bermain hari ini. Progres hari terkumpul tidak ditambah (Anti-Spam).");
            return;
        }

        lteProgress.cumulativeDays += 1;
        lteProgress.lastPlayedDate = hariIni;
        await userRef.update({ lte_progress: lteProgress });
        console.log(`🎉 [LTE] Tahniah! Progres meningkat: ${lteProgress.cumulativeDays} / ${currentActiveEvent.requiredDays} Hari.`);

        if (lteProgress.cumulativeDays === currentActiveEvent.requiredDays) {
            triggerLteRewardCelebration(currentActiveEvent.name);
        }

    } catch (error) {
        console.error("❌ [LTE] Ralat semasa mengemaskini progres ke Firestore:", error);
    }
}

// Fungsi gembira apabila hadiah berjaya dicapai!
function triggerLteRewardCelebration(eventName) {
    if (typeof Swal !== 'undefined') {
        Swal.fire({
            title: 'TAHNIAH! 🏅',
            text: `Anda telah berjaya menyelesaikan Misi 15 Hari untuk acara "${eventName}"! Ganjaran anda telah dikunci masuk.`,
            icon: 'success',
            confirmButtonColor: '#3085d6',
            confirmButtonText: 'Awesome!'
        });
    } else {
        alert(`🎉 TAHNIAH! Anda telah berjaya menyelesaikan Misi 15 Hari untuk acara "${eventName}"!`);
    }
}

// ============================================================================
// FUNGSI POP-UP MODAL LTE (UI) - VERSI REALTIME FIRESTORE
// ============================================================================

async function handleWidgetClick() {
    if (!currentActiveEvent) return;

    const modal = document.getElementById('lte-info-modal');
    const titleDOM = document.getElementById('modal-lte-title');
    const descDOM = document.getElementById('modal-lte-desc');
    const iconDOM = document.getElementById('modal-lte-icon');
    const progressSection = document.getElementById('modal-lte-progress-section');
    const progressText = document.getElementById('modal-lte-progress-text');
    const progressBar = document.getElementById('modal-lte-progress-bar');

    titleDOM.innerText = currentActiveEvent.name;
    iconDOM.innerText = currentActiveEvent.rewardType.includes('badge') ? "🏅" : 
                        currentActiveEvent.rewardType.includes('avatar') ? "🖼️" : 
                        currentActiveEvent.rewardType.includes('title') ? "🎖️" : "🔥";

    if (currentActiveEvent.requiredDays) {
        descDOM.innerText = `Log masuk dan selesaikan permainan selama ${currentActiveEvent.requiredDays} hari sepanjang tempoh acara untuk menuntut ganjaran istimewa ini!`;
        progressSection.classList.remove('hidden');
        progressText.innerText = `Memuatkan...`;
        progressBar.style.width = "0%";

        let myUserId = null;
        let realDays = 0;

        if (typeof currentUserId !== 'undefined' && currentUserId) myUserId = currentUserId;
        else if (firebase.auth().currentUser) myUserId = firebase.auth().currentUser.uid;
        else if (typeof studentInfo !== 'undefined' && studentInfo.uid) myUserId = studentInfo.uid;
        else if (typeof studentInfo !== 'undefined' && studentInfo.docId) myUserId = studentInfo.docId;
        else if (localStorage.getItem('studentId')) myUserId = localStorage.getItem('studentId');
        else if (typeof studentInfo !== 'undefined' && studentInfo.name) myUserId = studentInfo.name;

        if (myUserId) {
            try {
                // 🔥 PEMBETULAN KRITIKAL: Tukar "users" kepada "players"
                let userSnap = await firebase.firestore().collection("players").doc(myUserId).get();
                let isExists = typeof userSnap.exists === 'function' ? userSnap.exists() : userSnap.exists;
                
                // JIKA GAGAL: Cari guna Query Nama dalam koleksi "players"
                if (!isExists && typeof studentInfo !== 'undefined' && studentInfo.name) {
                    console.log("🔍 [LTE UI] Mencari dokumen berdasarkan nama:", studentInfo.name);
                    const querySnapshot = await firebase.firestore().collection("players").where("name", "==", studentInfo.name).get();
                    
                    if (!querySnapshot.empty) {
                        userSnap = querySnapshot.docs[0];
                        isExists = true;
                    }
                }

                if (isExists) {
                    const userData = userSnap.data();
                    
                    if (userData.lte_progress && userData.lte_progress.activeEventName === currentActiveEvent.name) {
                        realDays = userData.lte_progress.cumulativeDays || 0;
                    }
                } else {
                    throw new Error("Dokumen murid tidak dijumpai di Firestore.");
                }

                let targetDays = currentActiveEvent.requiredDays;
                if (realDays > targetDays) realDays = targetDays;

                progressText.innerText = `${realDays} / ${targetDays} Hari`;
                
                let percent = (realDays / targetDays) * 100;
                setTimeout(() => {
                    progressBar.style.width = `${percent}%`;
                }, 100);

            } catch (error) {
                console.error("❌ [LTE UI] Gagal mengambil progres murid dari Firestore:", error);
                progressText.innerText = "Gagal memuatkan data.";
            }
        } else {
            progressText.innerText = "Ralat: ID Murid gagal dikesan.";
        }
    } else {
        descDOM.innerText = "Acara global sedang berlangsung! Nikmati kelebihan ganjaran istimewa ini secara automatik sepanjang tempoh acara.";
        progressSection.classList.add('hidden');
    }

    modal.classList.remove('hidden');
}

function closeLteModal() {
    const modal = document.getElementById('lte-info-modal');
    if (modal) {
        modal.classList.add('hidden');
        const progressBar = document.getElementById('modal-lte-progress-bar');
        if (progressBar) progressBar.style.width = "0%";
    }
}
