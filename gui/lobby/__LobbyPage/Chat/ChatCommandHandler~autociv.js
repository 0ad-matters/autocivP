ChatCommandHandler.prototype.ChatCommands["pingallOFFOFFOFFF_notWantedAnyMore_25-0204_1135-29"] = {
    "description": translate("Ping all 'Online' and 'Observer' players."),
    "ignoredUsers": new Set(),
    "ignoreListConfigKey": "autociv.lobby.pingPlayers.ignoreList",
    "handler": function (args)
    {
        warn('9: seems to be deprecated. seems comunty dont want this feature anymore. will be removed maybe in next version. 25-0204_1136-38')
        return false

        // the caller changes function call conte
        // xt, must grab original one
        const that = this.ChatCommands["pingall"]
        that.init()
        const selfNick = Engine.LobbyGetNick();
        const ignore = new Set([selfNick]);
        const candidatesToAnnoy = new Set();

        const gameList = g_LobbyHandler.lobbyPage.lobbyPage.panels.gameList.gameList;
        for (let game of gameList) {
            const players = game.players;
            const selfInHost = players.some(player => splitRatingFromNick(player.Name).nick == selfNick);

            for (let player of players)
                if (selfInHost){
                    ignore.add(splitRatingFromNick(player.Name).nick);
                    g_selfIsHost = selfInHost
                }
                else if (player.Team == "observer")
                    candidatesToAnnoy.add(splitRatingFromNick(player.Name).nick);
        }

        for (let player of Engine.GetPlayerList())
            if (player.presence == "available")
                candidatesToAnnoy.add(player.name);

        for (let v of ignore)
            candidatesToAnnoy.delete(v);

        for (let v of that.ignoredUsers)
            candidatesToAnnoy.delete(v);

        const annoyList = Array.from(candidatesToAnnoy).join(", ");

        Engine.LobbySendMessage(annoyList);
        if (args.trim())
            Engine.LobbySendMessage(args)

        return true;
    },
    "init": function () {
        if (this.__alreadyInit) return
        this.__alreadyInit = true

        this.loadIgnoredUserList()
        registerConfigChangeHandler(this.onConfigChanges.bind(this));
    },
    "loadIgnoredUserList": function () {
        let value = Engine.ConfigDB_GetValue("user", this.ignoreListConfigKey);
        this.ignoredUsers = new Set(value.split(",").map((value) => value.trim()));
    },
    "onConfigChanges": function (changes) {
        if (changes.has(this.ignoreListConfigKey))
            this.loadIgnoredUserList()
    }
};

ChatCommandHandler.prototype.ChatCommands["pingall"]["playing"] = {
    "description": translate("Set your state to 'Playing'."),
    "handler": function ()
    {
        Engine.LobbySetPlayerPresence("playing");
        return true;
    }
};
