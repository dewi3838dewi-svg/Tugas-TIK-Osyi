// Meminta izin notifikasi
async function aktifkanNotifikasi() {
  if (!("Notification" in window)) {
    alert("Browser tidak mendukung notifikasi.");
    return;
  }

  const izin = await Notification.requestPermission();

  if (izin === "granted") {
    alert("Notifikasi berhasil diaktifkan!");
  } else {
    alert("Izin notifikasi belum diberikan.");
  }
}

// Menyimpan ID kegiatan yang sudah diberi notifikasi
function getNotifikasiTerkirim() {
  return JSON.parse(
    localStorage.getItem("notifikasiTerkirim") || "[]"
  );
}

// Memeriksa deadline kegiatan
function periksaDeadline() {
  if (
    !("Notification" in window) ||
    Notification.permission !== "granted"
  ) {
    return;
  }

  const daftarKegiatan = JSON.parse(
    localStorage.getItem("taskmate_tasks_v1") || "[]"
  );

  const notifikasiTerkirim = getNotifikasiTerkirim();
  const sekarang = new Date().getTime();

  daftarKegiatan.forEach(kegiatan => {
    if (kegiatan.done) return;

    const deadline = new Date(
      kegiatan.date + "T" + kegiatan.time
    ).getTime();

    const selisihWaktu = deadline - sekarang;

    // Notifikasi 10 menit sebelum deadline
    if (
      selisihWaktu > 0 &&
      selisihWaktu <= 10 * 60 * 1000 &&
      !notifikasiTerkirim.includes(kegiatan.id)
    ) {
      new Notification("⏰ Pengingat TaskMate!", {
        body: `Kegiatan "${kegiatan.name}" akan segera dimulai!`,
        icon: "https://cdn-icons-png.flaticon.com/512/1827/1827370.png"
      });

      notifikasiTerkirim.push(kegiatan.id);

      localStorage.setItem(
        "notifikasiTerkirim",
        JSON.stringify(notifikasiTerkirim)
      );
    }
  });
}

// Periksa setiap 30 detik
setInterval(periksaDeadline, 30000);

// Periksa langsung saat halaman dibuka
periksaDeadline();
