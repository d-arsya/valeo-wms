<!DOCTYPE html>
<html lang="id">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
<title>Cetak QR Code Sparepart</title>
<style>
/*
 * KALKULASI OPTIMAL untuk DomPDF (unit: pt)
 *
 * A4 portrait = 595 × 842 pt
 * Margin pinggir: 35pt semua sisi (≈12.3mm) — aman printer + estetis
 * Area kerja: 595 - 70 = 525pt lebar | 842 - 70 = 772pt tinggi
 *
 * 14 label (2 kol × 7 baris):
 *   Gap antar kolom: 6pt
 *   Lebar label = (525 - 6) / 2 = 259.5pt ≈ 260pt
 *
 *   Gap antar baris: 4pt × 6 gaps = 24pt
 *   Tinggi label = (772 - 24) / 7 = 106.85pt ≈ 107pt
 *
 * Isi label (5 baris, QR rowspan 3):
 *   matno + cat + name = total ~55pt (QR 60pt cukup)
 *   maker + location   = ~26pt × 2 = 52pt
 *   Total ~107pt ✓
 */

  @page {
    size: A4 portrait;
    margin: 0;
  }

  html, body {
    margin: 0;
    padding: 0;
    font-family: Arial, Helvetica, sans-serif;
    font-size: 7.5pt;
    color: #000;
    background: #fff;
  }

  /* Wrapper padding — karena DomPDF sering ignore @page margin */
  .page-wrapper {
    padding: 35pt 35pt 35pt 35pt;
    box-sizing: border-box;
  }

  .page {
    page-break-after: always;
    width: 100%;
  }
  .page:last-child {
    page-break-after: auto;
  }

  /* Grid 2 kolom × 7 baris */
  .grid {
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed;
  }
  .grid td {
    vertical-align: top;
  }
  .grid td.col-l {
    width: 50%;
    padding: 0 3pt 4pt 0;
  }
  .grid td.col-r {
    width: 50%;
    padding: 0 0 4pt 3pt;
  }
  .grid tr:last-child td {
    padding-bottom: 0;
  }

  /* Tabel label */
  .label {
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed;
    border: 1.2pt solid #000;
  }
  .label td {
    border: 1pt solid #000;
    padding: 2.5pt 4pt;
    vertical-align: middle;
    overflow: hidden;
    word-break: break-word;
    line-height: 1.2;
  }

  /* QR code — rowspan 3, lebar 60pt */
  .qr {
    width: 60pt;
    text-align: center;
    padding: 2pt !important;
  }
  .qr img {
    width: 56pt;
    height: 56pt;
    display: block;
    margin: 0 auto;
  }

  /* Baris 1: Material Number */
  .matno {
    font-size: 9pt;
    font-weight: 900;
    text-align: center;
    padding: 3pt 4pt !important;
    letter-spacing: 0.2pt;
  }

  /* Baris 2: Category */
  .cat {
    font-size: 7.5pt;
    font-weight: 700;
    text-align: center;
    padding: 2pt 4pt !important;
  }

  /* Baris 3: Part Name */
  .name {
    font-size: 7.5pt;
    font-weight: 500;
    text-align: center;
    padding: 2pt 4pt !important;
  }

  /* Baris 4–5: Label kiri (Maker / Location) */
  .key {
    width: 30%;
    font-size: 7pt;
    font-weight: 700;
    text-align: center;
    background: #e8e8e8;
    padding: 2.5pt 2pt !important;
  }

  /* Baris 4–5: Value kanan */
  .val {
    font-size: 7.5pt;
    font-weight: 500;
    text-align: center;
    padding: 2.5pt 4pt !important;
  }

  /* Sel kosong */
  .empty {
    width: 100%;
    height: 102pt;
    border: 1pt dashed #d0d0d0;
    display: block;
  }
</style>
</head>
<body>

@foreach ($pages as $cards)
@php
  $arr = is_array($cards) ? $cards : $cards->toArray();
  while (count($arr) < 14) { $arr[] = null; }
  $rows = array_chunk($arr, 2);
@endphp
<div class="page-wrapper">
<div class="page">
<table class="grid"><tbody>
@foreach ($rows as $pair)
<tr>

{{-- Kolom kiri --}}
<td class="col-l">
@if ($pair[0] === null)
  <div class="empty"></div>
@else
@php $c = $pair[0]; @endphp
<table class="label"><tbody>
  <tr>
    <td class="qr" rowspan="3"><img src="{{ $c['qr_img'] }}" alt="QR"/></td>
    <td class="matno">{{ $c['material_number'] }}</td>
  </tr>
  <tr><td class="cat">{{ $c['category'] !== '-' ? $c['category'] : '&nbsp;' }}</td></tr>
  <tr><td class="name">{{ $c['part_name'] }}</td></tr>
  <tr>
    <td class="key">Maker</td>
    <td class="val">{{ $c['brand'] !== '-' ? $c['brand'] : '—' }}</td>
  </tr>
  <tr>
    <td class="key">Location</td>
    <td class="val">{{ $c['location'] !== '-' ? $c['location'] : '—' }}</td>
  </tr>
</tbody></table>
@endif
</td>

{{-- Kolom kanan --}}
<td class="col-r">
@if (!isset($pair[1]) || $pair[1] === null)
  <div class="empty"></div>
@else
@php $c = $pair[1]; @endphp
<table class="label"><tbody>
  <tr>
    <td class="qr" rowspan="3"><img src="{{ $c['qr_img'] }}" alt="QR"/></td>
    <td class="matno">{{ $c['material_number'] }}</td>
  </tr>
  <tr><td class="cat">{{ $c['category'] !== '-' ? $c['category'] : '&nbsp;' }}</td></tr>
  <tr><td class="name">{{ $c['part_name'] }}</td></tr>
  <tr>
    <td class="key">Maker</td>
    <td class="val">{{ $c['brand'] !== '-' ? $c['brand'] : '—' }}</td>
  </tr>
  <tr>
    <td class="key">Location</td>
    <td class="val">{{ $c['location'] !== '-' ? $c['location'] : '—' }}</td>
  </tr>
</tbody></table>
@endif
</td>

</tr>
@endforeach
</tbody></table>
</div>
</div>
@endforeach

</body>
</html>
