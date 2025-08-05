
<h1>Kalender Synchronisation</h1>
<a href='/calendar/export.ics'>Exportiere Termine (.ics)</a><br>
<form method='POST' action='/calendar/import' enctype='multipart/form-data'>@csrf
<input type='file' name='ical'><button>Importieren</button></form>