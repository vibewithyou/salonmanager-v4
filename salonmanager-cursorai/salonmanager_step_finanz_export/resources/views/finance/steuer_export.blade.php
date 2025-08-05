
<h1>Finanz-Export (DATEV)</h1>
<form method='POST' action='/finance/export'>@csrf
<label>USt (7%/19%)</label><select name='ust'><option>7</option><option selected>19</option></select>
<button>CSV Export</button></form>