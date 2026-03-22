const { Op } = require('sequelize');

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function seedIfEmpty({ Barang, Transaksi, TransaksiDetail }, t) {
  const barangCount = await Barang.count({ transaction: t });
  if (barangCount === 0) {
    const satuanList = ['pcs', 'pack', 'lusin', 'kg'];
    const names = [
      'Gelas Plastik 240ml',
      'Gelas Plastik 360ml',
      'Mika Kotak',
      'Plastik Klip 2x3',
      'Plastik Klip 3x4',
      'Sendok Plastik',
      'Garpu Plastik',
      'Sedotan Jumbo',
      'Sedotan Kecil',
      'Kantong Plastik Besar',
      'Kantong Plastik Sedang',
      'Kantong Plastik Kecil',
      'Kotak Makan Plastik',
      'Mangkok Plastik',
      'Box Kue'
    ];
    const items = [];
    for (let i = 0; i < 12; i++) {
      const nama = pick(names) + ' ' + (i + 1);
      const kode = 'BRG' + String(i + 1).padStart(4, '0');
      const harga = randInt(500, 5000) * 10;
      const stok = randInt(20, 200);
      const satuan = pick(satuanList);
      items.push({ kode_barang: kode, nama_barang: nama, harga, stok, satuan });
    }
    await Barang.bulkCreate(items, { transaction: t });
  }
  const trxCount = await Transaksi.count({ transaction: t });
  if (trxCount === 0) {
    const allBarang = await Barang.findAll({ transaction: t });
    const today = new Date();
    const transactionsToCreate = randInt(5, 10);
    for (let i = 0; i < transactionsToCreate; i++) {
      const date = new Date(today.getTime() - randInt(0, 5) * 86400000);
      const ymd = date.toISOString().slice(0, 10);
      const forDateCount = await Transaksi.count({
        where: { tanggal: ymd },
        transaction: t
      });
      const nomor = `TRX-${ymd.replace(/-/g, '')}-${String(forDateCount + 1).padStart(3, '0')}`;
      const trx = await Transaksi.create({ nomor_transaksi: nomor, tanggal: ymd, total: 0 }, { transaction: t });
      const detailCount = randInt(1, 4);
      let total = 0;
      const usedIdx = new Set();
      for (let j = 0; j < detailCount; j++) {
        let idx = randInt(0, allBarang.length - 1);
        if (usedIdx.has(idx)) idx = (idx + 1) % allBarang.length;
        usedIdx.add(idx);
        const b = allBarang[idx];
        const jumlah = randInt(1, 5);
        const subtotal = b.harga * jumlah;
        if (b.stok >= jumlah) {
          await TransaksiDetail.create({
            transaksi_id: trx.id,
            barang_id: b.id,
            jumlah,
            subtotal
          }, { transaction: t });
          total += subtotal;
          await b.decrement({ stok: jumlah }, { transaction: t });
        }
      }
      trx.total = total;
      await trx.save({ transaction: t });
    }
  }
}

module.exports = { seedIfEmpty };
