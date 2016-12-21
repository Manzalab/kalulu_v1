define([
    // './elements/account_button.js',
    './elements/activity_button.js',
    './elements/garden.js',
    './elements/garden_button.js',
    './elements/kalulu_character.js',
    './elements/lesson_dot.js',
    './elements/look_and_learn_button.js',
    './elements/minigame_button.js',
    './elements/path.js',
    './elements/plant.js',
    './elements/neuroenergy.js',
    './elements/play_button_tc.js',
    './elements/sprite_garden.js',
    // './popins/activities_menu.js',
    // './popins/clouds_popin.js',
    // './popins/select_mode_popin.js',
    // './popins/story.js',
    // './popins/video_player.js',
    // './screens/account_selection.js',
    // './screens/brain_screen.js',
    // './screens/garden_screen.js',
    // './screens/graphic_loader.js',
    // './screens/hud_crabs.js',
    // './screens/lesson_screen.js',
    // './screens/login_screen.js',
    './screens/title_card.js'
    // './screens/toy_chest_activity_screen.js',
    // './screens/toy_chest_screen.js',
    // './transitions/garden_transition.js'
], function (
    // AccountButton,
    ActivityButton,
    Garden,
    GardenButton,
    KaluluCharacter,
    LessonDot,
    LookAndLearnButton,
    MinigameButton,
    Path,
    Plant,
    Neuroenergy,
    PlayButtonTC,
    SpriteGarden,
    // ActivitiesMenu,
    // CloudsPopin,
    // SelectModePopin,
    // Story,
    // VideoPlayer,
    // AccountSelection,
    // BrainScreen,
    // GardenScreen,
    // GraphicLoader,
    // HudCrabs,
    // LessonScreen,
    // LoginScreen,
    TitleCard
    // ToyChestActivityScreen,
    // ToyChestScreen,
    // GardenTransition
) {

    'use strict';

    var registry = {
        // AccountButton : AccountButton,
        ActivityButton : ActivityButton,
        Garden : Garden,
        GardenButton : GardenButton,
        KaluluCharacter : KaluluCharacter,
        LessonDot : LessonDot,
        LookAndLearnButton : LookAndLearnButton,
        MinigameButton : MinigameButton,
        Path : Path,
        Plant : Plant,
        Neuroenergy : Neuroenergy,
        PlayButtonTC : PlayButtonTC,
        SpriteGarden : SpriteGarden,
        // UICloud : UICloud,
        // ActivitiesMenu : ActivitiesMenu,
        // CloudsPopin : CloudsPopin,
        // SelectModePopin : SelectModePopin,
        // Story : Story,
        // VideoPlayer : VideoPlayer,
        // AccountSelection : AccountSelection,
        // BrainScreen : BrainScreen,
        // GardenScreen : GardenScreen,
        // GraphicLoader : GraphicLoader,
        // HudCrabs : HudCrabs,
        // LessonScreen : LessonScreen,
        // LoginScreen : LoginScreen,
        TitleCard : TitleCard
        // ToyChestActivityScreen : ToyChestActivityScreen,
        // ToyChestScreen : ToyChestScreen,
        // GardenTransition : GardenTransition
    };

    var applyNew = function applyNew (cls, args) {
        args.unshift(undefined);
        return new (Function.prototype.bind.apply(cls, args));
    };

    window.registry = registry;

    function Type () {}

    Type.prototype.createInstance = function createInstance (className) {
        if (!registry[className]) return null;
        var args = Array.prototype.slice.call(arguments, 1);
        return applyNew(registry[className], args);
    };

    return new Type();
});