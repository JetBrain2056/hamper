// requirements
const express            = require('express');
const { router }         = require('./routers/router.js');
const ModbusRTU          = require('modbus-serial');
const WebSocket          = require('ws');
const Gpio               = require('onoff').Gpio;

const port   = 3000;
const host   = '0.0.0.0';
const server = express();
const ws     = new WebSocket.Server({ port: 3001 });

server.set('view engine', 'twig');
server.set('view options', {layout: false});
server.set("twig options", {allow_async: true, strict_variables: false});
server.use(express.static('./views'));
server.use(express.urlencoded({ extended: false }));
server.use(router);
server.listen(port, host, () => {
  console.log(`Server is running on http://${host}:${port}`);
});

var onoff_selected = 0;
var ten1_intensity = 0; 
var ten2_intensity = 0;
var switchPower    = 0;
var fan1_intensity = 0;
var fan2_intensity = 0;

var GPIO = new Gpio(17, 'out'); //GPIO17
console.log("GPIO.readSync:", GPIO.readSync());
GPIO.writeSync(1); //переводим в состояние отключено управление
console.log("GPIO.readSync:", GPIO.readSync());

//ModbusRTU
const client = new ModbusRTU();
const networkErrors = ["ESOCKETTIMEDOUT", "ETIMEDOUT", "ECONNRESET", "ECONNREFUSED", "EHOSTUNREACH"];
// open connection to a serial port
client.connectRTUBuffered("/dev/ttyS0", { baudRate: 38400 })
    .then(setClient)
    .then(function() {
        console.log("Connected modbus..."); })
    .catch(function(e) {
        if(e.errno) {
            if(networkErrors.includes(e.errno)) {
                console.log("we have to reconnect");
            }
        }
        console.log(e.message); });

function setClient() {      
    client.setID(1);        // set the client's unit id
    client.setTimeout(500); // set a timout for requests default is null (no timeout)

    // run program
    //getInputRegisters();  
    //getHoldingRegisters();    
}

function close() {
  client.close();
  console.log('Close modbus connection!');
}

var i = 0;
var interval = 1000; 
let sensors_data = []; 
let sensors_data2 = []; 
let clients = []; 
ws.on("connection", (socket) => {

  var id = Math.random();
  clients[id] = socket;
  console.log("Client connection id: ", id);

  sendJson(clients, "onoff_Power", onoff_selected); 
  sendJson(clients, "GPIO_status", GPIO.readSync()); 
  sendJson(clients, "btnPower1", switchPower); 
  //sendJson(clients, "btnPower2", switchPower); 
  sendJson(clients, "btnPower3", switchPower); 
  sendJson(clients, "btnPower4", switchPower); 
  sendJson(clients, "ten1_intensity", ten1_intensity); 
  sendJson(clients, "ten2_intensity", ten2_intensity); 
  sendJson(clients, "fan1_intensity", fan1_intensity); 
  sendJson(clients, "fan2_intensity", fan2_intensity);   
  setInterval(()=>{
    var date = new Date();
    var hours   = date.getHours();
    var minutes = date.getMinutes();
    var seconds = date.getSeconds();
    if (hours < 10) hours = "0" + hours;
    if (minutes < 10) minutes = "0" + minutes;
    if (seconds < 10) seconds = "0" + seconds;    
    sendJson(clients, "Watch", hours + ":" + minutes + ":" + seconds);   
  },1000);
   
  setInterval(()=>{
    // read the 12 registers starting at address 0
    client.readHoldingRegisters(0, 12)
      .then(function(d) {
        console.log("Receive: ", d.data); 
        sendJson(clients, "sensors2", d.data);    
      })
      .catch(function(e) {
        console.log('error: ', e.message);
        sensors_data2 = [0,0,0,0,0,0,0,0,0,0,0,0]; //эмулятор
        console.log(new Date(), sensors_data2);
        sendJson(clients, "sensors2", sensors_data2);  
      })  
  //},1500); 
    
  //client.setTimeout(2000);
  //setInterval(()=>{},2000);

  //setInterval(()=>{  
    client.readInputRegisters(0, 25)
      .then(function(d) {
        console.log("Receive: ", d.data);          
        sendJson(clients, "sensors", d.data);  
        sendJson(clients, "modbus", 'Connected...');  
      })
      .catch(function(e) {
        console.log('error: ', e.message);	 
        sensors_data = [1,2,3,4,5,6,7,8,i,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25]; //эмулятор
        console.log(new Date(), sensors_data);
        sendJson(clients, "sensors", sensors_data);  
        sendJson(clients, "modbus", e.message);  
      })        

    i = i + 1;
  }, interval); 

  // receive a message from the client
  socket.on("message", (data) => {
    const packet = JSON.parse(data);
    //console.log(packet);
    switch (packet.type) { 
      case "onoff_Power":
        console.log(packet.type, packet.value);
        onoff_selected = packet.value;
        if      (onoff_selected == 1) {GPIO.writeSync(0);}
        else if (onoff_selected == 0) {GPIO.writeSync(1);}  
        console.log("onoff_Power:", onoff_selected);
        sendJson(clients, "onoff_Power", onoff_selected);            
        console.log("GPIO.readSync:", GPIO.readSync());        
        sendJson(clients, "GPIO_status", GPIO.readSync());            
        break;         
      case "btnPower1":
        console.log(packet.type, packet.value);  
        switchPower = packet.value;        
        client.writeRegisters(10, [switchPower])
          .then(console.log)
          .catch(console.log('error writeRegister 10!'));
        sendJson(clients, "btnPower1", switchPower);        
        break;       
      // case "btnPower2":
      //   console.log(packet.type, packet.value);         
      //   switchPower = packet.value;        
      //   //client.writeRegister(8, switchPower);       
      //   sendJson(clients, "btnPower2", switchPower);  
      //   break;        
      case "btnPower3":
        console.log(packet.type, packet.value);          
        switchPower = packet.value;        
        if (switchPower == 1) {
          client.writeRegisters(8, [0x0001])
            .then(console.log)            
            .catch(console.log('error writeRegisters 8!'));
        } else {client.writeRegisters(9, [0x0000]);}       
        sendJson(clients, "btnPower3", switchPower); 
        break;        
      case "btnPower4":
        console.log(packet.type, packet.value);          
        switchPower = packet.value;        
        client.writeRegisters(8, [switchPower])
          .then(console.log)
          .catch(console.log('error writeRegisters 9!'));       
        sendJson(clients, "btnPower4", switchPower);    
        break;      
      case "ten1_intensity":
        console.log(packet.type, packet.value);        
        ten1_intensity = packet.value;        
        //analogWrite(GPIO, map(ten1_intensity, 0, 100, 0, 255));        
        sendJson(clients, "ten1_intensity", ten1_intensity);        
        break;                       
      case "ten2_intensity":
        console.log(packet.type, packet.value);
        ten2_intensity = packet.value;        
        //analogWrite(GPIO, map(ten1_intensity, 0, 100, 0, 255));        
        sendJson(clients, "ten2_intensity", ten2_intensity);        
        break;     
      case "fan1_intensity":
        console.log(packet.type, packet.value);
        fan1_intensity = packet.value;        
        //analogWrite(GPIO, map(ten1_intensity, 0, 100, 0, 255));        
        sendJson(clients, "fan1_intensity", fan1_intensity);        
        break; 
      case "fan2_intensity":
        console.log(packet.type, packet.value);
        fan2_intensity = packet.value;        
        //analogWrite(GPIO, map(ten1_intensity, 0, 100, 0, 255));        
        sendJson(clients, "fan2_intensity", fan2_intensity);        
        break;        
    }      
  });

  socket.on('close', function() {
    console.log('Connection close ' + id);
    delete clients[id];
  });
});

function sendJson(clients, l_type, l_value) {
  // send a message to the client
  for (var key in clients) {
    //clients[key].send(message);    
    clients[key].send(JSON.stringify({
      type: l_type,
      value: l_value
    }));
  }
}
 
process.on('SIGINT', function () { //on ctrl+c
  GPIO.writeSync(1); // Turn off
  GPIO.unexport();   // Unexport LED GPIO to free resources
  close();           // Close modbus
  process.exit();    // exit completely
});