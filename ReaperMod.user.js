// ==UserScript==
// @name         ReaperMod
// @namespace    https://evades.io/
// @version      1.0.0
// @description  ReaperMod for evades.io.
// @author       Phoenix
// @include      /http(?:s)?:\/\/(www\.)?(eu\.)?evades\.(io|online)//
// @run-at       document-start
// @grant        none
// ==/UserScript==

getScript('/index.html', html => {
  const scriptURL = html.match(/\/app.[a-z0-9]+.js/)[0];
  html = html.replace(`<script src="${scriptURL}"></script>`, '');

  document.open();
  document.write(html);
  document.close();

  document.addEventListener('DOMContentLoaded', () => {
    getScript(scriptURL, script => {
      console.info(`[INFO] Script length before edit: ${script.length}`);
      script = editScript(script);
      console.info(`[INFO] Script length after edit: ${script.length}`);

      const element = document.createElement('script');
      element.text = script;
      element.async = false;
      document.body.appendChild(element);
    });
  });
});

const client = {
  abilities: {},
  initial: true,
  keysPressed: new Set(),
  gameState: null,
  systems: null,
  systemsByHero: null,

  init() {
    this.initial = false;

    const heroName = getKeyByValue(this.types.HeroType.values, this.gameState.self.entity.heroType);
    const heroSystems = this.systemsByHero[heroName] || {};
    Object.entries(heroSystems).forEach(([key, value]) => this.systems[key] = value);
  },
};
window.client = client;

class System {
  constructor(mode, keyCode, deactivatable = true) {
    this.mode = mode;
    this.keyCode = keyCode;
    this.deactivatable = deactivatable;
  }

  get display() {
  }

  switch(gameState) {
    this.mode ? this.disable(gameState) : this.enable(gameState);
  }

  enable() {
    this.mode = true;
  }

  disable() {
    this.mode = false;
  }

  run() {
  }
}

client.systems = {
  info: new class extends System {
    constructor() {
      super(false, 'Digit8', false);
    }

    disable(gameState) {
      this.mode = false;
      for (const system of Object.values(client.systems)) {
        if (system.deactivatable) system.disable(gameState);
      }
    }

    draw(client, ctx) {
      const displaySystems = Object.values(client.systems).filter(system => system.display);
      ctx.fillStyle = 'rgba(0, 0, 0, .5)';
      ctx.fillRect(10, 225, 165, displaySystems.length * 23);

      ctx.font = '16px Tahoma, Verdana, Segoe, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillStyle = 'rgba(255, 255, 255)';

      displaySystems.forEach((system, index) => {
        ctx.fillText(system.display, 20, 245 + index * 20);
      });
    }
  },

  timer: new class extends System {
    constructor() {
      super(true);
    }

    draw(gameState, ctx) {
      const survivalTime = secondsFormat(gameState.self.entity.survivalTime);
      ctx.font = 'bold 30px Tahoma, Verdana, Segoe, sans-serif';
      ctx.strokeText(survivalTime, 640, 80);
      ctx.fillText(survivalTime, 640, 80);
    }
  },
};

client.systemsByHero = {
  REAPER: {
    reaperInvisInfo: new class extends System {
      constructor() {
        super(false, 'Digit6');
        this.renderCircle = null;
        this.wasActivated = false;
      }

      get display() {
        return `Reaper Info: ${this.mode ? 'On' : 'Off'}`;
      }

      get abilityLastsTime() {
        const ability = client.abilities[client.types.AbilityType.values.DEPART];
        console.log(ability);
        switch (ability.level) {
          case 1:
            return 2.7;
          case 2:
            return 2.9;
          case 3:
            return 3.1;
          case 4:
            return 3.3;
          case 5:
            return 3.5;
        }
      }

      get playerSpeed() {
        const ability = client.abilities[client.types.AbilityType.values.DEPART];
        console.log(ability);
        switch (ability.level) {
          case 1:
            return 9;
          case 2:
            return 9.5;
          case 3:
            return 10;
          case 4:
            return 10.5;
          case 5:
            return 11;
        }
      }

      disable() {
        this.mode = false;
        this.renderCircle = null;
        this.wasActivated = false;
      }

      draw(ctx, camera) {
        if (this.renderCircle === null) {
          return;
        }

        ctx.beginPath();
        ctx.lineWidth = 3;
        ctx.strokeStyle = 'red';
        ctx.arc(
          client.gameState.self.entity.x + camera.x,
          client.gameState.self.entity.y + camera.y,
          this.renderCircle.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.lineWidth = 1;
      }

      run(gameState) {
        const ability = client.abilities[client.types.AbilityType.values.DEPART];

        if (this.renderCircle !== null) {
          this.renderCircle.radius -= this.playerSpeed;
          if (this.renderCircle.radius < 0) {
            this.renderCircle = null;
            this.wasActivated = true;
          }
        }

        if (ability.cooldown === 0) {
          this.renderCircle = null;
          this.wasActivated = false;
        } else if (this.renderCircle === null && !this.wasActivated) {
          this.renderCircle = {
            radius: this.abilityLastsTime * 30 * this.playerSpeed,
          };
        }
      }
    },
  },
};


function getScript(url, callback) {
  const request = new XMLHttpRequest();

  request.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      callback(this.responseText);
    }
  };

  request.open('GET', url, false);
  request.send();
}

function editScript(script) {
  // Example
    script = script.replace('PUT_HERE_ORIGINAL_CODE', `
    PUT_HERE_MODIFIED_CODE
  `);

  // Init
  script = script.replace('parcelRequire=function', `
    function capitalize(string = '') {
      return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
    }

    function getKeyByValue(object, value) {
      return Object.keys(object).find(key => object[key] === value);
    }

    function secondsFormat(time) {
      const minutes = Math.floor(time / 60);
      const seconds = time - minutes * 60;

      return \`\${minutes}:\${seconds < 10 ? '0' : ''}\${seconds}\`;
    }

    parcelRequire = function
  `);

  // Systems
  script = script.replace('var e=this.keys.difference(this.previousKeys),t=this.chatMessages.pop();', `
    client.gameState = this;

    if (client.initial) {
      client.init();
    }

    for (const system of Object.values(client.systems)) {
      if (system.mode) system.run(this);
    }

    var e=this.keys.difference(this.previousKeys),t=this.chatMessages.pop();
    ['ABILITY_ONE_KEY', 'ABILITY_TWO_KEY'].forEach(key => {
      this.keys.keyUp(client.types.KeyType.values[key]);
    });
  `);

  // onKeyDown
  script = script.replace('var o=document.getElementById("chat-input");', `
    var o=document.getElementById("chat-input");

    if (document.activeElement !== o) {
      client.keysPressed.add(i.code);

      for (const system of Object.values(client.systems)) {
        if (
          (system.keyCode instanceof Array && system.keyCode.every(code => client.keysPressed.has(code)))
          || system.keyCode === i.code
        ) {
          system.switch(client.gameState);
        }
      }
    }
  `);

  // onKeyUp
  script = script.replace('key:"onKeyUp",value:function(e){', `
  key:"onKeyUp",value:function(e){
    var o=document.getElementById("chat-input");

    if (document.activeElement !== o)
      client.keysPressed.delete(e.code),
  `);

  // onBlur
  script = script.replace('this.gameState.keys.clear(t.GameKeyMap[e.keyCode])', `
    undefined
  `);

  // Area
  script = script.replace('e.fillText((this.deathTimer/1e3).toFixed(0),r,a+6))', `
    e.fillText((this.deathTimer/1e3).toFixed(0),r,a+6));

    if (
      this === client.gameState.self.entity
      && client.gameState.self.entity.heroType === client.types.HeroType.values.REAPER
    ) {
      client.systems.reaperInvisInfo.draw(e, i);
    }
  `);

  // Drawing
  script = script.replace('t.font="bold "+e.default.font(35),t.textAlign="center",t.lineWidth=6,t.strokeStyle=this.titleStrokeColor,t.fillStyle=this.titleColor,t.strokeText(n,l,40),t.fillText(n,l,40),t.strokeStyle="#000000",t.lineWidth=1', `
    t.font = "bold " + e.default.font(35);
    t.textAlign = "center";
    t.lineWidth = 6;
    t.strokeStyle = this.titleStrokeColor;
    t.fillStyle = this.titleColor;
    t.strokeText(n, l, 40);
    t.fillText(n, l, 40);

    client.systems.timer.draw(client.gameState, t);

    t.lineWidth = 1;
    
    if (client.systems.info.mode) {
      client.systems.info.draw(client, t);
    }
    
    t.strokeStyle = '#000000';
    t.textAlign = 'center';
  `);

  // Init types
  script = script.replace('return(e.roots.default||(e.roots.default=new e.Root)).addJSON({', `
    return(e.roots.default||(e.roots.default=new e.Root)).addJSON(client.types = {
  `);

  // Init config
  script = script.replace('module.exports={client_tick_rate:30,', `
    module.exports = client.config = {client_tick_rate: 30,
  `);

  // Init abilities
  script = script.replace('key:"renderAbility",value:function(e,t,i,r,o,l,a,u){', `
    key:"renderAbility",value:function(e,t,i,r,o,l,a,u){
    client.abilities[t.abilityType] = t;
  `);

  return script;
}
