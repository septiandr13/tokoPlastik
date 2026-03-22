const express = require('express');
const cors = require('cors');
const { body, param, query, validationResult } = require('express-validator');
const { QueryTypes, Op } = require('sequelize');
const { sequelize, Barang, Transaksi, TransaksiDetail } = require('./models');
const { seedIfEmpty } = require('./seed');

const app = express();
app.use(cors());
app.use(express.json());

function handleValidation(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
}

app.get('/health', (req, res) => res.json({ ok: true }));

app.get('/barang', async (req, res) => {
  const items = await Barang.findAll({ order: [['id', 'ASC']] });
  res.json(items);
});

app.post('/barang',
  body('kode_barang').trim().isLength({ min: 1 }).escape(),
  body('nama_barang').trim().isLength({ min: 1 }).escape(),
  body('harga').isInt({ min: 0 }),
  body('stok').isInt({ min: 0 }),
  body('satuan').trim().isLength({ min: 1 }).escape(),
  async (req, res) => {
    const v = handleValidation(req, res);
    if (v) return;
    try {
      const created = await Barang.create(req.body);
      res.status(201).json(created);
    } catch (e) {
      if (e.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({ error: 'kode_barang sudah ada' });
      }
      res.status(500).json({ error: 'server error' });
    }
  }
);

app.put('/barang/:id',
  param('id').isInt({ min: 1 }),
  body('nama_barang').optional().trim().isLength({ min: 1 }).escape(),
  body('harga').optional().isInt({ min: 0 }),
  body('stok').optional().isInt({ min: 0 }),
  body('satuan').optional().trim().isLength({ min: 1 }).escape(),
  async (req, res) => {
    const v = handleValidation(req, res);
    if (v) return;
    try {
      const b = await Barang.findByPk(req.params.id);
      if (!b) return res.status(404).json({ error: 'not found' });
      await b.update(req.body);
      res.json(b);
    } catch (e) {
      res.status(500).json({ error: 'server error' });
    }
  }
);

app.delete('/barang/:id',
  param('id').isInt({ min: 1 }),
  async (req, res) => {
    const v = handleValidation(req, res);
    if (v) return;
    const b = await Barang.findByPk(req.params.id);
    if (!b) return res.status(404).json({ error: 'not found' });
    await b.destroy();
    res.json({ ok: true });
  }
);

app.get('/transaksi',
  query('from').optional().isISO8601(),
  query('to').optional().isISO8601(),
  async (req, res) => {
    const v = handleValidation(req, res);
    if (v) return;
    const where = {};
    if (req.query.from || req.query.to) {
      const cond = {};
      if (req.query.from) cond[Op.gte] = req.query.from;
      if (req.query.to) cond[Op.lte] = req.query.to;
      where.tanggal = cond;
    }
    const list = await Transaksi.findAll({
      where,
      order: [['tanggal', 'DESC'], ['id', 'DESC']],
      include: [{ model: TransaksiDetail, include: [Barang] }]
    });
    res.json(list);
  }
);

app.get('/transaksi/:id',
  param('id').isInt({ min: 1 }),
  async (req, res) => {
    const v = handleValidation(req, res);
    if (v) return;
    const trx = await Transaksi.findByPk(req.params.id, {
      include: [{ model: TransaksiDetail, include: [Barang] }]
    });
    if (!trx) return res.status(404).json({ error: 'not found' });
    res.json(trx);
  }
);

app.post('/transaksi',
  body('items').isArray({ min: 1 }),
  body('items.*.barang_id').isInt({ min: 1 }),
  body('items.*.jumlah').isInt({ min: 1 }),
  async (req, res) => {
    const v = handleValidation(req, res);
    if (v) return;
    const t = await sequelize.transaction();
    try {
      const today = new Date().toISOString().slice(0, 10);
      const forDateCount = await Transaksi.count({ where: { tanggal: today }, transaction: t });
      const nomor = `TRX-${today.replace(/-/g, '')}-${String(forDateCount + 1).padStart(3, '0')}`;
      const trx = await Transaksi.create({ nomor_transaksi: nomor, tanggal: today, total: 0 }, { transaction: t });
      let total = 0;
      for (const it of req.body.items) {
        const b = await Barang.findByPk(it.barang_id, { transaction: t, lock: t.LOCK.UPDATE });
        if (!b) throw new Error('barang not found');
        if (b.stok < it.jumlah) {
          throw new Error(`stok tidak cukup untuk ${b.nama_barang}`);
        }
        const subtotal = b.harga * it.jumlah;
        await TransaksiDetail.create({
          transaksi_id: trx.id,
          barang_id: b.id,
          jumlah: it.jumlah,
          subtotal
        }, { transaction: t });
        await b.decrement({ stok: it.jumlah }, { transaction: t });
        total += subtotal;
      }
      trx.total = total;
      await trx.save({ transaction: t });
      await t.commit();
      const full = await Transaksi.findByPk(trx.id, { include: [{ model: TransaksiDetail, include: [Barang] }] });
      res.status(201).json(full);
    } catch (e) {
      await t.rollback();
      res.status(400).json({ error: e.message || 'bad request' });
    }
  }
);

app.get('/laporan/ringkas',
  query('from').optional().isISO8601(),
  query('to').optional().isISO8601(),
  async (req, res) => {
    const v = handleValidation(req, res);
    if (v) return;
    let { from, to } = req.query;
    if (!from || !to) {
      const today = new Date();
      const start = new Date(today.getTime() - 29 * 86400000);
      from = start.toISOString().slice(0, 10);
      to = today.toISOString().slice(0, 10);
    }
    const daily = await sequelize.query(
      `SELECT tanggal, COALESCE(SUM(total),0) AS total
       FROM transaksi
       WHERE tanggal BETWEEN :from AND :to
       GROUP BY tanggal
       ORDER BY tanggal`,
      { replacements: { from, to }, type: QueryTypes.SELECT }
    );
    const sumRows = await sequelize.query(
      `SELECT COUNT(*) AS total_transaksi, COALESCE(SUM(total),0) AS total_omzet
       FROM transaksi
       WHERE tanggal BETWEEN :from AND :to`,
      { replacements: { from, to }, type: QueryTypes.SELECT }
    );
    const summary = sumRows[0] || { total_transaksi: 0, total_omzet: 0 };
    const items = await sequelize.query(
      `SELECT td.barang_id, b.nama_barang, COALESCE(SUM(td.jumlah),0) AS qty, COALESCE(SUM(td.subtotal),0) AS omzet
       FROM transaksi_detail td
       INNER JOIN transaksi t ON t.id = td.transaksi_id
       INNER JOIN barang b ON b.id = td.barang_id
       WHERE t.tanggal BETWEEN :from AND :to
       GROUP BY td.barang_id, b.nama_barang
       ORDER BY omzet DESC
       LIMIT 20`,
      { replacements: { from, to }, type: QueryTypes.SELECT }
    );
    const avg_transaksi = Number(summary.total_transaksi) > 0
      ? Math.round(Number(summary.total_omzet) / Number(summary.total_transaksi))
      : 0;
    res.json({
      range: { from, to },
      summary: {
        total_omzet: Number(summary.total_omzet) || 0,
        total_transaksi: Number(summary.total_transaksi) || 0,
        avg_transaksi
      },
      daily: daily.map(r => ({ tanggal: r.tanggal, total: Number(r.total) || 0 })),
      items: items.map(r => ({ barang_id: r.barang_id, nama_barang: r.nama_barang, qty: Number(r.qty) || 0, omzet: Number(r.omzet) || 0 }))
    });
  }
);

async function start() {
  await sequelize.sync();
  await sequelize.transaction(async (t) => {
    await seedIfEmpty({ Barang, Transaksi, TransaksiDetail }, t);
  });
  const port = process.env.PORT || 4000;
  app.listen(port, () => {
    process.stdout.write(`backend running on ${port}\n`);
  });
}

start();
