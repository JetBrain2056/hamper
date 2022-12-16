// requirements
const express            = require('express');
const { router }         = require('./routers/router.js');
const ModbusRTU          = require('modbus-serial');
const WebSocket          = require('ws');
const Gpio               = require('onoff').Gpio;

const port   = 3000;
const host   = '0.0.0.0';
const server = express();

var onoff_selected = 0;
var ten1_intensity = 0;
var ten2_intensity = 0;
var ten1_switch    = 0;
var ten2_switch    = 0;

var GPIO = new Gpio(17, 'out'); //GPIO17

const ws = new WebSocket.Server({ port: 3001 });

let clients = [];

ws.on("connection", (socket) => {

  var id = Math.random();
  clients[id] = socket;
  console.log("Client connection id:" + id);

  sendJson(clients, "LED_selected", GPIO.readSync()); 
  sendJson(clients, "ten1_intensity", ten1_intensity); 
  sendJson(clients, "ten2_intensity", ten2_intensity); 

  // Connection opened
  socket.on('open', ()=> {
    console.log('Connection open...');    
    //sendJson(clients, "LED_selected", onoff_selected); 
    //sendJson(clients, "ten1_intensity", ten1_intensity); 
  });

  // receive a message from the client
  socket.on("message", (data) => {
    const packet = JSON.parse(data);
    console.log(packet);
    switch (packet.type) {
      case "LED_selected":
        console.log(packet.type);
        console.log(packet.value);
        onoff_selected = packet.value;
        if (onoff_selected == 1) {GPIO.writeSync(1);}
        else if (onoff_selected == 0) {GPIO.writeSync(0);}
        onoff_selected = GPIO.readSync();
        sendJson(clients, "LED_selected", onoff_selected);
        break;
      case "ten1_intensity":
        console.log(packet.type);
        console.log(packet.value);
        ten1_intensity = packet.value;        
        //analogWrite(GPIO, map(ten1_intensity, 0, 100, 0, 255));
        //analogRead();
        sendJson(clients, "ten1_intensity", ten1_intensity);        
        break;                       
      case "ten2_intensity":
        console.log(packet.type);
        console.log(packet.value);
        ten2_intensity = packet.value;        
        //analogWrite(GPIO, map(ten1_intensity, 0, 100, 0, 255));
        //analogRead();
        sendJson(clients, "ten2_intensity", ten2_intensity);        
        break;   
      case "ten1_switch":
        console.log(packet.type);
        console.log(packet.value);
        ten1_switch = packet.value;        
        //analogWrite(GPIO, map(ten1_intensity, 0, 100, 0, 255));
        //analogRead();
        sendJson(clients, "ten1_switch", ten1_switch);        
        break;       
    }

    //var interval = 10000; 
    let sensors_data = [];
    let sensors_arr  = [];
    let status_arr   = [];
    //setInterval(function() {
      //sensors_data = getInputRegisters();

      client.readInputRegisters(0, 25)
        .then(function(d) {
          console.log("Receive: ", d.data);
          // const floatA = d.buffer.readFloatBE(0);
          // const floatB = d.buffer.readFloatBE(1);
          // const floatC = d.buffer.readFloatBE(2);
          // console.log("Receive: ", floatA, floatB, floatC); 
          sendJson(clients, "sensors", d.data);  
        })
        .catch(function(e) {
          console.log('error: ', e.message);
          sensors_data = [0,0,0,0,1,2,3,4,Math.random(),6,7,8,9]; //эмулятор
          sendJson(clients, "sensors", sensors_data);  
        })     

      // read the 12 registers starting at address 0
      client.readHoldingRegisters(0, 12)
        .then(function(d) {
            console.log("Receive: ", d.data); 
          })
        .catch(function(e) {
          console.log('error: ', e.message);})   

      status_arr[0]  = GPIO.readSync();
      sendJson(clients, "status", status_arr); 
    //}, interval);    

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

server.set('view engine', 'twig');
server.set('view options', {layout: false});

// This section is optional and used to configure twig.
server.set("twig options", {
  allow_async: true, // Allow asynchronous compiling
  strict_variables: false
});

server.use(express.static('./views'));
server.use(express.urlencoded({ extended: false }));
server.use(router);

server.listen(port, host, () => {
  console.log(`Server is running on http://${host}:${port}`);
});
 
const client = new ModbusRTU();

const networkErrors = ["ESOCKETTIMEDOUT", "ETIMEDOUT", "ECONNRESET", "ECONNREFUSED", "EHOSTUNREACH"];

// open connection to a serial port
client.connectRTUBuffered("/dev/ttyS0", { baudRate: 38400 })
//client.connectTCP("127.0.0.1", { port: 8502 })
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
    // set the client's unit id
    // set a timout for requests default is null (no timeout)
    client.setID(1);
    client.setTimeout(1000); 

    // run program
    //getInputRegisters();  
    //getHoldingRegisters();    
}

function getHoldingRegisters() {
    // read the 12 registers starting at address 0
    client.readHoldingRegisters(0, 12)
        .then(function(d) {console.log("Receive: ", d.data);})
        .catch(function(e) {console.log('error: ', e.message);})          
};
        
function getInputRegisters() {
    client.readInputRegisters(0, 25)
      .then(function(d) {
          console.log("Receive: ", d.data);
          // const floatA = d.buffer.readFloatBE(0);
          // const floatB = d.buffer.readFloatBE(1);
          // const floatC = d.buffer.readFloatBE(2);
          // console.log("Receive: ", floatA, floatB, floatC); 
      })
      .catch(function(e) {console.log('error: ', e.message);})          
};

function close() {
    client.close();
    console.log('Close modbus connection!');
}

process.on('SIGINT', function () { //on ctrl+c
  GPIO.writeSync(1); // Turn LED on
  GPIO.unexport();   // Unexport LED GPIO to free resources
  close();           //Close modbus
  process.exit();    //exit completely
});