
<h1>Rechnungsvorschau</h1>
<p>Steuer-ID: DE123456789</p><p>Leistung: Haarschnitt</p><p>USt: 19%</p>
<form method='POST' action='/invoice/generate'>@csrf
<select name='ust'><option>7%</option><option selected>19%</option></select><button>Rechnung generieren</button></form>