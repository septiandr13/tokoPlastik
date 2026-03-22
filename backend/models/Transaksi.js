const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Transaksi = sequelize.define('Transaksi', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    nomor_transaksi: { type: DataTypes.STRING, allowNull: false, unique: true },
    tanggal: { type: DataTypes.DATEONLY, allowNull: false },
    total: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 }
  }, {
    tableName: 'transaksi'
  });
  return Transaksi;
};
