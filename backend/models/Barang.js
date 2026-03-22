const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Barang = sequelize.define('Barang', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    kode_barang: { type: DataTypes.STRING, allowNull: false, unique: true },
    nama_barang: { type: DataTypes.STRING, allowNull: false },
    harga: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 0 } },
    stok: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 0 } },
    satuan: { type: DataTypes.STRING, allowNull: false }
  }, {
    tableName: 'barang'
  });
  return Barang;
};
