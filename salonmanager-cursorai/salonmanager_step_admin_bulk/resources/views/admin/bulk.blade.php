
<h1>Admin Bulk-Aktionen</h1>
<form method='POST' action='/admin/export'>@csrf
<select name='action'><option value='export_salons'>Salons exportieren</option>
<option value='export_users'>User exportieren</option></select>
<button>Ausführen</button></form><script src='/js/admin_bulk.js'></script>