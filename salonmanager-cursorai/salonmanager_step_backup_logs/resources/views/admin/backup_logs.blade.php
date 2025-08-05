
<h1>Backup & Log Verwaltung</h1>
<form method='POST' action='/backup/run'>@csrf
<label>Ziel:</label><select name='ziel'><option value='local'>Lokal</option><option value='cloud'>Cloud</option></select>
<button>Backup starten</button></form>
<a href='/logs/download'>Letztes Log herunterladen</a>