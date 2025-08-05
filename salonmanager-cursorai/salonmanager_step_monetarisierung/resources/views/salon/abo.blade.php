
<h1>Monatliches Abo-Modell</h1>
<form method='POST' action='/abo/subscribe'>@csrf
<select name='plan'>
<option value='basic'>Basic – 10€/Monat</option>
<option value='premium'>Premium – 30€/Monat</option>
</select><button>Buchen</button></form>