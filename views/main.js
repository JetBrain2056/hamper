///const ctx = document.getElementById('myChart');

var i = 0;
let arr = [];

var watch         = document.getElementById("digital_watch");
var ws_status     = document.getElementById('server');  
var modbus_status = document.getElementById('modbus_status');
var T1            = document.getElementById('t1');
var T2            = document.getElementById('t2');
var T3            = document.getElementById('t3');
var T4            = document.getElementById('t4');
var T5            = document.getElementById('t5');
var P1            = document.getElementById('p1');
var P2            = document.getElementById('p2');
var P3            = document.getElementById('p3');
var T6            = document.getElementById('t6');

var radio_ON  = document.getElementById('ID_ON');
var radio_OFF = document.getElementById('ID_OFF');
radio_ON.addEventListener('click', onoff_changed);
radio_OFF.addEventListener('click', onoff_changed);
var GPIO      = document.getElementById('GPIO');
var RB_READY  = document.getElementById('RB_READY');

var switch_btn1 = document.getElementById("btnPower1");
//var switch_btn2 = document.getElementById("btnPower2");
var switch_btn3 = document.getElementById("btnPower3");
var switch_btn4 = document.getElementById("btnPower4");
switch_btn1.addEventListener('click', handleClickEvent);
//switch_btn2.addEventListener('click', handleClickEvent);
switch_btn3.addEventListener('click', handleClickEvent);
switch_btn4.addEventListener('click', handleClickEvent);

var RELAY2     = document.getElementById('RELAY2'); //барабан
//var RELAY      = document.getElementById('RELAY');
var RELAY0     = document.getElementById('RELAY0'); //охлаждение зерна
var RELAY1     = document.getElementById('RELAY1'); //перемешивание зерна

var ten_switch1_status = document.getElementById('MOC2');
var ten_power1         = document.getElementById('ten_power1');
var ten_power1_output  = document.getElementById('ten1out');
var power_MOC2         = document.getElementById('power_MOC2'); 
ten_power1.addEventListener('change', ten1_slider_changed);  

var ten_switch2_status = document.getElementById('MOC3');
var ten_power2         = document.getElementById('ten_power2');
var ten_power2_output  = document.getElementById('ten2out');  
var power_MOC3         = document.getElementById('power_MOC3'); 
ten_power2.addEventListener('change', ten2_slider_changed);   

var fan_switch1_status = document.getElementById('MOC1');  
var fan_power1        = document.getElementById('fan1'); 
var fan_power1_output = document.getElementById('fan1out');  
var power_MOC1         = document.getElementById('power_MOC1'); 
fan_power1.addEventListener('change', fan1_slider_changed);   

var fan_switch2_status = document.getElementById('MOC0');  
var fan_power2         = document.getElementById('fan2');
var fan_power2_output  = document.getElementById('fan2out');   
var power_MOC0         = document.getElementById('power_MOC0');   
fan_power2.addEventListener('change', fan2_slider_changed);   

var Socket;

function init() {
    Socket = new WebSocket('ws://' + window.location.hostname + ':3001/');
    Socket.onmessage = function(event) {
        processCommand(event);
    };          
}    

setInterval(()=> {
    if (Socket.readyState ===1) {ws_status.innerHTML = 'OPEN...';}
    else server.innerHTML = 'CLOSED!';
},1000);
 
function onoff_changed() {
    var onoff_selected = 0;
    if (radio_ON.checked == true) {onoff_selected = 1;} 
    else if (radio_OFF.checked == true)  {onoff_selected = 0;} 
    console.log(onoff_selected);
    var msg = { type: "onoff_Power", value: onoff_selected};   
    Socket.send(JSON.stringify(msg));              
}

function handleClickEvent(evt) {
    var onoff_selected = 0;    
    console.log(evt.path[1].getAttribute("aria-checked"));
    if (evt.path[1].getAttribute("aria-checked") === "false") {onoff_selected = 0;} else {onoff_selected = 1;}
    console.log(evt.path[1].id, onoff_selected);
    var msg = {type: evt.path[1].id, value: onoff_selected};   
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

function fan1_slider_changed () {
    var fan1_intensity = fan_power1.value;
    console.log(fan1_intensity);
    var msg = { type: 'fan1_intensity', value: fan1_intensity };
    Socket.send(JSON.stringify(msg)); 
}

function fan2_slider_changed () {
    var fan2_intensity = fan_power2.value;
    console.log(fan2_intensity);
    var msg = { type: 'fan2_intensity', value: fan2_intensity };
    Socket.send(JSON.stringify(msg)); 
}

function processCommand(event) {
    var obj = JSON.parse(event.data);
    var type = obj.type;

    if (type.localeCompare('Watch') == 0) { 
        var time = obj.value; 
        //console.log('time : ', time);   
        watch.innerHTML = time;
    }
    else if (type.localeCompare('sensors') == 0) { 
        var sensors_arr = obj.value; 
        console.log('sensors: ', sensors_arr); 
        RB_READY.innerHTML = sensors_arr[3]; //REG_INPUT_RB_READY
        T1.innerHTML = sensors_arr[4]/10;       //REG_INPUT_DEGREE_CH1
        T2.innerHTML = sensors_arr[5]/10;       //REG_INPUT_DEGREE_CH2
        T3.innerHTML = sensors_arr[6]/10;       //REG_INPUT_DEGREE_CH3
        T4.innerHTML = sensors_arr[7]/10;       //REG_INPUT_DEGREE_CH4
        T5.innerHTML = sensors_arr[8]/10;       //REG_INPUT_DEGREE_CH5       
        P1.innerHTML = sensors_arr[21];         //REG_INPUT_PRESSURE_VOLTAGE
        P2.innerHTML = sensors_arr[22];         //REG_INPUT_PRESSURE_OFFSET
        P3.innerHTML = sensors_arr[23]/10;      //REG_INPUT_PRESSURE_KPA
        T6.innerHTML = sensors_arr[24]/10;      //REG_INPUT_PRESSURE_DEGREE
        ten_switch1_status.innerHTML = sensors_arr[16]; //REG_INPUT_MOC2_STATUS
        ten_switch2_status.innerHTML = sensors_arr[17]; //REG_INPUT_MOC3_STATUS
        fan_switch1_status.innerHTML = sensors_arr[15]; //REG_INPUT_MOC1_STATUS        
        fan_switch2_status.innerHTML = sensors_arr[14]; //REG_INPUT_MOC0_STATUS
        
        //setInterval(()=>{
            arr[i] =  sensors_arr[8]/10;
            myChart.data.datasets[0].data = arr;
            myChart.update();
            i = i + 1;
        //},1000)
    }
    else if (type.localeCompare('sensors2') == 0) { 
        var sensors2_arr = obj.value; 
        console.log('sensors2: ', sensors2_arr);      
        RELAY2.innerHTML = sensors2_arr[10]; //REG_HOLDING_RELAY2_CMD    
        RELAY0.innerHTML = sensors2_arr[8];  //REG_HOLDING_RELAY0_CMD    
        RELAY1.innerHTML = sensors2_arr[9];  //REG_HOLDING_RELAY1_CMD    

        //fan_switch2_status.innerHTML = sensors_arr[0]; //REG_HOLDING_MOC0_CMD
        power_MOC0.innerHTML         = sensors2_arr[1]; //REG_HOLDING_MOC0_POWER
        power_MOC1.innerHTML         = sensors2_arr[3]; //REG_HOLDING_MOC1_POWER
        power_MOC2.innerHTML         = sensors2_arr[5]; //REG_HOLDING_MOC2_POWER
        power_MOC3.innerHTML         = sensors2_arr[7]; //REG_HOLDING_MOC3_POWER
    } 
    else if (type.localeCompare('onoff_Power') == 0) { 
        var onoff_selected = parseInt(obj.value); 
        console.log('onoff_Power: ',onoff_selected); 
        if      (onoff_selected == 1) { radio_ON.checked = true;}
        else if (onoff_selected == 0) { radio_OFF.checked = true;}        
    } 
    else if (type.localeCompare('btnPower1') == 0) { 
        var onoff_selected = parseInt(obj.value); 
        console.log('btnPower1: ',onoff_selected);                 
        if (onoff_selected == 1) {switch_btn1.setAttribute("aria-checked", "false");} 
        else {switch_btn1.setAttribute("aria-checked", "true");}   
    } 
    // else if (type.localeCompare('btnPower2') == 0) { 
    //     var onoff_selected = parseInt(obj.value); 
    //     console.log('btnPower2: ',onoff_selected);                 
    //     if (onoff_selected == 1) {switch_btn2.setAttribute("aria-checked", "false");} 
    //     else {switch_btn2.setAttribute("aria-checked", "true");}   
    // } 
    else if (type.localeCompare('btnPower3') == 0) { 
        var onoff_selected = parseInt(obj.value); 
        console.log('btnPower3: ',onoff_selected);                 
        if (onoff_selected == 1) {switch_btn3.setAttribute("aria-checked", "false");} 
        else {switch_btn3.setAttribute("aria-checked", "true");}   
    } 
    else if (type.localeCompare('btnPower4') == 0) { 
        var onoff_selected = parseInt(obj.value); 
        console.log('btnPower4: ',onoff_selected);                 
        if (onoff_selected == 1) {switch_btn4.setAttribute("aria-checked", "false");} 
        else {switch_btn4.setAttribute("aria-checked", "true");}   
    } 
    else if (type.localeCompare("ten1_intensity") == 0) { 
        var ten1_intensity = parseInt(obj.value); 
        console.log(ten1_intensity); 
        ten_power1.value = ten1_intensity; 
        ten_power1_output.innerHTML = ten1_intensity;        
    }
    else if (type.localeCompare("ten2_intensity") == 0) { 
        var ten2_intensity = parseInt(obj.value); 
        console.log(ten2_intensity); 
        ten_power2.value = ten2_intensity; 
        ten_power2_output.innerHTML = ten2_intensity;        
    }
    else if (type.localeCompare("fan1_intensity") == 0) { 
        var fan1_intensity = parseInt(obj.value); 
        console.log(fan1_intensity); 
        fan_power1.value = fan1_intensity; 
        fan_power1_output.innerHTML = fan1_intensity;        
    }
    else if (type.localeCompare("fan2_intensity") == 0) { 
        var fan2_intensity = parseInt(obj.value); 
        console.log(fan2_intensity); 
        fan_power2.value = fan2_intensity; 
        fan_power2_output.innerHTML = fan2_intensity;        
    }
    else if (type.localeCompare("modbus") == 0) { 
         var modbus = obj.value; 
         console.log(modbus); 
         modbus_status.innerHTML = modbus;
    }
    else if (type.localeCompare("GPIO_status") == 0) { 
        var GPIO_status = parseInt(obj.value); 
        console.log(GPIO_status); 
        GPIO.innerHTML = GPIO_status;
   }
}

var array_length = 780;
var xValues = [];       
for (let i = 0; i < array_length; i++) {
  xValues[i] = i;
}
var yValues = [];

const myChart = new Chart("myChart", {
  type: "line",
  data: {
    labels: xValues,
    datasets: [{
      label: '# T5, C',
      fill: false,
      lineTension: 0,
      backgroundColor: "rgba(0,0,255,1.0)",
      borderColor: "rgba(0,0,255,0.1)",
      data: yValues
    }]
  },
  options: {
    legend: {display: true},
    high: 320,    
    xAxes: {    
            barPercentage: 0.5,                  
            showGrid: true,
            showLabel: true,  
            onlyInteger: true,
            ticks: {
                type: 'time',                    
                min: 0,
                max: 780, 
                stepSize: 30
            }                         
        },        
    yAxes: {
            barPercentage: 0.5,
            gridLines: {
                color: "rgba(255, 255, 255, 0.5)",
                drawBorder: false,
                lineWidth: 1,
            },
            ticks:{
                padding: 10,
                min: 10,
                max: 320,                
                stepSize: 10
            }
            }
  }
});

window.onload = function(event) {init();}