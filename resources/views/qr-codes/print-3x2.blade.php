<!DOCTYPE html>
<html lang="id">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
<title>Cetak QR Code Sparepart</title>
<style>
  @page {
    size: A4 portrait;
    margin: 8mm;
  }
  html, body {
    margin: 0; padding: 0;
    font-family: Arial, Helvetica, sans-serif;
    color: #000000;
    background: #ffffff;
  }
  body {
    font-size: 12pt;
    line-height: 1.2;
  }
  .page {
    page-break-after: always;
    width: 100%;
  }
  .page:last-child { page-break-after: auto; }

  /* Grid outer: 2 kolom x 3 baris = 6 label per halaman A4 */
  .labels-grid {
    width: 100%;
    border-collapse: separate;
    border-spacing: 5mm 4mm;
    table-layout: fixed;
  }
  .labels-grid > tbody > tr > td {
    width: 50%;
    padding: 0;
    margin: 0;
    vertical-align: top;
  }

  /* SATU LABEL = UKURAN TETAP (HEIGHT & WIDTH DALAM MM) */
  /* Lebar A4=210, Margin 8+8=16, Spacing antar kolom 5 → (210-16-5)/2 ≈ 94.5mm  */
  .label {
    width: 94mm;
    height: 90mm;
    border: 2px solid #000000;
    border-collapse: collapse;
    table-layout: fixed;
    margin: 0 auto;
  }
  .label td {
    border: 2px solid #000000;
    padding: 1mm 2.2mm;
    margin: 0;
    vertical-align: middle;
    overflow: hidden;
    word-break: break-all;
    word-wrap: break-word;
  }

  /* --- KIRI: QR CODE FIXED 28mm WIDE --- */
  .qr-cell {
    width: 28mm;
    height: 90mm;
    text-align: center;
    padding: 2.5mm 1.8mm !important;
  }
  .qr-cell img {
    width: 100%;
    height: auto;
    max-height: 86mm;
    display: block;
    margin: 0 auto;
  }

  /* --- KANAN: 5 BARIS INFO (3 FULL + 2 LABELED) --- */
  .info {
    width: 66mm;
    padding: 0 !important;
    border: 0 !important;
  }
  .info-table {
    width: 100%;
    height: 90mm;
    border-collapse: collapse;
    table-layout: fixed;
  }
  .info-table td {
    border: 2px solid #000;
    padding: 0.6mm 2.2mm;
    overflow: hidden;
    word-break: break-all;
    word-wrap: break-word;
    vertical-align: middle;
  }

  /* HEIGHT TETAP per baris info (total 90mm) */
  .row-matno    { height: 20mm; }
  .row-catrank  { height: 16mm; }
  .row-partname { height: 20mm; }
  .row-maker    { height: 17mm; }
  .row-location { height: 17mm; }

  /* STYLE TEXT per baris */
  .matno {
    font-size: 20pt;
    font-weight: 900;
    letter-spacing: 0.3px;
    text-align: center;
  }
  .catrank {
    font-size: 13pt;
    font-weight: 700;
    text-align: center;
  }
  .partname {
    font-size: 13pt;
    font-weight: 600;
    text-align: center;
  }
  .lbl {
    width: 35%;
    background-color: #f4f4f4;
    font-weight: 800;
    font-size: 14pt;
    text-align: center;
  }
  .val {
    width: 65%;
    font-weight: 600;
    font-size: 14pt;
    text-align: center;
  }

  /* Empty cell placeholder */
  .empty-cell {
    width: 94mm;
    height: 90mm;
    border: 2px dashed #bbbbbb;
    color: #aaaaaa;
    text-align: center;
    vertical-align: middle;
    letter-spacing: 3mm;
    font-size: 14pt;
    margin: 0 auto;
  }

  .footer {
    position: fixed;
    bottom: -5mm; left: 0; right: 0;
    font-size: 8pt;
    color: #555;
    text-align: right;
    padding: 0 3mm;
  }
  .footer span { margin-left: 6mm; }
</style>
</head>
<body>

@foreach ($pages as $pageIdx => $cards)
  @php
    $cardsArr = is_array($cards) ? $cards : $cards->toArray();
    while (count($cardsArr) < 6) { $cardsArr[] = null; }
    $rows = array_chunk($cardsArr, 2);
  @endphp
  <table class="page labels-grid">
    <tbody>
    @foreach ($rows as $rowIdx => $pair)
      <tr>
      @foreach ($pair as $colIdx => $c)
        <td>
        @if ($c === null)
          <table class="empty-cell"><tr><td>KOSONG</td></tr></table>
        @else
          <table class="label">
            <tbody>
              <tr>
                {{-- KIRI: QR CODE 28mm (rowspan 5) --}}
                <td class="qr-cell" rowspan="5">
                  <img src="{{ $c['qr_img'] }}" alt="QR" />
                </td>
                {{-- KANAN: 5 ROWS INFO --}}
                <td class="info">
                  <table class="info-table">
                    <tbody>
                      <tr class="row-matno">
                        <td class="matno">{{ $c['material_number'] }}</td>
                      </tr>
                      <tr class="row-catrank">
                        <td class="catrank">
                          @if ($c['category'] !== '-' && $c['rank'] !== '-')
                            {{ $c['category'] }} · Rank {{ $c['rank'] }}
                          @elseif ($c['category'] !== '-')
                            {{ $c['category'] }}
                          @elseif ($c['rank'] !== '-')
                            Rank {{ $c['rank'] }}
                          @else
                            &nbsp;
                          @endif
                        </td>
                      </tr>
                      <tr class="row-partname">
                        <td class="partname">{{ $c['part_name'] }}</td>
                      </tr>
                      <tr class="row-maker">
                        <td class="lbl">Maker</td>
                        <td class="val">{{ $c['brand'] }}</td>
                      </tr>
                      <tr class="row-location">
                        <td class="lbl">Location</td>
                        <td class="val">{{ $c['location'] }}</td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
            </tbody>
          </table>
        @endif
        </td>
      @endforeach
      </tr>
    @endforeach
    </tbody>
  </table>
@endforeach

<div class="footer">
  Valeo WMS &mdash; Dicetak: {{ $printed_at }}
  <span>{{ $total_spareparts }} item</span>
  <span>{{ $total_pages }} halaman</span>
</div>

</body>
</html>
