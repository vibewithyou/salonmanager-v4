
<h1>Chat mit Stylist</h1>
<div id='messages'></div>
<form method='POST' enctype='multipart/form-data' action='/chat/send'>@csrf
<input name='msg'><input type='file' name='file'><button>Senden</button></form>