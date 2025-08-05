
<h1>Zahlung mit SEPA & AGB</h1>
<form method='POST' action='/payment/confirm'>@csrf
<input type='checkbox' required> Ich akzeptiere die AGB.<br>
<input type='checkbox' required> Ich erteile ein SEPA-Lastschriftmandat.<br>
<button>Zahlung bestätigen</button></form>