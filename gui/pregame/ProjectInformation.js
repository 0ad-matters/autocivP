/**
 * IMPORTANT: Remember to update session/top_panel/BuildLabel.xml in sync with this.
 */


print('Projectinformaton.js:6\n')

/**
 * Determines if the autocivP module has just been installed.
 * true when a checkbox is 'true' or 'false'
 * @return {boolean} Returns true if the autocivP module has just been installed, false otherwise.
 *
 * BTW ( 23-0803_1713-24 ):
Using a mix of camelCase and snake_case in long names can be a reasonable approach in certain cases. It can help improve readability and make the name more descriptive, especially if the name contains multiple words or phrases.

For example, if you have a long name like isAutoCivPJustNowInstalled, you could consider using a mix of camelCase and snake_case to make it more readable, like is_autoCivP_just_now_installed.

The key is to strike a balance between readability and consistency within the codebase. It's important to ensure that is clear and understandable to other developers who may be working on the codebase.
 */


// ConfigDB_CreateAndSaveValueA26A27("user", `AudioTTS.lang`, Engine.GetLocaleLanguage());

function is_autocivP_just_now_installed() {


  // search for "type": "boolean", in  ***options***.json file/files

  /* ====> NOTE - dont use customrating becouse enabled by default <===

  */


  const isValid_showStartWhenUsingProGUI = isCheckBox_valid_boolean_string("autocivP.mod.showStartWhenUsingProGUI")
  const isValid_showIconWhenUsingAutocivP = isCheckBox_valid_boolean_string("autocivP.mod.showIconWhenUsingAutocivP")
  const isValid_noUsernameInGameName = isCheckBox_valid_boolean_string("autocivP.gamesetup.noUsernameInGameName")
  const isValid_inNextFullMinuteRemove00 = isCheckBox_valid_boolean_string("autocivP.gamesetup.gameStart.inNextFullMinuteRemove00")
  const isValid_showModsInGameName = isCheckBox_valid_boolean_string(
    "autocivP.gamesetup.gameStart.showModsInGameName")
  // const is_setuped_valid_for_Remove00 = (isValid_inNextFullMinuteRemove00 === 'true' || isValid_inNextFullMinuteRemove00 === 'false')

  const isACheckboxValid =
    (isValid_showStartWhenUsingProGUI
      || isValid_showIconWhenUsingAutocivP
      || isValid_noUsernameInGameName
      || isValid_inNextFullMinuteRemove00
      || isValid_showModsInGameName)

  // g_selfNick =="seeh" &&
  if (!isACheckboxValid) { //NOTE -developers want to see the error in the console
    // warn(`is_setuped_valid: ${isACheckboxValid}`)
    // warn(`==> inNextFullMinuteRemove00: ${isValid_inNextFullMinuteRemove00}`)

    // set something explicitly to false or true so we dont get an always its fresh installed true

    // true becouse showStartWhenUsingProGUI i great :)
    ConfigDB_CreateAndSaveValueA26A27("user", "autocivP.mod.showStartWhenUsingProGUI", 'true');

    const importantNote = "Some changes may require a restart of the game\n" +
      "(like when you change the mod profile).\n" +
      "Then the game restart.\n" +
      "Not a bug, it's a feature ;)\n" +
      "If you have any questions, please feel free to ask. Thank you.";

    messageBox(
      500,
      300,
      importantNote,
      "Important Installation Note:\n",
      ["Ok"],
      [() => { }, () => { }]
    );

  }
  return !(isACheckboxValid)

}

function isCheckBox_valid_boolean_string(booleanCheckboxName) {
  const value = Engine.ConfigDB_GetValue(
    "user",
    booleanCheckboxName)
  // warn(`value = ${value}`)
  return (value === 'true' || value === 'false')
}


// Engine.BroadcastMessage("message", {   "message": "Changes saved",   "duration": 5  });`


setDefaultsInPersonalizationOnNewInstallation()

/**
 * Sets defaults in personalization on new installation.
 *
 * @return {undefined} No return value.
 */
function setDefaultsInPersonalizationOnNewInstallation() {
  if (is_autocivP_just_now_installed()) {
    // set a example default value when the mod was never installed before
    // const value = 'Do you like: Auto-save Drafts in Chat? Never Lose Your Message Again'
    const value2 = '0 A.D. Friendly Tournament'
    ConfigDB_CreateAndSaveValueA26A27("user", 'autocivP.gamesetup.gameStart.string', value2);
    ConfigDB_CreateAndSaveValueA26A27("user", 'autocivP.msg.helloAll', 'hi all :)');
    ConfigDB_CreateAndSaveValueA26A27("user", 'autocivP.msg.me', 'Do you like: Auto-save Drafts in Chat?');
    ConfigDB_CreateAndSaveValueA26A27("user", 'autocivP.msg.meURL', 'https://www.youtube.com/@plan0go or search for plan0go');
  }
}

/**
 * Retrieves the metadata for a replay.
 *
 * @return {Array} The replay metadata sorted by file modification time.
 */
function getReplayMetadata() {
  let replayList = Engine.GetReplays().sort(function (x, y) {
    // warn(`x.fileMTime = ${x.fileMTime}`);
    // warn(`x.fileMTime = ${y.fileMTime}`);
    return x.fileMTime - y.fileMTime;
  });

  const replayListKeys = Object.keys(replayList);
  for (let key of replayListKeys) {
    warn(`key = ${key}`);
    const replayListKeys2 = Object.keys(replayListKeys[key]);
    for (let key2 of replayListKeys2) {
      warn(`   key2 = ${key2}`);
      warn(`   val2 = ${replayListKeys2[key2]}`);
      // const replayListKeys = Object.keys(replayList);
    }
  }
}
// getReplayMetadata()
// warn(`g_GameData.gui.replayDirectory = ${g_GameData.gui.replayDirectory}`);




function get_modsString() {
  let modsString = '';
  const modsObj = Engine.GetEngineInfo().mods
  for (let [key, value] of Object.entries(modsObj)) {
    if (key < 1) continue;
    for (let [key2, value2] of Object.entries(Engine.GetEngineInfo().mods[key])) {
      if (key2 != 'name' && key2 != 'version') continue;
      modsString += ` ${value2}`; // mod/name/version : ...
    }
  }
  return modsString
}
let modsString = get_modsString()
var g_autocivPVersion = get_autocivPVersion()

const versionName = Engine.GetEngineInfo().mods[0]['name'];

if (versionName != '0ad')
  error(versionName + ' | ' + versionOf0ad + '. name should by 0ad. hmmm. strange.');

modsString = modsString.replace(/\s+([a-z])/gi, "\n$1");
modsString = modsString.replace(/\s+(proGUI)/g, "\n$1(boonGUI, BetterQuickStart)");
modsString = modsString.replace(/\s+(autocivP)/gi, "\nAutoCivP(AutoCiv)");









function toRoman(num) {
  if (num < 1 || num > 3999) {
    return "Number out of range (1-3999)";
  }

  const romanMap = {
    M: 1000,
    CM: 900,
    D: 500,
    CD: 400,
    C: 100,
    XC: 90,
    L: 50,
    XL: 40,
    X: 10,
    IX: 9,
    V: 5,
    IV: 4,
    I: 1,
  };

  let roman = "";
  for (const key in romanMap) {
    while (num >= romanMap[key]) {
      roman += key;
      num -= romanMap[key];
    }
  }

  return roman;
}

// warn(`toRoman: ${toRoman(revisionNumber)}`);



var g_ProjectInformation = {
  "organizationName": {
    "caption": translate("WILDFIRE GAMES")
  },
  "organizationLogo": {
    "sprite": "WildfireGamesLogo"
  },
  "productLogo": {
    "sprite": "0ADLogo"
  },
  "productBuild": {
    "caption": getBuildString()
  },
  "productDescription": {
    "caption":
      ((modsString.length < 110) ? setStringTags(translate(`Alpha ${toRoman(revisionNumber)} Agni`), { "font": "sans-bold-18" })
        + setStringTags(translate(`(${revisionNumber})`, { "font": "sans-bold-8" }))
        + "\n" : '')
      +
      setStringTags(translate(modsString.trim(), { "font": "sans-16" }))
      + "\n"
  }
  // idk whats the smallest font size. maybe 8 do not is realy 8. mabe larger.

};

// Alpha 26 XXVI: Zhuangzi
// 0 A.D. Alpha 27: Agni

// var g_ProjectInformation = {
// 	"organizationName": {
// 		"caption": translate("WILDFIRE GAMES")
// 	},
// 	"organizationLogo": {
// 		"sprite": "WildfireGamesLogo"
// 	},
// 	"productLogo": {
// 		"sprite": "0ADLogo"
// 	},
// 	"productBuild": {
// 		"caption": getBuildString()
// 	},
// 	"productDescription": {
// 		"caption": `${setStringTags(translate(modsString.trim(), { "font": "sans-16" }))
// 		 + "\n"
// 		 + setStringTags(translate(`autocivP ${Engine.GetEngineInfo().mods.find(obj => obj.name == "autocivP").version}`), { "font": "sans-16" })}`
// 		 + "\n"
// 	}
// };


var g_CommunityButtons = [

  {
    "caption": translate("Website"),
    "tooltip": translate("Click to open play0ad.com in your web browser."),
    "size": "8 100%-144 50%-4 100%-116",
    "onPress": () => {
      Engine.OpenURL("https://play0ad.com/");
    }
  },
  {
    "caption": translate("Chat"),
    "tooltip": translate("Click to open the 0 A.D. IRC chat in your browser (#0ad on webchat.quakenet.org). It is run by volunteers who do all sorts of tasks, it may take a while to get your question answered. Alternatively, you can use the forum (see Website)."),
    "size": "50%+4 100%-144 100%-8 100%-116",
    "onPress": () => {
      Engine.OpenURL("https://webchat.quakenet.org/?channels=0ad");
    }
  },
  {
    "caption": translate("Report a Bug"),





    "tooltip": translate("Click to visit 0 A.D. Trac to report a bug, crash, or error."),
    "size": "8 100%-108 50%-4 100%-80",
    "onPress": () => {
      Engine.OpenURL("https://trac.wildfiregames.com/wiki/ReportingErrors/");
    }
  },
  {
    "caption": translateWithContext("Frequently Asked Questions", "FAQ"),
    "tooltip": translate("Click to visit the Frequently Asked Questions page in your browser."),
    "size": "50%+4 100%-108 100%-8 100%-80",
    "onPress": () => {
      Engine.OpenURL("https://trac.wildfiregames.com/wiki/FAQ");
    }
  },
  {
    "caption": translate("Translate the Game"),
    "tooltip": translate("Click to open the 0 A.D. translate page in your browser."),
    "size": "8 100%-72 100%-8 100%-44",
    "onPress": () => {
      Engine.OpenURL("https://trac.wildfiregames.com/wiki/Localization");
    }
  },
  {
    "caption": translate("Donate"),
    "tooltip": translate("Help with the project expenses by donating."),
    "size": "8 100%-36 100%-8 100%-8",
    "onPress": () => {
      Engine.OpenURL("https://play0ad.com/community/donate/");
    }
  }
];






// messageBox(
// 	400, 200,
// 	translate("need a resart"),
// 	translate("eed a resart"),
// 	[translate("Yes"), translate("Yes")],
// 	[null, null]
//   );
