const start = Date.now();
const vdf = require("simple-vdf");

var items_game = vdf.parse(require("fs").readFileSync("./data/items_game.txt", "utf8")).items_game;
var csgo_english = vdf.parse(require("fs").readFileSync("./data/csgo_english.txt", "utf16le"));
csgo_english = csgo_english[Object.keys(csgo_english)]; // Fuck UTF-16 Little Endian

var weapon_classes = [
	"weapon_deagle",
	"weapon_elite",
	"weapon_fiveseven",
	"weapon_glock",
	"weapon_hkp2000",
	"weapon_p250",
	"weapon_cz75a",
	"weapon_tec9",
	"weapon_bizon",
	"weapon_mac10",
	"weapon_mp7",
	"weapon_mp9",
	"weapon_p90",
	"weapon_ump45",
	"weapon_ak47",
	"weapon_aug",
	"weapon_famas",
	"weapon_galilar",
	"weapon_m4a1_silencer",
	"weapon_m4a1",
	"weapon_sg556",
	"weapon_awp",
	"weapon_g3sg1",
	"weapon_scar20",
	"weapon_ssg08",
	"weapon_mag7",
	"weapon_nova",
	"weapon_sawedoff",
	"weapon_xm1014",
	"weapon_m249",
	"weapon_negev",
	"weapon_decoy",
	"weapon_flashbang",
	"weapon_hegrenade",
	"weapon_incgrenade",
	"weapon_molotov",
	"weapon_smokegrenade",
	"weapon_usp_silencer",
	"weapon_revolver",
	"weapon_bayonet",
	"weapon_knife_flip",
	"weapon_knife_gut",
	"weapon_knife_karambit",
	"weapon_knife_m9_bayonet",
	"weapon_knife_tactical",
	"weapon_knife_falchion",
	"weapon_knife_survival_bowie",
	"weapon_knife_butterfly",
	"weapon_knife_push",
	"weapon_knife_default_ct",
	"weapon_knife_t",
	"weapon_studded_bloodhound_gloves",
	"weapon_t_gloves",
	"weapon_ct_gloves",
	"weapon_sporty_gloves",
	"weapon_slick_gloves",
	"weapon_leather_handwraps",
	"weapon_motorcycle_gloves",
	"weapon_specialist_gloves"
];
var out = {
	paintkit_names: {},
	paintkit_ids: {},
	weapon_skins: {}
};


var paintkit_ids = Object.keys(items_game.paint_kits);
for(var i = 0; i < paintkit_ids.length; i++) {
	if(!items_game.paint_kits[paintkit_ids[i]].description_tag) continue;
	
	var paintkit_id = paintkit_ids[i];
	var skin_lang_key = items_game.paint_kits[paintkit_id].description_tag.replace("#", "");
	var skin_name = items_game.paint_kits[paintkit_id].name;
	
	var skin_lang_name = csgo_english.Tokens[skin_lang_key] ? csgo_english.Tokens[skin_lang_key] : csgo_english.Tokens[skin_lang_key.replace("PaintKit_", "Paintkit_")];
	
	out.paintkit_ids[skin_name] = parseInt(paintkit_id);
	out.paintkit_names[skin_name] = skin_lang_name;
}

var model_ids = Object.keys(items_game.alternate_icons2.weapon_icons);
for(var i = 0; i < model_ids.length; i++) {
	if(!items_game.alternate_icons2.weapon_icons[model_ids[i]].icon_path) continue;
	
	var weapon_skin_name = items_game.alternate_icons2.weapon_icons[model_ids[i]].icon_path.split("/")[2]
	
	if(weapon_skin_name.substr(-6, 6) == "_heavy") weapon_skin_name = weapon_skin_name.substr(0, weapon_skin_name.length - 6);
	if(weapon_skin_name.substr(-6, 6) == "_light") weapon_skin_name = weapon_skin_name.substr(0, weapon_skin_name.length - 6); // Cant use replace cuz volvo sux "weapon_awp_am <_light> ning_awp <_light>" <<
	if(weapon_skin_name.substr(-7, 7) == "_medium") weapon_skin_name = weapon_skin_name.substr(0, weapon_skin_name.length - 7);
	
	for(var j = 0; j < weapon_classes.length; j++) {
		if(weapon_skin_name.indexOf(weapon_classes[j]) == -1) continue;
		
		var weapon_name = weapon_classes[j];
		var skin_name = weapon_skin_name.replace(weapon_classes[j] + "_", "");
		
		out.weapon_skins[weapon_name] = out.weapon_skins[weapon_name] ? out.weapon_skins[weapon_name] : [];
		
		if(out.weapon_skins[weapon_name].indexOf(skin_name) == -1) {
			if(!out.paintkit_names[skin_name]) {
				console.log("Weapon '" + weapon_name + "' has skin '" + skin_name + "' but it was not found!");
				console.log(weapon_skin_name);
			}
			
			out.weapon_skins[weapon_name].push(skin_name);
		}
		
		break;
	}
}

require("fs").writeFileSync("skins.json", JSON.stringify(out, null, "\t"));
console.log("Time elapsed: " + (Date.now() - start) + " ms");