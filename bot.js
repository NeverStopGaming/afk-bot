"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const mineflayer_1 = require("mineflayer");
const mineflayer_pathfinder_1 = require("mineflayer-pathfinder");
const config = __importStar(require("./config.json"));
config.accounts.forEach((account) => {
    joinServer(account);
});
function joinServer(options) {
    let bot = (0, mineflayer_1.createBot)(options);
    bot.loadPlugin(mineflayer_pathfinder_1.pathfinder);
    bot.once("spawn", () => {
        const mcData = require("minecraft-data")(bot.version);
        const defaultMove = new mineflayer_pathfinder_1.Movements(bot, mcData);
        defaultMove.allowFreeMotion = true;
        defaultMove.allowSprinting = true;
        defaultMove.bot.pathfinder.setMovements(defaultMove);
        bot.on("chat", (username, message) => {
            const msg = message.toString();
            if (!msg.startsWith(bot.username))
                return;
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
        });
        function followPlayer(playername) {
            const target = bot.players[playername]?.entity;
            if (!target) {
                bot.chat("I don't see you !");
                return;
            }
            bot.pathfinder.setGoal(new mineflayer_pathfinder_1.goals.GoalFollow(target, 3), true);
        }
        function avoidPlayer(playername) {
            const target = bot.players[playername]?.entity;
            if (!target) {
                bot.chat("I don't see you !");
                return;
            }
            bot.pathfinder.setGoal(new mineflayer_pathfinder_1.goals.GoalInvert(new mineflayer_pathfinder_1.goals.GoalFollow(target, 8)), true);
        }
        function comeToPlayer(playername) {
            const target = bot.players[playername]?.entity;
            if (!target) {
                bot.chat("I don't see you !");
                return;
            }
            const { x: playerX, y: playerY, z: playerZ } = target.position;
            bot.pathfinder.setGoal(new mineflayer_pathfinder_1.goals.GoalNear(playerX, playerY, playerZ, 1));
        }
    });
}
