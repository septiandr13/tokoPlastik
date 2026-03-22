import React, { useMemo } from 'react';
import { Table, Input } from 'antd';

export default function BarangTable({ data, loading, onSelectRow }) {
  const [search, setSearch] = React.useState('');
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return data.filter(
      x =>
        x.kode_barang.toLowerCase().includes(q) ||
        x.nama_barang.toLowerCase().includes(q)
    );
  }, [data, search]);
  const columns = [
    { title: 'Kode', dataIndex: 'kode_barang', sorter: (a, b) => a.kode_barang.localeCompare(b.kode_barang) },
    { title: 'Nama', dataIndex: 'nama_barang', sorter: (a, b) => a.nama_barang.localeCompare(b.nama_barang) },
    { title: 'Harga', dataIndex: 'harga', sorter: (a, b) => a.harga - b.harga, render: v => new Intl.NumberFormat('id-ID').format(v) },
    { title: 'Stok', dataIndex: 'stok', sorter: (a, b) => a.stok - b.stok },
    { title: 'Satuan', dataIndex: 'satuan' }
  ];
  return (
    <>
      <Input placeholder="Cari kode/nama" value={search} onChange={e => setSearch(e.target.value)} style={{ marginBottom: 12 }} />
      <Table
        rowKey="id"
        columns={columns}
        dataSource={filtered}
        loading={loading}
        onRow={r => ({ onClick: () => onSelectRow && onSelectRow(r) })}
        pagination={{ pageSize: 10 }}
        size="middle"
        bordered
      />
    </>
  );
}
