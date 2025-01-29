class AnimatedAnxiety {
  static init() {
    console.log("AnimatedAnxiety | Initializing");
    game.animatedAnxiety = this;
    this.registerSettings();
    this.setupHooks();
    this.preloadImages();
  }

  static preloadImages() {
    const imagePaths = [
      "modules/animatedanxiety/assets/blinded.png",
      "modules/animatedanxiety/assets/bleeding.png",
      "modules/animatedanxiety/assets/bushesTrimmed.png",
      "modules/animatedanxiety/assets/burrowing.png",
      "modules/animatedanxiety/assets/concentration.png",
      "modules/animatedanxiety/assets/cursed.png",
      "modules/animatedanxiety/assets/Cupid.png",
      "modules/animatedanxiety/assets/death.png",
      "modules/animatedanxiety/assets/deafened.png",
      "modules/animatedanxiety/assets/dodge.png",
      "modules/animatedanxiety/assets/ethereal.png",
      "modules/animatedanxiety/assets/exhausted.png",
      "modules/animatedanxiety/assets/feathers.png",
      "modules/animatedanxiety/assets/feather.png",
      "modules/animatedanxiety/assets/Frightened.png",
      "modules/animatedanxiety/assets/Hands.png",
      "modules/animatedanxiety/assets/hovering.png",
      "modules/animatedanxiety/assets/incapacitated.png",
      "modules/animatedanxiety/assets/invisible.png",
      "modules/animatedanxiety/assets/marked.png",
      "modules/animatedanxiety/assets/paralyzed.png",
      "modules/animatedanxiety/assets/pentagram1.png",
      "modules/animatedanxiety/assets/pentagram2.png",
      "modules/animatedanxiety/assets/pentagram3.png",
      "modules/animatedanxiety/assets/pentagram4.png",
      "modules/animatedanxiety/assets/poisoned.png",
      "modules/animatedanxiety/assets/prone.png",
      "modules/animatedanxiety/assets/rats.png",
      "modules/animatedanxiety/assets/restrained.png",
      "modules/animatedanxiety/assets/rocksClipped.png",
      "modules/animatedanxiety/assets/silenced.png",
      "modules/animatedanxiety/assets/sleep.png",
      "modules/animatedanxiety/assets/stable.png",
      "modules/animatedanxiety/assets/stunned.png",
      "modules/animatedanxiety/assets/surprised.png",
      "modules/animatedanxiety/assets/transformed.png",
      "modules/animatedanxiety/assets/trapeze.png",
      "modules/animatedanxiety/assets/unconscious.png",
      "modules/animatedanxiety/assets/veins.png",
    ];

    this.preloadedImages = new Map();

    imagePaths.forEach((path) => {
      const img = new Image();
      img.src = path;
      this.preloadedImages.set(path, img);
    });
  }

  static registerSettings() {
    game.settings.register("animatedanxiety", "enabled", {
      name: "Turn On/Off Anxiety Effects",
      hint: "Toggle the anxiety effects on/off",
      scope: "client",
      config: true,
      type: Boolean,
      default: true,
      onChange: () => this.updateAnxietyEffect(game.user?.character),
    });

    game.settings.register("animatedanxiety", `enable_anxiety`, {
      name: `Enable Low Health Effect`,
      hint: `Toggle the low health effect animation`,
      scope: "client",
      config: true,
      type: Boolean,
      default: true,
      onChange: () => this.updateAnxietyEffect(game.user?.character),
    });

    game.settings.register("animatedanxiety", "anxietyThreshold", {
      name: "Anxiety Effect Threshold",
      hint: "Health percentage at which the anxiety effect begins (1-100)",
      scope: "client",
      config: true,
      type: Number,
      range: {
        min: 1,
        max: 100,
        step: 1,
      },
      default: 50,
      onChange: () => this.updateAnxietyEffect(game.user?.character),
    });

    game.settings.register("animatedanxiety", "showVeins", {
      name: "Show Low Health Veins Overlay",
      hint: "Show the veins overlay effect when health is critical (below 20%)",
      scope: "client",
      config: true,
      type: Boolean,
      default: true,
      onChange: () => this.updateAnxietyEffect(game.user?.character),
    });

    game.settings.register("animatedanxiety", "veinsThreshold", {
      name: "Critical Health Veins Threshold",
      hint: "Health percentage at which the veins overlay appears (1-100)",
      scope: "client",
      config: true,
      type: Number,
      range: {
        min: 1,
        max: 100,
        step: 1,
      },
      default: 20,
      onChange: () => this.updateAnxietyEffect(game.user?.character),
    });

    const statusEffects = {
      // anxiety: "Low Health",
      unconscious: "Unconscious",
      poisoned: "Poisoned",
      bleeding: "Bleeding",
      blinded: "Blinded",
      cursed: "Cursed",
      charmed: "Charmed",
      concentrating: "Concentrating",
      deafened: "Deafened",
      diseased: "Diseased",
      frightened: "Frightened",
      grappled: "Grappled",
      hiding: "Hiding",
      petrified: "Petrified",
      paralyzed: "Paralyzed",
      restrained: "Restrained",
      incapacitated: "Incapacitated",
      dead: "Dead",
      burrowing: "Burrowing",
      dodging: "Dodging",
      ethereal: "Ethereal",
      exhausted: "Exhausted",
      flying: "Flying",
      hovering: "Hovering",
      invisible: "Invisible",
      marked: "Marked",
      prone: "Prone",
      silenced: "Silenced",
      sleeping: "Sleeping",
      stable: "Stable",
      stunned: "Stunned",
      surprised: "Surprised",
      transformed: "Transformed",
      halfCover: "Half Cover",
      threeQuartersCover: "Three-Quarters Cover",
      totalCover: "Total Cover",
      burning: "Burning",
      dehydration: "Dehydration",
      falling: "Falling",
      malnutrition: "Malnutrition",
      suffocation: "Suffocation",
    };

    // Register a setting for each status effect
    for (const [key, label] of Object.entries(statusEffects)) {
      game.settings.register("animatedanxiety", `enable_${key}`, {
        name: `Enable ${label} Effect`,
        hint: `Toggle the ${label.toLowerCase()} effect animation`,
        scope: "client",
        config: true,
        type: Boolean,
        default: true,
        onChange: () => this.updateAnxietyEffect(game.user?.character),
      });

      // Add new overlay toggle
      game.settings.register("animatedanxiety", `enable_${key}_overlay`, {
        name: `Show ${label} Overlay Image`,
        hint: `Toggle the ${label.toLowerCase()} overlay image. If disabled, only shows effects and auras.`,
        scope: "client",
        config: true,
        type: Boolean,
        default: true,
        onChange: () => this.updateAnxietyEffect(game.user?.character),
      });
    }

    game.settings.register("animatedanxiety", "maxSpeed", {
      name: "Maximum Animation Speed",
      hint: "How fast the animation pulses at lowest health (in seconds)",
      scope: "client",
      config: true,
      type: Number,
      range: {
        min: 0.1,
        max: 2.0,
        step: 0.1,
      },
      default: 0.6,
      onChange: () => this.updateAnxietyEffect(game.user?.character),
    });

    game.settings.register("animatedanxiety", "blurAmount", {
      name: "Blur Intensity",
      hint: "How far the effect bleeds into the screen (in pixels)",
      scope: "client",
      config: true,
      type: Number,
      range: {
        min: 20,
        max: 400,
        step: 20,
      },
      default: 200,
      onChange: () => this.updateAnxietyEffect(game.user?.character),
    });
  }

  static setupHooks() {
    // Initialize on ready
    Hooks.on("ready", () => {
      // Initial check for character health
      if (game.user?.character) {
        this.updateAnxietyEffect(game.user.character);
      }
    });

    // Watch for actor updates
    Hooks.on("updateActor", (actor, changes) => {
      const userCharacter = game.user?.character;
      if (!userCharacter || actor.id !== userCharacter.id) return;

      // Only update if HP changed
      if (changes.system?.attributes?.hp) {
        this.updateAnxietyEffect(actor);
      }
    });

    // Watch for effects updates
    Hooks.on("updateActiveEffect", (effect, changes, options, userId) => {
      const userCharacter = game.user?.character;
      if (!userCharacter || effect.parent?.id !== userCharacter.id) return;

      this.updateAnxietyEffect(userCharacter);
    });

    // Watch for effects updates
    Hooks.on("createActiveEffect", (effect, options, userId) => {
      const userCharacter = game.user?.character;
      if (!userCharacter || effect.parent?.id !== userCharacter.id) return;
      this.updateAnxietyEffect(userCharacter);
    });

    Hooks.on("deleteActiveEffect", (effect, options, userId) => {
      const userCharacter = game.user?.character;
      if (!userCharacter || effect.parent?.id !== userCharacter.id) return;
      this.updateAnxietyEffect(userCharacter);
    });
  }

  static updateAnxietyEffect(actor) {
    try {
      if (!game.settings.get("animatedanxiety", "enabled")) {
        this.clearEffects();
        return;
      }

      const healthPercent = this.getHealthPercentage(actor);
      const isPoisoned = this.checkPoisonedStatus(actor);
      const isUnconscious = this.checkUnconsciousStatus(actor);
      const isBleeding = this.checkBleedingStatus(actor);
      const isBlinded = this.checkBlindedStatus(actor);
      const isCursed = this.checkCursedStatus(actor);
      const isCharmed = this.checkCharmedStatus(actor);
      const isConcentrating = this.checkConcentratingStatus(actor);
      const isDeafened = this.checkDeafenedStatus(actor);
      const isDiseased = this.checkDiseasedStatus(actor);
      const isFrightened = this.checkFrightenedStatus(actor);
      const isGrappled = this.checkGrappledStatus(actor);
      const isHiding = this.checkHidingStatus(actor);
      const isPetrified = this.checkPetrifiedStatus(actor);
      const isParalyzed = this.checkParalyzedStatus(actor);
      const isRestrained = this.checkRestrainedStatus(actor);
      const isIncapacitated = this.checkIncapacitatedStatus(actor);
      const isDead = this.checkDeadStatus(actor);
      const isBurrowing = this.checkBurrowingStatus(actor);
      const isDodging = this.checkDodgeStatus(actor);
      const isEthereal = this.checkEtherealStatus(actor);
      const isExhausted = this.checkExhaustionStatus(actor);
      const isFlying = this.checkFlyingStatus(actor);
      const isHovering = this.checkHoveringStatus(actor);
      const isInvisible = this.checkInvisibleStatus(actor);
      const isMarked = this.checkMarkedStatus(actor);
      const isProne = this.checkProneStatus(actor);
      const isSilenced = this.checkSilencedStatus(actor);
      const isSleeping = this.checkSleepingStatus(actor);
      const isStable = this.checkStableStatus(actor);
      const isStunned = this.checkStunnedStatus(actor);
      const isSurprised = this.checkSurprisedStatus(actor);
      const isTransformed = this.checkTransformedStatus(actor);
      const isHalfCover = this.checkHalfCoverStatus(actor);
      const isThreeQuartersCover = this.checkThreeQuartersCoverStatus(actor);
      const isTotalCover = this.checkTotalCoverStatus(actor);
      const isBurning = this.checkBurningStatus(actor);
      const isDehydration = this.checkDehydrationStatus(actor);
      const isFalling = this.checkFallingStatus(actor);
      const isMalnutrition = this.checkMalnutritionStatus(actor);
      const isSuffocating = this.checkSuffocationStatus(actor);

      const appElement = document.getElementById("interface");
      if (!appElement) {
        console.error("AnimatedAnxiety | Could not find interface element");
        return;
      }

      // Clear all existing effects first
      this.clearEffects();
      appElement.classList.remove(
        "anxiety-effect",
        "poison-effect",
        "unconscious-effect",
        "blinded-effect",
        "concentration-effect",
        "deafened-effect",
        "diseased-effect",
        "frightened-effect",
        "grappled-effect",
        "hiding-effect",
        "petrified-effect",
        "paralyzed-effect",
        "restrained-effect",
        "incapacitated-effect",
        "dead-effect",
        "burrowing-effect",
        "dodge-effect",
        "ethereal-effect",
        "exhaustion-effect",
        "flying-effect",
        "hovering-effect",
        "invisible-effect",
        "marked-effect",
        "prone-effect",
        "silenced-effect",
        "sleeping-effect",
        "stable-effect",
        "stunned-effect",
        "surprised-effect",
        "transformed-effect",
        "deafened-fade",
        "diseased-fade",
        "frightened-fade",
        "grappled-fade",
        "hiding-fade",
        "petrified-fade",
        "paralyzed-fade",
        "restrained-fade",
        "incapacitated-fade",
        "burrowing-fade",
        "dodge-fade",
        "ethereal-fade",
        "exhaustion-fade",
        "prone-fade",
        "marked-fade",
        "invisible-fade",
        "hovering-fade",
        "flying-fade",
        "silenced-fade",
        "sleeping-fade",
        "stable-fade",
        "stunned-fade",
        "surprised-fade",
        "transformed-fade",
        "charmed-fade",
        "bleeding-fade",
        "dead-fade",
        "cursed-fade",
        "half-cover-effect",
        "three-quarters-cover-effect",
        "total-cover-effect",
        "half-cover-fade",
        "three-quarters-cover-fade",
        "total-cover-fade",
        "burning-effect",
        "burning-fade",
        "dehydration-effect",
        "dehydration-fade",
        "falling-effect",
        "falling-fade",
        "malnutrition-effect",
        "malnutrition-fade",
        "suffocation-effect",
        "suffocation-fade"
      );

      // Handle static effects
      if (
        healthPercent < 50 &&
        game.settings.get("animatedanxiety", "enable_anxiety")
      ) {
        appElement.classList.add("anxiety-effect");
      }
      if (isBlinded && game.settings.get("animatedanxiety", "enable_blinded")) {
        appElement.classList.add("blinded-effect");
        this.createBlindedEffect();
      }
      if (
        isDeafened &&
        game.settings.get("animatedanxiety", "enable_deafened")
      ) {
        // Add this block
        appElement.classList.add("deafened-effect");
        this.createDeafenedRipples();
      }
      // Add unconscious handler here as a static effect
      if (
        isUnconscious &&
        game.settings.get("animatedanxiety", "enable_unconscious")
      ) {
        appElement.classList.add("unconscious-effect");
        this.createBubbles("black-inward");
      }

      // Handle animated effects in order of priority
      if (isDead && game.settings.get("animatedanxiety", "enable_dead")) {
        appElement.classList.add("dead-effect");
        this.createDeadEffect();
      } else if (
        isGrappled &&
        game.settings.get("animatedanxiety", "enable_grappled")
      ) {
        appElement.classList.add("grappled-effect");
        this.createGrappledEffect();
      } else if (
        isRestrained &&
        game.settings.get("animatedanxiety", "enable_restrained")
      ) {
        appElement.classList.add("restrained-effect");
        this.createRestrainedEffect();
      } else if (
        isPetrified &&
        game.settings.get("animatedanxiety", "enable_petrified")
      ) {
        appElement.classList.add("petrified-effect");
        this.createPetrifiedEffect();
      } else if (
        isParalyzed &&
        game.settings.get("animatedanxiety", "enable_paralyzed")
      ) {
        appElement.classList.add("paralyzed-effect");
        this.createParalyzedEffect();
      } else if (
        isStunned &&
        game.settings.get("animatedanxiety", "enable_stunned")
      ) {
        appElement.classList.add("stunned-effect");
        this.createStunnedEffect();
      } else if (
        isHiding &&
        game.settings.get("animatedanxiety", "enable_hiding")
      ) {
        appElement.classList.add("hiding-effect");
        this.createHidingEffect();
      } else if (
        isPoisoned &&
        game.settings.get("animatedanxiety", "enable_poisoned")
      ) {
        appElement.classList.add("poison-effect");
        this.createBubbles("sway");
      } else if (
        isDiseased &&
        game.settings.get("animatedanxiety", "enable_diseased")
      ) {
        appElement.classList.add("diseased-effect");
        this.createDiseaseParticles();
      } else if (
        isFrightened &&
        game.settings.get("animatedanxiety", "enable_frightened")
      ) {
        appElement.classList.add("frightened-effect");
        this.createFrightenedMarks();
      } else if (
        isCursed &&
        game.settings.get("animatedanxiety", "enable_cursed")
      ) {
        this.createCurseSymbols();
      } else if (
        isCharmed &&
        game.settings.get("animatedanxiety", "enable_charmed")
      ) {
        this.createHearts();
      } else if (
        isBleeding &&
        game.settings.get("animatedanxiety", "enable_bleeding")
      ) {
        this.createBloodStreaks();
      } else if (
        isDodging &&
        game.settings.get("animatedanxiety", "enable_dodging")
      ) {
        appElement.classList.add("dodge-effect");
        this.createDodgeEffect();
      } else if (
        isIncapacitated &&
        game.settings.get("animatedanxiety", "enable_incapacitated")
      ) {
        appElement.classList.add("incapacitated-effect");
        this.createIncapacitatedEffect();
      } else if (
        isBurrowing &&
        game.settings.get("animatedanxiety", "enable_burrowing")
      ) {
        appElement.classList.add("burrowing-effect");
        this.createBurrowingEffect();
      } else if (
        isEthereal &&
        game.settings.get("animatedanxiety", "enable_ethereal")
      ) {
        appElement.classList.add("ethereal-effect");
        this.createEtherealEffect();
      } else if (
        isExhausted &&
        game.settings.get("animatedanxiety", "enable_exhausted")
      ) {
        appElement.classList.add("exhaustion-effect");
        this.createExhaustionEffect();
      } else if (
        isMarked &&
        game.settings.get("animatedanxiety", "enable_marked")
      ) {
        appElement.classList.add("marked-effect");
        this.createMarkedEffect();
      } else if (
        isInvisible &&
        game.settings.get("animatedanxiety", "enable_invisible")
      ) {
        appElement.classList.add("invisible-effect");
        this.createInvisibleEffect();
      } else if (
        isHovering &&
        game.settings.get("animatedanxiety", "enable_hovering")
      ) {
        appElement.classList.add("hovering-effect");
        this.createHoveringEffect();
      } else if (
        isFlying &&
        game.settings.get("animatedanxiety", "enable_flying")
      ) {
        appElement.classList.add("flying-effect");
        this.createFlyingEffect();
      } else if (
        isSilenced &&
        game.settings.get("animatedanxiety", "enable_silenced")
      ) {
        appElement.classList.add("silenced-effect");
        this.createSilencedEffect();
      } else if (
        isSleeping &&
        game.settings.get("animatedanxiety", "enable_sleeping")
      ) {
        appElement.classList.add("sleeping-effect");
        this.createSleepingEffect();
      } else if (
        isStable &&
        game.settings.get("animatedanxiety", "enable_stable")
      ) {
        appElement.classList.add("stable-effect");
        this.createStableEffect();
      } else if (
        isSurprised &&
        game.settings.get("animatedanxiety", "enable_surprised")
      ) {
        appElement.classList.add("surprised-effect");
        this.createSurprisedEffect();
      } else if (
        isHalfCover &&
        game.settings.get("animatedanxiety", "enable_halfCover")
      ) {
        appElement.classList.add("half-cover-effect");
        this.createCoverEffect("half");
      } else if (
        isThreeQuartersCover &&
        game.settings.get("animatedanxiety", "enable_threeQuartersCover")
      ) {
        appElement.classList.add("three-quarters-cover-effect");
        this.createCoverEffect("three-quarters");
      } else if (
        isTotalCover &&
        game.settings.get("animatedanxiety", "enable_totalCover")
      ) {
        appElement.classList.add("total-cover-effect");
        this.createCoverEffect("total");
      } else if (
        isBurning &&
        game.settings.get("animatedanxiety", "enable_burning")
      ) {
        appElement.classList.add("burning-effect");
        this.createBurningEffect();
      } else if (
        isDehydration &&
        game.settings.get("animatedanxiety", "enable_dehydration")
      ) {
        appElement.classList.add("dehydration-effect");
        this.createDehydrationEffect();
      } else if (
        isFalling &&
        game.settings.get("animatedanxiety", "enable_falling")
      ) {
        appElement.classList.add("falling-effect");
        this.createFallingEffect();
      } else if (
        isMalnutrition &&
        game.settings.get("animatedanxiety", "enable_malnutrition")
      ) {
        appElement.classList.add("malnutrition-effect");
        this.createMalnutritionEffect();
      } else if (
        isSuffocating &&
        game.settings.get("animatedanxiety", "enable_suffocation")
      ) {
        appElement.classList.add("suffocation-effect");
        appElement.classList.add("suffocation-fade");
        this.createSuffocationEffect();
      } else if (
        isConcentrating &&
        game.settings.get("animatedanxiety", "enable_concentrating")
      ) {
        appElement.classList.add("concentration-effect");
        this.createConcentrationParticles();
      } else if (
        isTransformed &&
        game.settings.get("animatedanxiety", "enable_transformed")
      ) {
        appElement.classList.add("transformed-effect");
        this.createTransformedEffect();
      } else if (
        isProne &&
        !isUnconscious &&
        game.settings.get("animatedanxiety", "enable_prone")
      ) {
        // Moved to the end of the chain
        appElement.classList.add("prone-effect");
        this.createProneEffect();
      }

      // Add color fade for statuses without one
      if (
        isDeafened &&
        game.settings.get("animatedanxiety", "enable_deafened")
      ) {
        appElement.classList.add("deafened-fade");
      }
      if (
        isDiseased &&
        game.settings.get("animatedanxiety", "enable_diseased")
      ) {
        appElement.classList.add("diseased-fade");
      }
      if (
        isFrightened &&
        game.settings.get("animatedanxiety", "enable_frightened")
      ) {
        appElement.classList.add("frightened-fade");
      }
      if (
        isGrappled &&
        game.settings.get("animatedanxiety", "enable_grappled")
      ) {
        appElement.classList.add("grappled-fade");
      }
      if (isHiding && game.settings.get("animatedanxiety", "enable_hiding")) {
        appElement.classList.add("hiding-fade");
      }
      if (
        isPetrified &&
        game.settings.get("animatedanxiety", "enable_petrified")
      ) {
        appElement.classList.add("petrified-fade");
      }
      if (
        isParalyzed &&
        game.settings.get("animatedanxiety", "enable_paralyzed")
      ) {
        appElement.classList.add("paralyzed-fade");
      }
      if (
        isRestrained &&
        game.settings.get("animatedanxiety", "enable_restrained")
      ) {
        appElement.classList.add("restrained-fade");
      }
      if (
        isIncapacitated &&
        game.settings.get("animatedanxiety", "enable_incapacitated")
      ) {
        appElement.classList.add("incapacitated-fade");
      }
      if (
        isBurrowing &&
        game.settings.get("animatedanxiety", "enable_burrowing")
      ) {
        appElement.classList.add("burrowing-fade");
      }
      if (isDodging && game.settings.get("animatedanxiety", "enable_dodging")) {
        appElement.classList.add("dodge-fade");
      }
      if (
        isEthereal &&
        game.settings.get("animatedanxiety", "enable_ethereal")
      ) {
        appElement.classList.add("ethereal-fade");
      }
      if (
        isExhausted &&
        game.settings.get("animatedanxiety", "enable_exhausted")
      ) {
        appElement.classList.add("exhaustion-fade");
      }
      if (
        isProne &&
        !isUnconscious &&
        game.settings.get("animatedanxiety", "enable_prone")
      ) {
        appElement.classList.add("prone-fade");
      }
      if (isMarked && game.settings.get("animatedanxiety", "enable_marked")) {
        appElement.classList.add("marked-fade");
      }
      if (
        isInvisible &&
        game.settings.get("animatedanxiety", "enable_invisible")
      ) {
        appElement.classList.add("invisible-fade");
      }
      if (
        isHovering &&
        game.settings.get("animatedanxiety", "enable_hovering")
      ) {
        appElement.classList.add("hovering-fade");
      }
      if (isFlying && game.settings.get("animatedanxiety", "enable_flying")) {
        appElement.classList.add("flying-fade");
      }
      if (
        isSilenced &&
        game.settings.get("animatedanxiety", "enable_silenced")
      ) {
        appElement.classList.add("silenced-fade");
      }
      if (
        isSleeping &&
        game.settings.get("animatedanxiety", "enable_sleeping")
      ) {
        appElement.classList.add("sleeping-fade");
      }
      if (isStable && game.settings.get("animatedanxiety", "enable_stable")) {
        appElement.classList.add("stable-fade");
      }
      if (isStunned && game.settings.get("animatedanxiety", "enable_stunned")) {
        appElement.classList.add("stunned-fade");
      }
      if (
        isSurprised &&
        game.settings.get("animatedanxiety", "enable_surprised")
      ) {
        appElement.classList.add("surprised-fade");
      }
      if (
        isTransformed &&
        game.settings.get("animatedanxiety", "enable_transformed")
      ) {
        appElement.classList.add("transformed-fade");
      }
      if (isCharmed && game.settings.get("animatedanxiety", "enable_charmed")) {
        appElement.classList.add("charmed-fade");
      }
      if (
        isBleeding &&
        game.settings.get("animatedanxiety", "enable_bleeding")
      ) {
        appElement.classList.add("bleeding-fade");
      }
      if (isDead && game.settings.get("animatedanxiety", "enable_dead")) {
        appElement.classList.add("dead-fade");
      }
      if (isCursed && game.settings.get("animatedanxiety", "enable_cursed")) {
        appElement.classList.add("cursed-fade");
      }
      if (
        isHalfCover &&
        game.settings.get("animatedanxiety", "enable_halfCover")
      ) {
        appElement.classList.add("half-cover-fade");
      }
      if (
        isThreeQuartersCover &&
        game.settings.get("animatedanxiety", "enable_threeQuartersCover")
      ) {
        appElement.classList.add("three-quarters-cover-fade");
      }
      if (
        isTotalCover &&
        game.settings.get("animatedanxiety", "enable_totalCover")
      ) {
        appElement.classList.add("total-cover-fade");
      }
      if (isBurning && game.settings.get("animatedanxiety", "enable_burning")) {
        appElement.classList.add("burning-fade");
      }
      if (
        isDehydration &&
        game.settings.get("animatedanxiety", "enable_dehydration")
      ) {
        appElement.classList.add("dehydration-fade");
      }
      if (isFalling && game.settings.get("animatedanxiety", "enable_falling")) {
        appElement.classList.add("falling-fade");
      }
      if (
        isMalnutrition &&
        game.settings.get("animatedanxiety", "enable_malnutrition")
      ) {
        appElement.classList.add("malnutrition-fade");
      }

      // Remove existing health effects
      document.querySelectorAll(".veins-overlay").forEach((el) => el.remove());

      // Get thresholds from settings
      const anxietyThreshold = game.settings.get(
        "animatedanxiety",
        "anxietyThreshold"
      );
      const veinsThreshold = game.settings.get(
        "animatedanxiety",
        "veinsThreshold"
      );

      // Set anxiety effect intensity based on health
      if (
        healthPercent < anxietyThreshold &&
        game.settings.get("animatedanxiety", "enable_anxiety")
      ) {
        const opacity = (anxietyThreshold - healthPercent) / 100;
        const duration = Math.max(
          5 - ((anxietyThreshold - healthPercent) / anxietyThreshold) * 2,
          0.8
        );
        const blur = Math.min(400, (anxietyThreshold - healthPercent) * 8);

        appElement.classList.add("anxiety-effect");
        appElement.style.setProperty("--anxiety-opacity", opacity);
        appElement.style.setProperty("--anxiety-duration", `${duration}s`);
        appElement.style.setProperty("--anxiety-blur", `${blur}px`);

        // Only show veins if the setting is enabled and health is below veins threshold
        if (
          healthPercent < veinsThreshold &&
          game.settings.get("animatedanxiety", "showVeins")
        ) {
          const veinsOverlay = document.createElement("div");
          veinsOverlay.className = "veins-overlay";
          appElement.appendChild(veinsOverlay);
        }
      } else {
        // Remove anxiety effect if health is above threshold or effect is disabled
        appElement.classList.remove("anxiety-effect");
        appElement.style.removeProperty("--anxiety-opacity");
        appElement.style.removeProperty("--anxiety-duration");
        appElement.style.removeProperty("--anxiety-blur");
      }
    } catch (error) {
      console.error("AnimatedAnxiety | Error:", error);
    }
  }

  static clearEffects() {
    const allIntervals = [
      "bubbleInterval",
      "bloodInterval",
      "curseInterval",
      "heartInterval",
      "particleInterval",
      "deafenedInterval",
      "diseaseInterval",
      "frightenedInterval",
      "grappledInterval",
      "hidingInterval",
      "petrifiedInterval",
      "paralyzedInterval",
      "restrainedInterval",
      "incapacitatedInterval",
      "deadInterval",
      "burrowingInterval",
      "dodgeInterval",
      "etherealInterval",
      "etherealCleanupInterval",
      "exhaustionInterval",
      "flyingInterval",
      "hoveringInterval",
      "invisibleInterval",
      "markedInterval",
      "proneInterval",
      "silencedInterval",
      "sleepingInterval",
      "sleepingCleanupInterval",
      "stableInterval",
      "stunnedInterval",
      "surprisedInterval",
      "transformedInterval",
      "halfCoverInterval",
      "threeQuartersCoverInterval",
      "totalCoverInterval",
      "burningInterval",
      "dehydrationInterval",
      "cleanupInterval",
      "fallingInterval",
      "malnutritionInterval",
      "suffocationInterval",
    ];

    // Clear all intervals
    allIntervals.forEach((intervalName) => {
      if (this[intervalName]) {
        clearInterval(this[intervalName]);
        this[intervalName] = null;
      }
    });

    // Clear all timeouts
    if (this.paralyzedTimeout) {
      clearTimeout(this.paralyzedTimeout);
      this.paralyzedTimeout = null;
    }

    // Remove all effect elements with one query
    const effectClasses = [
      ".bubble",
      ".blood-streak",
      ".bleeding-overlay",
      ".curse-symbol",
      ".charm-heart",
      ".concentration-particle",
      ".concentration-overlay",
      ".deafened-ripple",
      ".deafened-overlay",
      ".disease-particle",
      ".frightened-mark",
      ".grappled-hand",
      ".grappled-vignette",
      ".grappled-overlay",
      ".hiding-overlay",
      ".petrified-overlay",
      ".paralyzed-overlay",
      ".restrained-web",
      ".restrained-overlay",
      ".rats-overlay",
      ".poison-bubble",
      ".poison-overlay",
      ".poison-aura",
      ".cupid-overlay",
      ".frightened-overlay",
      ".cursed-overlay",
      ".incapacitated-overlay",
      ".dead-overlay",
      ".blinded-overlay",
      ".burrowing-overlay",
      ".dodge-overlay",
      ".trapeze-overlay",
      ".ethereal-overlay",
      ".exhaustion-overlay",
      ".flying-overlay",
      ".hovering-overlay",
      ".invisible-overlay",
      ".marked-overlay",
      ".prone-overlay",
      ".silenced-overlay",
      ".sleeping-overlay",
      ".stable-overlay",
      ".stunned-overlay",
      ".surprised-overlay",
      ".transformed-overlay",
      ".unconscious-overlay",
      ".ethereal-swirl",
      ".falling-feather",
      ".veins-overlay",
      ".cover-overlay",
      ".burning-overlay",
      ".flame-particle",
      ".dehydration-overlay",
      ".falling-overlay",
      ".malnutrition-overlay",
      ".suffocation-overlay",
      ".sleeping-z-group",
    ].join(",");

    document.querySelectorAll(effectClasses).forEach((el) => el.remove());

    // Reset interface element properties
    const interfaceEl = document.getElementById("interface");
    if (interfaceEl) {
      interfaceEl.style.removeProperty("--anxiety-opacity");
      interfaceEl.style.removeProperty("--anxiety-duration");
      interfaceEl.style.removeProperty("--anxiety-blur");
      interfaceEl.style.removeProperty("--exhaustion-blur");
      interfaceEl.style.removeProperty("--exhaustion-clear");
      interfaceEl.style.removeProperty("--exhaustion-opacity");
      interfaceEl.style.removeProperty("--exhaustion-duration");
    }

    // Clean up any remaining death orbs
    if (this.activeDeathOrbs) {
      this.activeDeathOrbs.forEach((orb) => {
        if (orb && orb.parentNode) {
          orb.remove();
        }
      });
      this.activeDeathOrbs.clear();
    }
  }

  static createOverlay(className, imageName, effectType) {
    // First check if overlay should be created at all
    if (!game.settings.get("animatedanxiety", `enable_${effectType}_overlay`)) {
      return null;
    }

    const overlay = document.createElement("div");
    overlay.className = className;

    const imagePath = `modules/animatedanxiety/assets/${imageName}`;
    if (this.preloadedImages.has(imagePath)) {
      overlay.style.backgroundImage = `url('${this.preloadedImages.get(imagePath).src}')`;
    }

    return overlay;
  }

  static createHoveringEffect() {
    if (!this.hoveringInterval) {
      this.clearEffects();

      const overlay = this.createOverlay("hovering-overlay", "hovering.png", "hovering");
      if (overlay) {
        overlay.style.animation = `
          hovering-rise 0.8s ease-out forwards,
          hovering-float 4s ease-in-out infinite 0.8s
        `;

        document.getElementById("interface")?.appendChild(overlay);
      }

      this.hoveringInterval = setInterval(() => {
        if (!document.querySelector(".hovering-effect")) {
          this.clearEffects();
          clearInterval(this.hoveringInterval);
          this.hoveringInterval = null;
        }
      }, 1000);
    }
  }

  // New check for unconscious
  static checkUnconsciousStatus(actor) {}

  // New check for unconscious
  static checkUnconsciousStatus(actor) {
    if (!actor?.effects) return false;
    return actor.effects.some((e) => {
      const name = e.name?.toLowerCase() || "";
      return !e.disabled && name.includes("unconscious");
    });
  }

  // Adjust createBubbles to pick the correct animation
  static createBubbles(mode) {
    if (!this.bubbleInterval) {
      this.clearBubbles();

      // Add unconscious overlay if in black-inward mode
      if (mode === "black-inward") {
        const overlay = this.createOverlay("unconscious-overlay", "unconscious.png", "unconscious");
        if (overlay) {
          overlay.style.animation = "unconscious-rise 0.8s ease-out forwards";
          document.getElementById("interface").appendChild(overlay);
        }
      }

      if (mode === "sway") {
        // Create poison overlay and aura
        const overlay = this.createOverlay("poison-overlay", "poisoned.png", "poisoned");
        if (overlay) {
          overlay.style.animation = "poison-rise 0.8s ease-out forwards";
          document.getElementById("interface").appendChild(overlay);
        }
        
        // Always create aura as it's part of the effect animation
        const aura = document.createElement("div");
        aura.className = "poison-aura";
        aura.style.animation = "poison-glow 3s ease-in-out infinite";
        document.getElementById("interface").appendChild(aura);
      }

      // Continue with the bubble animations regardless of overlay settings
      if (mode === "sway") {
        // Create rising bubbles for poison effect
        this.bubbleInterval = setInterval(() => {
          const bubble = document.createElement("div");
          bubble.className = "poison-bubble";
          bubble.style.left = `${Math.random() * 100}%`;
          bubble.style.bottom = "0";
          const size = Math.random() * 8 + 4;
          bubble.style.width = `${size}px`;
          bubble.style.height = `${size}px`;
          const duration = Math.random() * 2 + 3;
          bubble.style.animation = `poison-bubble-rise ${duration}s ease-out forwards`;
          document.getElementById("interface").appendChild(bubble);
          setTimeout(() => bubble.remove(), duration * 1000);
        }, 200);
      } else {
        // Original unconscious bubble logic
        this.bubbleInterval = setInterval(() => {
          for (let i = 0; i < 3; i++) {
            const bubble = document.createElement("div");
            bubble.className = "bubble";
            bubble.style.position = "fixed";
            const edge = ["top", "bottom", "left", "right"][Math.floor(Math.random() * 4)];
            let startTop = "50%", startLeft = "50%";
            switch (edge) {
              case "top": startTop = "0%"; startLeft = `${Math.random() * 100}%`; break;
              case "bottom": startTop = "100%"; startLeft = `${Math.random() * 100}%`; break;
              case "left": startLeft = "0%"; startTop = `${Math.random() * 100}%`; break;
              case "right": startLeft = "100%"; startTop = `${Math.random() * 100}%`; break;
            }
            bubble.style.setProperty("--start-top", startTop);
            bubble.style.setProperty("--start-left", startLeft);
            const size = Math.random() * 8 + 4;
            bubble.style.width = `${size}px`;
            bubble.style.height = `${size}px`;
            const duration = Math.random() * 2 + 7;
            bubble.style.background = "rgba(0, 0, 0, 0.4)";
            bubble.style.animation = `bubble-inward-curved ${duration}s ease-in-out forwards`;
            document.getElementById("interface").appendChild(bubble);
            setTimeout(() => bubble.remove(), duration * 1000);
          }
        }, 300);
      }
    }
  }

  static clearBubbles() {
    if (this.bubbleInterval) {
      clearInterval(this.bubbleInterval);
      this.bubbleInterval = null;
    }
    document.querySelectorAll(".bubble").forEach((bubble) => bubble.remove());
  }

  static getHealthPercentage(actor) {
    const hp = actor.system.attributes.hp;
    if (!hp) {
      console.error("AnimatedAnxiety | No HP data found");
      return 100;
    }
    return Math.max(0, Math.min(100, (hp.value / hp.max) * 100));
  }

  static getOpacity(percent) {
    return Math.min((100 - percent) / 100, 0.8); // Increased max opacity
  }

  static getDuration(percent) {
    const maxSpeed = game.settings.get("animatedanxiety", "maxSpeed");
    const minDuration = maxSpeed;
    const maxDuration = maxSpeed * 4;
    return (
      Math.max(
        maxDuration - ((maxDuration - minDuration) * (100 - percent)) / 100,
        minDuration
      ) + "s"
    );
  }

  static checkPoisonedStatus(actor) {
    if (!actor?.effects) {
      return false;
    }

    // Check for the poisoned condition in different possible formats
    const isPoisoned = actor.effects.some((effect) => {
      const name = effect.name?.toLowerCase() || "";
      const statusId = effect.flags?.core?.statusId || "";
      const isActive = !effect.disabled;

      return (
        isActive &&
        (name === "poisoned" ||
          statusId === "poisoned" ||
          name.includes("poisoned"))
      );
    });

    return isPoisoned;
  }

  static checkBleedingStatus(actor) {
    if (!actor?.effects) return false;
    return actor.effects.some((e) => {
      const name = e.name?.toLowerCase() || "";
      return !e.disabled && name.includes("bleeding");
    });
  }

  static checkBlindedStatus(actor) {
    if (!actor?.effects) return false;
    return actor.effects.some((e) => {
      const name = e.name?.toLowerCase() || "";
      return (
        !e.disabled && (name.includes("blind") || name.includes("blinded"))
      );
    });
  }

  static checkCursedStatus(actor) {
    if (!actor?.effects) return false;
    return actor.effects.some((e) => {
      const name = e.name?.toLowerCase() || "";
      return (
        !e.disabled &&
        (name.includes("curse") ||
          name.includes("cursed") ||
          name.includes("hex"))
      );
    });
  }

  static checkCharmedStatus(actor) {
    if (!actor?.effects) return false;
    return actor.effects.some((e) => {
      const name = e.name?.toLowerCase() || "";
      return (
        !e.disabled && (name.includes("charm") || name.includes("charmed"))
      );
    });
  }

  static checkConcentratingStatus(actor) {
    if (!actor?.effects) return false;
    return actor.effects.some((e) => {
      const name = e.name?.toLowerCase() || "";
      return !e.disabled && name.includes("concentrating");
    });
  }

  static checkDeafenedStatus(actor) {
    if (!actor?.effects) return false;
    return actor.effects.some((e) => {
      const name = e.name?.toLowerCase() || "";
      return (
        !e.disabled && (name.includes("deaf") || name.includes("deafened"))
      );
    });
  }

  static checkDiseasedStatus(actor) {
    if (!actor?.effects) return false;
    return actor.effects.some((e) => {
      const name = e.name?.toLowerCase() || "";
      return (
        !e.disabled &&
        (name.includes("disease") ||
          name.includes("diseased") ||
          name.includes("sickness"))
      );
    });
  }

  static checkFrightenedStatus(actor) {
    if (!actor?.effects) return false;
    return actor.effects.some((e) => {
      const name = e.name?.toLowerCase() || "";
      return (
        !e.disabled &&
        (name.includes("frightened") ||
          name.includes("afraid") ||
          name.includes("fear"))
      );
    });
  }

  static checkGrappledStatus(actor) {
    if (!actor?.effects) return false;
    return actor.effects.some((e) => {
      const name = e.name?.toLowerCase() || "";
      return (
        !e.disabled && (name.includes("grappled") || name.includes("grabbed"))
      );
    });
  }

  static checkRestrainedStatus(actor) {
    if (!actor?.effects) return false;
    const effect = actor.effects.find((e) => {
      const name = e.name?.toLowerCase() || "";
      return !e.disabled && name.includes("restrained");
    });
    if (effect) {
      this.restrainedEffectImage = effect.icon || effect.img;
      return true;
    }
    this.restrainedEffectImage = null;
    return false;
  }

  static checkHidingStatus(actor) {
    if (!actor?.effects) return false;
    return actor.effects.some((e) => {
      const name = e.name?.toLowerCase() || "";
      return (
        !e.disabled &&
        (name.includes("hiding") ||
          name.includes("hidden") ||
          name.includes("stealth"))
      );
    });
  }

  static checkPetrifiedStatus(actor) {
    if (!actor?.effects) {
      return false;
    }

    const isPetrified = actor.effects.some((e) => {
      const name = e.name?.toLowerCase() || "";
      const statusId = e.flags?.core?.statusId || "";
      const isActive = !e.disabled;

      return (
        isActive &&
        (name === "petrified" ||
          statusId === "petrified" ||
          name.includes("petrify") ||
          name.includes("stone") ||
          name.includes("statue"))
      );
    });

    return isPetrified;
  }

  static checkParalyzedStatus(actor) {
    if (!actor?.effects) return false;
    return actor.effects.some((e) => {
      const name = e.name?.toLowerCase() || "";
      return (
        !e.disabled &&
        (name.includes("paralyzed") || name.includes("paralysis"))
      );
    });
  }

  static checkIncapacitatedStatus(actor) {
    if (!actor?.effects) return false;
    return actor.effects.some((e) => {
      const name = e.name?.toLowerCase() || "";
      return !e.disabled && name.includes("incapacitated");
    });
  }

  static checkDeadStatus(actor) {
    if (!actor?.effects) return false;
    return actor.effects.some((e) => {
      const name = e.name?.toLowerCase() || "";
      return !e.disabled && name.includes("dead");
    });
  }

  static checkBurrowingStatus(actor) {
    if (!actor?.effects) return false;
    return actor.effects.some((e) => {
      const name = e.name?.toLowerCase() || "";
      return !e.disabled && name.includes("burrow");
    });
  }

  static checkDodgeStatus(actor) {
    if (!actor?.effects) return false;
    const isDodging = actor.effects.some((e) => {
      const name = e.name?.toLowerCase() || "";
      const statusId = e.flags?.core?.statusId || "";
      const isActive = !e.disabled;

      return (
        isActive &&
        (name === "dodging" || statusId === "dodge" || statusId === "dodging")
      );
    });
    return isDodging;
  }

  static checkEtherealStatus(actor) {
    if (!actor?.effects) return false;
    return actor.effects.some((e) => {
      const name = e.name?.toLowerCase() || "";
      return (
        !e.disabled &&
        (name.includes("ethereal") || name.includes("etherealness"))
      );
    });
  }

  static checkExhaustionStatus(actor) {
    if (!actor?.effects) return 0;

    const exhaustionEffect = actor.effects.find((e) => {
      const name = e.name?.toLowerCase() || "";
      const isActive = !e.disabled;
      return isActive && name.includes("exhaustion");
    });

    if (!exhaustionEffect) return 0;

    // Extract level from effect name (e.g., "Exhaustion 3" -> 3)
    const level = parseInt(exhaustionEffect.name.match(/\d+/)?.[0] || "1");

    return level;
  }

  static checkFlyingStatus(actor) {
    if (!actor?.effects) {
      return false;
    }

    const isFlying = actor.effects.some((e) => {
      const name = e.name?.toLowerCase() || "";
      const statusId = e.flags?.core?.statusId || "";
      const isActive = !e.disabled;

      return (
        isActive &&
        (name.includes("fly") ||
          name.includes("flying") ||
          name.includes("levitate") ||
          statusId === "fly" ||
          statusId === "flying")
      );
    });

    return isFlying;
  }

  static checkHoveringStatus(actor) {
    if (!actor?.effects) {
      return false;
    }

    const isHovering = actor.effects.some((e) => {
      const name = e.name?.toLowerCase() || "";
      const statusId = e.flags?.core?.statusId || "";
      const isActive = !e.disabled;

      return (
        isActive &&
        (name.includes("hover") ||
          name.includes("hovering") ||
          statusId === "hover" ||
          statusId === "hovering")
      );
    });

    return isHovering;
  }

  static checkInvisibleStatus(actor) {
    if (!actor?.effects) {
      return false;
    }

    const isInvisible = actor.effects.some((e) => {
      const name = e.name?.toLowerCase() || "";
      const statusId = e.flags?.core?.statusId || "";
      const isActive = !e.disabled;

      return (
        isActive &&
        (name.includes("invisible") ||
          name.includes("invisibility") ||
          statusId === "invisible")
      );
    });

    return isInvisible;
  }

  static checkMarkedStatus(actor) {
    if (!actor?.effects) {
      return false;
    }

    const isMarked = actor.effects.some((e) => {
      const name = e.name?.toLowerCase() || "";
      const statusId = e.flags?.core?.statusId || "";
      const isActive = !e.disabled;

      return (
        isActive &&
        (name.includes("mark") ||
          name.includes("marked") ||
          statusId === "marked")
      );
    });

    return isMarked;
  }

  static checkProneStatus(actor) {
    if (!actor?.effects) {
      return false;
    }

    const isProne = actor.effects.some((e) => {
      const name = e.name?.toLowerCase() || "";
      const statusId = e.flags?.core?.statusId || "";
      const isActive = !e.disabled;

      return isActive && (name.includes("prone") || statusId === "prone");
    });

    return isProne;
  }

  static checkSilencedStatus(actor) {
    if (!actor?.effects) {
      return false;
    }

    const isSilenced = actor.effects.some((e) => {
      const name = e.name?.toLowerCase() || "";
      const statusId = e.flags?.core?.statusId || "";
      const isActive = !e.disabled;

      // Updated conditions to match the exact name 'Silenced'
      return (
        isActive &&
        (name === "silenced" ||
          statusId === "silenced" ||
          e.name === "Silenced") // Add exact match for 'Silenced'
      );
    });

    return isSilenced;
  }

  static checkSleepingStatus(actor) {
    if (!actor?.effects) {
      return false;
    }

    const isSleeping = actor.effects.some((e) => {
      const name = e.name?.toLowerCase() || "";
      const statusId = e.flags?.core?.statusId || "";
      const isActive = !e.disabled;

      return (
        isActive &&
        (name === "sleep" ||
          name === "sleeping" ||
          name.includes("sleep") ||
          statusId === "sleep" ||
          e.name === "Sleep")
      );
    });

    return isSleeping;
  }

  static checkStableStatus(actor) {
    if (!actor?.effects) {
      return false;
    }

    const isStable = actor.effects.some((e) => {
      const name = e.name?.toLowerCase() || "";
      const statusId = e.flags?.core?.statusId || "";
      const isActive = !e.disabled;

      return (
        isActive &&
        (name === "stable" || statusId === "stable" || e.name === "Stable")
      );
    });

    return isStable;
  }

  static checkStunnedStatus(actor) {
    if (!actor?.effects) {
      return false;
    }

    const isStunned = actor.effects.some((e) => {
      const name = e.name?.toLowerCase() || "";
      const statusId = e.flags?.core?.statusId || "";
      const isActive = !e.disabled;

      return (
        isActive &&
        (name === "stunned" || statusId === "stunned" || e.name === "Stunned")
      );
    });

    return isStunned;
  }

  static checkSurprisedStatus(actor) {
    if (!actor?.effects) {
      return false;
    }

    const isSurprised = actor.effects.some((e) => {
      const name = e.name?.toLowerCase() || "";
      const statusId = e.flags?.core?.statusId || "";
      const isActive = !e.disabled;

      return (
        isActive &&
        (name === "surprised" ||
          statusId === "surprised" ||
          e.name === "Surprised")
      );
    });

    return isSurprised;
  }

  static checkTransformedStatus(actor) {
    if (!actor?.effects) {
      return false;
    }

    const isTransformed = actor.effects.some((e) => {
      const name = e.name?.toLowerCase() || "";
      const statusId = e.flags?.core?.statusId || "";
      const isActive = !e.disabled;

      return (
        isActive &&
        (name === "transformed" ||
          name.includes("polymorph") ||
          name.includes("wild shape") ||
          statusId === "transformed")
      );
    });

    return isTransformed;
  }

  static checkHalfCoverStatus(actor) {
    if (!actor?.effects) return false;
    return actor.effects.some((e) => {
      const name = e.name?.toLowerCase() || "";
      const statusId = e.flags?.core?.statusId || "";
      return (
        !e.disabled &&
        (name.includes("half cover") || statusId === "half-cover")
      );
    });
  }

  static checkThreeQuartersCoverStatus(actor) {
    if (!actor?.effects) return false;
    return actor.effects.some((e) => {
      const name = e.name?.toLowerCase() || "";
      const statusId = e.flags?.core?.statusId || "";
      return (
        !e.disabled &&
        (name.includes("three-quarters cover") ||
          statusId === "three-quarters-cover")
      );
    });
  }

  static checkTotalCoverStatus(actor) {
    if (!actor?.effects) return false;
    return actor.effects.some((e) => {
      const name = e.name?.toLowerCase() || "";
      const statusId = e.flags?.core?.statusId || "";
      return (
        !e.disabled &&
        (name.includes("total cover") || statusId === "total-cover")
      );
    });
  }

  static checkBurningStatus(actor) {
    if (!actor?.effects) return false;
    return actor.effects.some((e) => {
      const name = e.name?.toLowerCase() || "";
      const statusId = e.flags?.core?.statusId || "";
      return (
        !e.disabled &&
        (name.includes("burning") ||
          name.includes("fire") ||
          statusId === "burning")
      );
    });
  }

  static checkDehydrationStatus(actor) {
    if (!actor?.effects) {
      return false;
    }

    const isDehydration = actor.effects.some((e) => {
      const effectName = String(e.name || "").toLowerCase(); // Changed from e.label
      const statusId = String(e.flags?.core?.statusId || "");
      const isActive = !e.disabled;

      return (
        isActive &&
        (effectName === "dehydration" ||
          effectName.includes("dehydration") ||
          statusId === "dehydration")
      );
    });

    return isDehydration;
  }

  static checkFallingStatus(actor) {
    if (!actor?.effects) {
      return false;
    }

    const isFalling = actor.effects.some((e) => {
      const name = e.name?.toLowerCase() || "";
      const statusId = e.flags?.core?.statusId || "";
      const isActive = !e.disabled;

      return isActive && (name.includes("falling") || statusId === "falling");
    });

    return isFalling;
  }

  static checkMalnutritionStatus(actor) {
    if (!actor?.effects) {
      return false;
    }

    const isMalnutrition = actor.effects.some((e) => {
      const name = (e.name || "").toLowerCase();
      const statusId = (e.flags?.core?.statusId || "").toLowerCase();
      const isActive = !e.disabled;

      return (
        isActive &&
        (name === "malnutrition" ||
          statusId === "malnutrition" ||
          name.includes("malnourished") ||
          name.includes("starving"))
      );
    });

    return isMalnutrition;
  }

  static checkSuffocationStatus(actor) {
    if (!actor?.effects) {
      return false;
    }

    const isSuffocating = actor.effects.some((e) => {
      const name = (e.name || "").toLowerCase();
      const statusId = (e.flags?.core?.statusId || "").toLowerCase();
      const isActive = !e.disabled;

      return (
        isActive &&
        (name === "suffocation" ||
          statusId === "suffocation" ||
          name.includes("suffocating") ||
          name.includes("drowning"))
      );
    });

    return isSuffocating;
  }

  static createFallingEffect() {
    if (!this.fallingInterval) {
      this.clearEffects();

      // Create falling overlay
      const overlay = this.createOverlay("falling-overlay", "falling.png", "falling");
      if (overlay) {
        overlay.style.animation = "falling-rise 0.8s ease-out forwards";
        document.getElementById("interface").appendChild(overlay);
      }

      // Create vertical lines that rise
      const createLine = () => {
        const line = document.createElement("div");
        line.className = "falling-line";

        // Random properties
        const height = Math.random() * 100 + 50; // 50-150px height
        const position = Math.random() * 100; // Random horizontal position
        const duration = Math.random() * 1.5 + 1; // 1-2.5s duration
        const width = Math.random() * 2 + 1; // 1-3px width
        const opacity = Math.random() * 0.4 + 0.2; // 0.2-0.6 opacity

        line.style.height = `${height}px`;
        line.style.left = `${position}%`;
        line.style.width = `${width}px`;
        line.style.opacity = opacity;
        line.style.animation = `falling-line-rise ${duration}s linear`;

        document.getElementById("interface").appendChild(line);

        // Remove line after animation
        setTimeout(() => line.remove(), duration * 1000);
      };

      // Create initial batch of lines
      for (let i = 0; i < 20; i++) {
        setTimeout(() => createLine(), i * 50);
      }

      // Continue creating lines
      this.fallingInterval = setInterval(() => {
        if (!document.querySelector(".falling-effect")) {
          this.clearEffects();
          clearInterval(this.fallingInterval);
          this.fallingInterval = null;
        } else {
          createLine();
        }
      }, 100); // Create new line every 100ms
    }
  }

  static createCurseSymbols() {
    if (!this.curseInterval) {
      this.clearEffects();

      // Create cursed overlay
      const overlay = this.createOverlay("cursed-overlay", "cursed.png", "cursed");
      if (overlay) {
        document.getElementById("interface").appendChild(overlay);
      }

      // Array of available pentagram images
      const pentagrams = [
        "modules/animatedanxiety/assets/pentagram1.png",
        "modules/animatedanxiety/assets/pentagram2.png",
        "modules/animatedanxiety/assets/pentagram3.png",
        "modules/animatedanxiety/assets/pentagram4.png",
      ];

      // Function to create an occult symbol
      const createOccultSymbol = () => {
        const symbol = document.createElement("img");
        symbol.className = "curse-symbol";
        // Randomly select one of the pentagram images
        symbol.src = pentagrams[Math.floor(Math.random() * pentagrams.length)];
        symbol.style.border = "none";

        // Random position at the bottom
        symbol.style.left = `${Math.random() * 100}%`;
        symbol.style.bottom = "-10%";

        // Much wider size range: between 20px and 60px
        const size = Math.random() * 40 + 40;
        symbol.style.width = `${size}px`;
        symbol.style.height = `${size}px`;

        // Random float height between 15vh and 33vh (bottom third of screen)
        const floatHeight = Math.random() * 18 + 25;
        symbol.style.setProperty("--float-height", `${floatHeight}vh`);

        // Random duration between 4s and 7s
        const duration = Math.random() * 3 + 4;
        symbol.style.animation = `curse-float ${duration}s ease-in-out forwards`;

        document.getElementById("interface").appendChild(symbol);
        setTimeout(() => symbol.remove(), duration * 1000);
      };

      // Create initial batch of symbols
      for (let i = 0; i < 3; i++) {
        setTimeout(() => createOccultSymbol(), i * 200);
      }

      // Create occult symbols at intervals, sometimes creating multiple
      this.curseInterval = setInterval(() => {
        const count = Math.random() < 0.3 ? 2 : 1; // 30% chance to create 2 symbols
        for (let i = 0; i < count; i++) {
          setTimeout(() => createOccultSymbol(), i * 200);
        }
      }, 4000); // Reduced interval from 6000 to 4000
    }
  }

  static createHearts() {
    if (!this.heartInterval) {
      this.clearEffects();

      // Create cupid overlay
      const cupid = this.createOverlay("cupid-overlay", "Cupid.png", "charmed");
      if (cupid) {
        document.getElementById("interface").appendChild(cupid);
      }

      // Create floating hearts
      this.heartInterval = setInterval(() => {
        const heart = document.createElement("div");
        heart.className = "charm-heart";
        heart.textContent = "♥";

        const angle = Math.random() * Math.PI * 2;
        const startRadius = 60;
        const startX = 50 + Math.cos(angle) * startRadius;
        const startY = 50 + Math.sin(angle) * startRadius;

        heart.style.left = `${startX}%`;
        heart.style.top = `${startY}%`;

        const moveX = (Math.random() * 20 - 10 - (startX - 50)) * 1.2;
        const moveY = (Math.random() * 20 - 10 - (startY - 50)) * 1.2;

        heart.style.setProperty("--move-x", `${moveX}vh`);
        heart.style.setProperty("--move-y", `${moveY}vh`);

        const duration = 4 + Math.random() * 2;
        heart.style.animation = `heart-float ${duration}s ease-in-out forwards`;

        document.getElementById("interface").appendChild(heart);
        setTimeout(() => heart.remove(), duration * 1000);
      }, 300);
    }
  }

  static createBloodStreaks() {
    if (!this.bloodInterval) {
      this.clearEffects();

      // Create bleeding overlay
      const overlay = this.createOverlay("bleeding-overlay", "bleeding.png", "bleeding");
      if (overlay) {
        document.getElementById("interface").appendChild(overlay);
      }

      // Create blood streaks at a slower interval
      this.bloodInterval = setInterval(() => {
        const streak = document.createElement("div");
        streak.className = "blood-streak";
        streak.style.left = `${Math.random() * 100}%`;
        streak.style.opacity = (Math.random() * 0.4 + 0.4).toString();
        streak.style.width = `${Math.random() * 3 + 1}px`;
        const duration = Math.random() * 1.5 + 1.5;
        streak.style.animation = `blood-drip ${duration}s linear forwards`;
        document.getElementById("interface").appendChild(streak);
        setTimeout(() => streak.remove(), duration * 1000);
      }, 400); // Changed from 200 to 400ms to halve the particle frequency
    }
  }

  static createConcentrationParticles() {
    if (!this.particleInterval) {
      this.clearEffects();

      // Add concentration overlay
      const overlay = this.createOverlay("concentration-overlay", "concentration.png", "concentrating");
      if (overlay) {
        document.getElementById("interface").appendChild(overlay);
      }

      // Keep existing particle creation logic
      this.particleInterval = setInterval(() => {
        const particle = document.createElement("div");
        particle.className = "concentration-particle";

        const angle = Math.random() * Math.PI * 2;
        const startRadius = 50;
        const startX = 50 + Math.cos(angle) * startRadius;
        const startY = 50 + Math.sin(angle) * startRadius;

        particle.style.left = `${startX}%`;
        particle.style.top = `${startY}%`;

        const moveX = (Math.random() * 20 - 10 - (startX - 50)) * 0.5;
        const moveY = (Math.random() * 20 - 10 - (startY - 50)) * 0.5;

        particle.style.setProperty("--move-x", `${moveX}vh`);
        particle.style.setProperty("--move-y", `${moveY}vh`);

        document.getElementById("interface").appendChild(particle);
        setTimeout(() => particle.remove(), 3000);
      }, 1000); // Increased interval to reduce frequency
    }
  }

  static createDeafenedRipples() {
    if (!this.deafenedInterval) {
      this.clearEffects();

      // Create deafened overlay
      const overlay = this.createOverlay("deafened-overlay", "deafened.png", "deafened");
      if (overlay) {
        document.getElementById("interface").appendChild(overlay);
      }

      // Keep the existing ripple effect for additional visual feedback
      this.deafenedInterval = setInterval(() => {
        const ripple = document.createElement("div");
        ripple.className = "deafened-ripple";
        document.getElementById("interface").appendChild(ripple);
        setTimeout(() => ripple.remove(), 3000);
      }, 1000);
    }
  }

  static createDiseaseParticles() {
    if (!this.diseaseInterval) {
      this.clearEffects();

      // Create rats overlay
      const rats = this.createOverlay("rats-overlay", "rats.png", "diseased");
      if (rats) {
        document.getElementById("interface").appendChild(rats);
      }

      // Create falling particles
      this.diseaseInterval = setInterval(() => {
        const particle = document.createElement("div");
        particle.className = "disease-particle";
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.opacity = (Math.random() * 0.3 + 0.3).toString();
        const duration = Math.random() * 2 + 10;
        particle.style.animation = `disease-drip ${duration}s ease-in forwards`;
        document.getElementById("interface").appendChild(particle);
        setTimeout(() => particle.remove(), duration * 1000);
      }, 1000);
    }
  }

  static createFrightenedMarks() {
    if (!this.frightenedInterval) {
      this.clearEffects();

      // Create frightened overlay with effectType parameter
      const overlay = this.createOverlay("frightened-overlay", "Frightened.png", "frightened");
      if (overlay) {
        document.getElementById("interface").appendChild(overlay);
      }

      // Create frightened marks
      this.frightenedInterval = setInterval(() => {
        // Only create marks if the main effect is enabled
        if (!document.querySelector(".frightened-effect")) {
          this.clearEffects();
          clearInterval(this.frightenedInterval);
          this.frightenedInterval = null;
          return;
        }

        ["top", "bottom"].forEach((direction) => {
          const mark = document.createElement("div");
          mark.className = "frightened-mark";
          mark.classList.add(`frightened-mark-${direction}`);
          mark.textContent = "!";

          // Random horizontal position
          mark.style.left = `${Math.random() * 90 + 5}%`;

          // Random sizes for variety
          const size = Math.random() * 20 + 30;
          mark.style.fontSize = `${size}px`;

          // Random animation duration
          const duration = Math.random() * 1 + 2;
          mark.style.animation = `frightened-pop-${direction} ${duration}s ease-in-out forwards`;

          document.getElementById("interface").appendChild(mark);
          setTimeout(() => mark.remove(), duration * 1000);
        });
      }, 200);
    }
  }

  static createGrappledEffect() {
    if (!this.grappledInterval) {
      this.clearEffects();

      // Create vignette effect
      const vignette = document.createElement("div");
      vignette.className = "grappled-vignette";
      document.getElementById("interface").appendChild(vignette);

      // Create hands overlay
      const overlay = this.createOverlay("grappled-overlay", "Hands.png", "grappled");
      if (overlay) {
        // Start both animations together but with a delay on the idle
        // Use animation-fill-mode: forwards on both to prevent jumps
        overlay.style.animation = `
          grapple-rise 0.8s ease-out forwards,
          grapple-idle 4s ease-in-out infinite 0.8s
        `;

        document.getElementById("interface").appendChild(overlay);
      }

      // Store reference to remove later and ensure cleanup
      this.grappledInterval = setInterval(() => {
        if (!document.querySelector(".grappled-effect")) {
          this.clearEffects();
          clearInterval(this.grappledInterval);
          this.grappledInterval = null;
        }
      }, 1000);
    }
  }

  static createHidingEffect() {
    if (!this.hidingInterval) {
      this.clearEffects();

      // Create bushes overlay (removed vignette)
      const overlay = this.createOverlay("hiding-overlay", "bushesTrimmed.png", "hiding");
      if (overlay) {
        // Start rise animation, then switch to subtle jiggle
        overlay.style.animation = `
          hiding-rise 0.8s ease-out forwards,
          hiding-idle 3s ease-in-out infinite 0.8s
        `;

        document.getElementById("interface").appendChild(overlay);
      }

      // Store reference to remove later
      this.hidingInterval = setInterval(() => {
        if (!document.querySelector(".hiding-effect")) {
          this.clearEffects();
          clearInterval(this.hidingInterval);
          this.hidingInterval = null;
        }
      }, 1000);
    }
  }

  static createPetrifiedEffect() {
    if (!this.petrifiedInterval) {
      this.clearEffects();

      const overlay = this.createOverlay("petrified-overlay", "petrified.png", "petrified");
      if (overlay) {
        // Rise animation followed by periodic shake
        overlay.style.animation = `
          petrify-rise 0.8s ease-out forwards,
          petrify-cycle 10s linear infinite 0.8s
        `;

        document.getElementById("interface").appendChild(overlay);
      }

      // Store reference to remove later
      this.petrifiedInterval = setInterval(() => {
        if (!document.querySelector(".petrified-effect")) {
          this.clearEffects();
          clearInterval(this.petrifiedInterval);
          this.petrifiedInterval = null;
        }
      }, 1000);
    }
  }

  static createParalyzedEffect() {
    if (!this.paralyzedInterval) {
      this.clearEffects();

      // Create left overlay
      const overlayLeft = this.createOverlay("paralyzed-overlay paralyzed-overlay-left", "paralyzed.png", "paralyzed");
      if (overlayLeft) {
        document.getElementById("interface").appendChild(overlayLeft);
      }

      // Create right overlay
      const overlayRight = this.createOverlay("paralyzed-overlay paralyzed-overlay-right", "paralyzed.png", "paralyzed");
      if (overlayRight) {
        document.getElementById("interface").appendChild(overlayRight);
      }

      // Store reference to remove later
      this.paralyzedInterval = setInterval(() => {
        if (!document.querySelector(".paralyzed-effect")) {
          this.clearEffects();
          clearInterval(this.paralyzedInterval);
          this.paralyzedInterval = null;
        }
      }, 1000);
    }
  }

  static createRestrainedEffect() {
    if (!this.restrainedInterval) {
      this.clearEffects();

      // Create restrained overlay
      const overlay = this.createOverlay("restrained-overlay", "restrained.png", "restrained");
      if (overlay) {
        overlay.style.animation = "restrained-rise 0.8s ease-out forwards";
        document.getElementById("interface").appendChild(overlay);
      }

      // Store reference to remove later and ensure cleanup happens
      this.restrainedInterval = setInterval(() => {
        const hasEffect = document.querySelector(".restrained-effect");
        const hasOverlay = document.querySelector(".restrained-overlay");

        if (!hasEffect || !hasOverlay) {
          this.clearEffects();
          clearInterval(this.restrainedInterval);
          this.restrainedInterval = null;
        }
      }, 200); // Reduced interval for faster cleanup

      // Add immediate cleanup if effect is removed
      if (overlay) {
        overlay.addEventListener("animationend", () => {
          const hasEffect = document.querySelector(".restrained-effect");
          if (!hasEffect) {
            this.clearEffects();
          }
        });
      }
    }
  }

  static createIncapacitatedEffect() {
    if (!this.incapacitatedInterval) {
      this.clearEffects();

      // Create incapacitated overlay
      const overlay = this.createOverlay("incapacitated-overlay", "incapacitated.png", "incapacitated");
      if (overlay) {
        document.getElementById("interface").appendChild(overlay); // Changed from document.body
      }

      // Store reference to remove later
      this.incapacitatedInterval = setInterval(() => {
        if (!document.querySelector(".incapacitated-effect")) {
          this.clearEffects();
          clearInterval(this.incapacitatedInterval);
          this.incapacitatedInterval = null;
        }
      }, 1000);
    }
  }

  static createDeadEffect() {
    if (!this.deadInterval) {
      this.clearEffects();

      const overlay = this.createOverlay("dead-overlay", "death.png", "dead");
      if (overlay) {
        document.getElementById("interface").appendChild(overlay);
      }

      // Keep track of active orbs
      this.activeDeathOrbs = new Set();

      // Create floating orbs periodically
      this.deadInterval = setInterval(() => {
        // Check if effect is still active first
        if (!document.querySelector(".dead-effect")) {
          // Clean up all existing orbs
          this.activeDeathOrbs.forEach((orb) => {
            if (orb && orb.parentNode) {
              orb.remove();
            }
          });
          this.activeDeathOrbs.clear();

          this.clearEffects();
          clearInterval(this.deadInterval);
          this.deadInterval = null;
          return;
        }

        // Create 1-2 orbs at a time
        const orbCount = Math.floor(Math.random() * 2) + 1;

        for (let i = 0; i < orbCount; i++) {
          const orb = document.createElement("div");
          orb.className = "death-orb";

          // Random starting position anywhere on screen
          orb.style.left = `${Math.random() * 100}%`;
          orb.style.top = `${Math.random() * 100}%`;

          // Random size between 5 and 15 pixels
          const size = Math.random() * 10 + 5;
          orb.style.width = `${size}px`;
          orb.style.height = `${size}px`;

          // Random movement angles and distances
          const angle = Math.random() * 360;
          const distance = Math.random() * 100 + 50;
          orb.style.setProperty("--move-angle", `${angle}deg`);
          orb.style.setProperty("--move-distance", `${distance}px`);

          // Random duration between 3 and 6 seconds
          const duration = Math.random() * 3 + 3;
          orb.style.animation = `death-orb-float ${duration}s ease-in-out forwards`;

          document.getElementById("interface").appendChild(orb);
          this.activeDeathOrbs.add(orb);

          // Remove orb after animation completes
          setTimeout(() => {
            if (orb && orb.parentNode) {
              orb.remove();
            }
            this.activeDeathOrbs.delete(orb);
          }, duration * 1000);
        }
      }, 400); // Create new orbs every 400ms
    }
  }

  static createBlindedEffect() {
    if (!this.blindedInterval) {
      this.clearEffects();

      const overlay = this.createOverlay("blinded-overlay", "blinded.png", "blinded");
      if (overlay) {
        document.getElementById("interface").appendChild(overlay);
      }

      this.blindedInterval = setInterval(() => {
        if (!document.querySelector(".blinded-effect")) {
          this.clearEffects();
          clearInterval(this.blindedInterval);
          this.blindedInterval = null;
        }
      }, 1000);
    }
  }

  static createBurrowingEffect() {
    if (!this.burrowingInterval) {
      this.clearEffects();

      const overlay = this.createOverlay("burrowing-overlay", "burrowing.png", "burrowing");
      if (overlay) {
        document.getElementById("interface").appendChild(overlay);
      }

      this.burrowingInterval = setInterval(() => {
        if (!document.querySelector(".burrowing-effect")) {
          this.clearEffects();
          clearInterval(this.burrowingInterval);
          this.burrowingInterval = null;
        }
      }, 1000);
    }
  }

  static createDodgeEffect() {
    if (!this.dodgeInterval) {
      this.clearEffects();

      // Bottom overlay
      const overlay = this.createOverlay("dodge-overlay", "dodge.png", "dodging");
      if (overlay) {
        overlay.style.animation = "dodge-rise 0.8s ease-out forwards";
        document.getElementById("interface").appendChild(overlay);
      }

      // Top overlay (trapeze)
      const trapeze = this.createOverlay("trapeze-overlay", "trapeze.png", "dodging");
      if (trapeze) {
        document.getElementById("interface").appendChild(trapeze);
      }

      this.dodgeInterval = setInterval(() => {
        if (!document.querySelector(".dodge-effect")) {
          this.clearEffects();
          clearInterval(this.dodgeInterval);
          this.dodgeInterval = null;
        }
      }, 1000);
    }
  }

  static createEtherealEffect() {
    if (!this.etherealInterval) {
      this.clearEffects();

      const overlay = this.createOverlay("ethereal-overlay", "ethereal.png", "ethereal");
      if (overlay) {
        document.getElementById("interface").appendChild(overlay);
      }

      // Create ethereal swirls
      this.etherealInterval = setInterval(() => {
        const swirl = document.createElement("div");
        swirl.className = "ethereal-swirl";

        // Random starting position
        swirl.style.left = `${Math.random() * 100}%`;
        swirl.style.top = `${Math.random() * 100}%`;

        // Random movement direction
        const moveX = Math.random() * 200 - 100 + "px";
        const moveY = Math.random() * 200 - 100 + "px";
        swirl.style.setProperty("--move-x", moveX);
        swirl.style.setProperty("--move-y", moveY);

        document.getElementById("interface").appendChild(swirl);
        setTimeout(() => swirl.remove(), 5000); // Match animation duration
      }, 1000);

      this.etherealCleanupInterval = setInterval(() => {
        if (!document.querySelector(".ethereal-effect")) {
          this.clearEffects();
          clearInterval(this.etherealInterval);
          clearInterval(this.etherealCleanupInterval);
          this.etherealInterval = null;
          this.etherealCleanupInterval = null;
        }
      }, 1000);
    }
  }

  static createExhaustionEffect() {
    if (!this.exhaustionInterval) {
      this.clearEffects();

      // Create the bottom overlay
      const overlay = this.createOverlay("exhaustion-overlay", "exhausted.png", "exhausted");
      if (overlay) {
        document.getElementById("interface").appendChild(overlay);
      }

      // Get exhaustion level (1-6)
      const level = this.checkExhaustionStatus(game.user?.character);

      // Calculate blur values based on level
      const blurAmount = Math.min(level * 0.5, 3); // 1.5px to 8px blur
      const clearRadius = Math.max(90 - level * 12, 30); // 78% to 30% clear center
      const opacity = Math.min(0.1 + level * 0.1, 0.6); // 0.2 to 0.6 opacity
      const duration = Math.max(7 - level * 1.0, 1); // 6s to 1s pulse

      // Apply the blur effect
      const appElement = document.getElementById("interface");
      appElement.style.setProperty("--exhaustion-blur", `${blurAmount}px`);
      appElement.style.setProperty("--exhaustion-clear", `${clearRadius}%`);
      appElement.style.setProperty("--exhaustion-opacity", opacity);
      appElement.style.setProperty("--exhaustion-duration", `${duration}s`);

      this.exhaustionInterval = setInterval(() => {
        if (!document.querySelector(".exhaustion-effect")) {
          this.clearEffects();
          clearInterval(this.exhaustionInterval);
          this.exhaustionInterval = null;
        }
      }, 1000);
    }
  }

  static createFlyingEffect() {
    this.clearEffects();

    // Function to create a falling feather
    const createFeather = () => {
      const fallingFeather = document.createElement("div");
      fallingFeather.className = "falling-feather";
      const size = Math.random() * 30 + 20; // Random size between 40px and 60px
      fallingFeather.style.width = `${size}px`;
      fallingFeather.style.height = `${size}px`;
      fallingFeather.style.top = "-50px"; // Start above the screen
      fallingFeather.style.left = `${Math.random() * 100}%`; // Random horizontal position
      fallingFeather.style.animation = "feather-fall 5s linear";
      document.getElementById("interface").appendChild(fallingFeather);

      // Remove the feather after the animation ends
      fallingFeather.addEventListener("animationend", () => {
        fallingFeather.remove();
        createFeather(); // Create a new feather after the current one falls
      });
    };

    // Create the first feather
    createFeather();

    // Add the feathers.png floating at the bottom
    const floatingFeathers = this.createOverlay("flying-overlay", "feathers.png", "flying");
    if (floatingFeathers) {
      floatingFeathers.style.animation =
        "flying-rise 0.8s ease-out forwards, flying-float 4s ease-in-out infinite 0.8s";
      document.getElementById("interface").appendChild(floatingFeathers);
    }
  }

  static createHoveringEffect() {
    if (!this.hoveringInterval) {
      this.clearEffects();

      const overlay = this.createOverlay("hovering-overlay", "hovering.png", "hovering");
      if (overlay) {
        overlay.style.animation = `
          hovering-rise 0.8s ease-out forwards,
          hovering-float 4s ease-in-out infinite 0.8s
        `;

        document.getElementById("interface")?.appendChild(overlay);
      }

      this.hoveringInterval = setInterval(() => {
        if (!document.querySelector(".hovering-effect")) {
          this.clearEffects();
          clearInterval(this.hoveringInterval);
          this.hoveringInterval = null;
        }
      }, 1000);
    }
  }

  static createInvisibleEffect() {
    if (!this.invisibleInterval) {
      this.clearEffects();

      const overlay = this.createOverlay("invisible-overlay", "invisible.png", "invisible");
      if (overlay) {
        // Apply animations directly to ensure they're being set
        overlay.style.animation = "invisible-rise 0.8s ease-out forwards";
        setTimeout(() => {
          overlay.style.animation = "invisible-pulse 4s ease-in-out infinite";
        }, 800);

        document.getElementById("interface").appendChild(overlay);
      }

      this.invisibleInterval = setInterval(() => {
        if (!document.querySelector(".invisible-effect")) {
          this.clearEffects();
          clearInterval(this.invisibleInterval);
          this.invisibleInterval = null;
        }
      }, 1000);
    }
  }

  static createMarkedEffect() {
    if (!this.markedInterval) {
      this.clearEffects();

      const overlay = this.createOverlay("marked-overlay", "marked.png", "marked");
      if (overlay) {
        overlay.style.animation = "marked-rise 0.8s ease-out forwards";

        document.getElementById("interface").appendChild(overlay);
      }

      this.markedInterval = setInterval(() => {
        if (!document.querySelector(".marked-effect")) {
          this.clearEffects();
          clearInterval(this.markedInterval);
          this.markedInterval = null;
        }
      }, 1000);
    }
  }

  static createProneEffect() {
    if (!this.proneInterval) {
      this.clearEffects();

      const overlay = this.createOverlay("prone-overlay", "prone.png", "prone");
      if (overlay) {
        overlay.style.animation = "prone-rise 0.8s ease-out forwards";

        document.getElementById("interface").appendChild(overlay);
      }

      this.proneInterval = setInterval(() => {
        if (!document.querySelector(".prone-effect")) {
          this.clearEffects();
          clearInterval(this.proneInterval);
          this.proneInterval = null;
        }
      }, 1000);
    }
  }

  static createSilencedEffect() {
    if (!this.silencedInterval) {
      this.clearEffects();

      const overlay = this.createOverlay("silenced-overlay", "silenced.png", "silenced");
      if (overlay) {
        overlay.style.animation = "silenced-rise 0.8s ease-out forwards";
        document.getElementById("interface").appendChild(overlay);
      }

      this.silencedInterval = setInterval(() => {
        const hasEffect = document.querySelector(".silenced-effect");
        const hasOverlay = document.querySelector(".silenced-overlay");

        if (!hasEffect || !hasOverlay) {
          this.clearEffects();
          clearInterval(this.silencedInterval);
          this.silencedInterval = null;
        }
      }, 200);

      if (overlay) {
        overlay.addEventListener("animationend", () => {
          const hasEffect = document.querySelector(".silenced-effect");
          if (!hasEffect) {
            this.clearEffects();
          }
        });
      }
    }
  }

  static createSleepingEffect() {
    if (!this.sleepingInterval) {
      this.clearEffects();

      // Create overlay
      const overlay = this.createOverlay("sleeping-overlay", "sleep.png", "sleeping");
      if (overlay) {
        overlay.style.animation = "sleep-descend 0.8s ease-out forwards";
        document.getElementById("interface").appendChild(overlay);
      }

      // Create floating Z group
      const createZGroup = () => {
        const group = document.createElement("div");
        group.className = "sleeping-z-group";
        group.style.display = "flex"; // Add flex display
        group.style.alignItems = "baseline"; // Align Z's at their baseline
        group.style.gap = "4px"; // Add space between Z's

        // Random starting position
        group.style.left = `${Math.random() * 80 + 10}%`;
        group.style.bottom = "50px";

        // Random movement for the whole group
        const moveX = (Math.random() - 0.5) * 100;
        const moveY = Math.random() * 200 + 150;
        const rotation = (Math.random() - 0.5) * 45;

        group.style.setProperty("--move-x", `${moveX}px`);
        group.style.setProperty("--move-y", `${moveY}px`);
        group.style.setProperty("--rotation", `${rotation}deg`);

        // Base size for largest Z
        const baseSize = Math.random() * 10 + 30; // 30-40px

        // Create 3 Z's with diminishing sizes
        for (let i = 0; i < 3; i++) {
          const z = document.createElement("span");
          z.className = "sleeping-z";
          z.textContent = "Z";
          z.style.fontSize = `${baseSize * (1 - i * 0.2)}px`; // Reduce size by 20% each time
          z.style.transform = `translateY(${i * 35}px)`; // Slight vertical offset
          z.style.opacity = `${1 - i * 0.2}`; // Gradually reduce opacity
          group.appendChild(z);
        }

        // Add animation
        const duration = Math.random() * 1 + 4; // 4-5 seconds
        group.style.animation = `z-float ${duration}s cubic-bezier(0.4, 0, 0.2, 1) forwards`;

        document.getElementById("interface").appendChild(group);

        // Remove group after animation
        setTimeout(() => group.remove(), duration * 1000);
      };

      // Create Z groups at interval
      this.sleepingInterval = setInterval(createZGroup, 2000);

      // Create initial Z group
      createZGroup();

      // Add cleanup interval
      this.sleepingCleanupInterval = setInterval(() => {
        if (!document.querySelector(".sleeping-effect")) {
          this.clearEffects();
          clearInterval(this.sleepingInterval);
          clearInterval(this.sleepingCleanupInterval);
          this.sleepingInterval = null;
          this.sleepingCleanupInterval = null;

          // Remove any remaining Z groups
          document
            .querySelectorAll(".sleeping-z-group")
            .forEach((el) => el.remove());
          // document.querySelectorAll(".sleeping-z").forEach((el) => el.remove());
        }
      }, 200);
    }
  }

  static createStableEffect() {
    if (!this.stableInterval) {
      this.clearEffects();

      const overlay = this.createOverlay("stable-overlay", "stable.png", "stable");
      if (overlay) {
        overlay.style.animation = "stable-rise 0.8s ease-out forwards";
        document.getElementById("interface").appendChild(overlay);
      }

      this.stableInterval = setInterval(() => {
        const hasEffect = document.querySelector(".stable-effect");
        const hasOverlay = document.querySelector(".stable-overlay");

        if (!hasEffect || !hasOverlay) {
          this.clearEffects();
          clearInterval(this.stableInterval);
          this.stableInterval = null;
        }
      }, 200);

      if (overlay) {
        overlay.addEventListener("animationend", () => {
          const hasEffect = document.querySelector(".stable-effect");
          if (!hasEffect) {
            this.clearEffects();
          }
        });
      }
    }
  }

  static createStunnedEffect() {
    if (!this.stunnedInterval) {
      this.clearEffects();

      const overlay = this.createOverlay("stunned-overlay", "stunned.png", "stunned");
      if (overlay) {
        overlay.style.animation = "stunned-rise 0.8s ease-out forwards";
        document.getElementById("interface").appendChild(overlay);
      }

      this.stunnedInterval = setInterval(() => {
        const hasEffect = document.querySelector(".stunned-effect");
        const hasOverlay = document.querySelector(".stunned-overlay");

        if (!hasEffect || !hasOverlay) {
          this.clearEffects();
          clearInterval(this.stunnedInterval);
          this.stunnedInterval = null;
        }
      }, 200);

      if (overlay) {
        overlay.addEventListener("animationend", () => {
          const hasEffect = document.querySelector(".stunned-effect");
          if (!hasEffect) {
            this.clearEffects();
          }
        });
      }
    }
  }

  static createSurprisedEffect() {
    if (!this.surprisedInterval) {
      this.clearEffects();

      const overlay = this.createOverlay("surprised-overlay", "surprised.png", "surprised");
      if (overlay) {
        overlay.style.animation = "surprised-rise 0.8s ease-out forwards";
        document.getElementById("interface").appendChild(overlay);
      }

      this.surprisedInterval = setInterval(() => {
        const hasEffect = document.querySelector(".surprised-effect");
        const hasOverlay = document.querySelector(".surprised-overlay");

        if (!hasEffect || !hasOverlay) {
          this.clearEffects();
          clearInterval(this.surprisedInterval);
          this.surprisedInterval = null;
        }
      }, 200);

      if (overlay) {
        overlay.addEventListener("animationend", () => {
          const hasEffect = document.querySelector(".surprised-effect");
          if (!hasEffect) {
            this.clearEffects();
          }
        });
      }
    }
  }

  static createTransformedEffect() {
    if (!this.transformedInterval) {
      this.clearEffects();

      const overlay = this.createOverlay("transformed-overlay", "transformed.png", "transformed");
      if (overlay) {
        // Add explicit path and logging
        const imagePath = "modules/animatedanxiety/assets/transformed.png";
        overlay.style.backgroundImage = `url('${imagePath}')`;

        overlay.style.animation = "transformed-rise 0.8s ease-out forwards";
        document.getElementById("interface").appendChild(overlay);
      }

      this.transformedInterval = setInterval(() => {
        const hasEffect = document.querySelector(".transformed-effect");
        const hasOverlay = document.querySelector(".transformed-overlay");

        if (!hasEffect || !hasOverlay) {
          this.clearEffects();
          clearInterval(this.transformedInterval);
          this.transformedInterval = null;
        }
      }, 200);

      if (overlay) {
        overlay.addEventListener("animationend", () => {
          const hasEffect = document.querySelector(".transformed-effect");
          if (!hasEffect) {
            this.clearEffects();
          }
        });
      }
    }
  }

  static createCoverEffect(type) {
    const intervalName = `${type}CoverInterval`;
    if (!this[intervalName]) {
      this.clearEffects();

      const overlay = this.createOverlay("cover-overlay", `${type}Cover.png`, type);
      if (overlay) {
        overlay.style.animation = "cover-rise 0.8s ease-out forwards";

        // Adjust opacity based on cover type
        const opacity =
          type === "half" ? 0.4 : type === "three-quarters" ? 0.6 : 0.8;
        overlay.style.setProperty("--cover-opacity", opacity);

        document.getElementById("interface").appendChild(overlay);
      }

      this[intervalName] = setInterval(() => {
        const hasEffect = document.querySelector(`.${type}-cover-effect`);
        if (!hasEffect) {
          this.clearEffects();
          clearInterval(this[intervalName]);
          this[intervalName] = null;
        }
      }, 1000);
    }
  }

  static createBurningEffect() {
    if (!this.burningInterval) {
      this.clearEffects();

      // Create burning overlay
      const overlay = this.createOverlay("burning-overlay", "burning.png", "burning");
      if (overlay) {
        overlay.style.animation = "burning-rise 0.8s ease-out forwards";
        document.getElementById("interface").appendChild(overlay);
      }

      // Create flame particles
      this.burningInterval = setInterval(() => {
        const flame = document.createElement("div");
        flame.className = `flame-particle ${
          Math.random() > 0.5 ? "orange" : "red"
        }`;

        // Random size between 4 and 8 pixels
        const size = Math.random() * 1 + 2;
        flame.style.width = `${size}px`;
        flame.style.height = `${size}px`;

        // Random starting position along bottom
        flame.style.left = `${Math.random() * 100}%`;
        flame.style.bottom = "20px";

        // Set random movement patterns
        const duration = Math.random() * 1 + 2; // 1-2 seconds
        flame.style.setProperty("--duration", `${duration}s`);

        // Three sets of random movements for bezier-like path
        for (let i = 1; i <= 3; i++) {
          const moveX = (Math.random() - 0.5) * 60; // -30px to 30px
          const moveY = Math.random() * 50 + 50; // 50px to 100px upward
          flame.style.setProperty(`--move-x-${i}`, `${moveX}px`);
          flame.style.setProperty(`--move-y-${i}`, `${moveY}px`);
        }

        document.getElementById("interface").appendChild(flame);
        setTimeout(() => flame.remove(), duration * 1000);
      }, 30); // Create particles even more frequently

      // Cleanup interval
      this.cleanupInterval = setInterval(() => {
        if (!document.querySelector(".burning-effect")) {
          this.clearEffects();
          clearInterval(this.burningInterval);
          clearInterval(this.cleanupInterval);
          this.burningInterval = null;
          this.cleanupInterval = null;
        }
      }, 1000);
    }
  }

  static createDehydratedEffect() {
    if (!this.dehydratedInterval) {
      this.clearEffects();

      const overlay = this.createOverlay("dehydrated-overlay", "dehydrated.png", "dehydration");
      if (overlay) {
        overlay.style.animation = "dehydrated-rise 0.8s ease-out forwards";
        document.getElementById("interface").appendChild(overlay);
      }

      this.dehydratedInterval = setInterval(() => {
        const hasEffect = document.querySelector(".dehydrated-effect");
        const hasOverlay = document.querySelector(".dehydrated-overlay");

        if (!hasEffect || !hasOverlay) {
          this.clearEffects();
          clearInterval(this.dehydratedInterval);
          this.dehydratedInterval = null;
        }
      }, 1000);
    }
  }

  static createDehydrationEffect() {
    if (!this.dehydrationInterval) {
      this.clearEffects();

      const overlay = this.createOverlay("dehydration-overlay", "dehydrated.png", "dehydration");
      if (overlay) {
        overlay.style.animation = "dehydration-rise 0.8s ease-out forwards";

        document.getElementById("interface")?.appendChild(overlay);
      }
    }
  }

  static createMalnutritionEffect() {
    if (!this.malnutritionInterval) {
      this.clearEffects();

      const overlay = this.createOverlay("malnutrition-overlay", "malnutrition.png", "malnutrition");
      if (overlay) {
        // Set the background image
        const imagePath = "modules/animatedanxiety/assets/malnutrition.png";
        overlay.style.backgroundImage = `url('${imagePath}')`;

        // Add rise animation and yellow-orange aura effect
        overlay.style.animation = "malnutrition-rise 0.8s ease-out forwards";

        document.getElementById("interface").appendChild(overlay);
      }

      // Create cleanup interval
      this.malnutritionInterval = setInterval(() => {
        if (!document.querySelector(".malnutrition-effect")) {
          this.clearEffects();
          clearInterval(this.malnutritionInterval);
          this.malnutritionInterval = null;
        }
      }, 1000);

      // Cleanup on animation end
      if (overlay) {
        overlay.addEventListener("animationend", () => {
          if (!document.querySelector(".malnutrition-effect")) {
            this.clearEffects();
          }
        });
      }
    }
  }

  static createSuffocationEffect() {
    if (!this.suffocationInterval) {
      this.clearEffects();

      const overlay = this.createOverlay("suffocation-overlay", "suffocation.png", "suffocation");
      if (overlay) {
        overlay.style.animation =
          "suffocation-rise 0.8s ease-out forwards, suffocation-pulse 8s ease-in-out infinite 0.8s";

        document.getElementById("interface").appendChild(overlay);
      }

      // Create cleanup interval
      this.suffocationInterval = setInterval(() => {
        if (!document.querySelector(".suffocation-effect")) {
          this.clearEffects();
          clearInterval(this.suffocationInterval);
          this.suffocationInterval = null;
        }
      }, 1000);
    }
  }
}

Hooks.once("init", () => {
  CONFIG.debug.hooks = true;
  AnimatedAnxiety.init();
});
