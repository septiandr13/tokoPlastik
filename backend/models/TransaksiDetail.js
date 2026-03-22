const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const TransaksiDetail = sequelize.define('TransaksiDetail', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    jumlah: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1 } },
    subtotal: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 0 } }
  }, {
    tableName: 'transaksi_detail'
  });
  return TransaksiDetail;
};
