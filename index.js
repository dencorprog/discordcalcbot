// const fs = require('fs');
// var logger = require('winston');
const axios = require('axios');
const Discord = require('discord.js');
const { token, limitlessID, limitlessCalcbotCh, myCalcbotCh, myBotCh } = require('./config.json');

const client = new Discord.Client();

client.once('ready', () => {
    console.log('Bot is running!')
})

function formatNumber(num) {
    return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
}

client.on('message', msg => {
    if (!(msg.content.startsWith('Session data') && msg.channel.id === limitlessCalcbotCh) || msg.author.bot) return;
    // channel hunt-boss-share on own discord: myCalcbotCh
    const lines = msg.content.split(`\n`);

    // msg.channel.send("Length of log is: " + lines.length);
    if (!Number.isInteger(lines.length / 6) || lines.length / 6 < 3) {
        msg.reply("Invalid party hunt analyser!");
        return;
    }

    const ptmembers = lines.length / 6 - 1;
    // msg.channel.send("Amount of party members: " + ptmembers);

    const totalbalance = parseInt(lines[5].split(" ")[1].replace(/,/g, ''));
    // msg.channel.send("Total balance is: " + totalbalance);

    let ptmember = [];
    let ptmemberbalance = [];
    let tbl = [];
    for (let i = 0; i <= ptmembers - 1; i++) {
        let tbltmp = [];
        ptmember[i] = lines[6 * (i + 1)].split("(")[0].trimRight();
        if (ptmember[i] === "Piglet Our" || ptmember[i] === "Kana Kid" || ptmember[i] === "Slime Junior"
            || ptmember[i] === "Artichunter" || ptmember[i] === "Jeoxheaa" || ptmember[i] === "Aquel Xelion" || ptmember[i] === "Stagknight") {
            msg.reply(`You are not supposed to hunt with ${ptmember[i]}`);
            return;
        }
        ptmemberbalance[i] = parseInt(lines[6 * (i + 1) + 3].trim().split(" ")[1].replace(/,/g, ''));
        // msg.channel.send("Party member " + i + ": " + ptmember[i] + "; balance: " + ptmemberbalance[i]);
        // console.log("Party member " + i + ": " + ptmember[i] + "; balance: " + ptmemberbalance[i]);
        tbltmp.push(ptmember[i]);
        tbltmp.push(ptmemberbalance[i]);
        tbl.push(tbltmp);
        // console.log(tbl);
    }


    console.log(tbl);
    // let avg = Math.round(totalbalance / ptmembers);
    const avg = tbl.reduce((a, c) => a + c[1], 0) / tbl.length;
    const sumbalance = avg * ptmembers;
    if (totalbalance !== sumbalance) {
        msg.reply("Why u mess with data??");
        return;
    }

    const avgr = Math.round(avg);
    // console.log(avgr);
    let sortedTbl = tbl.sort((a, b) => a[1] - b[1]);
    // console.log(sortedTbl);

    let first = 0;
    let last = sortedTbl.length - 1;
    let outcome = [];
    let transfers = [];
    while (first < last && sortedTbl[first][1] < avgr) {
        if (sortedTbl[last][1] > avgr) {
            const avgDiffer = Math.round(avgr - sortedTbl[first][1]);
            const minus = Math.round(sortedTbl[last][1] - (avgDiffer));

            if (minus >= avgr) {
                outcome.push(`**${sortedTbl[last][0]}** should give **${formatNumber(avgDiffer)}** gp to **${sortedTbl[first][0]}**`);
                transfers.push(`transfer ${avgDiffer} to ${sortedTbl[first][0]}`)
                sortedTbl[first][1] += avgDiffer;
                sortedTbl[last][1] = minus;
                first++;
            } else if (minus <= avgr) {
                const avgDiffer = Math.ceil(sortedTbl[last][1] - avgr);

                outcome.push(`**${sortedTbl[last][0]}** should give **${formatNumber(avgDiffer)}** gp to **${sortedTbl[first][0]}**`);
                transfers.push(`transfer ${avgDiffer} to ${sortedTbl[first][0]}`)
                sortedTbl[first][1] += avgDiffer;
                sortedTbl[last][1] -= avgDiffer;
                last--;
            } else break;
        } else break;
    };
    let msgreply = "";
    for (o = 0; o < outcome.length; o++) {
        msgreply += "\n" + outcome[o];
        msgreply += "\n" + transfers[o];
    }
    msgreply += "\nTotal profit: **" + formatNumber(totalbalance) + "** gp which is: **" + formatNumber(Math.round(avgr)) + "** gp for each player.";
    msg.reply(msgreply);
});

client.login("Njg0NTc1MDczMDUwNTU4NTky.XmTVMA.XnQ1hhq-DBBUPyVrGhMdXowZhPo");