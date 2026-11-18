const KEY_TASKS = "taskmate_tasks_v1";
const KEY_TERKIRIM = "notifikasiTerkirim";
const ICON = "https://cdn-icons-png.flaticon.com/512/1827/1827370.png";

// Baca localStorage dengan aman
function bacaJSON(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch (e) {
    console.error("Gagal membaca", key, e);
    return [];
  }
}

// Minta izin (panggil dari tombol, bukan otomatis)
async function aktifkanNotifikasi() {
  if (!("Notification" in window)) {
    alert("Browser tidak mendukung notifikasi.");
    return;
  }
  if (!window.isSecureContext) {
    alert("Gunakan HTTPS atau http://localhost, bukan file://");
    return;
  }

  const izin = await Notification.requestPermission();

  if (izin === "granted") {
    alert("Notifikasi berhasil diaktifkan!");
    periksaDeadline();
  } else {
    alert("Izin notifikasi belum diberikan.");
  }
}

// Tampilkan notifikasi (Service Worker jika ada, fallback biasa)
async function tampilkanNotifikasi(judul, opsi) {
  try {
    if ("serviceWorker" in navigator) {
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg) {
        await reg.showNotification(judul, opsi);
        return;
      }
    }
    new Notification(judul, opsi);
  } catch (e) {
    console.error("Gagal menampilkan notifikasi:", e);
  }
}

// Periksa deadline
function periksaDeadline() {
  if (
    !("Notification" in window) ||
    Notification.permission !== "granted"
  ) {
    return;
  }

  const daftarKegiatan = bacaJSON(KEY_TASKS);
  const terkirim = bacaJSON(KEY_TERKIRIM).map(String);
  const sekarang = Date.now();
  let berubah = false;

  daftarKegiatan.forEach(kegiatan => {
    if (kegiatan.done) return;

    // Pastikan format jam HH:MM
    const jam = String(kegiatan.time || "00:00").replace(".", ":");
    const deadline = new Date(`${kegiatan.date}T${jam}`).getTime();

    if (isNaN(deadline)) {
      console.warn("Tanggal/jam tidak valid:", kegiatan);
      return;
    }

    const selisih = deadline - sekarang;
    const id = String(kegiatan.id);

    // 0 - 10 menit sebelum deadline, dan belum pernah dikirim
    if (selisih > 0 && selisih <= 10 * 60 * 1000 && !terkirim.includes(id)) {
      tampilkanNotifikasi("⏰ Pengingat TaskMate!", {
        body: `Kegiatan "${kegiatan.name}" akan segera dimulai!`,
        icon: ICON,
        tag: "taskmate-" + id
      });
      terkirim.push(id);
      berubah = true;
    }
  });

  if (berubah) {
    localStorage.setItem(KEY_TERKIRIM, JSON.stringify(terkirim));
  }
}

// Periksa tiap 30 detik dan saat halaman dibuka
setInterval(periksaDeadline, 30000);
periksaDeadline();
