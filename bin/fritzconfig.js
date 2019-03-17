#!/usr/bin/env node
const inquirer = require('inquirer');
const program = require('caporal');
const packageFile = require('./../package.json');
const chalk = require('chalk');
const clear = require('clear');
const figlet = require('figlet');
const store = require('json-fs-store');
const self = this;

inquirer.registerPrompt('checkbox-plus', require('inquirer-checkbox-plus-prompt'));

String.prototype.insert = function (index, string) {
  if (index > 0)
    return this.substring(0, index) + string + this.substring(index, this.length);
  else
    return string + this;
};

clear();
console.log(
  chalk.yellow(
    figlet.textSync('Fritz!', { horizontalLayout: 'full' })
  )
);

console.log('\nFritz!Platform Config Generator v%s',packageFile.version);
console.log('by SeydX (https://github.com/SeydX)\n');

this.deviceQuestions = [
  {
    type:'input',
    name:'name',
    message:'Device name:',
    validate: function(value) {
      var valid = (!value||value===''||value===undefined)?false:true;
      return valid || 'Please enter a name!';
    }
  },
  {
    type: 'input',
    name: 'host',
    message: 'IP Addresse:',
    validate: function(value) {
      var pass = value.match(
        /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
      );
      if (pass) {
        return true;
      }
      return 'Please enter a valid ip addresse';
    }
  },
  {
    type: 'input',
    name: 'port',
    message: 'Port:',
    default: 49000,
    validate: function(value) {
      var valid = !isNaN(parseFloat(value));
      return valid || 'Please enter a valid port';
    },
    filter: Number
  },
  {
    type: 'input',
    name: 'username',
    message: 'Username:',
    validate: function(value) {
      var valid = (!value||value===''||value===undefined)?false:true;
      return valid || 'Please enter a username!';
    }
  },
  {
    type: 'password',
    message: 'Password:',
    name: 'password',
    mask: '*',
    validate: function(value) {
      var valid = (!value||value===''||value===undefined)?false:true;
      return valid || 'Please enter a password!';
    }
  },
  {
    type:'list',
    name:'type',
    message:'Device type',
    choices:['dsl','cable','repeater']
  },
  {
    type: 'confirm',
    name: 'master',
    message: 'Is this your main/master device?',
    default: false,
    when: function(answers){
      if(answers.type!=='repeater')return true;
      return false;
    }
  },
  {
    type: 'checkbox-plus',
    message: 'Please choose:',
    name: 'options',
    source: function(answers){
      return new Promise(function(resolve) {
        var data = ['beta','wifi2','wifi5','wifiGuest','led'];
        if(answers.master&&answers.type!=='repeater'){
          let dataMaster = ['aw','phoneBook','wps','deflection','ringlock','wakeup','broadband','extReboot','mesh','lock', 'alarm'];
          data = data.concat(dataMaster);
        }
        resolve(data);
      });
    }
  }
];

this.smarthomeQuestions = [
  {
    type: 'input',
    name: 'name',
    message: 'Name of the device?',
    validate: function(value) {
      var valid = (!value||value===''||value===undefined)?false:true;
      return valid || 'Please enter a name!';
    }
  },
  {
    type: 'input',
    name: 'ain',
    message: 'AIN:',
    validate: function(value) {
      var valid = (!value||value===''||value===undefined)?false:true;
      return valid || 'Please enter a AIN!';
    }
  },
  {
    type: 'list',
    name: 'type',
    message: 'Type:',
    choices: ['switch','thermo','contact']
  },
  {
    type: 'confirm',
    name: 'tempSensor',
    message: 'Temperature Sensor for Switch?',
    default: false,
    when: function(answers){
      if(answers.type=='switch')return true;
      return false;
    }
  },
  {
    type: 'list',
    name: 'unit',
    message: 'Unit:',
    choices: ['celsius','fahrenheit'],
    when: function(answers){
      if(answers.tempSensor||answers.type=='thermo')return true;
      return false;
    }
  },
  {
    type: 'number',
    name: 'heatValue',
    message: 'Heat value:',
    default: 5,
    when: function(answers){
      if(answers.type=='thermo')return true;
      return false;
    },
    validate: function(value) {
      var valid = !isNaN(parseFloat(value));
      return valid || 'Please enter a valid number';
    },
    filter: Number
  },
  {
    type: 'number',
    name: 'coolValue',
    message: 'Cool value:',
    default: 5,
    when: function(answers){
      if(answers.type=='thermo')return true;
      return false;
    },
    validate: function(value) {
      var valid = !isNaN(parseFloat(value));
      return valid || 'Please enter a valid number';
    },
    filter: Number
  }
];

this.telegramQuestions = [
  {
    type: 'confirm',
    name: 'active',
    message: 'Activate Telegram?',
    default: true
  },
  {
    type: 'input',
    name: 'token',
    message: 'Token:',
    validate: function(value) {
      var valid = (!value||value===''||value===undefined)?false:true;
      return valid || 'Please enter a Token!';
    }
  },
  {
    type: 'input',
    name: 'chatID',
    message: 'Chat ID:',
    validate: function(value) {
      var valid = (!value||value===''||value===undefined)?false:true;
      return valid || 'Please enter a Chat ID!';
    }
  },
  {
    type: 'confirm',
    name: 'presence',
    message: 'Want to add presence to telegram?',
    default: false
  },
  {
    type: 'input',
    name: 'in',
    message: 'Presence detected message:',
    when: function(answers){
      if(answers.presence)return true;
      return false;
    },
    validate: function(value) {
      var valid = (!value||value===''||value===undefined)?false:true;
      return valid || 'Please enter a message!';
    }
  },
  {
    type: 'input',
    name: 'out',
    message: 'Presence not detected message:',
    when: function(answers){
      if(answers.presence)return true;
      return false;
    },
    validate: function(value) {
      var valid = (!value||value===''||value===undefined)?false:true;
      return valid || 'Please enter a message!';
    }
  },
  {
    type: 'input',
    name: 'anyoneIn',
    message: 'Presence detected message for Anyone sensor:',
    when: function(answers){
      if(answers.presence)return true;
      return false;
    },
    validate: function(value) {
      var valid = (!value||value===''||value===undefined)?false:true;
      return valid || 'Please enter a message!';
    }
  },
  {
    type: 'input',
    name: 'anyoneOut',
    message: 'Presence not detected message for Anyone sensor:',
    when: function(answers){
      if(answers.presence)return true;
      return false;
    },
    validate: function(value) {
      var valid = (!value||value===''||value===undefined)?false:true;
      return valid || 'Please enter a message!';
    }
  },
  {
    type: 'confirm',
    name: 'callmonitor',
    message: 'Want to add callmonitor to telegram?',
    default: false
  },
  {
    type: 'input',
    name: 'incoming',
    message: 'Incoming call message:',
    when: function(answers){
      if(answers.callmonitor)return true;
      return false;
    },
    validate: function(value) {
      var valid = (!value||value===''||value===undefined)?false:true;
      return valid || 'Please enter a message!';
    }
  },
  {
    type: 'input',
    name: 'disconnected',
    message: 'Call disconnected message:',
    when: function(answers){
      if(answers.callmonitor)return true;
      return false;
    },
    validate: function(value) {
      var valid = (!value||value===''||value===undefined)?false:true;
      return valid || 'Please enter a message!';
    }
  },
  {
    type: 'confirm',
    name: 'alarm',
    message: 'Want to add alarm to telegram?',
    default: false
  },
  {
    type: 'input',
    name: 'activated',
    message: 'Alarm activated message:',
    when: function(answers){
      if(answers.alarm)return true;
      return false;
    },
    validate: function(value) {
      var valid = (!value||value===''||value===undefined)?false:true;
      return valid || 'Please enter a message!';
    }
  },
  {
    type: 'input',
    name: 'deactivated',
    message: 'Alarm deactivated message:',
    when: function(answers){
      if(answers.alarm)return true;
      return false;
    },
    validate: function(value) {
      var valid = (!value||value===''||value===undefined)?false:true;
      return valid || 'Please enter a message!';
    }
  },
  {
    type: 'confirm',
    name: 'extReboot',
    message: 'Want to add extended reboot to telegram?',
    default: false
  },
  {
    type: 'input',
    name: 'start',
    message: 'Start reboot message:',
    when: function(answers){
      if(answers.extReboot)return true;
      return false;
    },
    validate: function(value) {
      var valid = (!value||value===''||value===undefined)?false:true;
      return valid || 'Please enter a message!';
    }
  },
  {
    type: 'input',
    name: 'finish',
    message: 'Finished reboot message:',
    when: function(answers){
      if(answers.extReboot)return true;
      return false;
    },
    validate: function(value) {
      var valid = (!value||value===''||value===undefined)?false:true;
      return valid || 'Please enter a message!';
    }
  }
];

this.callmonitorQuestions = [
  {
    type: 'confirm',
    name: 'active',
    message: 'Activate callmonitor?',
    default: true
  },
  {
    type: 'input',
    name: 'ip',
    message: 'IP Addresse:',
    validate: function(value) {
      var pass = value.match(
        /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
      );
      if (pass) {
        return true;
      }
      return 'Please enter a valid ip addresse';
    }
  },
  {
    type: 'number',
    name: 'port',
    message: 'Port:',
    default: 1012,
    validate: function(value) {
      var valid = !isNaN(parseFloat(value));
      return valid || 'Please enter a valid port';
    },
    filter: Number
  },
  {
    type: 'input',
    name: 'country',
    message: 'Country (Format: DE):',
    validate: function(value) {
      var valid = (!value||value===''||value===undefined||value.length>2||parseInt(value))?false:true;
      return valid || 'Please enter valid country (Format: DE)!';
    },
    filter: function(value){
      value = value.toUpperCase();
      return value;
    }
  },
  {
    type: 'confirm',
    name: 'incoming',
    message: 'Want to add a specific \'incoming to\' nr to config?',
    default: false
  },
  {
    type: 'input',
    name: 'incomingTo',
    message: 'Incoming to nr:',
    when: function(answers){
      if(answers.incoming)return true;
      return false;
    },
    validate: function(value) {
      var valid = !isNaN(parseFloat(value));
      return valid || 'Please enter a valid number';
    }
  },
  {
    type: 'confirm',
    name: 'outgoing',
    message: 'Want to add a specific \'outgoing from\' nr to config?',
    default: false
  },
  {
    type: 'input',
    name: 'outgoingFrom',
    message: 'Outgoing from nr:',
    when: function(answers){
      if(answers.outgoing)return true;
      return false;
    },
    validate: function(value) {
      var valid = !isNaN(parseFloat(value));
      return valid || 'Please enter a valid number';
    }
  }
];

this.choiceAction = [
  {
    type: 'input',
    name: 'path',
    message: 'Path to your config.json folder',
    default: '/var/homebridge/',
    validate: function(value){
      if(!value||value===''||value===undefined){
        return 'Please enter a valid path!';
      } else {
        self.configPath = value;
        return true;
      }
    },
    when: function(){
      if(self.config) return false;
      return true;
    }
  },
  {
    type: 'list',
    name: 'action',
    message: 'What you want to do?',
    paginated: false,
    choices: function(){
      let done = this.async();
      let array;
      store(self.configPath).load('config_FritzPlatform',function(err,obj){
        if(obj){
          array = ['Generate!','Show config', 'Remove config'];
        }else{
          array = ['Generate!'];
        }
        done(null,array);
      });
    }
  }
];

program
  .version(packageFile.version)
  .command('start', 'Start config generator')
  .action((args, options, logger) => { 
    logger.info('Welcome to Fritz!Platform config generator.\n'); 
    mainMenu(logger,'Generate');
  });

program.parse(process.argv);

//Arrays
let deviceArray = [];
let extrasArray = [];
let smarthomeArray = [];
let presenceArray = [];
let wolArray = [];
let callmonitorArray = [];
let telegramArray = [];
let generalArray = {};

this.config = {'platform':'FritzPlatform'};

function mainMenu(logger){
  inquirer.prompt(self.choiceAction).then(answers => {
    if(answers.action=='Generate!'){
      deviceArray = [];
      extrasArray = [];
      smarthomeArray = [];
      presenceArray = [];
      wolArray = [];
      callmonitorArray = [];
      telegramArray = [];
      generalArray = {};
      generateFull(logger,'device');
    } else if(answers.action=='Show config'){
      showConfig(logger);
    } else {
      removeConfig(logger);
    }
  });
}

function showConfig(logger){
  store(self.configPath).load('config_FritzPlatform',function(err,obj){
    if(obj){
      logger.info(obj);
    }else{
      logger.warn(err);
    }
    logger.info('');
    mainMenu(logger);
  });
}

function removeConfig(logger){
  store(self.configPath).remove('config_FritzPlatform',function(err){
    if(!err){
      logger.info('Config removed!');
    }else{
      logger.warn(err);
    }
    logger.info('');
    mainMenu(logger);
  });
}

function generateConfig(logger){
  logger.info('');
  logger.info('Generating config.json..');
  logger.info('');
  if(Object.keys(deviceArray).length){
    self.config['devices'] = {};
    for(const i in deviceArray){
      self.config['devices'][i] = {
        host: deviceArray[i].host,
        port: deviceArray[i].port,
        username: deviceArray[i].username,
        password: deviceArray[i].password,
        type: deviceArray[i].type,
        master: deviceArray[i].master,
        beta: deviceArray[i].options.includes('beta')?true:false,
        wifi2: deviceArray[i].options.includes('wifi2')?true:false,
        wifi5: deviceArray[i].options.includes('wifi5')?true:false,
        wifiGuest: deviceArray[i].options.includes('wifiGuest')?true:false,
        led: deviceArray[i].options.includes('led')?true:false,
        aw: deviceArray[i].options.includes('aw')?true:false,
        phoneBook: deviceArray[i].options.includes('phoneBook')?true:false,
        wps: deviceArray[i].options.includes('wps')?true:false,
        mesh: deviceArray[i].options.includes('mesh')?true:false,
        deflection: deviceArray[i].options.includes('deflection')?true:false,
        lock: deviceArray[i].options.includes('lock')?true:false
      };
    }
  }

  if(Object.keys(smarthomeArray).length){
    self.config['smarthome'] = {};
    for(const i in smarthomeArray){
      self.config['smarthome'][i] = {
        ain: smarthomeArray[i].ain,
        type: smarthomeArray[i].type,
        unit: smarthomeArray[i].unit?smarthomeArray[i].unit:false,
        tempSensor: smarthomeArray[i].tempSensor?smarthomeArray[i].tempSensor:false,
        heatValue: smarthomeArray[i].heatValue?smarthomeArray[i].heatValue:false,
        coolValue: smarthomeArray[i].coolValue?smarthomeArray[i].coolValue:false
      };
    }
  }

  if(Object.keys(presenceArray).length){
    self.config['presence'] = {};
    for(const i in presenceArray){
      self.config['presence'][i] = presenceArray[i].ip?presenceArray[i].ip:presenceArray[i].mac;
    }
  }

  if(Object.keys(wolArray).length){
    self.config['wol'] = {};
    for(const i in wolArray){
      self.config['wol'][i] = wolArray[i].mac;
    }
  }

  if(Object.keys(callmonitorArray).length){
    self.config['callmonitor'] = {};
    for(const i in callmonitorArray){
      self.config['callmonitor'] = {
        active: callmonitorArray[i].active,
        ip: callmonitorArray[i].ip,
        port: callmonitorArray[i].port,
        country: callmonitorArray[i].country,
        incomingTo: callmonitorArray[i].incoming?callmonitorArray[i].incomingTo:false,
        outgoingFrom: callmonitorArray[i].outgoing?callmonitorArray[i].outgoingFrom:false
      };
    }
  }

  if(extrasArray.alarm){
    self.config['alarm'] = {
      active: extrasArray.alarm.active,
      telNr: extrasArray.alarm.telNr,
      duration: extrasArray.alarm.duration
    };
  }

  if(extrasArray.ringlock){
    self.config['ringlock'] = {
      active: extrasArray.ringlock.active,
      DECTphones: extrasArray.ringlock.DECTphones,
      start: extrasArray.ringlock.start,
      end: extrasArray.ringlock.end
    };
  }

  if(extrasArray.wakeup){
    self.config['wakeup'] = {
      active: extrasArray.wakeup.active,
      internNr: extrasArray.wakeup.internNr,
      duration: extrasArray.wakeup.duration
    };
  }

  if(extrasArray.broadband){
    self.config['wakeup'] = {
      active: extrasArray.broadband.active,
      measureTime: extrasArray.broadband.measureTime,
      polling: extrasArray.broadband.polling
    };
  }

  if(extrasArray.extReboot){
    self.config['extReboot'] = {
      active: extrasArray.extReboot.active,
      cmdOn: extrasArray.extReboot.cmdOn,
      cmdOff: extrasArray.extReboot.cmdOff
    };
  }

  if(telegramArray.telegram){
    self.config['telegram'] = {
      active: telegramArray.telegram.active,
      token: telegramArray.telegram.token,
      chatID: telegramArray.telegram.chatID,
      presence: telegramArray.telegram.presence?{}:false,
      callmonitor: telegramArray.telegram.callmonitor?{}:false,
      alarm: telegramArray.telegram.alarm?{}:false,
      extReboot: telegramArray.telegram.extReboot?{}:false,
    };

    if(self.config.telegram.presence){
      self.config.telegram.presence = {
        in: telegramArray.telegram.in,
        out: telegramArray.telegram.out,
        anyoneIn: telegramArray.telegram.anyoneIn,
        anyoneOut: telegramArray.telegram.anyoneOut
      };
    }

    if(self.config.telegram.callmonitor){
      self.config.telegram.callmonitor = {
        incoming: telegramArray.telegram.incoming,
        disconnected: telegramArray.telegram.disconnected,
      };
    }

    if(self.config.telegram.alarm){
      self.config.telegram.alarm = {
        activated: telegramArray.telegram.activated,
        deactivated: telegramArray.telegram.deactivated,
      };
    }

    if(self.config.telegram.extReboot){
      self.config.telegram.extReboot = {
        start: telegramArray.telegram.start,
        finish: telegramArray.telegram.finish,
      };
    }

  }

  if(Object.keys(generalArray).length){
    self.config['anyone'] = generalArray.anyone||false;
    self.config['delay'] = generalArray.delay||30;
    self.config['polling'] = generalArray.anyone;
    self.config['timeout'] = generalArray.timeout;
    self.config['readOnlySwitches'] = generalArray.readOnlySwitches;
  }

  if(self.config.smarthome){
    for(const i in self.config.smarthome){
      if(self.config.smarthome[i].type=='switch'){
        delete self.config.smarthome[i].heatValue;
        delete self.config.smarthome[i].coolValue;
      } else if(self.config.smarthome[i].type=='contact'){
        delete self.config.smarthome[i].heatValue;
        delete self.config.smarthome[i].coolValue;
        delete self.config.smarthome[i].unit;
        delete self.config.smarthome[i].tempSensor;
      } else if(self.config.smarthome[i].type=='thermo'){
        delete self.config.smarthome[i].tempSensor;
      }
    }
  }

  if(self.config.devices){
    for(const i in self.config.devices){
      if(self.config.devices[i].type=='repeater'||!self.config.devices[i].master){
        delete self.config.devices[i].aw;
        delete self.config.devices[i].phoneBook;
        delete self.config.devices[i].wps;
        delete self.config.devices[i].mesh;
        delete self.config.devices[i].deflection;
        delete self.config.devices[i].lock;
      }
    }
  }

  logger.info('Done!');
  self.config['id'] = 'config_FritzPlatform';
  store(self.configPath).add(self.config, function(err) {
    if(err){
      logger.warn('Can not store config_FritzPlatform.json to given path! Please check your path!');
    } else {
      logger.info('config_FritzPlatform.json stored to ' + self.configPath);
    }
    logger.info('');
    mainMenu(logger);
  });

}

function generateFull(logger,type){
  switch (type){
    case 'device':
      logger.info('');
      logger.info('• Let\'s start with creating a full config.json');
      logger.info('');
      logger.info('• Configuring device');
      inquirer.prompt(
        [{
          type: 'number',
          name: 'devices',
          message: 'How much Fritz! devices you want to add?',
          validate: function(value) {
            if(value===0)return 'Please enter a number above 0';
            var valid = !isNaN(parseFloat(value));
            return valid || 'Please enter a valid number';
          },
          filter: Number
        },
        {
          type: 'confirm',
          name: 'readOnlySwitches',
          message: 'Want to change switch functionality of Fritz! devices to \'read only\'?',
          default: false
        },
        {
          type: 'number',
          name: 'poll',
          message: 'Polling in seconds:',
          default: 5,
          validate: function(value) {
            if(value<5)return 'Please enter a number >= 5';
            var valid = !isNaN(parseFloat(value));
            return valid || 'Please enter a valid number';
          },
          filter: Number
        },
        {
          type: 'number',
          name: 'timeout',
          message: 'Timeout in seconds:',
          default: 5,
          validate: function(value) {
            if(value<5)return 'Please enter a number >= 5';
            var valid = !isNaN(parseFloat(value));
            return valid || 'Please enter a valid number';
          },
          filter: Number
        }]
      ).then(answers => {
        generalArray['readOnlySwitches'] = answers.readOnlySwitches;
        generalArray['polling'] = answers.polling;
        generalArray['timeout'] = answers.timeout;
        addDevice(logger, answers);
      });
      break;
    case 'presence':
      logger.info('• Configuring presence');
      inquirer.prompt({
        type: 'confirm',
        name: 'presence',
        message: 'Want to add presence devices to config?',
        default: false
      }).then(answers => {
        if(answers.presence){
          inquirer.prompt(
            [{
              type: 'number',
              name: 'presenceAmount',
              message: 'How much devices you want to add to presence?',
              validate: function(value) {
                if(value===0)return 'Please enter a number above 0';
                var valid = !isNaN(parseFloat(value));
                return valid || 'Please enter a valid number';
              },
              filter: Number
            },
            {
              type: 'confirm',
              name: 'anyone',
              message: 'Want to add anyone sensor to presence?',
              default: false
            },
            {
              type: 'number',
              name: 'delay',
              message: 'Presence delay in seconds:',
              default: 30,
              validate: function(value) {
                if(value<30)return 'Please enter a number >= 30';
                var valid = !isNaN(parseFloat(value));
                return valid || 'Please enter a valid number';
              },
              filter: Number
            }]
          ).then(answers => {
            generalArray['anyone'] = answers.anyone;
            generalArray['delay'] = answers.delay;
            addPresence(logger, answers);
          });
        } else {
          logger.info('');
          logger.info('Presence not enabled! Continue with WOL.');
          logger.info('');
          generateFull(logger,'wol');
        }
      });
      break;
    case 'wol':
      logger.info('• Configuring WOL');
      inquirer.prompt({
        type: 'confirm',
        name: 'wol',
        message: 'Want to add wol devices to config?',
        default: false
      }).then(answers => {
        if(answers.wol){
          inquirer.prompt(
            [{
              type: 'number',
              name: 'wolAmount',
              message: 'How much devices you want to add to wol?',
              validate: function(value) {
                if(value===0)return 'Please enter a number above 0';
                var valid = !isNaN(parseFloat(value));
                return valid || 'Please enter a valid number';
              },
              filter: Number
            }]
          ).then(answers => {
            addWol(logger, answers);
          });
        } else {
          logger.info('');
          logger.info('WOL not enabled! Continue with Callmonitor.');
          logger.info('');
          generateFull(logger,'callmonitor');
        }
      });
      break;
    case 'callmonitor':
      logger.info('• Configuring Callmonitor');
      inquirer.prompt({
        type: 'confirm',
        name: 'callmonitor',
        message: 'Want to add callmonitor to config?',
        default: false
      }).then(answers => {
        if(answers.callmonitor){
          addCallmonitor(logger);
        } else {
          logger.info('');
          logger.info('Callmonitor not enabled! Continue with Telegram.');
          logger.info('');
          generateFull(logger,'telegram');
        }
      });
      break;
    case 'smarthome':
      logger.info('• Configuring SmartHome');
      inquirer.prompt({
        type: 'confirm',
        name: 'smarthome',
        message: 'Want to add smarthome devices to config?',
        default: false
      }).then(answers => {
        if(answers.smarthome){
          inquirer.prompt(
            [{
              type: 'number',
              name: 'smarthomeAmount',
              message: 'How much devices you want to add to smarthome?',
              validate: function(value) {
                if(value===0)return 'Please enter a number above 0';
                var valid = !isNaN(parseFloat(value));
                return valid || 'Please enter a valid number';
              },
              filter: Number
            }]
          ).then(answers => {
            addSmarthome(logger, answers);
          });
        } else {
          logger.info('');
          logger.info('Smarthome not enabled! Continue with Presence.');
          logger.info('');
          generateFull(logger,'presence');
        }
      });
      break;
    case 'telegram':
      logger.info('• Configuring Telegram');
      inquirer.prompt({
        type: 'confirm',
        name: 'telegram',
        message: 'Want to add telegram to config?',
        default: false
      }).then(answers => {
        if(answers.telegram){
          addTelegram(logger);
        } else {
          logger.info('');
          logger.info('Telegram not enabled!');
          logger.info('');
          generateConfig(logger);
        }
      });
      break;
    default:
// err
  }
}

let smarthomeCount = 0;

function addSmarthome(logger, answer){
  let skip;
  smarthomeCount++;
  if(smarthomeCount>answer.smarthomeAmount)skip=true;
  if(!skip){
    logger.info('');
    logger.info('Configuring ' + smarthomeCount + '. device!');
    inquirer.prompt(self.smarthomeQuestions).then(answers => {
      smarthomeArray[answers.name] = answers;
      addSmarthome(logger, answer);
    });
  } else {
    logger.info('');
    logger.info('Smarthome setted up successfully! Continue with Presence.');
    logger.info('');
    generateFull(logger,'presence');
  }
}

function addTelegram(logger){
  inquirer.prompt(self.telegramQuestions).then(answers => {
    telegramArray['telegram']=answers;
    logger.info('');
    logger.info('Telegram setted up successfully!');
    logger.info('');
    generateConfig(logger);
  });
}

function addCallmonitor(logger){
  inquirer.prompt(self.callmonitorQuestions).then(answers => {
    callmonitorArray['callmonitor']=answers;
    logger.info('');
    logger.info('Callmonitor setted up successfully! Continue with Telegram.');
    logger.info('');
    generateFull(logger,'telegram');
  });
}

let wolCount = 0;

function addWol(logger, answer){
  let skip;
  wolCount++;
  if(wolCount>answer.wolAmount)skip=true;
  if(!skip){
    logger.info('');
    logger.info('Configuring ' + wolCount + '. device!');
    inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: 'Name of the device?',
        validate: function(value) {
          var valid = (!value||value===''||value===undefined)?false:true;
          return valid || 'Please enter a name!';
        }
      },
      {
        type: 'input',
        name: 'mac',
        message: 'MAC Addresse:',
        validate: function(value) {
          var pass = value.match(
            /^([0-9A-F]{2}[:-]){5}([0-9A-F]{2})$/
          );
          if (pass) {
            return true;
          }
          return 'Please enter a valid mac addresse';
        }
      }
    ]).then(answers => {
      wolArray[answers.name] = answers;
      addWol(logger, answer);
    });
  } else {
    logger.info('');
    logger.info('WOL setted up successfully! Continue with Callmonitor.');
    logger.info('');
    generateFull(logger,'callmonitor');
  }
}

let presenceCount = 0;

function addPresence(logger, answer,){
  let skip;
  presenceCount++;
  if(presenceCount>answer.presenceAmount)skip=true;
  if(!skip){
    logger.info('');
    logger.info('Configuring ' + presenceCount + '. device!');
    inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: 'Name of the device?',
        validate: function(value) {
          var valid = (!value||value===''||value===undefined)?false:true;
          return valid || 'Please enter a name!';
        }
      },
      {
        type:'list',
        name:'type',
        message:'Device adress type',
        choices:['ip','mac']
      },
      {
        type: 'input',
        name: 'ip',
        message: 'IP Addresse:',
        validate: function(value) {
          var pass = value.match(
            /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
          );
          if (pass) {
            return true;
          }
          return 'Please enter a valid ip addresse';
        },
        when: function(answers){
          if(answers.type=='ip')return true;
          return false;
        }
      },
      {
        type: 'input',
        name: 'mac',
        message: 'MAC Addresse:',
        validate: function(value) {
          var pass = value.match(
            /^([0-9A-F]{2}[:-]){5}([0-9A-F]{2})$/
          );
          if (pass) {
            return true;
          }
          return 'Please enter a valid mac addresse';
        },
        when: function(answers){
          if(answers.type=='mac')return true;
          return false;
        },
      }
    ]).then(answers => {
      presenceArray[answers.name] = answers;
      addPresence(logger, answer);
    });
  } else {
    logger.info('');
    logger.info('Presence setted up successfully! Continue with WOL.');
    logger.info('');
    generateFull(logger,'wol');
  }
}


let deviceCount = 0;
let extrasCount = 0;

function addDevice(logger, answer){
  let skip;
  deviceCount++;
  if(deviceCount>answer.devices)skip=true;
  if(!skip){
    logger.info('');
    if(deviceCount===1){
      logger.info('• Configuring \'master\' device!');
    } else {
      logger.info('• Configuring ' + deviceCount + '. device!');
    }
    inquirer.prompt(self.deviceQuestions).then(answers => {
      deviceArray[answers.name] = answers;
      for(const i in deviceArray){
        if(deviceArray[i].master){
          for(const l in self.deviceQuestions){
            if(self.deviceQuestions[l].name == 'master'){
              self.deviceQuestions.splice(l,1);
            }
          }
        }
      }
      addDevice(logger, answer);
    });
  } else {
    let extras = [];
    for(const i in deviceArray){
      if(deviceArray[i].master){
        if(deviceArray[i].options.includes('alarm')){
          extras.push('alarm');
        }
        if(deviceArray[i].options.includes('wakeup')){
          extras.push('wakeup');
        }
        if(deviceArray[i].options.includes('ringlock')){
          extras.push('ringlock');
        }
        if(deviceArray[i].options.includes('broadband')){
          extras.push('broadband');
        }
        if(deviceArray[i].options.includes('extReboot')){
          extras.push('extReboot');
        }
      }
    }
    if(extras.length){
      confExtras(logger,extras);
    } else {
      logger.info('');
      logger.info('Devices setted up successfully! Continue...');
      logger.info('');
      generateFull(logger,'smarthome');
    }
  }
}

function confExtras(logger, extras){
  let skip;
  extrasCount++;
  if(extrasCount>extras.length)skip=true;
  if(!skip){
    logger.info('');
    logger.info('• Configuring ' + extras[extrasCount-1]+' for master/main device:');
    if(extras[extrasCount-1]=='alarm'){
      inquirer.prompt(
        [{
          type: 'confirm',
          name: 'active',
          message: 'Activate alarm?',
          default: true
        },
        {
          type: 'number',
          name: 'telNr',
          message: 'Which nr should be called?',
          validate: function(value) {
            var valid = !isNaN(parseFloat(value));
            return valid || 'Please enter a valid number';
          },
          filter: function(value){
            value = value.toString();
            return value;
          }
        },
        {
          type: 'number',
          name: 'duration',
          message: 'Duration of call in seconds:',
          default: 30,
          validate: function(value) {
            if(value<10) return 'Must be above >= 10!';
            var valid = !isNaN(parseFloat(value));
            return valid || 'Please enter a valid number';
          },
          filter: Number
        }]
      ).then(answers => {
        extrasArray['alarm']=answers;
        confExtras(logger, extras);
      });
    } else if(extras[extrasCount-1]=='wakeup'){
      inquirer.prompt(
        [{
          type: 'confirm',
          name: 'active',
          message: 'Activate wake up?',
          default: true
        },
        {
          type: 'number',
          name: 'internNr',
          message: 'Which intern nr should be called (without *)?',
          validate: function(value) {
            value = value.split('**');
            let result = parseInt(value[1]);
            var valid = !isNaN(parseFloat(result));
            return valid || 'Please enter a intern number!';
          },
          filter: function(value){
            value = '**'+value.toString();
            return value;
          }
        },
        {
          type: 'number',
          name: 'duration',
          message: 'Duration of call in seconds:',
          default: 30,
          validate: function(value) {
            if(value<10) return 'Must be above >= 10!';
            var valid = !isNaN(parseFloat(value));
            return valid || 'Please enter a valid number';
          },
          filter: Number
        }]
      ).then(answers => {
        extrasArray['wakeup']=answers;
        confExtras(logger, extras);
      });
    } else if(extras[extrasCount-1]=='ringlock'){
      inquirer.prompt(
        [{
          type: 'confirm',
          name: 'active',
          message: 'Activate ring lock?',
          default: true
        },
        {
          type: 'number',
          name: 'DECTphones',
          message: 'How many registred DECT phones you have?',
          validate: function(value) {
            if(value===0) return 'Must be above 0!';
            var valid = !isNaN(parseFloat(value));
            return valid || 'Please enter a valid number';
          },
          filter: Number
        },
        {
          type: 'input',
          name: 'start',
          message: 'Start time (Format: 0000):',
          validate: function(value) {
            var valid = !isNaN(parseFloat(value));

            value = value.toString().split('');
            let firstNumber = value[0]+value[1];
            let secNumber = value[2]+value[3];
            let resultOne = parseInt(firstNumber);
            let resultTwo = parseInt(secNumber);

            if(resultOne>24){
              return 'First two digits must be lower or equal 24!';
            } else if(resultTwo>59){
              return 'Last two digits must be lower or equal 59!';
            } else if(!valid){
              return 'Please enter a valid number!';
            }


            return true;
          },
          filter: function(value){
            value = value.toString().insert(2, ':');
            return value;
          }
        },
        {
          type: 'input',
          name: 'end',
          message: 'End time (Format: 0000):',
          validate: function(value) {
            var valid = !isNaN(parseFloat(value));

            value = value.toString().split('');
            let firstNumber = value[0]+value[1];
            let secNumber = value[2]+value[3];
            let resultOne = parseInt(firstNumber);
            let resultTwo = parseInt(secNumber);

            if(resultOne>24){
              return 'First two digits must be lower or equal 24!';
            } else if(resultTwo>59){
              return 'Last two digits must be lower or equal 59!';
            } else if(!valid){
              return 'Please enter a valid number!';
            }


            return true;
          },
          filter: function(value){
            value = value.toString().insert(2, ':');
            return value;
          }
        }]
      ).then(answers => {
        extrasArray['ringlock']=answers;
        confExtras(logger, extras);
      });
    } else if(extras[extrasCount-1]=='broadband'){
      inquirer.prompt(
        [{
          type: 'confirm',
          name: 'active',
          message: 'Activate broadband?',
          default: true
        },
        {
          type: 'number',
          name: 'measureTime',
          message: 'Duration of bandwith measurement:',
          default: 5,
          validate: function(value) {
            if(value<5) return 'Must be above >= 5!';
            var valid = !isNaN(parseFloat(value));
            return valid || 'Please enter a valid number';
          },
          filter: Number
        },
        {
          type: 'number',
          name: 'polling',
          message: 'Duration of polling in minutes:',
          default: 30,
          validate: function(value) {
            if(value<30) return 'Must be above >= 30!';
            var valid = !isNaN(parseFloat(value));
            return valid || 'Please enter a valid number';
          },
          filter: Number
        }]
      ).then(answers => {
        extrasArray['broadband']=answers;
        confExtras(logger, extras);
      });
    } else {
      inquirer.prompt(
        [{
          type: 'confirm',
          name: 'active',
          message: 'Activate extended reboot?',
          default: true
        },
        {
          type: 'input',
          name: 'cmdOn',
          message: 'Path of the \'cmdOn\' file:',
          validate: function(value) {
            var valid = (!value||value===''||value===undefined)?false:true;
            value = value.slice(-3,value.length);
            if(!valid){
              return valid || 'Please enter a path!';
            } else if(value!=='.sh'){
              return 'Please enter a path to a valid .sh file!';
            }
            return true;
          },
          filter: function(value){
            value = 'sh ' + value;
            return value;
          }
        },
        {
          type: 'input',
          name: 'cmdOff',
          message: 'Path of the \'cmdOff\' file:',
          validate: function(value) {
            var valid = (!value||value===''||value===undefined)?false:true;
            return valid || 'Please enter a path!';
          },
          filter: function(value){
            value = 'sh ' + value;
            return value;
          }
        }]
      ).then(answers => {
        extrasArray['extReboot']=answers;
        confExtras(logger, extras);
      });
    }
  } else {
    logger.info('');
    logger.info('Devices setted up successfully! Continue with Smarthome.');
    logger.info('');
    generateFull(logger,'smarthome');
  }
}

process.stdin.on('data', (key) => {
  if (key == '\u0003') {
    console.log('\nBye bye\n');
  }
});
