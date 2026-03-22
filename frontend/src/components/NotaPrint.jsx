import React, { forwardRef } from 'react';

const NotaPrint = forwardRef(({ transaksi }, ref) => {
  if (!transaksi) return null;
  const details = transaksi.TransaksiDetails || transaksi.transaksi_details || [];
  return (
    <div ref={ref} style={{ padding: 16, fontFamily: 'Arial', width: 480 }}>
      <h3 style={{ textAlign: 'center' }}>Toko Plastik</h3>
      <div>No: {transaksi.nomor_transaksi}</div>
      <div>Tanggal: {transaksi.tanggal}</div>
      <table style={{ width: '100%', marginTop: 12, borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ borderBottom: '1px solid #ccc', textAlign: 'left' }}>Barang</th>
            <th style={{ borderBottom: '1px solid #ccc' }}>Harga</th>
            <th style={{ borderBottom: '1px solid #ccc' }}>Jumlah</th>
            <th style={{ borderBottom: '1px solid #ccc' }}>Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {details.map(d => (
            <tr key={d.id}>
              <td>{d.Barang ? d.Barang.nama_barang : ''}</td>
              <td style={{ textAlign: 'right' }}>{new Intl.NumberFormat('id-ID').format(d.Barang ? d.Barang.harga : 0)}</td>
              <td style={{ textAlign: 'center' }}>{d.jumlah}</td>
              <td style={{ textAlign: 'right' }}>{new Intl.NumberFormat('id-ID').format(d.subtotal)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan="3" style={{ textAlign: 'right', borderTop: '1px solid #ccc' }}>Total</td>
            <td style={{ textAlign: 'right', borderTop: '1px solid #ccc' }}>{new Intl.NumberFormat('id-ID').format(transaksi.total)}</td>
          </tr>
        </tfoot>
      </table>
      <div style={{ marginTop: 24, textAlign: 'center' }}>Terima kasih</div>
    </div>
  );
});

export default NotaPrint;
