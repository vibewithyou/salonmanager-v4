
var map = L.map('map').setView([51, 10], 6);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
fetch('/api/salons_live').then(res => res.json()).then(data => {
  data.forEach(salon => {
    var marker = L.marker([salon.lat, salon.lng], {title: salon.name});
    marker.bindPopup(salon.name + '<br>' + salon.free_slots + ' freie Termine');
    marker.addTo(map);
  });
});
