
<h1>Produkt-Etiketten mit QR</h1>
@foreach($products as $p)<div>{{ $p->name }}<canvas id='qr_{{ $p->id }}'></canvas></div>@endforeach
<script src='/js/label_qr.js'></script>