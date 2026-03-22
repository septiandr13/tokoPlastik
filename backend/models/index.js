const { Sequelize } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '..', 'db.sqlite'),
  logging: false
});

const BarangFactory = require('./Barang');
const TransaksiFactory = require('./Transaksi');
const TransaksiDetailFactory = require('./TransaksiDetail');

const Barang = BarangFactory(sequelize);
const Transaksi = TransaksiFactory(sequelize);
const TransaksiDetail = TransaksiDetailFactory(sequelize);

Barang.hasMany(TransaksiDetail, { foreignKey: 'barang_id', onDelete: 'RESTRICT' });
TransaksiDetail.belongsTo(Barang, { foreignKey: 'barang_id' });

Transaksi.hasMany(TransaksiDetail, { foreignKey: 'transaksi_id', onDelete: 'CASCADE' });
TransaksiDetail.belongsTo(Transaksi, { foreignKey: 'transaksi_id' });

module.exports = { sequelize, Barang, Transaksi, TransaksiDetail };
