import { BotOptions, createBot } from "mineflayer";
import { pathfinder, Movements, goals } from "mineflayer-pathfinder";
import { plugin } from "mineflayer-pvp";

import * as config from "./config.json";

config.accounts.forEach((account) => {
  joinServer(account as BotOptions);
});

function joinServer(options: BotOptions) {
  let bot = createBot(options);

  bot.loadPlugin(pathfinder);
  bot.loadPlugin(plugin);

  bot.once("spawn", () => {
    const mcData = require("minecraft-data")(bot.version);
    const defaultMove = new Movements(bot, mcData);

    defaultMove.allowFreeMotion = true;
    defaultMove.allowSprinting = true;
    defaultMove.bot.pathfinder.setMovements(defaultMove);

    bot.on("chat", (username: string, message: string) => {
      const msg = message.toString();

      if (!msg.startsWith(bot.username)) return;

      const command = msg.split(" ")[1];
      const args = msg.split(" ").slice(2);

      if (command === "say") {
        bot.chat(args.join(" "));
      }

      if (command === "come") {
        comeToPlayer(username);
      }

      if (command === "follow") {
        followPlayer(username);
      }

      if (command === "avoid") {
        avoidPlayer(args[0]);
      }

      if (command === "stop") {
        bot.pathfinder.setGoal(null);
      }

      if (command === "kill") {
        const target = bot.players[args[0]]?.entity;

        if (!target) {
          bot.chat("I don't see you !");
          return;
        }

        bot.pvp.attack(target);
      }

      if (command === "stopkill") {
        bot.pvp.stop();
      }

      if (command === "drop") {
        const slot = args[0];
        bot.toss(parseInt(slot, 10), null, 1);
      }

      if (command === "slot") {
        const slot = args[0];
        bot.setQuickBarSlot(parseInt(slot, 10));
      }
    });

    function followPlayer(playername: string) {
      const target = bot.players[playername]?.entity;

      if (!target) {
        bot.chat("I don't see you !");
        return;
      }

      bot.pathfinder.setGoal(new goals.GoalFollow(target, 3), true);
    }

    function avoidPlayer(playername: string) {
      const target = bot.players[playername]?.entity;

      if (!target) {
        bot.chat("I don't see you !");
        return;
      }

      bot.pathfinder.setGoal(
        new goals.GoalInvert(new goals.GoalFollow(target, 8)),
        true
      );
    }

    function comeToPlayer(playername: string) {
      const target = bot.players[playername]?.entity;

      if (!target) {
        bot.chat("I don't see you !");
        return;
      }
      const { x: playerX, y: playerY, z: playerZ } = target.position;

      bot.pathfinder.setGoal(new goals.GoalNear(playerX, playerY, playerZ, 1));
    }
  });
}
