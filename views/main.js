function digitalWatch() {
    var date = new Date();
    var hours   = date.getHours();
    var minutes = date.getMinutes();
    var seconds = date.getSeconds();
    if (hours < 10) hours = "0" + hours;
    if (minutes < 10) minutes = "0" + minutes;
    if (seconds < 10) seconds = "0" + seconds;
    document.getElementById("digital_watch").innerHTML = hours + ":" + minutes + ":" + seconds;
    setTimeout("digitalWatch()", 1000);
    setTimeout("serverStatus()", 2000);    
}
digitalWatch();

var T1       = document.getElementById('t1');
var T2       = document.getElementById('t2');
var T3       = document.getElementById('t3');
var T4       = document.getElementById('t4');
var T5       = document.getElementById('t5');
var P1       = document.getElementById('p1');
var P2       = document.getElementById('p2');
var P3       = document.getElementById('p3');
var T6       = document.getElementById('t6');

var radio_ON  = document.getElementById('ID_ON');
radio_ON.addEventListener('click', onoff_changed);
var radio_OFF = document.getElementById('ID_OFF');
radio_OFF.addEventListener('click', onoff_changed);

//var ten_switch1       = document.getElementById('switch1');
//ten_switch1.addEventListener('change', switch_1);  
var ten_switch1_status = document.getElementById('MOC2');
var ten_power1        = document.getElementById('ten_power1');
var ten_power1_output = document.getElementById('ten1out');
ten_power1.addEventListener('change', ten1_slider_changed);  

//var ten_switch2       = document.getElementById('switch2');
var ten_switch2_stutus = document.getElementById('MOC3');
var ten_power2        = document.getElementById('ten_power2');
var ten_power2_output = document.getElementById('ten2out');  
ten_power2.addEventListener('change', ten2_slider_changed);   

var fan_switch1       = document.getElementById('fanswitch1');
var fan_switch1_status = document.getElementById('MOC1');  
var fan_power1        = document.getElementById('fan1'); 
var fan_power1_output = document.getElementById('fan1out');  

var fan_switch2       = document.getElementById('fanswitch2');
var fan_switch2_status = document.getElementById('MOC0');  
var fan_power2        = document.getElementById('fan2');
var fan_power2_output = document.getElementById('fan2out');   

var Socket;

function init() {
    Socket = new WebSocket('ws://' + window.location.hostname + ':3001/');
    Socket.onmessage = function(event) {
        processCommand(event);
    };                     
}    

function serverStatus() {     
    Socket.send(Socket.readyState);  
    var server = document.getElementById('server');     
    if (Socket.readyState ===1) {server.innerHTML = 'OPEN...';}
    else server.innerHTML = 'CLOSED!';
}

function sensors() {
     var sensor_value = {};
     sensor_value[0] = 0;
     sensor_value[1] = 1;
     console.log(sensor_value);
     var msg = { type: "sensors", value: sensor_value};   
     Socket.send(JSON.stringify(msg));   
}

function onoff_changed() {
    var onoff_selected = 0;
    if (radio_ON.checked == true) {onoff_selected = 1;} 
    else if (radio_OFF.checked == true)  {onoff_selected = 0;} 
    console.log(onoff_selected);
    var msg = { type: "LED_selected", value: onoff_selected};   
    Socket.send(JSON.stringify(msg));              
}

function ten1_slider_changed () {
     var ten1_intensity = ten_power1.value;
     console.log(ten1_intensity);
     var msg = { type: 'ten1_intensity', value: ten1_intensity };
     Socket.send(JSON.stringify(msg)); 
}

function ten2_slider_changed () {
    var ten2_intensity = ten_power2.value;
    console.log(ten2_intensity);
    var msg = { type: 'ten2_intensity', value: ten2_intensity };
    Socket.send(JSON.stringify(msg)); 
}

function processCommand(event) {
    var obj = JSON.parse(event.data);
    var type = obj.type;

    if (type.localeCompare('sensors') == 0) { 
        var sensors_arr = obj.value; 
        console.log('sensors: ', sensors_arr); 
        T1.innerHTML = sensors_arr[4]; //REG_INPUT_DEGREE_CH1
        T2.innerHTML = sensors_arr[5]; //REG_INPUT_DEGREE_CH2
        T3.innerHTML = sensors_arr[6]; //REG_INPUT_DEGREE_CH3
        T4.innerHTML = sensors_arr[7]; //REG_INPUT_DEGREE_CH4
        T5.innerHTML = sensors_arr[8]; //REG_INPUT_DEGREE_CH5       
        P1.innerHTML = sensors_arr[21]; //REG_INPUT_PRESSURE_VOLTAGE
        P2.innerHTML = sensors_arr[22];
        P3.innerHTML = sensors_arr[23];
        T6.innerHTML = sensors_arr[24];
        ten_switch1_status.innerHTML = sensors_arr[16]; //REG_INPUT_MOC2_STATUS
        ten_switch2_status.innerHTML = sensors_arr[17]; //REG_INPUT_MOC3_STATUS
    }
    else if (type.localeCompare('LED_selected') == 0) { 
        var onoff_selected = parseInt(obj.value); 
        console.log('onoff: ',onoff_selected); 
        if      (onoff_selected == 1) { document.getElementById('ID_ON').checked = true; document.getElementById('RB_READY').innerHTML = onoff_selected;}
        else if (onoff_selected == 0) { document.getElementById('ID_OFF').checked = true; document.getElementById('RB_READY').innerHTML = onoff_selected;}        
    } 
    else if (type.localeCompare("ten1_intensity") == 0) { 
        var ten1_intensity = parseInt(obj.value); 
        console.log(ten1_intensity); 
        ten_power1.value = ten1_intensity; 
        ten_power1_output.innerHTML = ten1_intensity;
        //ten_switch1_status.innerHTML = 0;
    }
    else if (type.localeCompare("ten_switch1_status") == 0) { 
        //var ten_switch1_status = parseInt(obj.value); 
        //console.log(ten_switch1_status); 
        //ten_switch1_status.innerHTML = ten_switch1_status;
    }
    else if (type.localeCompare("ten2_intensity") == 0) { 
        var ten2_intensity = parseInt(obj.value); 
        console.log(ten2_intensity); 
        ten_power2.value = ten2_intensity; 
        ten_power2_output.innerHTML = ten2_intensity;
        //ten_switch1_status.innerHTML = 0;
    }
    else if (type.localeCompare("ten_switch2_status") == 0) { 
        // var ten_switch2_status = parseInt(obj.value); 
        // console.log(ten_switch2_status); 
        // ten_switch2_status.innerHTML = ten_switch2_status;
    }
}
window.onload = function(event) {init();}