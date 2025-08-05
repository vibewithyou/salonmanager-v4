
<h1>Impressum Generator</h1>
<form method='POST' action='/impressum/generate'>@csrf
<label>Inhaber</label><input name='owner'>
<label>Adresse</label><input name='address'>
<label>Telefon</label><input name='phone'>
<label>E-Mail</label><input name='email'><button>Erstellen</button></form>