'use strict';
const restify = require('restify');
const skype = require('skype-sdk');
var c = require('irc-colors');

class Skype extends global.AKP48.pluginTypes.ServerConnector {

  constructor(AKP48) {
    super(AKP48, 'skype-server');
  }

  load() {
    this._defaultCommandDelimiters = ['!', '.'];
    var self = this;
    var config = this._config;


    if(!config || !config.appId || !config.appSecret) {
      global.logger.error(`${this._pluginName}: Required appId and/or appSecret options missing from config!`);
      this._error = true;
      return;
    }

    if(!config.keyLoc || !config.certLoc) {
      global.logger.error(`${this._pluginName}: No certificate and/or key found! Cannot start Skype plugin.`);
      this._error = true;
      return;
    }

    this._botService = new skype.BotService({
      messaging: {
        botId: '28:'+config.botId,
        serverUrl : 'https://apis.skype.com',
        requestTimeout : 15000,
        appId: config.appId,
        appSecret: config.appSecret
      }
    });

    this._botService.on('contactAdded', (bot, data) => {
      bot.reply(`Hello, ${data.fromDisplayName}! For help, say "!help".`, true);
    });

    this._botService.on('personalMessage', (bot, data) => {
      self._AKP48.onMessage(self.createContextFromMessage(bot, data));
    });

    this._botService.on('groupMessage', (bot, data) => {
      self._AKP48.onMessage(self.createContextFromMessage(bot, data));
    });

    this._server = restify.createServer({
      key: require('fs').readFileSync(require('path').resolve(require('app-root-path').path, config.keyLoc)),
      cert: require('fs').readFileSync(require('path').resolve(require('app-root-path').path, config.certLoc))
    });

    //this._server.use(skype.ensureHttps(true));
    this._server.use(skype.verifySkypeCert());
    this._server.post('/v1/chat', skype.messagingHandler(this._botService));
    this._port = config.port || 9658;

    this._AKP48.on('msg_'+this._id, function(to, message, context) {
      message = c.stripColorsAndStyle(message);
      self._botService.send(to, message, !context.getCustomData('skype-no-escape')); // custom data will be null if unset. !null === true. custom data will be true if set. !true === false.
      self._AKP48.sentMessage(to, message, context);
    });
  }

  connect() {
    if(this._error) {
      global.logger.error(`${this._pluginName}|${this._id}: Cannot connect. Check log for errors.`);
      return;
    }

    this._server.listen(this._port);
    global.logger.debug(`${this._pluginName}|${this._id}: Server listening for incoming requests on port ${this._port}.`);
    this._AKP48.emit('serverConnect', this._id, this);
  }

  disconnect() {
    if(this._error) {
      global.logger.error(`${this._pluginName}|${this._id}: Cannot connect. Check log for errors.`);
      return;
    }
    this._server.close();
  }
}

Skype.prototype.createContextFromMessage = function (bot, data) {
  var perms = []; // TODO.
  var delimiters = this._defaultCommandDelimiters; // TODO: Make this configurable.

  return new this._AKP48.Context({
    instance: this,
    instanceType: 'skype',
    nick: data.from, //TODO: get display name rather than username.
    text: data.content,
    to: data.to,
    user: data.from,
    commandDelimiters: delimiters,
    myNick: `28:${this._config.appId}`,
    permissions: perms,
    rawMessage: data
  });
};

Skype.prototype.getPersistentObjects = function () {
  this.disconnect();
  return {};
};

module.exports = Skype;
