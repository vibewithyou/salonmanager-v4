
<h1>Newsletter senden</h1>
<form method='POST' action='/newsletter/send'>@csrf
<input name='subject' placeholder='Betreff'><br>
<textarea name='content' placeholder='Nachricht'></textarea><br>
<button>Senden</button></form>