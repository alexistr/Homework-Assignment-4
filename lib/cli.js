/*
* CLI related tasks
*
*/

// Dependancies
const readline = require('readline');
const util = require('util');
const debug = util.debuglog('cli');
const events = require('events');
class _events extends events{};
const e = new _events();
const menu = require('./menu');
const v8 = require('v8');
const _data = require('./data');
const helpers = require('./helpers');

// Instantiate the CLI module object
let cli = {};

//Input handlers
e.on('man',(str)=>{
  cli.responders.help();
});

e.on('help',(str)=>{
  cli.responders.help();
});

e.on('exit',(str)=>{
  cli.responders.exit();
});

e.on('menu',(str)=>{
  cli.responders.menu();
});

e.on('list orders',(str)=>{
  cli.responders.listOrders();
});

e.on('more order info',(str)=>{
  cli.responders.moreOrderInfo(str);
});
e.on('list users',(str)=>{
  cli.responders.listUsers(str);
});
e.on('more user info',(str)=>{
  cli.responders.moreUserInfo(str);
});


//Responders object
cli.responders = {};

// Help / man
cli.responders.help = () => {
  let commands = {
    'exit' : 'Kill the CLI (and the rest of the application)',
    'man' : 'Show this help page',
    'help' : 'Alias of the "man" command',
    'menu' : 'View all the current menu items',
    'list orders' : 'View all the recent orders in the system (orders placed in the last 24 hours)',
    'more order info --{orderId}' : 'Show details of specific order',
    'list users' : 'View all the users who have signed up in the last 24 hours',
    'more user info --{email}' : 'Show the details of a specific user'
  };

  // Show a header for the help page that is as wide as the screen
  cli.horizontalLine();
  cli.centered('CLI MANUAL');
  cli.horizontalLine();
  cli.verticalSpace(2);

  //Show each command, followed by its explaination, in white and yellow respectively
  for(let key in commands) {
    if(commands.hasOwnProperty(key)) {
      let value = commands[key];
      let line = '\x1b[33m'+key+'\x1b[0m';
      let padding = 60 - line.length;
      for(let i=0;i< padding; i++){
        line+=' ';
      }
      line+=value;
      console.log(line);
      cli.verticalSpace(1);
    }
  }
  cli.verticalSpace(1);
  //End with an other horizontal line
  cli.horizontalLine();
};

// create a vertical verticalSpace
cli.verticalSpace = (lines) => {
  lines = typeof(lines)=='number' && lines>0 ? lines : 1;
  for(let i = 0;i < lines;i++) {
    console.log('');
  }
};

// Create a horizontal lne accross the screen
cli.horizontalLine = () => {
  // Get the avalaible screensize
  let width = process.stdout.columns;
  let line = '';
  for(let i=0;i<width;i++) {
    line+='-';
  }
  console.log(line);
};

//Create centered texte on the screensize
cli.centered = (str) => {
  str = typeof(str)=='string' && str.trim().length > 0 ? str.trim() : '';
  // Get the avalaible screensize
  let width = process.stdout.columns;
  //calculate the left padding
  let leftPadding = Math.floor((width - str.length)/2);
  // Put in left padding spaces before the string itself
  let line = '';
  for(let i=0;i<leftPadding;i++) {
    line+=' ';
  }
  line+=str;
  console.log(line);
};
// exit
cli.responders.exit = () => {
  process.exit(0);
};

// menu
cli.responders.menu = () => {
  // Show a header for the stats page that is as wide as the screen
  cli.horizontalLine();
  cli.centered('MENU');
  cli.horizontalLine();
  cli.verticalSpace(2);

  // Build a left padding string to center the menu
  let width = process.stdout.columns;
  leftPadding = Math.floor((width - 25) /2) > 0 ? Math.floor((width - 25) /2) : 0;
  leftPaddingStr = '';
  for(let i=0;i<leftPadding;i++){
    leftPaddingStr+=' ';
  }

  //Show each pizza name and price
  menu.forEach((item)=>{
    let line = '\x1b[33m'+item.pizza+'\x1b[0m';
    let padding = 25 - line.length;
    for(let i=0;i< padding; i++){
      line+=' ';
    }
    line+=item.price+' TL';
    console.log(leftPaddingStr+line);
  });
  cli.verticalSpace(1);
  cli.horizontalLine();
};

// list orders
cli.responders.listOrders = () => {
_data.list('orders',(err,orderIds) => {
  if(!err && orderIds && orderIds.length > 0) {
    cli.verticalSpace();
    orderIds.forEach((orderId) => {
      _data.read('orders',orderId,(err,orderData) => {
        if(!err && orderData) {
            //keep the orders aged less than 24h only
            if(orderData.timestamp && Date.now() - orderData.timestamp < (60 * 60 * 24) ) {
          let line = `Id: ${orderData.id} Amount: ${orderData.amount/100} TL`;
          console.log(line);
          cli.verticalSpace();
          }
        }
      });
    });
  }
});
};

// more order info
cli.responders.moreOrderInfo = (str) => {
  // Get the id from the String
  let arr = str.split('--');
  let orderId = typeof(arr[1])=='string' && arr[1].trim().length>0 ? arr[1] : false;
  if(orderId) {
    // Lookup the order
    _data.read('orders',orderId,(err,orderData) => {
          // Print the JSON with text highlighting
          cli.verticalSpace();
          console.dir(orderData,{'colors' : true});
          cli.verticalSpace();
    });
  }
};

// list users
cli.responders.listUsers = (str) => {
  _data.list('users',(err,userIds)=>{
    if(!err && userIds && userIds.length > 0) {
      cli.verticalSpace();
      userIds.forEach((userId)=>{
        _data.read('users',userId,(err,userData)=>{
          if(!err && userData) {
            if(userData.timestamp && Date.now()-userData.timestamp < (60 * 60 *24)) {
              line = `Name: ${userData.firstName} ${userData.lastName} email: ${userData.email}`;
              console.log(line);
            }
          }
        });
      });
    }
  });
};

// more user info
cli.responders.moreUserInfo = (str) => {
  // Get the id from the String
  let arr = str.split('--');
  let userId = typeof(arr[1])=='string' && arr[1].trim().length>0 ? arr[1] : false;
  if(userId) {
    // Lookup the user
    _data.read('users',userId,(err,userData) => {
      if(!err && userData) {
        //Delete hashed password key
        delete userData.hashedPassword;
        // Print the JSON with text highlighting
        cli.verticalSpace();
        console.dir(userData,{'colors' : true});
        cli.verticalSpace();
      }
    });
  }
};

//Input processor
cli.processInput = (str) => {
  str = typeof(str) == 'string' && str.trim().length > 0 ? str.trim() : false;
  // only process the input if the user actually wrote something. Otherwise ignore
  if(str) {
    // Codify the unique string that codify the unique questions allowed to be asked
    let uniqueInputs = [
      'man',
      'help',
      'menu',
      'exit',
      'list users',
      'more user info',
      'more order info',
      'list orders',
      ];
    // Go throuh the possible input, emit an event when match is found
    let matchFound = false;
    let counter = 0;
    uniqueInputs.some((input)=>{
      if(str.toLowerCase().indexOf(input) > -1 ) {
        matchFound = true;
        // Emit an event matching the unique inputs and include the full string given
        e.emit(input,str);
        return true;
      }
    });
    // If no match is found tell the user to try again
    if(!matchFound) {
      console.log("Sorry, try again");
    }
  }
};


// Init script
cli.init = () => {
  // Send the start message to te console in dark blue
  console.log('\x1b[34m%s\x1b[0m',"The CLI is running");

  // Start the Interface
  let _insterface = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: ''
  });

  // create an initial prompt
  _insterface.prompt();

  // Handle each line of input separatly

  _insterface.on('line', (str) => {
      // Send to the inout processor
      cli.processInput(str);

      // Reinitialise the prompt afterwards
      _insterface.prompt();

  });

// If the user stops the CLI kill the associated process
_insterface.on('close', () => {
  process.exit(0);
});

};


// Export the module
module.exports = cli;
