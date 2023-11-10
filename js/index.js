var map;
var markers = [];
var infoWindow;

var pathAr = [];

var position = [28.7041, 77.1555];

    // map options
    function initMap(){
        var options = {
            zoom:8,
            center: {lat: 28.7041, lng: 77.1025} 
        }
        // new map created
        map = new 
        google.maps.Map(document.getElementById('map'), options);
        
        infoWindow = new google.maps.InfoWindow();
        
        updateDroneStatus();
        
        showDronesMarker(drones);
        
    
    }

    //Function to clear all markers
    function clearLocations() {
        infoWindow.close();
        for(var i = 0; i < markers.length; i++) {
            markers[i].setMap(null);
        }
        markers.length = 0;
    }



// funtion to keep changing amarker location
function updateDroneStatus(){
    //  changing the lat lng of the existing control
    var interval1;
    var latlng = new google.maps.LatLng(position[0], position[1]);
    
    //Making a initial marker that moves
    var markerMove = new google.maps.Marker({
        position: latlng,
        map: map
      });

      // Drawing polyline for each marker path
      var movePathAr = [];
      
      var movePath = new google.maps.Polyline({
                    strokeColor: '#000000',
                    strokeOpacity: 1.0,
                    strokeWeight: 3
                  });

      movePath.setMap(map);
        
    
      

    document.querySelector('#change-location-btn').addEventListener('click', function(){
        var deltaLat = position[1]

        //Interval Runs every 0.5 seconds
        movePathAr.push(latlng);

        interval1 = setInterval(function() {

            deltaLat += 0.001;
            var delatLatlng = new google.maps.LatLng(position[0], deltaLat);
            
            
            //changing marker pos
            markerMove.setPosition(delatLatlng);
            
            // Drawing polyline for movement
            movePathAr = movePath.getPath();

            movePathAr.push(delatLatlng);

        }, 100)

    });
    
    document.querySelector('#stop-location-btn').addEventListener('click', function(){
        //comes back to initial pos
        markerMove.setPosition(latlng);
        movePath.setMap(null);
        movePathAr = [];
        updateDroneStatus()
        //clears interval
        clearInterval(interval1);
    });

}


// function to show all drones owned initially from static drone.js file
function showDronesMarker(drones) {
    var bounds = new google.maps.LatLngBounds(); //zooms out the map accordingly 
    for(var [index, drone] of drones.entries()) {
        var droneId = drone['id'];
        var name = drone['name'];
        var location = drone['locationName'];
        var accuracy = drone['GPS-accuracy'];
        var signalStrength = drone['signalStrength'];
        var batteryLevel = drone['batteryLevel'];
        var latlng = new google.maps.LatLng(
            drone['coordinates']['latitude'],
            drone['coordinates']['longitude']
        );
        bounds.extend(latlng);
        createMarker(latlng, droneId, location, name, accuracy, signalStrength,  batteryLevel, index+1);

    }
    map.fitBounds(bounds);

}

// create a marker function and it also has the controller activities in it
function createMarker(latlng, droneId, location, name, accuracy, signalStrength,  batteryLevel, index){
    var html = `<div class="drone-info-window">
                    <div class="drone-name">
                        ${name}
                    </div>

                    <div class="drone-id">
                        <div class="icon">
                            <i class="fas fa-id-card"></i>  
                        </div>
                        ${droneId}
                    </div>

                    <div class="drone-battery">
                        <div class="icon">    
                            <i class="fas fa-battery-three-quarters"></i>  
                        </div>    
                        ${batteryLevel}%
                   </div>
                </div>`;
    
    var marker = new google.maps.Marker({
        map:map,
        position:latlng,
        label: index.toString(),
        icon: 'https://i.imgur.com/v67B4tD.png'
    });
    
    markers.push(marker);
    console.log(marker.label);

    google.maps.event.addListener(marker , 'mouseover', function(){
        infoWindow.setContent(html);
        infoWindow.open(map, marker);
    });
    google.maps.event.addListener(marker , 'mouseout', function(){
        infoWindow.close();
    });

    google.maps.event.addListener(marker , 'click', function(){
        var content = `DroneID: ${droneId}<br>
                       Drone Name: ${name}<br>
                       Battery Level: ${batteryLevel}<br>
                       GPS Accuracy: ${accuracy}<br>
                       Signal Strength: ${signalStrength}<br>`;
        document.querySelector('.drone-static-info').innerHTML=content;
        document.querySelector('.drone-controller').style.display='flex';

    //  


         //close button for closing the contol panel
                document.querySelector('#close-control-btn').addEventListener('click', closeController);
            
                
                var flightPath = new google.maps.Polyline({
                                    geodesic: true,
                                    strokeColor: '#0000FF',
                                    strokeOpacity: 1.0,
                                    strokeWeight: 2
                                });
                    
                flightPath.setMap(map);
               
                var vertex = new google.maps.Marker({
                    map:map,
                });

                var listener1;
                var interval = null;
                var path = [];

                document.querySelector('#add-path-btn').onclick = function () {
                    

                    path = flightPath.getPath();
                    path.push(latlng);
                    
                    let i = 2;

                    
                      listener1 = map.addListener('click', function(mapsMouseEvent) {
                            
                            //Get the lat lng of the click event     
                            
                            // placing the marker
                            vertex.setPosition(mapsMouseEvent.latLng);
                            
                            //drawing polyline through MVC array
                            path.push(mapsMouseEvent.latLng);

                            i = i+1;
                            console.log(i);

                            });

                           
                            
                           

                };

                document.querySelector('#terminate-path-btn').onclick = function () {
                    pathAr.push(
                        {
                            Id: droneId,
                            pathArray: path      
                        }   
                    );
                    
                   
                    // to shut down click listener on map
                    google.maps.event.clearInstanceListeners(map);

                    // close the controller
                    document.querySelector('.drone-controller').style.display='None';
                    
                    // interval close
                    // clearInterval(interval);

                    flightPath.setMap(null);
                    vertex.setMap(null);

                    alert("Path successfully added for drone");
                    console.log(pathAr);
                    
                };




                // document.getElementById('#delete-vertex-btn').onclick = function() {
                    
                    
                //     google.maps.event.addListener(flightPath, 'rightclick', function(e) {
                //         // Check if click was on a vertex control point
                //         if (e.vertex == undefined) {
                //           return;
                //         }
                //         deleteMenu.open(map, flightPath.getPath(), e.vertex);
                //       });
                // };

                
    });
}






function closeController(){
    document.querySelector('.drone-controller').style.display='None';
}


