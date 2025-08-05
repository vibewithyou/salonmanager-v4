
document.getElementById('stylist').addEventListener('change', loadCalendar);
function loadCalendar(){ /* Holt Verfügbarkeiten + zeigt Kalender */ }
var calendar = new FullCalendar.Calendar(document.getElementById('calendar'), {
  initialView: 'timeGridWeek',
  events: '/api/calendar/stylist/1'
});
calendar.render();