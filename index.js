const start = Date.now();
const vdf = require("simple-vdf");

var items_game = vdf.parse(require("fs").readFileSync("./data/items_game.txt", "utf8")).items_game;
var csgo_english = vdf.parse(require("fs").readFileSync("./data/csgo_english.txt", "utf16le"));
csgo_english = csgo_english[Object.keys(csgo_english)]; // Fuck UTF-16 Little Endian

var weapon_indexes = {};
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
	"studded_bloodhound_gloves",
	"ct_gloves",
	"sporty_gloves",
	"slick_gloves",
	"leather_handwraps",
	"motorcycle_gloves",
	"specialist_gloves",
	"studded_hydra_gloves",
	"t_gloves"
];
var item_rarities = ["default", "common", "uncommon", "rare", "mythical", "legendary", "ancient", "immortal", "unusual"];
var out = {
	paintkit_names: {},
	paintkit_ids: {},
	stickerkit_names: {},
	stickerkit_ids: {},
	stickerkits: [],
	weapon_skins: {}
};

var item_indexes = Object.keys(items_game.items);
for(var i = 0; i < item_indexes.length; i++) {
	if(!items_game.items[item_indexes[i]].name) continue;

	weapon_indexes[items_game.items[item_indexes[i]].name] = parseInt(item_indexes[i]);
}

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

var stickerkit_ids = Object.keys(items_game.sticker_kits);
for(var i = 0; i < stickerkit_ids.length; i++) {
	if(!items_game.sticker_kits[stickerkit_ids[i]].item_name) continue;

	var stickerkit_id = stickerkit_ids[i];
	var sticker_lang_key = items_game.sticker_kits[stickerkit_id].item_name.replace("#", "");
	var sticker_name = items_game.sticker_kits[stickerkit_id].name;

	var skin_lang_name = csgo_english.Tokens[sticker_lang_key];

	out.stickerkits.push(sticker_name);
	out.stickerkit_ids[sticker_name] = parseInt(stickerkit_id);
	out.stickerkit_names[sticker_name] = skin_lang_name;
}

var model_ids = Object.keys(items_game.alternate_icons2.weapon_icons);
for(var i = 0; i < model_ids.length; i++) {
	if(!items_game.alternate_icons2.weapon_icons[model_ids[i]].icon_path) continue;

	var weapon_skin_name = items_game.alternate_icons2.weapon_icons[model_ids[i]].icon_path.split("/")[2];

	if(weapon_skin_name.substr(-6, 6) == "_heavy") weapon_skin_name = weapon_skin_name.substr(0, weapon_skin_name.length - 6);
	if(weapon_skin_name.substr(-6, 6) == "_light") weapon_skin_name = weapon_skin_name.substr(0, weapon_skin_name.length - 6); // Cant use replace cuz volvo sux "weapon_awp_am <_light> ning_awp <_light>" <<
	if(weapon_skin_name.substr(-7, 7) == "_medium") weapon_skin_name = weapon_skin_name.substr(0, weapon_skin_name.length - 7);

	for(var j = 0; j < weapon_classes.length; j++) {
		if(weapon_skin_name.indexOf(weapon_classes[j]) == -1) continue;

		var weapon_name = weapon_classes[j];
		var skin_name = weapon_skin_name.replace(weapon_name + "_", "");

		out.weapon_skins[weapon_indexes[weapon_name]] = out.weapon_skins[weapon_indexes[weapon_name]] ? out.weapon_skins[weapon_indexes[weapon_name]] : {paintkit_names: [], paintkit_rarities: []};

		if(out.weapon_skins[weapon_indexes[weapon_name]].paintkit_names.indexOf(skin_name) == -1) {
			if(!out.paintkit_names[skin_name]) {
				console.log("Weapon '" + weapon_name + "' has skin '" + skin_name + "' but it was not found!");
				console.log(weapon_skin_name);
			}

			out.weapon_skins[weapon_indexes[weapon_name]].paintkit_names.push(skin_name);
			out.weapon_skins[weapon_indexes[weapon_name]].paintkit_rarities.push(item_rarities.indexOf(items_game.paint_kits_rarity[skin_name]));
		}

		break;
	}
}

var loot_lists = Object.keys(items_game.client_loot_lists);
for(var i = 0; i < loot_lists.length; i++) {
	var list_name = loot_lists[i];
	var list_name_parts = list_name.split("_");
	var rarity = item_rarities.indexOf(list_name_parts[list_name_parts.length - 1]);

	if(rarity == -1)
		continue;

	var list_paintkits = Object.keys(items_game.client_loot_lists[list_name]);
	for(var j = 0; j < list_paintkits.length; j++) {
		var paintkit_parts = list_paintkits[j].replace("[", "").split("]");

		if(paintkit_parts.length != 2)
			continue;

		var paintkit_name = paintkit_parts[0];
		var weapon_name = paintkit_parts[1];

		if(!weapon_indexes[weapon_name] || !out.weapon_skins[weapon_indexes[weapon_name]])
			continue;

		for(var k = 0; k < out.weapon_skins[weapon_indexes[weapon_name]].paintkit_names.length; k++) {
			if(out.weapon_skins[weapon_indexes[weapon_name]].paintkit_names[k] == paintkit_name) {
				out.weapon_skins[weapon_indexes[weapon_name]].paintkit_rarities[k] = rarity;

				break;
			}
		}
	}
}

for(var i = 0; i < weapon_classes.length; i++) {
	if(i >= weapon_classes.indexOf("weapon_bayonet"))
		break;

	if(!weapon_indexes[weapon_classes[i]] || !out.weapon_skins[weapon_indexes[weapon_classes[i]]])
		continue;

	if(out.weapon_skins[weapon_indexes[weapon_classes[i]]].paintkit_names.length > out.weapon_skins[weapon_indexes[weapon_classes[i]]].paintkit_rarities.length)
		console.log((out.weapon_skins[weapon_indexes[weapon_classes[i]]].paintkit_names.length - out.weapon_skins[weapon_indexes[weapon_classes[i]]].paintkit_rarities.length) + " paintkits for weapon '" + weapon_classes[i] + "' do not have a rarity!");
	else if(out.weapon_skins[weapon_indexes[weapon_classes[i]]].paintkit_names.length < out.weapon_skins[weapon_indexes[weapon_classes[i]]].paintkit_rarities.length)
		console.log((out.weapon_skins[weapon_indexes[weapon_classes[i]]].paintkit_rarities.length - out.weapon_skins[weapon_indexes[weapon_classes[i]]].paintkit_names.length) + " paintkits for weapon '" + weapon_classes[i] + "' do not have a name, but have a rarity!");

}

require("fs").writeFileSync("skins.json", JSON.stringify(out, null, "\t"));
console.log("Time elapsed: " + (Date.now() - start) + " ms");
